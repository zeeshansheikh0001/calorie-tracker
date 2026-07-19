"use client";

import {
  ArrowLeft,
  Camera,
  ImagePlus,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { analyzeFoodPhoto } from "@/ai/flows/analyze-food-photo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useAddFoodEntry } from "@/features/calorie/hooks/use-daily-log-query";
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

function MacroRing({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const r = 22;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56" aria-hidden>
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="5"
        />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <p className="text-[10px] font-bold text-muted-foreground">{label}</p>
      <p className="text-xs font-bold tabular-nums">{pct}%</p>
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

  const [mode, setMode] = useState<"upload" | "camera">("camera");
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [servings, setServings] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      setError("Camera unavailable — try uploading a photo.");
      setMode("upload");
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
        setError("That doesn't look like food. Try another photo.");
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
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const uri = canvas.toDataURL("image/jpeg", 0.92);
    setPreview(uri);
    stopCamera();
    await analyzeUri(uri);
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

  const labelPositions = [
    { top: "18%", left: "12%" },
    { top: "28%", right: "10%" },
    { top: "58%", left: "8%" },
    { top: "62%", right: "12%" },
  ];

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-background">
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Button
          asChild
          size="icon"
          variant="secondary"
          className="h-10 w-10 rounded-full bg-black/35 text-white backdrop-blur-md hover:bg-black/45"
        >
          <Link href="/" aria-label="Back" onClick={stopCamera}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
          AI Scan
        </div>
        <div className="flex gap-1 rounded-full bg-black/35 p-1 backdrop-blur-md">
          {(["camera", "upload"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-bold capitalize text-white/80",
                mode === item && "bg-white text-foreground"
              )}
              onClick={() => {
                setMode(item);
                if (item === "camera") void startCamera();
                else stopCamera();
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="relative min-h-[52dvh] flex-1 bg-black">
        {preview ? (
          <Image
            src={preview}
            alt="Selected meal"
            fill
            className="object-cover"
            unoptimized
          />
        ) : mode === "camera" ? (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="absolute inset-0 h-full w-full object-cover"
            onLoadedMetadata={() => {
              if (!cameraOn) void startCamera();
            }}
          />
        ) : (
          <button
            type="button"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-primary/20 to-black text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 backdrop-blur">
              <ImagePlus className="h-7 w-7" />
            </span>
            <span className="text-sm font-semibold">Choose a food photo</span>
          </button>
        )}

        {analyzing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 backdrop-blur-[2px]">
            <motion.div
              className="h-28 w-28 rounded-full border-2 border-primary/40"
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }
              }
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-white">
              <Loader2 className="h-4 w-4 animate-spin" /> Detecting food…
            </p>
          </div>
        ) : null}

        {estimate && preview ? (
          <div className="pointer-events-none absolute inset-0">
            {estimate.ingredients.slice(0, 4).map((ingredient, i) => (
              <span
                key={`${ingredient}-${i}`}
                className="absolute rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-[var(--shadow-md)]"
                style={labelPositions[i]}
              >
                {ingredient}
              </span>
            ))}
            <span className="absolute bottom-4 left-4 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground shadow-[var(--shadow-glow)]">
              {estimate.confidence}% confidence
            </span>
          </div>
        ) : null}

        {!preview && mode === "camera" ? (
          <div className="absolute inset-x-0 bottom-6 flex justify-center gap-4">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-12 w-12 rounded-full bg-white/20 text-white backdrop-blur"
              onClick={() => void startCamera()}
              aria-label="Restart camera"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              className="h-16 w-16 rounded-full bg-primary shadow-[var(--shadow-glow)]"
              disabled={!cameraOn || analyzing}
              onClick={() => void capture()}
              aria-label="Capture photo"
            >
              <Camera className="h-6 w-6" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-12 w-12 rounded-full bg-white/20 text-white backdrop-blur"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload photo"
            >
              <ImagePlus className="h-5 w-5" />
            </Button>
          </div>
        ) : null}

        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </div>

      {error ? (
        <p
          className="mx-4 mt-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <AnimatePresence>
        {scaled ? (
          <motion.div
            initial={reduceMotion ? false : { y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-30 -mt-8 rounded-t-[1.75rem] border border-border/60 bg-card px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[var(--shadow-lg)]"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Nutrition estimate
                </p>
                <p className="mt-1 text-xl font-bold tracking-tight">
                  {Math.round(scaled.calories)} kcal
                </p>
                {scaled.note ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {scaled.note}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="rounded-full"
                aria-label="Clear result"
                onClick={() => {
                  setEstimate(null);
                  setPreview(null);
                  if (mode === "camera") void startCamera();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <FormField label="Meal name" htmlFor="meal-name">
              <Input
                id="meal-name"
                value={scaled.name}
                onChange={(e) =>
                  setEstimate((prev) =>
                    prev ? { ...prev, name: e.target.value } : prev
                  )
                }
              />
            </FormField>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-muted/60 px-3 py-2.5">
              <span className="text-sm font-semibold">Servings</span>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 rounded-full"
                  aria-label="Decrease servings"
                  onClick={() => setServings((s) => Math.max(0.5, s - 0.5))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-sm font-bold tabular-nums">
                  {servings}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 rounded-full"
                  aria-label="Increase servings"
                  onClick={() => setServings((s) => Math.min(5, s + 0.5))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-5 flex justify-around">
              <MacroRing
                label="Protein"
                value={scaled.protein}
                max={Math.max(scaled.protein, 40)}
                color="hsl(var(--text-protein-raw))"
              />
              <MacroRing
                label="Carbs"
                value={scaled.carbs}
                max={Math.max(scaled.carbs, 60)}
                color="hsl(var(--text-carbs-raw))"
              />
              <MacroRing
                label="Fat"
                value={scaled.fat}
                max={Math.max(scaled.fat, 30)}
                color="hsl(var(--text-fat-raw))"
              />
              <MacroRing
                label="Energy"
                value={scaled.calories}
                max={Math.max(scaled.calories, 600)}
                color="hsl(var(--primary))"
              />
            </div>

            {scaled.ingredients.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {scaled.ingredients.map((item) => (
                  <li
                    key={item}
                    className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}

            <Button
              type="button"
              size="lg"
              className="mt-5 w-full"
              disabled={addEntry.isPending}
              onClick={onSave}
            >
              {addEntry.isPending ? "Saving…" : "Log this meal"}
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
