import { useEffect, useRef, useState } from "react";

export interface ChatMessage {
  id: number;
  threadId: number;
  senderType: 'user' | 'ai';
  senderId: string | null;
  senderName: string;
  messageText: string;
  createdAt: string;
}

export function useWebSocket(contentId: number | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!contentId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);
    
    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };
    
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message' && data.contentId === contentId) {
          setMessages(prev => [...prev, data.message]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };
    
    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [contentId]);

  const sendMessage = (message: ChatMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'new_message',
        contentId,
        message
      }));
    }
  };

  return { messages, isConnected, sendMessage, setMessages };
}
