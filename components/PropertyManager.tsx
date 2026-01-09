
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Building2, Plus, MapPin, Trash2, Home, Briefcase, PenLine } from 'lucide-react';
import { ConfirmDeleteModal, EditModal } from './ui/SharedModals';
import { UsageType, Property } from '../types';

export const PropertyManager: React.FC = () => {
  const { properties, openWizard, removeProperty, updateProperty, units, tenancies } = useAppStore();
  
  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    total_sqm: 0
  });

  // --- DELETE HANDLERS ---
  const handleDeleteClick = (id: string) => {
    setPropertyToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;
    setIsDeleting(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API
    removeProperty(propertyToDelete);
    setIsDeleting(false);
    setIsDeleteOpen(false);
    setPropertyToDelete(null);
  };

  // --- EDIT HANDLERS ---
  const handleEditClick = (property: Property) => {
    setPropertyToEdit(property);
    setEditForm({
        name: property.name,
        address: property.address,
        total_sqm: property.total_sqm
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (propertyToEdit) {
        updateProperty(propertyToEdit.id, {
            name: editForm.name,
            address: editForm.address,
            total_sqm: Number(editForm.total_sqm)
        });
        setIsEditOpen(false);
        setPropertyToEdit(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
            <h2 className="text-lg font-semibold text-slate-900">Meine Immobilien</h2>
            <p className="text-sm text-slate-500">Verwalten Sie hier Ihren Bestand.</p>
        </div>
        <button 
          onClick={openWizard}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm w-full sm:w-auto"
        >
          <Plus size={16} />
          Neues Objekt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-8">
        {properties.map(property => {
          const unitCount = units.filter(u => u.property_id === property.id).length;
          // Calculate active tenancies for this property roughly
          const propertyUnitIds = units.filter(u => u.property_id === property.id).map(u => u.id);
          const activeContracts = tenancies.filter(t => propertyUnitIds.includes(t.unit_id) && (!t.end_date || new Date(t.end_date) > new Date())).length;

          return (
            <div key={property.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group relative">
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-indigo-600 bg-indigo-50`}>
                        <Building2 size={24} />
                    </div>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => handleEditClick(property)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                            title="Objekt bearbeiten"
                        >
                            <PenLine size={18} />
                        </button>
                        <button 
                            onClick={() => handleDeleteClick(property.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Objekt entfernen"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-1">{property.name}</h3>
                
                <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
                    <MapPin size={14} />
                    <span className="truncate">{property.address || 'Keine Adresse hinterlegt'}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                    <div>
                        <div className="text-xs font-semibold text-slate-400 uppercase">Fläche</div>
                        <div className="font-medium text-slate-900">{property.total_sqm} m²</div>
                    </div>
                    <div>
                         <div className="text-xs font-semibold text-slate-400 uppercase">Einheiten</div>
                         <div className="font-medium text-slate-900">{unitCount}</div>
                    </div>
                    <div>
                         <div className="text-xs font-semibold text-slate-400 uppercase">Vermietet</div>
                         <div className="font-medium text-slate-900">{activeContracts} / {unitCount}</div>
                    </div>
                </div>
            </div>
          );
        })}

        {/* Empty State / Add Card */}
        <button 
            onClick={openWizard}
            className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors min-h-[250px]"
        >
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Plus size={24} />
            </div>
            <span className="font-medium">Weiteres Objekt hinzufügen</span>
        </button>
      </div>

      {/* EDIT MODAL */}
      <EditModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        title="Immobilie bearbeiten"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Bezeichnung</label>
                <input 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    required 
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Adresse</label>
                <input 
                    value={editForm.address} 
                    onChange={e => setEditForm({...editForm, address: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Gesamtfläche (m²)</label>
                <input 
                    type="number"
                    value={editForm.total_sqm} 
                    onChange={e => setEditForm({...editForm, total_sqm: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    required
                />
            </div>
            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded">Abbrechen</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium">Speichern</button>
            </div>
        </form>
      </EditModal>

      {/* DELETE MODAL */}
      <ConfirmDeleteModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Immobilie löschen?"
        description="Sind Sie sicher? Alle zugehörigen Einheiten, Verträge und Ausgaben werden ebenfalls unwiderruflich gelöscht."
        isLoading={isDeleting}
      />
    </div>
  );
};
