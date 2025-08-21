import mongoose from 'mongoose';
const appListeners = (app) => {
  const PORT = process.env.PORT || 3500;
  let server = null;

  // if Connection failed stop all procceses
  mongoose.connection.once('open', () => {
    console.log('Database connection established');
    startServer();
  });

  // Server start function
  const startServer = () => {
    server = app.listen(PORT, () => {
      console.info(`Server running on port ${PORT}`);
      console.info(`Environment ${process.env_NODE_ENV || 'development'}`);
    });
  };

  // Handle server error
  server?.on('error', (err) => {
    console.error(`Server error ${err.message}`);
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
    }
    process.exit(1);
  });

  const shutdown = (signal) => {
    console.info(`${signal} recieved. Shutting down gracefully.`);

    if (server) {
      server.close(() => {
        console.info('server closed');
        // Then close database connection
        mongoose.connection.close(false, () => {
          console.info('Database connection closed');
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
      console.error('Force shutdown due to timeout');
      process.exit(0);
    }, 5000);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

export default appListeners;
