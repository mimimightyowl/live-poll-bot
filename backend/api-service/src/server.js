const express = require('express');
const pool = require('./db');
const errorHandler = require('./errors/errorHandler');

// Импорт маршрутов
const usersRoutes = require('./routes/users');

const app = express();
app.use(express.json());

// Подключение маршрутов
app.use('/api/users', usersRoutes);

// Простой тестовый эндпоинт для проверки работы сервера
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API service is running',
    timestamp: new Date().toISOString(),
  });
});

// Централизованная обработка ошибок (всегда в конце)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API service running on port ${PORT}`);
});
