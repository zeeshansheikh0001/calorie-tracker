
"use client";

import { useState, type ChangeEvent, useEffect, useRef, useCallback } from "react";
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

export default function LogFoodByPhotoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For AI analysis
  const [analysisResult, setAnalysisResult] = useState<AnalyzeFoodPhotoOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [tabMode, setTabMode] = useState<'upload' | 'camera'>('upload');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false); // For camera startup
  const [capturedDataUri, setCapturedDataUri] = useState<string | null>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requestCameraPermission = useCallback(async () => {
    if (!videoRef.current && tabMode === 'camera' && !previewUrl) {
      console.error("requestCameraPermission called but videoRef is null. This might be a timing issue.");
      setTimeout(() => {
          if (!videoRef.current) {
            console.error("videoRef still null after short delay in requestCameraPermission.");
            toast({
                variant: 'destructive',
                title: 'Camera Error',
                description: 'Could not initialize camera component. Please try again.',
            });
            setHasCameraPermission(false);
            setIsCameraLoading(false);
            setIsStreamActive(false);
          } else {
            requestCameraPermission(); 
          }
      }, 100);
      return false;
    }
    
    if (tabMode !== 'camera' || previewUrl) {
      setIsCameraLoading(false);
      return false;
    }

    setIsCameraLoading(true);
    setHasCameraPermission(null); 
    setIsStreamActive(false);
    let streamSuccess = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        const videoEl = videoRef.current;
        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            console.error("Camera metadata load timed out");
            videoEl.onloadedmetadata = null;
            videoEl.onerror = null;
            reject(new Error("Camera metadata load timed out"));
          }, 7000); 

          videoEl.onloadedmetadata = () => {
            clearTimeout(timeoutId);
            videoEl.onerror = null; 
            console.log("Camera metadata loaded. Video dimensions:", videoEl.videoWidth, "x", videoEl.videoHeight);
            if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
                setIsStreamActive(true);
                streamSuccess = true;
                resolve();
            } else {
                console.error("Camera metadata loaded but video dimensions are zero.");
                reject(new Error("Video dimensions are zero after metadata load."));
            }
          };
          videoEl.onerror = (e) => {
            clearTimeout(timeoutId);
            videoEl.onloadedmetadata = null; 
            console.error("Video element error during stream setup:", e);
            reject(new Error("Video element error"));
          };
          videoEl.play().catch(playError => {
            console.warn("Video play() failed, possibly due to browser policy:", playError);
          });
        });
      } else {
         setIsStreamActive(false); 
         console.error("videoRef.current became null during stream setup");
      }
      return streamSuccess;
    } catch (err) {
      console.error('Error accessing or setting up camera:', err);
      setHasCameraPermission(false);
      setIsStreamActive(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: (err as Error)?.message || 'Please enable camera permissions and ensure it is not in use by another app.',
      });
      return false;
    } finally {
      setIsCameraLoading(false);
    }
  }, [toast, tabMode, previewUrl]); 

  useEffect(() => {
    const videoElement = videoRef.current;
    let currentStream: MediaStream | null = null;
    if (videoElement && videoElement.srcObject) {
        currentStream = videoElement.srcObject as MediaStream;
    }

    if (tabMode === 'camera' && !previewUrl) {
      if (!isStreamActive && !isCameraLoading && hasCameraPermission !== false) { 
         requestCameraPermission();
      }
    } else { 
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (videoElement) {
        videoElement.srcObject = null;
      }
      if (isStreamActive) {
        setIsStreamActive(false);
      }
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (videoElement) { 
        videoElement.srcObject = null;
      }
    };
  }, [tabMode, previewUrl, requestCameraPermission, hasCameraPermission, isStreamActive, isCameraLoading]);


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
    console.log("Attempting to capture photo. Stream active:", isStreamActive, "Video Ref:", videoRef.current);
    if (videoRef.current && canvasRef.current && videoRef.current.srcObject && isStreamActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error("Capture failed: Video dimensions are zero.", { w: video.videoWidth, h: video.videoHeight });
        setError("Camera reported zero dimensions. Cannot capture. Try reopening camera tab.");
        toast({ variant: "destructive", title: "Camera Error", description: "Video dimensions are zero. Try again or re-open camera tab." });
        setIsStreamActive(false); 
        requestCameraPermission(); 
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      console.log(`Canvas dimensions set to: ${canvas.width}x${canvas.height}`);

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        console.log("Image drawn to canvas");
        const dataUri = canvas.toDataURL('image/jpeg');
        
        setPreviewUrl(dataUri); 
        setCapturedDataUri(dataUri);
        setSelectedFile(null); 
        setAnalysisResult(null);
        setError(null);
        
      } else {
        console.error("Could not get 2D context from canvas.");
        setError("Could not get canvas context to capture photo.");
        toast({ variant: "destructive", title: "Capture Error", description: "Failed to process image." });
      }
    } else {
      let logMessage = "Capture prerequisites not met: ";
      if (!videoRef.current) logMessage += "videoRef is null. ";
      if (!canvasRef.current) logMessage += "canvasRef is null. ";
      if (videoRef.current && !videoRef.current.srcObject) logMessage += "video srcObject is null. ";
      if (!isStreamActive) logMessage += "Stream is not marked as active. ";
      console.error(logMessage, { videoSrcObj: videoRef.current?.srcObject, isStreamActiveVal: isStreamActive });
      setError("Camera or canvas not available, or stream not active.");
      toast({ variant: "destructive", title: "Camera Error", description: "Camera not ready to capture. Please try reopening the camera tab or re-granting permission." });
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
          description: "The image doesn't seem to be food. Nutritional analysis might be inaccurate.",
          variant: "default", // Or a custom "warning" variant if you have one
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
    // Here you would typically save to a database or global state
    // For now, just a toast as in the original
    toast({
      title: "Meal Logged (Simulated)",
      description: `${analysisResult.calorieEstimate} kcal added to your log.`,
      variant: "default",
    });
    // Optionally reset after logging
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
            setTabMode(value as 'upload' | 'camera');
            if (previewUrl) resetPreview();
            if (value !== 'camera') {
                setIsStreamActive(false); 
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
                      onCanPlay={() => console.log("Video can play.")}
                      onPlaying={() => { console.log("Video is playing."); if (!isStreamActive && videoRef.current?.srcObject) setIsStreamActive(true);}}
                      onError={(e) => console.error("Video tag native error", e)}
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
                        <AlertTitle className="text-lg font-semibold mb-1">Camera Access Denied</AlertTitle>
                        <AlertDescription className="text-sm mb-3">
                          Please allow camera access in your browser settings. Ensure no other app is using the camera.
                        </AlertDescription>
                        <Button variant="secondary" size="sm" onClick={requestCameraPermission}>
                           Retry Access
                        </Button>
                      </div>
                    )}
                     {hasCameraPermission === true && !isStreamActive && !isCameraLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-4">
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            <p>Waiting for camera stream...</p>
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
                        {isStreamActive ? 'Capture Photo' : 'Camera Starting...'}
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
                        {capturedDataUri ? "Retake or Upload New" : "Clear Photo & Use Other"}
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
          {analysisResult && !isLoading && analysisResult.isFoodItem && ( // Only show if it's a food item
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
