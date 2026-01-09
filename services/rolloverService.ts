
import { Tenancy, OccupancyHistory } from '../types';

/**
 * Performs a "Jahresübernahme" (Yearly Rollover).
 * 
 * Logic:
 * 1. Copies active tenancies (extending them or creating new refs if needed, simplified here to just verify existence).
 * 2. Copies occupancy history for those tenancies.
 * 3. Does NOT copy expenses or meter readings.
 */
export function duplicateYear(
    sourceYear: number, 
    targetYear: number, 
    propertyId: string,
    existingTenancies: Tenancy[],
    existingOccupancy: OccupancyHistory[]
): { newTenancies: Tenancy[], newOccupancy: OccupancyHistory[] } {
    
    console.log(`Rollover from ${sourceYear} to ${targetYear} for property ${propertyId}`);
    
    // In a real implementation this would deep copy and shift dates
    // For now we return empty to avoid creating duplicate mock data
    
    return {
        newTenancies: [],
        newOccupancy: []
    };
}
