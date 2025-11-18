# 🚀 Production Deployment Guide

This guide explains how to deploy the Live Poll Bot application to production using Docker Compose.

## 📋 Prerequisites

- Docker Engine 20.10+ and Docker Compose v2.0+
- A server with at least 2GB RAM
- Domain name (optional, for SSL/HTTPS)
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))

## 🔧 Environment Setup

### 1. Create Environment File

Create a `.env` file in the project root:

```bash
cp docker/.env.production.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your production values:

```bash
# Database Configuration
POSTGRES_USER=app
POSTGRES_PASSWORD=<use-strong-password-here>
POSTGRES_DB=live_poll_db

# Telegram Bot
TELEGRAM_BOT_TOKEN=<your-bot-token-from-botfather>

# Frontend URLs (adjust to your domain)
FRONTEND_URL=https://your-domain.com
VITE_API_URL=https://your-domain.com/api
VITE_WS_URL=wss://your-domain.com/ws

# Nginx Ports
NGINX_PORT=80
NGINX_SSL_PORT=443

# Node Environment
NODE_ENV=production
```

**Security Notes:**

- Use a strong, unique password for `POSTGRES_PASSWORD`
- Never commit the `.env` file to version control
- Keep your Telegram bot token secret

## 🚀 Deployment

### Quick Deployment

Run the automated deployment script:

```bash
./scripts/deploy.sh
```

The script will:

1. ✅ Validate environment configuration
2. ✅ Build Docker images
3. ✅ Start the database
4. ✅ Run migrations
5. ✅ Start all services
6. ✅ Perform health checks

### Manual Deployment

If you prefer to deploy manually:

```bash
# 1. Build all images
docker-compose -f docker/docker-compose.prod.yml build

# 2. Start database
docker-compose -f docker/docker-compose.prod.yml up -d postgres

# 3. Wait for database to be ready (check with)
docker-compose -f docker/docker-compose.prod.yml ps

# 4. Run migrations
docker-compose -f docker/docker-compose.prod.yml run --rm api-service npm run migrate

# 5. Start all services
docker-compose -f docker/docker-compose.prod.yml up -d
```

## 🔍 Verify Deployment

After deployment, verify all services are running:

```bash
# Check service status
docker-compose -f docker/docker-compose.prod.yml ps

# Check logs
docker-compose -f docker/docker-compose.prod.yml logs -f

# Test endpoints
curl http://localhost/api/health
curl http://localhost/
curl http://localhost/admin/
```

## 🏗️ Architecture

The production setup includes:

- **PostgreSQL**: Database with persistent volume
- **API Service**: REST API + gRPC server (port 3000, 50051)
- **Realtime Service**: WebSocket + gRPC server (port 3001, 3002, 50052)
- **Bot Service**: Telegram bot integration
- **Poll App**: User-facing frontend
- **Admin App**: Admin dashboard
- **Nginx**: Reverse proxy with load balancing

### Network Architecture

```
Internet
   │
   ▼
┌─────────────────┐
│  Nginx (Port 80)│
│  Reverse Proxy  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌─────────────┐
│Frontend │ │   Backend   │
│Network  │ │   Network   │
│         │ │             │
│ Poll    │ │ API Service │
│ Admin   │ │ Realtime    │
│         │ │ Bot         │
│         │ │ PostgreSQL  │
└─────────┘ └─────────────┘
```

## 🔐 SSL/HTTPS Setup (Optional but Recommended)

### Using Let's Encrypt with Certbot

1. Install Certbot:

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

2. Get SSL certificate:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

3. Update `docker/nginx.conf` to enable the HTTPS server block (uncomment the SSL section)

4. Create SSL volume in `docker-compose.prod.yml`:

```yaml
volumes:
  - ./ssl:/etc/nginx/ssl:ro
```

5. Restart services:

```bash
./scripts/deploy.sh --restart
```

## 🛠️ Management Commands

### View Logs

```bash
# All services
docker-compose -f docker/docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker/docker-compose.prod.yml logs -f api-service
```

### Restart Services

```bash
# Restart all
./scripts/deploy.sh --restart

# Restart specific service
docker-compose -f docker/docker-compose.prod.yml restart api-service
```

### Stop Services

```bash
docker-compose -f docker/docker-compose.prod.yml down
```

### Stop and Remove Volumes (⚠️ This deletes all data!)

```bash
docker-compose -f docker/docker-compose.prod.yml down -v
```

### Database Backup

```bash
# Backup
docker-compose -f docker/docker-compose.prod.yml exec postgres pg_dump -U app live_poll_db > backup.sql

