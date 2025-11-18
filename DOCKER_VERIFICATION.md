# ✅ Docker Setup Verification Checklist

Use this checklist to verify that the Docker production setup is complete and working.

## 📋 File Verification

### Dockerfiles

- [ ] `backend/api-service/Dockerfile` exists and is valid
- [ ] `backend/realtime-service/Dockerfile` exists and is valid
- [ ] `backend/bot-service/Dockerfile` exists and is valid
- [ ] `frontend/poll-app/Dockerfile` exists and is valid
- [ ] `frontend/admin-app/Dockerfile` exists and is valid

### Nginx Configuration

- [ ] `docker/nginx.conf` exists with reverse proxy configuration
- [ ] `frontend/poll-app/nginx.conf` exists with SPA configuration
- [ ] `frontend/admin-app/nginx.conf` exists with SPA configuration

### Docker Compose

- [ ] `docker/docker-compose.prod.yml` exists with all services
- [ ] PostgreSQL service configured with health check
- [ ] API service configured with health check
- [ ] Realtime service configured with health check
- [ ] Bot service configured
- [ ] Poll app configured
- [ ] Admin app configured
- [ ] Nginx service configured
- [ ] Networks defined (backend, frontend)
- [ ] Volumes defined (postgres_data, nginx_logs)

### Scripts & Documentation

- [ ] `scripts/deploy.sh` exists and is executable
- [ ] `docker/.env.production.example` exists with all required variables
- [ ] `DEPLOYMENT.md` exists with comprehensive guide
- [ ] `docker/README.md` exists with Docker-specific docs
- [ ] `README.md` updated with deployment section

## 🧪 Build Verification

Run these commands to verify builds work:

```bash
# Test build API service
docker build -t test-api ./backend/api-service
echo "✅ API service builds" || echo "❌ API service build failed"

# Test build Realtime service
docker build -t test-realtime ./backend/realtime-service
echo "✅ Realtime service builds" || echo "❌ Realtime service build failed"

# Test build Bot service
docker build -t test-bot ./backend/bot-service
echo "✅ Bot service builds" || echo "❌ Bot service build failed"

# Test build Poll app (with build args)
docker build --build-arg VITE_API_URL=http://localhost/api --build-arg VITE_WS_URL=ws://localhost/ws -t test-poll ./frontend/poll-app
echo "✅ Poll app builds" || echo "❌ Poll app build failed"

# Test build Admin app (with build args)
docker build --build-arg VITE_API_URL=http://localhost/api --build-arg VITE_WS_URL=ws://localhost/ws -t test-admin ./frontend/admin-app
echo "✅ Admin app builds" || echo "❌ Admin app build failed"

# Cleanup test images
docker rmi test-api test-realtime test-bot test-poll test-admin
```

## 🚀 Deployment Verification

### Pre-deployment Checks

- [ ] Docker is installed and running
- [ ] Docker Compose V2 is installed
- [ ] `.env` file created from `.env.production.example`
- [ ] All environment variables set correctly
- [ ] Telegram bot token configured
- [ ] Ports 80 and 443 are available

### Deployment Test

```bash
# Run deployment script
./scripts/deploy.sh
```

Expected output:

- [ ] ✓ Environment file found
- [ ] ✓ Docker is running
- [ ] ✓ Docker images built successfully
- [ ] ✓ Database is ready
- [ ] ✓ Database migrations completed
- [ ] ✓ All services started
- [ ] ✓ Services are healthy

### Service Status Check

```bash
docker-compose -f docker/docker-compose.prod.yml ps
```

All services should show status: "Up (healthy)" or "Up"

## 🔍 Health Check Verification

Test all health endpoints:

```bash
# API Service (through nginx)
curl -f http://localhost/api/health && echo "✅ API healthy" || echo "❌ API unhealthy"

# Realtime Service (through nginx)
curl -f http://localhost/realtime/health && echo "✅ Realtime healthy" || echo "❌ Realtime unhealthy"

# Poll App
curl -f http://localhost/ && echo "✅ Poll app healthy" || echo "❌ Poll app unhealthy"

# Admin App
curl -f http://localhost/admin/ && echo "✅ Admin app healthy" || echo "❌ Admin app unhealthy"

# Nginx
curl -f http://localhost/health && echo "✅ Nginx healthy" || echo "❌ Nginx unhealthy"
```

