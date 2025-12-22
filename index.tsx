import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Starting App Mount...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Could not find root element");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("App Mounted Successfully");
} catch (error) {
  console.error("FATAL: App failed to mount", error);
  rootElement.innerHTML = `<div style="padding: 20px; color: red;"><h1>App Crashed</h1><pre>${error}</pre></div>`;
}
