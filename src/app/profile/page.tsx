
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  LogOut, 
  Edit3, 
  Shield, 
  Bell, 
  HeartPulse, 
  UserCircle2, 
  ChevronRight,
  Package,
  CircleDollarSign,
  Lock,
  Languages,
  Pencil,
  EllipsisVertical
} from "lucide-react";
import type { UserProfile as UserProfileType } from "@/types"; // Renamed to avoid conflict
import { useUserProfile } from "@/hooks/use-user-profile"; // For avatar
import { cn } from "@/lib/utils";

const DEFAULT_USER_PROFILE_DATA: UserProfileType = {
  name: "Md Abu Ubayda", // Hardcoded to match image
  email: "md.ubayda@example.com", // Placeholder email
  avatarUrl: "https://placehold.co/120x120.png", 
};

interface ListItemProps {
  href: string;
  icon: React.ElementType;
  iconBgClass: string;
  iconClass?: string;
  text: string;
  isLink?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({ href, icon: Icon, iconBgClass, iconClass = "text-current", text, isLink = true }) => {
  const content = (
    <div className="flex items-center justify-between py-3.5 px-3 rounded-lg hover:bg-muted/30 transition-colors w-full">
      <div className="flex items-center gap-4">
        <div className={cn("p-2.5 rounded-full flex items-center justify-center", iconBgClass)}>
          <Icon className={cn("h-5 w-5", iconClass)} />
        </div>
        <span className="text-sm font-medium text-foreground">{text}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
  );

  if (isLink) {
    return (
      <Link href={href} passHref>
        {content}
      </Link>
    );
  }
  return <button className="w-full text-left">{content}</button>;
};

export default function ProfilePage() {
  // useUserProfile hook is used here primarily for the avatar, as name/phone are hardcoded from image
  const { userProfile: dynamicUserProfile, isLoading: isLoadingProfile } = useUserProfile();
  
  // For display, use hardcoded name & phone from image, avatar from hook/default
  const displayProfile = {
    name: "Md Abu Ubayda",
    phone: "+88001712346789",
    avatarUrl: dynamicUserProfile.avatarUrl || DEFAULT_USER_PROFILE_DATA.avatarUrl,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Green Section */}
      <div className="bg-emerald-700 text-white pt-6 sm:pt-8">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="flex justify-between items-center pb-6">
            <h1 className="text-xl sm:text-2xl font-semibold">Profile</h1>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <EllipsisVertical className="h-6 w-6" />
            </Button>
          </div>

          {/* User Info */}
          <div className="flex flex-col items-center pt-2 pb-12 relative">
            <div className="relative">
              <Avatar className="h-24 w-24 text-3xl border-4 border-emerald-600 shadow-lg">
                <AvatarImage src={displayProfile.avatarUrl} alt={displayProfile.name} data-ai-hint="user portrait" />
                <AvatarFallback>{displayProfile.name?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
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
            <h2 className="text-lg sm:text-xl font-semibold mt-4">{displayProfile.name}</h2>
            <p className="text-sm text-emerald-200 mt-1">{displayProfile.phone}</p>
          </div>
        </div>
      </div>

      {/* Bottom Card Section */}
      <div className="bg-card text-card-foreground rounded-t-3xl shadow-2xl p-5 sm:p-6 mt-[-28px] relative z-10 container mx-auto max-w-3xl">
        <h3 className="text-base sm:text-lg font-semibold mb-4 text-foreground">Account Overview</h3>
        <div className="space-y-1.5">
          <ListItem 
            href="/profile/edit" 
            icon={UserCircle2} 
            iconBgClass="bg-blue-100"
            iconClass="text-blue-500"
            text="My Profile" 
          />
          <ListItem 
            href="#" 
            icon={Package} 
            iconBgClass="bg-green-100"
            iconClass="text-green-600"
            text="My Orders" 
            isLink={false} // Example: make it a button if not a link yet
          />
          <ListItem 
            href="#" 
            icon={CircleDollarSign} 
            iconBgClass="bg-purple-100"
            iconClass="text-purple-600"
            text="Refund" 
            isLink={false}
          />
          <ListItem 
            href="#" 
            icon={Lock} 
            iconBgClass="bg-orange-100"
            iconClass="text-orange-500"
            text="Change Password" 
            isLink={false}
          />
          <ListItem 
            href="#" 
            icon={Languages} 
            iconBgClass="bg-pink-100"
            iconClass="text-pink-500"
            text="Change Language" 
            isLink={false}
          />
        </div>
      </div>
    </div>
  );
}
