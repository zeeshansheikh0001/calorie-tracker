
"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScanLine, PackageSearch, PlusCircle, CheckCircle, AlertCircle, Loader2, RefreshCcw } from "lucide-react";
import { useDailyLog } from "@/hooks/use-daily-log";
import { useToast } from "@/hooks/use-toast";
import type { FoodEntry } from "@/types";

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
    if (isScanning && !scannerRef.current) {
      setScanError(null); // Clear previous errors
      setProductInfo(null);
      setScannedBarcode(null);
      setHasLogged(false);

      const verbose = false; // Set to true for more detailed logs from the library
      const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
        const minEdgePercentage = 0.7; // 70%
        const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
        const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
        return {
          width: qrboxSize,
          height: qrboxSize,
        };
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

      const onScanSuccess = (decodedText: string, decodedResult: any) => {
        console.log(`Scan successful: ${decodedText}`, decodedResult);
        setIsScanning(false); // Stop continuous scanning on success
        setScannedBarcode(decodedText);
        setIsLoadingProduct(true);

        // Simulate API call to fetch product info
        setTimeout(() => {
          // In a real app, you would fetch from an API like Open Food Facts
          const mockProduct: ScannedProductInfo = {
            id: decodedText,
            name: `Product for ${decodedText}`,
            calories: Math.floor(Math.random() * 300) + 100, // 100-399
            protein: Math.floor(Math.random() * 20) + 5,   // 5-24
            fat: Math.floor(Math.random() * 15) + 5,       // 5-19
            carbs: Math.floor(Math.random() * 40) + 10,    // 10-49
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
        // This callback is called frequently, so only log/set error if it's significant
        // or if you want to display feedback for "no barcode found" type messages.
        // For now, we'll mostly ignore to avoid flooding UI/console.
        // console.warn(`Scan Failure: ${error}`);
        // setScanError("No barcode detected or error during scan. Try repositioning.");
      };
      
      html5QrcodeScanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = html5QrcodeScanner;

    } else if (!isScanning && scannerRef.current) {
      scannerRef.current.clear().then(() => {
        scannerRef.current = null;
        console.log("QR Code scanner cleared.");
      }).catch(error => {
        console.error("Failed to clear html5QrcodeScanner: ", error);
        setScanError("Error stopping scanner. Please refresh the page if issues persist.");
      });
    }

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner on unmount: ", error);
        });
        scannerRef.current = null;
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
      setProductInfo(null); // Clear product info after logging
      setScannedBarcode(null);
    }
  };

  const handleStartScan = () => {
    setIsScanning(true);
    setScanError(null);
    setProductInfo(null);
    setScannedBarcode(null);
    setHasLogged(false);
  };
  
  const handleScanAnother = () => {
    setProductInfo(null);
    setScannedBarcode(null);
    setHasLogged(false);
    setIsScanning(true); // This will trigger the useEffect to re-render the scanner
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
          <div id={qrcodeRegionId} className={cn("w-full aspect-video bg-muted rounded-md border border-dashed", {"min-h-[300px]": !isScanning && !productInfo && !scannedBarcode})}/>

          {scanError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Scan Error</AlertTitle>
              <AlertDescription>{scanError}</AlertDescription>
            </Alert>
          )}

          {!isScanning && !productInfo && !isLoadingProduct && (
             <Button onClick={handleStartScan} size="lg" className="w-full">
              <ScanLine className="mr-2 h-5 w-5" /> Start Scanning
            </Button>
          )}
          
          {isScanning && (
             <Button onClick={() => setIsScanning(false)} variant="outline" className="w-full">
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
           {hasLogged && !isScanning && (
             <Button onClick={handleScanAnother} size="lg" className="w-full mt-4">
                <RefreshCcw className="mr-2 h-5 w-5" /> Scan Another Item
            </Button>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
