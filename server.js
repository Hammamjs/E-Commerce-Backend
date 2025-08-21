import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import cluster from 'cluster';
import os from 'os';

import { Connect } from './config/index.js';
import { globalErrorHandler } from './middleware/globalError.js';
import mountRoutes from './routes/mountRoutes.js';
import applyMiddelwares from './middleware/applyMiddlewares.js';
import appListeners from './utils/appListeners.js';

import { initSocket } from './utils/socket.js';
// dotenv
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

// Constants
// const PORT = process.env.NODE_ENV || 3500;
const CPU_COUNT = os.cpus().length || 1;
const isProduction = process.env.NODE_ENV === 'production';

const useCluster = isProduction && cluster.isPrimary && !process.env.RENDER;

if (useCluster) {
  console.log(`Master ${process.pid} is running`);
  for (let i = 0; i < CPU_COUNT; i++) {
    cluster.fork();
  }

  cluster.on('worker', (worker) => {
    info(`Worker ${worker.process.pid} died`);
    cluster.fork(); // restart worker
  });
} else {
  const initializeServer = () => {
    try {
      // Connect to db
      Connect();

      const app = express();
      const initServer = createServer(app);
      initSocket(initServer);

      // middlewares
      applyMiddelwares(app);

      // endpoints
      mountRoutes(app);

      app.use(globalErrorHandler);

      appListeners(app);
    } catch (err) {
      console.error(`console initialization failed ${err}`);
      process.exit(1);
    }
  };
  initializeServer();
}

const createApp = async () => {
  const app = express();
  await Connect();
  applyMiddelwares(app);
  mountRoutes(app);
  app.use(globalErrorHandler);
  return app;
};

// for dev/testing - IIFE
const devAppPromise =
  process.env.NODE_ENV !== 'production' ? createApp() : null;

export { createApp };
export default devAppPromise;
