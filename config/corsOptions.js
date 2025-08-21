import { allowedOrigins } from './allowedOrigins.js';
import { log } from '../utils/logSatuts.js';
import { config } from 'dotenv';

config();
export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV === 'development') {
      log.warn(`Blocked Origin: ${origin}`);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
};
