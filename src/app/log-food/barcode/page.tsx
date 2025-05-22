
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
        setIsScanning(false); // Stop the attempt
        return;
      }

      // If scannerRef.current holds an instance, it's stale or failed to cleanup.
      // Attempt to clear it before creating a new one.
      if (scannerRef.current) {
        console.warn("Barcode Scanner: useEffect - scannerRef.current was not null. Attempting to clear stale instance.");
        const staleScanner = scannerRef.current;
        scannerRef.current = null; // Nullify the ref immediately
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

      const onScanSuccess = (decodedText: string, result: Html5QrcodeResult) => {
        console.log(`Barcode Scanner: Scan successful - ${decodedText}`, result);
        setIsScanning(false); // This triggers cleanup of localScannerInstance

        setScannedBarcode(decodedText);
        setIsLoadingProduct(true);

        setTimeout(() => {
          const mockProduct: ScannedProductInfo = {
            id: decodedText,
            name: `Product for ${decodedText}`,
            calories: Math.floor(Math.random() * 300) + 100,
            protein: Math.floor(Math.random() * 20) + 5,
            fat: Math.floor(Math.random() * 15) + 5,
            carbs: Math.floor(Math.random() * 40) + 10,
          };
          setProductInfo(mockProduct);
          setIsLoadingProduct(false);
          toast({
            title: "Product Found (Mock)",
            description: `Details for ${mockProduct.name} loaded.`,
            action: <PackageSearch className="text-green-500" />
          });
        }, 1500);
      };

      const onScanFailure = (error: string) => {
        // console.warn(`Barcode Scanner: Scan Failure - ${error}`); // Can be very noisy
      };
      
      console.log("Barcode Scanner: Calling localScannerInstance.render().");
      localScannerInstance.render(onScanSuccess, onScanFailure)
        .then(() => {
          console.log("Barcode Scanner: localScannerInstance.render() resolved (camera likely started).");
          if (isScanning && localScannerInstance) { // Check if still in scanning mode
            scannerRef.current = localScannerInstance; // Assign the locally created instance to the ref
          } else if (localScannerInstance) {
            // isScanning became false while render was in progress. Clean up this orphaned scanner.
            console.log("Barcode Scanner: isScanning became false during render. Clearing orphaned scanner.");
            try {
                if (localScannerInstance.getState() === Html5QrcodeScannerState.SCANNING || localScannerInstance.getState() === Html5QrcodeScannerState.PAUSED) {
                   localScannerInstance.clear().catch(e => console.error("Error clearing orphaned scanner:", e));
                }
            } catch(e) {
                 console.error("Exception clearing orphaned scanner:", e);
            }
          }
        })
        .catch(renderError => {
          console.error("Barcode Scanner: localScannerInstance.render() failed.", renderError);
          const errorMessage = (renderError instanceof Error) ? renderError.message : String(renderError);
          setScanError(`Failed to start camera: ${errorMessage}. Check permissions or ensure no other app/tab is using the camera.`);
          setIsScanning(false); // Triggers cleanup and stops scanning state
        });
    }

    return () => {
      console.log("Barcode Scanner: useEffect cleanup function running.");
      // Prefer to clear the instance created in this effect's scope, if it exists.
      // Otherwise, try to clear what's in scannerRef.current.
      const scannerToAttemptClear = localScannerInstance || scannerRef.current;

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
      
      // Ensure ref is nulled if it was pointing to the scanner we are cleaning up
      if (scannerRef.current === scannerToAttemptClear) {
        scannerRef.current = null;
      }
      // If localScannerInstance was created but not assigned to ref (e.g. render failed or isScanning changed)
      // and it's different from what was in ref, it should also be considered for cleanup if it started.
      // The current logic for scannerToAttemptClear should cover this.
    };
  }, [isScanning, toast]);

  const handleStartScan = () => {
    console.log("Barcode Scanner: handleStartScan called.");
    setProductInfo(null);
    setScannedBarcode(null);
    setScanError(null);
    setHasLogged(false);

    if (isScanning) {
      // If already scanning (e.g. "Scan Another Item" from a state where scanner might be up)
      // Force a re-initialization by toggling isScanning
      console.log("Barcode Scanner: handleStartScan - Already scanning, forcing re-initialization.");
      setIsScanning(false); // This will trigger cleanup
      setTimeout(() => {
        setIsScanning(true); // This will trigger initialization
      }, 50); // A small delay to allow cleanup to process
    } else {
      setIsScanning(true);
    }
  };
  
  const handleCancelScan = () => {
    console.log("Barcode Scanner: handleCancelScan called.");
    setIsScanning(false); // Triggers cleanup via useEffect
  }

  const handleScanAnother = () => {
    console.log("Barcode Scanner: handleScanAnother called.");
    handleStartScan(); // Reuses the logic to ensure a clean start
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
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-lg mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <ScanLine className="mr-2 h-6 w-6 text-primary" />
            Scan Barcode
          </CardTitle>
          <CardDescription>
            Use your device's camera to scan a product barcode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div 
            id={qrcodeRegionId} 
            className={cn(
              "w-full aspect-video bg-muted rounded-md border border-dashed", 
              { "min-h-[300px]": isScanning || (!isScanning && !productInfo && !scannedBarcode && !scanError) }
            )}
          />

          {scanError && (
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
              <p className="ml-3 text-foreground">Looking up product (mock)...</p>
            </div>
          )}

          {scannedBarcode && !productInfo && !isLoadingProduct && !isScanning && !scanError && (
            <Alert>
              <PackageSearch className="h-4 w-4" />
              <AlertTitle>Barcode Scanned!</AlertTitle>
              <AlertDescription>
                Scanned: {scannedBarcode}. No product information was found for this mock scan (or an error occurred fetching it).
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
                <CardDescription>Scanned Barcode: {productInfo.id}</CardDescription>
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
    

    