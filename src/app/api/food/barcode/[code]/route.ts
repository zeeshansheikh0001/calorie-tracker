import { NextResponse } from "next/server";
import { lookupBarcodeProduct } from "@/lib/food/open-food-facts";

type Params = { params: Promise<{ code: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { code } = await params;
  try {
    const product = await lookupBarcodeProduct(code);
    return NextResponse.json({ success: true, product });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Barcode lookup failed";
    const status = /not found/i.test(message) ? 404 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
