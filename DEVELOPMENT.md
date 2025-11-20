# Development Guide

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.20.5
- PostgreSQL (via Docker)

## ⚙️ Environment Setup

Проект использует три окружения: **development**, **test**, и **production**.

Каждый сервис имеет шаблоны для всех окружений:

- `.env.development.example` - для локальной разработки
- `.env.test.example` - для тестирования
- `.env.production.example` - для продакшена

### Quick Start (Development)

```bash
# Backend services
cp backend/api-service/.env.development.example backend/api-service/.env.development
cp backend/realtime-service/.env.development.example backend/realtime-service/.env.development
cp backend/bot-service/.env.development.example backend/bot-service/.env.development

# Frontend apps
cp frontend/poll-app/.env.development.example frontend/poll-app/.env.development
cp frontend/admin-app/.env.development.example frontend/admin-app/.env.development
```

### Получение Telegram Bot Token

1. Откройте Telegram, найдите @BotFather
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Скопируйте полученный токен
5. Вставьте токен в `backend/bot-service/.env.development`:
   ```bash
   TELEGRAM_BOT_TOKEN=your_actual_token_here
   ```

### Настройка окружений

#### Development (по умолчанию)

- API Service: `http://localhost:3000`
- Realtime WebSocket: `ws://localhost:3001`
- Realtime HTTP: `http://localhost:3002`
- PostgreSQL: `postgresql://app:secret@localhost:5432/main_dev`
- Frontend Poll App: `http://localhost:5173`
- Frontend Admin App: `http://localhost:5174`

#### Test

Использует отдельные порты и базу данных для избежания конфликтов:

- API Service: порт 3001
- Realtime WebSocket: порт 3011
- Realtime HTTP: порт 3012
- PostgreSQL: `main_test` database

#### Production

Требует настройки реальных доменов и использование HTTPS/WSS для безопасности.

### Setup

#### Option 1: Docker Compose (Recommended)

```bash
# 1. Install all dependencies
npm install

# 2. Start all services (DB + API + Realtime) in Docker
npm run dev:stack

# This will:
# - Start PostgreSQL
# - Run migrations automatically
# - Run seed data automatically
# - Start API service on port 3000
# - Start Realtime service on ports 3001 (WS) and 3002 (HTTP)

# 3. Start frontend (in separate terminal)
npm run dev:frontend
```

#### Option 2: Local Development

```bash
# 1. Install all dependencies
npm install

# 2. Start PostgreSQL in Docker
npm run dev:db

# 3. Wait for DB to be healthy (~10 seconds)

# 4. Run migrations and seed data
npm run dev:migrate
npm run seed

# 5. Start all backend services locally
npm run dev

# 6. Start frontend (in separate terminal)
npm run dev:frontend
```

## 📋 Available Commands

### Development (Local)

```bash
# Start database
npm run dev:db

# Run migrations and seed data (first time)
npm run dev:migrate
npm run seed

# Start all backend services (api + realtime + bot)
npm run dev

# Start frontend apps (in separate terminals)
npm run dev:frontend    # Poll app on port 5173
npm run dev:admin       # Admin app on port 5174

# Database management
npm run db:reset        # Reset database (down + up + seed)

# Stop database
npm run dev:db:down
```

### Test Environment (Docker)

```bash
# Start all test services in Docker
npm run test

# Run migrations for test
npm run test:migrate

# View logs
npm run test:logs

# Stop test environment
npm run test:down
```

### Production (CI/CD)

```bash
# Install dependencies (runs automatically)
npm install

# Build all backend services
npm run build

# Build frontend apps
npm run build:frontend

# Start production services
npm start
```

### Code Quality (CI/CD)

```bash
# Check code quality
npm run lint
npm run format:check

# Fix code (development)
npm run lint:fix
npm run format
```

## 🏗️ Project Structure

```
live-poll-bot/
├── backend/
│   ├── api-service/          # REST API + gRPC Server
│   ├── realtime-service/     # WebSocket server + gRPC Server
│   └── bot-service/          # Telegram bot + gRPC Client
├── frontend/
│   ├── poll-app/             # User-facing app
│   └── admin-app/            # Admin interface
├── docker/
│   └── docker-compose*.yml   # Docker configurations
└── package.json              # Root commands
```

