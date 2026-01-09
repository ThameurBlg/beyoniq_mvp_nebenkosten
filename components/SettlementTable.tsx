import React, { useState } from 'react';
import { TenantSettlement } from '../types';
import { useAppStore } from '../store';
import { ChevronRight, ChevronDown, Euro, AlertCircle } from 'lucide-react';

interface Props {
  data: TenantSettlement[];
}

const TenantRow: React.FC<{ tenant: TenantSettlement }> = ({ tenant }) => {
  const [expanded, setExpanded] = useState(false);
  const { getFormattedPrice } = useAppStore();

  const isDebt = tenant.balance > 0;
  const balanceColor = isDebt ? 'text-destructive' : 'text-emerald-600';

  return (
    <div className="border-b border-slate-100 last:border-0">
      <div 
        onClick={() => setExpanded(!expanded)}
        className={`grid grid-cols-12 gap-4 p-4 items-center cursor-pointer transition-colors hover:bg-slate-50 ${expanded ? 'bg-slate-50' : ''}`}
      >
        <div className="col-span-3 flex items-center gap-2">
            <button className="text-slate-400 hover:text-slate-600">
                {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            <div className="font-medium text-slate-900">{tenant.tenantName}</div>
        </div>
        <div className="col-span-2 text-sm text-slate-500">{tenant.unitName}</div>
        <div className="col-span-2 text-sm text-right font-medium text-slate-700">
            {getFormattedPrice(tenant.totalShare)}
        </div>
        <div className="col-span-2 text-sm text-right text-slate-500">
            {getFormattedPrice(tenant.prepaymentsPaid)}
        </div>
        <div className={`col-span-3 text-right font-bold ${balanceColor} flex items-center justify-end gap-2`}>
            {isDebt ? 'Nachzahlung' : 'Guthaben'}: {getFormattedPrice(Math.abs(tenant.balance))}
            {isDebt && <AlertCircle size={16} />}
        </div>
      </div>

      {expanded && (
        <div className="bg-slate-50/50 p-4 pl-12 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Detaillierte Kostenaufstellung ({tenant.daysOccupied} Nutzungstage)
            </div>
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-200">
                        <th className="pb-2 font-medium">Kostenart</th>
                        <th className="pb-2 font-medium">Gesamtrechnung</th>
                        <th className="pb-2 font-medium">Umlageschlüssel</th>
                        <th className="pb-2 font-medium">Berechnung</th>
                        <th className="pb-2 font-medium text-right">Ihr Anteil</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {tenant.details.map((detail, idx) => (
                        <tr key={idx} className="group hover:bg-white/50">
                            <td className="py-2 text-slate-700 font-medium">{detail.expenseName}</td>
                            <td className="py-2 text-slate-500">{getFormattedPrice(detail.totalBill)}</td>
                            <td className="py-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                                    {detail.allocationKey}
                                </span>
                            </td>
                            <td className="py-2 text-slate-500 font-mono text-xs">{detail.formula}</td>
                            <td className="py-2 text-right font-medium text-slate-900">{getFormattedPrice(detail.yourShare)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export const SettlementTable: React.FC<Props> = ({ data }) => {
  if (data.length === 0) {
      return <div className="p-8 text-center text-slate-400">Keine Daten für diesen Zeitraum.</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">Mieter</div>
            <div className="col-span-2">Einheit</div>
            <div className="col-span-2 text-right">Anteil Gesamt</div>
            <div className="col-span-2 text-right">Vorauszahlungen</div>
            <div className="col-span-3 text-right">Saldo</div>
        </div>
        <div>
            {data.map(t => <TenantRow key={t.tenantId} tenant={t} />)}
        </div>
    </div>
  );
};