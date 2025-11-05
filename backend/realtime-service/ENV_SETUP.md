# Environment Configuration Guide

## Overview

The realtime-service uses environment-specific configuration files to manage different deployment scenarios.

## Environment Files

- `.env.example` - Main reference with all available options
- `.env.development.example` - Development-specific template
- `.env.production.example` - Production-specific template
- `.env.test.example` - Test-specific template

## Quick Start

### Development Setup

```bash
# Copy example file
cp .env.development.example .env.development

# Update if needed (usually defaults work)
# Run service
npm run dev
```

### Production Setup

```bash
# Copy example file
cp .env.production.example .env.production

# IMPORTANT: Update with production values
# - Use strong passwords
# - Use proper database host
# - Consider secrets management

npm run build
npm start
```

## Environment Variables

### Required Variables

| Variable       | Description                  | Default       | Example                               |
| -------------- | ---------------------------- | ------------- | ------------------------------------- |
| `NODE_ENV`     | Environment name             | `development` | `production`                          |
| `WS_PORT`      | WebSocket server port        | `3001`        | `3001`                                |
| `HTTP_PORT`    | HTTP API port                | `3002`        | `3002`                                |
| `DATABASE_URL` | PostgreSQL connection string | -             | `postgresql://user:pass@host:5432/db` |

### Optional Variables

| Variable      | Description       | Used When                |
| ------------- | ----------------- | ------------------------ |
| `DB_HOST`     | Database host     | Not using `DATABASE_URL` |
| `DB_PORT`     | Database port     | Not using `DATABASE_URL` |
| `DB_USER`     | Database user     | Not using `DATABASE_URL` |
| `DB_PASSWORD` | Database password | Not using `DATABASE_URL` |
| `DB_NAME`     | Database name     | Not using `DATABASE_URL` |

## Port Configuration

### Default Ports

- **3001**: WebSocket server (client connections)
- **3002**: HTTP API (inter-service notifications)

### Test Environment Ports

To avoid conflicts with development:

- **3011**: WebSocket server (test)
- **3012**: HTTP API (test)

## Database Configuration

### Option 1: Connection String (Recommended)

```env
DATABASE_URL=postgresql://app:secret@localhost:5432/main_dev
```

**Format:** `postgresql://[user]:[password]@[host]:[port]/[database]`

### Option 2: Individual Parameters

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=app
DB_PASSWORD=secret
DB_NAME=main_dev
```

## Environment-Specific Settings

### Development

```env
NODE_ENV=development
WS_PORT=3001
HTTP_PORT=3002
DATABASE_URL=postgresql://app:secret@localhost:5432/main_dev
```

- Uses local database
- Hot reload enabled
- Detailed logging

### Production

```env
NODE_ENV=production
WS_PORT=3001
HTTP_PORT=3002
DATABASE_URL=postgresql://app:strong_password@db:5432/main
```

- Uses production database host (`db` in Docker)
- Optimized performance
- Security hardened

### Test

```env
NODE_ENV=test
WS_PORT=3011
HTTP_PORT=3012
DATABASE_URL=postgresql://app:secret@localhost:5432/main_test
```

- Different ports (avoid conflicts)
- Separate test database
- Database reset before tests

## Docker Configuration

When running in Docker (docker-compose):

```yaml
environment:
  NODE_ENV: development
  WS_PORT: 3001
  HTTP_PORT: 3002
  DATABASE_URL: postgresql://app:secret@db:5432/main_dev
```

Note: Use service name (`db`) as hostname in Docker network.

## Security Best Practices

### Development

- Default passwords are OK
- Local database access only

### Production

1. **Never commit** `.env.production` to git
2. Use **strong passwords** (16+ characters)
3. Use **secrets management** (AWS Secrets Manager, HashiCorp Vault)
4. Restrict database access by IP
5. Use SSL/TLS for database connections
6. Rotate credentials regularly

### Example Strong Configuration

```env
NODE_ENV=production
WS_PORT=3001
HTTP_PORT=3002
DATABASE_URL=postgresql://realtime_user:Xy9$mK#pL2qR7vN@prod-db.example.com:5432/live_poll_prod?sslmode=require
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Database Connection Failed

1. Check database is running
2. Verify connection string
3. Test connection: `psql $DATABASE_URL`
4. Check firewall rules

### Environment Not Loading

1. Verify file name: `.env.development` (not `.env.development.txt`)
2. Check file is in project root
3. Restart development server
4. Check `dotenv` package is installed

## Example Commands

```bash
# Check current environment
echo $NODE_ENV

# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# View loaded environment (dev)
node -e "require('./src/shared/env-loader'); console.log(process.env)"

# Start with specific environment
NODE_ENV=production npm start
```

## Integration with Other Services

### API Service Connection

The api-service needs to know realtime-service HTTP endpoint:

```env
# In api-service/.env.development
REALTIME_SERVICE_URL=http://localhost:3002

# In api-service/.env.production (Docker)
REALTIME_SERVICE_URL=http://realtime:3002
```

### Frontend Connection

The frontend connects to WebSocket:

```env
# In frontend/poll-app/.env
VITE_WS_URL=ws://localhost:3001

# Production
VITE_WS_URL=wss://your-domain.com/ws
```

## Further Reading

- [dotenv documentation](https://github.com/motdotla/dotenv)
- [PostgreSQL connection strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [Node.js environment best practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
