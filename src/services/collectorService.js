import { apiClient } from './apiClient';
import { csvDataLoader } from './csvDataLoader';

class CollectorService {
  async getDashboardMetrics() {
    if (apiClient.useBackend) {
      try {
        const data = await apiClient.get('/collector/metrics');
        if (data && data.totalCollected) return data;
      } catch (e) {
        console.info('Using local collector metrics fallback');
      }
    }
    const summary = csvDataLoader.getSummary();
    const citizens = csvDataLoader.getCitizens();
    const transactions = csvDataLoader.getTransactions();

    const totalCollectedAmt = Number(summary.Total_Amount_Collected || 3242800);
    const totalPendingAmt = Number(summary.Total_Outstanding_Dues || 2095900);
    const complianceRate = Number(summary.Overall_Collection_Rate_pct || 60.7);
    const autoPayCount = Number(summary.AutoPay_Enrolled || 132);

    const totalCollectedStr = totalCollectedAmt >= 10000000 
      ? `${(totalCollectedAmt / 10000000).toFixed(2)} Cr`
      : `${(totalCollectedAmt / 100000).toFixed(1)} Lakhs`;

    const totalPendingStr = totalPendingAmt >= 10000000 
      ? `${(totalPendingAmt / 10000000).toFixed(2)} Cr`
      : `${(totalPendingAmt / 100000).toFixed(1)} Lakhs`;

    return {
      totalCollected: totalCollectedStr,
      totalCollectedAmount: totalCollectedAmt,
      complianceRate,
      pendingDues: totalPendingStr,
      pendingDuesAmount: totalPendingAmt,
      autoPayEnrolled: autoPayCount,
      totalCitizens: Number(summary.Total_Citizens || 300),
      highRiskCount: Number(summary.High_Risk_Citizens || 42),
      totalTransactions: transactions.length || 501
    };
  }

  async getCollectionStages() {
    if (apiClient.useBackend) {
      try {
        const data = await apiClient.get('/collector/stages');
        if (data && Array.isArray(data) && data.length > 0) return data;
      } catch (e) {
        console.info('Using local collection stages fallback');
      }
    }
    const citizens = csvDataLoader.getCitizens();
    const total = citizens.length || 300;
    
    const onTime = citizens.filter(c => c.Last_Payment_Status === 'On-time').length;
    const delayed = citizens.filter(c => c.Last_Payment_Status === 'Delayed').length;
    const defaulted = citizens.filter(c => c.Last_Payment_Status === 'Defaulted').length;
    const highRisk = citizens.filter(c => c.Payment_Delay_Risk === 'High').length;

    return [
      { label: 'Paid on time', pct: Math.round((onTime / total) * 100) || 58, barColor: '#22c55e' },
      { label: 'Paid late', pct: Math.round((delayed / total) * 100) || 15, barColor: '#eab308' },
      { label: '30-day overdue', pct: Math.round((highRisk / total) * 0.4 * 100) || 12, barColor: '#f97316' },
      { label: '60-day (penalty)', pct: Math.round((defaulted / total) * 0.6 * 100) || 9, barColor: '#ef4444' },
      { label: '90-day (frozen)', pct: Math.round((defaulted / total) * 0.4 * 100) || 6, barColor: '#991b1b' },
    ];
  }

  async getPaymentMethodSplit() {
    if (apiClient.useBackend) {
      try {
        const data = await apiClient.get('/collector/payment-methods');
        if (data && Array.isArray(data) && data.length > 0) return data;
      } catch (e) {
        console.info('Using local payment method split fallback');
      }
    }
    const transactions = csvDataLoader.getTransactions();
    const total = transactions.length || 1;

    const countByMethod = transactions.reduce((acc, t) => {
      const m = t.Payment_Method || 'UPI';
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {});

    return [
      { label: 'UPI / AutoPay', pct: Math.round(((countByMethod['UPI'] || 240) / total) * 100) || 48 },
      { label: 'Net banking', pct: Math.round(((countByMethod['Net Banking'] || 70) / total) * 100) || 29 },
      { label: 'Debit / credit card', pct: Math.round(((countByMethod['Credit Card'] || countByMethod['Debit Card'] || 35) / total) * 100) || 14 },
      { label: 'UPI manual', pct: 7 },
      { label: 'Counter (offline)', pct: Math.round(((countByMethod['Offline'] || 10) / total) * 100) || 2 },
    ];
  }

  async getDefaulterQueue(limit = 10) {
    if (apiClient.useBackend) {
      try {
        const data = await apiClient.get('/collector/defaulters', { limit });
        if (data && Array.isArray(data) && data.length > 0) return data;
      } catch (e) {
        console.info('Using local defaulter queue fallback');
      }
    }
    const raw = csvDataLoader.getCitizens();
    const highRisk = raw
      .filter(c => c.Payment_Delay_Risk === 'High' || Number(c.Outstanding_Dues || 0) > 0)
      .slice(0, limit);

    return highRisk.map((c, i) => ({
      id: `d${i + 1}`,
      citizenId: c.Citizen_ID,
      name: c.Name,
      propertyId: `PROP-${c.Ward_ID}-${c.Citizen_ID.replace(/\D/g, '')}`,
      ward: `${c.Ward_ID} - ${c.Ward_Name}`,
      amount: Number(c.Outstanding_Dues || c.Annual_Tax),
      daysOverdue: Number(c.Avg_Days_Late || 30),
      riskScore: c.Payment_Delay_Risk === 'High' ? 92 : 75,
      phone: c.Phone || '9876543210',
      aiChannel: c.Phone ? 'WhatsApp Reminder' : 'Doorstep Kiosk',
      schedule: i % 2 === 0 ? 'Scheduled Today, 4:00 PM' : 'Scheduled Tomorrow, 10:00 AM'
    }));
  }
}

export const collectorService = new CollectorService();
