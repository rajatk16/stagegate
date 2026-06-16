import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV,
  port: Number(process.env.PORT),
  apiPrefix: process.env.API_PREFIX,
  logLevel: process.env.LOG_LEVEL,
}));
