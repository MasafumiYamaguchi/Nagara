# Tsuuwa

作業通話に特化したコミュニケーションアプリです。  
「誰かと繋がって作業することで、長時間の集中を維持しやすくする」ことを目的にしています。

## コンセプト（要件定義より）

- 目的: 一人だと難しい長時間作業の集中とモチベーション維持を支援する
- ターゲット: 10〜30代の学生、社会人、クリエイターなど
- 方針: 多機能な通話アプリではなく、作業に必要な体験に絞ってシンプルにする

## 機能要件の優先度

要件定義では、機能を以下の優先度で整理しています。

- `P0`: 必須
- `P1`: ここまで実装
- `P2`: 可能であれば実装

### 機能一覧

1. ルーム機能 (`P1`)
- 誰でも作業部屋（ランダムマッチ）
- フレンド限定部屋
- タグ付き作業部屋（共通目的でマッチング）

2. シンプルな通話機能 (`P0`)
- 基本は音声通話
- 入室時の自動ミュートなど、作業を邪魔しない設計

3. ステータス表示機能 (`P1`)
- 例: 「集中モード」「休憩中」「質問OK」

4. ポモドーロ機能 (`P2`)
- 25分集中 + 5分休憩
- 参加者でタイマー共有

5. BGM / 環境音再生機能 (`P2`)
- 集中しやすい音環境の提供

## アプリ画面

> `assets` 配下のスクリーンショットをREADMEに掲載しています。

![Tsuuwa Screenshot](assets/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-15%20at%2002.06.00.png)

## リポジトリ構成

- `frontend/`: Expo + React Native のモバイルアプリ本体
- `backend/`: Express + Prisma + PostgreSQL のAPIサーバー
- `nagara-web/`: Vite + React のWebフロント（関連ページ）
- `assets/`: README掲載用の画像など

## 技術スタック

- Mobile: React Native, Expo, TypeScript, Firebase Auth, Agora
- Backend: Node.js, Express, Prisma, PostgreSQL, Firebase Admin
- Web: React, Vite

## セットアップ

### 1. 依存関係のインストール

```bash
# ルート（lint/test 用）
npm install

# モバイル
cd frontend && npm install

# バックエンド
cd ./backend && npm install

# Web
cd ./nagara-web && npm install
```

### 2. 開発サーバー起動

```bash
# Mobile (Expo) (iosでの起動)
cd frontend
npm run ios

# Backend
cd ./backend
npm run dev

# Web
cd ./nagara-web
npm run dev
```

## 環境変数（例）

### backend/.env

- `PORT`
- `DATABASE_URL`
- `DATABASE_SSL`
- `FIREBASE_SERVICE_ACCOUNT_BASE64`
- `AGORA_APP_ID`
- `AGORA_APP_CERTIFICATE`

### frontend/.env

- `API_BASE_URL`
- `EXPO_PUBLIC_AGORA_APP_ID`


