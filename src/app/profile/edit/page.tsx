
"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Save, User, Mail, ArrowLeft, UploadCloud, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { UserProfile } from "@/types";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditProfilePage() {
  const { userProfile: initialProfile, updateUserProfile, isLoading: isLoadingProfile } = useUserProfile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // const [imageFile, setImageFile] = useState<File | null>(null); // Not strictly needed if only DataURI is stored
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoadingProfile && initialProfile) {
      setName(initialProfile.name);
      setEmail(initialProfile.email);
      setImagePreview(initialProfile.avatarUrl || null);
    }
  }, [initialProfile, isLoadingProfile]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (!name.trim() || !email.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and email cannot be empty.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    try {
      const updatedProfileData: UserProfile = { 
        name, 
        email, 
        avatarUrl: imagePreview || initialProfile.avatarUrl // Use new preview, or fallback to existing
      };
      await updateUserProfile(updatedProfileData);
      toast({
        title: "Profile Updated!",
        description: "Your profile details have been saved.",
      });
      router.push("/profile"); 
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Update Failed",
        description: "Could not save profile changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="container mx-auto max-w-xl py-8 px-4">
        <Card className="shadow-xl rounded-xl overflow-hidden">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-3/4 mt-1" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-32 w-32 rounded-full" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Separator />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-28" />
          </CardFooter>
        </Card>
      </div>
    );
  }

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
                <AvatarImage src={imagePreview || undefined} alt={name} data-ai-hint="user avatar" />
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
                className="sr-only"
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
            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
