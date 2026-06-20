import { io } from 'socket.io-client';

// Connect to NestJS backend on port 3001
export const socket = io('http://localhost:3001', {
  autoConnect: true,
  reconnection: true,
});
