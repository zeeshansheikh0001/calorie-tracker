
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Edit3, Shield, Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  return (
    <div className="container mx-auto max-w-xl py-8 px-4">
      <Card className="shadow-xl">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src="https://placehold.co/100x100.png" alt="Alex" data-ai-hint="user avatar" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl">Alex Johnson</CardTitle>
          <CardDescription>alex.johnson@example.com</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button variant="outline" className="w-full justify-start">
            <Edit3 className="mr-3 h-5 w-5" />
            Edit Profile
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <HeartPulse className="mr-3 h-5 w-5" /> {/* Using HeartPulse as it's already in use */}
            My Goals
          </Button>
          <Separator />
          <Button variant="outline" className="w-full justify-start">
            <Bell className="mr-3 h-5 w-5" />
            Notification Settings
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Settings className="mr-3 h-5 w-5" />
            App Settings
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Shield className="mr-3 h-5 w-5" />
            Privacy & Security
          </Button>
          <Separator />
          <Button variant="destructive" className="w-full">
            <LogOut className="mr-3 h-5 w-5" />
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
