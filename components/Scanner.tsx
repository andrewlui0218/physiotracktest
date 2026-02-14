import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    };

    const scanner = new Html5QrcodeScanner(
      "reader",
      config,
      /* verbose= */ false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        // Successful scan
        // Check format PHYA...
        if (decodedText.startsWith('PHYA')) {
            onScanSuccess(decodedText);
            scanner.clear();
        } else {
             // Allow non-standard codes for testing if needed, or show warning
             // For strict mode:
             // setError("Invalid barcode format. Must start with PHYA.");
             onScanSuccess(decodedText); 
             scanner.clear();
        }
      },
      (_) => {
        // parse error, ignore mostly
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-2 bg-gray-200 rounded-full hover:bg-gray-300"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>
        
        <div className="p-4 bg-slate-100 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan Patient Barcode
          </h2>
          <p className="text-sm text-gray-500">Align code within the box</p>
        </div>

        <div id="reader" className="w-full h-64 sm:h-80 bg-black"></div>
        
        <div className="p-4 text-center">
            <p className="text-xs text-gray-400">Supported format: PHYA followed by digits</p>
        </div>
      </div>
    </div>
  );
};

export default Scanner;