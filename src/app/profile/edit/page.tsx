
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, User, Mail, ArrowLeft } from "lucide-react";
import type { UserProfile } from "@/types";

const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
};

export default function EditProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      try {
        const profile: UserProfile = JSON.parse(storedProfile);
        setName(profile.name);
        setEmail(profile.email);
      } catch (e) {
        console.error("Failed to parse user profile from localStorage", e);
        setName(DEFAULT_USER_PROFILE.name);
        setEmail(DEFAULT_USER_PROFILE.email);
      }
    } else {
      setName(DEFAULT_USER_PROFILE.name);
      setEmail(DEFAULT_USER_PROFILE.email);
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and email cannot be empty.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const updatedProfile: UserProfile = { name, email };
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Profile Updated!",
        description: "Your profile details have been saved.",
      });
      setIsLoading(false);
      router.push("/profile"); // Navigate back to profile page
    }, 500);
  };

  return (
    <div className="container mx-auto max-w-xl py-8 px-4">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4 group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Profile
        </Button>
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <User className="mr-2 h-6 w-6 text-primary" />
            Edit Your Profile
          </CardTitle>
          <CardDescription>
            Update your personal information.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium flex items-center">
                <User className="mr-2 h-4 w-4 text-muted-foreground" /> Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                placeholder="e.g., Alex Johnson"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="e.g., alex.johnson@example.com"
                required
              />
              {/* Consider making email read-only if it's tied to an auth system */}
              {/* <Input id="email" type="email" value={email} readOnly className="mt-1 bg-muted/50" /> */}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <Save className="mr-2 h-4 w-4 animate-pulse" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
