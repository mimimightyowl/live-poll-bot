# 🌍 Environments Quick Reference

## Структура окружений

Проект поддерживает три окружения: **development**, **test**, и **production**.

## 📁 Environment Files

### Backend Services

| Сервис           | Development        | Test        | Production        |
| ---------------- | ------------------ | ----------- | ----------------- |
| api-service      | `.env.development` | `.env.test` | `.env.production` |
| realtime-service | `.env.development` | `.env.test` | `.env.production` |
| bot-service      | `.env.development` | `.env.test` | `.env.production` |

### Frontend Apps

| Приложение | Development        | Test        | Production        |
| ---------- | ------------------ | ----------- | ----------------- |
| poll-app   | `.env.development` | `.env.test` | `.env.production` |
| admin-app  | `.env.development` | `.env.test` | `.env.production` |

### Root

- `.env.production` - для Docker Compose production

## 🚀 Quick Start

### Development

```bash
# 1. Копировать env файлы
cp backend/api-service/.env.development.example backend/api-service/.env.development
cp backend/realtime-service/.env.development.example backend/realtime-service/.env.development
cp backend/bot-service/.env.development.example backend/bot-service/.env.development
cp frontend/poll-app/.env.development.example frontend/poll-app/.env.development
cp frontend/admin-app/.env.development.example frontend/admin-app/.env.development

# 2. Добавить Telegram Bot Token
# Отредактировать backend/bot-service/.env.development

# 3. Запустить
npm run dev:db          # База данных
npm run dev:migrate     # Миграции
npm run dev             # Backend
npm run dev:frontend    # Frontend
```

### Test

```bash
# Docker (рекомендуется)
npm run test            # Запустить все
npm run test:migrate    # Миграции
npm run test:logs       # Логи
npm run test:down       # Остановить
```

### Production

```bash
# 1. Создать production env файлы
cp .env.production.example .env.production
# ... скопировать остальные production example файлы

# 2. Заполнить production данными
# Отредактировать все .env.production файлы

# 3. Собрать и запустить
npm run build           # Backend
npm run build:frontend  # Frontend
npm start              # Запуск
```

## 🔧 Environment Variables

### Backend Services

#### api-service

- `NODE_ENV` - development/test/production
- `PORT` - HTTP порт (3000/3001/3000)
- `GRPC_PORT` - gRPC порт (50051)
- `DATABASE_URL` - PostgreSQL connection string
- `REALTIME_SERVICE_GRPC_URL` - Realtime service endpoint

#### realtime-service

- `NODE_ENV` - development/test/production
- `WS_PORT` - WebSocket порт (3001/3011/3001)
- `HTTP_PORT` - HTTP API порт (3002/3012/3002)
- `GRPC_PORT` - gRPC порт (50052)
- `API_SERVICE_GRPC_URL` - API service endpoint

#### bot-service

- `NODE_ENV` - development/test/production
- `TELEGRAM_BOT_TOKEN` - Bot token from @BotFather
- `API_SERVICE_GRPC_URL` - API service endpoint
- `FRONTEND_URL` - Frontend URL for poll links

### Frontend Apps

#### poll-app & admin-app

- `VITE_API_URL` - API service URL
- `VITE_WS_URL` - WebSocket URL
- `VITE_APP_NAME` - Application name
- `VITE_APP_ENV` - Environment name
- `VITE_ENABLE_DEV_TOOLS` - Dev tools flag

## 🐳 Docker Commands

```bash
# Development (database only)
npm run dev:db              # Запустить PostgreSQL
npm run dev:db:down         # Остановить

# Test (все сервисы)
npm run test                # Запустить test environment
npm run test:down           # Остановить
npm run test:logs           # Логи

# Production
# Используйте docker-compose напрямую:
docker-compose -f docker/docker-compose.prod.yml up -d
docker-compose -f docker/docker-compose.prod.yml down
docker-compose -f docker/docker-compose.prod.yml logs -f
```

## 📊 Port Mapping

### Development

| Service          | HTTP | WebSocket | gRPC  |
| ---------------- | ---- | --------- | ----- |
| api-service      | 3000 | -         | 50051 |
| realtime-service | 3002 | 3001      | 50052 |
| bot-service      | -    | -         | -     |
| poll-app         | 5173 | -         | -     |
| admin-app        | 5174 | -         | -     |
| PostgreSQL       | 5432 | -         | -     |

### Test

| Service          | HTTP | WebSocket | gRPC  |
| ---------------- | ---- | --------- | ----- |
| api-service      | 3001 | -         | 50053 |
| realtime-service | 3012 | 3011      | 50054 |
| bot-service      | -    | -         | -     |
| poll-app         | 5175 | -         | -     |
| admin-app        | 5176 | -         | -     |
| PostgreSQL       | 5433 | -         | -     |

### Production

| Service          | HTTP | WebSocket | gRPC  |
| ---------------- | ---- | --------- | ----- |
| api-service      | 3000 | -         | 50051 |
| realtime-service | 3002 | 3001      | 50052 |
| bot-service      | -    | -         | -     |
| PostgreSQL       | 5432 | -         | -     |

## 🔐 Security Notes

### Development

- Используются дефолтные пароли
- Все порты открыты на localhost
- Dev tools включены

### Test

- Отдельная база данных
- Отдельные порты
- Dev tools выключены

### Production

- **ОБЯЗАТЕЛЬНО** измените все пароли
- Используйте secrets management (не храните в git)
- Включите SSL/TLS
- Настройте firewall
- Регулярный backup базы данных
- Мониторинг и логирование
- Используйте reverse proxy (nginx)

## 📝 Best Practices

1. **Никогда не коммитьте .env файлы** (только .example)
2. **Используйте разные токены** для dev/test/prod
3. **Регулярно обновляйте .example файлы** при добавлении новых переменных
4. **Документируйте все переменные** в .example файлах
5. **Используйте secrets management** в production
6. **Проверяйте .env файлы** в CI/CD пайплайне

## 🆘 Troubleshooting

### Environment не загружается

```bash
# Проверьте NODE_ENV
echo $NODE_ENV

# Проверьте что файл существует
ls -la .env.${NODE_ENV}

# Проверьте синтаксис в .env файле (нет пробелов вокруг =)
cat .env.${NODE_ENV}
```

### Порты заняты

```bash
# Найти процессы на портах
lsof -i :3000 -i :3001 -i :3002 -i :5173

# Остановить Docker контейнеры
npm run docker:dev:down
npm run docker:test:down
```

### База данных недоступна

```bash
# Проверить что контейнер запущен
docker ps | grep postgres

# Проверить логи
npm run docker:dev:logs

# Перезапустить
npm run docker:db:down
npm run docker:db
```

## 📚 См. также

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Полная документация по разработке
- [README.md](./README.md) - Обзор проекта
- [docker/](./docker/) - Docker Compose файлы
