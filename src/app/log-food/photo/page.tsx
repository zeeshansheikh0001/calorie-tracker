
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
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined); // undefined for initial, true for granted, false for denied/error
  const [isCameraLoading, setIsCameraLoading] = useState(false); // For camera startup
  const [capturedDataUri, setCapturedDataUri] = useState<string | null>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requestCameraPermission = useCallback(async () => {
    if (tabMode !== 'camera' || previewUrl) {
      setIsCameraLoading(false); // Ensure loading is off if conditions not met
      return false;
    }

    if (!videoRef.current) {
      console.error("requestCameraPermission: videoRef.current is null. Aborting.");
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Camera component not ready. Please try again or refresh.' });
      setHasCameraPermission(false);
      setIsCameraLoading(false);
      return false;
    }

    setIsCameraLoading(true);
    setHasCameraPermission(undefined); // Reset while attempting
    setIsStreamActive(false);
    let streamSuccess = false;
    let stream: MediaStream | null = null;

    try {
      console.log("Requesting camera permission...");
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      console.log("Camera permission granted.");
      setHasCameraPermission(true);

      if (videoRef.current) {
        const videoEl = videoRef.current;
        videoEl.srcObject = stream;

        // Wait for video to be ready (playing and metadata loaded with valid dimensions)
        await new Promise<void>((resolve, reject) => {
          const readinessTimeout = setTimeout(() => {
            console.warn("Timeout waiting for video to play and metadata to load.");
            cleanupVideoEvents(videoEl);
            reject(new Error("Camera took too long to start. Please check permissions or try another browser."));
          }, 10000); // 10 seconds timeout

          let metadataLoaded = false;
          let playing = false;

          const cleanupVideoEvents = (el: HTMLVideoElement) => {
            el.onloadedmetadata = null;
            el.onplaying = null;
            el.onerror = null;
          };

          const checkReady = () => {
            if (metadataLoaded && playing) {
              clearTimeout(readinessTimeout);
              cleanupVideoEvents(videoEl);
              if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
                console.log("Video ready with dimensions:", videoEl.videoWidth, "x", videoEl.videoHeight);
                resolve();
              } else {
                console.error("Video playing but has zero dimensions.");
                reject(new Error("Camera stream started but video has no dimensions."));
              }
            }
          };

          videoEl.onloadedmetadata = () => {
            console.log("Video metadata loaded:", videoEl.videoWidth, "x", videoEl.videoHeight);
            if (videoEl.videoWidth === 0 && videoEl.videoHeight === 0) {
                 console.warn("Metadata loaded but dimensions are still zero. Waiting for 'playing' or further metadata.");
                 // Don't set metadataLoaded true yet if dimensions are 0, 'playing' might fix it or another metadata event
            } else {
                metadataLoaded = true;
            }
            checkReady();
          };

          videoEl.onplaying = () => {
            console.log("Video has started playing.");
            playing = true;
            // It's possible onplaying fires before onloadedmetadata gives correct dimensions
            // so we also check dimensions here if metadataLoaded flag is already true
            if (metadataLoaded && (videoEl.videoWidth === 0 || videoEl.videoHeight === 0)) {
                console.warn("Video playing, but dimensions were zero on metadata load. This might be an issue.");
            }
            checkReady();
          };

          videoEl.onerror = (e) => {
            clearTimeout(readinessTimeout);
            cleanupVideoEvents(videoEl);
            console.error("Video element error:", e);
            reject(new Error("The camera stream encountered an error."));
          };

          console.log("Attempting to play video...");
          videoEl.play().catch(playError => {
            console.error("videoEl.play() promise rejected:", playError);
            // Don't reject the main promise here, as 'onerror' should handle it if it's fatal.
            // Some browsers might still play despite a benign rejection.
            // However, if play is critical and fails, this is an issue.
            // We can add a specific toast here if needed.
             toast({
                variant: 'destructive',
                title: 'Playback Issue',
                description: `Could not start video playback: ${(playError as Error)?.message}. Try checking browser console.`,
            });
          });
        });

        console.log("Video stream active and ready.");
        setIsStreamActive(true);
        streamSuccess = true;

      } else { // videoRef.current became null
        console.error("videoRef.current became null after getUserMedia success. This shouldn't happen.");
        setHasCameraPermission(false);
        if (stream) stream.getTracks().forEach(track => track.stop());
        streamSuccess = false;
        toast({ variant: 'destructive', title: 'Internal Error', description: 'Camera component reference lost.' });
      }
    } catch (err) {
      console.error('Error during camera setup:', err);
      setHasCameraPermission(false);
      setIsStreamActive(false);
      if (stream) stream.getTracks().forEach(track => track.stop());
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied/Error',
        description: (err as Error)?.message || 'Please enable camera permissions and ensure it is not used by another app.',
      });
      streamSuccess = false;
    } finally {
      setIsCameraLoading(false);
    }
    return streamSuccess;
  }, [toast, tabMode, previewUrl]); // Dependencies: toast for notifications, tabMode/previewUrl to guard against stale calls.

  useEffect(() => {
    const videoElement = videoRef.current;
    let currentStream: MediaStream | null = null;

    if (videoElement?.srcObject) {
      currentStream = videoElement.srcObject as MediaStream;
    }

    if (tabMode === 'camera' && !previewUrl) {
      if (videoRef.current) { // Ensure video element is mounted
        if (!isStreamActive && !isCameraLoading && hasCameraPermission !== false) {
          requestCameraPermission();
        }
      } else {
         if (isCameraLoading) setIsCameraLoading(false);
         // console.warn("useEffect: videoRef.current is null, camera request deferred until next render cycle.");
      }
    } else {
      // Stop camera if not in camera tab, if a preview is shown, or if component unmounts
      if (currentStream) {
        console.log("Stopping camera stream (useEffect).");
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (videoElement) {
        videoElement.srcObject = null;
        // Clean up any lingering event listeners on the video element itself if it's being reused
        videoElement.onloadedmetadata = null;
        videoElement.onplaying = null;
        videoElement.onerror = null;
        videoElement.oncanplay = null;
      }
      if (isStreamActive) setIsStreamActive(false);
      if (isCameraLoading) setIsCameraLoading(false);
      // Potentially reset hasCameraPermission if you want user to be re-prompted or state to clear
      // setHasCameraPermission(undefined);
    }

    // Cleanup function for the useEffect
    return () => {
      console.log("useEffect cleanup: stopping stream if active.");
      if (videoElement?.srcObject) { // Use the captured videoElement for cleanup
        (videoElement.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoElement.srcObject = null; // Important to release the stream from the element
         // Ensure event listeners are removed on unmount or effect re-run for cleanup
        videoElement.onloadedmetadata = null;
        videoElement.onplaying = null;
        videoElement.onerror = null;
        videoElement.oncanplay = null;
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
      // If switching from camera to upload with an active stream, useEffect should handle cleanup
    }
  };

  const handleCapturePhoto = () => {
    console.log("Attempting to capture photo. Stream active:", isStreamActive, "Video Ref:", videoRef.current);
    if (videoRef.current && canvasRef.current && videoRef.current.srcObject && isStreamActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error("Capture failed: Video dimensions are zero.", { w: video.videoWidth, h: video.videoHeight });
        setError("Camera reported zero dimensions. Cannot capture. Try reopening camera tab or re-granting permission.");
        toast({ variant: "destructive", title: "Camera Error", description: "Video dimensions are zero. Please ensure the camera has started correctly." });
        // Don't request permission again here, let useEffect handle it if necessary or user retries.
        // setIsStreamActive(false); // This might trigger a re-attempt if not careful
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
        // Stream will be stopped by useEffect because previewUrl is now set

      } else {
        console.error("Could not get 2D context from canvas.");
        setError("Could not get canvas context to capture photo.");
        toast({ variant: "destructive", title: "Capture Error", description: "Failed to process image from camera." });
      }
    } else {
      let logMessage = "Capture prerequisites not met: ";
      if (!videoRef.current) logMessage += "videoRef is null. ";
      if (!canvasRef.current) logMessage += "canvasRef is null. ";
      if (videoRef.current && !videoRef.current.srcObject) logMessage += "video srcObject is null. ";
      if (!isStreamActive) logMessage += "Stream is not marked as active. ";
      console.error(logMessage, { videoSrcObj: videoRef.current?.srcObject, isStreamActiveVal: isStreamActive });
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
    // Here you would typically save to a database or global state
    toast({
      title: "Meal Logged (Simulated)",
      description: `${analysisResult.calorieEstimate} kcal added to your log.`,
      variant: "default",
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
    // After reset, if tab is camera, useEffect should attempt to restart camera
    // No need to explicitly call requestCameraPermission here, useEffect will handle it.
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
            if (previewUrl) resetPreview(); // Clear preview when switching tabs

            // If switching away from camera, ensure stream is stopped by useEffect.
            // If switching to camera, useEffect will attempt to start it.
            if (newTabMode !== 'camera' && isStreamActive) {
                 setIsStreamActive(false); // Proactively set for immediate UI update
            }
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload"><UploadCloud className="mr-2 h-4 w-4" />Upload Photo</TabsTrigger>
              <TabsTrigger value="camera"><Camera className="mr-2 h-4 w-4" />Use Camera</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <div className="mt-4 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-border hover:border-primary transition-colors">
                <div className="space-y-1 text-center">
                  {previewUrl && (selectedFile || capturedDataUri) ? null : ( // Don't show upload icon if preview from camera is shown
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
                      playsInline // Important for iOS
                      muted // Often required for autoplay
                      onCanPlay={() => console.log("Video: onCanPlay triggered.")}
                      // onPlaying removed setIsStreamActive, requestCameraPermission handles it
                      onPlaying={() => console.log("Video: onPlaying triggered.")}
                      onError={(e) => console.error("Video tag native error event:", e)}
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
                        <Button variant="secondary" size="sm" onClick={() => {
                            setHasCameraPermission(undefined); // Reset to allow re-attempt
                            requestCameraPermission();
                          }}>
                           Retry Access
                        </Button>
                      </div>
                    )}
                     {hasCameraPermission === true && !isStreamActive && !isCameraLoading && ( // Stream permitted but not yet active
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

