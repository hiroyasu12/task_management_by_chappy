# Task Manager API (NestJS + Prisma)

Production-ready scaffold for a Task Management API built with NestJS, Prisma, PostgreSQL, Redis (optional), and Docker.

## Features
- NestJS (Module-based)
- Prisma ORM (Postgres)
- JWT Auth + Refresh token
- Docker & docker-compose (db + redis)
- Swagger (OpenAPI)
- Unit tests (Jest) example
- GitHub Actions CI for lint & test
- .env.example provided

## Quick start (development)
1. Copy env file:
```bash
cp .env.example .env
```
2. Build and start with Docker:
```bash
docker-compose up --build
```
3. API will be available at `http://localhost:3000`
4. Swagger UI: `http://localhost:3000/api`

## Production notes
- Use managed Postgres in production, and set DB URL in env.
- Use secure JWT secrets and HTTPS.
- Use CI/CD to run tests and deploy.