## 🔗 Service Communication Verification

### Database Connection

```bash
# Verify API service can connect to database
docker-compose -f docker/docker-compose.prod.yml logs api-service | grep -i "database connected"
```

### gRPC Communication

```bash
# Verify realtime service connects to API service via gRPC
docker-compose -f docker/docker-compose.prod.yml logs realtime-service | grep -i "grpc"

# Verify bot service connects to API service via gRPC
docker-compose -f docker/docker-compose.prod.yml logs bot-service | grep -i "grpc"
```

### WebSocket Connection

Test WebSocket connection (requires wscat or similar):

```bash
# Install wscat if needed
npm install -g wscat

# Test WebSocket connection
wscat -c ws://localhost/ws
```

## 📊 Volume Persistence Verification

### Test Data Persistence

```bash
# 1. Create test data in database
docker-compose -f docker/docker-compose.prod.yml exec api-service npm run seed:dev

# 2. Restart services
docker-compose -f docker/docker-compose.prod.yml restart

# 3. Verify data still exists
docker-compose -f docker/docker-compose.prod.yml exec postgres psql -U app -d live_poll_db -c "SELECT COUNT(*) FROM users;"
```

Expected: Data should persist after restart

## 🔄 Graceful Shutdown Verification

```bash
# Test graceful shutdown
docker-compose -f docker/docker-compose.prod.yml down

# Verify all containers stopped cleanly
docker-compose -f docker/docker-compose.prod.yml ps
```

Expected: All containers should stop without errors

## 🌐 Network Verification

### Backend Network Isolation

```bash
# Verify postgres is NOT accessible from frontend network
docker-compose -f docker/docker-compose.prod.yml exec poll-app nc -zv postgres 5432
```

Expected: Connection should fail (postgres isolated to backend network)

### Frontend Network Access

```bash
# Verify api-service IS accessible from frontend network
docker-compose -f docker/docker-compose.prod.yml exec poll-app nc -zv api-service 3000
```

Expected: Connection should succeed

## 🔒 Security Verification

### Environment Variables

```bash
# Verify sensitive data not in images
docker history live-poll-api | grep -i password
```

Expected: No passwords visible

### Port Exposure

```bash
# Check which ports are exposed to host
docker-compose -f docker/docker-compose.prod.yml ps
```

Expected: Only nginx ports (80, 443) should be exposed to host

### Security Headers

```bash
# Test security headers
curl -I http://localhost/
```

Expected headers:

- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

## 📝 Documentation Verification

- [ ] DEPLOYMENT.md is comprehensive and easy to follow
- [ ] docker/README.md explains Docker setup
- [ ] README.md includes deployment section
- [ ] All commands in documentation work correctly
- [ ] Troubleshooting section addresses common issues

## 🎯 Acceptance Criteria

- [x] All Dockerfiles created
- [x] docker-compose.prod.yml starts all services
- [x] Health checks working
- [x] Services communicate correctly
- [x] Data persists via volumes
- [x] Graceful shutdown works
- [x] Deployment script works
- [x] README with deployment instructions

## ✨ Success Criteria

Your deployment is successful if:

1. All services start without errors
2. All health checks pass
3. Frontend apps are accessible via browser
4. WebSocket connections work
5. Telegram bot responds to commands
6. Database data persists after restart
7. Services restart automatically on failure

## 🐛 Troubleshooting

If any verification fails, see:

- `DEPLOYMENT.md` - Troubleshooting section
- `docker-compose logs` - Service logs
- `docker inspect` - Container details

## 📞 Support

For issues, check:

1. Service logs: `docker-compose -f docker/docker-compose.prod.yml logs -f [service-name]`
2. Container health: `docker inspect [container-name]`
3. Network connectivity: `docker network inspect [network-name]`
4. Volume data: `docker volume inspect [volume-name]`
