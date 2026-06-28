import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global fetch interceptor to route /api calls to remote backend if VITE_API_URL is set
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  const baseUrl = import.meta.env.VITE_API_URL || '';
  
  if (typeof resource === 'string' && resource.startsWith('/api/')) {
    resource = baseUrl + resource;
  }
  
  return originalFetch(resource, config);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
