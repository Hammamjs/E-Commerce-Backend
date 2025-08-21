import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const isDevelopment = process.env.NODE_ENV;
export const allowedOrigins = [
  ...(isDevelopment ? ['http://localhost:5173', 'http://127.0.0.1:5173'] : []),
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : []),
];
