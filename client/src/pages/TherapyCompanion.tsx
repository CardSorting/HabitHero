import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Send, RefreshCw, MessageSquare, Sparkles, Brain, HeartHandshake } from "lucide-react";
import Header from "@/components/Header";

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
  }, [messages]);

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest("/api/therapy/chat", {
        method: "POST",
        body: JSON.stringify({
          message,
          conversationHistory: messages
        })
      });
    },
    onSuccess: (data: any) => {
      if (data?.response) {
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      }
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
      return apiRequest("/api/therapy/coping-strategy", {
        method: "POST",
        body: JSON.stringify({
          emotion,
          intensity
        })
      });
    },
    onSuccess: (data: any, variables) => {
      if (data?.copingStrategy) {
        setCopingStrategies(prev => [
          { 
            emotion: variables.emotion, 
            intensity: variables.intensity, 
            strategy: data.copingStrategy 
          },
          ...prev.slice(0, 4) // Keep only 5 most recent strategies
        ]);
        setEmotion("");
      }
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
      return apiRequest<{ analysis: string }>("/api/therapy/analyze-reflection", {
        method: "POST",
        body: JSON.stringify({
          reflection
        })
      });
    },
    onSuccess: (data) => {
      if (data?.analysis) {
        setReflectionAnalysis(data.analysis);
      }
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mx-4">
        <TabsList className="grid w-full grid-cols-3">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartHandshake className="h-5 w-5 text-primary" />
                DBT Therapy Chat
              </CardTitle>
              <CardDescription>
                Chat with your AI DBT therapy companion about how you're feeling or to learn DBT skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[calc(100vh-350px)] min-h-[300px] overflow-y-auto space-y-4 mb-4 p-2">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p className="mb-1">How are you feeling today?</p>
                    <p className="text-sm">Start chatting with your DBT therapy companion</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
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
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Input 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1"
                disabled={chatMutation.isPending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={chatMutation.isPending || !inputMessage.trim()}
              >
                {chatMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </CardFooter>
          </Card>
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
              <div className="grid grid-cols-4 gap-2 items-end">
                <div className="col-span-2">
                  <label htmlFor="emotion" className="text-sm font-medium">
                    Emotion
                  </label>
                  <Input
                    id="emotion"
                    value={emotion}
                    onChange={(e) => setEmotion(e.target.value)}
                    placeholder="e.g., Anxiety, Anger, Sadness"
                  />
                </div>
                <div>
                  <label htmlFor="intensity" className="text-sm font-medium">
                    Intensity (1-10)
                  </label>
                  <Input
                    id="intensity"
                    type="number"
                    min="1"
                    max="10"
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleGetCopingStrategy}
                  disabled={copingStrategyMutation.isPending || !emotion.trim()}
                  className="flex gap-1"
                >
                  {copingStrategyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
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
                <label htmlFor="todayGoal" className="text-sm font-medium">
                  Today's Goal
                </label>
                <Input
                  id="todayGoal"
                  value={reflectionData.todayGoal}
                  onChange={(e) => handleReflectionChange("todayGoal", e.target.value)}
                  placeholder="What was your main goal today?"
                />
              </div>
              
              <div>
                <label htmlFor="todayHighlight" className="text-sm font-medium">
                  Today's Highlight
                </label>
                <Input
                  id="todayHighlight"
                  value={reflectionData.todayHighlight}
                  onChange={(e) => handleReflectionChange("todayHighlight", e.target.value)}
                  placeholder="What was the best part of your day?"
                />
              </div>
              
              <div>
                <label htmlFor="gratitude" className="text-sm font-medium">
                  Gratitude
                </label>
                <Input
                  id="gratitude"
                  value={reflectionData.gratitude}
                  onChange={(e) => handleReflectionChange("gratitude", e.target.value)}
                  placeholder="What are you grateful for today?"
                />
              </div>
              
              <div>
                <label htmlFor="dbtSkillUsed" className="text-sm font-medium">
                  DBT Skill Used
                </label>
                <Input
                  id="dbtSkillUsed"
                  value={reflectionData.dbtSkillUsed}
                  onChange={(e) => handleReflectionChange("dbtSkillUsed", e.target.value)}
                  placeholder="What DBT skill did you practice today?"
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
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
                    <p className="whitespace-pre-wrap">{reflectionAnalysis}</p>
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