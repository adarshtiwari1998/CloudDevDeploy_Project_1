
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const setupWebSocket = () => {
  const token = localStorage.getItem('token');
  // Get the current URL to derive WebSocket URL
  const currentUrl = new URL(window.location.href);
  const wsProtocol = currentUrl.protocol === 'https:' ? 'wss' : 'ws';
  const wsUrl = `${wsProtocol}://${currentUrl.host}/ws?token=${token}`;
  console.log('Connecting to WebSocket:', wsUrl);
  
  try {
    const ws = new WebSocket(wsUrl);
    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    ws.onopen = () => {
      console.log('WebSocket connected to:', wsUrl);
    };
    
    return ws;
  } catch (error) {
    console.error('Failed to create WebSocket:', error);
    throw error;
  }
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
