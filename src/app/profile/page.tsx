
"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Edit3, Shield, Bell, HeartPulse } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  return (
    <div className="container mx-auto max-w-xl py-8 px-4">
      <Card className="shadow-xl rounded-xl">
        <CardHeader className="items-center text-center pt-8">
          <Avatar className="h-28 w-28 mb-4 border-2 border-primary/20 shadow-md">
            <AvatarImage src="https://placehold.co/120x120.png" alt="Alex" data-ai-hint="user avatar" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-semibold">Alex Johnson</CardTitle>
          <CardDescription className="pb-2">alex.johnson@example.com</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-6 pb-8">
          <Button variant="outline" className="w-full justify-start gap-3 py-6 text-base transition-colors duration-150 hover:bg-muted/50">
            <Edit3 className="h-5 w-5 text-primary" />
            Edit Profile
          </Button>
          
          <Link href="/goals" passHref>
            <Button variant="outline" className="w-full justify-start gap-3 py-6 text-base transition-colors duration-150 hover:bg-muted/50">
              <HeartPulse className="h-5 w-5 text-primary" />
              My Goals
            </Button>
          </Link>
          
          <Separator className="my-4" />
          
          <Link href="/reminders" passHref>
            <Button variant="outline" className="w-full justify-start gap-3 py-6 text-base transition-colors duration-150 hover:bg-muted/50">
              <Bell className="h-5 w-5 text-primary" />
              Notification Settings
            </Button>
          </Link>
          
          <Button variant="outline" className="w-full justify-start gap-3 py-6 text-base transition-colors duration-150 hover:bg-muted/50">
            <Settings className="h-5 w-5 text-primary" />
            App Settings
          </Button>
          
          <Button variant="outline" className="w-full justify-start gap-3 py-6 text-base transition-colors duration-150 hover:bg-muted/50">
            <Shield className="h-5 w-5 text-primary" />
            Privacy & Security
          </Button>
          
          <Separator className="my-4" />
          
          <Button variant="destructive" className="w-full justify-start gap-3 py-6 text-base transition-colors duration-150 hover:bg-destructive/90">
            <LogOut className="h-5 w-5" />
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
