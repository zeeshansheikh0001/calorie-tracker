
"use client";

import type { AnalyzeFoodPhotoOutput } from "@/ai/flows/analyze-food-photo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Drumstick, Droplets, Wheat, List, Info } from "lucide-react"; // Added Info icon
import React from 'react'; // Added React import

interface NutritionDisplayProps {
  result: AnalyzeFoodPhotoOutput;
  estimatedQuantityNote?: string; // Added from text analysis, optional here
}

const NutritionItem: React.FC<{ icon: React.ElementType; label: string; value: string | number; unit?: string; colorClass?: string }> = React.memo(({ icon: Icon, label, value, unit, colorClass = "text-primary" }) => (
  <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
    <div className="flex items-center">
      <Icon className={`h-5 w-5 mr-3 ${colorClass}`} />
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
    <span className="text-sm text-muted-foreground">{value}{unit && <span className="text-xs"> {unit}</span>}</span>
  </div>
));
NutritionItem.displayName = 'NutritionItem';


export default function NutritionDisplay({ result, estimatedQuantityNote }: NutritionDisplayProps) {
  const quantityNote = result.estimatedQuantityNote || estimatedQuantityNote;

  return (
    <Card className="bg-background shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-center text-primary">Nutritional Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {quantityNote && (
          <div className="text-xs text-muted-foreground flex items-start p-2.5 bg-secondary/20 rounded-md shadow-sm">
            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-primary/80" />
            <span>{quantityNote}</span>
          </div>
        )}
        <NutritionItem icon={Flame} label="Calories" value={result.calorieEstimate.toLocaleString()} unit="kcal" colorClass="text-red-500" />
        <NutritionItem icon={Drumstick} label="Protein" value={result.proteinEstimate.toLocaleString()} unit="g" colorClass="text-blue-500" />
        <NutritionItem icon={Droplets} label="Fat" value={result.fatEstimate.toLocaleString()} unit="g" colorClass="text-yellow-500" />
        <NutritionItem icon={Wheat} label="Carbohydrates" value={result.carbEstimate.toLocaleString()} unit="g" colorClass="text-green-500" />
        
        <div>
          <div className="flex items-center mt-4 mb-2">
            <List className="h-5 w-5 mr-3 text-gray-500" />
            <h4 className="text-sm font-medium text-foreground">Identified Dish(es):</h4>
          </div>
          {result.ingredients && result.ingredients.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.ingredients.map((ingredient, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {ingredient}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No specific dish identified.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
