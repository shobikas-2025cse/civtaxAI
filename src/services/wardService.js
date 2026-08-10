import { apiClient } from './apiClient';
import { csvDataLoader } from './csvDataLoader';

class WardService {
  async getWardSummaries() {
    if (apiClient.useBackend) {
      try {
        const backendWards = await apiClient.get('/wards');
        if (backendWards && Array.isArray(backendWards) && backendWards.length > 0) {
          return backendWards;
        }
      } catch (e) {
        console.info('Using local ward summaries fallback');
      }
    }
    const rawWards = csvDataLoader.getWards();
    return rawWards.map(w => ({
      code: w.Ward_ID,
      id: w.Ward_ID,
      name: `${w.Ward_ID} - ${w.Ward_Name}`,
      wardName: w.Ward_Name,
      totalCitizens: Number(w.Total_Citizens || 35),
      totalAnnualTax: Number(w.Total_Annual_Tax || 650000),
      totalCollected: Number(w.Total_Collected || 440000),
      totalOutstanding: Number(w.Total_Outstanding || 210000),
      rate: Number(w.Collection_Rate_pct || 65),
      collectionEfficiency: Number(w.Collection_Rate_pct || 65),
      highRiskCount: Number(w.High_Risk_Count || 20),
      complianceScore: Number(w.Compliance_Score || 40),
      rank: Number(w.Rank || 1),
      status: Number(w.Collection_Rate_pct || 60) >= 65 ? 'Green Zone' : Number(w.Collection_Rate_pct || 60) >= 55 ? 'Yellow Zone' : 'Red Risk Zone',
      color: Number(w.Collection_Rate_pct || 60) >= 65 ? 'border-green-500 bg-green-500/10 text-green-400' : Number(w.Collection_Rate_pct || 60) >= 55 ? 'border-mustard bg-mustard/10 text-mustard' : 'border-red-500 bg-red-500/10 text-red-400',
      badge: Number(w.Rank || 1) <= 2 ? 'Green Leader' : Number(w.Rank || 1) <= 4 ? 'Silver Ward' : 'Intervention Needed',
      complianceStatus: Number(w.Rank || 1) <= 2 ? 'Top Performing Ward 🏆' : Number(w.Rank || 1) <= 4 ? 'High Growth 🚀' : 'Action Required 🚨',
      streakMonths: Math.max(1, 10 - Number(w.Rank || 1))
    }));
  }

  async getWardById(wardId) {
    const list = await this.getWardSummaries();
    return list.find(w => w.code === wardId || w.id === wardId) || list[0];
  }
}

export const wardService = new WardService();
