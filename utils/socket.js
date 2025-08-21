import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS.split(','),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: `, socket.id);

    io.on('disconnect', (reason) => {
      console.log(`User disconnected (${reason}): ${socket.id}`);
    });

    socket.on('error', (err) => {
      console.error(`Socket error (${socket.id}): ${err}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) throw new Error('Socket.io not initialized. Call initSocket first.');
  return io;
};

// namespace setup helper
export const createNamespace = () => {
  return getIo().of(namespace);
};
