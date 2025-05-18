
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const setupWebSocket = () => {
  const token = localStorage.getItem('token');
  const isSecure = window.location.protocol === 'https:';
  const wsProtocol = isSecure ? 'wss' : 'ws';
  const host = window.location.host || '0.0.0.0:5000';
  const wsUrl = `${wsProtocol}://${host}/ws?token=${token}`;
  console.log('Connecting to WebSocket:', wsUrl);
  const ws = new WebSocket(wsUrl, 'vite-hmr');
  
  ws.onopen = () => {
    console.log('WebSocket connected to:', wsUrl);
  };

  ws.onmessage = (event) => {
    console.log('Received:', event.data);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
    setTimeout(setupWebSocket, 5000); // Reconnect after 5 seconds
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return ws;
};

export { setupWebSocket };
