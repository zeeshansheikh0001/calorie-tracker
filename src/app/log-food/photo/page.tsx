
"use client";

import { useState, type ChangeEvent, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, UploadCloud, AlertCircle, CheckCircle, Pizza, Camera, VideoOff, ThumbsDown, Zap, ZapOff, ZoomIn, ZoomOut, ChevronLeft, Info } from "lucide-react";
import Image from "next/image";
import { analyzeFoodPhoto, type AnalyzeFoodPhotoOutput, type AnalyzeFoodPhotoInput } from "@/ai/flows/analyze-food-photo";
import NutritionDisplay from "@/components/food/nutrition-display";
import { useToast } from "@/hooks/use-toast";
import { useDailyLog } from "@/hooks/use-daily-log";
import { useGoals } from "@/hooks/use-goals"; // Added
import type { Goal } from "@/types"; // Added
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";


export default function LogFoodByPhotoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeFoodPhotoOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { addFoodEntry } = useDailyLog();
  const { goals, isLoading: isLoadingGoals } = useGoals(); // Added
  const router = useRouter();

  const [tabMode, setTabMode] = useState<'upload' | 'camera'>('upload');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [capturedDataUriForAnalysis, setCapturedDataUriForAnalysis] = useState<string | null>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [attemptId, setAttemptId] = useState(0);
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [hasFlash, setHasFlash] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomCapabilities, setZoomCapabilities] = useState<{ min: number, max: number, step: number } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    let stream: MediaStream | null = null;
    let readinessTimeout: NodeJS.Timeout | null = null;
    let startCameraTimeoutId: NodeJS.Timeout | null = null;
  
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
      if (startCameraTimeoutId) {
        clearTimeout(startCameraTimeoutId);
        startCameraTimeoutId = null;
      }
      if (readinessTimeout) {
        clearTimeout(readinessTimeout);
        readinessTimeout = null;
      }
      
      cleanupVideoEventListeners();
      
      if (videoTrack) {
        videoTrack.stop();
        setVideoTrack(null);
        console.log("Camera: Video track stopped");
      }
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
      setHasFlash(false);
      setZoomCapabilities(null);
      setIsFlashOn(false);
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
      setVideoTrack(null);
      setHasFlash(false);
      setZoomCapabilities(null);
  
      const onMetadataLoaded = () => {
        const currentVideoNode = videoRef.current;
        if (!currentVideoNode) return;
        console.log("Camera: onloadedmetadata. Dimensions:", currentVideoNode.videoWidth, currentVideoNode.videoHeight);
        if (currentVideoNode.videoWidth > 0 && currentVideoNode.videoHeight > 0) {
          if (currentVideoNode.onplaying) currentVideoNode.onplaying(new Event('playing'));
          else if(currentVideoNode.paused === false) { 
             if (readinessTimeout) clearTimeout(readinessTimeout);
             console.log("Camera: Video ready and playing (metadata).");
             setIsStreamActive(true);
             setIsCameraLoading(false);
          }
        } else {
          console.warn("Camera: onloadedmetadata - video dimensions are zero.");
        }
      };
  
      const onPlaying = () => {
        const currentVideoNode = videoRef.current;
        if (!currentVideoNode) return;
        console.log("Camera: onplaying.");
        if (currentVideoNode.videoWidth > 0 && currentVideoNode.videoHeight > 0) {
          if (readinessTimeout) clearTimeout(readinessTimeout);
          console.log("Camera: Video ready and playing.");
          setIsStreamActive(true);
          setIsCameraLoading(false);
        } else {
          console.warn("Camera: onplaying - video dimensions still zero.");
        }
      };
  
      const onVideoError = (e: Event | string) => {
        const currentVideoNode = videoRef.current;
        console.error("Camera: videoNode.onerror:", e, currentVideoNode?.error);
        if (readinessTimeout) clearTimeout(readinessTimeout);
        toast({ variant: "destructive", title: "Camera Error", description: "The camera stream encountered an error." });
        performCleanup();
        setHasCameraPermission(false);
        setIsCameraLoading(false);
      };
  
      try {
        if (stream || (videoRef.current && videoRef.current.srcObject)) {
          performCleanup();
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        console.log("Camera: Permission granted.");
        setHasCameraPermission(true);
  
        videoNode.srcObject = stream;
        cleanupVideoEventListeners(); 
        videoNode.onloadedmetadata = onMetadataLoaded;
        videoNode.onplaying = onPlaying;
        videoNode.onerror = onVideoError;
  
        const currentTrack = stream.getVideoTracks()[0];
        setVideoTrack(currentTrack);

        if (currentTrack && 'getCapabilities' in currentTrack) {
          const capabilities = currentTrack.getCapabilities();
          // @ts-ignore 
          if (capabilities.torch) {
            setHasFlash(true);
          }
          // @ts-ignore 
          if (capabilities.zoom) {
            // @ts-ignore
            setZoomCapabilities({ min: capabilities.zoom.min, max: capabilities.zoom.max, step: capabilities.zoom.step });
            // @ts-ignore
            setZoomLevel(currentTrack.getSettings().zoom || 1);
          }
        }
  
        readinessTimeout = setTimeout(() => {
          console.warn("Camera: Timeout waiting for video metadata/play (10s).");
          const currentVideoNode = videoRef.current; // Re-check
          if (!currentVideoNode || !isStreamActive) { 
            toast({ variant: "destructive", title: "Camera Timeout", description: "Camera took too long to initialize. Please check permissions or try another browser." });
            performCleanup();
            setHasCameraPermission(false);
            setIsCameraLoading(false);
          }
        }, 10000);
  
        await videoNode.play();
        console.log("Camera: videoNode.play() called.");
  
      } catch (err) {
        console.error('Camera: Error during setup:', err);
        const errorMessage = (err as Error)?.message || 'Could not access camera. Please enable permissions and ensure it is not used by another app.';
        setHasCameraPermission(false);
        setIsStreamActive(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied/Error',
          description: errorMessage,
        });
        setIsCameraLoading(false);
        performCleanup(); 
      }
    };
  
    if (tabMode === 'camera' && !previewUrl) {
      startCameraTimeoutId = setTimeout(() => {
        if (tabMode === 'camera' && !previewUrl) { 
          startCamera();
        }
      }, 0); 
    } else {
      performCleanup();
    }
  
    return performCleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabMode, previewUrl, attemptId]);


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setCapturedDataUriForAnalysis(null);
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
        setCapturedDataUriForAnalysis(dataUri);
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

    if (capturedDataUriForAnalysis) { 
      photoDataUriToAnalyze = capturedDataUriForAnalysis;
    } else if (selectedFile) { 
      if (previewUrl && previewUrl.startsWith('data:')) {
         photoDataUriToAnalyze = previewUrl;
      } else {
        // This part seems unlikely to be hit if previewUrl is correctly managed
        // but kept for robustness if selectedFile is set without previewUrl being a data URI.
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

    // This is a placeholder and will be commented out for static export.
    // For a real app, this would be enabled.
    // setError("AI analysis is disabled for static export. This feature requires a server.");
    // setIsLoading(false);
    // setAnalysisResult({
    //   isFoodItem: false,
    //   calorieEstimate: 0,
    //   proteinEstimate: 0,
    //   fatEstimate: 0,
    //   carbEstimate: 0,
    //   ingredients: [],
    //   estimatedQuantityNote: "AI Analysis Disabled for Static Export"
    // });
    // return;

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
      mealName = analysisResult.ingredients.join(", ");
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
    resetPhotoState();
  };

  const resetPhotoState = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCapturedDataUriForAnalysis(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }


  const toggleFlash = async () => {
    if (videoTrack && hasFlash) {
      try {
        // @ts-ignore
        await videoTrack.applyConstraints({ advanced: [{ torch: !isFlashOn }] });
        setIsFlashOn(!isFlashOn);
      } catch (err) {
        console.error("Failed to toggle flash:", err);
        toast({ variant: "destructive", title: "Flash Error", description: "Could not toggle flash." });
      }
    }
  };

  const handleZoomChange = async (newZoom: number) => {
    if (videoTrack && zoomCapabilities) {
      try {
        // @ts-ignore
        await videoTrack.applyConstraints({ advanced: [{ zoom: newZoom }] });
        setZoomLevel(newZoom);
      } catch (err) {
        console.error("Failed to set zoom:", err);
        toast({ variant: "destructive", title: "Zoom Error", description: "Could not set zoom level." });
      }
    }
  };


  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="container max-w-screen-lg mx-auto py-4 md:py-8 px-3 md:px-6"
    >
      <motion.div
        whileHover={{ x: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="mt-2"
      >
        <Button variant="ghost" onClick={() => router.back()} className="mb-2 md:mb-4 group text-sm flex items-center">
          <ChevronLeft className="mr-1 h-4 w-4 group-hover:text-primary transition-colors" />
          <span className="group-hover:text-primary transition-colors">Back</span>
      </Button>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20 
        }}
        className="px-0 sm:px-2 md:px-4"
      >
        <Card className="max-w-2xl mx-auto shadow-2xl overflow-hidden border-0 bg-gradient-to-br from-background/90 via-background to-secondary/10 backdrop-blur-sm">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
          <CardHeader className="p-0 border-b-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/30 backdrop-blur-sm z-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-4 pt-8 px-6 pb-10 md:pb-12">
              <motion.div
                initial={{ scale: 0.7, rotate: -10, y: 10 }}
                animate={{ scale: 1, rotate: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="bg-gradient-to-br from-primary/20 to-primary/10 p-4 rounded-full shadow-lg flex items-center justify-center relative"
                whileHover={{ rotate: [0, -5, 5, -5, 0], transition: { duration: 0.5 } }}
              >
                <div className="relative">
                  <motion.div className="absolute -inset-2 rounded-full bg-primary/10 blur-sm" 
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <Pizza className="h-8 w-8 md:h-10 md:w-10 text-primary relative z-10" />
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-primary/20 rounded-full blur-md -z-10"
                  />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 to-transparent rounded-full opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
              </motion.div>

              <div className="flex flex-col items-center md:items-start">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative"
                >
                  <CardTitle className="text-xl md:text-3xl font-bold flex items-center text-center md:text-left bg-gradient-to-r from-primary via-primary/90 to-primary/70 text-transparent bg-clip-text drop-shadow-sm">
            Log Food with Photo AI
          </CardTitle>
                  <motion.div 
                    className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" 
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 px-8 md:px-0"
                >
                  <CardDescription className="text-sm md:text-base max-w-md text-center md:text-left text-foreground/80">
                    Take a photo or upload an image of your meal, and our AI will analyze its nutritional content instantly.
          </CardDescription>
                </motion.div>
                
                <motion.div 
                  className="absolute top-3 right-3 rounded-full bg-background/80 backdrop-blur-sm shadow-sm p-1.5 border border-border/30" 
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(var(--primary), 0.1)" }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Info className="h-4 w-4 text-primary/70" />
                </motion.div>
              </div>
            </div>
            
            <motion.div
              className="absolute -bottom-6 right-0 left-0 h-12 bg-gradient-to-t from-background to-transparent z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            />
        </CardHeader>
          <CardContent className="space-y-5 py-6 sm:py-8 px-4 sm:px-6 mt-2">
          <Tabs value={tabMode} onValueChange={(value) => {
            const newTabMode = value as 'upload' | 'camera';
            setTabMode(newTabMode);
            if (previewUrl) resetPhotoState(); 
            if (newTabMode === 'camera' && !previewUrl) {
                 setAttemptId(prev => prev + 1); 
            }
          }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 rounded-full p-1 bg-muted/50 border border-border/20 shadow-inner">
                <TabsTrigger value="upload" className="data-[state=active]:bg-gradient-to-r from-primary/30 to-primary/20 data-[state=active]:backdrop-blur-sm data-[state=active]:shadow-sm rounded-full transition-all duration-300">
                  <motion.div className="flex items-center" whileTap={{ scale: 0.95 }}>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Upload</span> Photo
                  </motion.div>
                </TabsTrigger>
                <TabsTrigger value="camera" className="data-[state=active]:bg-gradient-to-r from-primary/30 to-primary/20 data-[state=active]:backdrop-blur-sm data-[state=active]:shadow-sm rounded-full transition-all duration-300">
                  <motion.div className="flex items-center" whileTap={{ scale: 0.95 }}>
                    <Camera className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Use</span> Camera
                  </motion.div>
                </TabsTrigger>
            </TabsList>
              
              <AnimatePresence mode="wait">
                {tabMode === 'upload' && (
                  <motion.div
                    key="upload-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabsContent value="upload" className="mt-0">
                      <motion.div 
                        className="mt-2 flex flex-col items-center justify-center px-4 sm:px-6 pt-6 pb-7 border-2 border-dashed rounded-xl border-primary/20 hover:border-primary transition-colors bg-secondary/5"
                        whileHover={{ boxShadow: "0 0 0 2px hsla(var(--primary-hsl), 0.2)", backgroundColor: "hsla(var(--secondary-hsl), 0.1)" }}
                        transition={{ duration: 0.2 }}
                      >
                <div className="space-y-1 text-center">
                  {previewUrl && (selectedFile || capturedDataUriForAnalysis) ? null : (
                            <motion.div
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ 
                                type: "spring", 
                                stiffness: 400, 
                                damping: 10 
                              }}
                              className="bg-primary/5 p-5 rounded-full shadow-inner"
                            >
                              <motion.div
                                animate={{ 
                                  y: [0, -5, 0],
                                }}
                                transition={{ 
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                <UploadCloud className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-primary/80" />
                              </motion.div>
                            </motion.div>
                  )}
                          <div className="flex flex-col sm:flex-row text-sm text-muted-foreground justify-center items-center mt-4">
                    <label
                      htmlFor="food-photo-input"
                              className="relative cursor-pointer rounded-full px-4 py-2 bg-primary/10 hover:bg-primary/20 transition-colors font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring"
                    >
                      <span>{selectedFile ? 'Change photo' : 'Upload a file'}</span>
                      <Input id="food-photo-input" ref={fileInputRef} name="food-photo" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                    </label>
                            {!selectedFile && <p className="pl-1 mt-2 sm:mt-0 sm:ml-2">or drag and drop</p>}
                  </div>
                          {!selectedFile && <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>}
                  {selectedFile && <p className="text-xs text-muted-foreground pt-2">{selectedFile.name}</p>}
                </div>
                      </motion.div>
            </TabsContent>
                  </motion.div>
                )}
                
                {tabMode === 'camera' && (
                  <motion.div
                    key="camera-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabsContent value="camera" className="mt-0">
                      <div className="mt-2 space-y-4 text-center">
                {tabMode === 'camera' && !previewUrl && (
                  <>
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 }}
                              className="w-full aspect-video rounded-xl bg-muted/80 border border-border/80 overflow-hidden relative shadow-xl"
                            >
                              <motion.div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent z-10 pointer-events-none" />
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                        onCanPlay={() => console.log("Video: onCanPlay triggered")}
                        onPlaying={() => console.log("Video: onPlaying triggered")}
                        onError={(e) => console.error("Video: onError triggered", e)}
                      />
                      {isCameraLoading && (
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-4 backdrop-blur-sm z-20"
                                >
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ 
                                      repeat: Infinity,
                                      duration: 1,
                                      ease: "linear"
                                    }}
                                    className="text-primary/90"
                                  >
                                    <Loader2 className="h-8 w-8 mb-2" />
                                  </motion.div>
                                  <p className="font-medium">Starting camera...</p>
                                </motion.div>
                      )}
                      {hasCameraPermission === false && !isCameraLoading && (
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 text-center backdrop-blur-sm z-20"
                                >
                                  <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring" }}
                                    className="bg-red-500/20 p-4 rounded-full mb-3"
                                  >
                                    <VideoOff className="h-8 w-8 sm:h-10 sm:w-10 text-red-400" />
                                  </motion.div>
                                  <AlertTitle className="text-lg font-semibold mb-2">Camera Access Denied</AlertTitle>
                                  <AlertDescription className="text-sm mb-4 max-w-md mx-auto opacity-90">
                            Please allow camera access in your browser settings. Ensure no other app is using the camera.
                          </AlertDescription>
                                  <motion.div whileTap={{ scale: 0.95 }}>
                                    <Button variant="secondary" size="sm" onClick={() => setAttemptId(prev => prev + 1)} className="rounded-full">
                             Retry Access
                          </Button>
                                  </motion.div>
                                </motion.div>
                      )}
                       {hasCameraPermission === true && !isStreamActive && !isCameraLoading && (
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-4 backdrop-blur-sm z-20"
                                >
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ 
                                      repeat: Infinity,
                                      duration: 1,
                                      ease: "linear"
                                    }}
                                    className="text-primary/90"
                                  >
                                    <Loader2 className="h-8 w-8 mb-2" />
                                  </motion.div>
                                  <p className="font-medium">Initializing camera stream...</p>
                                </motion.div>
                      )}
                            </motion.div>
                    {isStreamActive && hasCameraPermission && (
                              <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-row items-center justify-center gap-3 my-2"
                              >
                        {hasFlash && (
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button onClick={toggleFlash} variant="outline" size="icon" title={isFlashOn ? "Turn Flash Off" : "Turn Flash On"} 
                                      className={isFlashOn ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-600 rounded-full shadow-md" : "rounded-full shadow-md border-primary/10"}>
                                      {isFlashOn ? <ZapOff className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                          </Button>
                                  </motion.div>
                        )}
                        {zoomCapabilities && (
                                  <motion.div 
                                    className="flex items-center gap-2 w-full max-w-[220px] bg-card/50 p-1.5 rounded-full shadow-inner border border-primary/10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                  >
                                    <ZoomOut className="h-4 w-4 text-muted-foreground ml-1.5" />
                            <Slider
                              min={zoomCapabilities.min}
                              max={zoomCapabilities.max}
                              step={zoomCapabilities.step}
                              value={[zoomLevel]}
                              onValueChange={(value) => handleZoomChange(value[0])}
                                      className="w-full"
                            />
                                    <ZoomIn className="h-4 w-4 text-muted-foreground mr-1.5" />
                                  </motion.div>
                        )}
                              </motion.div>
                    )}
                  </>
                )}

                {tabMode === 'camera' && !previewUrl && hasCameraPermission === true && (
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="mt-3"
                          >
                     <Button
                        onClick={handleCapturePhoto}
                        size="lg"
                              className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:brightness-110 transition-all rounded-full shadow-lg"
                        disabled={!isStreamActive || isLoading || isCameraLoading}
                      >
                        <Camera className="mr-2 h-5 w-5" />
                        {isStreamActive ? 'Capture Photo' : (isCameraLoading ? 'Camera Starting...' : 'Waiting for Camera...')}
                      </Button>
                          </motion.div>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            </TabsContent>
                  </motion.div>
                )}
              </AnimatePresence>
          </Tabs>

            <AnimatePresence>
          {previewUrl && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="mt-8 border-t border-border/40 pt-6"
                >
                  <motion.h3 
                    className="text-lg font-medium text-center mb-3"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    Photo Preview
                  </motion.h3>
                  <motion.div 
                    className="flex justify-center"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="relative overflow-hidden rounded-xl shadow-lg w-full max-w-md group bg-black/5">
                    <Image
                        src={previewUrl}
                        alt="Meal preview"
                        width={400} 
                        height={300}
                          className="w-full h-auto max-h-[350px] object-contain bg-pattern-food"
                        data-ai-hint="food meal"
                    />
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ delay: 0.3 }}
                      />
                 </div>
                  </motion.div>
                  <motion.div 
                    className="text-center mt-4"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button variant="outline" size="sm" onClick={resetPhotoState} className="rounded-full shadow-sm border-primary/20 hover:bg-primary/5">
                        {capturedDataUriForAnalysis ? "Retake or Upload New" : "Clear Photo"}
                    </Button>
                  </motion.div>
                </motion.div>
          )}
            </AnimatePresence>

            <AnimatePresence>
          {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert variant="destructive" className="mt-4 rounded-xl border-red-300/20">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
                </motion.div>
          )}
            </AnimatePresence>

            <AnimatePresence>
          {isLoading && analysisResult === null && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-center p-6 bg-secondary/30 backdrop-blur-sm rounded-xl mt-4 shadow-inner border border-primary/5"
                >
                  <motion.div
                    className="relative"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "linear"
                      }}
                      className="text-primary"
                    >
                      <Loader2 className="h-8 w-8" />
                    </motion.div>
                    <motion.div 
                      className="absolute inset-0 bg-primary/10 rounded-full blur-lg"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                  <p className="ml-3 text-foreground/90 font-medium">Analyzing your meal, please wait...</p>
                </motion.div>
          )}
            </AnimatePresence>

            <AnimatePresence>
          {analysisResult && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
            <NutritionDisplay 
              result={analysisResult} 
              estimatedQuantityNote={analysisResult.estimatedQuantityNote}
              goals={goals}
              isLoadingGoals={isLoadingGoals}
            />
                </motion.div>
          )}
            </AnimatePresence>
        </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-6 pb-6 border-t bg-muted/20 px-4 sm:px-6">
            <AnimatePresence>
          {analysisResult && !isLoading && analysisResult.isFoodItem && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="w-full sm:w-auto"
                >
                  <Button 
                    onClick={handleAddToLog} 
                    className="w-full bg-gradient-to-r from-green-600 via-green-500 to-green-500 hover:brightness-110 text-white rounded-full shadow-md"
                  >
              <CheckCircle className="mr-2 h-4 w-4" />
              Add to Daily Log
            </Button>
                </motion.div>
          )}
            </AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full sm:w-auto"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
          <Button 
            onClick={handleSubmit} 
            disabled={(!selectedFile && !capturedDataUriForAnalysis && !previewUrl) || isLoading || isLoadingGoals} 
                className="w-full bg-gradient-to-r from-primary/90 via-primary to-primary/90 hover:brightness-110 rounded-full shadow-md disabled:opacity-50"
          >
            {isLoading && !analysisResult ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear"
                    }}
                  >
                    <Loader2 className="mr-2 h-4 w-4" />
                  </motion.div>
            ) : (
                  <motion.div
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: 15 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
              <Pizza className="mr-2 h-4 w-4" />
                  </motion.div>
            )}
            {analysisResult ? 'Re-analyze' : 'Analyze Meal'}
          </Button>
            </motion.div>
        </CardFooter>
      </Card>
      </motion.div>
    </motion.div>
  );
}

    