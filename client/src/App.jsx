
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Chat from './components/Chat.jsx';
import AgentLogin from './components/AgentLogin.jsx';
import AgentPanel from './components/AgentPanel.jsx';

const isAgentAuthenticated = () => localStorage.getItem('agent_authenticated') === 'true';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route
          path="/agent"
          element={isAgentAuthenticated() ? <AgentPanel /> : <Navigate to="/agent-login" />}
        />
        <Route path="/agent-login" element={<AgentLogin />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
