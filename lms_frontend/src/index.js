import React from 'react';
import ReactDOM from 'react-dom/client';
// Keep base styles; Tailwind optional file is available at ./index.tailwind.css
import './index.css';
// Default to existing rich App.js; to use the simple LMS variant, switch to: import App from './App.jsx';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
