/**
 * CivTax AI Service Layer Architecture
 * 
 * Clean, decoupled service layer separating React components from data storage.
 * Currently powered by the CSV data repository (300 citizens, 8 wards, 500 transactions, 50 AI alerts).
 * Ready for drop-in replacement with FastAPI/PostgreSQL without modifying any UI components.
 */

export * from './apiClient';
export * from './csvParser';
export * from './csvDataLoader';
export * from './citizenService';
export * from './taxService';
export * from './wardService';
export * from './collectorService';
export * from './adminService';
export * from './aiService';
