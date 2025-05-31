"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  UserCircle2, 
  HeartPulse,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Pencil,
  Calendar,
  User,
  Info,
  ArrowRight,
  RefreshCw,
  Shield,
  Camera,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ListItemProps {
  href?: string;
  icon: React.ElementType;
  iconColorClass: string;
  text: string;
  subtext?: string;
  isLink?: boolean;
  onClick?: () => void;
  isDestructive?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({ 
  href, 
  icon: Icon, 
  iconColorClass, 
  text, 
  subtext, 
  isLink = true, 
  onClick, 
  isDestructive = false 
}) => {
  const itemContent = (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-xl transition-all duration-200",
      isDestructive 
        ? "hover:bg-destructive/10 group" 
        : "hover:bg-primary/5 hover:shadow-sm group"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2.5 rounded-full transition-colors duration-200",
          `${iconColorClass}/10 group-hover:${iconColorClass}/20`
        )}>
          <Icon className={cn(
            "h-5 w-5", 
            isDestructive ? "text-destructive" : `text-${iconColorClass}`
          )} />
        </div>
        <div>
          <div className={cn(
            "font-medium",
            isDestructive && "text-destructive"
          )}>
            {text}
          </div>
          {subtext && (
            <div className="text-xs text-muted-foreground mt-0.5">{subtext}</div>
          )}
        </div>
      </div>
      <div className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-200",
        isDestructive 
          ? "text-destructive group-hover:bg-destructive/10" 
          : "text-muted-foreground group-hover:bg-primary/10"
      )}>
        {isDestructive ? (
          <LogOut className="h-4 w-4" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
      </div>
    </div>
  );

  if (isLink && href) {
    return (
      <Link href={href} className="block">
        {itemContent}
      </Link>
    );
  }
  
  return (
    <button className="w-full text-left" onClick={onClick}>
      {itemContent}
    </button>
  );
};

export default function ProfilePage() {
  const { userProfile, isLoading, updateUserProfile } = useUserProfile();
  const { toast } = useToast();
  const [avatarHover, setAvatarHover] = useState(false);
  
  const handleLogout = () => {
    toast({
      title: "Coming Soon",
      description: "Logout functionality is not yet implemented.",
    });
  };
  
  const handleAppSettings = () => {
    toast({
      title: "Coming Soon",
      description: "App Settings page is not yet implemented.",
    });
  };

  // Get gender label with proper capitalization
  const getGenderLabel = (gender?: string) => {
    if (!gender) return "Not specified";
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile Header Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/80 to-primary mb-6 text-primary-foreground overflow-hidden">
          <CardContent className="p-6 relative">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 right-0 bottom-0 opacity-10 pointer-events-none">
              <svg width="100%" height="100%">
                <pattern id="pattern-circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
                  <circle id="pattern-circle" cx="20" cy="20" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"></circle>
                </pattern>
                <rect id="rect" x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
              </svg>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
              {isLoading ? (
                <Skeleton className="h-24 w-24 rounded-full" />
              ) : (
                <motion.div 
                  className="relative"
                  onHoverStart={() => setAvatarHover(true)}
                  onHoverEnd={() => setAvatarHover(false)}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-primary-foreground/20 shadow-xl">
                      <AvatarImage 
                        src={userProfile.avatarUrl} 
                        alt={userProfile.name || "User"} 
                      />
                      <AvatarFallback className="text-3xl">
                        {userProfile.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <AnimatePresence>
                      {avatarHover && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"
                        >
                          <Camera className="h-8 w-8 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <Link href="/profile/edit" passHref>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-lg"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
              
              <div className="flex flex-col items-center sm:items-start space-y-1 sm:space-y-2 flex-1">
                {isLoading ? (
                  <>
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-5 w-32" />
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold">{userProfile.name || "Guest User"}</h1>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {userProfile.gender && (
                        <Badge variant="secondary" className="font-normal py-0.5">
                          <User className="h-3 w-3 mr-1" />
                          {getGenderLabel(userProfile.gender)}
                        </Badge>
                      )}
                      {userProfile.age && (
                        <Badge variant="secondary" className="font-normal py-0.5">
                          <Calendar className="h-3 w-3 mr-1" />
                          {userProfile.age} years
                        </Badge>
                      )}
                      {userProfile.email && (
                        <Badge variant="secondary" className="font-normal py-0.5 max-w-[180px] truncate">
                          {userProfile.email}
                        </Badge>
                      )}
                    </div>
                  </>
                )}
                
                <div className="flex gap-2 mt-3">
                  <Link href="/profile/edit">
                    <Button size="sm" variant="secondary" className="h-8">
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Settings Section */}
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-primary" />
          Settings & Preferences
        </h2>
        
        <Card className="border-border/40 shadow-md">
          <CardContent className="p-3">
            <ListItem 
              href="/goals" 
              icon={HeartPulse} 
              iconColorClass="text-red-500" 
              text="Nutrition Goals" 
              subtext="Set and manage your daily nutrition targets"
            />
            
            <Separator className="my-1" />
            
            <ListItem 
              href="/reminders" 
              icon={Bell} 
              iconColorClass="text-amber-500" 
              text="Reminders & Notifications" 
              subtext="Configure when and how you're notified"
            />
            
            <Separator className="my-1" />
            
            <ListItem 
              href="/privacy"
              icon={Shield} 
              iconColorClass="text-emerald-500" 
              text="Privacy & Security" 
              subtext="Manage your data and privacy preferences"
              isLink={true}
            />
            
            <Separator className="my-1" />
            
            <ListItem 
              href="/terms"
              icon={FileText} 
              iconColorClass="text-purple-500" 
              text="Terms of Service" 
              subtext="Read our terms and conditions"
              isLink={true}
            />
            
            <Separator className="my-1" />
            
            <ListItem 
              href="/about"
              icon={Info} 
              iconColorClass="text-blue-500" 
              text="About & Help" 
              subtext="App information and support"
              isLink={true}
            />
            
            <Separator className="my-1" />
            
            <ListItem 
              icon={LogOut} 
              iconColorClass="text-destructive" 
              text="Log Out" 
              subtext="Sign out of your account"
              isLink={false}
              onClick={handleLogout}
              isDestructive={true}
            />
          </CardContent>
        </Card>
        
        {/* App Version */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Calorie Tracker v1.0.0</p>
          <p className="mt-1">© 2025 All Rights Reserved</p>
        </div>
      </motion.div>
    </div>
  );
}
