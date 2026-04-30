import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="329128163254-umu19uprmb3f9c9pjravo5aj1knn625s.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
