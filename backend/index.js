const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const { buildRtcToken } = require('./rtc/agoraToken');

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

app.post('/rooms', async (req, res) => {
  try {
    const { name, description, nop } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Room name is required' });
    }
    const newRoom = await prisma.room.create({
      data: { name, description: description || '', nop },
    });
    res.status(201).json(newRoom);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 部屋の削除エンドポイント
app.delete('/rooms/:roomId', async (req, res) => {
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
app.get('/rooms', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { id: 'desc' },
    });
    res.json(rooms);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/rooms/:roomId/token', async (req, res) => {
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