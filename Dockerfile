### --- Builder Stage ---
FROM node:18-slim AS builder
WORKDIR /app

# Python / build-essential は bcrypt, Prisma build に必要
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# package.json / lock をコピー（キャッシュの肝）
COPY package.json package-lock.json ./

# 依存インストール（devDependencies も含む）
RUN npm ci

# アプリ全体をコピー
COPY . .

# Prisma Client を生成（Debian 環境で生成することが超重要）
RUN npx prisma generate

# NestJS のビルド（dist 生成）
RUN npm run build


### --- Runner Stage ---
FROM node:18-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# 必要な OS パッケージ（Prisma Engine 用 openssl）
# 🔥 ここに netcat-openbsd を追加（nc が必要）
RUN apt-get update && apt-get install -y \
    openssl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# package.json と lockfile をコピー
COPY package.json package-lock.json ./

# production 依存だけインストール
RUN npm ci --omit=dev

# Prisma schema をコピー（generateに必要）
COPY --from=builder /app/prisma ./prisma

# Runner 環境でも Prisma Client を生成（本番環境では必要）
RUN npx prisma generate

# dist のコピー
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
