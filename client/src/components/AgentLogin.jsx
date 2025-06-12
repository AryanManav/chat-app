// AgentLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgentLogin.css'

export default function AgentLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === 'agent' && password === 'agent1234') {
      // ✅ Store login status
      localStorage.setItem('agent_authenticated', 'true');

      // ✅ Only generate agent_id if not already present
      if (!localStorage.getItem('agent_id')) {
        const id = 'agent_' + Date.now();
        localStorage.setItem('agent_id', id);
      }

      navigate('/agent');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
  <div className="loginContainer">
    <h2>Agent Login</h2>
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="loginInput"
      /><br /><br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="loginInput"
      /><br /><br />
      <button type="submit" className="loginBtn">Login</button>
    </form>
  </div>
);

}
