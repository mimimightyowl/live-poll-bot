# Health Check Endpoints

All services in the live-poll-bot project have health check endpoints for monitoring and container orchestration.

## Overview

Each service exposes a `/health` endpoint that returns a JSON response with the service status and dependency checks.

### Response Format

```json
{
  "status": "healthy",
  "timestamp": "2025-11-18T10:00:00Z",
  "service": "service-name",
  "version": "1.0.0",
  "checks": {
    "dependency1": "ok",
    "dependency2": "ok"
  }
}
```

### HTTP Status Codes

- **200 OK**: Service is healthy and all dependencies are operational
- **503 Service Unavailable**: Service is unhealthy or one or more dependencies are failing

## Service Endpoints

### API Service

**URL**: `http://localhost:3000/health`

**Checks**:

- `database`: PostgreSQL database connectivity
- `grpc`: Connection to realtime-service gRPC

**Example**:

```bash
curl http://localhost:3000/health
```

**Response**:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-18T10:00:00Z",
  "service": "api-service",
  "version": "1.0.0",
  "checks": {
    "database": "ok",
    "grpc": "ok"
  }
}
```

---

### Bot Service

**URL**: `http://localhost:3000/health`

**Checks**:

- `telegram_bot`: Telegram bot status
- `grpc_users`: Connection to api-service users gRPC
- `grpc_polls`: Connection to api-service polls gRPC

**Example**:

```bash
curl http://localhost:3000/health
```

**Response**:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-18T10:00:00Z",
  "service": "bot-service",
  "version": "1.0.0",
  "checks": {
    "telegram_bot": "ok",
    "grpc_users": "ok",
    "grpc_polls": "ok"
  }
}
```

---

### Realtime Service

**URL**: `http://localhost:3002/health`

**Checks**:

- `websocket`: WebSocket manager status
- `connections`: Number of active WebSocket connections
- `grpc`: Connection to api-service gRPC

**Example**:

```bash
curl http://localhost:3002/health
```

**Response**:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-18T10:00:00Z",
  "service": "realtime-service",
  "version": "1.0.0",
  "checks": {
    "websocket": "ok",
    "connections": "5",
    "grpc": "ok"
  }
}
```

---

### Admin App

**URL**: `http://localhost/health` (when running via nginx)

**Checks**:

- `nginx`: Nginx server status

**Example**:

```bash
curl http://localhost/health
```

**Response**:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-18T10:00:00Z",
  "service": "admin-app",
  "version": "1.0.0",
  "checks": {
    "nginx": "ok"
  }
}
```

---

### Poll App

**URL**: `http://localhost/health` (when running via nginx)

**Checks**:

- `nginx`: Nginx server status

**Example**:

```bash
curl http://localhost/health
```

**Response**:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-18T10:00:00Z",
  "service": "poll-app",
  "version": "1.0.0",
  "checks": {
    "nginx": "ok"
  }
}
```

## Docker Health Checks

All services have Docker HEALTHCHECK instructions configured in their Dockerfiles:

### Backend Services (api-service, bot-service, realtime-service)

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:<port>/health || exit 1
```

**Parameters**:

- `interval`: Check every 30 seconds
- `timeout`: Timeout after 10 seconds
- `start-period`: Wait 40 seconds before starting checks (for startup)
- `retries`: Mark unhealthy after 3 consecutive failures

### Frontend Services (admin-app, poll-app)

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1
```

**Parameters**:

- `interval`: Check every 30 seconds
- `timeout`: Timeout after 3 seconds
- `start-period`: Wait 10 seconds before starting checks
- `retries`: Mark unhealthy after 3 consecutive failures

## Using Health Checks

### Docker Compose

Health checks are automatically used in Docker Compose for dependency management:

```yaml
services:
  api-service:
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      start_period: 40s
      retries: 3
```

Other services can depend on healthy services:

```yaml
services:
  bot-service:
    depends_on:
      api-service:
        condition: service_healthy
```

### Kubernetes

Health checks can be used as liveness and readiness probes:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 40
  periodSeconds: 30
  timeoutSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### Monitoring Tools

Health checks can be integrated with monitoring tools:

- **Prometheus**: Use blackbox_exporter to scrape health endpoints
- **Grafana**: Create dashboards based on health check metrics
- **Alertmanager**: Set up alerts for unhealthy services
- **Uptime monitoring**: Use services like UptimeRobot, Pingdom, etc.

## Troubleshooting

### Service Reports Unhealthy

1. Check the specific failed check in the response
2. Review service logs for errors
3. Verify dependent services are running
4. Check network connectivity between services

### Health Check Fails in Docker

1. Verify the port is exposed in the Dockerfile
2. Check container logs: `docker logs <container-name>`
3. Inspect container health: `docker inspect <container-name>`
4. Test manually: `docker exec <container-name> curl http://localhost:<port>/health`

### gRPC Connection Errors

Common error codes:

- `5 (NOT_FOUND)`: Expected for test queries, connection is working
- `14 (UNAVAILABLE)`: Service is down or unreachable
- `4 (DEADLINE_EXCEEDED)`: Timeout, service is slow or overloaded

## Best Practices

1. **Keep health checks lightweight**: Should complete in < 1 second
2. **Check critical dependencies**: Database, external APIs, gRPC connections
3. **Use appropriate timeouts**: Balance between responsiveness and false positives
4. **Log health check failures**: For debugging and alerting
5. **Test health checks**: Include in integration tests
6. **Monitor in production**: Set up alerts for unhealthy services

## Development

When developing new services, implement health checks following this pattern:

1. Create `/health` endpoint
2. Check all critical dependencies
3. Return appropriate HTTP status codes
4. Include checks details in response
5. Add HEALTHCHECK to Dockerfile
6. Update this documentation

## Related Documentation

- [Docker Deployment](DEPLOYMENT.md)
- [Development Guide](DEVELOPMENT.md)
- [API Documentation](README.md)
