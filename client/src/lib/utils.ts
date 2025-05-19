
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const setupWebSocket = () => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const wsUrl = `${wsProtocol}://${window.location.host}/ws`;
  console.log('Connecting to WebSocket:', wsUrl);
  
  try {
    const ws = new WebSocket(wsUrl);
    
    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
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
    
    return ws;
  } catch (error) {
    console.error('Failed to create WebSocket:', error);
    throw error;
  }
};

export { setupWebSocket };
