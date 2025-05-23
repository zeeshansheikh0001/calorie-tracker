
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Edit3, Shield, Bell, HeartPulse } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { UserProfile } from "@/types";

const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  avatarUrl: "https://placehold.co/120x120.png", // Default placeholder
};

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      try {
        const parsedProfile: UserProfile = JSON.parse(storedProfile);
        // Ensure avatarUrl is part of the loaded profile or fallback to default
        setUserProfile({ ...DEFAULT_USER_PROFILE, ...parsedProfile });
      } catch (e) {
        console.error("Failed to parse user profile from localStorage", e);
        setUserProfile(DEFAULT_USER_PROFILE); // Fallback to default
      }
    } else {
      setUserProfile(DEFAULT_USER_PROFILE);
    }
  }, []);

  return (
    <div className="container mx-auto max-w-xl py-8 px-4">
      <Card className="shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="items-center text-center pt-8 pb-6 bg-gradient-to-b from-muted/30 to-transparent">
          <Avatar className="h-32 w-32 mb-4 border-4 border-background shadow-lg">
            <AvatarImage src={userProfile.avatarUrl || DEFAULT_USER_PROFILE.avatarUrl} alt={userProfile.name || ""} data-ai-hint="user avatar" />
            <AvatarFallback className="text-4xl">
              {userProfile.name?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold">{userProfile.name}</CardTitle>
          <CardDescription className="text-base">{userProfile.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 p-4 md:p-6">
          <div>
            <Link href="/profile/edit" passHref>
              <Button variant="outline" className="w-full justify-start gap-3 py-3 text-base transition-colors duration-150 hover:bg-muted/50 rounded-lg">
                <Edit3 className="h-5 w-5 text-primary" />
                Edit Profile
              </Button>
            </Link>
            <Link href="/goals" passHref>
              <Button variant="outline" className="w-full justify-start gap-3 py-3 text-base transition-colors duration-150 hover:bg-muted/50 rounded-lg">
                <HeartPulse className="h-5 w-5 text-primary" />
                My Goals
              </Button>
            </Link>
          </div>
          
          {/* The Separator previously below "My Goals" is removed */}
          
          <Link href="/reminders" passHref>
            <Button variant="outline" className="w-full justify-start gap-3 py-3 text-base transition-colors duration-150 hover:bg-muted/50 rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
              Notification Settings
            </Button>
          </Link>
          
          <Button variant="outline" className="w-full justify-start gap-3 py-3 text-base transition-colors duration-150 hover:bg-muted/50 rounded-lg">
            <Settings className="h-5 w-5 text-primary" />
            App Settings
          </Button>
          
          <Button variant="outline" className="w-full justify-start gap-3 py-3 text-base transition-colors duration-150 hover:bg-muted/50 rounded-lg">
            <Shield className="h-5 w-5 text-primary" />
            Privacy & Security
          </Button>
          
          <Separator className="my-4" />
          
          <Button variant="destructive" className="w-full justify-start gap-3 py-3 text-base transition-colors duration-150 hover:bg-destructive/90 rounded-lg">
            <LogOut className="h-5 w-5" />
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
