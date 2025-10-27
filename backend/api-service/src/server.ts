import createApp from './app';
import { env } from './config';
import logger from './shared/logger';

const PORT = env.PORT;

const app = createApp();

app.listen(PORT, () => {
  logger.info(`API service running on port ${PORT}`);
});
