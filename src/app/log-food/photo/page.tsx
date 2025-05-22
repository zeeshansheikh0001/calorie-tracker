"use client";

import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, UploadCloud, AlertCircle, CheckCircle, Pizza } from "lucide-react";
import Image from "next/image";
import { analyzeFoodPhoto, type AnalyzeFoodPhotoOutput, type AnalyzeFoodPhotoInput } from "@/ai/flows/analyze-food-photo";
import NutritionDisplay from "@/components/food/nutrition-display";
import { useToast } from "@/hooks/use-toast";

export default function LogFoodByPhotoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeFoodPhotoOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select a photo to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        if (!base64data) {
          setError("Could not read file data.");
          setIsLoading(false);
          return;
        }
        
        const input: AnalyzeFoodPhotoInput = { photoDataUri: base64data };
        const result = await analyzeFoodPhoto(input);
        setAnalysisResult(result);
        toast({
          title: "Analysis Complete",
          description: "Nutritional information has been estimated.",
          variant: "default",
          action: <CheckCircle className="text-green-500" />,
        });
      };
      reader.onerror = () => {
        setError("Error reading file.");
        setIsLoading(false);
      };
    } catch (err) {
      console.error("Analysis error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during analysis.";
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
        action: <AlertCircle className="text-red-500" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToLog = () => {
    if (!analysisResult) return;
    // In a real app, this would add the meal to the user's daily log
    // For now, just show a toast and clear the result
    toast({
      title: "Meal Logged (Simulated)",
      description: `${analysisResult.calorieEstimate} kcal added to your log.`,
      variant: "default",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <Pizza className="mr-2 h-6 w-6 text-primary" />
            Log Food with Photo AI
          </CardTitle>
          <CardDescription>
            Upload a photo of your meal, and our AI will estimate its nutritional content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="food-photo" className="block text-sm font-medium text-foreground mb-1">
              Upload Meal Photo
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-border hover:border-primary transition-colors">
              <div className="space-y-1 text-center">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Selected meal"
                    width={400}
                    height={300}
                    className="mx-auto h-48 w-auto object-contain rounded-md"
                    data-ai-hint="food meal"
                  />
                ) : (
                  <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                )}
                <div className="flex text-sm text-muted-foreground justify-center">
                  <label
                    htmlFor="food-photo-input"
                    className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring"
                  >
                    <span>{selectedFile ? 'Change photo' : 'Upload a file'}</span>
                    <Input id="food-photo-input" name="food-photo" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                  </label>
                  {!selectedFile && <p className="pl-1">or drag and drop</p>}
                </div>
                {!selectedFile && <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>}
                {selectedFile && <p className="text-xs text-muted-foreground pt-2">{selectedFile.name}</p>}
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="flex items-center justify-center p-6 bg-secondary/50 rounded-md">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3 text-foreground">Analyzing your meal, please wait...</p>
            </div>
          )}

          {analysisResult && !isLoading && (
            <NutritionDisplay result={analysisResult} />
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-3">
          {analysisResult && !isLoading && (
             <Button onClick={handleAddToLog} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="mr-2 h-4 w-4" />
              Add to Daily Log
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={!selectedFile || isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Pizza className="mr-2 h-4 w-4" />
            )}
            {analysisResult ? 'Re-analyze' : 'Analyze Meal'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
