# Live Poll Bot (MVP)

Real-time polling application with microservices architecture.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL (dev mode)
npm run docker:db

# 3. Wait ~10 seconds for DB to be ready

# 4. Run migrations
npm run migrate

# 5. Start all backend services
npm run dev
```

That's it! Your backend is running:

- 🔵 API Service: http://localhost:3000
- 🟣 Realtime Service: ws://localhost:3001
- 📊 PostgreSQL: postgresql://localhost:5432

## 📖 Documentation

- [Development Guide](./DEVELOPMENT.md) - Complete development workflow
- [API Service](./backend/api-service/README.md) - REST API documentation
- [Realtime Service](./backend/realtime-service/README.md) - WebSocket documentation
- [Environment Setup](./backend/realtime-service/ENV_SETUP.md) - Configuration guide

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│   (poll-app)    │
└────────┬────────┘
         │
    ┌────▼─────────────────┐      ┌─────────────────┐
    │   API Service        │─────►│ Realtime Service│
    │   Port 3000          │ HTTP │ WS:3001 HTTP:3002│
    └────────┬─────────────┘      └────────┬─────────┘
             │                              │
             ▼                              ▼
       ┌─────────────────────────────────────┐
       │      PostgreSQL Database             │
       │           Port 5432                  │
       └─────────────────────────────────────┘
```

## 🎯 Key Features

- ✅ Real-time poll updates via WebSocket
- ✅ REST API for poll management
- ✅ Microservices architecture
- ✅ FSD (Feature-Sliced Design)
- ✅ TypeScript throughout
- ✅ Docker support

## 📋 Available Commands

### Development

```bash
npm run dev              # Start backend (api + realtime)
npm run dev:full         # Start everything (+ frontend)
npm run dev:api          # Start only API
npm run dev:realtime     # Start only Realtime
npm run dev:frontend     # Start only Frontend
```

### Database

```bash
npm run migrate          # Run migrations
npm run seed             # Seed test data
npm run db:reset         # Reset database
```

### Docker

```bash
npm run docker:db        # Start only PostgreSQL
npm run docker:up        # Start all services
npm run docker:down      # Stop all services
```

### Code Quality

```bash
npm run lint             # Lint code
npm run format           # Format code
```

See [DEVELOPMENT.md](./DEVELOPMENT.md) for more commands.

## 🛠️ Tech Stack

**Backend:**

- Node.js + TypeScript
- Express.js (REST API)
- WebSocket (ws)
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
│   ├── api-service/         # REST API
│   ├── realtime-service/    # WebSocket server
│   └── bot-service/         # Telegram bot (future)
├── frontend/
│   ├── poll-app/            # User app
│   └── admin-app/           # Admin panel
├── docker/                  # Docker configs
└── package.json             # Root commands
```

## 🤝 Contributing

See [DEVELOPMENT.md](./DEVELOPMENT.md) for development workflow.

## 📄 License

ISC
