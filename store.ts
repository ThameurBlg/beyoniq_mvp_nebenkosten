
import { create } from 'zustand';
import { Property, Unit, Tenant, Tenancy, Expense, AllocationKey, OccupancyHistory, UsageType, WizardDraftProperty, WizardDraftUnit, WizardDraftTenant, ContractAmendment, Payment } from './types';
import { Language, translations } from './translations';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
  accountingYear: number;
  setAccountingYear: (year: number) => void;
  properties: Property[];
  units: Unit[];
  tenants: Tenant[];
  tenancies: Tenancy[];
  occupancyHistory: OccupancyHistory[];
  expenses: Expense[];
  contractAmendments: ContractAmendment[];
  payments: Payment[];
  selectedPropertyId: string | null;
  isWizardOpen: boolean;
  wizardStep: number;
  draftProperty: WizardDraftProperty;
  draftUnits: WizardDraftUnit[];
  draftTenants: WizardDraftTenant[];
  selectProperty: (id: string) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  removeProperty: (id: string) => void;
  addUnit: (unit: Unit) => void; 
  updateUnit: (id: string, updates: Partial<Unit>) => void;
  removeUnit: (id: string) => void;
  addTenant: (tenant: Tenant) => void;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;
  removeTenant: (id: string) => void;
  updateTenancy: (id: string, updates: Partial<Tenancy>) => void;
  adjustRent: (tenancyId: string, validFrom: string, baseRent: number, parkingRent: number, prepayment: number) => void;
  getCurrentRent: (tenancyId: string) => ContractAmendment | undefined;
  addOccupancyPeriod: (period: OccupancyHistory) => void;
  removeOccupancyPeriod: (id: string) => void;
  updateOccupancyPeriod: (id: string, updates: Partial<OccupancyHistory>) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  getFormattedPrice: (cents: number) => string;
  openWizard: () => void;
  closeWizard: () => void;
  setWizardStep: (step: number) => void;
  updateDraftProperty: (updates: Partial<WizardDraftProperty>) => void;
  generateDraftUnits: (count: number, totalSqm: number, type?: UsageType) => void;
  addDraftUnit: (unit: WizardDraftUnit) => void;
  updateDraftUnit: (tempId: string, updates: Partial<WizardDraftUnit>) => void;
  removeDraftUnit: (tempId: string) => void;
  addDraftTenant: (tenant: WizardDraftTenant) => void;
  removeDraftTenant: (unitTempId: string) => void;
  commitWizardData: () => void;
}

const INITIAL_DRAFT_PROPERTY: WizardDraftProperty = {
  name: '', address: '', total_sqm: 0, defaultKeys: {}
};

