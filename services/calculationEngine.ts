
import { AllocationKey, Expense, Property, Tenancy, TenantSettlement, Unit, OccupancyHistory, UsageType } from '../types';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getDayIndex(date: Date, yearStart: Date): number {
    return Math.round((date.getTime() - yearStart.getTime()) / ONE_DAY_MS);
}

function getDuration(startIdx: number, endIdx: number): number {
    return endIdx - startIdx + 1;
}

interface DayStatus {
    tenancyId: string | null;
    personCount: number;
}

interface DailyTotals {
    totalPersons: number;
    totalUnits: number;
    commercialArea: number;
}

export function calculateSettlement(
  property: Property,
  units: Unit[],
  tenancies: Tenancy[],
  expenses: Expense[],
  tenants: any[],
  occupancyHistory: OccupancyHistory[],
  year: number
): { results: TenantSettlement[]; ownerVacancyShare: number } {
  const yearStart = new Date(`${year}-01-01`);
  const yearEnd = new Date(`${year}-12-31`);
  const daysInYear = getDayIndex(yearEnd, yearStart) + 1;

  const unitCache = new Map<string, DayStatus[]>();
  units.forEach(u => {
      unitCache.set(u.id, new Array(daysInYear).fill(null).map(() => ({ tenancyId: null, personCount: 0 })));
  });

  tenancies.forEach(t => {
      const tStart = new Date(t.start_date);
      const tEnd = t.end_date ? new Date(t.end_date) : new Date('2099-12-31');
      const startIdx = Math.max(0, getDayIndex(tStart, yearStart));
      const endIdx = Math.min(daysInYear - 1, getDayIndex(tEnd, yearStart));
      if (startIdx <= endIdx) {
          const unitDays = unitCache.get(t.unit_id);
          const unitDefaultKeys = units.find(u => u.id === t.unit_id)?.keys || 1;
          if (unitDays) {
              for (let i = startIdx; i <= endIdx; i++) {
                  unitDays[i].tenancyId = t.id;
                  unitDays[i].personCount = unitDefaultKeys;
              }
          }
      }
  });

  occupancyHistory.forEach(h => {
      const t = tenancies.find(ten => ten.id === h.tenancy_id);
      if (!t) return;
      const hStart = new Date(h.valid_from);
      const hEnd = h.valid_until ? new Date(h.valid_until) : new Date('2099-12-31');
      const startIdx = Math.max(0, getDayIndex(hStart, yearStart));
      const endIdx = Math.min(daysInYear - 1, getDayIndex(hEnd, yearStart));
      if (startIdx <= endIdx) {
          const unitDays = unitCache.get(t.unit_id);
          if (unitDays) {
              for (let i = startIdx; i <= endIdx; i++) {
                  if (unitDays[i].tenancyId === t.id) {
                      unitDays[i].personCount = h.person_count;
                  }
              }
          }
      }
  });

  const dailyTotals: DailyTotals[] = new Array(daysInYear).fill(null).map(() => ({
      totalPersons: 0,
      totalUnits: units.length,
      commercialArea: units.reduce((sum, u) => u.usage_type === UsageType.COMMERCIAL ? sum + u.sq_meter : sum, 0)
  }));

  for (let i = 0; i < daysInYear; i++) {
      let personsToday = 0;
      units.forEach(u => { personsToday += unitCache.get(u.id)![i].personCount; });
      dailyTotals[i].totalPersons = personsToday || 1;
  }

  const resultsMap = new Map<string, TenantSettlement>();
  let ownerVacancyShare = 0;

  tenancies.forEach(t => {
      const tStart = new Date(t.start_date);
      const tEnd = t.end_date ? new Date(t.end_date) : new Date('2099-12-31');
      const overlapStart = tStart < yearStart ? yearStart : tStart;
      const overlapEnd = tEnd > yearEnd ? yearEnd : tEnd;

      if (overlapStart <= overlapEnd && overlapEnd >= yearStart) {
          const daysOccupied = getDuration(getDayIndex(overlapStart, yearStart), getDayIndex(overlapEnd, yearStart));
          // Prepayment: (Monthly Advance / 30.44 days) * Actual Days in year
          const totalPrepayments = Math.round((t.monthly_prepayment / 30.44) * daysOccupied);
          
          const unit = units.find(u => u.id === t.unit_id);
          const tenant = tenants.find(ten => ten.id === t.tenant_id);

          resultsMap.set(t.id, {
              tenantId: t.tenant_id,
              tenantName: tenant?.name || 'Unbekannt',
              unitName: unit?.name || 'Unbekannt',
              totalShare: 0,
              prepaymentsPaid: totalPrepayments,
              balance: 0,
              details: [],
              daysOccupied
          });
      }
  });

  expenses.filter(e => e.property_id === property.id).forEach(expense => {
      const expStart = new Date(expense.period_start);
      const expEnd = new Date(expense.period_end);
      const startIdx = Math.max(0, getDayIndex(expStart, yearStart));
      const endIdx = Math.min(daysInYear - 1, getDayIndex(expEnd, yearStart));
      const durationDays = getDuration(getDayIndex(expStart, yearStart), getDayIndex(expEnd, yearStart));
      
      if (durationDays <= 0 || startIdx > endIdx) return;
      const dailyCost = expense.amount / durationDays;
      const expenseDistribution = new Map<string, number>();
      let expenseOwnerShare = 0;

      for (let i = startIdx; i <= endIdx; i++) {
          let dailyDenominator = 0;
          if (expense.allocation_key === AllocationKey.AREA) dailyDenominator = property.total_sqm;
          else if (expense.allocation_key === AllocationKey.COMMERCIAL_AREA) dailyDenominator = dailyTotals[i].commercialArea;
          else if (expense.allocation_key === AllocationKey.UNITS) dailyDenominator = dailyTotals[i].totalUnits;
          else if (expense.allocation_key === AllocationKey.PERSONS) dailyDenominator = dailyTotals[i].totalPersons;
          else if (expense.allocation_key === AllocationKey.DIRECT) dailyDenominator = 1;

          if (dailyDenominator === 0) continue;
          const costPerUnitAllocator = dailyCost / dailyDenominator;

          units.forEach(unit => {
              const status = unitCache.get(unit.id)![i];
              let allocatorValue = 0;
              if (expense.allocation_key === AllocationKey.AREA) allocatorValue = unit.sq_meter;
              else if (expense.allocation_key === AllocationKey.COMMERCIAL_AREA) allocatorValue = unit.usage_type === UsageType.COMMERCIAL ? unit.sq_meter : 0;
              else if (expense.allocation_key === AllocationKey.UNITS) allocatorValue = 1;
              else if (expense.allocation_key === AllocationKey.PERSONS) allocatorValue = status.personCount;
              else if (expense.allocation_key === AllocationKey.DIRECT) allocatorValue = (unit.id === expense.unit_id) ? 1 : 0;

              const share = costPerUnitAllocator * allocatorValue;
              if (share > 0) {
                  if (status.tenancyId) {
                      const current = expenseDistribution.get(status.tenancyId) || 0;
                      expenseDistribution.set(status.tenancyId, current + share);
                  } else {
                      expenseOwnerShare += share;
                  }
              }
          });
      }

      expenseDistribution.forEach((share, tenancyId) => {
          const res = resultsMap.get(tenancyId);
          if (res) {
              res.totalShare += share;
              const unit = units.find(u => u.name === res.unitName);
              res.details.push({
                  expenseName: expense.name,
                  totalBill: expense.amount,
                  allocationKey: expense.allocation_key,
                  formula: generateExplainableFormula(expense, share, durationDays, property, res, unit),
                  yourShare: share
              });
          }
      });
      ownerVacancyShare += expenseOwnerShare;
  });

  const results = Array.from(resultsMap.values()).map(r => ({
      ...r,
      totalShare: Math.round(r.totalShare),
      balance: Math.round(r.totalShare - r.prepaymentsPaid),
      details: r.details.map(d => ({ ...d, yourShare: Math.round(d.yourShare) }))
  }));

  return { results, ownerVacancyShare: Math.round(ownerVacancyShare) };
}

function generateExplainableFormula(exp: Expense, userShare: number, billDurationDays: number, prop: Property, settlement: TenantSettlement, unit: Unit | undefined): string {
    const percentage = ((userShare / exp.amount) * 100).toFixed(2);
    if (exp.allocation_key === AllocationKey.DIRECT) return `Direktzuweisung (100% der Kosten)`;
    if (exp.allocation_key === AllocationKey.AREA) return `Anteil ${percentage}%: (${unit?.sq_meter}m² / ${prop.total_sqm}m²) für Zeitraum`;
    if (exp.allocation_key === AllocationKey.UNITS) return `Anteil ${percentage}%: (1 Einheit / Gesamt)`;
    if (exp.allocation_key === AllocationKey.PERSONS) return `Anteil ${percentage}%: (Ihre Personentage / Gesamt)`;
    return `Anteil: ${percentage}% der Gesamtkosten`;
}
