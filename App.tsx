import React, { useState } from 'react';
import { Mode, PatientData } from './types';
import Scanner from './components/Scanner';
import TherapistView from './components/TherapistView';
import PatientView from './components/PatientView';
import { getPatientData } from './services/storageService';
import { Activity, Stethoscope, User, Scan } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('home');
  const [isScanning, setIsScanning] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(false);

  const startScan = (selectedMode: Mode) => {
    setMode(selectedMode);
    setIsScanning(true);
    setPatientData(null);
    setCurrentPatientId(null);
  };

  const handleScanSuccess = async (decodedText: string) => {
    setIsScanning(false);
    setLoading(true);
    setCurrentPatientId(decodedText);

    try {
      const data = await getPatientData(decodedText);
      setPatientData(data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = (id: string) => {
      // For testing without camera
      handleScanSuccess(id);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-slate-500">Loading Patient Records...</p>
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
            alert("Prescription Saved Successfully!");
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

    if (mode === 'patient' && currentPatientId && !patientData) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                    <Activity className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">No Prescription Found</h2>
                <p className="text-gray-600 mb-6">Patient ID: {currentPatientId}</p>
                <button 
                  onClick={() => { setMode('home'); setCurrentPatientId(null); }}
                  className="bg-gray-200 px-6 py-2 rounded-lg"
                >
                    Back to Home
                </button>
            </div>
        )
    }

    // Home Screen
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
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
            <p className="text-xs text-gray-400 mb-2">No barcode? Test with:</p>
            <div className="flex gap-2 justify-center">
                <button 
                  onClick={() => handleManualEntry('PHYA1234567A')}
                  className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600 hover:bg-gray-300"
                >
                    PHYA1234567A
                </button>
                 <button 
                  onClick={() => handleManualEntry('PHYA9999999X')}
                  className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600 hover:bg-gray-300"
                >
                    PHYA9999999X
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
