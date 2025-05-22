
"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Save, User, Mail, ArrowLeft, UploadCloud } from "lucide-react";
import type { UserProfile } from "@/types";

const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  avatarUrl: "https://placehold.co/120x120.png",
};

export default function EditProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(DEFAULT_USER_PROFILE.avatarUrl);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
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
        setAvatarUrl(profile.avatarUrl || DEFAULT_USER_PROFILE.avatarUrl);
        setImagePreview(profile.avatarUrl || null);
      } catch (e) {
        console.error("Failed to parse user profile from localStorage", e);
        setName(DEFAULT_USER_PROFILE.name);
        setEmail(DEFAULT_USER_PROFILE.email);
        setAvatarUrl(DEFAULT_USER_PROFILE.avatarUrl);
        setImagePreview(DEFAULT_USER_PROFILE.avatarUrl || null);
      }
    } else {
      setName(DEFAULT_USER_PROFILE.name);
      setEmail(DEFAULT_USER_PROFILE.email);
      setAvatarUrl(DEFAULT_USER_PROFILE.avatarUrl);
      setImagePreview(DEFAULT_USER_PROFILE.avatarUrl || null);
    }
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name.trim() || !email.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and email cannot be empty.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const updatedProfile: UserProfile = { 
      name, 
      email, 
      avatarUrl: imagePreview || avatarUrl // Prefer new preview, fallback to old URL
    };
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));

    setTimeout(() => {
      toast({
        title: "Profile Updated!",
        description: "Your profile details have been saved.",
      });
      setIsLoading(false);
      router.push("/profile"); 
    }, 500);
  };

  return (
    <div className="container mx-auto max-w-xl py-8 px-4">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4 group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Profile
        </Button>
      <Card className="shadow-xl rounded-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <User className="mr-2 h-6 w-6 text-primary" />
            Edit Your Profile
          </CardTitle>
          <CardDescription>
            Update your personal information and profile picture.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32 border-4 border-muted shadow-md">
                <AvatarImage src={imagePreview || DEFAULT_USER_PROFILE.avatarUrl} alt={name} data-ai-hint="user avatar" />
                <AvatarFallback className="text-4xl">
                  {name?.charAt(0).toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <Label htmlFor="avatarUpload" className="cursor-pointer text-sm text-primary hover:underline flex items-center gap-2">
                <UploadCloud className="h-4 w-4" />
                Change Profile Picture
              </Label>
              <Input
                id="avatarUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only" // Hidden, triggered by label
              />
            </div>

            <Separator />

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
