import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';

// Restore persisted theme
try {
  const saved = localStorage.getItem('avi-theme');
  if (saved === 'kali') document.documentElement.setAttribute('data-theme', 'kali');
} catch { /* storage blocked */ }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
