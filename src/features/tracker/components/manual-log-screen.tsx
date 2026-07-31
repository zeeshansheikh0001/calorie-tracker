"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Barcode,
  Camera,
  Check,
  Loader2,
  Mic,
  MicOff,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { analyzeFoodText } from "@/ai/flows/analyze-food-text-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAddFoodEntry } from "@/features/calorie/hooks/use-daily-log-query";
import { useToast } from "@/hooks/use-toast";
import {
  appendTranscript,
  useSpeechToText,
} from "@/hooks/use-speech-to-text";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { formatLogDate } from "@/services/calorie/daily-log.service";

const schema = z.object({
  description: z.string().min(2, "Describe your meal"),
});

type FormValues = z.infer<typeof schema>;

type Estimate = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note?: string;
  benefits: string[];
};

const SUGGESTIONS = [
  "2 eggs with toast and avocado",
  "Grilled chicken bowl with rice",
  "Greek yogurt with berries",
  "Paneer wrap with salad",
] as const;

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
      <p
        className={cn(
          "text-[10px] font-bold uppercase tracking-[0.12em]",
          tone
        )}
      >
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

function ListeningBars({ active }: { active: boolean }) {
  return (
    <span className="inline-flex h-5 items-end gap-1" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="inline-block w-1 rounded-full bg-primary"
          animate={
            active
              ? {
                  height: [6, 16 + (i % 3) * 4, 8, 18, 6],
                  opacity: [0.45, 1, 0.6, 1, 0.45],
                }
              : { height: 6, opacity: 0.35 }
          }
          transition={
            active
              ? {
                  duration: 0.9 + i * 0.08,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.05,
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </span>
  );
}

export function ManualLogScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const dateKey = formatLogDate(new Date());
  const addEntry = useAddFoodEntry(dateKey);

  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [servings, setServings] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { description: "" },
  });

  const description = form.watch("description");
  const { ref: registerRef, ...descriptionField } = form.register("description");

  const onSpeechFinal = useCallback(
    (chunk: string) => {
      const current = form.getValues("description");
      form.setValue("description", appendTranscript(current, chunk), {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form]
  );

  const speech = useSpeechToText({
    onFinal: (chunk) => {
      analytics.voiceUsed("success");
      onSpeechFinal(chunk);
    },
    onError: (message) => {
      analytics.voiceUsed("error");
      toast({
        title: "Voice input",
        description: message,
        variant: "destructive",
      });
    },
  });

  const voiceBusy = speech.listening || speech.transcribing;

  useEffect(() => {
    if (!description) return;
    const el = textareaRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [description]);

  const scaled = useMemo(() => {
    if (!estimate) return null;
    return {
      ...estimate,
      calories: estimate.calories * servings,
      protein: estimate.protein * servings,
      carbs: estimate.carbs * servings,
      fat: estimate.fat * servings,
    };
  }, [estimate, servings]);

  const resetResult = () => {
    setEstimate(null);
    setServings(1);
    setError(null);
  };

  const onEstimate = form.handleSubmit(async ({ description: text }) => {
    if (speech.listening) speech.stop();
    setEstimating(true);
    setError(null);
    setEstimate(null);
    setServings(1);
    try {
      const result = await analyzeFoodText({ description: text });
      setEstimate({
        name: result.mealName?.trim() || text.trim(),
        calories: result.calorieEstimate,
        protein: result.proteinEstimate,
        carbs: result.carbEstimate,
        fat: result.fatEstimate,
        note: result.estimatedQuantityNote,
        benefits: result.healthBenefits ?? [],
      });
      analytics.nutritionEstimated("text");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "AI estimation failed.";
      setError(message);
      toast({
        title: "Estimation failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setEstimating(false);
    }
  });

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
          analytics.mealLogged("describe", { calories: scaled.calories });
          toast({ title: "Meal logged", description: scaled.name });
          router.push("/");
        },
        onError: () => {
          toast({
            title: "Couldn't save meal",
            variant: "destructive",
          });
        },
      }
    );
  };

  const showResult = Boolean(scaled) && !estimating;

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:px-6">
      <header className="mb-5 flex items-start gap-3">
        <Button asChild size="icon" variant="outline" className="rounded-2xl">
          <Link href="/" aria-label="Back to dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-medium tracking-[0.08em] text-primary">
            nourish
          </p>
          <h1 className="font-display mt-1 text-[1.85rem] font-medium leading-tight tracking-tight">
            Describe meal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Type or speak — AI estimates calories and macros.
          </p>
        </div>
      </header>

      <div className="mb-4 flex gap-2">
        <Link
          href="/log-food/photo"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border/70 bg-card/80 px-3 py-2.5 text-xs font-semibold text-foreground shadow-[var(--shadow-sm)] transition hover:border-primary/30 hover:bg-accent/40"
        >
          <Camera className="h-3.5 w-3.5 text-primary" />
          Photo
        </Link>
        <Link
          href="/log-food/barcode"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border/70 bg-card/80 px-3 py-2.5 text-xs font-semibold text-foreground shadow-[var(--shadow-sm)] transition hover:border-primary/30 hover:bg-accent/40"
        >
          <Barcode className="h-3.5 w-3.5 text-primary" />
          Barcode
        </Link>
      </div>

      <section
        className={cn(
          "relative flex-1 overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/90 shadow-[var(--shadow-md)] backdrop-blur-xl",
          speech.listening && "ring-2 ring-primary/35"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[var(--mesh-b)] blur-3xl"
        />

        <div className="relative flex h-full min-h-[22rem] flex-col p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                What did you eat?
              </p>
              {speech.listening ? (
                <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-primary">
                  <ListeningBars active />
                  Recording… tap mic to stop
                </p>
              ) : speech.transcribing ? (
                <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-primary">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Converting speech to text…
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Tap the mic, speak, tap again
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                if (!speech.supported) {
                  toast({
                    title: "Voice unavailable",
                    description:
                      "This browser doesn’t support microphone recording.",
                  });
                  return;
                }
                speech.toggle();
              }}
              disabled={speech.transcribing}
              aria-pressed={speech.listening}
              aria-label={
                speech.listening
                  ? "Stop recording"
                  : speech.transcribing
                    ? "Transcribing"
                    : "Start voice input"
              }
              className={cn(
                "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition active:scale-95 disabled:opacity-70",
                speech.listening
                  ? "bg-destructive text-destructive-foreground shadow-[0_0_0_6px_hsl(var(--destructive)/0.18)]"
                  : "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
              )}
            >
              {speech.listening && !reduceMotion ? (
                <>
                  <span className="absolute inset-0 animate-ping rounded-full bg-destructive/35" />
                  <span className="absolute -inset-1 rounded-full border border-destructive/40" />
                </>
              ) : null}
              {speech.transcribing ? (
                <Loader2 className="relative h-5 w-5 animate-spin" />
              ) : speech.listening ? (
                <MicOff className="relative h-5 w-5" />
              ) : (
                <Mic className="relative h-5 w-5" />
              )}
            </button>
          </div>

          <div className="relative flex-1">
            <Textarea
              id="description"
              rows={8}
              placeholder='e.g. "Grilled salmon with quinoa and roasted veggies"'
              className="h-full min-h-[14rem] resize-none rounded-[1.35rem] border-border/50 bg-background/60 px-4 py-4 text-base leading-relaxed shadow-none focus-visible:ring-primary/30"
              {...descriptionField}
              ref={(el) => {
                registerRef(el);
                textareaRef.current = el;
              }}
            />
          </div>

          {!description.trim() && !voiceBusy ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    form.setValue("description", item, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className="rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-left text-[11px] font-medium text-muted-foreground transition hover:border-primary/30 hover:bg-primary/10 hover:text-foreground"
                >
                  {item}
                </button>
              ))}
            </div>
          ) : null}

          {form.formState.errors.description?.message ? (
            <p className="mt-3 text-xs font-medium text-destructive" role="alert">
              {form.formState.errors.description.message}
            </p>
          ) : null}

          {error && !showResult ? (
            <p
              className="mt-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-4 grid gap-2">
            <Button
              type="button"
              size="lg"
              className="h-12 w-full rounded-2xl text-base"
              disabled={estimating || voiceBusy || !description.trim()}
              onClick={onEstimate}
            >
              {estimating ? (
                <>
                  <Loader2 className="animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <Sparkles /> Estimate nutrition
                </>
              )}
            </Button>
            {description.trim() ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                disabled={estimating || voiceBusy}
                onClick={() => {
                  form.reset({ description: "" });
                  resetResult();
                }}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {estimating ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-4 bottom-28 z-30 sm:inset-x-6"
          >
            <div className="rounded-2xl border border-primary/20 bg-card/95 px-4 py-3 text-sm shadow-[var(--shadow-md)] backdrop-blur-xl">
              <p className="flex items-center gap-2 font-semibold text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Estimating macros…
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Matching portions and common ingredients
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showResult && scaled ? (
          <motion.section
            initial={reduceMotion ? false : { y: "100%" }}
            animate={{ y: 0 }}
            exit={reduceMotion ? undefined : { y: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-40 mx-auto max-h-[78dvh] w-full max-w-lg overflow-y-auto rounded-t-[1.75rem] border border-border/60 bg-card text-card-foreground shadow-[0_-20px_60px_rgba(0,0,0,0.28)]"
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
                  aria-label="Dismiss result"
                  onClick={resetResult}
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

              {scaled.benefits.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-bold text-muted-foreground">
                    Highlights
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {scaled.benefits.map((item) => (
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
                  onClick={resetResult}
                >
                  <RotateCcw className="h-4 w-4" />
                  Edit
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
