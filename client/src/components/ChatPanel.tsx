import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, Bot, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";

interface ChatPanelProps {
  contentId: number;
}

export default function ChatPanel({ contentId }: ChatPanelProps) {
  const [message, setMessage] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: [`/api/chat/${contentId}/messages`],
    enabled: !!contentId,
  });

  const { sendMessage: sendWebSocketMessage, setMessages: setWebSocketMessages } = useWebSocket(contentId);

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", `/api/chat/${contentId}/messages`, {
        messageText,
      });
      return response.json();
    },
    onSuccess: (newMessage) => {
      queryClient.invalidateQueries({ queryKey: [`/api/chat/${contentId}/messages`] });
      sendWebSocketMessage(newMessage);
      setMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const aiResponseMutation = useMutation({
    mutationFn: async (data: { message: string; context: string }) => {
      const response = await apiRequest("POST", `/api/chat/${contentId}/ai-response`, data);
      return response.json();
    },
    onSuccess: (aiMessage) => {
      queryClient.invalidateQueries({ queryKey: [`/api/chat/${contentId}/messages`] });
      sendWebSocketMessage(aiMessage);
      setIsAiTyping(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      setIsAiTyping(false);
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendMessageMutation.mutate(message);
  };

  const handleInviteAI = () => {
    if (!messages || messages.length === 0) return;

    setIsAiTyping(true);
    const context = messages
      .slice(-5) // Get last 5 messages for context
      .map((msg: any) => `${msg.senderName}: ${msg.messageText}`)
      .join("\n");

    aiResponseMutation.mutate({
      message: "Please provide insights based on our discussion",
      context,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) return "now";
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="bg-background dark:bg-dark-bg border-border dark:border-dark-border h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground dark:text-white flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-secondary" />
            <span>Discussion</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleInviteAI}
            disabled={aiResponseMutation.isPending}
            className="text-accent hover:text-accent/80 text-xs font-medium"
          >
            <Bot className="h-4 w-4 mr-1" />
            {aiResponseMutation.isPending ? "Thinking..." : "Invite AI"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-64">
          {isLoading ? (
            <div className="text-center text-muted-foreground dark:text-gray-400">
              Loading messages...
            </div>
          ) : messages?.length === 0 ? (
            <div className="text-center text-muted-foreground dark:text-gray-400">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages?.map((msg: any) => (
              <div key={msg.id} className="flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-2">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {msg.senderType === "ai" ? (
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-accent" />
                    </div>
                  ) : (
                    <>
                      <AvatarImage src={user?.profileImageUrl} alt={msg.senderName} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {msg.senderName[0]}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-sm font-medium ${
                      msg.senderType === "ai" 
                        ? "text-accent" 
                        : "text-foreground dark:text-white"
                    }`}>
                      {msg.senderName}
                    </span>
                    <span className="text-xs text-muted-foreground dark:text-gray-500">
                      {formatMessageTime(msg.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground dark:text-gray-300 break-words">
                    {msg.messageText}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {isAiTyping && (
            <div className="flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-accent" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-accent">AI Assistant</span>
                  <span className="text-xs text-muted-foreground dark:text-gray-500">typing...</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-border dark:border-dark-border p-4">
          <div className="flex items-center space-x-3">
            <Input
              placeholder="Join the discussion..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMessageMutation.isPending}
              className="flex-1 bg-background dark:bg-dark-surface border-border dark:border-dark-border text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-gray-400 text-sm"
            />
            <Button
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending || !message.trim()}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground p-2"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
