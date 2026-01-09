
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { Tenant, Tenancy, OccupancyHistory } from '../types';
import { User, Mail, Plus, Search, Trash2, PenLine, Clock, Euro } from 'lucide-react';
import { EditModal, ConfirmDeleteModal } from './ui/SharedModals';

const TenantRow: React.FC<{ tenant: Tenant }> = ({ tenant }) => {
    const { 
        updateTenant, removeTenant, 
        tenancies, units, selectedPropertyId, occupancyHistory,
        updateTenancy, addOccupancyPeriod, removeOccupancyPeriod,
        getFormattedPrice
    } = useAppStore();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [formData, setFormData] = useState({ name: tenant.name, email: tenant.email });
    
    // Determine active tenancy for selected property
    const activeTenancy = tenancies.find(t => 
        t.tenant_id === tenant.id && 
        units.find(u => u.id === t.unit_id)?.property_id === selectedPropertyId
    );
    const activeUnit = activeTenancy ? units.find(u => u.id === activeTenancy.unit_id) : null;
    
    const [contractData, setContractData] = useState({
        prepayment: activeTenancy ? activeTenancy.monthly_prepayment / 100 : 0,
        startDate: activeTenancy ? activeTenancy.start_date : '',
        endDate: activeTenancy && activeTenancy.end_date ? activeTenancy.end_date : ''
    });

    const [timeline, setTimeline] = useState<OccupancyHistory[]>([]);
    const [newPeriod, setNewPeriod] = useState({ validFrom: '', personCount: 1 });

    useEffect(() => {
        if (isEditOpen && activeTenancy) {
            setContractData({
                prepayment: activeTenancy.monthly_prepayment / 100,
                startDate: activeTenancy.start_date,
                endDate: activeTenancy.end_date || ''
            });
            const hist = occupancyHistory.filter(o => o.tenancy_id === activeTenancy.id)
                .sort((a, b) => new Date(a.valid_from).getTime() - new Date(b.valid_from).getTime());
            setTimeline(hist);
        }
    }, [isEditOpen, activeTenancy, occupancyHistory]);

    const handleDelete = async () => {
        setIsDeleting(true);
        await new Promise(resolve => setTimeout(resolve, 600)); 
        removeTenant(tenant.id);
        setIsDeleting(false);
        setIsDeleteOpen(false);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        updateTenant(tenant.id, formData);

        if (activeTenancy) {
            updateTenancy(activeTenancy.id, {
                monthly_prepayment: Math.round(contractData.prepayment * 100),
                start_date: contractData.startDate,
                end_date: contractData.endDate || null
            });
        }
        setIsEditOpen(false);
    };

    const handleAddPeriod = () => {
        if (!activeTenancy || !newPeriod.validFrom) return;
        addOccupancyPeriod({
            id: Math.random().toString(36).substr(2, 9),
            tenancy_id: activeTenancy.id,
            valid_from: newPeriod.validFrom,
            valid_until: null,
            person_count: Number(newPeriod.personCount)
        });
        setNewPeriod({ validFrom: '', personCount: 1 });
    };

    return (
        <>
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 items-center hover:bg-slate-50 transition-colors group min-w-[700px]">
                <div className="col-span-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <User size={16} />
                    </div>
                    <div>
                        <div className="font-medium text-slate-900">{tenant.name}</div>
                        <div className="text-xs text-slate-500">{activeUnit ? activeUnit.name : 'Keine Einheit'}</div>
                    </div>
                </div>
                <div className="col-span-3 text-sm text-slate-500">{tenant.email || '-'}</div>
                <div className="col-span-3 text-sm text-slate-600">
                    {activeTenancy && (
                        <div className="flex flex-col">
                           <span className="font-medium">VZ: {getFormattedPrice(activeTenancy.monthly_prepayment)}</span>
                           <span className="text-xs text-slate-400">monatlich</span>
                        </div>
                    )}
                </div>
                <div className="col-span-2 text-right flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setIsEditOpen(true)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                        <PenLine size={16} />
                    </button>
                    <button onClick={() => setIsDeleteOpen(true)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <EditModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Mieter & Vertrag bearbeiten">
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Name</label>
                            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded bg-white" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Email</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded bg-white" />
                        </div>
                    </div>

                    {activeTenancy && (
                        <>
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                    <Euro size={12} /> Zahlungen & Vertrag
                                </h4>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Monatliche BK-Vorauszahlung (€)</label>
                                    <div className="relative">
                                        <input 
                                            type="number"
                                            value={contractData.prepayment} 
                                            onChange={e => setContractData({...contractData, prepayment: Number(e.target.value)})} 
                                            className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded bg-white font-bold text-slate-900" 
                                        />
                                        <Euro size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                    <p className="text-xs text-slate-500">Dieser Betrag wird monatlich von den tatsächlichen Kosten abgezogen.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">Vertragsbeginn</label>
                                        <input type="date" value={contractData.startDate} onChange={e => setContractData({...contractData, startDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded bg-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">Vertragsende (Optional)</label>
                                        <input type="date" value={contractData.endDate} onChange={e => setContractData({...contractData, endDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded bg-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                        <Clock size={12} /> Personen-Verlauf
                                    </h4>
                                </div>
                                <div className="bg-slate-50 rounded p-3 space-y-2">
                                    {timeline.map((item, idx) => (
                                        <div key={item.id} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-200 text-sm">
                                            <span className="font-mono">{new Date(item.valid_from).toLocaleDateString('de-DE')}</span>
                                            <span className="text-slate-300">|</span>
                                            <span className="font-bold">{item.person_count} Pers.</span>
                                            <button type="button" onClick={() => removeOccupancyPeriod(item.id)} className="ml-auto text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2 pt-2">
                                        <input type="date" value={newPeriod.validFrom} onChange={e => setNewPeriod({...newPeriod, validFrom: e.target.value})} className="text-xs border rounded px-2 py-1 bg-white" />
                                        <input type="number" value={newPeriod.personCount} onChange={e => setNewPeriod({...newPeriod, personCount: Number(e.target.value)})} className="w-12 text-xs border rounded px-2 py-1 bg-white" />
                                        <button type="button" onClick={handleAddPeriod} disabled={!newPeriod.validFrom} className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200">+ Hinzufügen</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded">Abbrechen</button>
                        <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">Speichern</button>
                    </div>
                </form>
            </EditModal>

            <ConfirmDeleteModal 
                isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete}
                title="Mieter löschen?" description={`Soll ${tenant.name} wirklich entfernt werden?`} isLoading={isDeleting}
            />
        </>
    );
};

export const TenantManager: React.FC = () => {
  const { tenants, addTenant } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addTenant({ id: Math.random().toString(36).substr(2, 9), name, email });
    setShowModal(false);
    setName('');
    setEmail('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Mieterverwaltung</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded text-sm font-medium hover:bg-slate-800">
          <Plus size={16} /> Mieter anlegen
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 overflow-auto">
        {tenants.length > 0 ? (
             <div className="min-w-[700px]">
                {tenants.map(t => <TenantRow key={t.id} tenant={t} />)}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <User size={32} className="opacity-50 mb-2"/>
                <p>Keine Mieter vorhanden.</p>
            </div>
        )}
      </div>

      <EditModal isOpen={showModal} onClose={() => setShowModal(false)} title="Neuen Mieter anlegen">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded bg-white" required />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded bg-white" />
            </div>
            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded">Abbrechen</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded">Speichern</button>
            </div>
        </form>
      </EditModal>
    </div>
  );
};
