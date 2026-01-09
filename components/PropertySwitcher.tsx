
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { ChevronDown, Building2, Check, MapPin } from 'lucide-react';

export const PropertySwitcher: React.FC = () => {
  const { properties, selectedPropertyId, selectProperty, t } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  return (
    <div className="relative w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-sm transition-all w-full justify-between active:scale-[0.98]"
      >
        <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex-shrink-0 flex items-center justify-center border border-indigo-100">
                <Building2 size={20} />
            </div>
            <div className="flex flex-col items-start truncate">
                <span className="truncate w-full text-slate-900">{selectedProperty?.name || t('app.selectProperty')}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktiv</span>
            </div>
        </div>
        <ChevronDown size={18} className={`text-slate-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full mt-3 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 z-20 py-2 left-0 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 flex items-center justify-between">
                    {t('app.myObjects')}
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg">{properties.length}</span>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scroll-container">
                {properties.map(prop => (
                    <button
                        key={prop.id}
                        onClick={() => {
                            selectProperty(prop.id);
                            setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-left ${selectedPropertyId === prop.id ? 'bg-indigo-50/30' : ''}`}
                    >
                        <div className="flex flex-col min-w-0">
                            <span className={`text-sm font-bold truncate ${selectedPropertyId === prop.id ? 'text-indigo-600' : 'text-slate-700'}`}>
                                {prop.name}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                <MapPin size={10} /> {prop.address || '-'}
                            </span>
                        </div>
                        {selectedPropertyId === prop.id && (
                            <div className="bg-indigo-600 rounded-full p-1 text-white">
                                <Check size={12} strokeWidth={4} />
                            </div>
                        )}
                    </button>
                ))}
                </div>
            </div>
        </>
      )}
    </div>
  );
};
