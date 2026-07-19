"use client";

import {
  ArrowLeft,
  Camera,
  Check,
  Flashlight,
  ImagePlus,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Type,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { analyzeFoodPhoto } from "@/ai/flows/analyze-food-photo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddFoodEntry } from "@/features/calorie/hooks/use-daily-log-query";
import { ScanEngagementOverlay } from "@/features/tracker/components/scan-engagement-overlay";
import { formatLogDate } from "@/services/calorie/daily-log.service";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Estimate = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note?: string;
  ingredients: string[];
  confidence: number;
};

async function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ViewfinderFrame({ scanning }: { scanning?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-[14%] sm:inset-[16%]">
      {(["tl", "tr", "bl", "br"] as const).map((corner) => (
        <span
          key={corner}
          className={cn(
            "absolute h-8 w-8 border-primary",
            corner === "tl" && "left-0 top-0 rounded-tl-2xl border-l-[3px] border-t-[3px]",
            corner === "tr" && "right-0 top-0 rounded-tr-2xl border-r-[3px] border-t-[3px]",
            corner === "bl" && "bottom-0 left-0 rounded-bl-2xl border-b-[3px] border-l-[3px]",
            corner === "br" && "bottom-0 right-0 rounded-br-2xl border-b-[3px] border-r-[3px]"
          )}
        />
      ))}
      {scanning ? (
        <motion.div
          className="absolute inset-x-2 h-0.5 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_16px_hsl(var(--primary))]"
          initial={{ top: "8%" }}
          animate={{ top: ["8%", "92%", "8%"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
    </div>
  );
}

function MacroStat({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: number;
  unit: string;
  tone: string;
}) {
  return (
    <div className="flex-1 rounded-2xl bg-muted/70 px-2.5 py-3 text-center">
      <p className={cn("text-[10px] font-bold uppercase tracking-[0.12em]", tone)}>
        {label}
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums tracking-tight">
        {Math.round(value)}
        <span className="text-[11px] font-semibold text-muted-foreground">
          {unit}
        </span>
      </p>
    </div>
  );
}

export function PhotoLogScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const dateKey = formatLogDate(new Date());
  const addEntry = useAddFoodEntry(dateKey);

  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [servings, setServings] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setTorchOn(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      setError("Camera unavailable — upload a photo instead.");
      setMode("upload");
    }
  }, [stopCamera]);

  useEffect(() => {
    if (mode === "camera" && !preview) {
      void startCamera();
    }
    return () => stopCamera();
  }, [mode, preview, startCamera, stopCamera]);

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const capabilities = track.getCapabilities?.() as
      | { torch?: boolean }
      | undefined;
    if (!capabilities?.torch) {
      toast({ title: "Flash not available on this device" });
      return;
    }
    const next = !torchOn;
    try {
      await track.applyConstraints({
        advanced: [{ torch: next } as MediaTrackConstraintSet],
      });
      setTorchOn(next);
    } catch {
      toast({ title: "Couldn't toggle flash" });
    }
  };

  const analyzeUri = async (photoDataUri: string) => {
    setAnalyzing(true);
    setError(null);
    setEstimate(null);
    setServings(1);
    try {
      const result = await analyzeFoodPhoto({ photoDataUri });
      if (!result.isFoodItem) {
        setError("That doesn't look like food. Center your plate and try again.");
        return;
      }
      setEstimate({
        name: result.ingredients[0] || "Meal",
        calories: result.calorieEstimate,
        protein: result.proteinEstimate,
        carbs: result.carbEstimate,
        fat: result.fatEstimate,
        note: result.estimatedQuantityNote,
        ingredients: result.ingredients.slice(0, 6),
        confidence: Math.min(
          96,
          72 + Math.min(result.ingredients.length * 4, 20)
        ),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Photo analysis failed.";
      setError(message);
      toast({
        title: "Analysis failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const uri = await fileToDataUri(file);
    setPreview(uri);
    stopCamera();
    await analyzeUri(uri);
  };

  const capture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !cameraOn) return;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const uri = canvas.toDataURL("image/jpeg", 0.92);
    setPreview(uri);
    stopCamera();
    await analyzeUri(uri);
  };

  const resetScan = () => {
    setEstimate(null);
    setPreview(null);
    setError(null);
    setServings(1);
    if (mode === "camera") void startCamera();
  };

  const scaled = estimate
    ? {
        ...estimate,
        calories: estimate.calories * servings,
        protein: estimate.protein * servings,
        carbs: estimate.carbs * servings,
        fat: estimate.fat * servings,
      }
    : null;

  const onSave = () => {
    if (!scaled) return;
    addEntry.mutate(
      {
        name: scaled.name,
        calories: scaled.calories,
        protein: scaled.protein,
        carbs: scaled.carbs,
        fat: scaled.fat,
      },
      {
        onSuccess: () => {
          toast({ title: "Meal logged", description: scaled.name });
          router.push("/");
        },
      }
    );
  };

  const showControls = !preview && !analyzing && !scaled;

  return (
    <div className="relative mx-auto flex h-dvh max-h-dvh w-full max-w-lg flex-col overflow-hidden bg-[#0a0f0c] text-white">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,_hsl(142_62%_42%_/_0.28),_transparent_70%)]"
      />

      {/* Top bar */}
      <header className="relative z-30 flex items-center justify-between gap-3 px-4 pb-3 pt-[max(0.85rem,env(safe-area-inset-top))]">
        <Button
          asChild
          size="icon"
          variant="ghost"
          className="h-11 w-11 rounded-full bg-white/10 text-white backdrop-blur-xl hover:bg-white/15 hover:text-white"
        >
          <Link href="/" aria-label="Back to home" onClick={stopCamera}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>

        <div className="flex flex-col items-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            AI Scan
          </p>
          <p className="text-sm font-semibold text-white/90">
            {analyzing
              ? "Analyzing…"
              : scaled
                ? "Review meal"
                : "Point at your plate"}
          </p>
        </div>

        <Button
          asChild
          size="icon"
          variant="ghost"
          className="h-11 w-11 rounded-full bg-white/10 text-white backdrop-blur-xl hover:bg-white/15 hover:text-white"
        >
          <Link href="/log-food/manual" aria-label="Describe meal instead">
            <Type className="h-5 w-5" />
          </Link>
        </Button>
      </header>

      {/* Stage */}
      <div className="relative z-10 mx-4 min-h-0 flex-1 overflow-hidden rounded-[1.75rem] bg-black shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
        {preview ? (
          <Image
            src={preview}
            alt="Selected meal"
            fill
            className="object-cover"
            unoptimized
            priority
          />
        ) : mode === "camera" ? (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <button
            type="button"
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#122018] to-black px-6 text-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.5rem] bg-primary/20 ring-1 ring-primary/40">
              <ImagePlus className="h-7 w-7 text-primary" />
            </span>
            <div>
              <p className="text-base font-bold">Upload a food photo</p>
              <p className="mt-1 text-sm text-white/55">
                Clear overhead shots work best
              </p>
            </div>
            <span className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
              Choose photo
            </span>
          </button>
        )}

        {/* Dim vignette */}
        {!scaled ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(0,0,0,0.45)_100%)]"
          />
        ) : null}

        {showControls || analyzing ? (
          <ViewfinderFrame scanning={analyzing} />
        ) : null}

        <AnimatePresence>
          {analyzing ? <ScanEngagementOverlay active={analyzing} /> : null}
        </AnimatePresence>

        {estimate && preview && !analyzing ? (
          <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/95 px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-[var(--shadow-glow)] backdrop-blur">
              <Check className="h-3.5 w-3.5" />
              {estimate.confidence}% match · AI ready
            </span>
          </div>
        ) : null}

        {showControls && mode === "camera" ? (
          <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs font-medium text-white/70">
            Align your meal inside the frame
          </p>
        ) : null}

        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </div>

      {/* Mode switch + controls */}
      {showControls ? (
        <div className="relative z-30 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          <div className="mx-auto mb-5 flex w-fit items-center gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/10 backdrop-blur-xl">
            {(
              [
                { id: "camera" as const, label: "Camera" },
                { id: "upload" as const, label: "Gallery" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-bold transition-all",
                  mode === item.id
                    ? "bg-white text-[#0a0f0c] shadow-sm"
                    : "text-white/65 hover:text-white"
                )}
                onClick={() => {
                  setMode(item.id);
                  if (item.id === "upload") stopCamera();
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-8">
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/15"
              onClick={() => void toggleTorch()}
              aria-label="Toggle flash"
              disabled={mode !== "camera"}
            >
              <Flashlight
                className={cn("h-5 w-5", torchOn && "text-primary")}
              />
            </button>

            <button
              type="button"
              disabled={
                analyzing || (mode === "camera" ? !cameraOn : false)
              }
              onClick={() => {
                if (mode === "camera") void capture();
                else fileInputRef.current?.click();
              }}
              aria-label={mode === "camera" ? "Capture photo" : "Choose photo"}
              className="group relative flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-full bg-primary shadow-[0_0_0_6px_rgba(52,189,98,0.22),0_12px_40px_rgba(52,189,98,0.35)] transition active:scale-95 disabled:opacity-50"
            >
              <span className="absolute inset-1 rounded-full border-2 border-white/40" />
              {mode === "camera" ? (
                <Camera className="relative h-7 w-7 text-primary-foreground" />
              ) : (
                <ImagePlus className="relative h-7 w-7 text-primary-foreground" />
              )}
            </button>

            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/15"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Open gallery"
            >
              <ImagePlus className="h-5 w-5" />
            </button>
          </div>

          {error ? (
            <p
              className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/15 px-3 py-2.5 text-center text-xs font-medium text-red-100"
              role="alert"
            >
              {error}
            </p>
          ) : (
            <p className="mt-4 text-center text-[11px] text-white/45">
              Or{" "}
              <Link
                href="/log-food/manual"
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                describe your meal
              </Link>
            </p>
          )}
        </div>
      ) : null}

      {/* Result sheet */}
      <AnimatePresence>
        {scaled && !analyzing ? (
          <motion.section
            initial={reduceMotion ? false : { y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-0 z-40 max-h-[72dvh] overflow-y-auto rounded-t-[1.75rem] bg-card text-card-foreground shadow-[0_-20px_60px_rgba(0,0,0,0.35)]"
          >
            <div className="sticky top-0 z-10 bg-card/95 px-4 pb-2 pt-3 backdrop-blur-xl">
              <div className="mx-auto h-1 w-10 rounded-full bg-muted" />
            </div>

            <div className="space-y-4 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Nutrition ready
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
                    {Math.round(scaled.calories)}
                    <span className="ml-1 text-base font-semibold text-muted-foreground">
                      kcal
                    </span>
                  </p>
                  {scaled.note ? (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {scaled.note}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 shrink-0 rounded-full"
                  aria-label="Rescan"
                  onClick={resetScan}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {error ? (
                <p
                  className="rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <div>
                <label
                  htmlFor="meal-name"
                  className="mb-1.5 block text-xs font-bold text-muted-foreground"
                >
                  Meal name
                </label>
                <Input
                  id="meal-name"
                  value={scaled.name}
                  onChange={(e) =>
                    setEstimate((prev) =>
                      prev ? { ...prev, name: e.target.value } : prev
                    )
                  }
                  className="h-12 rounded-2xl border-border/60 bg-muted/40 text-base font-semibold"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
                <div>
                  <p className="text-sm font-bold">Servings</p>
                  <p className="text-[11px] text-muted-foreground">
                    Adjust portion size
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-10 w-10 rounded-full"
                    aria-label="Decrease servings"
                    onClick={() => setServings((s) => Math.max(0.5, s - 0.5))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center text-base font-bold tabular-nums">
                    {servings}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-10 w-10 rounded-full"
                    aria-label="Increase servings"
                    onClick={() => setServings((s) => Math.min(5, s + 0.5))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <MacroStat
                  label="Protein"
                  value={scaled.protein}
                  unit="g"
                  tone="text-[hsl(var(--text-protein-raw))]"
                />
                <MacroStat
                  label="Carbs"
                  value={scaled.carbs}
                  unit="g"
                  tone="text-[hsl(var(--text-carbs-raw))]"
                />
                <MacroStat
                  label="Fat"
                  value={scaled.fat}
                  unit="g"
                  tone="text-[hsl(var(--text-fat-raw))]"
                />
              </div>

              {scaled.ingredients.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-bold text-muted-foreground">
                    Detected
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {scaled.ingredients.map((item) => (
                      <li
                        key={item}
                        className="rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="grid grid-cols-[auto_1fr] gap-2 pt-1">
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-2xl px-4"
                  onClick={resetScan}
                >
                  <RotateCcw className="h-4 w-4" />
                  Rescan
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="h-12 rounded-2xl text-base"
                  disabled={addEntry.isPending}
                  onClick={onSave}
                >
                  {addEntry.isPending ? (
                    <>
                      <Loader2 className="animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" /> Log meal
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
