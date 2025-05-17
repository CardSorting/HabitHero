import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Check, Brain, UserPlus } from "lucide-react";
import PayPalButton from "@/components/PayPalButton";

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
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  // Function to handle PayPal payment for different pricing plans
  const handlePayPalPayment = async (planId: string, amount: string) => {
    setPaymentProcessing(true);
    try {
      // Create a PayPal order with return URLs
      const currentUrl = window.location.origin;
      const response = await fetch("/paypal/order", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount,
          currency: "USD",
          intent: "CAPTURE",
          returnUrl: `${currentUrl}/payment-success?plan=${planId}`,
          cancelUrl: `${currentUrl}/pricing`
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to create PayPal order");
      }
      
      const orderData = await response.json();
      
      // Check if the order has links and find the approval URL
      if (orderData.links) {
        const approvalLink = orderData.links.find((link: any) => link.rel === "approve");
        if (approvalLink) {
          window.location.href = approvalLink.href;
          return;
        }
      }
      
      // Fallback to standard redirect if links aren't available
      window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${orderData.id}`;
    } catch (error) {
      console.error("Payment failed:", error);
      alert("There was an error processing your payment. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">GALX</h1>
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
                <CardFooter className="flex flex-col gap-2">
                  <Button 
                    className="w-full bg-[#0070ba] hover:bg-[#003087] flex items-center justify-center gap-2"
                    onClick={() => {}}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.067 7.301C20.067 5.442 18.609 4 16.765 4H7.235C5.391 4 3.933 5.442 3.933 7.267V16.67C3.933 18.494 5.391 19.936 7.235 19.936H16.765C18.609 19.936 20.067 18.494 20.067 16.67V7.301Z" fill="white"/>
                      <path d="M16.765 20.469H7.235C5.1 20.469 3.363 18.782 3.363 16.67V7.267C3.363 5.156 5.1 3.468 7.235 3.468H16.765C18.9 3.468 20.637 5.156 20.637 7.267V16.67C20.637 18.782 18.9 20.469 16.765 20.469ZM7.235 4.532C5.676 4.532 4.432 5.753 4.432 7.267V16.67C4.432 18.185 5.676 19.406 7.235 19.406H16.765C18.324 19.406 19.568 18.185 19.568 16.67V7.267C19.568 5.753 18.324 4.532 16.765 4.532H7.235Z" fill="#0070BA"/>
                      <path d="M7.52 13.334C7.488 13.334 7.456 13.334 7.424 13.334C6.892 13.301 6.502 12.844 6.534 12.318C6.566 11.826 6.989 11.436 7.488 11.436C7.52 11.436 7.552 11.436 7.584 11.436C8.116 11.468 8.506 11.925 8.474 12.452C8.453 12.965 8.018 13.334 7.52 13.334Z" fill="#0070BA"/>
                      <path d="M14.343 12.92H11.737C11.481 12.92 11.261 12.717 11.24 12.452C11.218 12.165 11.424 11.925 11.705 11.903C11.726 11.903 11.748 11.903 11.769 11.903H14.376C14.632 11.903 14.851 12.107 14.873 12.371C14.894 12.658 14.689 12.898 14.408 12.92C14.376 12.92 14.354 12.92 14.343 12.92Z" fill="#0070BA"/>
                      <path d="M16.425 9.613H11.694C11.438 9.613 11.219 9.41 11.197 9.145C11.176 8.857 11.381 8.618 11.662 8.596C11.684 8.596 11.705 8.596 11.727 8.596H16.457C16.713 8.596 16.933 8.799 16.954 9.064C16.976 9.352 16.77 9.591 16.489 9.613C16.468 9.613 16.446 9.613 16.425 9.613Z" fill="#0070BA"/>
                      <path d="M14.343 16.267H11.737C11.481 16.267 11.261 16.063 11.24 15.798C11.218 15.511 11.424 15.271 11.705 15.249C11.726 15.249 11.748 15.249 11.769 15.249H14.376C14.632 15.249 14.851 15.453 14.873 15.718C14.894 16.005 14.689 16.245 14.408 16.267C14.376 16.267 14.354 16.267 14.343 16.267Z" fill="#0070BA"/>
                      <path d="M9.543 9.613H7.552C7.296 9.613 7.076 9.41 7.055 9.145C7.033 8.857 7.239 8.618 7.52 8.596C7.541 8.596 7.563 8.596 7.584 8.596H9.575C9.831 8.596 10.051 8.799 10.072 9.064C10.094 9.352 9.888 9.591 9.607 9.613C9.586 9.613 9.564 9.613 9.543 9.613Z" fill="#0070BA"/>
                      <path d="M9.543 16.267H7.552C7.296 16.267 7.076 16.063 7.055 15.798C7.033 15.511 7.239 15.271 7.52 15.249C7.541 15.249 7.563 15.249 7.584 15.249H9.575C9.831 15.249 10.051 15.453 10.072 15.718C10.094 16.005 9.888 16.245 9.607 16.267C9.586 16.267 9.564 16.267 9.543 16.267Z" fill="#0070BA"/>
                    </svg>
                    Pay with PayPal
                  </Button>
                  <div className="w-full relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted-foreground/20"></span>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate("/auth")}
                  >
                    Sign up first
                  </Button>
                  <div className="mt-2">
                    <div 
                      onClick={() => handlePayPalPayment("premium", "9.99")}
                      className="w-full h-10 rounded-md bg-[#ffc439] flex items-center justify-center cursor-pointer hover:bg-[#f0b72a] transition-colors duration-200"
                    >
                      <span className="font-semibold">PayPal Checkout</span>
                    </div>
                  </div>
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
                <CardFooter className="flex flex-col gap-2">
                  <Button 
                    className="w-full bg-[#0070ba] hover:bg-[#003087] flex items-center justify-center gap-2"
                    onClick={() => {}}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.067 7.301C20.067 5.442 18.609 4 16.765 4H7.235C5.391 4 3.933 5.442 3.933 7.267V16.67C3.933 18.494 5.391 19.936 7.235 19.936H16.765C18.609 19.936 20.067 18.494 20.067 16.67V7.301Z" fill="white"/>
                      <path d="M16.765 20.469H7.235C5.1 20.469 3.363 18.782 3.363 16.67V7.267C3.363 5.156 5.1 3.468 7.235 3.468H16.765C18.9 3.468 20.637 5.156 20.637 7.267V16.67C20.637 18.782 18.9 20.469 16.765 20.469ZM7.235 4.532C5.676 4.532 4.432 5.753 4.432 7.267V16.67C4.432 18.185 5.676 19.406 7.235 19.406H16.765C18.324 19.406 19.568 18.185 19.568 16.67V7.267C19.568 5.753 18.324 4.532 16.765 4.532H7.235Z" fill="#0070BA"/>
                      <path d="M7.52 13.334C7.488 13.334 7.456 13.334 7.424 13.334C6.892 13.301 6.502 12.844 6.534 12.318C6.566 11.826 6.989 11.436 7.488 11.436C7.52 11.436 7.552 11.436 7.584 11.436C8.116 11.468 8.506 11.925 8.474 12.452C8.453 12.965 8.018 13.334 7.52 13.334Z" fill="#0070BA"/>
                      <path d="M14.343 12.92H11.737C11.481 12.92 11.261 12.717 11.24 12.452C11.218 12.165 11.424 11.925 11.705 11.903C11.726 11.903 11.748 11.903 11.769 11.903H14.376C14.632 11.903 14.851 12.107 14.873 12.371C14.894 12.658 14.689 12.898 14.408 12.92C14.376 12.92 14.354 12.92 14.343 12.92Z" fill="#0070BA"/>
                      <path d="M16.425 9.613H11.694C11.438 9.613 11.219 9.41 11.197 9.145C11.176 8.857 11.381 8.618 11.662 8.596C11.684 8.596 11.705 8.596 11.727 8.596H16.457C16.713 8.596 16.933 8.799 16.954 9.064C16.976 9.352 16.77 9.591 16.489 9.613C16.468 9.613 16.446 9.613 16.425 9.613Z" fill="#0070BA"/>
                      <path d="M14.343 16.267H11.737C11.481 16.267 11.261 16.063 11.24 15.798C11.218 15.511 11.424 15.271 11.705 15.249C11.726 15.249 11.748 15.249 11.769 15.249H14.376C14.632 15.249 14.851 15.453 14.873 15.718C14.894 16.005 14.689 16.245 14.408 16.267C14.376 16.267 14.354 16.267 14.343 16.267Z" fill="#0070BA"/>
                      <path d="M9.543 9.613H7.552C7.296 9.613 7.076 9.41 7.055 9.145C7.033 8.857 7.239 8.618 7.52 8.596C7.541 8.596 7.563 8.596 7.584 8.596H9.575C9.831 8.596 10.051 8.799 10.072 9.064C10.094 9.352 9.888 9.591 9.607 9.613C9.586 9.613 9.564 9.613 9.543 9.613Z" fill="#0070BA"/>
                      <path d="M9.543 16.267H7.552C7.296 16.267 7.076 16.063 7.055 15.798C7.033 15.511 7.239 15.271 7.52 15.249C7.541 15.249 7.563 15.249 7.584 15.249H9.575C9.831 15.249 10.051 15.453 10.072 15.718C10.094 16.005 9.888 16.245 9.607 16.267C9.586 16.267 9.564 16.267 9.543 16.267Z" fill="#0070BA"/>
                    </svg>
                    Pay with PayPal
                  </Button>
                  <div className="w-full relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted-foreground/20"></span>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate("/auth")}
                  >
                    Sign up first
                  </Button>
                  <div className="mt-2">
                    <div 
                      onClick={() => handlePayPalPayment("family", "19.99")}
                      className="w-full h-10 rounded-md bg-[#ffc439] flex items-center justify-center cursor-pointer hover:bg-[#f0b72a] transition-colors duration-200"
                    >
                      <span className="font-semibold">PayPal Checkout</span>
                    </div>
                  </div>
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
                <CardFooter className="flex flex-col gap-2">
                  <Button 
                    className="w-full bg-[#0070ba] hover:bg-[#003087] flex items-center justify-center gap-2"
                    onClick={() => {}}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.067 7.301C20.067 5.442 18.609 4 16.765 4H7.235C5.391 4 3.933 5.442 3.933 7.267V16.67C3.933 18.494 5.391 19.936 7.235 19.936H16.765C18.609 19.936 20.067 18.494 20.067 16.67V7.301Z" fill="white"/>
                      <path d="M16.765 20.469H7.235C5.1 20.469 3.363 18.782 3.363 16.67V7.267C3.363 5.156 5.1 3.468 7.235 3.468H16.765C18.9 3.468 20.637 5.156 20.637 7.267V16.67C20.637 18.782 18.9 20.469 16.765 20.469ZM7.235 4.532C5.676 4.532 4.432 5.753 4.432 7.267V16.67C4.432 18.185 5.676 19.406 7.235 19.406H16.765C18.324 19.406 19.568 18.185 19.568 16.67V7.267C19.568 5.753 18.324 4.532 16.765 4.532H7.235Z" fill="#0070BA"/>
                      <path d="M7.52 13.334C7.488 13.334 7.456 13.334 7.424 13.334C6.892 13.301 6.502 12.844 6.534 12.318C6.566 11.826 6.989 11.436 7.488 11.436C7.52 11.436 7.552 11.436 7.584 11.436C8.116 11.468 8.506 11.925 8.474 12.452C8.453 12.965 8.018 13.334 7.52 13.334Z" fill="#0070BA"/>
                      <path d="M14.343 12.92H11.737C11.481 12.92 11.261 12.717 11.24 12.452C11.218 12.165 11.424 11.925 11.705 11.903C11.726 11.903 11.748 11.903 11.769 11.903H14.376C14.632 11.903 14.851 12.107 14.873 12.371C14.894 12.658 14.689 12.898 14.408 12.92C14.376 12.92 14.354 12.92 14.343 12.92Z" fill="#0070BA"/>
                      <path d="M16.425 9.613H11.694C11.438 9.613 11.219 9.41 11.197 9.145C11.176 8.857 11.381 8.618 11.662 8.596C11.684 8.596 11.705 8.596 11.727 8.596H16.457C16.713 8.596 16.933 8.799 16.954 9.064C16.976 9.352 16.77 9.591 16.489 9.613C16.468 9.613 16.446 9.613 16.425 9.613Z" fill="#0070BA"/>
                      <path d="M14.343 16.267H11.737C11.481 16.267 11.261 16.063 11.24 15.798C11.218 15.511 11.424 15.271 11.705 15.249C11.726 15.249 11.748 15.249 11.769 15.249H14.376C14.632 15.249 14.851 15.453 14.873 15.718C14.894 16.005 14.689 16.245 14.408 16.267C14.376 16.267 14.354 16.267 14.343 16.267Z" fill="#0070BA"/>
                      <path d="M9.543 9.613H7.552C7.296 9.613 7.076 9.41 7.055 9.145C7.033 8.857 7.239 8.618 7.52 8.596C7.541 8.596 7.563 8.596 7.584 8.596H9.575C9.831 8.596 10.051 8.799 10.072 9.064C10.094 9.352 9.888 9.591 9.607 9.613C9.586 9.613 9.564 9.613 9.543 9.613Z" fill="#0070BA"/>
                      <path d="M9.543 16.267H7.552C7.296 16.267 7.076 16.063 7.055 15.798C7.033 15.511 7.239 15.271 7.52 15.249C7.541 15.249 7.563 15.249 7.584 15.249H9.575C9.831 15.249 10.051 15.453 10.072 15.718C10.094 16.005 9.888 16.245 9.607 16.267C9.586 16.267 9.564 16.267 9.543 16.267Z" fill="#0070BA"/>
                    </svg>
                    Pay with PayPal
                  </Button>
                  <div className="w-full relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted-foreground/20"></span>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate("/therapist-auth")}
                  >
                    Sign up first
                  </Button>
                  <div className="mt-2">
                    <div 
                      onClick={() => handlePayPalPayment("professional", "29.99")}
                      className="w-full h-10 rounded-md bg-[#ffc439] flex items-center justify-center cursor-pointer hover:bg-[#f0b72a] transition-colors duration-200"
                    >
                      <span className="font-semibold">PayPal Checkout</span>
                    </div>
                  </div>
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
                <CardFooter className="flex flex-col gap-2">
                  <Button 
                    className="w-full bg-[#0070ba] hover:bg-[#003087] flex items-center justify-center gap-2"
                    onClick={() => {}}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.067 7.301C20.067 5.442 18.609 4 16.765 4H7.235C5.391 4 3.933 5.442 3.933 7.267V16.67C3.933 18.494 5.391 19.936 7.235 19.936H16.765C18.609 19.936 20.067 18.494 20.067 16.67V7.301Z" fill="white"/>
                      <path d="M16.765 20.469H7.235C5.1 20.469 3.363 18.782 3.363 16.67V7.267C3.363 5.156 5.1 3.468 7.235 3.468H16.765C18.9 3.468 20.637 5.156 20.637 7.267V16.67C20.637 18.782 18.9 20.469 16.765 20.469ZM7.235 4.532C5.676 4.532 4.432 5.753 4.432 7.267V16.67C4.432 18.185 5.676 19.406 7.235 19.406H16.765C18.324 19.406 19.568 18.185 19.568 16.67V7.267C19.568 5.753 18.324 4.532 16.765 4.532H7.235Z" fill="#0070BA"/>
                      <path d="M7.52 13.334C7.488 13.334 7.456 13.334 7.424 13.334C6.892 13.301 6.502 12.844 6.534 12.318C6.566 11.826 6.989 11.436 7.488 11.436C7.52 11.436 7.552 11.436 7.584 11.436C8.116 11.468 8.506 11.925 8.474 12.452C8.453 12.965 8.018 13.334 7.52 13.334Z" fill="#0070BA"/>
                      <path d="M14.343 12.92H11.737C11.481 12.92 11.261 12.717 11.24 12.452C11.218 12.165 11.424 11.925 11.705 11.903C11.726 11.903 11.748 11.903 11.769 11.903H14.376C14.632 11.903 14.851 12.107 14.873 12.371C14.894 12.658 14.689 12.898 14.408 12.92C14.376 12.92 14.354 12.92 14.343 12.92Z" fill="#0070BA"/>
                      <path d="M16.425 9.613H11.694C11.438 9.613 11.219 9.41 11.197 9.145C11.176 8.857 11.381 8.618 11.662 8.596C11.684 8.596 11.705 8.596 11.727 8.596H16.457C16.713 8.596 16.933 8.799 16.954 9.064C16.976 9.352 16.77 9.591 16.489 9.613C16.468 9.613 16.446 9.613 16.425 9.613Z" fill="#0070BA"/>
                      <path d="M14.343 16.267H11.737C11.481 16.267 11.261 16.063 11.24 15.798C11.218 15.511 11.424 15.271 11.705 15.249C11.726 15.249 11.748 15.249 11.769 15.249H14.376C14.632 15.249 14.851 15.453 14.873 15.718C14.894 16.005 14.689 16.245 14.408 16.267C14.376 16.267 14.354 16.267 14.343 16.267Z" fill="#0070BA"/>
                      <path d="M9.543 9.613H7.552C7.296 9.613 7.076 9.41 7.055 9.145C7.033 8.857 7.239 8.618 7.52 8.596C7.541 8.596 7.563 8.596 7.584 8.596H9.575C9.831 8.596 10.051 8.799 10.072 9.064C10.094 9.352 9.888 9.591 9.607 9.613C9.586 9.613 9.564 9.613 9.543 9.613Z" fill="#0070BA"/>
                      <path d="M9.543 16.267H7.552C7.296 16.267 7.076 16.063 7.055 15.798C7.033 15.511 7.239 15.271 7.52 15.249C7.541 15.249 7.563 15.249 7.584 15.249H9.575C9.831 15.249 10.051 15.453 10.072 15.718C10.094 16.005 9.888 16.245 9.607 16.267C9.586 16.267 9.564 16.267 9.543 16.267Z" fill="#0070BA"/>
                    </svg>
                    Pay with PayPal
                  </Button>
                  <div className="w-full relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted-foreground/20"></span>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate("/therapist-auth")}
                  >
                    Sign up first
                  </Button>
                  <div className="mt-2">
                    <div 
                      onClick={() => handlePayPalPayment("practice", "79.99")}
                      className="w-full h-10 rounded-md bg-[#ffc439] flex items-center justify-center cursor-pointer hover:bg-[#f0b72a] transition-colors duration-200"
                    >
                      <span className="font-semibold">PayPal Checkout</span>
                    </div>
                  </div>
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
                    onClick={() => window.location.href = "mailto:sales@galx.app"}
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
              <h1 className="text-xl font-bold text-foreground">GALX</h1>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GALX. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}