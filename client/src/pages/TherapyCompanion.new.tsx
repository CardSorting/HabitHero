import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Send, MessageSquare, Sparkles, Brain, HeartHandshake } from "lucide-react";
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

interface CopingStrategy {
  emotion: string;
  intensity: string;
  strategy: string;
}

function TherapyCompanion() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("chat");
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [fullResponse, setFullResponse] = useState("");
  const [typingSpeed, setTypingSpeed] = useState({ min: 10, max: 25 }); // Milliseconds per character
  
  // Coping strategy state
  const [emotion, setEmotion] = useState("");
  const [intensity, setIntensity] = useState("5");
  const [copingStrategies, setCopingStrategies] = useState<CopingStrategy[]>([]);

  // Reflection state
  const [reflectionData, setReflectionData] = useState({
    todayGoal: "",
    todayHighlight: "",
    gratitude: "",
    dbtSkillUsed: ""
  });
  const [reflectionAnalysis, setReflectionAnalysis] = useState("");

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

  // Coping strategy mutation
  const copingStrategyMutation = useMutation({
    mutationFn: async ({ emotion, intensity }: { emotion: string, intensity: string }) => {
      return apiClient<{ copingStrategy: string }>("/api/therapy/coping-strategy", {
        method: "POST",
        body: JSON.stringify({
          emotion,
          intensity
        })
      });
    },
    onSuccess: (data, variables) => {
      setCopingStrategies(prev => [
        { 
          emotion: variables.emotion, 
          intensity: variables.intensity, 
          strategy: data.copingStrategy 
        },
        ...prev.slice(0, 4) // Keep only 5 most recent strategies
      ]);
      setEmotion("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to get coping strategy. Please try again.",
        variant: "destructive"
      });
      console.error("Coping strategy error:", error);
    }
  });

  // Reflection analysis mutation
  const reflectionAnalysisMutation = useMutation({
    mutationFn: async (reflection: typeof reflectionData) => {
      return apiClient<{ analysis: string }>("/api/therapy/analyze-reflection", {
        method: "POST",
        body: JSON.stringify({
          reflection
        })
      });
    },
    onSuccess: (data) => {
      setReflectionAnalysis(data.analysis);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to analyze reflection. Please try again.",
        variant: "destructive"
      });
      console.error("Reflection analysis error:", error);
    }
  });

  // Handle chat message submission
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = { role: "user" as const, content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    
    chatMutation.mutate(inputMessage);
  };

  // Handle getting coping strategy
  const handleGetCopingStrategy = () => {
    if (!emotion.trim()) {
      toast({
        title: "Input required",
        description: "Please enter an emotion to get a coping strategy",
        variant: "destructive"
      });
      return;
    }
    
    copingStrategyMutation.mutate({ emotion, intensity });
  };

  // Handle reflection form submission
  const handleReflectionAnalysis = () => {
    if (!reflectionData.todayGoal || !reflectionData.todayHighlight) {
      toast({
        title: "Input required",
        description: "Please fill out at least the goal and highlight fields",
        variant: "destructive"
      });
      return;
    }
    
    reflectionAnalysisMutation.mutate(reflectionData);
  };

  // Handle reflection form input changes
  const handleReflectionChange = (field: keyof typeof reflectionData, value: string) => {
    setReflectionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen pb-16">
      <Header title="Therapy Companion" />

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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mx-4 mb-24">
        <TabsList className="grid w-full grid-cols-3 sticky top-0 z-10 bg-background">
          <TabsTrigger value="chat" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="coping" className="flex items-center gap-1">
            <Brain className="h-4 w-4" />
            <span>Coping</span>
          </TabsTrigger>
          <TabsTrigger value="reflection" className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            <span>Reflect</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Chat Tab */}
        <TabsContent value="chat" className="pt-2">
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
        </TabsContent>
        
        {/* Coping Strategies Tab */}
        <TabsContent value="coping" className="pt-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                DBT Coping Strategies
              </CardTitle>
              <CardDescription>
                Get personalized DBT coping strategies for specific emotions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-3 items-end">
                <div className="col-span-2">
                  <label htmlFor="emotion" className="text-sm font-medium mb-1 block">
                    Emotion
                  </label>
                  <div className="relative">
                    <Input
                      id="emotion"
                      value={emotion}
                      onChange={(e) => setEmotion(e.target.value)}
                      placeholder="e.g., Anxiety, Anger, Sadness"
                      disabled={copingStrategyMutation.isPending}
                      className="pr-8"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && emotion.trim()) {
                          handleGetCopingStrategy();
                        }
                      }}
                    />
                    {emotion && !copingStrategyMutation.isPending && (
                      <Button 
                        type="button"
                        variant="ghost"
                        className="absolute right-0 top-0 h-full px-3 py-0"
                        onClick={() => setEmotion("")}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 hover:opacity-100">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="intensity" className="text-sm font-medium mb-1 block">
                    Intensity (1-10)
                  </label>
                  <Input
                    id="intensity"
                    type="number"
                    min="1"
                    max="10"
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value)}
                    disabled={copingStrategyMutation.isPending}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && emotion.trim()) {
                        handleGetCopingStrategy();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleGetCopingStrategy}
                  disabled={copingStrategyMutation.isPending || !emotion.trim()}
                  className="flex gap-1 items-center justify-center"
                >
                  {copingStrategyMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    "Get Strategy"
                  )}
                </Button>
              </div>
              
              <div className="space-y-3 mt-4">
                {copingStrategies.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    <p>No coping strategies yet</p>
                    <p className="text-sm">Enter an emotion to get personalized strategies</p>
                  </div>
                ) : (
                  copingStrategies.map((strategy, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="bg-primary h-2"></div>
                      <CardHeader className="py-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base capitalize">{strategy.emotion}</CardTitle>
                          <span className="text-sm bg-secondary rounded-full px-2 py-0.5">
                            Intensity: {strategy.intensity}/10
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="whitespace-pre-wrap text-sm">{strategy.strategy}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Reflection Tab */}
        <TabsContent value="reflection" className="pt-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                DBT Reflection
              </CardTitle>
              <CardDescription>
                Reflect on your day and receive personalized DBT insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="todayGoal" className="text-sm font-medium mb-1 block">
                  Today's Goal
                </label>
                <Textarea
                  id="todayGoal"
                  value={reflectionData.todayGoal}
                  onChange={(e) => handleReflectionChange("todayGoal", e.target.value)}
                  placeholder="What was your main goal today?"
                  className="min-h-[60px] resize-none"
                  disabled={reflectionAnalysisMutation.isPending}
                />
              </div>
              
              <div>
                <label htmlFor="todayHighlight" className="text-sm font-medium mb-1 block">
                  Today's Highlight
                </label>
                <Textarea
                  id="todayHighlight"
                  value={reflectionData.todayHighlight}
                  onChange={(e) => handleReflectionChange("todayHighlight", e.target.value)}
                  placeholder="What was the best part of your day?"
                  className="min-h-[60px] resize-none"
                  disabled={reflectionAnalysisMutation.isPending}
                />
              </div>
              
              <div>
                <label htmlFor="gratitude" className="text-sm font-medium mb-1 block">
                  Gratitude
                </label>
                <Textarea
                  id="gratitude"
                  value={reflectionData.gratitude}
                  onChange={(e) => handleReflectionChange("gratitude", e.target.value)}
                  placeholder="What are you grateful for today?"
                  className="min-h-[60px] resize-none"
                  disabled={reflectionAnalysisMutation.isPending}
                />
              </div>
              
              <div>
                <label htmlFor="dbtSkillUsed" className="text-sm font-medium mb-1 block">
                  DBT Skill Used
                </label>
                <Input
                  id="dbtSkillUsed"
                  value={reflectionData.dbtSkillUsed}
                  onChange={(e) => handleReflectionChange("dbtSkillUsed", e.target.value)}
                  placeholder="What DBT skill did you practice today?"
                  disabled={reflectionAnalysisMutation.isPending}
                />
              </div>
              
              <Button
                onClick={handleReflectionAnalysis}
                disabled={
                  reflectionAnalysisMutation.isPending || 
                  !reflectionData.todayGoal.trim() ||
                  !reflectionData.todayHighlight.trim()
                }
                className="w-full mt-2"
              >
                {reflectionAnalysisMutation.isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing your reflection...</span>
                  </div>
                ) : (
                  "Analyze Reflection"
                )}
              </Button>
              
              {reflectionAnalysis && (
                <Card className="mt-4 bg-muted">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Your DBT Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm">{reflectionAnalysis}</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TherapyCompanion;