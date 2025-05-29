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
import { Save, User, Mail, ArrowLeft, UploadCloud, Ruler, Weight, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { UserProfile } from "@/types";

// Define a complete user profile type with required height and weight
const DEFAULT_USER_PROFILE = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  avatarUrl: "https://placehold.co/120x120.png",
  height: 170, // Default height in cm
  weight: 70,  // Default weight in kg
  age: 30,     // Default age
};

export default function EditProfilePage() {
  const [name, setName] = useState(DEFAULT_USER_PROFILE.name);
  const [email, setEmail] = useState(DEFAULT_USER_PROFILE.email);
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_USER_PROFILE.avatarUrl);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [height, setHeight] = useState(DEFAULT_USER_PROFILE.height);
  const [weight, setWeight] = useState(DEFAULT_USER_PROFILE.weight);
  const [age, setAge] = useState(DEFAULT_USER_PROFILE.age);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile) as UserProfile;
        setName(profile.name);
        setEmail(profile.email);
        setAvatarUrl(profile.avatarUrl || DEFAULT_USER_PROFILE.avatarUrl);
        setImagePreview(profile.avatarUrl || null);
        setHeight(profile.height ?? DEFAULT_USER_PROFILE.height);
        setWeight(profile.weight ?? DEFAULT_USER_PROFILE.weight);
        setAge(profile.age ?? DEFAULT_USER_PROFILE.age);
      } catch (e) {
        console.error("Failed to parse user profile from localStorage", e);
      }
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
      avatarUrl: imagePreview || avatarUrl, // Prefer new preview, fallback to old URL
      height,
      weight,
      age
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
            
            <Separator />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age" className="text-sm font-medium flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" /> Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  min={12}
                  max={100}
                  value={age}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setAge(isNaN(value) ? DEFAULT_USER_PROFILE.age : value);
                  }}
                  className="mt-1"
                  placeholder="e.g., 30"
                />
              </div>
              <div>
                <Label htmlFor="height" className="text-sm font-medium flex items-center">
                  <Ruler className="mr-2 h-4 w-4 text-muted-foreground" /> Height (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  min={100}
                  max={250}
                  value={height}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setHeight(isNaN(value) ? DEFAULT_USER_PROFILE.height : value);
                  }}
                  className="mt-1"
                  placeholder="e.g., 170"
                />
              </div>
              <div>
                <Label htmlFor="weight" className="text-sm font-medium flex items-center">
                  <Weight className="mr-2 h-4 w-4 text-muted-foreground" /> Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  min={30}
                  max={300}
                  value={weight}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setWeight(isNaN(value) ? DEFAULT_USER_PROFILE.weight : value);
                  }}
                  className="mt-1"
                  placeholder="e.g., 70"
                />
              </div>
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
