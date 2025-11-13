import './env-loader';

// Парсинг DATABASE_URL используя нативный URL API
const parseDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;

  if (url) {
    try {
      const parsed = new URL(url);
      // Извлекаем путь базы данных (убираем первый слэш)
      const database = parsed.pathname.slice(1) || 'main';

      return {
        host: parsed.hostname || 'localhost',
        port: parseInt(parsed.port || '5432', 10),
        user: parsed.username || 'app',
        password: parsed.password || '',
        database,
      };
    } catch (error) {
      // Если DATABASE_URL некорректный, используем отдельные переменные
      console.warn('Invalid DATABASE_URL format, using separate variables');
    }
  }

  // Fallback на отдельные переменные
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'app',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'main',
  };
};

const dbConfig = parseDatabaseUrl();

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database (распарсенные значения)
  DB_HOST: dbConfig.host,
  DB_PORT: dbConfig.port,
  DB_USER: dbConfig.user,
  DB_PASSWORD: dbConfig.password,
  DB_NAME: dbConfig.database,

  // DATABASE_URL для миграций и внешних инструментов
  // Если не задан, генерируем из отдельных переменных
  DATABASE_URL:
    process.env.DATABASE_URL ||
    `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,

  // Realtime service
  REALTIME_SERVICE_URL:
    process.env.REALTIME_SERVICE_URL || 'http://localhost:3002',
  REALTIME_SERVICE_GRPC_URL:
    process.env.REALTIME_SERVICE_GRPC_URL || 'localhost:50052',
};
