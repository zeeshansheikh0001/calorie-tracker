
"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType, type Html5QrcodeResult, Html5QrcodeScannerState } from "html5-qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScanLine, PackageSearch, PlusCircle, CheckCircle, AlertCircle, Loader2, RefreshCcw } from "lucide-react";
import { useDailyLog } from "@/hooks/use-daily-log";
import { useToast } from "@/hooks/use-toast";
import type { FoodEntry } from "@/types";
import { cn } from "@/lib/utils";

interface ScannedProductInfo {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

const qrcodeRegionId = "html5qr-code-full-region";

export default function LogFoodByBarcodePage() {
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<ScannedProductInfo | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [hasLogged, setHasLogged] = useState(false);

  const { addFoodEntry } = useDailyLog();
  const { toast } = useToast();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    let localScannerInstance: Html5QrcodeScanner | null = null;

    if (isScanning) {
      console.log("Barcode Scanner: useEffect - isScanning is true. Attempting to initialize.");
      setScanError(null);
      setProductInfo(null);
      setScannedBarcode(null);
      setHasLogged(false);

      const scannerRegion = document.getElementById(qrcodeRegionId);
      if (!scannerRegion) {
        console.error("Barcode Scanner: Scanner region DOM element not found.");
        setScanError("Scanner UI element not found. Please refresh the page.");
        setIsScanning(false);
        return;
      }

      if (scannerRef.current) {
        console.warn("Barcode Scanner: useEffect - scannerRef.current was not null. Attempting to clear stale instance.");
        const staleScanner = scannerRef.current;
        scannerRef.current = null; 
        try {
          if (staleScanner.getState() === Html5QrcodeScannerState.SCANNING || staleScanner.getState() === Html5QrcodeScannerState.PAUSED) {
            staleScanner.clear().catch(err => console.error("Barcode Scanner: Error clearing stale scanner from ref:", err));
          }
        } catch (e) {
          console.error("Barcode Scanner: Exception clearing stale scanner from ref:", e);
        }
      }

      const verbose = false;
      const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
        const minEdgePercentage = 0.7;
        const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
        const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
        return { width: qrboxSize, height: qrboxSize };
      };

      const onScanSuccess = (decodedText: string, result: Html5QrcodeResult) => {
        console.log(`Barcode Scanner: Scan successful - ${decodedText}`, result);
        setIsScanning(false); 
        setScannedBarcode(decodedText);
        
        // Async IIFE for product lookup
        (async () => {
          setIsLoadingProduct(true);
          setProductInfo(null);
          setScanError(null);
          try {
            const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${decodedText}.json`);
            if (!response.ok) {
              if (response.status === 404) {
                throw new Error(`Product with barcode ${decodedText} not found.`);
              }
              throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 0 || !data.product) {
              throw new Error(`Product with barcode ${decodedText} not found in Open Food Facts database.`);
            }

            const product = data.product;
            const nutriments = product.nutriments || {};

            const getNutrientValue = (nutrientKey: string): number => {
              const value = nutriments[nutrientKey];
              return typeof value === 'number' ? value : 0;
            };
            
            let calories = getNutrientValue('energy-kcal_100g');
            if (calories === 0 && nutriments['energy_100g']) { 
               const energyKj = getNutrientValue('energy_100g');
               if (energyKj > 0) {
                   calories = Math.round(energyKj / 4.184);
               }
            }

            const fetchedProductInfo: ScannedProductInfo = {
              id: decodedText,
              name: product.product_name_en || product.product_name || product.generic_name || `Product ${decodedText}`,
              calories: calories,
              protein: getNutrientValue('proteins_100g'),
              fat: getNutrientValue('fat_100g'),
              carbs: getNutrientValue('carbohydrates_100g'),
            };
            
            setProductInfo(fetchedProductInfo);

            if (fetchedProductInfo.calories === 0 && !fetchedProductInfo.name.toLowerCase().includes('product ')) {
               console.warn(`Product ${fetchedProductInfo.name} found, but nutritional data might be incomplete.`);
               toast({
                   title: "Nutritional Data May Be Incomplete",
                   description: `Found ${fetchedProductInfo.name}, but some nutritional information (like calories) might be missing or zero.`,
                   variant: "default", 
               });
            } else {
              toast({
                title: "Product Found!",
                description: `Details for ${fetchedProductInfo.name} loaded. Values are typically per 100g/ml.`,
                action: <PackageSearch className="text-green-500" />
              });
            }

          } catch (error: any) {
            console.error("Error fetching product data:", error);
            const errorMessage = error.message || "Failed to fetch product information.";
            setScanError(errorMessage);
            toast({
              title: "Product Fetch Error",
              description: errorMessage,
              variant: "destructive",
              action: <AlertCircle className="text-red-500" />
            });
          } finally {
            setIsLoadingProduct(false);
          }
        })();
      };

      const onScanFailure = (error: string) => {
        // console.warn(`Barcode Scanner: Scan Failure - ${error}`); 
      };
      
      try {
        localScannerInstance = new Html5QrcodeScanner(
          qrcodeRegionId,
          {
            fps: 10,
            qrbox: qrboxFunction,
            rememberLastUsedCamera: true,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          },
          verbose
        );

        console.log("Barcode Scanner: Calling localScannerInstance.render().");
        localScannerInstance.render(onScanSuccess, onScanFailure);
        
        if (isScanning && localScannerInstance) { 
            scannerRef.current = localScannerInstance;
        } else if (localScannerInstance) {
            console.log("Barcode Scanner: isScanning became false during/after render. Clearing orphaned scanner.");
            try {
                if (localScannerInstance.getState() === Html5QrcodeScannerState.SCANNING || localScannerInstance.getState() === Html5QrcodeScannerState.PAUSED) {
                   localScannerInstance.clear().catch(e => console.error("Error clearing orphaned scanner post-render:", e));
                }
            } catch(e) {
                 console.error("Exception clearing orphaned scanner post-render:", e);
            }
        }
      } catch (initOrRenderError) {
          console.error("Barcode Scanner: Error during Html5QrcodeScanner instantiation or render call.", initOrRenderError);
          const errorMessage = (initOrRenderError instanceof Error) ? initOrRenderError.message : String(initOrRenderError);
          setScanError(`Scanner initialization/render error: ${errorMessage}. Check console and camera permissions.`);
          setIsScanning(false);
      }
    }

    return () => {
      console.log("Barcode Scanner: useEffect cleanup function running.");
      const scannerToAttemptClear = localScannerInstance || scannerRef.current;
      
      if (scannerRef.current === scannerToAttemptClear) {
        scannerRef.current = null;
      }

      if (scannerToAttemptClear) {
        console.log("Barcode Scanner: Cleanup - Attempting to clear scanner instance:", scannerToAttemptClear);
        try {
          const state = scannerToAttemptClear.getState();
          if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
            scannerToAttemptClear.clear()
              .then(() => console.log("Barcode Scanner: Cleanup - Scanner cleared successfully. State was:", state))
              .catch(err => console.error("Barcode Scanner: Cleanup - Error during .clear():", err));
          } else {
            console.log("Barcode Scanner: Cleanup - Scanner not in active state to be cleared. State:", state);
          }
        } catch (e) {
          console.error("Barcode Scanner: Cleanup - Exception during clear attempt (e.g., getState failed):", e);
        }
      }
    };
  }, [isScanning, toast]);

  const handleStartScan = () => {
    console.log("Barcode Scanner: handleStartScan called.");
    setProductInfo(null);
    setScannedBarcode(null);
    setScanError(null);
    setHasLogged(false);

    if (isScanning) {
      console.log("Barcode Scanner: handleStartScan - Already scanning, forcing re-initialization.");
      setIsScanning(false); 
      setTimeout(() => {
        setIsScanning(true); 
      }, 100); 
    } else {
      setIsScanning(true);
    }
  };
  
  const handleCancelScan = () => {
    console.log("Barcode Scanner: handleCancelScan called.");
    setIsScanning(false); 
  }

  const handleScanAnother = () => {
    console.log("Barcode Scanner: handleScanAnother called.");
    handleStartScan(); 
  }

  const handleAddToLog = () => {
    if (!productInfo) return;
    addFoodEntry({
      name: productInfo.name,
      calories: productInfo.calories,
      protein: productInfo.protein,
      fat: productInfo.fat,
      carbs: productInfo.carbs,
    });
    toast({
      title: "Logged!",
      description: `${productInfo.name} added to your daily log.`,
      action: <CheckCircle className="text-green-500" />,
    });
    setHasLogged(true);
    setProductInfo(null); 
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-lg mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <ScanLine className="mr-2 h-6 w-6 text-primary" />
            Scan Barcode
          </CardTitle>
          <CardDescription>
            Use your device's camera to scan a product barcode. Fetches data from Open Food Facts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div 
            id={qrcodeRegionId} 
            className={cn(
              "w-full aspect-video bg-muted rounded-md border border-dashed", 
              { "min-h-[300px]": isScanning || (!isScanning && !productInfo && !scannedBarcode && !scanError && !hasLogged) }
            )}
          />

          {scanError && !isScanning && !isLoadingProduct && !productInfo && ( 
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Scan Error</AlertTitle>
              <AlertDescription>{scanError}</AlertDescription>
            </Alert>
          )}

          {!isScanning && !productInfo && !isLoadingProduct && !hasLogged && (
             <Button onClick={handleStartScan} size="lg" className="w-full">
              <ScanLine className="mr-2 h-5 w-5" /> Start Scanning
            </Button>
          )}
          
          {isScanning && (
             <Button onClick={handleCancelScan} variant="outline" className="w-full">
              Cancel Scan
            </Button>
          )}

          {isLoadingProduct && (
            <div className="flex items-center justify-center p-6 bg-secondary/50 rounded-md mt-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3 text-foreground">Looking up product...</p>
            </div>
          )}

          {scannedBarcode && !productInfo && !isLoadingProduct && !isScanning && scanError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Product Lookup Failed</AlertTitle>
              <AlertDescription>
                Scanned: {scannedBarcode}. {scanError}
              </AlertDescription>
               <Button onClick={handleScanAnother} variant="outline" className="w-full mt-4">
                  <RefreshCcw className="mr-2 h-4 w-4" /> Scan Another Item
                </Button>
            </Alert>
          )}
          
          {scannedBarcode && !productInfo && !isLoadingProduct && !isScanning && !scanError && (
             <Alert>
              <PackageSearch className="h-4 w-4" />
              <AlertTitle>Barcode Scanned</AlertTitle>
              <AlertDescription>
                Scanned: {scannedBarcode}. Waiting for product details or an error occurred silently.
              </AlertDescription>
               <Button onClick={handleScanAnother} variant="outline" className="w-full mt-4">
                  <RefreshCcw className="mr-2 h-4 w-4" /> Scan Another Item
                </Button>
            </Alert>
          )}


          {productInfo && (
            <Card className="mt-4 bg-background shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <PackageSearch className="mr-2 h-5 w-5 text-primary" /> {productInfo.name}
                </CardTitle>
                <CardDescription>Scanned Barcode: {productInfo.id} (Data per 100g/ml)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>Calories:</strong> {productInfo.calories} kcal</div>
                <div><strong>Protein:</strong> {productInfo.protein} g</div>
                <div><strong>Fat:</strong> {productInfo.fat} g</div>
                <div><strong>Carbs:</strong> {productInfo.carbs} g</div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleAddToLog} disabled={hasLogged} className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> {hasLogged ? "Logged" : "Add to Daily Log"}
                </Button>
                 <Button onClick={handleScanAnother} variant="outline" className="w-full sm:w-auto">
                  <RefreshCcw className="mr-2 h-4 w-4" /> Scan Another Item
                </Button>
              </CardFooter>
            </Card>
          )}
           {hasLogged && !isScanning && !productInfo && ( 
             <Button onClick={handleScanAnother} size="lg" className="w-full mt-4">
                <RefreshCcw className="mr-2 h-5 w-5" /> Scan Another Item
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
    
