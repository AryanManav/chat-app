import { io } from 'socket.io-client';
//  Really important asyncronous
export const socket = io('https://chat-app-tfjr.onrender.com', {
  autoConnect: false, // wait until ready
  reconnectionAttempts: 5,
  timeout: 5000,
});
