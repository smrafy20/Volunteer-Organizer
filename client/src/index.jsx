import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // This will need to be updated to App.jsx later
import { AuthProvider } from './context/AuthContext'; // This will need to be updated later
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
); 