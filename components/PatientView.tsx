import React from 'react';
import { PatientData, ExerciseCategory, PrescribedExercise } from '../types';
import { User, Calendar, Activity, Clock } from 'lucide-react';
import { EXERCISE_DB } from '../data/exercises';

interface PatientViewProps {
  patient: PatientData;
  onBack: () => void;
}

const PatientView: React.FC<PatientViewProps> = ({ patient, onBack }) => {
  
  // Group prescribed exercises by category
  const groupedExercises = patient.exercises.reduce((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = [];
    acc[ex.category].push(ex);
    return acc;
  }, {} as Record<ExerciseCategory, PrescribedExercise[]>);

  // Helper to format exercise details
  const renderDetails = (ex: PrescribedExercise) => {
    // Find the definition to get field labels if needed, or just iterate keys
    // We filter out empty values
    const details = Object.entries(ex.data)
      .filter(([_, value]) => value && value !== 'false')
      .map(([key, value]) => {
        // Try to find a friendly label from DB
        const dbEx = EXERCISE_DB.find(e => e.id === ex.exerciseId);
        const field = dbEx?.fields.find(f => f.key === key);
        const label = field?.label || key;
        
        if (value === true) return null; // Just a checkbox
        return (
          <span key={key} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-1">
            {label}: {value}
          </span>
        );
      });
      
      return details;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header Card */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex justify-between items-start mb-4">
           <div>
              <h1 className="text-2xl font-bold text-slate-800">{patient.name}</h1>
              <p className="text-sm text-slate-500 font-mono">{patient.id}</p>
           </div>
           <button onClick={onBack} className="text-sm text-blue-600 font-medium">
             Exit
           </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
           <div className="flex items-center gap-2">
             <User className="w-4 h-4 text-slate-400" />
             <span>Physio: {patient.therapistName}</span>
           </div>
           <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" />
              <span>Class: {patient.class || 'N/A'}</span>
           </div>
           <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Date: {new Date(patient.lastUpdated).toLocaleDateString()}</span>
           </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {patient.exercises.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No exercises prescribed yet.</p>
          </div>
        ) : (
          (Object.entries(groupedExercises) as [string, PrescribedExercise[]][]).map(([category, exercises]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-bold text-slate-700 border-l-4 border-primary pl-3 sticky top-0">
                {category}
              </h3>
              {exercises.map((ex, idx) => (
                <div key={`${ex.exerciseId}-${idx}`} className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-lg text-slate-800 mb-2">{ex.name}</h4>
                    {ex.category === ExerciseCategory.AEROBIC && (
                        <Clock className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex flex-wrap">
                    {renderDetails(ex)}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      
      {/* Footer Instructions */}
      <div className="bg-yellow-50 p-4 text-xs text-yellow-800 border-t border-yellow-200">
        <p className="font-semibold">Assistant Note:</p>
        Please ensure the patient maintains correct form. Check heart rate if required.
      </div>
    </div>
  );
};

export default PatientView;