# Quick Command Reference

## 🚀 Most Used Commands

```bash
# Quick start (after first setup)
npm run docker:db     # Start dev database
npm run dev           # Start backend (API + Realtime + Bot)

# First time setup
npm install           # Install all dependencies
npm run docker:db     # Start PostgreSQL
# Wait ~10 seconds for DB to be ready
npm run migrate       # Setup database schema
npm run seed          # Add test data
```

## 📋 All Commands

### Development

| Command                | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Start API + Realtime + Bot services                |
| `npm run dev:api`      | Start only API service                             |
| `npm run dev:realtime` | Start only Realtime service                        |
| `npm run dev:bot`      | Start only Bot service                             |
| `npm run dev:frontend` | Start only Frontend                                |
| `npm run dev:full`     | Start everything (API + Realtime + Bot + Frontend) |

### Build

| Command                  | Description                 |
| ------------------------ | --------------------------- |
| `npm run build`          | Build all backend services  |
| `npm run build:api`      | Build only API service      |
| `npm run build:realtime` | Build only Realtime service |

### Database

| Command            | Description                               |
| ------------------ | ----------------------------------------- |
| `npm run migrate`  | Run database migrations                   |
| `npm run seed`     | Seed database with test data              |
| `npm run db:reset` | Reset database (migrate down → up → seed) |

### Docker

| Command                  | Description                  |
| ------------------------ | ---------------------------- |
| `npm run docker:db`      | Start PostgreSQL only        |
| `npm run docker:db:down` | Stop PostgreSQL              |
| `npm run docker:up`      | Start all services in Docker |
| `npm run docker:down`    | Stop all Docker services     |
| `npm run docker:logs`    | View Docker logs             |

### Code Quality

| Command                | Description       |
| ---------------------- | ----------------- |
| `npm run lint`         | Lint all code     |
| `npm run lint:fix`     | Lint and auto-fix |
| `npm run format`       | Format all code   |
| `npm run format:check` | Check formatting  |

### Installation

| Command                    | Description                                      |
| -------------------------- | ------------------------------------------------ |
| `npm install`              | Install all dependencies (auto-runs postinstall) |
| `npm run install:backend`  | Install backend dependencies only                |
| `npm run install:frontend` | Install frontend dependencies only               |

## 🎯 Common Workflows

### Daily Development

```bash
npm run docker:db     # Start DB (once)
npm run dev           # Start backend (API + Realtime + Bot)
# In another terminal:
npm run dev:frontend  # Start frontend
```

### Full Stack Development

```bash
npm run docker:db     # Start DB
npm run dev:full      # Start everything
```

### After Pulling New Code

```bash
npm install           # Update dependencies
npm run migrate       # Run new migrations
npm run dev           # Restart services
```

### Database Reset

```bash
npm run db:reset      # Clean slate with test data
```

### Production Build

```bash
npm run build         # Build all services
```

## 🔗 Service URLs

After running `npm run dev`:

- 🔵 **API Service**: http://localhost:3000
- 🟣 **Realtime WS**: ws://localhost:3001
- 📡 **Realtime HTTP**: http://localhost:3002
- 🟡 **Bot Service**: gRPC client (Telegram)
- 🗄️ **PostgreSQL**: postgresql://localhost:5432
- 🌐 **Frontend**: http://localhost:5173 (if running)

## 💡 Tips

1. **First time?** See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed setup
2. **Colors**: `npm run dev` shows blue (API), magenta (Realtime), and yellow (Bot) logs
3. **Stop services**: Use `Ctrl+C` - services shutdown gracefully
4. **Port conflicts?**: Check with `lsof -i :3000 :3001 :3002 :50051`
5. **Database issues?**: Try `npm run db:reset`
6. **Bot not responding?**: Check `.env.development` in `backend/bot-service`

## 🆘 Troubleshooting

```bash
# Port already in use
lsof -i :3001           # Find process
kill -9 <PID>           # Kill it

# Or stop Docker
npm run docker:down

# Database not responding
npm run docker:db:down
npm run docker:db

# Fresh start
npm run docker:db:down
npm run docker:db
npm run db:reset
npm run dev
```

## 📚 More Information

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Full development guide
- [README.md](./README.md) - Project overview
- [backend/api-service/](./backend/api-service/) - API documentation
- [backend/realtime-service/](./backend/realtime-service/) - Realtime documentation
