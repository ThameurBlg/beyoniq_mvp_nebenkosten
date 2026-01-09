
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Expense, AllocationKey } from '../types';
import { ReceiptEuro, Calendar, Trash2, Plus, PenLine } from 'lucide-react';
import { EditModal, ConfirmDeleteModal } from './ui/SharedModals';

const ExpenseRow: React.FC<{ expense: Expense }> = ({ expense }) => {
    const { updateExpense, removeExpense, getFormattedPrice } = useAppStore();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        name: expense.name,
        amount: expense.amount, // stored in cents
        allocation_key: expense.allocation_key
    });

    const handleDelete = async () => {
        setIsDeleting(true);
        await new Promise(resolve => setTimeout(resolve, 600)); 
        removeExpense(expense.id);
        setIsDeleting(false);
        setIsDeleteOpen(false);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        updateExpense(expense.id, {
            ...formData,
            amount: Number(formData.amount)
        });
        setIsEditOpen(false);
    };

    return (
        <>
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 items-center hover:bg-slate-50 transition-colors group min-w-[700px]">
                <div className="col-span-4">
                    <div className="font-medium text-slate-900">{expense.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <ReceiptEuro size={12} />
                        {new Date(expense.date_billed).toLocaleDateString('de-DE')}
                    </div>
                </div>
                <div className="col-span-3 text-sm text-slate-500 flex items-center gap-2">
                    <Calendar size={14} />
                    <span className="text-xs">
                        {new Date(expense.period_start).toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })} - {new Date(expense.period_end).toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })}
                    </span>
                </div>
                <div className="col-span-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {expense.allocation_key}
                    </span>
                </div>
                <div className="col-span-2 text-right font-medium text-slate-900">
                    {getFormattedPrice(expense.amount)}
                </div>
                <div className="col-span-1 text-right flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setIsEditOpen(true)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                        <PenLine size={16} />
                    </button>
                    <button onClick={() => setIsDeleteOpen(true)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <EditModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Ausgabe bearbeiten">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Bezeichnung</label>
                        <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Betrag (in Cent)</label>
                        <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900" required />
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Schlüssel</label>
                        <select 
                            value={formData.allocation_key}
                            onChange={(e) => setFormData({...formData, allocation_key: e.target.value as AllocationKey})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900"
                        >
                            <option value={AllocationKey.AREA}>Fläche (m²)</option>
                            <option value={AllocationKey.COMMERCIAL_AREA}>Nur Gewerbe (Fläche)</option>
                            <option value={AllocationKey.PERSONS}>Personen</option>
                            <option value={AllocationKey.UNITS}>Einheiten</option>
                            <option value={AllocationKey.DIRECT}>Direkt</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded">Abbrechen</button>
                        <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">Speichern</button>
                    </div>
                </form>
            </EditModal>

            <ConfirmDeleteModal 
                isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete}
                title="Ausgabe löschen?" description={`Soll "${expense.name}" wirklich gelöscht werden?`} isLoading={isDeleting}
            />
        </>
    );
}

export const ExpenseManager: React.FC<{ onImportClick: () => void }> = ({ onImportClick }) => {
  const { expenses, selectedPropertyId } = useAppStore();

  const propertyExpenses = expenses
    .filter(e => e.property_id === selectedPropertyId)
    .sort((a, b) => new Date(b.date_billed).getTime() - new Date(a.date_billed).getTime());

  if (!selectedPropertyId) return null;

  return (
    <div className="h-full flex flex-col">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Ausgabenübersicht</h2>
            <button 
                onClick={onImportClick}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm w-full sm:w-auto"
            >
                <Plus size={16} />
                Neue Ausgabe
            </button>
       </div>

       <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <div className="min-w-[700px] grid grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-4">Bezeichnung</div>
                    <div className="col-span-3">Zeitraum</div>
                    <div className="col-span-2">Schlüssel</div>
                    <div className="col-span-2 text-right">Betrag</div>
                    <div className="col-span-1 text-right"></div>
                </div>
            </div>
            
            <div className="overflow-y-auto overflow-x-auto flex-1">
                {propertyExpenses.length > 0 ? (
                    <div className="min-w-[700px]">
                        {propertyExpenses.map(expense => <ExpenseRow key={expense.id} expense={expense} />)}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                        <ReceiptEuro size={32} className="mb-2 opacity-50" />
                        <p>Noch keine Ausgaben erfasst.</p>
                    </div>
                )}
            </div>
       </div>
    </div>
  );
};
