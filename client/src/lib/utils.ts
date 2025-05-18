
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const setupWebSocket = () => {
  const token = localStorage.getItem('token');
  const serverUrl = new URL('53478cc1-4697-4791-8519-382b86e24ea0-00-1in99gcpefkg1.pike.replit.dev');
  const protocol = serverUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${serverUrl.host}/ws?token=${token}`;
  console.log('Connecting to WebSocket:', wsUrl);
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
