
"use client";

import { useState, FormEvent } from "react";
// TODO: Uncomment when Supabase auth is fully implemented
// import { createClient } from "@/lib/supabase/client";
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
import { useLanguage } from "@/lib/i18n/provider";

export function AuthForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  // TODO: Uncomment when Supabase auth is fully implemented
  // const supabase = createClient();

  // TODO: Uncomment when Supabase auth is fully implemented
  /*
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
  */

  // Temporary mock authentication for development
  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: t("auth.disabledTitle"),
      description: t("auth.disabledDesc"),
      variant: "default",
    });

    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {isSigningUp ? t("auth.signUp") : t("auth.login")}
        </CardTitle>
        <CardDescription className="text-center">
          {isSigningUp
            ? t("auth.signUpDesc")
            : t("auth.loginDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAuth} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
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
              ? t("auth.loading")
              : isSigningUp
              ? t("auth.signUp")
              : t("auth.login")}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          {isSigningUp ? t("auth.alreadyHaveAccount") : t("auth.noAccount")}{" "}
          <Button
            variant="link"
            onClick={() => setIsSigningUp(!isSigningUp)}
            disabled={isLoading}
          >
            {isSigningUp ? t("auth.login") : t("auth.signUp")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
