✨ Task Manager API (NestJS + Prisma + PostgreSQL + Docker)

A modern, production-ready Task Management API built with NestJS, Prisma ORM, PostgreSQL, Redis, and Docker.
JWT 認証、Task CRUD、User 管理、Swagger ドキュメントまで揃ったフルスタックなバックエンドです。

🚀 Features

⚡ NestJS (Modular Architecture)

🗄️ Prisma ORM (PostgreSQL)

🔐 JWT Authentication (Access Token)

🧪 Task CRUD / User API 完備

🐳 Docker / docker-compose

📘 Swagger (OpenAPI)

🔄 Prisma Migrations

🔧 Redis（オプション）

🛠️ CI-ready structure

📁 Project Structure
src/
 ├── main.ts
 ├── app.module.ts
 ├── modules/
 │    ├── auth/
 │    │     ├── auth.controller.ts
 │    │     ├── auth.service.ts
 │    │     ├── jwt.strategy.ts
 │    │     └── dto/
 │    ├── tasks/
 │    │     ├── tasks.controller.ts
 │    │     ├── tasks.service.ts
 │    │     └── dto/
 │    ├── users/
 │    │     ├── users.controller.ts
 │    │     └── users.service.ts
 │    └── prisma/
 │          └── prisma.service.ts
prisma/
 ├── schema.prisma
 └── migrations/
Dockerfile
docker-compose.yml
.env.example

🛠️ Getting Started

第三者が git clone → docker compose up → migrate の 3 ステップで動かせるように設計されています。

1️⃣ Clone the repository
git clone https://github.com/hiroyasu12/task_management_by_chappy.git
cd task_management_by_chappy

2️⃣ Create environment file
cp .env.example .env


.env の中身はそのままで動作しますが、必要に応じて変更してください。

3️⃣ Start with Docker
docker compose up --build


初回はデータベースが空のため、次のマイグレーション手順が必要です。

4️⃣ Apply Prisma migrations (first-time only)
docker compose exec app npx prisma migrate deploy


これで DB に User / Task テーブルが作成されます。

この手順は初回のみ必要
2 回目以降は docker compose up のみで OK

📘 API Documentation (Swagger)

起動後アクセス：

👉 http://localhost:3000/api

Swagger 上の “Authorize” ボタンから次の形式で JWT をセットできます：

Bearer <access_token>

✨ Usage Guide
1. Signup

POST /auth/signup

{
  "email": "john@example.com",
  "password": "pass1234",
  "name": "John"
}

2. Login（JWT取得）

POST /auth/login

{
  "email": "john@example.com",
  "password": "pass1234"
}


レスポンス例：

{
  "accessToken": "xxxxx.yyyyy.zzzzz",
  "refreshToken": "TODO-refresh-token"
}


Swagger の Authorize に貼り付けてください：

Bearer xxxxx.yyyyy.zzzzz

3. Create Task（JWT 必須）

POST /tasks

{
  "title": "My first task",
  "description": "Simple task"
}

4. Other Task Operations
Method	Endpoint	Description
GET	/tasks	Get my tasks
GET	/tasks/:id	Get a task detail
PUT	/tasks/:id	Update task
DELETE	/tasks/:id	Delete task
🧪 Test API via curl (optional)
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"From curl"}'

🗄️ Database Access (psql)
docker compose exec db psql -U postgres -d taskdb

🛑 Stopping & Resetting

Stop:

docker compose down


DB も消したい場合：

docker compose down -v

🔒 Production Notes

本番では必ず強力な JWT_ACCESS_SECRET を利用

Docker イメージはマルチステージビルド済み（軽量）

本番 DB（Cloud SQL / RDS など）を利用する場合は .env の DATABASE_URL を置き換える

📄 License

MIT

## 🏗️ Architecture

本アプリケーションは、NestJS を中心に Prisma ORM を介した PostgreSQL への永続化、JWT による認証、Redis（必要に応じて）を使用したキャッシュ構成になっています。  
アーキテクチャ全体像は以下の通りです：
```mermaid
flowchart LR
    subgraph Client
        UI[Browser / Swagger UI]
    end

    subgraph Backend[NestJS Application]
        Controller[Controllers\n(Auth / Users / Tasks)]
        Service[Services\n(AuthService / TasksService / UsersService)]
        Prisma[Prisma Client]
        Jwt[JWT Strategy\nPassport-JWT]
    end

    subgraph Database
        PG[(PostgreSQL)]
    end

    subgraph Cache
        Redis[(Redis)]
    end

    UI -->|HTTP Requests| Controller
    Controller --> Service
    Service --> Prisma
    Controller --> Jwt

    Prisma -->|SQL Queries| PG
    Service -->|Optional Caching| Redis

    subgraph Docker["docker-compose"]
        Backend
        PG
        Redis
    end
```
