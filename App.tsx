import React, { useState, useEffect } from 'react';
import { Mode, PatientData } from './types';
import Scanner from './components/Scanner';
import TherapistView from './components/TherapistView';
import PatientView from './components/PatientView';
import { getPatientData, subscribeToAllPatients } from './services/storageService';
import { Activity, Stethoscope, User, Scan, Wifi, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('home');
  const [isScanning, setIsScanning] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Local Cache State
  const [patientCache, setPatientCache] = useState<Record<string, PatientData>>({});
  const [isSynced, setIsSynced] = useState(false);

  // 1. Start Background Download on App Mount
  useEffect(() => {
    // This creates a live connection to the database.
    // Data is downloaded silently while the user is on the home screen.
    const unsubscribe = subscribeToAllPatients((data) => {
        setPatientCache(data);
        setIsSynced(true);
    });

    return () => unsubscribe();
  }, []);

  const startScan = (selectedMode: Mode) => {
    setMode(selectedMode);
    setIsScanning(true);
    setPatientData(null);
    setCurrentPatientId(null);
    setError(null);
  };

  const handleScanSuccess = async (decodedText: string) => {
    // CRITICAL FIX: Trim whitespace/newlines from barcode scanners
    const cleanId = decodedText.trim();

    setIsScanning(false);
    setCurrentPatientId(cleanId);
    setError(null);

    // 2. INSTANT RETRIEVAL STRATEGY
    // Check local cache first (0ms delay)
    if (patientCache[cleanId]) {
        console.log("⚡ Instant load from cache");
        setPatientData(patientCache[cleanId]);
        return; 
    }

    // Fallback: Fetch from server if not in cache
    setLoading(true);
    try {
      const data = await getPatientData(cleanId);
      // Note: data is null if not found. This is handled in renderContent.
      setPatientData(data);
    } catch (err: any) {
      console.error("Error fetching data", err);
      // UX FIX: Set error state instead of annoying alert
      setError("Unable to connect to database. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = (id: string) => {
      handleScanSuccess(id);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-slate-500">Searching Records...</p>
        </div>
      );
    }

    if (isScanning) {
      return (
        <Scanner 
          onScanSuccess={handleScanSuccess} 
          onClose={() => setIsScanning(false)} 
        />
      );
    }

    if (mode === 'therapist' && currentPatientId) {
      return (
        <TherapistView 
          initialPatientId={currentPatientId}
          existingData={patientData}
          onBack={() => {
            setMode('home');
            setCurrentPatientId(null);
          }}
          onSaveComplete={() => {
            setMode('home');
            setCurrentPatientId(null);
          }}
        />
      );
    }

    if (mode === 'patient' && patientData) {
      return (
        <PatientView 
          patient={patientData}
          onBack={() => {
            setMode('home');
            setCurrentPatientId(null);
          }}
        />
      );
    }

    // Error or Not Found State
    if (mode === 'patient' && currentPatientId && !patientData) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-6 text-center bg-slate-50">
                <div className={`p-4 rounded-full mb-4 ${error ? 'bg-red-100' : 'bg-orange-100'}`}>
                    {error ? (
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    ) : (
                        <Activity className="w-8 h-8 text-orange-500" />
                    )}
                </div>
                <h2 className="text-xl font-bold mb-2 text-slate-800">
                    {error ? "Connection Error" : "No Prescription Found"}
                </h2>
                <p className="text-slate-600 mb-6 font-mono bg-slate-200 px-3 py-1 rounded inline-block">
                    {currentPatientId}
                </p>
                {error && (
                    <p className="text-sm text-red-600 mb-6 max-w-xs mx-auto">
                        {error}
                    </p>
                )}
                <div className="space-y-3 w-full max-w-xs">
                    <button 
                        onClick={() => handleScanSuccess(currentPatientId!)}
                        className="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary transition-colors shadow-sm"
                    >
                        Try Again
                    </button>
                    <button 
                        onClick={() => { setMode('home'); setCurrentPatientId(null); }}
                        className="w-full bg-white border border-slate-300 px-6 py-3 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        )
    }

    // Home Screen
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/50 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">
             {isSynced ? (
                <>
                    <Wifi className="w-4 h-4 text-green-600" />
                    <span className="text-[10px] text-green-700 font-medium">Ready</span>
                </>
             ) : (
                <>
                    <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] text-slate-500 font-medium">Syncing...</span>
                </>
             )}
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-md mb-4">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">PhysioTrack</h1>
          <p className="text-slate-500 mt-2">Digital Exercise Prescription System</p>
        </div>

        <div className="grid gap-6 w-full max-w-sm">
          <button
            onClick={() => startScan('therapist')}
            className="group relative flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 transition-all active:scale-95"
          >
            <div className="bg-blue-50 p-3 rounded-full mb-3 group-hover:bg-blue-100 transition-colors">
              <Stethoscope className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Therapist Mode</h3>
            <p className="text-xs text-slate-400 mt-1">Prescribe Exercises</p>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Scan className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          <button
            onClick={() => startScan('patient')}
            className="group relative flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 transition-all active:scale-95"
          >
             <div className="bg-emerald-50 p-3 rounded-full mb-3 group-hover:bg-emerald-100 transition-colors">
              <User className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Assistant / Patient Mode</h3>
            <p className="text-xs text-slate-400 mt-1">View Prescription</p>
             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Scan className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        </div>

        <div className="mt-12 text-center">
            <p className="text-xs text-gray-400 mb-2">Test IDs (Tap to sim scan):</p>
            <div className="flex flex-wrap gap-2 justify-center">
                <button 
                  onClick={() => handleManualEntry('PHYA1234567A')}
                  className="text-xs bg-slate-200 px-3 py-1.5 rounded-full text-slate-600 hover:bg-slate-300 font-mono transition-colors"
                >
                    PHYA1234567A
                </button>
                 <button 
                  onClick={() => handleManualEntry('PHYA-25-20453(B)')}
                  className="text-xs bg-slate-200 px-3 py-1.5 rounded-full text-slate-600 hover:bg-slate-300 font-mono transition-colors border border-slate-300"
                >
                    PHYA-25-20453(B)
                </button>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-white shadow-2xl overflow-hidden relative">
        {renderContent()}
    </div>
  );
};

export default App;