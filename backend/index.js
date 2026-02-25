const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config(); // ← ここは削除
const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const { buildRtcToken } = require('./rtc/agoraToken');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { randomUUID } = require('crypto');
import fs from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const accessLog = fs.createWriteStream(path.join(logDir, "access.log"), { flags: "a" });

app.use((req, res, next) => {
  accessLog.write(
    `${new Date().toISOString()} ${req.method} ${req.url}\n`
  );
  next();
});

// service account を環境変数(base64)から読む
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
  ? JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'))
  : null;

if (!serviceAccount) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 is not set');
}

const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
});

dotenv.config();

const app = express();
app.set('trust proxy', true);
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
const prisma = new PrismaClient();

(async () => {
  try {
    const { rows } = await pool.query('SELECT NOW() AS now');
    console.log('PostgreSQL connected. Server time:', rows[0].now);
  } catch (err) {
    console.error('PostgreSQL connection failed:', err.message);
  }
})();

// 認証用ミドルウェア
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const idToken = authHeader.split(' ')[1];
  try {
    const decodedToken = await getAuth(firebaseApp).verifyIdToken(idToken);
    req.user = decodedToken; // 認証情報をリクエストオブジェクトに追加
    return next();
  } catch (e) {
    console.error('Authentication failed:', e.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

app.get('/', (req, res) => {
  res.json({ message: 'Tsuuwa Backend API is running!' });
});

app.get('/db-health', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT 1 AS ok');
    res.json({ ok: rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const toIntOrNull = (v) => {
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
};

const getClientNetworkInfo = (req) => {
  const xff = req.headers['x-forwarded-for'];
  const xfp = req.headers['x-forwarded-port'];
  const forwardedFor = Array.isArray(xff) ? xff[0] : (xff || '');
  const firstForwardedIp = forwardedFor ? String(forwardedFor).split(',')[0].trim() : null;
  const forwardedPortRaw = Array.isArray(xfp) ? xfp[0] : (xfp || '');
  const firstForwardedPort = forwardedPortRaw ? String(forwardedPortRaw).split(',')[0].trim() : null;

  return {
    ip: req.ip || req.socket?.remoteAddress || null,
    forwardedFor: firstForwardedIp,
    sourcePort: toIntOrNull(req.socket?.remotePort),
    forwardedPort: toIntOrNull(firstForwardedPort),
    userAgent: req.headers['user-agent'] || null,
  };
};

const writeAccessLog = async (req, { uid, event, roomId = null, details = null }) => {
  const net = getClientNetworkInfo(req);
  await prisma.accessLog.create({
    data: {
      uid: uid || null,
      event,
      roomId,
      method: req.method,
      path: req.originalUrl,
      ip: net.ip,
      forwardedFor: net.forwardedFor,
      sourcePort: net.sourcePort,
      forwardedPort: net.forwardedPort,
      userAgent: net.userAgent,
      details,
    },
  });
};

app.post('/rooms', authenticate, async (req, res) => {
  try {
    const creatorUid = req.user.uid;
    const { name, description, nop, password } = req.body;
    if (!name) return res.status(400).json({ error: 'Room name is required' });

    const newRoom = await prisma.room.create({
      data: { name, description: description || '', nop, password: password || '', creatorUid },
    });

    await writeAccessLog(req, {
      uid: creatorUid,
      event: 'ROOM_CREATED',
      roomId: newRoom.id,
      details: { nop: newRoom.nop },
    });

    res.status(201).json(newRoom);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/rooms/:roomId', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.roomId);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid room ID' });

    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    await prisma.$transaction(async (tx) => {
      // 1) 先に削除ログ（roomIdありで安全）
      const net = getClientNetworkInfo(req);
      await tx.accessLog.create({
        data: {
          uid: req.user.uid,
          event: 'ROOM_DELETED',
          roomId: id,
          method: req.method,
          path: req.originalUrl,
          ip: net.ip,
          forwardedFor: net.forwardedFor,
          sourcePort: net.sourcePort,
          forwardedPort: net.forwardedPort,
          userAgent: net.userAgent,
          details: { deletedRoomId: id },
        },
      });

      // 2) ぶら下がりデータ整理
      await tx.accessLog.updateMany({
        where: { roomId: id, event: { not: 'ROOM_DELETED' } },
        data: { roomId: null },
      });
      await tx.roomPresence.deleteMany({ where: { roomId: id } });

      // 3) room削除
      await tx.room.delete({ where: { id } });
    });

    res.json({ deleted: 1 });
  } catch (e) {
    console.error('DELETE /rooms/:roomId error:', e);
    res.status(500).json({ error: e.message });
  }
});

// トークン発行ログ
app.get('/rooms/:roomId/token', authenticate, async (req, res) => {
  try {
    const { roomId } = req.params;
    const uidParam = req.query.uid;
    const userAccount = req.query.userAccount;
    const roleparam = req.query.role === 'audience' ? 'audience' : 'publisher';
    const expireSeconds = 3600;

    const { token, expireAt } = buildRtcToken({
      channelName: roomId,
      uid: uidParam ? Number(uidParam) : undefined,
      userAccount: userAccount ? String(userAccount) : undefined,
      role: roleparam,
      expireSeconds,
    });

    await writeAccessLog(req, {
      uid: req.user.uid,
      event: 'RTC_TOKEN_ISSUED',
      roomId: Number(roomId),
      details: { role: roleparam, expireAt, expireSeconds, userAccount: userAccount || null, uidParam: uidParam || null },
    });

    res.json({
      token,
      uid: userAccount ? userAccount : (uidParam ? Number(uidParam) : undefined),
      role: roleparam,
      expireAt,
      expireSeconds,
    });
  } catch (e) {
    res.status(500).json({ error: e.message});
  }
});

// 入室開始
app.post('/rooms/:roomId/presence/start', authenticate, async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);
    if (!Number.isInteger(roomId)) return res.status(400).json({ error: 'Invalid room ID' });

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const net = getClientNetworkInfo(req);
    const sessionId = randomUUID();

    const row = await prisma.roomPresence.create({
      data: {
        sessionId,
        uid: req.user.uid,
        roomId,
        joinIp: net.forwardedFor || net.ip,
        joinSourcePort: net.forwardedPort || net.sourcePort,
        userAgent: net.userAgent,
      },
    });

    await writeAccessLog(req, {
      uid: req.user.uid,
      event: 'ROOM_JOINED',
      roomId,
      details: { sessionId: row.sessionId },
    });

    res.status(201).json({ sessionId: row.sessionId, joinedAt: row.joinedAt });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 退出
app.post('/rooms/:roomId/presence/end', authenticate, async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);
    const { sessionId } = req.body;
    if (!Number.isInteger(roomId)) return res.status(400).json({ error: 'Invalid room ID' });
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

    const net = getClientNetworkInfo(req);
    const result = await prisma.roomPresence.updateMany({
      where: { sessionId, roomId, uid: req.user.uid, leftAt: null },
      data: {
        leftAt: new Date(),
        leaveIp: net.forwardedFor || net.ip,
        leaveSourcePort: net.forwardedPort || net.sourcePort,
      },
    });

    if (result.count === 0) return res.status(404).json({ error: 'Active session not found' });

    await writeAccessLog(req, {
      uid: req.user.uid,
      event: 'ROOM_LEFT',
      roomId,
      details: { sessionId },
    });

    res.json({ ended: true, sessionId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/rooms', authenticate, async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        nop: true,
      },
    });

    await writeAccessLog(req, {
      uid: req.user.uid,
      event: 'ROOM_LIST_VIEWED',
      details: { count: rooms.length },
    });

    res.json(rooms);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/rooms/:roomId', authenticate, async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);
    if (!Number.isInteger(roomId)) return res.status(400).json({ error: 'Invalid room ID' });

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        name: true,
        description: true,
        nop: true,
        password: true,
      },
    });

    if (!room) return res.status(404).json({ error: 'Room not found' });

    await writeAccessLog(req, {
      uid: req.user.uid,
      event: 'ROOM_VIEWED',
      roomId,
    });

    res.json(room);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});