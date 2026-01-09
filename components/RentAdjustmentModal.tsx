
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { ContractAmendment } from '../types';
import { X, TrendingUp, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tenancyId: string;
  currentRent?: ContractAmendment;
}

export const RentAdjustmentModal: React.FC<Props> = ({ isOpen, onClose, tenancyId, currentRent }) => {
  const { adjustRent } = useAppStore();

  const [validFrom, setValidFrom] = useState('');
  // Amounts in Euros for input
  const [baseRent, setBaseRent] = useState(currentRent ? currentRent.base_rent / 100 : 0);
  const [parking, setParking] = useState(currentRent ? currentRent.parking_rent / 100 : 0);
  const [prepay, setPrepay] = useState(currentRent ? currentRent.prepayment / 100 : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validFrom) return;
    
    adjustRent(
        tenancyId, 
        validFrom, 
        Math.round(baseRent * 100), 
        Math.round(parking * 100), 
        Math.round(prepay * 100)
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-600" />
            <h3 className="font-semibold text-slate-900">Mietanpassung</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="p-3 bg-indigo-50 text-indigo-800 text-xs rounded-md border border-indigo-100">
                <strong>Hinweis:</strong> Dies überschreibt keine alten Werte. Es wird eine neue Historie ab dem Stichtag angelegt.
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Gültig ab</label>
                <input 
                    type="date" 
                    value={validFrom} 
                    onChange={e => setValidFrom(e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900"
                    required
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Kaltmiete</label>
                    <input 
                        type="number" step="0.01"
                        value={baseRent} 
                        onChange={e => setBaseRent(Number(e.target.value))} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Stellplatz</label>
                    <input 
                        type="number" step="0.01"
                        value={parking} 
                        onChange={e => setParking(Number(e.target.value))} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">BK-Vorausz.</label>
                    <input 
                        type="number" step="0.01"
                        value={prepay} 
                        onChange={e => setPrepay(Number(e.target.value))} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900"
                    />
                </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded">Abbrechen</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium flex items-center gap-2">
                    <Save size={16} /> Speichern
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
