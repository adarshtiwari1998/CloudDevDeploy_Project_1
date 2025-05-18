
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const setupWebSocket = () => {
  const token = localStorage.getItem('token');
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = process.env.SERVER_URL || window.location.host;
  const wsUrl = `${protocol}//${host}/ws?token=${token}`;
  const ws = new WebSocket(wsUrl);
  
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
