import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, Zap } from 'lucide-react';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanSuccess, onClose }) => {
  const [initError, setInitError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    const elementId = "reader";
    
    // Cleanup previous instance if it exists (safety check)
    if (scannerRef.current) {
        scannerRef.current.clear();
    }

    const startScanner = async () => {
      try {
        // Optimize for 1D barcodes (like the one in the photo)
        // Restricting formats improves performance
        const formatsToSupport = [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.QR_CODE // Keep QR just in case
        ];

        const html5QrCode = new Html5Qrcode(elementId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 30, // High FPS for instant scanning (1s load goal)
          qrbox: { width: 300, height: 100 }, // Rectangular box better for the long barcodes in the photo
          aspectRatio: 1.0,
          formatsToSupport: formatsToSupport,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        };

        // Force back camera ("environment")
        await html5QrCode.start(
          { facingMode: "environment" }, 
          config,
          (decodedText) => {
            // Success Callback
            if (mountedRef.current) {
                // Determine if it matches expected pattern (PHYA...)
                // We perform a loose check to ensure responsiveness
                if (decodedText && decodedText.length > 5) {
                    // Play a beep or vibration here if requested in future
                    onScanSuccess(decodedText);
                    
                    // Stop scanning immediately to prevent duplicate reads
                    if (scannerRef.current?.isScanning) {
                        scannerRef.current.pause();
                    }
                }
            }
          },
          (_) => {
            // Ignore scan failures (happens every frame nothing is detected)
          }
        );
      } catch (err) {
        if (mountedRef.current) {
          console.error("Error starting scanner", err);
          setInitError("Could not access camera. Please ensure permissions are granted.");
        }
      }
    };

    // Small timeout to ensure DOM is ready
    const timer = setTimeout(() => {
        startScanner();
    }, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
            scannerRef.current?.clear();
        }).catch(err => console.error("Failed to stop scanner", err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col items-center justify-center">
      <div className="w-full max-w-md relative flex flex-col items-center">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Header */}
        <div className="text-white mb-6 text-center z-10">
            <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                <Camera className="w-6 h-6" />
                Scan Patient ID
            </h2>
            <p className="text-sm text-gray-400 mt-1">Point camera at the barcode slip</p>
        </div>

        {/* Scanner Container */}
        <div className="relative w-full overflow-hidden bg-black rounded-xl border border-gray-800 shadow-2xl">
            {initError ? (
                <div className="flex flex-col items-center justify-center h-80 text-center p-6 text-red-400">
                    <Zap className="w-10 h-10 mb-2 opacity-50" />
                    <p>{initError}</p>
                </div>
            ) : (
                <>
                    <div id="reader" className="w-full h-[400px]"></div>
                    
                    {/* Custom Overlay for Rectangular Barcode */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        {/* The Guide Box */}
                        <div className="w-[300px] h-[100px] border-2 border-primary/70 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] relative">
                             {/* Corner accents */}
                             <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary -mt-1 -ml-1"></div>
                             <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary -mt-1 -mr-1"></div>
                             <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary -mb-1 -ml-1"></div>
                             <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary -mb-1 -mr-1"></div>
                             
                             {/* Scanning Line Animation */}
                             <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(255,0,0,0.8)] animate-[scan_2s_infinite]"></div>
                        </div>
                    </div>
                </>
            )}
        </div>
        
        <div className="mt-8 px-6 py-2 bg-gray-900/50 rounded-full border border-gray-700 backdrop-blur-sm">
            <p className="text-xs text-gray-300 font-mono tracking-wider">
                AUTO-DETECTING BACK CAMERA
            </p>
        </div>
        
        {/* Add custom CSS for scanning animation */}
        <style>{`
          @keyframes scan {
            0% { top: 10%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 90%; opacity: 0; }
          }
          #reader video {
            object-fit: cover;
            width: 100% !important;
            height: 100% !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Scanner;