const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const activeClients = new Set();
const activeAgents = new Set();
const clientSocketMap = {};
const socketClientMap = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register_agent', () => {
    activeAgents.add(socket.id);
    console.log('Agent registered:', socket.id);
    socket.emit('client_list', Array.from(activeClients));
    io.emit('agent_status', activeAgents.size > 0);
  });

  socket.on('check_agent_status', () => {
    // console.log('Client checking agent status');
    socket.emit('agent_status', activeAgents.size > 0);
  });

  socket.on('register_client', (clientId) => {
    if (!activeClients.has(clientId)) {
      activeClients.add(clientId);
      clientSocketMap[clientId] = socket.id;
      socketClientMap[socket.id] = clientId;
      io.emit('new_client', clientId);
    }
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send_message', ({ roomId, message, sender }) => {
    io.to(roomId).emit('receive_message', {
      roomId,
      message,
      sender,
      time: new Date().toLocaleTimeString(),
    });
  });

  socket.on('disconnect_agent', () => {
    if (activeAgents.has(socket.id)) {
      activeAgents.delete(socket.id);
      console.log('Agent manually disconnected');
      io.emit('agent_status', activeAgents.size > 0);
    }
  });

  socket.on('disconnect', () => {
    // Agent disconnect
    if (activeAgents.has(socket.id)) {
      activeAgents.delete(socket.id);
      console.log('Agent disconnected');
      io.emit('agent_status', activeAgents.size > 0);
    }

    // Client disconnect
    const clientId = socketClientMap[socket.id];
    if (clientId) {
      activeClients.delete(clientId);
      delete clientSocketMap[clientId];
      delete socketClientMap[socket.id];
      console.log(`Client ${clientId} disconnected`);
      io.emit('client_disconnected', clientId);
    }
  });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
