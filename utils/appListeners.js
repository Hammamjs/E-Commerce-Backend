import mongoose from 'mongoose';
import { log } from './logSatuts.js';
const appListeners = (app) => {
  const PORT = process.env.PORT || 3500;
  let server = null;

  const { success, error, info } = log;

  // if Connection failed stop all procceses
  mongoose.connection.once('open', () => {
    success('Database connection established');
    startServer();
  });

  // Server start function
  const startServer = () => {
    server = app.listen(PORT, () => {
      info(`Server running on port ${PORT}`);
      info(`Environment ${process.env_NODE_ENV || 'development'}`);
    });
  };

  // Handle server error
  server?.on('error', (err) => {
    error(`Server error ${err.message}`);
    if (err.code === 'EADDRINUSE') {
      error(`Port ${PORT} is already in use`);
    }
    process.exit(1);
  });

  const shutdown = (signal) => {
    info(`${signal} recieved. Shutting down gracefully.`);

    if (server) {
      server.close(() => {
        info('server closed');
        // Then close database connection
        mongoose.connection.close(false, () => {
          info('Database connection closed');
          process.exit(0);
        });
      });
    } else {
      mongoose.connection.close(false, () => {
        info('Database connection closed');
        process.exit(0);
      });
    }
    // Force shutdown if takes too long
    setTimeout(() => {
      error('Force shutdown due to timeout');
      process.exit(0);
    }, 5000);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

export default appListeners;
