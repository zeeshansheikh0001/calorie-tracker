
"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType, type Html5QrcodeResult } from "html5-qrcode";
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
    // If not scanning, this effect instance does nothing beyond its cleanup (if any was scheduled from previous state).
    if (!isScanning) {
      return;
    }

    // --- We are in isScanning === true block ---
    console.log("Barcode Scanner: useEffect - isScanning is true. Attempting to initialize.");
    
    // Reset states for a new scan session (moved here from handleStartScan for consistency)
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
    
    // If scannerRef.current is not null here, it means the cleanup from the previous
    // effect instance (when isScanning became false or component unmounted)
    // may not have completed or correctly nulled the ref.
    // This is a defensive check; ideally, the ref should be null.
    if (scannerRef.current) {
        console.warn("Barcode Scanner: scannerRef.current was not null at the start of scanning effect. This might indicate a pending cleanup or an issue. Aborting current init to let cleanup proceed.");
        // Force a cycle to allow previous cleanup to complete by setting isScanning false.
        // This is aggressive and might cause a flicker if this state happens often.
        // setIsScanning(false); 
        return; 
    }


    const verbose = false; // Set to true for more library logs
    const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
      const minEdgePercentage = 0.7;
      const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
      const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
      return { width: qrboxSize, height: qrboxSize };
    };

    const html5QrcodeScanner = new Html5QrcodeScanner(
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
      // Setting isScanning to false is crucial. It will trigger the cleanup function
      // of THIS useEffect instance, which will clear the scanner that just succeeded.
      setIsScanning(false); 
      
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
    
    scannerRef.current = html5QrcodeScanner; // Store the instance

    console.log("Barcode Scanner: Calling html5QrcodeScanner.render().");
    html5QrcodeScanner.render(onScanSuccess, onScanFailure)
      .then(() => {
        console.log("Barcode Scanner: html5QrcodeScanner.render() resolved (camera likely started).");
      })
      .catch(renderError => {
        console.error("Barcode Scanner: html5QrcodeScanner.render() failed.", renderError);
        const errorMessage = (renderError instanceof Error) ? renderError.message : String(renderError);
        setScanError(`Failed to start camera: ${errorMessage}. Check permissions or ensure no other app/tab is using the camera.`);
        
        // If render fails, ensure this specific instance is cleaned up from the ref
        if (scannerRef.current === html5QrcodeScanner) {
            scannerRef.current = null;
        }
        setIsScanning(false); // Triggers cleanup and stops scanning state
      });

    // Cleanup function for THIS specific useEffect instance
    return () => {
      console.log("Barcode Scanner: useEffect cleanup function running.");
      // `html5QrcodeScanner` is the instance created in this effect's closure.
      // `scannerRef.current` might point to this instance, or null, or even a newer one
      // if `isScanning` toggled very rapidly.
      // The goal is to clear the scanner instance that *this effect instance* was responsible for.
      
      const scannerToClearFromRef = scannerRef.current;

      if (scannerToClearFromRef === html5QrcodeScanner) {
        // The ref still holds the scanner this effect created. This is the typical path for cleanup.
        console.log("Barcode Scanner: Cleanup - Clearing scanner instance this effect created (still in ref).", scannerToClearFromRef);
        scannerRef.current = null; // Nullify ref *before* async clear.
        scannerToClearFromRef.clear()
          .then(() => console.log("Barcode Scanner: Cleanup - Scanner (from ref) cleared successfully."))
          .catch(err => console.error("Barcode Scanner: Cleanup - Error clearing scanner (from ref):", err));
      } else if (scannerToClearFromRef) {
        // The ref holds a *different* scanner. This means another effect instance already put its scanner there.
        // The current `html5QrcodeScanner` (from this closure) is now orphaned if it wasn't cleared by its own onScanSuccess/render.catch.
        // This scenario is less common with the current logic but worth noting.
        // For safety, we might still try to clear the `html5QrcodeScanner` from this closure if it wasn't the one in the ref.
        // However, direct clearing of `html5QrcodeScanner` (local var) might be problematic if it was never successfully rendered.
        // The primary responsibility is to manage `scannerRef.current`.
        console.warn("Barcode Scanner: Cleanup - scannerRef.current pointed to a different instance. The current effect's scanner might be orphaned if not cleared by its own success/failure path.");
      } else {
         // scannerRef.current is already null. This means the scanner from this effect was likely cleared by 
         // its onScanSuccess setting isScanning=false, or its render().catch(), or a new scan attempt already nulled the ref.
         console.log("Barcode Scanner: Cleanup - scannerRef.current is already null.");
      }
    };
  }, [isScanning, toast]);

  const handleStartScan = () => {
    console.log("Barcode Scanner: handleStartScan called.");
    // Reset states (some are also reset inside useEffect when isScanning becomes true)
    setProductInfo(null);
    setScannedBarcode(null);
    setScanError(null);
    setHasLogged(false);

    if (scannerRef.current) {
      console.log("Barcode Scanner: handleStartScan - An existing scanner instance is in scannerRef.current. Attempting to force stop before restarting.");
      // Temporarily set isScanning to false to trigger the cleanup of the existing scanner.
      setIsScanning(false);
      // Use a timeout to allow the cleanup process (which is async) a moment to act
      // before setting isScanning to true to start a new scan.
      setTimeout(() => {
        console.log("Barcode Scanner: handleStartScan - Timeout finished, setting isScanning to true for new scan.");
        setIsScanning(true);
      }, 100); // A small delay, adjust if needed
    } else {
      console.log("Barcode Scanner: handleStartScan - No existing scanner in ref. Setting isScanning to true.");
      setIsScanning(true);
    }
  };
  
  const handleCancelScan = () => {
    console.log("Barcode Scanner: handleCancelScan called.");
    setIsScanning(false); 
  }

  const handleScanAnother = () => {
    console.log("Barcode Scanner: handleScanAnother called.");
    // This will effectively restart the scanning process by reusing handleStartScan logic.
    handleStartScan();
  }

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
              // Ensure there's always a minimum height for the scanner area when it's supposed to be active or empty.
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

          {scannedBarcode && !productInfo && !isLoadingProduct && !isScanning && (
            <Alert>
              <PackageSearch className="h-4 w-4" />
              <AlertTitle>Barcode Scanned!</AlertTitle>
              <AlertDescription>
                Scanned: {scannedBarcode}. No product information was found for this mock scan (or an error occurred).
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

    