# Настройка окружений

Проект поддерживает раздельные окружения: **development**, **test**, и **production**.

## Первоначальная настройка

### 1. Создайте .env файлы

Скопируйте примеры и заполните реальными значениями:

```bash
# Для разработки
cp .env.develop ponto.example .env.development

# Для тестирования
cp .env.test.example .env.test

# Для продакшена (НЕ коммитьте в Git!)
cp .env.production.example .env.production
# Затем отредактируйте .env.production реальными данными
```

## Структура окружений

### Базы данных

| Окружение   | Имя базы    | Порт |
| ----------- | ----------- | ---- |
| development | `main_dev`  | 5432 |
| test        | `main_test` | 5433 |
| production  | `main_prod` | 5432 |

### Переменные окружения

Все окружения используют одинаковую структуру переменных:

```env
NODE_ENV=development  # или test, production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:port/database
DB_HOST=localhost
DB_PORT=5432
DB_USER=app
DB_PASSWORD=secret
DB_NAME=main_dev
```

## Миграции

Миграции поддерживают оба формата подключения:

- `DATABASE_URL` (предпочтительно для миграций) - например: `postgresql://user:pass@host:5432/dbname`
- Отдельные переменные: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`

**Примечание**: Если указан `DATABASE_URL`, он будет распарсен автоматически. Если нет - используются отдельные переменные или генерируется `DATABASE_URL` из них.

## Troubleshooting

### База данных не запускается

```bash
# Проверьте статус контейнера
docker ps -a | grep app-db

# Посмотрите логи
npm run docker:dev:logs

# Пересоздайте контейнер
npm run docker:dev:down
npm run docker:dev:up
```

### Ошибка подключения к БД

1. Убедитесь что `.env` файл скопирован из `.example`
2. Проверьте что база запущена: `docker ps`
3. Проверьте переменные в `.env` соответствуют docker-compose

### Миграции не применяются

```bash
# Убедитесь что указан правильный DATABASE_URL в .env
# Попробуйте применить с явным указанием окружения
NODE_ENV=development npm run migrate
```

## Production Deployment

Для продакшена:

1. **НЕ используйте** локальные docker-compose файлы
2. Используйте managed PostgreSQL (AWS RDS, Google Cloud SQL, Heroku Postgres, etc.)
3. Настройте `.env.production` с реальными production credentials
4. Всегда делайте backup перед применением миграций
5. Используйте SSL подключение: `DATABASE_URL` должен начинаться с `postgresql://` (не `postgres://`)
