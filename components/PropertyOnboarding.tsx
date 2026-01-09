
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { 
  Building2, ArrowRight, ArrowLeft, Check, X, AlertTriangle, Plus, Trash2, Users, Scale, Home, PenLine, FileCheck, Ban, UserCheck, ShieldCheck, Mail, Euro, Split, Briefcase
} from 'lucide-react';
import { AllocationKey, UsageType, WizardDraftUnit, WizardDraftTenant } from '../types';

// --- PROGRESS CALCULATION ENGINE ---
const useOnboardingProgress = () => {
    const { draftProperty, draftUnits, draftTenants, wizardStep } = useAppStore();

    return useMemo(() => {
        let points = 0;
        if (draftProperty.name.trim().length > 0) points += 6;
        if (draftProperty.address.trim().length > 0) points += 6;
        if (draftProperty.total_sqm > 0) points += 6;
        if (draftUnits.length > 0) points += 7;
        if (wizardStep >= 2) points += 25;
        if (draftUnits.length > 0) {
            const currentSqmSum = draftUnits.reduce((acc, u) => acc + u.sq_meter, 0);
            const sqmRatio = draftProperty.total_sqm > 0 ? Math.min(1, currentSqmSum / draftProperty.total_sqm) : 0;
            if (currentSqmSum > 0) points += Math.floor(sqmRatio * 25);
        }
        if (draftUnits.length > 0) {
            const documentedCount = draftUnits.filter(u => draftTenants.some(t => t.unitTempId === u.tempId)).length;
            const docRatio = documentedCount / draftUnits.length;
            points += Math.floor(docRatio * 25);
        }
        return Math.min(100, points);
    }, [draftProperty, draftUnits, draftTenants, wizardStep]);
};

