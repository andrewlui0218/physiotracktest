import React, { useState, useEffect } from 'react';
import { EXERCISE_DB } from '../data/exercises';
import { PatientData, ExerciseCategory, PrescribedExercise } from '../types';
import { savePatientData } from '../services/storageService';
import { Save, Plus, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import clsx from 'clsx';

interface TherapistViewProps {
  initialPatientId: string;
  existingData: PatientData | null;
  onBack: () => void;
  onSaveComplete: () => void;
}

const TherapistView: React.FC<TherapistViewProps> = ({ initialPatientId, existingData, onBack, onSaveComplete }) => {
  // Form State
  const [patientId] = useState(initialPatientId);
  const [patientName, setPatientName] = useState(existingData?.name || '');
  const [therapistName, setTherapistName] = useState(existingData?.therapistName || '');
  const [patientClass, setPatientClass] = useState(existingData?.class || '');
  const [hr, setHr] = useState(existingData?.hr || '');
  
  // Selection State: Map of exerciseId -> Data Object (or undefined if not selected)
  // We use a Map to handle multiple instances of free text, but for standard exercises, simpler keying works.
  // For the standard list, we assume one entry per ID for simplicity in this demo, 
  // though the data model supports arrays.
  const [selections, setSelections] = useState<Record<string, Record<string, any>>>({});
  
  // Free Text State
  const [freeTextRows, setFreeTextRows] = useState<{id: string, text: string}[]>([]);

  // Category Accordion State
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    [ExerciseCategory.ELECTROTHERAPY]: true,
    [ExerciseCategory.AEROBIC]: true,
  });

  useEffect(() => {
    // Populate form if data exists
    if (existingData) {
      const newSelections: Record<string, any> = {};
      const newFreeText: {id: string, text: string}[] = [];
      
      existingData.exercises.forEach(ex => {
        if (ex.category === ExerciseCategory.FREE_TEXT) {
           newFreeText.push({ id: ex.exerciseId, text: ex.name });
        } else {
           newSelections[ex.exerciseId] = ex.data;
        }
      });
      
      setSelections(newSelections);
      setFreeTextRows(newFreeText.length > 0 ? newFreeText : [{id: Date.now().toString(), text: ''}]);
    } else {
        // Init one free text row
        setFreeTextRows([{id: Date.now().toString(), text: ''}]);
    }
  }, [existingData]);

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({...prev, [cat]: !prev[cat]}));
  };

  const handleSelectionChange = (exId: string, isChecked: boolean) => {
    setSelections(prev => {
      const next = { ...prev };
      if (isChecked) {
        next[exId] = {}; // Initialize empty data
      } else {
        delete next[exId];
      }
      return next;
    });
  };

  const handleInputChange = (exId: string, fieldKey: string, value: string) => {
    setSelections(prev => ({
      ...prev,
      [exId]: {
        ...prev[exId],
        [fieldKey]: value
      }
    }));
  };

  const addFreeTextRow = () => {
    setFreeTextRows(prev => [...prev, { id: Date.now().toString(), text: '' }]);
  };

  const handleFreeTextChange = (id: string, text: string) => {
    setFreeTextRows(prev => prev.map(row => row.id === id ? { ...row, text } : row));
  };

  const handleSave = async () => {
    if (!patientName || !therapistName) {
      alert("Please enter Patient Name and Therapist Name");
      return;
    }

    const exercisesToSave: PrescribedExercise[] = [];

    // Process standard exercises
    Object.entries(selections).forEach(([exId, data]) => {
      const def = EXERCISE_DB.find(e => e.id === exId);
      if (def) {
        exercisesToSave.push({
          exerciseId: exId,
          name: def.name,
          category: def.category,
          data: data,
          timestamp: Date.now()
        });
      }
    });

    // Process free text
    freeTextRows.forEach(row => {
      if (row.text.trim()) {
        exercisesToSave.push({
          exerciseId: row.id,
          name: row.text,
          category: ExerciseCategory.FREE_TEXT,
          data: {},
          timestamp: Date.now()
        });
      }
    });

    const payload: PatientData = {
      id: patientId,
      name: patientName,
      therapistName,
      class: patientClass,
      hr,
      exercises: exercisesToSave,
      lastUpdated: Date.now()
    };

    await savePatientData(payload);
    onSaveComplete();
  };

  // Group DB by category
  const categories = Object.values(ExerciseCategory).filter(c => c !== ExerciseCategory.FREE_TEXT);

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm border-b sticky top-0 z-20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg text-primary">Rx Prescription</h2>
          <button onClick={onBack} className="text-sm text-gray-500">Cancel</button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
           <div className="col-span-2">
             <label className="block text-xs font-medium text-gray-500">Patient Name</label>
             <input 
               type="text" 
               className="w-full border-b border-gray-300 focus:border-primary outline-none py-1"
               value={patientName}
               onChange={e => setPatientName(e.target.value)}
               placeholder="Enter name"
             />
           </div>
           <div>
             <label className="block text-xs font-medium text-gray-500">File No.</label>
             <div className="font-mono text-sm py-1 bg-gray-100 px-2 rounded">{patientId}</div>
           </div>
            <div>
             <label className="block text-xs font-medium text-gray-500">Class</label>
             <input 
               type="text" 
               className="w-full border-b border-gray-300 focus:border-primary outline-none py-1"
               value={patientClass}
               onChange={e => setPatientClass(e.target.value)}
             />
           </div>
           <div className="col-span-1">
             <label className="block text-xs font-medium text-gray-500">Therapist</label>
             <input 
               type="text" 
               className="w-full border-b border-gray-300 focus:border-primary outline-none py-1"
               value={therapistName}
               onChange={e => setTherapistName(e.target.value)}
             />
           </div>
           <div>
             <label className="block text-xs font-medium text-gray-500">HR</label>
             <input 
               type="text" 
               className="w-full border-b border-gray-300 focus:border-primary outline-none py-1"
               value={hr}
               onChange={e => setHr(e.target.value)}
             />
           </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-2 space-y-2 overflow-y-auto flex-1">
        
        {categories.map(cat => {
           const catExercises = EXERCISE_DB.filter(e => e.category === cat);
           const isOpen = openCategories[cat];
           const activeCount = catExercises.filter(e => selections[e.id]).length;

           return (
             <div key={cat} className="bg-white rounded border border-gray-200 overflow-hidden">
               <button 
                 onClick={() => toggleCategory(cat)}
                 className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100"
               >
                 <span className="font-semibold text-slate-700 flex items-center gap-2">
                   {isOpen ? <ChevronDown size={16}/> : <ChevronRight size={16} />}
                   {cat}
                 </span>
                 {activeCount > 0 && (
                   <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{activeCount}</span>
                 )}
               </button>
               
               {isOpen && (
                 <div className="p-2 space-y-3">
                   {catExercises.map(ex => {
                     const isSelected = !!selections[ex.id];
                     return (
                       <div key={ex.id} className={clsx("p-2 rounded transition-colors", isSelected ? "bg-blue-50 border border-blue-100" : "")}>
                         <div className="flex items-center gap-3">
                           <input 
                             type="checkbox" 
                             className="w-5 h-5 text-primary rounded focus:ring-primary"
                             checked={isSelected}
                             onChange={(e) => handleSelectionChange(ex.id, e.target.checked)}
                           />
                           <span className={clsx("text-sm", isSelected ? "font-semibold text-slate-800" : "text-slate-600")}>
                             {ex.name}
                           </span>
                         </div>
                         
                         {/* Input Fields */}
                         {isSelected && ex.fields.length > 0 && (
                           <div className="mt-2 ml-8 flex flex-wrap gap-2">
                             {ex.fields.map(field => (
                               <div key={field.key} className="flex flex-col">
                                 <label className="text-[10px] text-gray-500 uppercase">{field.label}</label>
                                 {field.type === 'select' ? (
                                    <select 
                                      className={clsx("border rounded text-sm p-1 bg-white", field.width || "w-full")}
                                      value={selections[ex.id]?.[field.key] || ''}
                                      onChange={(e) => handleInputChange(ex.id, field.key, e.target.value)}
                                    >
                                      <option value="">-</option>
                                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                 ) : (
                                    <input 
                                      type={field.type} 
                                      className={clsx("border rounded text-sm p-1", field.width || "w-full")}
                                      placeholder={field.placeholder}
                                      value={selections[ex.id]?.[field.key] || ''}
                                      onChange={(e) => handleInputChange(ex.id, field.key, e.target.value)}
                                    />
                                 )}
                               </div>
                             ))}
                           </div>
                         )}
                       </div>
                     );
                   })}
                 </div>
               )}
             </div>
           );
        })}

        {/* Free Text Section */}
        <div className="bg-white rounded border border-gray-200 p-3">
           <h3 className="font-semibold text-slate-700 mb-2">Additional Exercises</h3>
           <div className="space-y-2">
             {freeTextRows.map((row, idx) => (
                <div key={row.id} className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 border-b border-gray-300 focus:border-primary outline-none py-1 text-sm"
                    placeholder="Enter exercise name..."
                    value={row.text}
                    onChange={(e) => handleFreeTextChange(row.id, e.target.value)}
                  />
                  {freeTextRows.length > 1 && (
                     <button onClick={() => setFreeTextRows(prev => prev.filter(r => r.id !== row.id))} className="text-red-400">
                        <Trash2 size={16} />
                     </button>
                  )}
                </div>
             ))}
             <button onClick={addFreeTextRow} className="flex items-center gap-1 text-sm text-primary mt-2">
               <Plus size={16} /> Add Row
             </button>
           </div>
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-center z-30">
        <button 
          onClick={handleSave}
          className="bg-primary hover:bg-secondary text-white font-bold py-3 px-8 rounded-full shadow-lg flex items-center gap-2 w-full max-w-sm justify-center transition-transform active:scale-95"
        >
          <Save size={20} />
          Save Prescription
        </button>
      </div>
    </div>
  );
};

export default TherapistView;
