export type BarcodeProduct = {
  barcode: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: string;
  imageUrl?: string;
};

type OffProduct = {
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  image_front_small_url?: string;
  image_url?: string;
  serving_size?: string;
  nutriments?: Record<string, number | undefined>;
};

function per100(nutriments: Record<string, number | undefined> | undefined, key: string) {
  const value = nutriments?.[key];
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : 0;
}

export async function lookupBarcodeProduct(
  barcode: string
): Promise<BarcodeProduct> {
  const code = barcode.replace(/\D/g, "");
  if (code.length < 8) {
    throw new Error("Enter a valid barcode (at least 8 digits).");
  }

  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`,
    {
      headers: {
        "User-Agent": "CalorieTrackerAI/1.0 (https://calorietracker.in)",
      },
      cache: "force-cache",
    }
  );

  if (!response.ok) {
    throw new Error("Could not reach the food database. Try again.");
  }

  const data = (await response.json()) as {
    status: number;
    product?: OffProduct;
  };

  if (data.status !== 1 || !data.product) {
    throw new Error("Product not found. Try another barcode or log manually.");
  }

  const product = data.product;
  const name =
    product.product_name?.trim() ||
    product.product_name_en?.trim() ||
    "Packaged food";

  return {
    barcode: code,
    name: product.brands ? `${name} (${product.brands})` : name,
    brand: product.brands,
    calories: per100(product.nutriments, "energy-kcal_100g"),
    protein: per100(product.nutriments, "proteins_100g"),
    carbs: per100(product.nutriments, "carbohydrates_100g"),
    fat: per100(product.nutriments, "fat_100g"),
    servingSize: product.serving_size,
    imageUrl: product.image_front_small_url || product.image_url,
  };
}
