import { SurfaceCard } from "@/components/ui/surface-card";

type NutritionResultCardProps = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note?: string;
};

export function NutritionResultCard({
  name,
  calories,
  protein,
  carbs,
  fat,
  note,
}: NutritionResultCardProps) {
  return (
    <SurfaceCard elevated>
      <p className="text-base font-semibold tracking-tight">{name}</p>
      {note ? (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {note}
        </p>
      ) : null}
      <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
        {[
          { label: "kcal", value: Math.round(calories) },
          { label: "Protein", value: `${Math.round(protein)}g` },
          { label: "Carbs", value: `${Math.round(carbs)}g` },
          { label: "Fat", value: `${Math.round(fat)}g` },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border/60 bg-muted/40 px-2 py-3"
          >
            <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {item.label}
            </dt>
            <dd className="mt-1 text-sm font-semibold tabular-nums tracking-tight">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </SurfaceCard>
  );
}
