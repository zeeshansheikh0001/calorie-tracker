
"use client";

import { useState, type ChangeEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, UploadCloud, AlertCircle, CheckCircle, Pizza, Camera, VideoOff, ThumbsDown } from "lucide-react";
import Image from "next/image";
import { analyzeFoodPhoto, type AnalyzeFoodPhotoOutput, type AnalyzeFoodPhotoInput } from "@/ai/flows/analyze-food-photo";
import NutritionDisplay from "@/components/food/nutrition-display";
import { useToast } from "@/hooks/use-toast";
import { useDailyLog } from "@/hooks/use-daily-log";

export default function LogFoodByPhotoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For AI analysis
  const [analysisResult, setAnalysisResult] = useState<AnalyzeFoodPhotoOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { addFoodEntry } = useDailyLog();

  const [tabMode, setTabMode] = useState<'upload' | 'camera'>('upload');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [capturedDataUri, setCapturedDataUri] = useState<string | null>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [attemptId, setAttemptId] = useState(0); 

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let readinessTimeout: NodeJS.Timeout | null = null;

    const cleanupVideoEventListeners = () => {
      const videoNode = videoRef.current; 
      if (videoNode) {
        videoNode.onloadedmetadata = null;
        videoNode.onplaying = null;
        videoNode.onerror = null;
      }
    };

    const performCleanup = () => {
      const videoNode = videoRef.current; 
      console.log("Camera: Full cleanup called");
      if (readinessTimeout) clearTimeout(readinessTimeout);
      cleanupVideoEventListeners();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        console.log("Camera: Stream tracks stopped");
        stream = null; 
      }
      if (videoNode && videoNode.srcObject) { 
        videoNode.srcObject = null;
        console.log("Camera: videoNode srcObject cleared");
      }
      setIsStreamActive(false);
    };

    const startCamera = async () => {
      const videoNode = videoRef.current; 
      if (!videoNode) {
        console.error("Camera: startCamera - videoRef.current is null. Aborting.");
        toast({ variant: 'destructive', title: 'Camera Component Error', description: 'Camera element not ready. Please refresh or try again.' });
        setHasCameraPermission(false);
        setIsCameraLoading(false);
        return;
      }

      console.log("Camera: Attempting to start...");
      setIsCameraLoading(true);
      setHasCameraPermission(undefined); 
      setIsStreamActive(false); 

      const onMetadataLoaded = () => {
        if (!videoNode) return;
        console.log("Camera: onloadedmetadata. Dimensions:", videoNode.videoWidth, videoNode.videoHeight);
        if (videoNode.videoWidth > 0 && videoNode.videoHeight > 0) {
          // If onplaying is defined, call it manually. Otherwise videoNode.play() should trigger it.
          if (videoNode.onplaying) videoNode.onplaying(new Event('playing')); 
        } else {
          console.warn("Camera: onloadedmetadata - video dimensions are zero.");
        }
      };

      const onPlaying = () => {
        if (!videoNode) return;
        console.log("Camera: onplaying.");
        if (videoNode.videoWidth > 0 && videoNode.videoHeight > 0) {
          if (readinessTimeout) clearTimeout(readinessTimeout);
          console.log("Camera: Video ready and playing.");
          setIsStreamActive(true);
          setIsCameraLoading(false);
        }
      };

      const onVideoError = (e: Event | string) => {
        console.error("Camera: videoNode.onerror:", e);
        if (readinessTimeout) clearTimeout(readinessTimeout);
        toast({ variant: "destructive", title: "Camera Error", description: "The camera stream encountered an error." });
        performCleanup(); 
        setHasCameraPermission(false);
        setIsCameraLoading(false);
      };
      
      try {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        console.log("Camera: Permission granted.");
        setHasCameraPermission(true);

        videoNode.srcObject = stream;
        cleanupVideoEventListeners(); 
        videoNode.onloadedmetadata = onMetadataLoaded;
        videoNode.onplaying = onPlaying;
        videoNode.onerror = onVideoError;
        
        readinessTimeout = setTimeout(() => {
          console.warn("Camera: Timeout waiting for video metadata/play (10s).");
          toast({ variant: "destructive", title: "Camera Timeout", description: "Camera took too long to initialize. Please check permissions or try another browser."});
          performCleanup();
          setHasCameraPermission(false); 
          setIsCameraLoading(false);
        }, 10000);

        await videoNode.play();
        console.log("Camera: videoNode.play() called.");

      } catch (err) {
        console.error('Camera: Error during setup:', err);
        const errorMessage = (err as Error)?.message || 'Could not access camera. Please enable permissions in your browser settings and ensure it is not used by another app.';
        setHasCameraPermission(false);
        setIsStreamActive(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied/Error',
          description: errorMessage,
        });
        setIsCameraLoading(false);
        if (stream) stream.getTracks().forEach(track => track.stop()); 
      }
    };

    if (tabMode === 'camera' && !previewUrl) {
      startCamera();
    } else {
      performCleanup();
    }

    return performCleanup; 
  }, [tabMode, previewUrl, toast, attemptId]); 


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setCapturedDataUri(null);
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleCapturePhoto = () => {
    const videoNode = videoRef.current;
    const canvasNode = canvasRef.current;
    console.log("Attempting to capture photo. Stream active:", isStreamActive, "Video Ref:", videoNode);
    if (videoNode && canvasNode && videoNode.srcObject && isStreamActive) {
      if (videoNode.videoWidth === 0 || videoNode.videoHeight === 0) {
        console.error("Capture failed: Video dimensions are zero.", { w: videoNode.videoWidth, h: videoNode.videoHeight });
        setError("Camera reported zero dimensions. Cannot capture. Try reopening camera tab or re-granting permission.");
        toast({ variant: "destructive", title: "Camera Error", description: "Video dimensions are zero. Please ensure the camera has started correctly." });
        return;
      }

      canvasNode.width = videoNode.videoWidth;
      canvasNode.height = videoNode.videoHeight;
      console.log(`Canvas dimensions set to: ${canvasNode.width}x${canvasNode.height}`);

      const context = canvasNode.getContext('2d');
      if (context) {
        context.drawImage(videoNode, 0, 0, canvasNode.width, canvasNode.height);
        console.log("Image drawn to canvas");
        const dataUri = canvasNode.toDataURL('image/jpeg');

        setPreviewUrl(dataUri); 
        setCapturedDataUri(dataUri);
        setSelectedFile(null);
        setAnalysisResult(null);
        setError(null);
      } else {
        console.error("Could not get 2D context from canvas.");
        setError("Could not get canvas context to capture photo.");
        toast({ variant: "destructive", title: "Capture Error", description: "Failed to process image from camera." });
      }
    } else {
      let logMessage = "Capture prerequisites not met: ";
      if (!videoNode) logMessage += "videoRef is null. ";
      if (!canvasNode) logMessage += "canvasRef is null. ";
      if (videoNode && !videoNode.srcObject) logMessage += "video srcObject is null. ";
      if (!isStreamActive) logMessage += "Stream is not marked as active. ";
      console.error(logMessage, { videoSrcObj: videoNode?.srcObject, isStreamActiveVal: isStreamActive });
      setError("Camera or canvas not available, or stream not active for capture.");
      toast({ variant: "destructive", title: "Camera Not Ready", description: "Camera not ready to capture. Please try reopening the camera tab or check permissions." });
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    let photoDataUriToAnalyze: string | null = null;

    if (capturedDataUri) {
      photoDataUriToAnalyze = capturedDataUri;
    } else if (selectedFile) {
      if (previewUrl && previewUrl.startsWith('data:')) {
         photoDataUriToAnalyze = previewUrl;
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        try {
            photoDataUriToAnalyze = await new Promise<string>((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = (err) => reject(err);
            });
        } catch (readError) {
            console.error("Error reading file for analysis:", readError);
            setError("Error reading file for analysis.");
            setIsLoading(false);
            return;
        }
      }
    }

    if (!photoDataUriToAnalyze) {
      setError("Please select or capture a photo to analyze.");
      setIsLoading(false);
      return;
    }

    try {
      const input: AnalyzeFoodPhotoInput = { photoDataUri: photoDataUriToAnalyze };
      const result = await analyzeFoodPhoto(input);
      setAnalysisResult(result);

      if (!result.isFoodItem) {
        toast({
          title: "Not a Food Item?",
          description: "The AI thinks this might not be food. Nutritional analysis could be off.",
          variant: "default",
          action: <ThumbsDown className="text-yellow-500" />,
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: "Nutritional information has been estimated.",
          variant: "default",
          action: <CheckCircle className="text-green-500" />,
        });
      }
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

    if (!analysisResult.isFoodItem) {
        toast({
            title: "Cannot Log",
            description: "This item was not identified as food and cannot be added to the log.",
            variant: "destructive",
        });
        return;
    }
    
    let mealName = "Unnamed Meal";
    if (analysisResult.ingredients && analysisResult.ingredients.length > 0) {
      mealName = analysisResult.ingredients.slice(0, 3).join(", "); 
      if (analysisResult.ingredients.length > 3) mealName += "...";
    } else if (analysisResult.isFoodItem) {
      mealName = "AI Analyzed Meal";
    }

    addFoodEntry({
      name: mealName,
      calories: analysisResult.calorieEstimate,
      protein: analysisResult.proteinEstimate,
      fat: analysisResult.fatEstimate,
      carbs: analysisResult.carbEstimate,
    });

    toast({
      title: "Meal Logged!",
      description: `${mealName} (${analysisResult.calorieEstimate} kcal) added to your daily log.`,
      variant: "default",
      action: <CheckCircle className="text-green-500" />,
    });
    resetPreview();
  };

  const resetPreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCapturedDataUri(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <Pizza className="mr-2 h-6 w-6 text-primary" />
            Log Food with Photo AI
          </CardTitle>
          <CardDescription>
            Upload a photo or use your camera. Our AI will estimate its nutritional content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={tabMode} onValueChange={(value) => {
            const newTabMode = value as 'upload' | 'camera';
            setTabMode(newTabMode);
            if (previewUrl) resetPreview(); 
            if (newTabMode === 'camera' && !previewUrl) { 
                 setAttemptId(prev => prev + 1); 
            }
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload"><UploadCloud className="mr-2 h-4 w-4" />Upload Photo</TabsTrigger>
              <TabsTrigger value="camera"><Camera className="mr-2 h-4 w-4" />Use Camera</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <div className="mt-4 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-border hover:border-primary transition-colors">
                <div className="space-y-1 text-center">
                  {previewUrl && (selectedFile || capturedDataUri) ? null : (
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                  )}
                  <div className="flex text-sm text-muted-foreground justify-center">
                    <label
                      htmlFor="food-photo-input"
                      className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring"
                    >
                      <span>{selectedFile ? 'Change photo' : 'Upload a file'}</span>
                      <Input id="food-photo-input" ref={fileInputRef} name="food-photo" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                    </label>
                    {!selectedFile && <p className="pl-1">or drag and drop</p>}
                  </div>
                  {!selectedFile && <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>}
                  {selectedFile && <p className="text-xs text-muted-foreground pt-2">{selectedFile.name}</p>}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="camera">
              <div className="mt-4 space-y-4 text-center">
                {tabMode === 'camera' && !previewUrl && (
                  <div className="w-full aspect-video rounded-md bg-muted border border-border overflow-hidden relative">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    {isCameraLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-4">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p>Starting camera...</p>
                      </div>
                    )}
                    {hasCameraPermission === false && !isCameraLoading && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 text-center">
                        <VideoOff className="h-10 w-10 mb-3 text-red-400" />
                        <AlertTitle className="text-lg font-semibold mb-1">Camera Access Denied/Error</AlertTitle>
                        <AlertDescription className="text-sm mb-3">
                          Please allow camera access in your browser settings. Ensure no other app is using the camera.
                        </AlertDescription>
                        <Button variant="secondary" size="sm" onClick={() => setAttemptId(prev => prev + 1)}>
                           Retry Access
                        </Button>
                      </div>
                    )}
                     {hasCameraPermission === true && !isStreamActive && !isCameraLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-4">
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            <p>Initializing camera stream...</p>
                        </div>
                    )}
                  </div>
                )}

                {tabMode === 'camera' && !previewUrl && hasCameraPermission === true && (
                     <Button
                        onClick={handleCapturePhoto}
                        size="lg"
                        className="w-full sm:w-auto"
                        disabled={!isStreamActive || isLoading || isCameraLoading}
                      >
                        <Camera className="mr-2 h-5 w-5" />
                        {isStreamActive ? 'Capture Photo' : (isCameraLoading ? 'Camera Starting...' : 'Waiting for Camera...')}
                      </Button>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            </TabsContent>
          </Tabs>

          {previewUrl && (
            <div className="mt-6 border-t border-border pt-6">
                 <h3 className="text-lg font-medium text-center mb-2">Photo Preview</h3>
                 <Image
                    src={previewUrl}
                    alt="Meal preview"
                    width={400}
                    height={300}
                    className="mx-auto h-60 w-auto object-contain rounded-md shadow-md"
                    data-ai-hint="food meal"
                  />
                  <div className="text-center mt-2">
                    <Button variant="outline" size="sm" onClick={resetPreview}>
                        {capturedDataUri ? "Retake or Upload New" : "Clear Photo"}
                    </Button>
                  </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && analysisResult === null && (
            <div className="flex items-center justify-center p-6 bg-secondary/50 rounded-md mt-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3 text-foreground">Analyzing your meal, please wait...</p>
            </div>
          )}

          {analysisResult && !isLoading && (
            <NutritionDisplay result={analysisResult} />
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
          {analysisResult && !isLoading && analysisResult.isFoodItem && (
             <Button onClick={handleAddToLog} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="mr-2 h-4 w-4" />
              Add to Daily Log
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={(!selectedFile && !capturedDataUri) || isLoading} className="w-full sm:w-auto">
            {isLoading && !analysisResult ? (
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
