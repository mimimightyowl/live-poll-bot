## Быстрый старт (после клонирования)

### Требования

- Docker + Docker Compose
- Node.js 18+

### Запуск окружения разработки (одной командой)

Запустит PostgreSQL в Docker, установит зависимости внутри контейнера, применит миграции и поднимет API в watch-режиме.

```bash
npm run dev:stack
```

Приложение: `http://localhost:3000`

Остановка:

```bash
npm run docker:dev:down
```

### Запуск тестового окружения

Поднимет отдельную БД и API на 3001, установит зависимости внутри контейнера, применит миграции.

```bash
npm run test:stack
```

Остановка:

```bash
npm run docker:test:down
```

## Миграции

Создать новую миграцию (файл появится в `src/shared/infra/migrations`):

```bash
npm run migrate:create -- add_new_table
```

Применить миграции вручную (обычно не требуется, т.к. dev/test стеки применяют их автоматически):

```bash
npm run migrate
```

Откатить последнюю миграцию (по необходимости):

```bash
npm run migrate:down
```

## Переменные окружения

Сервис читает `.env.{NODE_ENV}`. Для локальной разработки достаточно значений по умолчанию из Docker Compose. При необходимости создайте файлы `.env.development` / `.env.test`.

Ключевые переменные для подключения к БД выставляются контейнерами:

- `DATABASE_URL=postgresql://app:secret@db:5432/main_dev` (dev)
- `DATABASE_URL=postgresql://app:secret@db-test:5432/main_test` (test)

## Полезные команды

- Запустить только Docker стек разработки без логов API:

```bash
npm run docker:dev:up
```

- Сборка продакшена и запуск (вне Docker):

```bash
npm run build && npm run start
```
