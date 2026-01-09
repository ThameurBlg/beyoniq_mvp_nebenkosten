
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { AlertTriangle, Trash2, Save, Building2 } from 'lucide-react';
import { ConfirmDeleteModal } from './ui/SharedModals';

export const SettingsManager: React.FC = () => {
  const { selectedPropertyId, properties, updateProperty, removeProperty } = useAppStore();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeProperty = properties.find(p => p.id === selectedPropertyId);
  const [name, setName] = useState(activeProperty?.name || '');
  const [address, setAddress] = useState(activeProperty?.address || '');

  // Reset local state when property switches
  React.useEffect(() => {
    if (activeProperty) {
      setName(activeProperty.name);
      setAddress(activeProperty.address);
    }
  }, [activeProperty]);

  const handleSave = () => {
    if (!activeProperty) return;
    updateProperty(activeProperty.id, { name, address });
    alert('Einstellungen gespeichert.'); // Simple feedback for MVP
  };

  const handleDelete = async () => {
    if (!activeProperty) return;
    setIsDeleting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    removeProperty(activeProperty.id);
    setIsDeleting(false);
    setIsDeleteOpen(false);
  };

  if (!activeProperty) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* General Settings */}
      <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Building2 size={18} className="text-slate-500" />
            <h2 className="font-semibold text-slate-900">Objekt-Stammdaten</h2>
        </div>
        <div className="p-6 space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Bezeichnung</label>
                <input 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500" 
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Adresse</label>
                <input 
                    value={address} 
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500" 
                />
            </div>
            <div className="pt-2 flex justify-end">
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium text-sm"
                >
                    <Save size={16} />
                    Speichern
                </button>
            </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-red-50 rounded-lg border border-red-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600" />
            <h2 className="font-semibold text-red-800">Gefahrenzone</h2>
        </div>
        <div className="p-6 flex items-center justify-between">
            <div>
                <h3 className="text-sm font-medium text-red-900">Objekt löschen</h3>
                <p className="text-sm text-red-700 mt-1">
                    Löscht das Objekt "{activeProperty.name}" und alle zugehörigen Einheiten, Mieter und Kosten unwiderruflich.
                </p>
            </div>
            <button 
                onClick={() => setIsDeleteOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-100 font-medium text-sm transition-colors shadow-sm"
            >
                <Trash2 size={16} />
                Objekt löschen
            </button>
        </div>
      </section>

      <ConfirmDeleteModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Objekt wirklich löschen?"
        description={`Sind Sie sicher, dass Sie "${activeProperty.name}" löschen möchten? Alle Daten gehen verloren.`}
        isLoading={isDeleting}
      />
    </div>
  );
};