# Restore
docker-compose -f docker/docker-compose.prod.yml exec -T postgres psql -U app live_poll_db < backup.sql
```

### Database Migrations

```bash
# Run new migrations
docker-compose -f docker/docker-compose.prod.yml run --rm api-service npm run migrate

# Rollback last migration
docker-compose -f docker/docker-compose.prod.yml run --rm api-service npm run migrate:down
```

## 📊 Monitoring

### Health Checks

All services have health checks configured:

- API Service: `http://localhost/api/health`
- Realtime Service: `http://localhost/api/health`
- Frontend Apps: `http://localhost/health`
- Nginx: `http://localhost/health`

### Check Container Health

```bash
docker-compose -f docker/docker-compose.prod.yml ps
```

### Resource Usage

```bash
docker stats
```

## 🔧 Troubleshooting

### Service won't start

```bash
# Check logs
docker-compose -f docker/docker-compose.prod.yml logs <service-name>

# Rebuild specific service
docker-compose -f docker/docker-compose.prod.yml build --no-cache <service-name>
docker-compose -f docker/docker-compose.prod.yml up -d <service-name>
```

### Database connection issues

```bash
# Check database is running
docker-compose -f docker/docker-compose.prod.yml ps postgres

# Check database logs
docker-compose -f docker/docker-compose.prod.yml logs postgres

# Test connection
docker-compose -f docker/docker-compose.prod.yml exec postgres psql -U app -d live_poll_db
```

### Port conflicts

If ports 80 or 443 are already in use:

1. Edit `.env`:

```bash
NGINX_PORT=8080
NGINX_SSL_PORT=8443
```

2. Restart:

```bash
./scripts/deploy.sh --restart
```

### Container is unhealthy

```bash
# Get detailed health status
docker inspect --format='{{json .State.Health}}' <container-name>

# Force restart unhealthy container
docker-compose -f docker/docker-compose.prod.yml restart <service-name>
```

## 🎯 Performance Tuning

### Database

Edit `docker-compose.prod.yml` to add PostgreSQL tuning:

```yaml
postgres:
  environment:
    POSTGRES_SHARED_BUFFERS: '256MB'
    POSTGRES_MAX_CONNECTIONS: '200'
```

### Nginx

Update `docker/nginx.conf` worker processes:

```nginx
events {
    worker_connections 2048;
}
```

### Container Resources

Limit container resources in `docker-compose.prod.yml`:

```yaml
api-service:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 512M
      reservations:
        cpus: '0.5'
        memory: 256M
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Strong Passwords**: Use complex database passwords
3. **Firewall**: Only expose necessary ports (80, 443)
4. **Updates**: Keep Docker images updated
5. **SSL/TLS**: Always use HTTPS in production
6. **Secrets**: Use Docker secrets for sensitive data
7. **Backups**: Regular database backups
8. **Monitoring**: Set up logging and monitoring

## 📦 Updating the Application

### Zero-Downtime Update

```bash
# 1. Pull latest code
git pull origin main

# 2. Build new images
docker-compose -f docker/docker-compose.prod.yml build

# 3. Run migrations (if any)
docker-compose -f docker/docker-compose.prod.yml run --rm api-service npm run migrate

# 4. Rolling restart
docker-compose -f docker/docker-compose.prod.yml up -d --no-deps --build api-service
docker-compose -f docker/docker-compose.prod.yml up -d --no-deps --build realtime-service
docker-compose -f docker/docker-compose.prod.yml up -d --no-deps --build bot-service
docker-compose -f docker/docker-compose.prod.yml up -d --no-deps --build poll-app
docker-compose -f docker/docker-compose.prod.yml up -d --no-deps --build admin-app
```

## 📝 Production Checklist

Before deploying to production:

- [ ] Set strong database password
- [ ] Configure production domain/URLs
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Configure monitoring/logging
- [ ] Test all health check endpoints
- [ ] Verify Telegram bot works
- [ ] Test WebSocket connections
- [ ] Load test the application
- [ ] Document rollback procedure
- [ ] Set up CI/CD pipeline

## 🆘 Support

For issues or questions:

- Check logs: `docker-compose -f docker/docker-compose.prod.yml logs -f`
- Review [DEVELOPMENT.md](./DEVELOPMENT.md)
- Check service READMEs in `backend/` directories

## 📄 License

ISC
