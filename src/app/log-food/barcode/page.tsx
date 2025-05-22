
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

// The ID for the div that will contain the QR code scanner.
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
    if (isScanning) {
      if (!scannerRef.current) {
        console.log("Barcode Scanner: Initializing new scanner instance.");
        setScanError(null);
        setProductInfo(null);
        setScannedBarcode(null);
        setHasLogged(false);

        const verbose = false;
        const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdgePercentage = 0.7;
          const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
          return {
            width: qrboxSize,
            height: qrboxSize,
          };
        };

        const localScanner = new Html5QrcodeScanner(
          qrcodeRegionId,
          {
            fps: 10,
            qrbox: qrboxFunction,
            rememberLastUsedCamera: true,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          },
          verbose
        );

        const onScanSuccess = (decodedText: string, decodedResult: Html5QrcodeResult) => {
          console.log(`Barcode Scanner: Scan successful - ${decodedText}`, decodedResult);
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
          // console.warn(`Barcode Scanner: Scan Failure - ${error}`);
        };
        
        scannerRef.current = localScanner; // Assign to ref

        localScanner.render(onScanSuccess, onScanFailure)
          .then(() => {
            console.log("Barcode Scanner: Rendered successfully.");
          })
          .catch(renderError => {
            console.error("Barcode Scanner: Failed to render.", renderError);
            setScanError("Failed to initialize camera/scanner. Check permissions or device compatibility.");
            setIsScanning(false); // Stop trying to scan if render fails
            if (scannerRef.current === localScanner) { // Ensure we only nullify if it's this instance
              scannerRef.current = null;
            }
          });
      }
    }

    // Cleanup function:
    // Runs when isScanning becomes false, or when the component unmounts.
    return () => {
      if (scannerRef.current) {
        const scannerToClear = scannerRef.current;
        scannerRef.current = null; // Nullify the ref immediately

        console.log("Barcode Scanner: Attempting to clear scanner instance:", scannerToClear);
        scannerToClear.clear()
          .then(() => {
            console.log("Barcode Scanner: Instance cleared successfully.");
          })
          .catch(error => {
            console.error("Barcode Scanner: Failed to clear instance.", error);
            // setScanError("Error stopping scanner. Refresh if issues persist.");
          });
      }
    };
  }, [isScanning, toast]);

  const handleAddToLog = () => {
    if (productInfo) {
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
      setScannedBarcode(null);
    }
  };

  const handleStartScan = () => {
    // If there's an old scanner instance in the ref somehow, ensure it's cleared before trying to start a new one.
    // The useEffect cleanup should handle this, but this is an extra safeguard.
    if (scannerRef.current && !isScanning) { 
        scannerRef.current.clear().catch(e => console.error("Error clearing scanner on start:", e));
        scannerRef.current = null;
    }
    setIsScanning(true);
    // States are reset inside useEffect when new scanner is initialized
  };
  
  const handleCancelScan = () => {
    setIsScanning(false); // This will trigger the cleanup in useEffect
  }

  const handleScanAnother = () => {
    setProductInfo(null);
    setScannedBarcode(null);
    setHasLogged(false);
    // setIsScanning(true) will re-trigger the useEffect to initialize the scanner
    // if scannerRef.current is null (which it should be after cleanup).
    setIsScanning(true); 
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
          <div id={qrcodeRegionId} className={cn("w-full aspect-video bg-muted rounded-md border border-dashed", {"min-h-[300px]": !isScanning && !productInfo && !scannedBarcode && !scanError})}/>

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
                Scanned: {scannedBarcode}. No product information was found for this mock scan.
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
           {hasLogged && !isScanning && !productInfo && ( // Only show if product info is cleared
             <Button onClick={handleScanAnother} size="lg" className="w-full mt-4">
                <RefreshCcw className="mr-2 h-5 w-5" /> Scan Another Item
            </Button>
          )}

        </CardContent>
      </Card>
    </div>
  );
}

