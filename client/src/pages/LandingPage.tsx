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
    // Always direct to the appropriate auth page based on selected tab
    if (selectedTab === "client") {
      navigate("/auth");
    } else {
      navigate("/therapist-auth");
    }
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
            <Button size="sm" onClick={handleGetStarted}>
              Get Started
            </Button>
          </div>
          
          <div className="md:hidden flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
              Login
            </Button>
            <Button size="sm" onClick={handleGetStarted}>
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
                        <Button size="lg" onClick={handleGetStarted} className="rounded-full px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all">
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
                        <Button size="lg" onClick={handleGetStarted} className="rounded-full px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all">
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
      <section className="py-20 border-b border-border" id="features">
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
              <h3 className="text-xl font-bold mb-2">In-depth Analytics</h3>
              <p className="text-muted-foreground">
                Visualize patterns and trends in emotional and behavioral data with comprehensive charts.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-background rounded-lg p-8 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Wellness Challenges</h3>
              <p className="text-muted-foreground">
                Complete personalized challenges designed to improve mental wellbeing and build healthy routines.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="bg-background rounded-lg p-8 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Insights</h3>
              <p className="text-muted-foreground">
                Receive intelligent suggestions and therapeutic insights based on your emotional patterns.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="bg-background rounded-lg p-8 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Privacy-Focused</h3>
              <p className="text-muted-foreground">
                Your data is encrypted and secure, with full control over what you share with healthcare providers.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 border-b border-border bg-muted/30" id="testimonials">
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
              Trusted by patients and therapists
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hear from our users about how MindfulTrack has transformed their mental health journey.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp} className="bg-background rounded-lg p-8 border border-border">
              <div className="mb-4 flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-semibold">JD</span>
                </div>
                <div>
                  <h4 className="font-semibold">Jennifer D.</h4>
                  <p className="text-sm text-muted-foreground">Patient</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "The emotion tracking feature has been life-changing. I can now clearly see patterns in my mood and have learned to implement healthier coping strategies."
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-background rounded-lg p-8 border border-border">
              <div className="mb-4 flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-semibold">MT</span>
                </div>
                <div>
                  <h4 className="font-semibold">Dr. Michael T.</h4>
                  <p className="text-sm text-muted-foreground">Therapist</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "The analytics dashboard gives me invaluable insights into my clients' progress. Treatment planning is now data-driven and much more effective."
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-background rounded-lg p-8 border border-border">
              <div className="mb-4 flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-semibold">SK</span>
                </div>
                <div>
                  <h4 className="font-semibold">Sarah K.</h4>
                  <p className="text-sm text-muted-foreground">Patient</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "The habit building features helped me establish a consistent meditation practice. I'm more mindful and my anxiety has decreased significantly."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 border-b border-border" id="about">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <Badge variant="outline" className="mb-4">About Us</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Our mission is to make mental healthcare 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary ml-2">
                accessible and data-driven
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              MindfulTrack was created by a team of mental health professionals and technologists with a shared vision: 
              to transform mental healthcare through innovative technology and data-driven insights.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button size="lg" onClick={handleGetStarted} className="rounded-full px-6 w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90">
                Get Started
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-6 w-full sm:w-auto">
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">MindfulTrack</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <Button variant="ghost" size="sm" onClick={handleGetStarted}>
                Get Started
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#features">Features</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#testimonials">Testimonials</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#about">About</a>
              </Button>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
            <p>© {new Date().getFullYear()} MindfulTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}