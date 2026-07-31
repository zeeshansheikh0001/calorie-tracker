"use client";

import { ArrowLeft, Barcode, Loader2, ScanLine } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SurfaceCard } from "@/components/ui/surface-card";
import { NutritionResultCard } from "@/features/tracker/components/nutrition-result-card";
import { useAddFoodEntry } from "@/features/calorie/hooks/use-daily-log-query";
import { useToast } from "@/hooks/use-toast";
import { analytics } from "@/lib/analytics";
import type { BarcodeProduct } from "@/lib/food/open-food-facts";
import { formatLogDate } from "@/services/calorie/daily-log.service";

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
};

declare global {
  interface Window {
    BarcodeDetector?: new (options?: {
      formats?: string[];
    }) => BarcodeDetectorLike;
  }
}

export function BarcodeLogScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const dateKey = formatLogDate(new Date());
  const addEntry = useAddFoodEntry(dateKey);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [barcode, setBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<BarcodeProduct | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }, []);

  useEffect(() => {
    setCameraSupported(
      typeof window !== "undefined" &&
        "BarcodeDetector" in window &&
        !!navigator.mediaDevices?.getUserMedia
    );
    return () => stopCamera();
  }, [stopCamera]);

  const lookup = async (code: string) => {
    setLoading(true);
    setError(null);
    setProduct(null);
    try {
      const response = await fetch(
        `/api/food/barcode/${encodeURIComponent(code.replace(/\D/g, ""))}`
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.product) {
        throw new Error(data.error || "Lookup failed.");
      }
      const result = data.product as BarcodeProduct;
      setProduct(result);
      setBarcode(result.barcode);
      analytics.nutritionEstimated("barcode");
      stopCamera();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Lookup failed.";
      setError(message);
      toast({
        title: "Barcode lookup failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    if (!window.BarcodeDetector) {
      toast({
        title: "Camera scan unavailable",
        description: "Enter the barcode digits manually instead.",
        variant: "destructive",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setScanning(true);

      const detector = new window.BarcodeDetector({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"],
      });

      const tick = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        try {
          const codes = await detector.detect(videoRef.current);
          const value = codes[0]?.rawValue;
          if (value) {
            await lookup(value);
            return;
          }
        } catch {
          // keep scanning
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      toast({
        title: "Camera permission needed",
        description: "Allow camera access, or type the barcode manually.",
        variant: "destructive",
      });
      stopCamera();
    }
  };

  const onSave = () => {
    if (!product) return;
    addEntry.mutate(
      {
        name: product.name,
        calories: product.calories,
        protein: product.protein,
        carbs: product.carbs,
        fat: product.fat,
      },
      {
        onSuccess: () => {
          analytics.mealLogged("barcode", { calories: product.calories });
          toast({
            title: "Meal logged",
            description: `${product.name} (per 100g)`,
          });
          router.push("/");
        },
        onError: () =>
          toast({ title: "Couldn't save meal", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6 sm:px-6">
      <div className="mb-7 flex items-start gap-3">
        <Button asChild size="icon" variant="outline" className="rounded-xl">
          <Link href="/" aria-label="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scan barcode</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Look up packaged food via Open Food Facts (values per 100g).
          </p>
        </div>
      </div>

      <SurfaceCard className="space-y-4">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover ${
              scanning ? "opacity-100" : "opacity-0"
            }`}
            muted
            playsInline
          />
          {!scanning ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
              <Barcode className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {cameraSupported
                  ? "Start the camera to scan a barcode"
                  : "Live scan needs Chrome/Edge — enter digits below"}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex gap-2">
          {scanning ? (
            <Button type="button" variant="outline" className="flex-1" onClick={stopCamera}>
              Stop camera
            </Button>
          ) : (
            <Button
              type="button"
              className="flex-1"
              onClick={startCamera}
              disabled={!cameraSupported || loading}
            >
              <ScanLine className="mr-2 h-4 w-4" />
              Start scan
            </Button>
          )}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void lookup(barcode);
          }}
        >
          <Input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            inputMode="numeric"
            placeholder="Or type barcode digits"
            aria-label="Barcode"
          />
          <Button type="submit" disabled={loading || barcode.trim().length < 8}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup"}
          </Button>
        </form>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        <p className="text-xs text-muted-foreground">
          Prefer describing a homemade meal?{" "}
          <Link href="/log-food/manual" className="font-semibold text-primary">
            Log manually
          </Link>
          {" · "}
          <Link href="/log-food/photo" className="font-semibold text-primary">
            Scan photo
          </Link>
        </p>
      </SurfaceCard>

      {product ? (
        <div className="mt-5 space-y-3">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="mx-auto h-28 w-28 rounded-2xl object-cover shadow-[var(--shadow-sm)]"
            />
          ) : null}
          <NutritionResultCard
            name={product.name}
            calories={product.calories}
            protein={product.protein}
            carbs={product.carbs}
            fat={product.fat}
            note={
              product.servingSize
                ? `Per 100g · listed serving ${product.servingSize}`
                : "Nutrition values per 100g"
            }
          />
          <Button
            type="button"
            className="w-full"
            onClick={onSave}
            disabled={addEntry.isPending}
          >
            {addEntry.isPending ? "Saving..." : "Add to today’s log"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
