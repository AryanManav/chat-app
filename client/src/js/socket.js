import { io } from 'socket.io-client';
//  Really important asyncronous
export const socket = io('http://localhost:3001', {
  autoConnect: false, // wait until ready
  reconnectionAttempts: 5,
  timeout: 5000,
});
