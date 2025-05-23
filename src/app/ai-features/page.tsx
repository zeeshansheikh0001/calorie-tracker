
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function AiFeaturesPage() {
  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="max-w-md w-full shadow-xl animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
        <CardHeader className="text-center">
          <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-bold">AI Features</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <CardDescription className="text-base">
            Exciting new AI-powered tools and insights are
            <br />
            <span className="font-semibold text-primary">Coming Soon!</span>
          </CardDescription>
          <p className="text-sm text-muted-foreground mt-4">
            Stay tuned for updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
