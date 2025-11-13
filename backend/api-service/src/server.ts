import createApp from './app';
import { env } from './config';
import logger from './shared/logger';
import { startGrpcServer } from './grpc-server';

const PORT = env.PORT;
const GRPC_PORT = 50051;

const app = createApp();

app.listen(PORT, () => {
  logger.info(`API service running on port ${PORT}`);
});

// Start gRPC server
startGrpcServer(GRPC_PORT);
