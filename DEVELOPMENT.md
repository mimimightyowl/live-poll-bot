# Development Guide

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.20.5
- PostgreSQL (via Docker)

### Setup

```bash
# 1. Install all dependencies
npm install

# 2. Start PostgreSQL (development)
npm run docker:db

# 3. Wait for DB to be healthy (~10 seconds)

# 4. Run migrations
npm run migrate

# 5. Seed database (optional, adds test data)
npm run seed

# 6. Start all backend services
npm run dev
```

## 📋 Available Commands

### Development

#### Start Services

```bash
# Start all backend services (api + realtime)
npm run dev

# Start only API service
npm run dev:api

# Start only Realtime service
npm run dev:realtime

# Start only Bot service
npm run dev:bot

# Start backend services (alias for npm run dev)
npm run dev:backend

# Start frontend
npm run dev:frontend

# Start EVERYTHING (api + realtime + frontend)
npm run dev:full
```

#### Build

```bash
# Build all backend services
npm run build

# Build only API service
npm run build:api

# Build only Realtime service
npm run build:realtime

# Build only Bot service
npm run build:bot
```

### Database Management

```bash
# Run migrations
npm run migrate

# Seed database with test data
npm run seed

# Reset database (down -> up -> seed)
npm run db:reset
```

### Docker

```bash
# Start only PostgreSQL
npm run docker:db

# Stop PostgreSQL
npm run docker:db:down

# Start all services in Docker (not recommended for dev)
npm run docker:up

# Stop all Docker services
npm run docker:down

# View Docker logs
npm run docker:logs
```

### Code Quality

```bash
# Lint all code
npm run lint

# Lint and fix
npm run lint:fix

# Format all code
npm run format

# Check formatting
npm run format:check
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

### API Service

```bash
cd backend/api-service

# Development
npm run dev

# Build
npm run build

# Production
npm start

# Database
npm run migrate
npm run migrate:down
npm run migrate:create
npm run seed:dev
npm run db:reset
```

### Realtime Service

```bash
cd backend/realtime-service

# Development
npm run dev

# Build
npm run build

# Production
npm start
```

### Bot Service

```bash
cd backend/bot-service

# Development
npm run dev

# Build
npm run build

# Production
npm start
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

### Option 1: Local Development (Recommended)

```bash
# Terminal 1: Start database
npm run docker:db

# Terminal 2: Start backend services (api + realtime)
npm run dev

# Terminal 3: Start bot service (optional)
npm run dev:bot

# Terminal 4: Start frontend
npm run dev:frontend
```

### Option 2: Everything in One Terminal

```bash
# Start database
npm run docker:db

# Wait for DB to be ready, then start everything
npm run dev:full
```

### Option 3: Full Docker Stack

```bash
# Start everything in Docker
npm run docker:up

# View logs
npm run docker:logs
```

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # or 3001, 3002

# Kill process
kill -9 <PID>

# Or stop Docker containers
npm run docker:down
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Restart database
npm run docker:db:down
npm run docker:db

# Reset database
npm run db:reset
```

### Module Not Found

```bash
# Reinstall all dependencies
npm install
```

## 🎯 Best Practices

1. **Always start with database**: `npm run docker:db`
2. **Run migrations**: `npm run migrate` after pulling new code
3. **Use `npm run dev`**: Runs both API and Realtime in parallel
4. **Bot Service**: Requires `TELEGRAM_BOT_TOKEN` environment variable
5. **Database Access**: Only API Service connects to PostgreSQL directly
6. **Realtime Service**: Gets data from API Service via gRPC (no direct DB access)
7. **Check logs**: Services show colored output (blue=api, magenta=realtime)
8. **Graceful shutdown**: Use Ctrl+C to stop services properly

## 📚 Additional Resources

- [API Service README](./backend/api-service/README.md)
- [Realtime Service README](./backend/realtime-service/README.md)
- [Environment Setup](./backend/realtime-service/ENV_SETUP.md)
- [Architecture Overview](./README.md)

## 🆘 Getting Help

1. Check service logs: `npm run docker:logs`
2. Verify ports are free: `lsof -i :3000 -i :3001 -i :3002 -i :50051 -i :50052`
3. Check database: `docker exec app-db psql -U app -d main_dev -c "SELECT 1;"`
4. Review environment files: `.env.development` in each service
5. Bot Service: Ensure `TELEGRAM_BOT_TOKEN` is set in `.env.development`
6. Realtime Service: Ensure `API_SERVICE_GRPC_URL` points to API Service (default: localhost:50051)
