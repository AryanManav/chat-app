import { useEffect, useState } from 'react';
import { socket } from '../js/socket';
// import './PopupChat.css';

export default function PopupChat() {
  const [clientId] = useState(() => localStorage.getItem('client_id'));


  const [chat, setChat] = useState(() => {
    const saved = localStorage.getItem('chat_' + clientId);
    return saved ? JSON.parse(saved) : [];
  });

  const [message, setMessage] = useState('');
  const [agentOnline, setAgentOnline] = useState(null); // null = unknown/loading
  const [loading, setLoading] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', query: '' });

  // Connection flow
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log('Socket connected:', socket.id);

      socket.emit('check_agent_status');

      socket.on('agent_status', (status) => {
        console.log('📶 Agent status received:', status);
        setAgentOnline(status);
        setLoading(false);

        if (status) {
          socket.emit('join_room', clientId);
          socket.emit('register_client', clientId);
        }
      });

      socket.on('receive_message', (data) => {
        if (data.roomId === clientId) {
          const oldChat = JSON.parse(localStorage.getItem('chat_' + clientId)) || [];
          const newChat = [...oldChat, data];

          // Deduplicate here
          const unique = [];
          const seen = new Set();
          for (const msg of newChat) {
            const id = JSON.stringify(msg);
            if (!seen.has(id)) {
              seen.add(id);
              unique.push(msg);
            }
          }

          setChat(unique);
          localStorage.setItem('chat_' + clientId, JSON.stringify(unique));
        }
      });

    };


    if (socket.connected) {
      handleConnect();
    } else {
      socket.on('connect', handleConnect);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('agent_status');
      socket.off('receive_message');
    };

  }, [clientId]);



  const sendMessage = () => {
    if (message.trim()) {
      const msg = {
        roomId: clientId,
        message,
        sender: clientId,
        time: new Date().toLocaleTimeString(),
      };

      socket.emit('send_message', msg);

      const newChat = [...chat, msg];
      // localStorage.setItem('chat_' + clientId, JSON.stringify(newChat));
      // setChat(newChat);
      setMessage('');
    }
  };

  const submitForm = (e) => {
    e.preventDefault();
    console.log('Offline form data:', formData);
    setFormSubmitted(true);
  };

  return (
    <>
      <div className="popupStyle">
        <h4>Support Chat</h4>

        {agentOnline ? (
          <>
            <div className="chatBoxStyle">
              {(JSON.parse(localStorage.getItem('chat_' + clientId)) || []).map((msg, idx) => (
                msg.sender === clientId ? (
                  <div key={idx} className="chatMessage sent"><strong>You</strong>{msg.message}</div>
                ) : (
                  <div key={idx} className="chatMessage received"><strong>{msg.sender}</strong>{msg.message}</div>
                )
              ))}

            </div>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="chatInput"
            />
            <button onClick={sendMessage} className="sendBtn">Send</button>
          </>
        ) : formSubmitted ? (
          <p>Thanks! We’ll contact you soon.</p>
        ) : (
          <form onSubmit={submitForm}>
            <p>No agents are online. Leave a message:</p>
            <input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="formInput"
            /><br />
            <input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="formInput"
            /><br />
            <textarea
              placeholder="Your question"
              value={formData.query}
              onChange={(e) => setFormData({ ...formData, query: e.target.value })}
              required
              className="formInput"
            /><br />
            <button type="submit" className="sendBtn">Submit</button>
          </form>
        )}
      </div>

      {/* Inline CSS */}
      <style>
        {`

      @import url('https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap');
        .popupStyle {
        font-family: "Work Sans", sans-serif;
          width: 300px;
          padding: 16px;
          
          background: #eaede5;
          border-radius: 5px;
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }

        .chatBoxStyle strong{
          color: #2e4f23;
          font-weight: 500;
        }

        .chatMessage {
  margin: 5px 0;
  padding: 6px 10px;
  border-radius: 5px;
  max-width: 80%;
}

.chatMessage.sent {
  background-color: #eaede5;
  text-align: right;
  margin-left: auto;
}

.chatMessage.received {
  background-color: #f1f1f1;
  text-align: left;
  margin-right: auto;
}


        .popupStyle h4 {
          margin-bottom: 12px;
          color: #2e4f23;
          font-weight: 500;
          font-size: 18px;
        }

        .chatBoxStyle {
          height: 200px;
          overflow-y: auto;
          border: 1px solid #2e4f23;
          padding: 8px;
          margin-bottom: 10px;
          border-radius: 5px;
          background-color: white;
        }

        .chatInput {
        font-family: "Work Sans", sans-serif;
          width: 94%;
          padding: 8px;
          margin-top: 8px;
          margin-bottom: 8px;
          border-radius: 5px;
          border: 1px solid #2e4f23;
          font-size: 14px;
        }

        .formInput {
        font-family: "Work Sans", sans-serif;
          width: 94%;
          padding: 8px;
          margin-bottom: 10px;
          border-radius: 5px;
          border: 1px solid #2e4f23;
          font-size: 14px;
        }

        .sendBtn {
        font-family: "Work Sans", sans-serif;
          padding: 8px 16px;
          background: #2e4f23;
          color: white;
          font-weight: 400;
          border: none;
          border-radius: 5px;
          font-size: 14px;
          cursor: pointer;
        }

        .sendBtn:hover {
          background:rgb(33, 58, 25);
        }
      `}
      </style>
    </>
  );

}

