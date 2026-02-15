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
    
    // Cleanup previous instance if it exists
    if (scannerRef.current) {
        try {
            if (scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(() => {});
            }
            scannerRef.current.clear();
        } catch (e) {
            // ignore cleanup errors
        }
    }

    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode(elementId);
        scannerRef.current = html5QrCode;

        // Optimization:
        // 1. No qrbox in 'start' method = Full screen scanning (More sensitive)
        // 2. High resolution constraints = Sharper image for barcode lines
        const config = {
          fps: 30, 
          aspectRatio: 1.0,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.QR_CODE
          ],
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          },
          videoConstraints: {
            width: { min: 1280, ideal: 1920 },
            height: { min: 720, ideal: 1080 },
            facingMode: "environment"
          }
        };

        // The first argument to start() must be strictly the camera selector
        // It cannot contain other constraints like width/height
        const cameraIdOrConfig = { facingMode: "environment" };

        await html5QrCode.start(
          cameraIdOrConfig, 
          config,
          (decodedText) => {
            if (mountedRef.current) {
                // Check if text looks valid (length check)
                if (decodedText && decodedText.length > 3) {
                   // Pause scanning immediately to prevent duplicate reads
                   if (scannerRef.current?.isScanning) {
                       scannerRef.current.pause();
                   }
                   onScanSuccess(decodedText);
                }
            }
          },
          (_) => {
            // Ignore frame failures
          }
        );
      } catch (err) {
        if (mountedRef.current) {
          console.error("Error starting scanner", err);
          setInitError("Camera access failed. Please allow camera permissions.");
        }
      }
    };

    // Immediate start
    startScanner();

    return () => {
      mountedRef.current = false;
      if (scannerRef.current) {
        try {
            if (scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(() => {});
            }
            scannerRef.current.clear();
        } catch (e) {
            console.error("Cleanup error", e);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="w-full h-full relative flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        
        {/* Header Overlay */}
        <div className="absolute top-10 left-0 right-0 z-10 flex flex-col items-center pointer-events-none">
             <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full flex items-center gap-2 border border-white/10">
                <Camera className="w-5 h-5 text-primary" />
                <span className="text-white font-medium">Scan Barcode</span>
             </div>
        </div>

        {/* Scanner Container */}
        <div className="flex-1 bg-black relative overflow-hidden">
            {initError ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-red-400">
                    <Zap className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg">{initError}</p>
                </div>
            ) : (
                <>
                    {/* The video element container */}
                    <div id="reader" className="w-full h-full object-cover"></div>
                    
                    {/* Visual Guide Overlay (Does not restrict scanning area now) */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-[85%] h-[120px] max-w-sm border-2 border-primary/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] relative">
                             {/* Animated Laser Line */}
                             <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500/80 shadow-[0_0_15px_rgba(255,0,0,0.8)] animate-[scan_2s_infinite]"></div>
                             
                             {/* Corners */}
                             <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary -mt-1 -ml-1"></div>
                             <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary -mt-1 -mr-1"></div>
                             <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary -mb-1 -ml-1"></div>
                             <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary -mb-1 -mr-1"></div>
                        </div>
                    </div>
                </>
            )}
        </div>
        
        {/* Footer Overlay */}
        <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none">
            <p className="text-white/70 text-sm bg-black/30 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
                Align barcode within the frame
            </p>
        </div>

        <style>{`
          @keyframes scan {
            0% { top: 5%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 95%; opacity: 0; }
          }
          /* Force video to fill screen */
          #reader video {
            object-fit: cover !important;
            width: 100% !important;
            height: 100% !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Scanner;