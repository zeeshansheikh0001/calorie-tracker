
"use client";

import Link from "next/link";
import { useState, useEffect } from "react"; // Removed FC as it's not used
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  UserCircle2, 
  HeartPulse,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Pencil,
  EllipsisVertical,
  Loader2
} from "lucide-react";
import type { UserProfile as UserProfileType } from "@/types"; 
import { useUserProfile } from "@/hooks/use-user-profile"; 
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ListItemProps {
  href?: string;
  icon: React.ElementType;
  iconBgClass: string;
  iconClass?: string;
  text: string;
  isLink?: boolean;
  onClick?: () => void;
  isDestructive?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({ href, icon: Icon, iconBgClass, iconClass = "text-current", text, isLink = true, onClick, isDestructive = false }) => {
  const itemContent = (
    <div className={cn(
        "flex items-center justify-between py-3.5 px-3 rounded-lg hover:bg-muted/30 transition-colors w-full",
        isDestructive && "hover:bg-destructive/10"
      )}>
      <div className="flex items-center gap-4">
        <div className={cn("p-2.5 rounded-full flex items-center justify-center", iconBgClass)}>
          <Icon className={cn("h-5 w-5", iconClass, isDestructive && "text-destructive")} />
        </div>
        <span className={cn("text-sm font-medium text-foreground", isDestructive && "text-destructive")}>{text}</span>
      </div>
      {!isDestructive && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
    </div>
  );

  if (isLink && href) {
    return (
      <Link href={href} passHref>
        {itemContent}
      </Link>
    );
  }
  return <button className="w-full text-left" onClick={onClick}>{itemContent}</button>;
};

export default function ProfilePage() {
  const { userProfile, isLoading: isLoadingProfile } = useUserProfile();
  
  // Hardcoded phone for UI replication, actual data should come from profile
  const displayPhone = "+88001712346789"; 

  const handleLogout = () => {
    console.log("Logout clicked");
    alert("Logout functionality using Firebase Auth needs to be implemented.");
  };
  
  const handleAppSettings = () => {
    alert("App Settings page is not yet implemented.");
  };


  return (
    <div className="bg-background">
      <div className="bg-emerald-700 text-white pt-6 sm:pt-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center pb-6">
            <h1 className="text-xl sm:text-2xl font-semibold">Profile</h1>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <EllipsisVertical className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex flex-col items-center pt-2 pb-12 relative">
            {isLoadingProfile ? (
              <>
                <Skeleton className="h-24 w-24 rounded-full border-4 border-emerald-600 shadow-lg" />
                <Skeleton className="h-6 w-32 mt-4" />
                <Skeleton className="h-4 w-24 mt-1" />
              </>
            ) : (
              <>
                <div className="relative">
                  <Avatar className="h-24 w-24 text-3xl border-4 border-emerald-600 shadow-lg">
                    <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} data-ai-hint="user portrait" />
                    <AvatarFallback>{userProfile.name?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
                  </Avatar>
                  <Link href="/profile/edit" passHref>
                    <Button
                      variant="default"
                      size="icon"
                      className="absolute bottom-[-4px] right-[-4px] bg-orange-500 hover:bg-orange-600 text-white rounded-full h-8 w-8 p-1.5 shadow-md border-2 border-emerald-700"
                      aria-label="Edit profile image"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold mt-4">{userProfile.name}</h2>
                <p className="text-sm text-emerald-200 mt-1">{displayPhone}</p> 
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-t-3xl p-5 sm:p-6 mt-[-28px] relative z-10 container mx-auto max-w-3xl">
        <h3 className="text-base sm:text-lg font-semibold mb-4 text-foreground">Account &amp; Settings</h3>
        <div className="space-y-1.5">
          <ListItem 
            href="/profile/edit" 
            icon={UserCircle2} 
            iconBgClass="bg-blue-100"
            iconClass="text-blue-500"
            text="My Profile" 
          />
          <ListItem 
            href="/goals"
            icon={HeartPulse} 
            iconBgClass="bg-red-100"
            iconClass="text-red-500"
            text="My Goals" 
          />
          <ListItem 
            href="/reminders" 
            icon={Bell} 
            iconBgClass="bg-yellow-100"
            iconClass="text-yellow-600"
            text="Notification Settings" 
          />
           <ListItem 
            icon={Settings} 
            iconBgClass="bg-gray-100"
            iconClass="text-gray-500"
            text="App Settings" 
            isLink={false}
            onClick={handleAppSettings}
          />
          <ListItem 
            icon={LogOut} 
            iconBgClass="bg-red-100"
            text="Log Out" 
            isLink={false}
            onClick={handleLogout}
            isDestructive={true}
          />
        </div>
      </div>
    </div>
  );
}
