import { registerAs } from '@nestjs/config';

const defaultCorsOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

export default registerAs('app', () => ({
  corsOrigins: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : defaultCorsOrigins,
}));
