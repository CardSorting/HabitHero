import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Brain } from "lucide-react";

export default function PaymentSuccessPage() {
  const [, navigate] = useLocation();
  const [planInfo, setPlanInfo] = useState({
    name: "Premium Plan",
    price: "$9.99",
    period: "month"
  });
  
  // Get plan details from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    const token = params.get('token');
    
    // Capture payment details based on the plan type
    if (plan) {
      let planDetails = {
        name: "Premium Plan",
        price: "$9.99",
        period: "month"
      };
      
      switch(plan) {
        case "premium":
          planDetails = {
            name: "Premium Plan",
            price: "$9.99",
            period: "month"
          };
          break;
        case "family":
          planDetails = {
            name: "Family Plan",
            price: "$19.99",
            period: "month"
          };
          break;
        case "professional":
          planDetails = {
            name: "Professional Plan",
            price: "$29.99",
            period: "month"
          };
          break;
        case "practice":
          planDetails = {
            name: "Practice Plan",
            price: "$79.99",
            period: "month"
          };
          break;
      }
      
      setPlanInfo(planDetails);
      
      // If there's a token, try to capture the payment
      if (token) {
        capturePayment(token);
      }
    }
  }, []);
  
  const capturePayment = async (token: string) => {
    try {
      const response = await fetch(`/paypal/order/${token}/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        console.error("Failed to capture payment");
      }
      
      // Payment successfully captured
      console.log("Payment captured successfully");
    } catch (error) {
      console.error("Error capturing payment:", error);
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
            <h1 className="text-xl font-bold text-foreground">MindfulTrack</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              Home
            </Button>
          </div>
        </div>
      </header>

      {/* Success Section */}
      <section className="flex-1 flex items-center justify-center py-20">
        <motion.div
          className="max-w-md w-full mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-20 w-20 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Payment Successful!</CardTitle>
              <CardDescription>
                Thank you for your purchase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="bg-muted p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">{planInfo.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">{planInfo.price}/{planInfo.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-green-600">Paid</span>
                </div>
              </div>
              
              <p className="text-sm text-center text-muted-foreground">
                A confirmation email has been sent to your registered email address.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                className="w-full" 
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate("/")}
              >
                Back to Home
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}