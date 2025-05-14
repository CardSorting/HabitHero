import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import Header from "@/components/Header";

// Helper function for API requests
async function apiClient<T>(url: string, options: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include'
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text || response.statusText}`);
  }
  
  return response.json();
}

// Types
interface Message {
  role: "user" | "assistant";
  content: string;
}

function TherapyCompanion() {
  const { toast } = useToast();
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [fullResponse, setFullResponse] = useState("");
  const [typingSpeed, setTypingSpeed] = useState({ min: 10, max: 25 }); // Milliseconds per character

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, displayedResponse]);
  
  // Handle typing animation effect
  useEffect(() => {
    if (isTyping && fullResponse) {
      if (displayedResponse.length < fullResponse.length) {
        const randomDelay = Math.floor(
          Math.random() * (typingSpeed.max - typingSpeed.min + 1) + typingSpeed.min
        );
        
        const timeout = setTimeout(() => {
          setDisplayedResponse(
            fullResponse.substring(0, displayedResponse.length + 1)
          );
        }, randomDelay);
        
        return () => clearTimeout(timeout);
      } else {
        // When typing is complete, update messages with the full response
        setIsTyping(false);
        setMessages(prev => [
          ...prev.slice(0, -1), // Remove the temporary message
          { role: "assistant", content: fullResponse }
        ]);
        setFullResponse("");
        setDisplayedResponse("");
      }
    }
  }, [isTyping, fullResponse, displayedResponse, typingSpeed]);

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiClient<{response: string}>("/api/therapy/chat", {
        method: "POST",
        body: JSON.stringify({
          message,
          conversationHistory: messages
        })
      });
    },
    onSuccess: (data) => {
      // Start the typing animation
      setFullResponse(data.response);
      setDisplayedResponse("");
      setIsTyping(true);
      
      // Add a temporary message that will be replaced with the typed response
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
      console.error("Chat error:", error);
    }
  });

  // No other mutations needed for the simplified chat-only interface

  // Handle chat message submission
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = { role: "user" as const, content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    
    chatMutation.mutate(inputMessage);
  };

  return (
    <div className="min-h-screen pb-16">
      <Header title="Skills Coach" />

      {/* Main chat content area */}
      <div className="mx-4 mb-24 pt-2">
        <div className="space-y-4 mb-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p className="mb-1">How are you feeling today?</p>
              <p className="text-sm">Start chatting with your DBT therapy companion</p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`rounded-lg p-3 max-w-[85%] ${
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    }`}
                  >
                    {/* If this is the last message and we're typing, show the typing animation */}
                    {isTyping && index === messages.length - 1 && msg.role === "assistant" ? (
                      <p className="whitespace-pre-wrap">{displayedResponse}
                        <span className="inline-block animate-pulse">▋</span>
                      </p>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {chatMutation.isPending && !isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3 max-w-[85%]">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Fixed chat input at the bottom for immediate access */}
      <div className="fixed bottom-16 left-0 right-0 z-10 bg-background border-t shadow-lg">
        <div className="mx-4 py-3 relative">
          <Textarea 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask your therapy companion..."
            className="min-h-[60px] pr-10 resize-none w-full"
            disabled={chatMutation.isPending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            className="absolute bottom-5 right-2 h-8 w-8 p-0"
            onClick={handleSendMessage}
            disabled={chatMutation.isPending || !inputMessage.trim()}
            variant="secondary"
          >
            {chatMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TherapyCompanion;