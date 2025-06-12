// src/widget.js
import ReactDOM from 'react-dom/client';
import Chat from './components/Chat'; // ✅ Correct relative path

const containerId = 'react-chat-widget-container';

function injectWidget() {
  if (document.getElementById(containerId)) return;

  const container = document.createElement('div');
  container.id = containerId;
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  root.render(<Chat />);
}

injectWidget();
