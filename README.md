# Live Poll Bot (MVP)

Real-time polling application with microservices architecture.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL
npm run dev:db

# 3. Wait ~10 seconds for DB to be ready

# 4. Setup database
npm run dev:migrate
npm run seed

# 5. Start all backend services
npm run dev

# 6. Start frontend (in new terminal)
npm run dev:frontend
```

That's it! Your application is running:

- 🔵 API Service: http://localhost:3000
- 🟣 Realtime Service: ws://localhost:3001, http://localhost:3002
- 🤖 Bot Service: Telegram bot (requires TELEGRAM_BOT_TOKEN)
- 📊 PostgreSQL: postgresql://localhost:5432
- 🎨 Frontend: http://localhost:5173

## 📖 Documentation

- [Development Guide](./DEVELOPMENT.md) - Complete development workflow
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- [Health Checks](./HEALTH_CHECKS.md) - Service health monitoring
- [API Service](./backend/api-service/README.md) - REST API documentation
- [Realtime Service](./backend/realtime-service/README.md) - WebSocket documentation
- [Environment Setup](./backend/realtime-service/ENV_SETUP.md) - Configuration guide

## 🏗️ Architecture

```
┌──────────────┐
│  Telegram    │
│  Bot API     │
└──────┬───────┘
       │
┌──────▼───────────┐
│  BOT SERVICE     │
│  (backend)       │
└──────┬───────────┘
       │ gRPC (50051)
       │
       ▼
┌──────────────────────────┐      ┌──────────────────┐
│     API SERVICE          │      │  REALTIME        │
│  (data owner)            │─────►│  SERVICE         │
│                          │ gRPC │                  │
│  REST: 3000              │      │  WS: 3001        │
│  gRPC: 50051             │      │  HTTP: 3002      │
└──────┬───────────────────┘      │  gRPC: 50052     │
       │                          └──────┬───────────┘
       │                                 │
       ▼                                 │ WebSocket
┌──────────────┐                        │
│ PostgreSQL   │                        │
│   Database   │                        │
│              │                        │
│ • users      │                        │
│ • polls      │                        │
│ • poll_option│                        │
│ • votes      │                        │
└──────────────┘                        │
       ▲                                 │
       │ REST (HTTP)                    │
       │                                 │
┌──────┴─────────────────────────┐     │
│          FRONTEND               │◄────┘
│    (microfrontend apps)         │
│                                 │
│  ┌──────────┐  ┌──────────┐   │
│  │POLL-APP  │  │ADMIN-APP │   │
│  └──────────┘  └──────────┘   │
└─────────────────────────────────┘
```

**Key Architecture Principles:**

- ✅ **Database per Service**: Only API Service has direct database access
- ✅ **Service Communication**: Backend services communicate via gRPC
- ✅ **Frontend Communication**: Frontend apps use REST API and WebSocket
- ✅ **Real-time Updates**: Realtime Service gets data from API Service via gRPC

## 🎯 Key Features

- ✅ Real-time poll updates via WebSocket
- ✅ REST API for poll management
- ✅ Telegram bot for creating polls
- ✅ gRPC for inter-service communication
- ✅ Microservices architecture
- ✅ FSD (Feature-Sliced Design)
- ✅ TypeScript throughout
- ✅ Docker support

## 📋 Available Commands

### Development

```bash
npm run dev              # Start all backend services (api + realtime + bot)
npm run dev:frontend     # Start poll app (port 5173)
npm run dev:admin        # Start admin app (port 5174)
npm run dev:db           # Start PostgreSQL
npm run dev:db:down      # Stop PostgreSQL
```

### Database

```bash
npm run dev:migrate      # Run migrations
npm run seed             # Seed test data
npm run db:reset         # Reset database (migrations + seed)
```

### Test

```bash
npm run test             # Start test environment (Docker)
npm run test:down        # Stop test environment
npm run test:logs        # View logs
```

### Production

```bash
# Docker deployment (recommended)
./scripts/deploy.sh      # Deploy all services with Docker Compose

# Manual build
npm run build            # Build backend services
npm run build:frontend   # Build frontend apps
npm start                # Start production
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete production deployment guide.

### Code Quality

```bash
npm run lint             # Lint code
npm run format           # Format code
```

See [DEVELOPMENT.md](./DEVELOPMENT.md) for complete documentation.

## 🛠️ Tech Stack

**Backend:**

- Node.js + TypeScript
- Express.js (REST API)
- WebSocket (ws)
- gRPC (inter-service communication)
- Telegram Bot API (Telegraf)
- PostgreSQL
- Docker

**Frontend:**

- Vue 3
- TypeScript
- Tailwind CSS

## 📁 Project Structure

```
live-poll-bot/
├── backend/
│   ├── api-service/         # REST API + gRPC Server
│   ├── realtime-service/   # WebSocket server + gRPC Server
│   └── bot-service/        # Telegram bot + gRPC Client
├── frontend/
│   ├── poll-app/           # User app
│   └── admin-app/          # Admin panel
├── docker/                 # Docker configs
└── package.json            # Root commands
```

## 🤝 Contributing

See [DEVELOPMENT.md](./DEVELOPMENT.md) for development workflow.

## 📄 License

ISC
