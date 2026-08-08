import { apiClient } from './apiClient';
import { csvDataLoader } from './csvDataLoader';

/**
 * Transforms raw CSV citizen row into rich Citizen model used across CivTax AI
 */
export function formatCitizenFromCSV(row) {
  if (!row) return null;

  const id = row.Citizen_ID || row.id || `CIT${Math.floor(Math.random() * 900 + 100)}`;
  const name = row.Name || row.name || 'Citizen';
  const phone = String(row.Phone || row.phone || '9876543210');
  const wardId = row.Ward_ID || 'W02';
  const wardName = row.Ward_Name || 'Jubilee Hills';
  const ward = `${wardId} - ${wardName}`;
  const propertyId = `PROP-${wardId}-${id.replace(/\D/g, '').padStart(4, '0')}`;
  const annualTax = Number(row.Annual_Tax || 12500);
  const amountPaid = Number(row.Amount_Paid || 0);
  const outstanding = Number(row.Outstanding_Dues !== undefined ? row.Outstanding_Dues : annualTax - amountPaid);
  const delayRisk = row.Payment_Delay_Risk || (outstanding > 0 ? 'High' : 'Low');
  const isDefaulter = delayRisk === 'High' || outstanding > 0 || row.Last_Payment_Status === 'Defaulted';
  
  // Calculate CRED-style Civic Score (300 to 900)
  let civicCreditScore = 780;
  if (delayRisk === 'Low') civicCreditScore = 840;
  else if (delayRisk === 'Medium') civicCreditScore = 680;
  else civicCreditScore = isDefaulter ? 520 : 640;

  const streak = row.Rewards_Earned ? Number(row.Rewards_Earned) * 2 + 1 : (isDefaulter ? 0 : 3);
  const xp = 1500 + streak * 250 + (annualTax > 20000 ? 800 : 300);

  return {
    id,
    Citizen_ID: id,
    name,
    phone,
    email: row.Email || `${id.toLowerCase()}@civtax.in`,
    ward,
    wardId,
    wardName,
    propertyId,
    propertyType: row.Property_Type || 'Residential',
    propertyArea: row.Property_Area_sqft || 2400,
    waterConnection: row.Water_Connection === true || row.Water_Connection === 'Yes',
    wasteService: row.Waste_Service === true || row.Waste_Service === 'Yes',
    annualTax,
    amountPaid,
    outstandingDues: outstanding,
    status: isDefaulter ? 'Defaulter' : 'Compliant',
    riskCategory: delayRisk === 'High' ? 'High Risk' : delayRisk === 'Medium' ? 'Moderate Risk' : 'Low Risk',
    riskScore: delayRisk === 'High' ? 82 : delayRisk === 'Medium' ? 54 : 18,
    civicCreditScore,
    civicCreditTier: civicCreditScore >= 800 ? 'Excellent (Top 2% Taxpayer)' : civicCreditScore >= 650 ? 'Good Civic Standing' : 'Needs Immediate Attention',
    tier: civicCreditScore >= 800 ? 'Gold Model Citizen 🌟' : civicCreditScore >= 650 ? 'Silver Tier' : 'Action Required 🚨',
    xp,
    level: Math.floor(xp / 400),
    streak,
    paymentPlan: row.Payment_Plan || 'Quarterly',
    autoPayEnabled: row.AutoPay_Enabled === true || row.AutoPay_Enabled === 'Yes',
    preferredPaymentMethod: row.Preferred_Payment_Method || 'UPI',
    lastPaymentStatus: row.Last_Payment_Status || 'On-time',
    avgDaysLate: row.Avg_Days_Late || 0,
    remindersReceived: row.Reminders_Received || 0,
    penaltyHistory: row.Penalty_History || 0,
    lastPaymentDate: row.Last_Payment_Date || null,
    registrationDate: row.Registration_Date || '2023-01-01',
    role: 'citizen',
    communityPledges: [
      { id: 'p1', title: 'Zero Waste Segregation Pledge', pledged: true, count: 1420 },
      { id: 'p2', title: 'Solar Rooftop Energy Pledge', pledged: row.Property_Type === 'Commercial', count: 890 },
      { id: 'p3', title: 'On-Time Municipal Tax Pledge', pledged: !isDefaulter, count: 3250 },
    ],
    nudges: [
      isDefaulter ? {
        id: 'n1',
        channel: 'WhatsApp',
        type: 'Urgent Alert',
        message: `⚠️ ${name}, you have ₹${outstanding.toLocaleString()} in pending municipal taxes! Clear now to avoid penalty interest and preserve your Civic Score (${civicCreditScore}).`,
        timestamp: '10 mins ago',
        actionLabel: 'Pay via UPI One-Tap',
        targetTab: 'payment'
      } : {
        id: 'n1',
        channel: 'In-App',
        type: 'VIP Recognition',
        message: `🌟 Congratulations ${name}! Your Civic Credit Score is ${civicCreditScore}. You have unlocked Fast-Track Municipal Clearance!`,
        timestamp: '1 hour ago',
        actionLabel: 'View VIP Perks',
        targetTab: 'rewards'
      },
      {
        id: 'n2',
        channel: 'SMS',
        type: 'Dynamic Rebate',
        message: `⚡ Early Bird Rebate: Pay your Property Tax early to claim a 5% instant discount (Save ₹${Math.round(annualTax * 0.05).toLocaleString()})!`,
        timestamp: '2 hours ago',
        actionLabel: 'Claim 5% Rebate',
        targetTab: 'payment'
      }
    ]
  };
}

class CitizenService {
  async getAllCitizens(filter = {}) {
    if (apiClient.useBackend) {
      return await apiClient.get('/citizens', filter);
    }
    const rawList = csvDataLoader.getCitizens();
    let result = rawList.map(formatCitizenFromCSV);
    if (filter.wardId) result = result.filter(c => c.wardId === filter.wardId);
    if (filter.status) result = result.filter(c => c.status === filter.status);
    if (filter.search) {
      const s = filter.search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(s) || c.phone.includes(s) || c.id.toLowerCase().includes(s));
    }
    return result;
  }

  async getCitizenById(id) {
    if (apiClient.useBackend) {
      return await apiClient.get(`/citizens/${id}`);
    }
    const raw = csvDataLoader.getCitizenById(id);
    return raw ? formatCitizenFromCSV(raw) : null;
  }

  async getCitizenByPhone(phone) {
    if (apiClient.useBackend) {
      return await apiClient.get(`/citizens/phone/${phone}`);
    }
    const raw = csvDataLoader.getCitizenByPhone(phone);
    return raw ? formatCitizenFromCSV(raw) : null;
  }

  async getLeaderboard(limit = 30) {
    if (apiClient.useBackend) {
      return await apiClient.get('/leaderboard', { limit });
    }
    const rawList = csvDataLoader.getLeaderboard();
    return rawList.slice(0, limit).map((r, i) => ({
      rank: r.Rank || i + 1,
      citizenId: r.Citizen_ID,
      name: r.Name,
      ward: r.Ward_Name,
      annualTax: r.Annual_Tax,
      consecutiveYears: r.Consecutive_On_Time_Years,
      rewardsPoints: r.Rewards_Points,
      badge: r.Badge || 'Gold'
    }));
  }

  async updateCitizen(id, updates) {
    if (apiClient.useBackend) {
      return await apiClient.put(`/citizens/${id}`, updates);
    }
    const updated = csvDataLoader.updateCitizen(id, updates);
    return updated ? formatCitizenFromCSV(updated) : null;
  }
}

export const citizenService = new CitizenService();
