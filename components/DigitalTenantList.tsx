
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { TrendingUp, AlertCircle, Calendar, User, History, CheckCircle2 } from 'lucide-react';
import { RentAdjustmentModal } from './RentAdjustmentModal';
import { ContractAmendment } from '../types';

export const DigitalTenantList: React.FC = () => {
  const { 
    properties, units, tenancies, tenants, occupancyHistory, selectedPropertyId, 
    getCurrentRent, getFormattedPrice, payments, accountingYear
  } = useAppStore();

  const [adjustmentModal, setAdjustmentModal] = useState<{open: boolean, tenancyId: string, currentRent?: ContractAmendment}>({
    open: false, tenancyId: '', currentRent: undefined
  });

  const property = properties.find(p => p.id === selectedPropertyId);
  if (!property) return null;

  // --- PREPARE DATA VIEW MODEL ---
  const rows = units
    .filter(u => u.property_id === property.id)
    .map(unit => {
        // Find Tenancy Active in the Selected Accounting Year
        // Logic: Tenancy Start <= Year End AND (Tenancy End >= Year Start OR Tenancy End is Null)
        const yearStart = new Date(`${accountingYear}-01-01`);
        const yearEnd = new Date(`${accountingYear}-12-31`);

        const activeTenancy = tenancies.find(t => {
            const tStart = new Date(t.start_date);
            const tEnd = t.end_date ? new Date(t.end_date) : new Date('2099-12-31');
            return tStart <= yearEnd && tEnd >= yearStart;
        });

        const tenant = activeTenancy ? tenants.find(t => t.id === activeTenancy.tenant_id) : null;
        
        // Occupancy for selected year (simplification: get first valid or default)
        const currentOccupancy = activeTenancy 
            ? occupancyHistory.find(h => h.tenancy_id === activeTenancy.id && new Date(h.valid_from).getFullYear() <= accountingYear) 
            : null;
        
        // Financials (Source of Truth: Contract Amendments)
        const rentData = activeTenancy ? getCurrentRent(activeTenancy.id) : null;

        return {
            unit,
            tenancy: activeTenancy,
            tenant,
            personCount: currentOccupancy?.person_count || unit.keys || 0,
            rent: rentData || { base_rent: 0, parking_rent: 0, prepayment: 0 }
        };
    })
    .sort((a, b) => a.unit.name.localeCompare(b.unit.name));

  // --- CALCULATE TOTALS ---
  const totalSqm = rows.reduce((acc, r) => acc + r.unit.sq_meter, 0);
  const totalBaseRent = rows.reduce((acc, r) => acc + (r.rent.base_rent || 0), 0);
  const totalParking = rows.reduce((acc, r) => acc + (r.rent.parking_rent || 0), 0);
  const totalPrepay = rows.reduce((acc, r) => acc + (r.rent.prepayment || 0), 0);
  const totalMonthly = totalBaseRent + totalParking + totalPrepay;

  // --- BANK RECON WIDGET DATA ---
  // Simple sum of expected vs received for the current month (Mock: Dec of selected year)
  const currentMonth = `${accountingYear}-12-01`;
  const monthPayments = payments.filter(p => p.date === currentMonth);
  const totalExpected = monthPayments.reduce((acc, p) => acc + p.amount_expected, 0);
  const totalReceived = monthPayments.reduce((acc, p) => acc + p.amount_received, 0);
  const paymentHealth = totalExpected > 0 ? (totalReceived / totalExpected) * 100 : 100;

  return (
    <div className="h-full flex flex-col space-y-4">
        {/* Header / Context */}
        <div className="flex justify-between items-end">
             <div>
                <h2 className="text-lg font-bold text-slate-900">Mieterliste {accountingYear}</h2>
                <p className="text-sm text-slate-500 font-mono">Objekt: {property.name} • {property.address}</p>
             </div>
             {/* Bank Recon Widget */}
             <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex items-center gap-4">
                 <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">Zahlungseingang Dez. {accountingYear}</div>
                    <div className="text-sm font-medium text-slate-900">
                        {getFormattedPrice(totalReceived)} <span className="text-slate-400">/ {getFormattedPrice(totalExpected)}</span>
                    </div>
                 </div>
                 <div className="w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center relative">
                     <span className={`text-xs font-bold ${paymentHealth < 100 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {Math.round(paymentHealth)}%
                     </span>
                     <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                        <path 
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                            fill="none" 
                            stroke={paymentHealth < 100 ? '#d97706' : '#059669'} 
                            strokeWidth="3" 
                            strokeDasharray={`${paymentHealth}, 100`} 
                        />
                     </svg>
                 </div>
             </div>
        </div>

        {/* Dense Data Grid */}
        <div className="bg-white border border-slate-300 rounded shadow-sm flex-1 overflow-auto relative">
            <table className="w-full text-sm border-collapse">
                <thead className="bg-slate-100 text-slate-600 sticky top-0 z-10 font-semibold text-xs shadow-sm">
                    <tr>
                        <th className="border-b border-r border-slate-300 px-3 py-2 text-left w-16">#</th>
                        <th className="border-b border-r border-slate-300 px-3 py-2 text-left w-32">Lage / Typ</th>
                        <th className="border-b border-r border-slate-300 px-3 py-2 text-left w-32">Fläche / Pers</th>
                        <th className="border-b border-r border-slate-300 px-3 py-2 text-left">Mieter / Status</th>
                        <th className="border-b border-r border-slate-300 px-3 py-2 text-left w-32">Vertrag</th>
                        
                        {/* Financials Group */}
                        <th className="border-b border-r border-slate-300 px-3 py-2 text-right bg-indigo-50/50 w-24">Kaltmiete</th>
                        <th className="border-b border-r border-slate-300 px-3 py-2 text-right bg-indigo-50/50 w-24">Stellplatz</th>
                        <th className="border-b border-r border-slate-300 px-3 py-2 text-right bg-indigo-50/50 w-24">BK-VZ</th>
                        <th className="border-b border-slate-300 px-3 py-2 text-right bg-indigo-100/50 font-bold w-28">Gesamt</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {rows.map((row, idx) => (
                        <tr key={row.unit.id} className="hover:bg-blue-50/30 group transition-colors">
                            {/* 1. Unit ID/Code */}
                            <td className="px-3 py-2 border-r border-slate-200 font-mono text-slate-500 text-xs">
                                {row.unit.location_code || idx + 1}
                            </td>

                            {/* 2. Lage / Typ */}
                            <td className="px-3 py-2 border-r border-slate-200">
                                <div className="font-medium text-slate-900">{row.unit.name}</div>
                                <div className="text-xs text-slate-500">{row.unit.room_count ? `${row.unit.room_count} Zi.` : '-'}</div>
                            </td>

                            {/* 3. Fläche / Personen */}
                            <td className="px-3 py-2 border-r border-slate-200">
                                <div className="font-medium">{row.unit.sq_meter} m²</div>
                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                    <User size={10} /> {row.personCount} Pers.
                                </div>
                            </td>

                            {/* 4. Mieter */}
                            <td className="px-3 py-2 border-r border-slate-200 relative">
                                {row.tenant ? (
                                    <div className="group/tenant relative">
                                        <div className="font-medium text-slate-900 flex items-center gap-2">
                                            {row.tenant.name}
                                            <History size={12} className="text-slate-300 group-hover/tenant:text-indigo-500 cursor-help" />
                                        </div>
                                        <div className="text-xs text-slate-500">Kd-Nr: {row.tenancy?.customer_id || '-'}</div>
                                        
                                        {/* Hover History Tooltip */}
                                        <div className="absolute left-0 top-full mt-1 bg-slate-800 text-white text-xs p-2 rounded shadow-xl opacity-0 group-hover/tenant:opacity-100 pointer-events-none z-20 w-48">
                                            <div className="font-bold border-b border-slate-600 mb-1 pb-1">Vertragshistorie</div>
                                            <div>Start: {row.tenancy?.start_date}</div>
                                            <div className="text-slate-400 mt-1">Keine weiteren Änderungen</div>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-slate-400 italic text-sm">Leerstand</span>
                                )}
                            </td>

                            {/* 5. Zeitraum */}
                            <td className="px-3 py-2 border-r border-slate-200">
                                {row.tenancy ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <span className="text-xs font-mono">
                                            {new Date(row.tenancy.start_date).toLocaleDateString('de-DE', {year:'2-digit', month:'2-digit'})} - ...
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                        <span className="text-xs text-red-500 font-medium">Leer</span>
                                    </div>
                                )}
                            </td>

                            {/* 6. Financials (Editable-ish) */}
                            <td className="px-3 py-2 border-r border-slate-200 text-right font-mono text-slate-700 bg-slate-50/30">
                                {getFormattedPrice(row.rent.base_rent)}
                            </td>
                            <td className="px-3 py-2 border-r border-slate-200 text-right font-mono text-slate-700 bg-slate-50/30">
                                {row.rent.parking_rent > 0 ? getFormattedPrice(row.rent.parking_rent) : '-'}
                            </td>
                            <td className="px-3 py-2 border-r border-slate-200 text-right font-mono text-slate-700 bg-slate-50/30">
                                {getFormattedPrice(row.rent.prepayment)}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 bg-indigo-50/30 relative group/edit">
                                {getFormattedPrice(row.rent.base_rent + row.rent.parking_rent + row.rent.prepayment)}
                                
                                {/* Edit Action */}
                                {row.tenancy && (
                                    <button 
                                        onClick={() => setAdjustmentModal({ open: true, tenancyId: row.tenancy!.id, currentRent: row.rent })}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-indigo-400 hover:text-indigo-600 hover:bg-white rounded shadow-sm opacity-0 group-hover/edit:opacity-100 transition-all"
                                        title="Mietanpassung (Staffel/Erhöhung)"
                                    >
                                        <TrendingUp size={14} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
                
                {/* Sticky Footer */}
                <tfoot className="bg-slate-800 text-white sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] text-xs font-medium uppercase tracking-wide">
                    <tr>
                        <td colSpan={2} className="px-3 py-3 border-r border-slate-700 text-right">Summen:</td>
                        <td className="px-3 py-3 border-r border-slate-700">{totalSqm} m²</td>
                        <td colSpan={2} className="px-3 py-3 border-r border-slate-700 text-right">Monatlicher Soll-Umsatz:</td>
                        <td className="px-3 py-3 border-r border-slate-700 text-right font-mono text-emerald-300">{getFormattedPrice(totalBaseRent)}</td>
                        <td className="px-3 py-3 border-r border-slate-700 text-right font-mono text-emerald-300">{getFormattedPrice(totalParking)}</td>
                        <td className="px-3 py-3 border-r border-slate-700 text-right font-mono text-emerald-300">{getFormattedPrice(totalPrepay)}</td>
                        <td className="px-3 py-3 text-right font-mono text-white text-sm font-bold">{getFormattedPrice(totalMonthly)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        {/* Modal */}
        <RentAdjustmentModal 
            isOpen={adjustmentModal.open} 
            onClose={() => setAdjustmentModal({ ...adjustmentModal, open: false })}
            tenancyId={adjustmentModal.tenancyId}
            currentRent={adjustmentModal.currentRent}
        />
    </div>
  );
};
