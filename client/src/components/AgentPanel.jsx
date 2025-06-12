// AgentPanel.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../js/socket';
import AgentPage from './AgentPage.jsx';
import './AgentPanel.css';


export default function AgentPanel() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket.connected) socket.connect();
    socket.emit('register_agent');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('agent_authenticated');
    socket.emit('disconnect_agent');
    navigate('/agent-login');

  };

  return (
    <div className="container">
      <AgentPage />
    </div>
  );

}
