import { useState } from 'react';
import PopupChat from './PopupChat';
// import "./PopupChat.css";

export default function Chat() {
  const [started, setStarted] = useState(() => {
    // Check if user already has an ID
    return !!localStorage.getItem('client_id');
  });

  const handleStart = () => {
    const id = 'client_' + Date.now();
    localStorage.setItem('client_id', id);
    setStarted(true);
  };

  return (
    <>
    <div>
      {!started ? (
        <button className='in-btn' onClick={handleStart}>Connect with us</button>
      ) : (
        <PopupChat />
      )}
    </div>

    <style>
      {`
        .in-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        
        .in-btn:hover {
          background-color: #0056b3;
        }
      `}
    </style>
  </>
  );
}

