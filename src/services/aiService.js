import { apiClient } from './apiClient';
import { csvDataLoader } from './csvDataLoader';

class AIService {
  async getAlerts(filter = {}) {
    if (apiClient.useBackend) {
      return await apiClient.get('/ai/alerts', filter);
    }
    const rawAlerts = csvDataLoader.getAlerts(filter.citizenId);
    return rawAlerts.map(a => ({
      id: a.Alert_ID,
      citizenId: a.Citizen_ID,
      wardId: a.Ward_ID,
      type: a.Alert_Type,
      riskScore: Number(a.Risk_Score || 80),
      outstandingAmount: Number(a.Outstanding_Amount || 0),
      action: a.Recommended_Action || 'Send SMS reminder',
      createdDate: a.Created_Date || '2024-01-01',
      resolved: a.Resolved === true || a.Resolved === 'true',
      priority: a.Priority || 'Medium'
    }));
  }

  async getRiskAssessment(citizen) {
    if (!citizen) return null;
    if (apiClient.useBackend) {
      return await apiClient.get(`/ai/risk/${citizen.id}`);
    }

    const score = Number(citizen.riskScore || 50);
    let level = 'low';
    if (score >= 80) level = 'critical';
    else if (score >= 60) level = 'high';
    else if (score >= 35) level = 'medium';

    return {
      score,
      level,
      category: citizen.riskCategory || 'Moderate Risk',
      defaulterProbability: Math.min(99, score * 1.1).toFixed(0) + '%',
      recommendations: citizen.aiRecommendations || [
        'Pay pending taxes before billing cycle to avoid 1.5% surcharge',
        'Enable AutoPay to earn 2% automatic discount on every instalment'
      ]
    };
  }
}

export const aiService = new AIService();