// --- STEP 1: BASICS ---
const StepBasics: React.FC = () => {
    const { draftProperty, updateDraftProperty, generateDraftUnits, draftUnits, t } = useAppStore();
    const [unitCount, setUnitCount] = useState<number | string>(draftUnits.length || '');

    const handleUnitCountChange = (val: string) => {
        if (Number(val) > 100) val = "100";
        setUnitCount(val);
        const count = parseInt(val);
        if (!isNaN(count) && count > 0 && draftProperty.total_sqm > 0) {
            generateDraftUnits(count, draftProperty.total_sqm, UsageType.RESIDENTIAL);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 p-8 max-w-2xl mx-auto">
             <div className="flex items-start gap-4 p-6 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100 shrink-0">
                    <Building2 size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{t('wizard.basics.title')}</h3>
                    <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{t('wizard.basics.desc')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('wizard.basics.name')} *</label>
                    <input 
                        type="text" 
                        value={draftProperty.name}
                        onChange={(e) => updateDraftProperty({ name: e.target.value })}
                        placeholder={t('wizard.basics.placeholderName')}
                        className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-slate-300"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('wizard.basics.address')}</label>
                    <input 
                        type="text" 
                        value={draftProperty.address}
                        onChange={(e) => updateDraftProperty({ address: e.target.value })}
                        placeholder={t('wizard.basics.placeholderAddress')}
                        className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-slate-300"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('wizard.basics.sqm')} *</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={draftProperty.total_sqm || ''}
                            onChange={(e) => updateDraftProperty({ total_sqm: Number(e.target.value) })}
                            placeholder="0.00"
                            className="w-full pl-4 pr-12 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none">m²</span>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('wizard.basics.unitCount')} *</label>
                    <input 
                        type="number" 
                        max="100"
                        value={unitCount}
                        onChange={(e) => handleUnitCountChange(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold"
                    />
                </div>
            </div>
        </div>
    );
};

// --- STEP 2: RULES ---
const StepRules: React.FC = () => {
    const { draftProperty, updateDraftProperty, t } = useAppStore();
    const groups = [
        { title: t('wizard.rules.infra'), icon: <Building2 size={16} />, keys: ["Grundsteuer", "Wasserversorgung", "Entwässerung", "Straßenreinigung/Müll"] },
        { title: t('wizard.rules.service'), icon: <Users size={16} />, keys: ["Hauswart", "Gebäudereinigung", "Gartenpflege", "Aufzug", "Schornsteinreinigung"] },
        { title: t('wizard.rules.other'), icon: <Scale size={16} />, keys: ["Beleuchtung", "Versicherung", "TV/Kabel", "Verwaltungskosten", "Sonstige"] }
    ];

    const handleKeyChange = (expenseName: string, key: AllocationKey) => {
        updateDraftProperty({ defaultKeys: { ...draftProperty.defaultKeys, [expenseName]: key } });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-8 max-w-4xl mx-auto">
            <div className="p-8 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-100 mb-4 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-bold">{t('wizard.rules.title')}</h3>
                    <p className="text-indigo-100 text-sm mt-2 leading-relaxed max-w-lg">{t('wizard.rules.desc')}</p>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Scale size={120} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-indigo-400 transition-colors">
                        <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center gap-3 font-bold text-slate-800 text-sm">
                            <span className="text-indigo-600">{group.icon}</span> {group.title}
                        </div>
                        <div className="p-5 space-y-4">
                            {group.keys.map(k => (
                                <div key={k} className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">
                                        {t(`expenseTypes.${k}`) || k}
                                    </label>
                                    <select 
                                        className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                                        value={draftProperty.defaultKeys?.[k] || AllocationKey.AREA}
                                        onChange={(e) => handleKeyChange(k, e.target.value as AllocationKey)}
                                    >
                                        <option value={AllocationKey.AREA}>{t('common.area')}</option>
                                        <option value={AllocationKey.PERSONS}>{t('common.persons')}</option>
                                        <option value={AllocationKey.UNITS}>{t('common.units')}</option>
                                        <option value={AllocationKey.DIRECT}>{t('common.direct')}</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- STEP 3: UNITS ---
const StepUnits: React.FC = () => {
    const { draftProperty, draftUnits, addDraftUnit, updateDraftUnit, removeDraftUnit, t } = useAppStore();
    const currentSqmSum = draftUnits.reduce((acc, u) => acc + u.sq_meter, 0);
    const targetSqm = draftProperty.total_sqm;
    const progress = Math.min(100, Math.round((currentSqmSum / (targetSqm || 1)) * 100));
    const diff = targetSqm - currentSqmSum;

    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto">
            <div className="sticky top-0 z-20 bg-white border-b border-slate-100 p-8 pb-6">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('wizard.units.title')}</span>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">
                            {currentSqmSum.toFixed(2)} <span className="text-base font-medium text-slate-300">/ {targetSqm} m²</span>
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all ${diff === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
                        {diff === 0 ? t('wizard.units.areaDistributed') : `${diff.toFixed(2)} ${t('wizard.units.areaRemaining')}`}
                    </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ease-out shadow-sm ${diff === 0 ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${progress}%` }} />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-4 pb-20">
                {draftUnits.map((unit) => (
                    <div key={unit.tempId} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-5 border border-slate-200 rounded-2xl hover:border-indigo-400 transition-all shadow-sm group">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shrink-0">
                            {unit.name.match(/\d+/) || '#'}
                        </div>
                        <div className="flex-1 space-y-3">
                            <input 
                                className="w-full font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-200 text-lg"
                                placeholder={t('wizard.units.placeholderName')}
                                value={unit.name} 
                                onChange={(e) => updateDraftUnit(unit.tempId, { name: e.target.value })} 
                            />
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => updateDraftUnit(unit.tempId, { usage_type: UsageType.RESIDENTIAL })}
                                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${unit.usage_type === UsageType.RESIDENTIAL ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                >
                                    <Home size={14}/> {t('wizard.units.residential')}
                                </button>
                                <button 
                                    onClick={() => updateDraftUnit(unit.tempId, { usage_type: UsageType.COMMERCIAL })}
                                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${unit.usage_type === UsageType.COMMERCIAL ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                >
                                    <Briefcase size={14}/> {t('wizard.units.commercial')}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 sm:mt-0">
                            <div className="relative flex-1 sm:w-32">
                                <input 
                                    type="number" 
                                    className="w-full pr-10 pl-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold text-sm text-right focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                                    value={unit.sq_meter || ''} 
                                    onChange={(e) => updateDraftUnit(unit.tempId, { sq_meter: Number(e.target.value) })} 
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest pointer-events-none">m²</span>
                            </div>
                            <button onClick={() => removeDraftUnit(unit.tempId)} className="p-3 text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-xl transition-all shrink-0">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
                <button 
                    onClick={() => addDraftUnit({ tempId: Math.random().toString(36).substr(2, 9), name: `${t('wizard.units.residential')} ${draftUnits.length + 1}`, sq_meter: 0, keys: 1, usage_type: UsageType.RESIDENTIAL })} 
                    className="w-full py-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition-all font-bold flex items-center justify-center gap-3"
                >
                    <Plus size={24} /> {t('wizard.units.addUnit')}
                </button>
            </div>
        </div>
    );
};

// --- STEP 4: MANDATORY TENANT DOCUMENTATION ---
const StepTenants: React.FC = () => {
    const { draftUnits, draftTenants, addDraftTenant, t } = useAppStore();
    const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

    const [isVacant, setIsVacant] = useState(false);
    const [tName, setTName] = useState('');
    const [tEmail, setTEmail] = useState('');
    const [tStart, setTStart] = useState('2024-01-01');
    const [tPrepay, setTPrepay] = useState(0);
    const [tResidents, setTResidents] = useState<string[]>([]);
    const [newResident, setNewResident] = useState('');

    const openForm = (unit: WizardDraftUnit) => {
        const existing = draftTenants.find(t => t.unitTempId === unit.tempId);
        setActiveUnitId(unit.tempId);
        if (existing) {
            setIsVacant(existing.isVacant);
            setTName(existing.name);
            setTEmail(existing.email);
            setTStart(existing.startDate);
            setTPrepay(existing.prepayment);
            setTResidents(existing.occupantNames ? existing.occupantNames.split(', ') : []);
        } else {
            setIsVacant(false); setTName(''); setTEmail(''); setTStart('2024-01-01'); setTPrepay(0); setTResidents([]);
        }
    };

    const handleSave = () => {
        if (!activeUnitId) return;
        addDraftTenant({
            tempId: Math.random().toString(36).substr(2, 9),
            unitTempId: activeUnitId,
            isVacant,
            name: isVacant ? t('wizard.tenants.vacant') : tName,
            email: isVacant ? '' : tEmail,
            startDate: tStart,
            prepayment: isVacant ? 0 : tPrepay,
            occupantNames: tResidents.join(', '),
            personCount: isVacant ? 0 : Math.max(1, tResidents.length)
        });
        setActiveUnitId(null);
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 max-w-4xl mx-auto">
            <div className="p-8 border-b border-slate-200 bg-white">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <ShieldCheck className="text-indigo-600" size={28} /> {t('wizard.tenants.title')}
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{t('wizard.tenants.desc')}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4 pb-20">
                {draftUnits.map(unit => {
                    const doc = draftTenants.find(t => t.unitTempId === unit.tempId);
                    const isFormOpen = activeUnitId === unit.tempId;

                    if (isFormOpen) {
                        return (
                            <div key={unit.tempId} className="bg-white border-2 border-indigo-600 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-400">
                                <div className="flex justify-between items-center mb-8">
                                    <h4 className="text-xl font-black text-slate-900">{t('wizard.tenants.formTitle')}: {unit.name}</h4>
                                    <button onClick={() => setActiveUnitId(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
                                </div>

                                <div className="flex gap-2 mb-10 p-1.5 bg-slate-100 rounded-2xl">
                                    <button onClick={() => setIsVacant(false)} className={`flex-1 py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${!isVacant ? 'bg-white text-indigo-700 shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>
                                        <UserCheck size={20}/> {t('wizard.tenants.rented')}
                                    </button>
                                    <button onClick={() => setIsVacant(true)} className={`flex-1 py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${isVacant ? 'bg-white text-red-700 shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>
                                        <Ban size={20}/> {t('wizard.tenants.vacant')}
                                    </button>
                                </div>

                                {!isVacant ? (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('wizard.tenants.partner')} *</label>
                                                <input value={tName} onChange={e => setTName(e.target.value)} className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('wizard.tenants.email')}</label>
                                                <input type="email" value={tEmail} onChange={e => setTEmail(e.target.value)} className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('wizard.tenants.startDate')}</label>
                                                <input type="date" value={tStart} onChange={e => setTStart(e.target.value)} className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('wizard.tenants.prepayment')}</label>
                                                <input type="number" value={tPrepay} onChange={e => setTPrepay(Number(e.target.value))} className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-black text-xl focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 block">{t('wizard.tenants.occupants')} ({tResidents.length})</label>
                                            <div className="flex flex-wrap gap-3 mb-6">
                                                {tResidents.map((r, i) => (
                                                    <span key={i} className="bg-white border border-slate-200 text-slate-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
                                                        {r} <button onClick={() => setTResidents(tResidents.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500"><X size={14}/></button>
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input 
                                                    value={newResident} 
                                                    onChange={e => setNewResident(e.target.value)} 
                                                    onKeyPress={e => e.key === 'Enter' && newResident && (setTResidents([...tResidents, newResident]), setNewResident(''))} 
                                                    className="flex-1 px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 outline-none" 
                                                    placeholder={t('wizard.tenants.placeholderOccupant')} 
                                                />
                                                <button onClick={() => {if(newResident){setTResidents([...tResidents, newResident]); setNewResident('');}}} className="bg-slate-900 text-white px-6 rounded-xl text-xs font-black hover:bg-slate-800 transition-colors shadow-lg">{t('wizard.tenants.addOccupant')}</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-16 text-center bg-red-50/50 rounded-3xl border border-dashed border-red-200">
                                        <Ban className="mx-auto text-red-300 mb-4" size={48} />
                                        <h4 className="font-black text-red-900 text-lg">{t('wizard.tenants.vacant')}</h4>
                                        <p className="text-sm text-red-700 mt-2 max-w-sm mx-auto leading-relaxed">{t('wizard.tenants.vacantDesc')}</p>
                                    </div>
                                )}
                                <button onClick={handleSave} disabled={!isVacant && (!tName || tResidents.length === 0)} className="w-full mt-10 bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl active:scale-[0.98]">
                                    {t('wizard.tenants.saveDoc')}
                                </button>
                            </div>
                        );
                    }

                    return (
                        <div key={unit.tempId} onClick={() => openForm(unit)} className={`p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${doc ? 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm' : 'bg-slate-50 border-slate-200 border-dashed hover:bg-white hover:border-indigo-400'}`}>
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all ${doc ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-50' : 'bg-slate-200 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-400'}`}>
                                    {unit.name.match(/\d+/) || '#'}
                                </div>
                                <div>
                                    <div className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{unit.name}</div>
                                    <div className="text-xs text-slate-400 font-bold tracking-wide flex items-center gap-2">
                                        {unit.sq_meter} m² <span className="text-slate-200">•</span> {unit.usage_type === UsageType.COMMERCIAL ? t('wizard.units.commercial') : t('wizard.units.residential')}
                                    </div>
                                </div>
                            </div>
                            
                            {doc ? (
                                <div className="text-right flex items-center gap-6">
                                    <div className="hidden sm:block">
                                        <div className={`text-[10px] font-black px-3 py-1 rounded-full inline-block tracking-widest uppercase mb-1 shadow-sm ${doc.isVacant ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                                            {doc.isVacant ? t('wizard.tenants.vacant') : t('wizard.tenants.documented')}
                                        </div>
                                        {!doc.isVacant && <div className="text-sm font-black text-slate-900">{doc.name}</div>}
                                    </div>
                                    <PenLine className="text-slate-300 group-hover:text-indigo-600 transition-colors" size={24} />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-indigo-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                    {t('wizard.tenants.missingDoc')} <ArrowRight size={20} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- MAIN WIZARD ---
export const PropertyOnboarding: React.FC = () => {
    const { isWizardOpen, wizardStep, closeWizard, setWizardStep, commitWizardData, draftProperty, draftUnits, draftTenants, t } = useAppStore();
    const [error, setError] = useState<string | null>(null);
    const progress = useOnboardingProgress();

    if (!isWizardOpen) return null;

    const currentSqmSum = draftUnits.reduce((acc, u) => acc + u.sq_meter, 0);
    const isStep3Valid = Math.abs(currentSqmSum - draftProperty.total_sqm) < 0.1;
    const allUnitsMinArea = draftUnits.every(u => u.sq_meter >= 1);
    const allUnitsDocumented = draftUnits.length > 0 && draftUnits.every(u => draftTenants.some(t => t.unitTempId === u.tempId));

    const handleNext = () => {
        setError(null);
        if (wizardStep === 1) {
            if (!draftProperty.name || draftProperty.total_sqm <= 0 || draftUnits.length === 0) {
                setError(t('wizard.errors.fillRequired')); return;
            }
        }
        if (wizardStep === 3) {
            if (!isStep3Valid) {
                setError(t('wizard.errors.sqmMismatch')); return;
            }
            if (!allUnitsMinArea) {
                setError(t('wizard.errors.unitAreaMin')); return;
            }
        }
        if (wizardStep === 4) {
            if (!allUnitsDocumented) {
                setError(t('wizard.errors.documentAll')); return;
            }
            commitWizardData(); return;
        }
        setWizardStep(wizardStep + 1);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-0 sm:p-4 overflow-hidden">
            <div className="bg-white w-full max-w-5xl flex flex-col h-full sm:h-[90vh] sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
                <div className="p-8 sm:p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-white z-20 gap-8">
                    <div className="flex-1 w-full">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">{t('wizard.title')}</h2>
                                <p className="text-slate-400 font-bold text-xs sm:text-sm">{t('wizard.step')} {wizardStep} {t('wizard.of')} 4</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-2xl font-black transition-all duration-700 ${progress === 100 ? 'text-emerald-500 scale-110' : 'text-indigo-600'}`}>
                                    {progress}%
                                </span>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t('wizard.progress')}</span>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 transition-all duration-700 ease-out shadow-lg" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                    <button onClick={closeWizard} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all absolute top-4 right-4 md:static"><X size={28}/></button>
                </div>

                <div className="px-8 sm:px-10 py-4 bg-slate-50 border-b border-slate-100 flex gap-4 overflow-x-auto no-scrollbar scroll-smooth">
                    {[
                        { s: 1, l: t('wizard.basics.title'), icon: <Home size={14}/> },
                        { s: 2, l: t('wizard.rules.title'), icon: <Scale size={14}/> },
                        { s: 3, l: t('wizard.units.title'), icon: <Split size={14}/> },
                        { s: 4, l: t('wizard.tenants.title'), icon: <Users size={14}/> }
                    ].map((step) => (
                        <div 
                            key={step.s}
                            className={`flex items-center gap-3 px-5 py-2.5 rounded-xl whitespace-nowrap transition-all ${wizardStep === step.s ? 'bg-white shadow-md ring-1 ring-slate-200 text-slate-900 font-black scale-105' : 'text-slate-400 font-bold opacity-60'}`}
                        >
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black transition-colors ${wizardStep >= step.s ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                {wizardStep > step.s ? <Check size={12} strokeWidth={4}/> : step.s}
                            </span>
                            <span className="text-[11px] uppercase tracking-wider">{step.l}</span>
                        </div>
                    ))}
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto custom-scroll-container bg-white">
                    {wizardStep === 1 && <StepBasics />}
                    {wizardStep === 2 && <StepRules />}
                    {wizardStep === 3 && <StepUnits />}
                    {wizardStep === 4 && <StepTenants />}
                </div>

                <div className="p-8 sm:p-10 border-t border-slate-100 flex justify-between items-center bg-white shadow-2xl">
                    <button onClick={() => setWizardStep(wizardStep - 1)} disabled={wizardStep === 1} className="flex items-center gap-3 font-black text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all active:scale-95">
                        <ArrowLeft size={20}/> {t('wizard.back')}
                    </button>
                    {error && (
                        <div className="hidden lg:flex bg-red-50 text-red-600 px-6 py-2 rounded-2xl font-black text-xs items-center gap-3 border border-red-100 animate-in slide-in-from-bottom-2">
                            <AlertTriangle size={18}/> {error}
                        </div>
                    )}
                    <button onClick={handleNext} className={`px-12 py-4.5 rounded-2xl font-black flex items-center gap-3 transition-all active:scale-95 shadow-xl ${wizardStep === 4 && !allUnitsDocumented ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-100'}`}>
                        {wizardStep === 4 ? <><FileCheck size={24}/> {t('wizard.finish')}</> : <><ArrowRight size={24}/> {t('wizard.next')}</>}
                    </button>
                </div>
            </div>
            <style>{`
                .custom-scroll-container::-webkit-scrollbar { width: 6px; }
                .custom-scroll-container::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll-container::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};
