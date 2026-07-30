import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { startDailyNightlyAuditScheduler } from './services/cronService.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} bound to 0.0.0.0`);
  startDailyNightlyAuditScheduler();
});
