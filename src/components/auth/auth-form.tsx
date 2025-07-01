
"use client";

import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSigningUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Signup Successful!",
          description: "Please check your email to confirm your account.",
          variant: "default",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Login Successful!",
          description: "You are now logged in.",
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {isSigningUp ? "Sign Up" : "Login"}
        </CardTitle>
        <CardDescription className="text-center">
          {isSigningUp
            ? "Enter your email and password to create an account."
            : "Enter your email and password to access your account."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAuth} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? "Loading..."
              : isSigningUp
              ? "Sign Up"
              : "Login"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          {isSigningUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <Button
            variant="link"
            onClick={() => setIsSigningUp(!isSigningUp)}
            disabled={isLoading}
          >
            {isSigningUp ? "Login" : "Sign Up"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