export const useAppStore = create<AppState>((set, get) => ({
  language: 'de',
  setLanguage: (lang) => set({ language: lang }),
  t: (path) => {
    const lang = get().language;
    const parts = path.split('.');
    let obj: any = translations[lang];
    for (const part of parts) {
      if (obj[part] === undefined) return path;
      obj = obj[part];
    }
    return obj;
  },
  accountingYear: 2026,
  setAccountingYear: (year) => set({ accountingYear: year }),
  properties: [],
  units: [],
  tenants: [],
  tenancies: [],
  occupancyHistory: [],
  expenses: [],
  contractAmendments: [],
  payments: [],
  selectedPropertyId: null,
  isWizardOpen: false,
  wizardStep: 1,
  draftProperty: INITIAL_DRAFT_PROPERTY,
  draftUnits: [],
  draftTenants: [],

  selectProperty: (id) => set({ selectedPropertyId: id }),
  addProperty: (property) => set((state) => ({ properties: [...state.properties, property] })),
  updateProperty: (id, updates) => set((state) => ({ properties: state.properties.map(p => p.id === id ? { ...p, ...updates } : p) })),
  removeProperty: (id) => set((state) => {
    const nextProperties = state.properties.filter(p => p.id !== id);
    return { 
        properties: nextProperties,
        units: state.units.filter(u => u.property_id !== id),
        expenses: state.expenses.filter(e => e.property_id !== id),
        selectedPropertyId: state.selectedPropertyId === id ? (nextProperties[0]?.id || null) : state.selectedPropertyId
    };
  }),

  addUnit: (unit) => set((state) => ({ units: [...state.units, unit] })),
  updateUnit: (id, updates) => set((state) => ({ units: state.units.map(u => u.id === id ? { ...u, ...updates } : u) })),
  removeUnit: (id) => set((state) => ({ units: state.units.filter(u => u.id !== id) })),
  addTenant: (tenant) => set((state) => ({ tenants: [...state.tenants, tenant] })),
  updateTenant: (id, updates) => set((state) => ({ tenants: state.tenants.map(t => t.id === id ? { ...t, ...updates } : t) })),
  removeTenant: (id) => set((state) => ({ tenants: state.tenants.filter(t => t.id !== id) })),
  updateTenancy: (id, updates) => set((state) => ({ tenancies: state.tenancies.map(t => t.id === id ? { ...t, ...updates } : t) })),

  adjustRent: (tenancyId, validFrom, baseRent, parkingRent, prepayment) => set((state) => ({
    contractAmendments: [...state.contractAmendments, {
      id: Math.random().toString(36).substr(2, 9),
      tenancy_id: tenancyId,
      valid_from: validFrom,
      base_rent: baseRent,
      parking_rent: parkingRent,
      prepayment: prepayment
    }]
  })),

  getCurrentRent: (tenancyId) => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];
    const amendments = state.contractAmendments
      .filter(a => a.tenancy_id === tenancyId)
      .sort((a, b) => new Date(b.valid_from).getTime() - new Date(a.valid_from).getTime());
    return amendments.find(a => a.valid_from <= today) || amendments[0]; 
  },
  
  addOccupancyPeriod: (period) => set((state) => ({ occupancyHistory: [...state.occupancyHistory, period] })),
  removeOccupancyPeriod: (id) => set((state) => ({ occupancyHistory: state.occupancyHistory.filter(o => o.id !== id) })),
  updateOccupancyPeriod: (id, updates) => set((state) => ({ occupancyHistory: state.occupancyHistory.map(o => o.id === id ? { ...o, ...updates } : o) })),
  addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
  updateExpense: (id, updates) => set((state) => ({ expenses: state.expenses.map(e => e.id === id ? { ...e, ...updates } : e) })),
  removeExpense: (id) => set((state) => ({ expenses: state.expenses.filter(e => e.id !== id) })),
  getFormattedPrice: (cents) => new Intl.NumberFormat(get().language === 'de' ? 'de-DE' : 'en-US', { style: 'currency', currency: 'EUR' }).format(cents / 100),

  openWizard: () => set({ isWizardOpen: true, wizardStep: 1 }),
  closeWizard: () => set({ isWizardOpen: false }),
  setWizardStep: (step) => set({ wizardStep: step }),
  updateDraftProperty: (updates) => set((state) => ({ draftProperty: { ...state.draftProperty, ...updates } })),
  generateDraftUnits: (count, totalSqm, type = UsageType.RESIDENTIAL) => {
    const safeCount = Math.min(Math.max(1, count), 100);
    const units: WizardDraftUnit[] = [];
    for (let i = 0; i < safeCount; i++) {
        units.push({
            tempId: Math.random().toString(36).substr(2, 9),
            name: `${get().language === 'de' ? 'Einheit' : 'Unit'} ${i + 1}`,
            sq_meter: 0, keys: 1, 
            usage_type: type
        });
    }
    set({ draftUnits: units });
  },
  addDraftUnit: (unit) => set((state) => ({ draftUnits: [...state.draftUnits, unit] })),
  updateDraftUnit: (tempId, updates) => set((state) => ({ draftUnits: state.draftUnits.map(u => u.tempId === tempId ? { ...u, ...updates } : u) })),
  removeDraftUnit: (tempId) => set((state) => ({ 
    draftUnits: state.draftUnits.filter(u => u.tempId !== tempId),
    draftTenants: state.draftTenants.filter(t => t.unitTempId !== tempId)
  })),
  addDraftTenant: (tenant) => set((state) => {
    const filtered = state.draftTenants.filter(t => t.unitTempId !== tenant.unitTempId);
    return { draftTenants: [...filtered, tenant] };
  }),
  removeDraftTenant: (unitTempId) => set((state) => ({ draftTenants: state.draftTenants.filter(t => t.unitTempId !== unitTempId) })),
  commitWizardData: () => set((state) => {
    const newPropId = Math.random().toString(36).substr(2, 9);
    const newProperty: Property = {
        id: newPropId,
        name: state.draftProperty.name,
        address: state.draftProperty.address,
        total_sqm: state.draftProperty.total_sqm,
        default_keys: { ...state.draftProperty.defaultKeys }
    };

    const newUnits: Unit[] = [];
    const tempToRealUnitId: Record<string, string> = {};
    state.draftUnits.forEach(d => {
        const realId = Math.random().toString(36).substr(2, 9);
        tempToRealUnitId[d.tempId] = realId;
        newUnits.push({
            id: realId,
            property_id: newPropId,
            name: d.name,
            sq_meter: d.sq_meter,
            keys: d.keys,
            usage_type: d.usage_type
        });
    });

    const newTenants: Tenant[] = [];
    const newTenancies: Tenancy[] = [];
    const newOccupancy: OccupancyHistory[] = [];
    const newAmendments: ContractAmendment[] = [];

    state.draftTenants.forEach(d => {
        if (d.isVacant) return;

        const realTenantId = Math.random().toString(36).substr(2, 9);
        const realTenancyId = Math.random().toString(36).substr(2, 9);
        const realUnitId = tempToRealUnitId[d.unitTempId];

        if (realUnitId) {
            newTenants.push({ id: realTenantId, name: d.name, email: d.email });
            const prepaymentCents = Math.round(d.prepayment * 100);
            
            newTenancies.push({
                id: realTenancyId,
                unit_id: realUnitId,
                tenant_id: realTenantId,
                start_date: d.startDate,
                end_date: null,
                monthly_prepayment: prepaymentCents
            });

            newOccupancy.push({
                id: Math.random().toString(36).substr(2, 9),
                tenancy_id: realTenancyId,
                valid_from: d.startDate,
                valid_until: null,
                person_count: d.personCount,
                occupant_names: d.occupantNames
            });

            newAmendments.push({
                id: Math.random().toString(36).substr(2, 9),
                tenancy_id: realTenancyId,
                valid_from: d.startDate,
                base_rent: 0,
                parking_rent: 0,
                prepayment: prepaymentCents
            });
        }
    });

    return { 
        properties: [...state.properties, newProperty],
        units: [...state.units, ...newUnits],
        tenants: [...state.tenants, ...newTenants],
        tenancies: [...state.tenancies, ...newTenancies],
        occupancyHistory: [...state.occupancyHistory, ...newOccupancy],
        contractAmendments: [...state.contractAmendments, ...newAmendments],
        selectedPropertyId: newPropId,
        isWizardOpen: false,
        draftProperty: INITIAL_DRAFT_PROPERTY,
        draftUnits: [],
        draftTenants: []
    }; 
  })
}));
