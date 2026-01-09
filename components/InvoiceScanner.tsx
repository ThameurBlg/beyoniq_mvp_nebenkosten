
import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { Camera, Upload, Check, ChevronRight, X, Euro, Split, ArrowLeft, Loader2, FileText, Zap } from 'lucide-react';
import { AllocationKey, Expense, STANDARD_EXPENSE_TYPES } from '../types';

interface Props {
  onClose: () => void;
}

export const InvoiceScanner: React.FC<Props> = ({ onClose }) => {
  const { addExpense, properties, selectedPropertyId, units, accountingYear } = useAppStore();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Controls
  const [selectedCostCategory, setSelectedCostCategory] = useState<string>('');
  const [autoKeyMessage, setAutoKeyMessage] = useState<string | null>(null);

  const [draft, setDraft] = useState<Partial<Expense>>({
    property_id: selectedPropertyId || (properties[0]?.id || ''),
    name: '',
    amount: 0,
    date_billed: `${accountingYear}-12-31`, 
    period_start: `${accountingYear}-01-01`,
    period_end: `${accountingYear}-12-31`,
    allocation_key: AllocationKey.AREA,
    unit_id: '' 
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const activeProperty = properties.find(p => p.id === draft.property_id);
  const relevantUnits = units.filter(u => u.property_id === draft.property_id);

  // --- AUTO-MAPPING LOGIC ---
  useEffect(() => {
    if (!selectedCostCategory) return;
    
    // 1. Auto-Fill Name
    setDraft(prev => ({ ...prev, name: selectedCostCategory }));

    // 2. Auto-Select Allocation Key from Property Defaults
    if (activeProperty && activeProperty.default_keys) {
        // Look up exactly the string from the dropdown in the property map
        const mappedKey = activeProperty.default_keys[selectedCostCategory];
        
        if (mappedKey) {
            setDraft(prev => ({ ...prev, allocation_key: mappedKey }));
            
            // Generate friendly label
            let label = 'Fläche';
            if (mappedKey === AllocationKey.PERSONS) label = 'Personen';
            if (mappedKey === AllocationKey.UNITS) label = 'Einheiten';
            if (mappedKey === AllocationKey.DIRECT) label = 'Direkt';
            if (mappedKey === AllocationKey.COMMERCIAL_AREA) label = 'Gewerbe';

            setAutoKeyMessage(`Verteilschlüssel übernommen: ${label}`);
            // Clear message after 3s
            setTimeout(() => setAutoKeyMessage(null), 3000);
        }
    }
  }, [selectedCostCategory, activeProperty]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
      
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setStep(2);
        setDraft(prev => ({
            ...prev,
            amount: 15000, // Mock 150.00 €
            name: 'Rechnung erkannt',
            period_start: `${accountingYear}-01-01`,
            period_end: `${accountingYear}-12-31`
        }));
      }, 1000);
    }
  };

  const handleSave = () => {
    if (!draft.property_id || !draft.name || !draft.amount) return;
    
    addExpense({
        id: Math.random().toString(36).substr(2, 9),
        property_id: draft.property_id,
        name: draft.name,
        amount: draft.amount, 
        date_billed: draft.date_billed!,
        period_start: draft.period_start!,
        period_end: draft.period_end!,
        allocation_key: draft.allocation_key!,
        unit_id: draft.allocation_key === AllocationKey.DIRECT ? draft.unit_id : undefined
    });

    setStep(3);
  };

  if (step === 3) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-white md:rounded-xl">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 animate-in zoom-in">
                <Check size={40} strokeWidth={3} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Gespeichert & Verteilt!</h2>
            <p className="text-slate-500 text-center mb-8">
                Die Kosten wurden erfolgreich verbucht und gemäß Ihren Einstellungen auf die Mieter umgelegt.
            </p>
            <button onClick={onClose} className="w-full py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-medium">
                Schließen
            </button>
        </div>
      );
  }

  if (step === 2) {
      return (
        <div className="h-full flex flex-col bg-slate-50 md:rounded-xl overflow-hidden">
            <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <button onClick={() => setStep(1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="font-semibold text-slate-900">Beleg prüfen</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {/* 1. Preview */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <FileText className="text-slate-400" />}
                    </div>
                    <div>
                        <div className="font-medium text-slate-900 truncate max-w-[200px]">{file?.name}</div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Zap size={10} className="text-amber-500" /> Auto-Erkennung
                        </div>
                    </div>
                </div>

                {/* 2. Amount & Category */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Betrag (€)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={draft.amount! / 100}
                                onChange={e => setDraft({...draft, amount: Math.round(Number(e.target.value) * 100)})}
                                className="w-full pl-8 pr-4 py-3 text-lg font-bold text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" 
                            />
                            <Euro size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                     </div>

                     <div className="space-y-1">
                        <div className="flex justify-between">
                            <label className="text-xs font-bold text-slate-500 uppercase">Kostenart</label>
                            {autoKeyMessage && <span className="text-xs font-bold text-indigo-600 animate-pulse">{autoKeyMessage}</span>}
                        </div>
                        <select 
                            value={selectedCostCategory}
                            onChange={(e) => setSelectedCostCategory(e.target.value)}
                            className="w-full px-3 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 font-medium"
                        >
                            <option value="">-- Wählen --</option>
                            {STANDARD_EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input 
                            type="text"
                            placeholder="Bezeichnung anpassen..."
                            value={draft.name}
                            onChange={(e) => setDraft({...draft, name: e.target.value})}
                            className="w-full mt-2 px-3 py-2 border-b border-slate-200 text-sm focus:outline-none bg-transparent"
                        />
                     </div>
                </div>

                {/* 3. Dates & Key */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Von</label>
                            <input 
                                type="date" value={draft.period_start}
                                onChange={e => setDraft({...draft, period_start: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Bis</label>
                            <input 
                                type="date" value={draft.period_end}
                                onChange={e => setDraft({...draft, period_end: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                            />
                        </div>
                     </div>

                     <div className="pt-4 border-t border-slate-100 space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Split size={18} className="text-indigo-600" />
                            <h3 className="font-semibold text-slate-900">Verteilschlüssel</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { k: AllocationKey.AREA, l: 'Fläche (m²)' },
                                { k: AllocationKey.PERSONS, l: 'Personen' },
                                { k: AllocationKey.UNITS, l: 'Einheiten' },
                                { k: AllocationKey.DIRECT, l: 'Direkt' }
                            ].map(opt => (
                                <button 
                                    key={opt.k}
                                    onClick={() => setDraft({...draft, allocation_key: opt.k})}
                                    className={`p-2 rounded border text-xs font-medium transition-all ${draft.allocation_key === opt.k ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}
                                >
                                    {opt.l}
                                </button>
                            ))}
                        </div>
                        
                        {draft.allocation_key === AllocationKey.DIRECT && (
                            <select 
                                value={draft.unit_id}
                                onChange={(e) => setDraft({...draft, unit_id: e.target.value})}
                                className="w-full mt-2 px-3 py-2 bg-white border border-indigo-300 rounded-lg text-sm"
                            >
                                <option value="">Einheit wählen...</option>
                                {relevantUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        )}
                     </div>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
                <button 
                    onClick={handleSave}
                    disabled={!draft.amount || !draft.name}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium text-lg hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                    Speichern <ChevronRight size={20} />
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="h-full flex flex-col bg-white md:rounded-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200">
            <X size={20} />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                <Camera size={40} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Beleg erfassen</h2>
                <p className="text-slate-500 max-w-xs mx-auto">Rechnung hochladen oder fotografieren.</p>
            </div>

            <div className="w-full max-w-sm space-y-3">
                <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleFileSelect} />
                <button onClick={() => cameraInputRef.current?.click()} className="flex items-center justify-center gap-3 w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg active:scale-95 transition-transform">
                    <Camera size={24} /> Foto
                </button>

                <input type="file" accept=".pdf,.png,.jpg,.xlsx" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-3 w-full py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50">
                    <Upload size={24} /> Datei
                </button>
            </div>
        </div>
        {isAnalyzing && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
                <h3 className="text-lg font-semibold text-slate-900">Analysiere...</h3>
            </div>
        )}
    </div>
  );
};
