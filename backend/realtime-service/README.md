# Realtime Service

WebSocket server for real-time poll updates following FSD (Feature-Sliced Design) architecture.

## Architecture

This service follows the same FSD structure as `api-service`:

```
src/
├── app/                    # Application layer
│   ├── index.ts           # App initialization
│   ├── middlewares.ts     # HTTP middlewares
│   └── routes.ts          # HTTP routes setup
├── config/                # Configuration layer
│   ├── env.ts            # Environment config
│   ├── constants.ts      # Service constants
│   └── index.ts
├── modules/               # Feature modules
│   ├── polls/            # Poll results queries
│   │   ├── polls.repository.ts
│   │   ├── polls.service.ts
│   │   └── polls.types.ts
│   └── websocket/        # WebSocket management
│       ├── websocket.manager.ts
│       ├── websocket.routes.ts
│       └── websocket.types.ts
├── shared/               # Shared utilities
│   ├── db.ts            # PostgreSQL connection
│   ├── env-loader.ts    # Environment loader
│   ├── logger.ts        # Logger utility
│   └── errors/
│       ├── app-error.ts
│       └── error-handler.ts
└── index.ts             # Entry point
```

## Overview

The realtime-service is a standalone microservice that:

- Manages WebSocket connections for real-time updates
- Handles poll subscriptions from clients
- Broadcasts poll results when votes are cast
- Provides an HTTP API for inter-service communication

## Ports

- **3001**: WebSocket server (client connections)
- **3002**: HTTP API (notification endpoint for api-service)

## Installation

```bash
npm install
```

## Configuration

Environment variables (`.env.development`):

```env
NODE_ENV=development
WS_PORT=3001
HTTP_PORT=3002
DATABASE_URL=postgresql://app:secret@localhost:5432/main_dev
```

## Running the Service

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Docker (Recommended)

```bash
cd ../../docker
docker-compose -f docker-compose.dev.yml up
```

All services (db, api, realtime) will start together.

## WebSocket Protocol

### Client → Server Messages

**Subscribe to poll:**

```json
{
  "type": "subscribe",
  "payload": { "poll_id": 1 }
}
```

**Unsubscribe from poll:**

```json
{
  "type": "unsubscribe",
  "payload": { "poll_id": 1 }
}
```

### Server → Client Messages

**Poll update (broadcast):**

```json
{
  "type": "poll_update",
  "payload": {
    "poll_id": 1,
    "results": {
      "id": 1,
      "question": "What's your favorite color?",
      "options": [
        { "id": 1, "text": "Red", "vote_count": 5 },
        { "id": 2, "text": "Blue", "vote_count": 3 }
      ],
      "total_votes": 8
    }
  }
}
```

**Subscribe confirmation:**

```json
{
  "type": "subscribe",
  "payload": { "poll_id": 1 }
}
```

**Error message:**

```json
{
  "type": "error",
  "payload": { "message": "Invalid poll_id" }
}
```

## HTTP API

### POST /api/notify/poll/:pollId

Triggers a broadcast to all subscribers of a specific poll. Called by api-service after vote operations.

**Request:**

```bash
curl -X POST http://localhost:3002/api/notify/poll/1
```

**Response:**

```json
{
  "success": true,
  "pollId": 1,
  "subscriberCount": 5
}
```

### GET /health

Health check endpoint that verifies service health and dependencies.

**Response:**

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

See [Health Checks Documentation](../../HEALTH_CHECKS.md) for more details.

## Integration with API Service

The api-service automatically notifies realtime-service when:

- A vote is created
- A vote is updated
- A vote is deleted

This is handled through:

1. `api-service/src/shared/realtime-notifier.ts` - HTTP client
2. `api-service/src/modules/votes/votes.service.ts` - Notification calls

**Flow:**

```
User votes → API Service saves to DB → API Service notifies Realtime Service
→ Realtime Service fetches results → Broadcasts to WebSocket clients
```

## Data Flow Example

**Time | User A | User B | Realtime Service**

```
t0  | Opens poll #1       | Opens poll #1       |
    | WS connects         | WS connects         |
    | → subscribe(1)      | → subscribe(1)      | subscriptions[1] = {A, B}
t1  | Casts vote          |                     |
    | POST /api/votes     |                     |
t2  |                     |                     | ← Receives HTTP notify
    |                     |                     | Fetches fresh results
    |                     |                     | Broadcasts to {A, B}
t3  | ← Receives update   | ← Receives update   |
    | UI updates          | UI updates          |
```

## Frontend Integration

The frontend (`poll-app`) uses `useWebSocket` composable:

```typescript
const { isConnected, subscribe } = useWebSocket({
  pollId: 1,
  onUpdate: results => {
    // Update UI with new results
    pollData.value = results;
  },
});
```

Connection URL: `ws://localhost:3001`

## Development

The service uses:

- **ws** - WebSocket library
- **express** - HTTP server for notifications
- **pg** - PostgreSQL client

## Monitoring

- Total connections: `GET /health`
- Logs show subscription/unsubscription events
- Logs show broadcast success/failure counts

## FSD Principles

Following Feature-Sliced Design:

- **app/** - Application initialization and setup
- **modules/** - Independent feature modules (polls, websocket)
- **shared/** - Cross-cutting concerns (db, logger, errors)
- **config/** - Configuration and constants

Each layer has clear responsibilities and dependencies flow downward.
