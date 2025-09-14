const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

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
    // 修正: uid の取り出し方（未指定なら乱数）
    const uid = Number(req.query.uid) || Math.floor(Math.random() * 100000);
    const role = RtcRole.PUBLISHER;
    const expireTime = 3600;

    const appID = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appID || !appCertificate) {
      return res.status(500).json({ error: 'Agora credentials are not set' });
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expireTime;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      roomId,
      uid,
      role,
      privilegeExpiredTs
    );

    res.json({ token, uid});
  } catch (e) {
    res.status(500).json({ error: e.message});
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});