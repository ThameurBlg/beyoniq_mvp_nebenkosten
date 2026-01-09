
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Unit, UsageType } from '../types';
import { Search, Plus, Trash2, PenLine, Building2, Filter } from 'lucide-react';
import { EditModal, ConfirmDeleteModal } from './ui/SharedModals';

// --- ROW COMPONENT WITH LOCAL STATE ---
const UnitListRow: React.FC<{ unit: Unit }> = ({ unit }) => {
    const { updateUnit, removeUnit } = useAppStore();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit Form State
    const [formData, setFormData] = useState({
        name: unit.name,
        sq_meter: unit.sq_meter,
        usage_type: unit.usage_type
    });

    const handleDelete = async () => {
        setIsDeleting(true);
        // Simulate Server Action Delay
        await new Promise(resolve => setTimeout(resolve, 800)); 
        removeUnit(unit.id);
        setIsDeleting(false);
        setIsDeleteOpen(false);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        updateUnit(unit.id, {
            name: formData.name,
            sq_meter: Number(formData.sq_meter),
            usage_type: formData.usage_type
        });
        setIsEditOpen(false);
    };

    return (
        <>
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 items-center hover:bg-slate-50 transition-colors group min-w-[600px]">
                <div className="col-span-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
                        {unit.name.replace(/\D/g, '') || 'U'}
                    </div>
                    <div>
                        <div className="font-medium text-slate-900">{unit.name}</div>
                        <div className="text-xs text-slate-500">{unit.usage_type === UsageType.COMMERCIAL ? 'Gewerbe' : 'Wohnraum'}</div>
                    </div>
                </div>
                <div className="col-span-4 text-sm text-slate-700 font-mono">
                    {unit.sq_meter} m²
                </div>
                <div className="col-span-3 text-right flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => setIsEditOpen(true)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Bearbeiten"
                    >
                        <PenLine size={16} />
                    </button>
                    <button 
                        onClick={() => setIsDeleteOpen(true)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Löschen"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* EDIT MODAL */}
            <EditModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Einheit bearbeiten">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Bezeichnung</label>
                        <input 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Fläche (m²)</label>
                        <input 
                            type="number"
                            value={formData.sq_meter}
                            onChange={e => setFormData({...formData, sq_meter: Number(e.target.value)})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Nutzungsart</label>
                        <select 
                            value={formData.usage_type}
                            onChange={e => setFormData({...formData, usage_type: e.target.value as UsageType})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                        >
                            <option value={UsageType.RESIDENTIAL}>Wohnraum</option>
                            <option value={UsageType.COMMERCIAL}>Gewerbe</option>
                            <option value={UsageType.MIXED}>Gemischt</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded">Abbrechen</button>
                        <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">Speichern</button>
                    </div>
                </form>
            </EditModal>

            {/* DELETE ALERT */}
            <ConfirmDeleteModal 
                isOpen={isDeleteOpen} 
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Sind Sie sicher?"
                description={`Möchten Sie die Einheit "${unit.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
                isLoading={isDeleting}
            />
        </>
    );
};

// --- MAIN MANAGER COMPONENT ---
export const UnitManager: React.FC = () => {
    const { units, selectedPropertyId, addUnit } = useAppStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCriteria, setSearchCriteria] = useState<'name' | 'sq_meter' | 'usage_type'>('name');
    const [isAddOpen, setIsAddOpen] = useState(false);
    
    // Add Form State
    const [newName, setNewName] = useState('');
    const [newSqm, setNewSqm] = useState('');
    const [newType, setNewType] = useState<UsageType>(UsageType.RESIDENTIAL);

    const filteredUnits = units
        .filter(u => u.property_id === selectedPropertyId)
        .filter(u => {
            const term = searchTerm.toLowerCase();
            if (!term) return true;

            switch (searchCriteria) {
                case 'name':
                    return u.name.toLowerCase().includes(term);
                case 'sq_meter':
                    return u.sq_meter.toString().includes(term);
                case 'usage_type':
                    // Map English enum to German display terms for search
                    const typeMap: Record<string, string> = {
                        [UsageType.RESIDENTIAL]: 'wohnraum',
                        [UsageType.COMMERCIAL]: 'gewerbe',
                        [UsageType.MIXED]: 'gemischt'
                    };
                    return typeMap[u.usage_type]?.includes(term) || false;
                default:
                    return true;
            }
        });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if(selectedPropertyId) {
            addUnit({
                id: Math.random().toString(36).substr(2, 9),
                property_id: selectedPropertyId,
                name: newName,
                sq_meter: Number(newSqm),
                keys: 2,
                usage_type: newType
            });
            setIsAddOpen(false);
            setNewName('');
            setNewSqm('');
        }
    };

    const getPlaceholder = () => {
        switch(searchCriteria) {
            case 'sq_meter': return 'Fläche (z.B. 85)...';
            case 'usage_type': return 'z.B. Gewerbe...';
            default: return 'Einheit suchen...';
        }
    };

    if (!selectedPropertyId) return null;

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 w-full sm:max-w-xl">
                    <div className="relative">
                        <select
                            value={searchCriteria}
                            onChange={(e) => {
                                setSearchCriteria(e.target.value as any);
                                setSearchTerm(''); // Reset search when changing criteria
                            }}
                            className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 cursor-pointer font-medium"
                        >
                            <option value="name">Name</option>
                            <option value="sq_meter">Fläche</option>
                            <option value="usage_type">Nutzungsart</option>
                        </select>
                        <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>

                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder={getPlaceholder()}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                    onClick={() => setIsAddOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                    <Plus size={16} />
                    Einheit anlegen
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 overflow-hidden flex flex-col">
                {/* min-w on inner div to ensure horizontal scroll if needed */}
                <div className="overflow-x-auto">
                    <div className="min-w-[600px] grid grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-5">Bezeichnung</div>
                        <div className="col-span-4">Fläche / Art</div>
                        <div className="col-span-3 text-right">Aktionen</div>
                    </div>
                </div>
                <div className="overflow-y-auto overflow-x-auto flex-1">
                    {filteredUnits.length > 0 ? (
                        <div className="min-w-[600px]">
                            {filteredUnits.map(unit => <UnitListRow key={unit.id} unit={unit} />)}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                            <Building2 size={32} className="mb-2 opacity-50" />
                            <p>Keine Einheiten gefunden.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ADD MODAL */}
            <EditModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Neue Einheit anlegen">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Bezeichnung</label>
                        <input 
                            value={newName} onChange={e => setNewName(e.target.value)}
                            placeholder="z.B. 2. OG Rechts"
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Fläche (m²)</label>
                        <input 
                            type="number" value={newSqm} onChange={e => setNewSqm(e.target.value)}
                            placeholder="z.B. 85"
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Nutzungsart</label>
                        <select 
                            value={newType} onChange={e => setNewType(e.target.value as UsageType)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                        >
                            <option value={UsageType.RESIDENTIAL}>Wohnraum</option>
                            <option value={UsageType.COMMERCIAL}>Gewerbe</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded">Abbrechen</button>
                        <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">Erstellen</button>
                    </div>
                </form>
            </EditModal>
        </div>
    );
};
