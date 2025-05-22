"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanLine, AlertTriangle } from "lucide-react";
import Image from "next/image";

export default function LogFoodByBarcodePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-lg mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <ScanLine className="mr-2 h-6 w-6 text-primary" />
            Scan Barcode
          </CardTitle>
          <CardDescription>
            Use your device's camera to scan a product barcode and automatically log its nutritional information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <Image 
            src="https://placehold.co/300x200.png" 
            alt="Barcode scanning illustration" 
            width={300} 
            height={200} 
            className="mx-auto rounded-lg shadow-md w-full max-w-[300px] h-auto"
            data-ai-hint="barcode scanner" 
          />
          <p className="text-muted-foreground">
            Point your camera at a barcode. We'll fetch the details for you.
          </p>
          <Button size="lg" className="w-full sm:w-auto" onClick={() => alert("Barcode scanning feature coming soon!")}>
            <ScanLine className="mr-2 h-5 w-5" />
            Start Scanning
          </Button>
          <div className="mt-4 p-4 bg-secondary/30 border border-dashed border-border rounded-md flex items-center justify-center text-sm">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
            <p className="text-muted-foreground">This feature is currently under development. Stay tuned!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
