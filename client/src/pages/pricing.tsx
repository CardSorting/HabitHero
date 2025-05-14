import React from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Check, Brain, UserPlus } from "lucide-react";

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

export default function PricingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">MindfulTrack</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              Home
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-24 border-b border-border">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Choose the perfect plan for your{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                mental wellbeing
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Whether you're an individual looking to track your emotions or a therapist helping clients,
              we have flexible plans to meet your needs.
            </p>
          </motion.div>
          
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12"
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
          >
            {/* Client Plans */}
            <motion.div variants={fadeInUp} className="col-span-1 lg:col-span-3 mb-4 text-center">
              <div className="inline-flex items-center justify-center gap-2 bg-muted rounded-full px-4 py-1 mb-2">
                <UserPlus className="h-4 w-4" />
                <span className="text-sm font-medium">Client Plans</span>
              </div>
            </motion.div>
            
            {/* Free Plan */}
            <motion.div variants={fadeInUp}>
              <Card className="border-2 h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl">Basic</CardTitle>
                  <CardDescription>For individuals just getting started</CardDescription>
                  <div className="mt-4 flex items-baseline text-primary">
                    <span className="text-5xl font-extrabold tracking-tight">Free</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Emotion tracking</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Basic habit tracking</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Daily reflection journal</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>7-day data retention</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate("/auth")}
                  >
                    Sign up
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
            
            {/* Premium Plan */}
            <motion.div variants={fadeInUp}>
              <Card className="border-2 border-primary h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                  Popular
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Premium</CardTitle>
                  <CardDescription>For dedicated self-improvement</CardDescription>
                  <div className="mt-4 flex items-baseline text-primary">
                    <span className="text-5xl font-extrabold tracking-tight">$9.99</span>
                    <span className="ml-1 text-xl">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Everything in Basic</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Unlimited habit tracking</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Crisis tracking & intervention</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>1-year data retention</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => navigate("/auth")}
                  >
                    Get started
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
            
            {/* Family Plan */}
            <motion.div variants={fadeInUp}>
              <Card className="border-2 h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl">Family</CardTitle>
                  <CardDescription>For families & groups</CardDescription>
                  <div className="mt-4 flex items-baseline text-primary">
                    <span className="text-5xl font-extrabold tracking-tight">$19.99</span>
                    <span className="ml-1 text-xl">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Everything in Premium</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Up to 5 family members</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Family wellness insights</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Shared goals & challenges</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>3-year data retention</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate("/auth")}
                  >
                    Get started
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
            
            {/* Therapist Plans */}
            <motion.div variants={fadeInUp} className="col-span-1 lg:col-span-3 mt-12 mb-4 text-center">
              <div className="inline-flex items-center justify-center gap-2 bg-muted rounded-full px-4 py-1 mb-2">
                <Brain className="h-4 w-4" />
                <span className="text-sm font-medium">Therapist Plans</span>
              </div>
            </motion.div>
            
            {/* Therapist Basic */}
            <motion.div variants={fadeInUp}>
              <Card className="border-2 h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl">Professional</CardTitle>
                  <CardDescription>For individual practitioners</CardDescription>
                  <div className="mt-4 flex items-baseline text-primary">
                    <span className="text-5xl font-extrabold tracking-tight">$29.99</span>
                    <span className="ml-1 text-xl">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Up to 15 clients</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Client analytics dashboard</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Treatment plan creation</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Session notes & tracking</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate("/therapist-auth")}
                  >
                    Sign up
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
            
            {/* Therapist Premium */}
            <motion.div variants={fadeInUp}>
              <Card className="border-2 border-primary h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                  Popular
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Practice</CardTitle>
                  <CardDescription>For multi-therapist practices</CardDescription>
                  <div className="mt-4 flex items-baseline text-primary">
                    <span className="text-5xl font-extrabold tracking-tight">$79.99</span>
                    <span className="ml-1 text-xl">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Everything in Professional</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Up to 5 therapists</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Unlimited clients</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Advanced reporting</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Team collaboration tools</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => navigate("/therapist-auth")}
                  >
                    Get started
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
            
            {/* Therapist Enterprise */}
            <motion.div variants={fadeInUp}>
              <Card className="border-2 h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                  <CardDescription>For large organizations</CardDescription>
                  <div className="mt-4 flex items-baseline text-primary">
                    <span className="text-3xl font-extrabold tracking-tight">Custom pricing</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Everything in Practice</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Unlimited therapists</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Custom integrations</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Dedicated support</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>On-premise deployment option</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => window.location.href = "mailto:sales@mindfultrack.com"}
                  >
                    Contact sales
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto text-left grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-medium mb-2">Can I switch between plans?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">Is my data secure?</h3>
              <p className="text-muted-foreground">
                Absolutely. We use industry-standard encryption and security practices to ensure your data remains private and secure.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">Do you offer a free trial?</h3>
              <p className="text-muted-foreground">
                Yes, all paid plans come with a 14-day free trial so you can test all features before committing.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">How do client accounts work?</h3>
              <p className="text-muted-foreground">
                As a therapist, you can invite clients who can then create their own accounts. Clients have control over what data they share with you.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">MindfulTrack</h1>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MindfulTrack. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}