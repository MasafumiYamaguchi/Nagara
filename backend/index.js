const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const { buildRtcToken } = require('./rtc/agoraToken');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

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

app.post('/rooms', authenticate, async (req, res) => {
  try {
    const creatorUid = req.user.uid; // 認証されたユーザーのUIDを取得
    const { name, description, nop, password } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Room name is required' });
    }
    const newRoom = await prisma.room.create({
      data: { name, description: description || '', nop, password: password || '', creatorUid },
    });
    res.status(201).json(newRoom);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 部屋の削除エンドポイント
app.delete('/rooms/:roomId', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.roomId);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid room ID' });
    }
    const result = await prisma.room.deleteMany({ where: { id } });
    if (result.count === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ deleted: result.count }); 
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 追加: 部屋一覧を返すエンドポイント
app.get('/rooms', authenticate, async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { id: 'desc' },
    });
    res.json(rooms);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 追加: 部屋詳細を返すエンドポイント
app.get('/rooms/:roomId', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.roomId);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid room ID' });
    }
    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/rooms/:roomId/token', authenticate, async (req, res) => {
  try {
    const { roomId } = req.params;
    // client から numeric uid か userAccount を受け取れるようにする
    const uidParam = req.query.uid;
    const userAccount = req.query.userAccount; // 例: Firebase uid を入れる

    const roleparam = req.query.role === 'audience' ? 'audience' : 'publisher';
    const expireSeconds = 3600;

    // buildRtcToken は以下の rtc/agoraToken.js を参照
    const { token, expireAt } = buildRtcToken({
      channelName: roomId,
      uid: uidParam ? Number(uidParam) : undefined,
      userAccount: userAccount ? String(userAccount) : undefined,
      role: roleparam,
      expireSeconds,
    });

    // レスポンスに、client が使う ID（uid か userAccount）を返す
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});