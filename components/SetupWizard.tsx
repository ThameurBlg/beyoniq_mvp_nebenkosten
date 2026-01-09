
import React from 'react';
import { useAppStore } from '../store';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const SetupWizard: React.FC = () => {
  const { selectedPropertyId, properties, units, tenants, tenancies } = useAppStore();
  const property = properties.find(p => p.id === selectedPropertyId);

  if (!property) return null;

  const propUnits = units.filter(u => u.property_id === property.id);
  const propTenancies = tenancies.filter(t => propUnits.find(u => u.id === t.unit_id));

  // VALIDATION LOGIC
  const currentTotalSqm = propUnits.reduce((sum, u) => sum + u.sq_meter, 0);
  const isSqmValid = currentTotalSqm === property.total_sqm;
  
  // Steps Status
  const steps = [
    { 
        id: 1, 
        label: 'Objektdaten', 
        done: !!property.address, 
        detail: property.address ? 'Adresse vorhanden' : 'Adresse fehlt' 
    },
    { 
        id: 2, 
        label: 'Einheiten & Flächen', 
        done: propUnits.length > 0 && isSqmValid, 
        error: !isSqmValid,
        detail: isSqmValid 
            ? `${propUnits.length} Einheiten (${currentTotalSqm} m²)` 
            : `Fehler: Summe Einheiten (${currentTotalSqm} m²) ≠ Objekt (${property.total_sqm} m²)` 
    },
    { 
        id: 3, 
        label: 'Mieter & Verträge', 
        done: propTenancies.length > 0, 
        detail: `${propTenancies.length} aktive Verträge` 
    }
  ];

  const progress = Math.round((steps.filter(s => s.done).length / steps.length) * 100);
  const allDone = progress === 100;

  if (allDone) return null; // Hide if setup is complete

  return (
    <div className="mb-8 bg-white rounded-lg border border-indigo-100 shadow-sm overflow-hidden">
        <div className="bg-indigo-50/50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-semibold text-indigo-950">Einrichtungs-Assistent</h3>
                <p className="text-sm text-indigo-700">Bitte vervollständigen Sie die Daten für {property.name}, um eine korrekte Abrechnung zu garantieren.</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <span className="text-2xl font-bold text-indigo-600">{progress}%</span>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-indigo-200 flex items-center justify-center border-t-indigo-600 rotate-[-45deg]">
                    {/* Simple CSS Spinner/Progress simulation */}
                </div>
            </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
                <div key={step.id} className={`relative pl-4 ${idx !== 0 ? 'md:border-l md:border-slate-100' : ''}`}>
                    <div className="flex items-center gap-2 mb-2">
                        {step.done ? (
                            <CheckCircle2 className="text-emerald-500" size={20} />
                        ) : step.error ? (
                            <AlertCircle className="text-red-500" size={20} />
                        ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 text-xs flex items-center justify-center text-slate-500 font-medium">
                                {step.id}
                            </div>
                        )}
                        <span className={`font-medium ${step.done ? 'text-slate-900' : 'text-slate-500'}`}>
                            {step.label}
                        </span>
                    </div>
                    <p className={`text-sm ${step.error ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                        {step.detail}
                    </p>
                    
                    {!step.done && (
                        <button className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                            Jetzt bearbeiten <ArrowRight size={14} />
                        </button>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
};
