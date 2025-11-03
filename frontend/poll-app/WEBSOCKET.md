# WebSocket Integration

## Обзор

Poll-app использует WebSocket для получения обновлений результатов голосования в реальном времени от realtime-service.

## Конфигурация

### URL подключения

По умолчанию: `ws://localhost:3002`

Настраивается через переменную окружения:

```env
VITE_WS_URL=ws://localhost:3002
```

## Протокол

### Формат сообщений

Все сообщения передаются в формате JSON:

```typescript
interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
}
```

### Типы сообщений

#### 1. Subscribe (клиент → сервер)

Подписка на обновления конкретного опроса:

```json
{
  "type": "subscribe",
  "payload": {
    "poll_id": 1
  }
}
```

#### 2. Unsubscribe (клиент → сервер)

Отписка от обновлений опроса:

```json
{
  "type": "unsubscribe",
  "payload": {
    "poll_id": 1
  }
}
```

#### 3. Poll Update (сервер → клиент)

Обновление результатов опроса:

```json
{
  "type": "poll_update",
  "payload": {
    "poll_id": 1,
    "results": {
      "id": 1,
      "question": "What's your favorite color?",
      "created_by": 1,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "options": [
        {
          "id": 1,
          "text": "Red",
          "vote_count": 10
        },
        {
          "id": 2,
          "text": "Blue",
          "vote_count": 15
        }
      ],
      "total_votes": 25
    }
  }
}
```

#### 4. Error (сервер → клиент)

Сообщение об ошибке:

```json
{
  "type": "error",
  "payload": {
    "message": "Invalid poll ID"
  }
}
```

## Жизненный цикл соединения

### 1. Подключение

```
Client --[WebSocket Connect]--> Server
Server --[Connection Established]--> Client
```

### 2. Подписка

```
Client --[Subscribe Message]--> Server
Server --[Initial Poll Update]--> Client
```

### 3. Обновления

```
[Vote Created via API]
Server --[Poll Update]--> All Subscribed Clients
```

### 4. Отключение

```
Client --[Unsubscribe Message]--> Server
Client --[WebSocket Close]--> Server
```

## Реализация

### useWebSocket Composable

Основной функционал WebSocket инкапсулирован в composable `useWebSocket.ts`:

```typescript
import { useWebSocket } from '@/composables/useWebSocket';

const { isConnected, subscribe, unsubscribe } = useWebSocket({
  pollId: 1,
  onUpdate: results => {
    // Handle new results
  },
  onError: error => {
    // Handle error
  },
  reconnectInterval: 3000, // ms
});
```

### Функции

- **Автоподключение**: Автоматически подключается при создании
- **Автоподписка**: Если указан `pollId`, автоматически подписывается на обновления
- **Реконнект**: Автоматически переподключается при разрыве соединения
- **Очистка**: Автоматически отключается при размонтировании компонента

### Состояния

- `isConnected: Ref<boolean>` - статус подключения
- `isReconnecting: Ref<boolean>` - идёт ли попытка переподключения
- `error: Ref<string | null>` - текущая ошибка

### Методы

- `connect()` - вручную подключиться
- `disconnect()` - вручную отключиться
- `subscribe(pollId: number)` - подписаться на опрос
- `unsubscribe(pollId: number)` - отписаться от опроса
- `send(message: WebSocketMessage)` - отправить произвольное сообщение

## Обработка ошибок

### Потеря соединения

При потере соединения:

1. `isConnected` становится `false`
2. `isReconnecting` становится `true`
3. Через `reconnectInterval` (по умолчанию 3000ms) происходит попытка переподключения
4. При успешном переподключении автоматически восстанавливаются все подписки

### Ошибки сервера

При получении сообщения с типом `error`:

1. Ошибка записывается в `error.value`
2. Вызывается callback `onError` (если указан)
3. Соединение остаётся активным

## Производительность

### Оптимизация

1. **Единое соединение**: Для всех опросов используется одно WebSocket-соединение
2. **Подписка по требованию**: Подписка создаётся только для активно просматриваемых опросов
3. **Автоматическая отписка**: При уходе со страницы автоматически происходит отписка

### Рекомендации

- Подписывайтесь только на нужные опросы
- Не забывайте отписываться при уходе со страницы
- Используйте composable в корневом компоненте view для управления подписками

## Тестирование

### Локальное тестирование

```bash
# Запустите realtime-service
cd backend/realtime-service
npm run dev

# В другом терминале запустите poll-app
cd frontend/poll-app
npm run dev
```

### Проверка подключения

Откройте DevTools → Network → WS и убедитесь, что WebSocket-соединение установлено.

### Симуляция обновлений

Проголосуйте через интерфейс или отправьте голос через API - результаты должны обновиться в реальном времени во всех открытых вкладках.
