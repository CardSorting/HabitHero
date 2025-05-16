import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart2,
  Brain,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Heart,
  LineChart,
  Lightbulb,
  PieChart,
  Shield,
  Activity,
  UserPlus,
  MessageSquare,
  TrendingUp,
  Check,
  UserCheck,
} from "lucide-react";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState<"client" | "therapist">("client");

  const handleGetStarted = () => {
    navigate("/onboarding");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">MindfulTrack</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <a href="#features">Features</a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="#testimonials">Testimonials</a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="#about">About</a>
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
              Login
            </Button>
            <Button size="sm" onClick={() => navigate("/pricing")}>
              Get Started
            </Button>
          </div>
          
          <div className="md:hidden flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
              Login
            </Button>
            <Button size="sm" onClick={() => navigate("/pricing")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 border-b border-border">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Transform{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                mental health
              </span>{" "}
              with data-driven insights
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              MindfulTrack helps monitor emotions, build healthy habits, and gain insights
              into mental health journeys with advanced analytics.
            </p>
            
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-muted/60 rounded-full mb-2">
                <UserCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Choose your path</span>
              </div>
            </div>
            
            <Tabs
              defaultValue={selectedTab}
              value={selectedTab}
              onValueChange={(value) => setSelectedTab(value as "client" | "therapist")}
              className="w-full max-w-3xl mx-auto"
            >
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 p-1 bg-muted/30 border border-border rounded-xl">
                <TabsTrigger 
                  value="client" 
                  className="flex items-center justify-center gap-2 py-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-2">
                    <div className="bg-primary/10 p-2 rounded-full mb-1 sm:mb-0">
                      <UserPlus className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">I am a Client</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="therapist" 
                  className="flex items-center justify-center gap-2 py-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-2">
                    <div className="bg-primary/10 p-2 rounded-full mb-1 sm:mb-0">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">I am a Therapist</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="client" className="mt-0 px-2">
                <Card className="border-2 hover:border-primary/50 transition-all overflow-hidden shadow-sm hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-8 border-b border-border">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <UserPlus className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Client Path</h3>
                      </div>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Track emotions and mood patterns</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Build positive habits with streak tracking</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Gain insights from detailed analytics</span>
                        </li>
                      </ul>
                      <p className="text-muted-foreground text-lg mb-6">
                        Track emotions, build positive habits, and gain valuable insights to improve your mental health journey.
                      </p>
                      <div className="flex justify-center">
                        <Button size="lg" onClick={() => navigate("/pricing")} className="rounded-full px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all">
                          Get Started
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="therapist" className="mt-0 px-2">
                <Card className="border-2 hover:border-primary/50 transition-all overflow-hidden shadow-sm hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-secondary/5 to-primary/5 p-8 border-b border-border">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Therapist Path</h3>
                      </div>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Monitor client progress with ease</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Analyze emotion patterns and triggers</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Create and track personalized treatment plans</span>
                        </li>
                      </ul>
                      <p className="text-muted-foreground text-lg mb-6">
                        Monitor client progress, analyze emotion patterns, and deliver more effective treatment with detailed analytics.
                      </p>
                      <div className="flex justify-center">
                        <Button size="lg" onClick={() => navigate("/pricing")} className="rounded-full px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all">
                          Get Started
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-12 md:py-20 border-b border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp} className="bg-background rounded-lg p-8 shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-2">85%</h3>
              <p className="text-muted-foreground">Improved therapy adherence with regular tracking</p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="bg-background rounded-lg p-8 shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-2">76%</h3>
              <p className="text-muted-foreground">Users report increased emotional awareness</p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="bg-background rounded-lg p-8 shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-2">3.2x</h3>
              <p className="text-muted-foreground">Greater habit consistency in daily routines</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <Badge variant="outline" className="mb-4">Features</Badge>
            <Tabs
              defaultValue={selectedTab}
              value={selectedTab}
              onValueChange={(value) => setSelectedTab(value as "client" | "therapist")}
              className="mt-4 mb-6 max-w-md mx-auto"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="client">For Clients</TabsTrigger>
                <TabsTrigger value="therapist">For Therapists</TabsTrigger>
              </TabsList>
              
              <TabsContent value="client" className="mt-4 px-2">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Everything you need for better mental wellbeing
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Comprehensive tools designed to help you track emotions, build habits, and improve your mental health journey.
                </p>
              </TabsContent>
              
              <TabsContent value="therapist" className="mt-4 px-2">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Everything you need for better client outcomes
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Powerful analytics and management tools designed to help you track client progress and deliver more effective treatment.
                </p>
              </TabsContent>
            </Tabs>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp} className="bg-background rounded-lg p-8 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <PieChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Emotion Tracking</h3>
              <p className="text-muted-foreground">
                Log and visualize emotions throughout the day with intensity tracking and contextual notes.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="bg-background rounded-lg p-8 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Habit Builder</h3>
              <p className="text-muted-foreground">
                Create and maintain positive daily habits with streak tracking and customizable reminders.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="bg-background rounded-lg p-8 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Progress Analytics</h3>
              <p className="text-muted-foreground">
                Visualize trends and patterns with detailed charts and insights about your emotional journey.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="bg-background rounded-lg p-8 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">DBT Diary Card</h3>
              <p className="text-muted-foreground">
                Digital DBT diary card to track skills usage, urges, emotions, and sleep patterns between sessions.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="bg-background rounded-lg p-8 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Therapy Companion</h3>
              <p className="text-muted-foreground">
                AI-powered conversations that provide coping strategies and emotional support between sessions.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="bg-background rounded-lg p-8 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Wellness Challenges</h3>
              <p className="text-muted-foreground">
                Structured challenges to build resilience and improve overall mental wellbeing day by day.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* For Therapists Section */}
      <section className="py-20 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <Badge variant="outline" className="mb-4">For Therapists</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Enhance your therapeutic practice with data-driven insights
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Get a clearer picture of your clients' progress between sessions with comprehensive tracking tools and analytics.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Track client emotion patterns and identify triggers",
                  "Monitor DBT skills usage and effectiveness",
                  "View habit consistency and wellness challenge progress",
                  "Receive alerts for concerning emotional spikes",
                  "Prepare for sessions with comprehensive client data"
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start gap-3"
                    variants={fadeInUp}
                  >
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
              
              <Button className="mt-8 rounded-full" size="lg">
                Learn more about therapist features
              </Button>
            </motion.div>
            
            <motion.div
              className="rounded-lg bg-background border border-border p-6 shadow-lg"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <div className="bg-muted p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">Client Overview Dashboard</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Card className="bg-background">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Emotion Tracking</p>
                          <p className="text-lg font-semibold">14/14 days</p>
                        </div>
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Heart className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-background">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Habit Completion</p>
                          <p className="text-lg font-semibold">86%</p>
                        </div>
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="rounded-lg bg-background p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Emotion Intensity Trends</h4>
                    <Badge variant="outline" className="text-xs">Last 7 days</Badge>
                  </div>
                  <div className="h-32 bg-muted/30 rounded-md flex items-center justify-center">
                    <LineChart className="h-6 w-6 text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Emotion chart visualization</span>
                  </div>
                </div>
                <div className="rounded-lg bg-background p-4">
                  <h4 className="font-medium mb-3">Alerts</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md text-sm">
                      <span className="h-2 w-2 rounded-full bg-destructive"></span>
                      <span>High anxiety recorded on Tuesday</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-md text-sm">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                      <span>DBT skills usage decreased this week</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* For Clients Section */}
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="order-2 lg:order-1 rounded-lg bg-background border border-border p-6 shadow-lg"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <div className="bg-muted p-4 rounded-lg mb-6">
                <div className="bg-background p-4 rounded-lg mb-4">
                  <h3 className="font-semibold mb-4">Daily Check-in</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">How are you feeling today?</p>
                      <div className="flex gap-2">
                        {["😔", "😟", "😐", "🙂", "😊"].map((emoji, i) => (
                          <div 
                            key={i} 
                            className={`h-10 w-10 flex items-center justify-center rounded-full border ${i === 3 ? 'border-primary bg-primary/10' : 'border-border'}`}
                          >
                            <span className="text-lg">{emoji}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Habits for today</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded-md border border-border">
                          <span className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span>Morning meditation</span>
                          </span>
                          <Badge variant="outline" className="text-xs">Completed</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-md border border-border">
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Read for 20 minutes</span>
                          </span>
                          <Badge variant="outline" className="text-xs">Pending</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full">Complete Today's Check-in</Button>
                  </div>
                </div>
                
                <div className="bg-background p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Your Progress</h4>
                    <Badge className="bg-success text-white">7-day streak</Badge>
                  </div>
                  <div className="h-32 bg-muted/30 rounded-md flex items-center justify-center mb-3">
                    <BarChart2 className="h-6 w-6 text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Habit statistics visualization</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You're making great progress on your wellness journey!
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              className="order-1 lg:order-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <Badge variant="outline" className="mb-4">For Clients</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Take control of your wellness journey
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Track your progress, build healthy habits, and gain insights into your emotional patterns to support your therapy work.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Monitor your emotions and identify patterns",
                  "Build consistent, positive daily habits",
                  "Track DBT skills usage and effectiveness",
                  "Get AI-powered coping suggestions when needed",
                  "Share progress with your therapist for better sessions"
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start gap-3"
                    variants={fadeInUp}
                  >
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
              
              <Button className="mt-8 rounded-full" size="lg">
                See how clients benefit
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by therapists and clients alike
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how MindfulTrack is transforming the therapy experience.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp} className="bg-background rounded-lg p-6 border border-border">
              <div className="mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <p className="mb-6 text-muted-foreground">
                "As a therapist, this app has transformed my practice. I get a complete picture of my clients' emotional states between sessions, making our time together much more productive."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Dr. Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Clinical Psychologist</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="bg-background rounded-lg p-6 border border-border">
              <div className="mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <p className="mb-6 text-muted-foreground">
                "The emotion tracking feature helped me identify triggers I never noticed before. I'm now much more aware of my emotional patterns and my therapist can provide more targeted support."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Michael Rivera</p>
                  <p className="text-sm text-muted-foreground">Therapy Client</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="bg-background rounded-lg p-6 border border-border">
              <div className="mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <p className="mb-6 text-muted-foreground">
                "The habit tracking and DBT diary card features have been instrumental in helping my clients build consistency with their skills practice between sessions."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Dr. James Chen</p>
                  <p className="text-sm text-muted-foreground">DBT Specialist</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <Badge variant="outline" className="mb-5 px-3 py-1 text-sm">
              Join Today
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Ready to transform your therapy experience?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Start tracking emotions, building habits, and gaining insights today with our comprehensive wellness platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="rounded-full px-8">
                Get started for free
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8">
                Book a demo for your practice
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-foreground">MindfulTrack</h1>
              </div>
              <p className="text-muted-foreground">
                Building better mental health through consistent tracking and data-driven insights.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Features</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Emotion Tracking</li>
                <li>Habit Building</li>
                <li>DBT Diary Card</li>
                <li>Wellness Challenges</li>
                <li>Analytics Dashboard</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>For Therapists</li>
                <li>For Clients</li>
                <li>Blog</li>
                <li>Case Studies</li>
                <li>Documentation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>About Us</li>
                <li>Pricing</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2023 MindfulTrack. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Twitter
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                LinkedIn
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Instagram
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Facebook
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}