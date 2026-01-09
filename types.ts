
export enum AllocationKey {
  AREA = 'AREA', // Fläche (qm)
  PERSONS = 'PERSONS', // Personenanzahl
  UNITS = 'UNITS', // Wohneinheiten
  DIRECT = 'DIRECT', // Direkte Zuordnung
  CONSUMPTION = 'CONSUMPTION', // Verbrauch (z.B. Wasseruhr)
  COMMERCIAL_AREA = 'COMMERCIAL_AREA' // Nur Gewerbe (Fläche)
}

export enum UsageType {
  RESIDENTIAL = 'RESIDENTIAL', // Wohnraum (MwSt-frei usually)
  COMMERCIAL = 'COMMERCIAL',   // Gewerbe (MwSt-pflichtig options)
  MIXED = 'MIXED'
}

export interface Property {
  id: string;
  name: string;
  address: string;
  total_sqm: number;
  default_keys?: Record<string, AllocationKey>; 
}

export interface Unit {
  id: string;
  property_id: string;
  name: string;
  location_code?: string;
  room_count?: number;
  parking_slot_id?: string | null;
  sq_meter: number;
  keys: number; 
  usage_type: UsageType; 
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
}

export interface Tenancy {
  id: string;
  unit_id: string;
  tenant_id: string;
  customer_id?: string;
  start_date: string;
  end_date: string | null; 
  monthly_prepayment: number; // in cents
}

export interface ContractAmendment {
  id: string;
  tenancy_id: string;
  valid_from: string;
  base_rent: number;
  parking_rent: number;
  prepayment: number;
}

export interface Payment {
  id: string;
  contract_id: string;
  date: string;
  amount_expected: number;
  amount_received: number;
  type: 'RENT' | 'DEPOSIT' | 'SETTLEMENT';
}

export interface OccupancyHistory {
  id: string;
  tenancy_id: string;
  valid_from: string;
  valid_until: string | null;
  person_count: number;
  occupant_names?: string;
}

export interface Expense {
  id: string;
  property_id: string;
  unit_id?: string;
  name: string;
  amount: number; // in cents
  date_billed: string;
  period_start: string;
  period_end: string;
  allocation_key: AllocationKey;
  deductible_amount?: number;
}

export interface ExpenseShareDetail {
  expenseName: string;
  totalBill: number;
  allocationKey: string;
  formula: string; 
  yourShare: number;
}

export interface TenantSettlement {
  tenantId: string;
  tenantName: string;
  unitName: string;
  totalShare: number;
  prepaymentsPaid: number;
  balance: number; 
  details: ExpenseShareDetail[];
  daysOccupied: number;
}

export interface SettlementResult {
  propertyId: string;
  year: number;
  results: TenantSettlement[];
  ownerVacancyShare: number; 
}

export const STANDARD_EXPENSE_TYPES = [
  'Grundsteuer',
  'Wasserversorgung',
  'Entwässerung',
  'Aufzug',
  'Straßenreinigung/Müll',
  'Gebäudereinigung',
  'Gartenpflege',
  'Beleuchtung',
  'Schornsteinreinigung',
  'Versicherung',
  'Verwaltungskosten',
  'Hauswart',
  'TV/Kabel',
  'Sonstige'
] as const;

export type StandardExpenseType = typeof STANDARD_EXPENSE_TYPES[number];

export interface WizardDraftProperty {
  name: string;
  address: string;
  total_sqm: number;
  defaultKeys: Record<string, AllocationKey>; 
}

export interface WizardDraftUnit extends Omit<Unit, 'id' | 'property_id'> {
  tempId: string; 
}

export interface WizardDraftTenant {
  tempId: string;
  unitTempId: string;
  isVacant: boolean; // NEW: Explicit marker for empty units
  name: string;
  email: string;
  startDate: string;
  prepayment: number; // in Euros for draft
  occupantNames: string; // Document exactly who lives there
  personCount: number;
}