## 🔧 Service-Specific Commands

Для работы с отдельными сервисами перейдите в их директории:

```bash
# API Service
cd backend/api-service
npm run dev          # Development
npm run test         # Test
npm run build        # Build
npm start            # Production

# Database migrations (API service only)
npm run migrate          # Run migrations
npm run migrate:down     # Rollback
npm run migrate:create   # Create new migration

# Realtime Service
cd backend/realtime-service
npm run dev / test / build / start

# Bot Service
cd backend/bot-service
npm run dev / test / build / start

# Frontend Apps
cd frontend/poll-app  # or frontend/admin-app
npm run dev          # Development (port 5173/5174)
npm run test         # Test mode (port 5175/5176)
npm run build        # Production build
```

## 🌐 Service Ports

| Service     | REST/HTTP | gRPC  | WebSocket | URL                         | DB Access   |
| ----------- | --------- | ----- | --------- | --------------------------- | ----------- |
| API Service | 3000      | 50051 | -         | http://localhost:3000       | ✅ Direct   |
| Realtime    | 3002      | 50052 | 3001      | ws://3001, http://3002      | ❌ Via gRPC |
| Bot Service | -         | -     | -         | Telegram Bot                | ❌ Via gRPC |
| PostgreSQL  | -         | -     | -         | postgresql://localhost:5432 | -           |
| Frontend    | 5174      | -     | -         | http://localhost:5174       | ❌ Via REST |

**Architecture Notes:**

- ✅ **API Service** is the only service with direct database access (Database per Service pattern)
- ✅ **Realtime Service** fetches data from API Service via gRPC (no direct DB access)
- ✅ **Bot Service** communicates with API Service via gRPC for all operations
- ✅ **Frontend** uses REST API for CRUD operations and WebSocket for real-time updates

## 📝 Development Workflow

### Local Development (Recommended)

```bash
# Terminal 1: Start database
npm run dev:db

# Terminal 2: Setup database (first time only)
npm run dev:migrate
npm run seed

# Terminal 3: Start backend services (api + realtime + bot)
npm run dev

# Terminal 4: Start frontend
npm run dev:frontend

# Terminal 5: Start admin app (optional)
npm run dev:admin

# Note: If you need to reset database
npm run db:reset
```

### Test Environment (Docker)

```bash
# Start all test services in Docker
npm run test

# In another terminal: view logs
npm run test:logs

# Stop when done
npm run test:down
```

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000 -i :3001 -i :3002

# Kill process
kill -9 <PID>

# Or stop Docker containers
npm run dev:db:down
npm run test:down
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Restart database
npm run dev:db:down
npm run dev:db
```

### Module Not Found

```bash
# Reinstall all dependencies
npm install
```

## 🎯 Best Practices

1. **Always start with database**: `npm run dev:db`
2. **Run migrations**: `npm run dev:migrate` after pulling new code
3. **Use `npm run dev`**: Runs all backend services (api + realtime + bot) in parallel
4. **Bot Service**: Requires `TELEGRAM_BOT_TOKEN` in `.env.development`
5. **Database Access**: Only API Service connects to PostgreSQL directly
6. **Realtime Service**: Gets data from API Service via gRPC (no direct DB access)
7. **Check logs**: Services show colored output (blue=api, magenta=realtime, yellow=bot)
8. **Graceful shutdown**: Use Ctrl+C to stop services properly
9. **Test environment**: Use Docker (`npm run test`) for isolated testing

## 📚 Additional Resources

- [API Service README](./backend/api-service/README.md)
- [Realtime Service README](./backend/realtime-service/README.md)
- [Environment Setup](./backend/realtime-service/ENV_SETUP.md)
- [Architecture Overview](./README.md)

## 🆘 Getting Help

1. Check service logs: Look at the terminal where services are running
2. Check test logs: `npm run test:logs`
3. Verify ports are free: `lsof -i :3000 -i :3001 -i :3002 -i :5173`
4. Check database: `docker ps | grep postgres`
5. Review environment files: `.env.development` in each service
6. Bot Service: Ensure `TELEGRAM_BOT_TOKEN` is set in `backend/bot-service/.env.development`
