## Использование окружений

### Development (разработка)

```bash
# 1. Запустите dev базу данных
npm run docker:dev:up

# 2. Примените миграции
npm run migrate

# 3. Запустите приложение
npm run dev

# Логи базы данных
npm run docker:dev:logs

# Остановить dev базу
npm run docker:dev:down
```

### Test (тестирование)

```bash
# 1. Запустите test базу данных
npm run docker:test:up

# 2. Примените миграции
NODE_ENV=test npm run migrate

# 3. Запустите тесты
npm test

# Логи test базы
npm run docker:test:logs

# Остановить test базу
npm run docker:test:down
```

### Production (продакшен)

```bash
# 1. Настройте .env.production с реальными данными
# 2. Примените миграции
NODE_ENV=production npm run migrate

# 3. Соберите приложение
npm run build

# 4. Запустите приложение
npm run start
```
