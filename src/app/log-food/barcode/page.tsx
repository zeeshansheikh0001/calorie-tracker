
"use client";

import { useEffect, useState, useRef, type FC } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType, type Html5QrcodeResult, Html5QrcodeScannerState } from "html5-qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  ScanLine, 
  PackageSearch, 
  PlusCircle, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCcw,
  XCircle,
  Flame,
  Drumstick,
  Droplets,
  Wheat 
} from "lucide-react";
import { useDailyLog } from "@/hooks/use-daily-log";
import { useToast } from "@/hooks/use-toast";
import type { FoodEntry } from "@/types";
// import { cn } from "@/lib/utils"; // cn might not be used anymore in this version

interface ScannedProductInfo {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

const qrcodeRegionId = "html5qr-code-full-region";

interface NutritionInfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
}

const NutritionInfoItem: FC<NutritionInfoItemProps> = ({ icon: Icon, label, value, color = "text-foreground" }) => (
  <div className={`flex items-center space-x-2 p-2.5 rounded-lg bg-secondary/30 shadow-sm transition-all hover:shadow-md`}>
    <div className={`p-1.5 rounded-md bg-background/70 ${color}`}>
      <Icon className={`h-5 w-5 flex-shrink-0`} />
    </div>
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`font-semibold text-sm ${color}`}>{value}</p>
    </div>
  </div>
);


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
      
      // Attempt to clear stale scanner from ref if it exists and is active
      if (scannerRef.current) {
        console.warn("Barcode Scanner: useEffect - scannerRef.current was not null. Attempting to clear stale instance from ref.");
        const staleScanner = scannerRef.current;
        scannerRef.current = null; // Nullify ref immediately
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

      const onScanSuccess = (decodedTextOriginal: string, result: Html5QrcodeResult) => {
        console.log(`Barcode Scanner: Scan successful - ${decodedTextOriginal}`, result);
        const decodedText = decodedTextOriginal.trim(); // Trim the barcode
        
        setIsScanning(false); // This will trigger useEffect cleanup for the scanner
        setScannedBarcode(decodedText);
        
        (async () => {
          setIsLoadingProduct(true);
          setProductInfo(null);
          setScanError(null); 
          try {
            const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${decodedText}.json`);
            
            if (!response.ok) {
              let errorMessage = `API request failed with status ${response.status}.`;
              if (response.status === 404) {
                errorMessage = `Product with barcode ${decodedText} not found in the Open Food Facts database. The database is community-driven and may not include all products.`;
              }
              console.warn("Error fetching product data (response not ok):", errorMessage);
              setScanError(errorMessage);
              toast({
                title: response.status === 404 ? "Product Not Found" : "API Error",
                description: errorMessage,
                variant: "destructive",
                action: <AlertCircle className="text-red-500" />
              });
              setIsLoadingProduct(false);
              return; 
            }

            const data = await response.json();

            if (data.status === 0 || !data.product) {
              const errorMessage = `Product with barcode ${decodedText} not found in Open Food Facts database, or data is unavailable. This community database may not have all products.`;
              console.warn("Product data issue (status 0 or no product):", errorMessage, data);
              setScanError(errorMessage);
              toast({
                title: "Product Data Not Available",
                description: errorMessage,
                variant: "destructive", 
                action: <AlertCircle className="text-red-500" />
              });
              setIsLoadingProduct(false);
              return; 
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
                   description: `Found ${fetchedProductInfo.name}, but some nutritional information (like calories) might be missing or zero. Values are typically per 100g/ml.`,
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
            console.error("Error fetching product data (catch block):", error);
            const errorMessage = error.message || "Failed to fetch product information. Check your internet connection.";
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
        // Don't set scanError here for minor scan failures, only for initialization/major issues.
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
        
        // Only assign to ref if render was called and we are still in scanning mode
        // This helps if isScanning becomes false quickly after render is called.
        if (isScanning && localScannerInstance) { 
            scannerRef.current = localScannerInstance;
        } else if (localScannerInstance) {
            // If isScanning became false during/after render call (e.g. user cancelled immediately)
            // try to clean up the orphaned scanner.
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
          setIsScanning(false); // This will trigger cleanup in useEffect
      }
    }

    return () => {
      console.log("Barcode Scanner: useEffect cleanup function running.");
      // Prefer clearing the local instance if it exists, otherwise use the ref.
      const scannerToAttemptClear = localScannerInstance || scannerRef.current;
      
      if (scannerRef.current === scannerToAttemptClear) {
        // If the scanner we are about to clear is the one in the ref, nullify the ref first.
        // This is important so that subsequent calls to start scanning don't try to use a ref
        // to an instance that is in the process of being cleared.
        scannerRef.current = null;
      }

      if (scannerToAttemptClear) {
        console.log("Barcode Scanner: Cleanup - Attempting to clear scanner instance:", scannerToAttemptClear);
        try {
          // Check scanner state before attempting to clear
          const state = scannerToAttemptClear.getState();
          if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
            scannerToAttemptClear.clear()
              .then(() => console.log("Barcode Scanner: Cleanup - Scanner cleared successfully. State was:", state))
              .catch(err => console.error("Barcode Scanner: Cleanup - Error during .clear():", err));
          } else {
            console.log("Barcode Scanner: Cleanup - Scanner not in active state to be cleared. State:", state);
          }
        } catch (e) {
          // This catch is for errors like `getState()` failing if the instance is already broken.
          console.error("Barcode Scanner: Cleanup - Exception during clear attempt (e.g., getState failed):", e);
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning]); // Removed toast from dependencies to avoid re-renders


  const handleStartScan = () => {
    console.log("Barcode Scanner: handleStartScan called.");
    setProductInfo(null);
    setScannedBarcode(null);
    setScanError(null);
    setHasLogged(false);

    if (isScanning && scannerRef.current) {
      // If already scanning (e.g. "Scan Another" clicked while scanner is somehow still active),
      // force a re-initialization by toggling isScanning.
      console.log("Barcode Scanner: handleStartScan - Already scanning, attempting to force re-initialization.");
      setIsScanning(false); // This will trigger cleanup in useEffect
      setTimeout(() => {
        setIsScanning(true); // This will trigger initialization in useEffect
      }, 150); // Small delay to allow cleanup to complete
    } else {
      setIsScanning(true);
    }
  };
  
  const handleCancelScan = () => {
    console.log("Barcode Scanner: handleCancelScan called.");
    setIsScanning(false); // This will trigger cleanup in useEffect
  }

  const handleScanAnother = () => {
    console.log("Barcode Scanner: handleScanAnother called.");
    // Reset state and then re-trigger scanning, similar to handleStartScan
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
    setProductInfo(null); // Clear product info after logging
  };

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center">
      <Card className="w-full max-w-md mx-auto shadow-xl overflow-hidden">
        <CardHeader className="text-center p-6 bg-gradient-to-br from-primary/10 to-background">
          <ScanLine className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Scan Product Barcode</CardTitle>
          <CardDescription>
            Use your device camera to scan a barcode. Data from Open Food Facts.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-4 md:p-6">
          {/* Scanner UI region */}
          <div className="relative w-full aspect-[4/3] bg-muted/50 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden shadow-inner">
            {isScanning ? (
              <div id={qrcodeRegionId} className="w-full h-full" />
            ) : (
              <div className="text-center text-muted-foreground p-4 opacity-75">
                <ScanLine className="mx-auto h-12 w-12 mb-3" />
                <p className="font-medium">Camera Disconnected</p>
                <p className="text-xs">Click "Start Scanning" to activate.</p>
              </div>
            )}
          </div>

          {/* Error display if scanner fails to init or major scan error */}
          {scanError && !isScanning && !isLoadingProduct && !productInfo && ( 
            <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Scan Error</AlertTitle>
              <AlertDescription>{scanError}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isScanning && !productInfo && !isLoadingProduct && !hasLogged && (
              <Button onClick={handleStartScan} size="lg" className="w-full group transition-transform hover:scale-105 active:scale-95">
                <ScanLine className="mr-2 h-5 w-5 group-hover:animate-ping-once" /> Start Scanning
              </Button>
            )}
            {isScanning && (
              <Button onClick={handleCancelScan} variant="outline" className="w-full">
                <XCircle className="mr-2 h-5 w-5" /> Cancel Scan
              </Button>
            )}
          </div>

          {/* Loading Product Indicator */}
          {isLoadingProduct && (
            <div className="flex flex-col items-center justify-center p-6 space-y-3 text-center rounded-lg bg-secondary/30 animate-in fade-in-0 zoom-in-95 duration-500">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-lg font-semibold text-foreground">Fetching Product Data...</p>
              {scannedBarcode && <p className="text-sm text-muted-foreground">Scanned: {scannedBarcode}</p>}
            </div>
          )}
          
          {/* Product Lookup Failed Alert (after scan, if API call fails or product not found) */}
          {scannedBarcode && !productInfo && !isLoadingProduct && !isScanning && scanError && (
            <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
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
          
          {/* Fallback for scanned but no error and no product (should be rare with current logic) */}
          {scannedBarcode && !productInfo && !isLoadingProduct && !isScanning && !scanError && (
             <Alert className="animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
              <PackageSearch className="h-4 w-4" />
              <AlertTitle>Barcode Scanned</AlertTitle>
              <AlertDescription>
                Scanned: {scannedBarcode}. Preparing to fetch details or an issue occurred. If nothing happens, try scanning again.
              </AlertDescription>
               <Button onClick={handleScanAnother} variant="outline" className="w-full mt-4">
                  <RefreshCcw className="mr-2 h-4 w-4" /> Scan Another Item
                </Button>
            </Alert>
          )}

          {/* Product Info Display */}
          {productInfo && (
            <Card className="mt-4 bg-card shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-5 duration-500">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                     <PackageSearch className="h-7 w-7 text-primary flex-shrink-0" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold leading-tight">{productInfo.name}</CardTitle>
                    <CardDescription className="text-xs">Barcode: {productInfo.id} (Nutritional data per 100g/ml)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <NutritionInfoItem icon={Flame} label="Calories" value={`${productInfo.calories.toFixed(0)} kcal`} color="text-red-500" />
                  <NutritionInfoItem icon={Drumstick} label="Protein" value={`${productInfo.protein.toFixed(1)} g`} color="text-sky-500" />
                  <NutritionInfoItem icon={Droplets} label="Fat" value={`${productInfo.fat.toFixed(1)} g`} color="text-amber-500" />
                  <NutritionInfoItem icon={Wheat} label="Carbs" value={`${productInfo.carbs.toFixed(1)} g`} color="text-emerald-500" />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button onClick={handleAddToLog} disabled={hasLogged} className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white transition-transform hover:scale-105 active:scale-95">
                  <PlusCircle className="mr-2 h-4 w-4" /> {hasLogged ? "Logged" : "Add to Daily Log"}
                </Button>
                 <Button onClick={handleScanAnother} variant="outline" className="w-full sm:flex-1">
                  <RefreshCcw className="mr-2 h-4 w-4" /> Scan Another Item
                </Button>
              </CardFooter>
            </Card>
          )}

           {/* Scan Another Item button after logging */}
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
    
