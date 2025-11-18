# Docker Configuration

This directory contains Docker and Docker Compose configurations for the Live Poll Bot application.

## 📁 Files

- **`docker-compose.prod.yml`** - Production deployment configuration
- **`docker-compose.dev.yml`** - Development environment configuration
- **`docker-compose.test.yml`** - Test environment configuration
- **`nginx.conf`** - Nginx reverse proxy configuration
- **`.env.production.example`** - Example environment variables for production

## 🚀 Production Deployment

### Quick Start

```bash
# From project root
./scripts/deploy.sh
```

### Manual Deployment

```bash
# 1. Create .env file
cp docker/.env.production.example .env

# 2. Edit .env with your values
nano .env

# 3. Build and start services
docker-compose -f docker/docker-compose.prod.yml build
docker-compose -f docker/docker-compose.prod.yml up -d
```

## 🏗️ Services

### PostgreSQL

- **Image**: postgres:15-alpine
- **Port**: Internal only (5432)
- **Volume**: `postgres_data` for persistence
- **Health Check**: pg_isready

### API Service

- **Build**: `../backend/api-service`
- **Ports**: 3000 (REST), 50051 (gRPC)
- **Networks**: backend, frontend
- **Health Check**: HTTP GET /health
- **Depends**: postgres

### Realtime Service

- **Build**: `../backend/realtime-service`
- **Ports**: 3001 (WebSocket), 3002 (HTTP), 50052 (gRPC)
- **Networks**: backend, frontend
- **Health Check**: HTTP GET /health
- **Depends**: api-service

### Bot Service

- **Build**: `../backend/bot-service`
- **Networks**: backend
- **Depends**: api-service

### Poll App (Frontend)

- **Build**: `../frontend/poll-app`
- **Networks**: frontend
- **Build Args**: VITE_API_URL, VITE_WS_URL

### Admin App (Frontend)

- **Build**: `../frontend/admin-app`
- **Networks**: frontend
- **Build Args**: VITE_API_URL, VITE_WS_URL

### Nginx

- **Image**: nginx:alpine
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Networks**: frontend
- **Depends**: All services

## 🌐 Network Architecture

```
┌─────────────────────────────────────────────────┐
│                  Internet                       │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │  Nginx (Port 80)│
            └────────┬────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
        ▼                          ▼
┌───────────────┐        ┌──────────────────┐
│Frontend Network│        │ Backend Network  │
├───────────────┤        ├──────────────────┤
│ • poll-app    │        │ • api-service    │
│ • admin-app   │        │ • realtime-service│
│               │        │ • bot-service    │
│               │        │ • postgres       │
└───────────────┘        └──────────────────┘
```

## 🔒 Security Features

1. **Network Isolation**: Backend services isolated from public access
2. **Health Checks**: All services monitored for availability
3. **Restart Policies**: Automatic restart on failure
4. **Volume Persistence**: Database data persisted across restarts
5. **Environment Variables**: Sensitive data stored in .env

## 📊 Monitoring

### View Service Status

```bash
docker-compose -f docker/docker-compose.prod.yml ps
```

### View Logs

```bash
# All services
docker-compose -f docker/docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker/docker-compose.prod.yml logs -f api-service
```

### Check Health

```bash
curl http://localhost/api/health
curl http://localhost/
```

## 🛠️ Management

### Stop Services

```bash
docker-compose -f docker/docker-compose.prod.yml down
```

### Restart Service

```bash
docker-compose -f docker/docker-compose.prod.yml restart api-service
```

### Rebuild Service

```bash
docker-compose -f docker/docker-compose.prod.yml build --no-cache api-service
docker-compose -f docker/docker-compose.prod.yml up -d api-service
```

## 📖 Documentation

For complete deployment guide, see [DEPLOYMENT.md](../DEPLOYMENT.md)
