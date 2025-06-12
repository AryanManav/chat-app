import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../js/socket';
import './AgentPage.css';

export default function AgentApp() {
  const [clients, setClients] = useState([]);
  const [currentClient, setCurrentClient] = useState(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem('agent_chat_messages');
    return stored ? JSON.parse(stored) : {};
  });

  const navigate = useNavigate();

  // Save messages to localStorage on change
  useEffect(() => {
    localStorage.setItem('agent_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('agent_authenticated');
    const agentId = localStorage.getItem('agent_id');

    if (!isAuthenticated || !agentId) {
      navigate('/agent-login');
      return;
    }

    socket.connect();
    socket.emit('register_agent', agentId);

    socket.on('client_list', (clientList) => {
      const unique = [...new Set(clientList)];
      setClients(unique);
      unique.forEach((id) => socket.emit('join_room', id));
    });

    socket.on('receive_message', ({ roomId, sender, message, time }) => {
      setMessages((prev) => {
        const updated = {
          ...prev,
          [roomId]: [...(prev[roomId] || []), { sender, message, time }],
        };
        return updated;
      });

      setClients((prev) => (
        prev.includes(roomId) ? prev : [...prev, roomId]
      ));
    });

    socket.on('new_client', (clientId) => {
      setClients((prev) => {
        if (!prev.includes(clientId)) {
          socket.emit('join_room', clientId);
          return [...prev, clientId];
        }
        return prev;
      });
    });

    socket.on('client_disconnected', (clientId) => {
      setClients((prev) => prev.filter((c) => c !== clientId));
    });

    return () => {
      socket.off('client_list');
      socket.off('receive_message');
      socket.off('new_client');
      socket.off('client_disconnected');
    };
  }, [navigate]);

  const sendAgentMessage = () => {
    if (input.trim() && currentClient) {
      const messageData = {
        roomId: currentClient,
        message: input,
        sender: 'Agent',
        time: new Date().toLocaleTimeString(),
      };

      socket.emit('send_message', messageData);
      setInput('');
      // Don't manually setMessages here. The message will arrive via 'receive_message'
    }
  };


  const disconnectAgent = () => {
    socket.emit('disconnect_agent');
    socket.disconnect();
    localStorage.removeItem('agent_authenticated');
    localStorage.removeItem('agent_id');
    localStorage.removeItem('agent_chat_messages');
    alert('You (Agent) are now offline.');
    navigate('/agent-login');
  };

  return (
    <div className="agentPanel">
      <h1>Agent Panel</h1>
      <button onClick={disconnectAgent} className="logoutBtnTop">Logout</button>

      <div className="panelContent">
        <div className="clientList">
          <h2>Clients</h2>
          <ul>
            {clients.map((id) => (
              <li
                key={id}
                onClick={() => setCurrentClient(id)}
                className={currentClient === id ? 'active' : ''}
              >
                {id}
              </li>
            ))}
          </ul>
        </div>

        <div className="chatSection">
          <h2>Chat with {currentClient}</h2>
          <div className="chatBox">
            {(messages[currentClient] || []).map((msg, idx) => {
              const isAgent = msg.sender !== currentClient;
              return (
                <div
                  key={idx}
                  className={`chatMessage ${isAgent ? 'sent' : 'received'}`}
                >
                  <div className="messageMeta">
                    <strong>{isAgent ? 'You' : msg.sender}</strong>
                    <em className="messageTime">{msg.time}</em>
                  </div>
                  <div className="messageText">{msg.message}</div>
                </div>
              );
            })}
          </div>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="chatInputAgent"
          />
          <button onClick={sendAgentMessage} className="sendBtnAgent">Send</button>
        </div>
      </div>
    </div>
  );

}
