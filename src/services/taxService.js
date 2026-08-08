import { apiClient } from './apiClient';
import { csvDataLoader } from './csvDataLoader';

class TaxService {
  async getCitizenTaxes(citizenId) {
    if (apiClient.useBackend) {
      return await apiClient.get(`/taxes/citizen/${citizenId}`);
    }

    const citizen = csvDataLoader.getCitizenById(citizenId);
    if (!citizen) {
      // Default fallback tax items if citizen not in CSV
      return [
        { id: 'TAX001', type: 'Property Tax', amount: 12500, due: '2026-09-15', status: 'pending', period: 'Q3 2026', daysUntilDue: 39 },
        { id: 'TAX002', type: 'Water Tax', amount: 1800, due: '2026-08-30', status: 'pending', period: 'Aug 2026', daysUntilDue: 24 },
        { id: 'TAX003', type: 'Waste Tax', amount: 600, due: '2026-08-01', status: 'overdue', period: 'Jul 2026', daysUntilDue: -5, arrears: 50 },
        { id: 'TAX004', type: 'Property Tax', amount: 12500, due: '2026-06-15', status: 'paid', period: 'Q2 2026', paidOn: '2026-06-10' },
      ];
    }

    const annualTax = Number(citizen.Annual_Tax || 12000);
    const amountPaid = Number(citizen.Amount_Paid || 0);
    const outstanding = Number(citizen.Outstanding_Dues !== undefined ? citizen.Outstanding_Dues : annualTax - amountPaid);
    const hasOverdue = citizen.Payment_Delay_Risk === 'High' || citizen.Last_Payment_Status === 'Defaulted';

    const items = [];
    const propertyShare = Math.round(annualTax * 0.75);
    const waterShare = Math.round(annualTax * 0.20);
    const wasteShare = Math.round(annualTax * 0.05);

    if (outstanding > 0) {
      if (hasOverdue) {
        items.push({
          id: `TAX-${citizen.Citizen_ID}-01`,
          type: 'Property Tax',
          amount: Math.round(outstanding * 0.8),
          due: '2026-06-01',
          status: 'overdue',
          period: 'Q2 2026',
          daysUntilDue: -25,
          arrears: Math.round(outstanding * 0.08)
        });
        items.push({
          id: `TAX-${citizen.Citizen_ID}-02`,
          type: 'Water Tax',
          amount: Math.round(outstanding * 0.2),
          due: '2026-08-30',
          status: 'pending',
          period: 'Aug 2026',
          daysUntilDue: 22
        });
      } else {
        items.push({
          id: `TAX-${citizen.Citizen_ID}-01`,
          type: 'Property Tax',
          amount: Math.round(outstanding),
          due: '2026-09-15',
          status: 'pending',
          period: 'Q3 2026',
          daysUntilDue: 38
        });
      }
    }

    if (amountPaid > 0) {
      items.push({
        id: `TAX-${citizen.Citizen_ID}-03`,
        type: 'Property Tax',
        amount: Math.round(amountPaid * 0.85),
        due: '2026-03-31',
        status: 'paid',
        period: 'Q1 2026',
        paidOn: citizen.Last_Payment_Date || '2026-04-10'
      });
      items.push({
        id: `TAX-${citizen.Citizen_ID}-04`,
        type: 'Water & Waste Tax',
        amount: Math.round(amountPaid * 0.15),
        due: '2026-05-30',
        status: 'paid',
        period: 'Q1 2026',
        paidOn: citizen.Last_Payment_Date || '2026-05-15'
      });
    }

    return items;
  }

  async getTransactions(citizenId = null) {
    if (apiClient.useBackend) {
      return await apiClient.get('/transactions', citizenId ? { citizenId } : {});
    }

    const rawList = csvDataLoader.getTransactions(citizenId);
    return rawList.map(t => ({
      id: t.Transaction_ID,
      citizenId: t.Citizen_ID,
      citizenName: t.Citizen_ID, // enriched later
      ward: t.Ward_ID,
      amount: Number(t.Amount || 0),
      method: t.Payment_Method || 'UPI',
      status: t.Status || 'Success',
      date: t.Date || '2024-01-01',
      taxYear: t.Tax_Year || '2023-24',
      statusOnTime: !t.Penalty_Applied && (t.Late_Days === 0 || t.Late_Days === '0'),
      receiptId: t.Receipt_ID
    }));
  }

  async payTax(citizenId, taxId, paymentMethod = 'UPI One-Tap') {
    if (apiClient.useBackend) {
      return await apiClient.post('/taxes/pay', { citizenId, taxId, paymentMethod });
    }

    // In-memory CSV update
    const citizen = csvDataLoader.getCitizenById(citizenId);
    const newTxnId = 'TXN' + Math.floor(10000 + Math.random() * 90000);
    const newReceiptId = 'RCP' + Math.floor(100000 + Math.random() * 900000);

    const txnRecord = {
      Transaction_ID: newTxnId,
      Citizen_ID: citizenId,
      Ward_ID: citizen?.Ward_ID || 'W02',
      Amount: citizen ? Math.round(citizen.Outstanding_Dues || 5000) : 5000,
      Payment_Method: paymentMethod,
      Status: 'Success',
      Date: new Date().toISOString().split('T')[0],
      Tax_Year: '2026-27',
      Late_Days: 0,
      Penalty_Applied: false,
      Receipt_ID: newReceiptId
    };

    csvDataLoader.addTransaction(txnRecord);
    if (citizen) {
      csvDataLoader.updateCitizen(citizenId, {
        Outstanding_Dues: 0,
        Amount_Paid: (Number(citizen.Amount_Paid || 0) + txnRecord.Amount),
        Payment_Delay_Risk: 'Low',
        Last_Payment_Status: 'On-time',
        Last_Payment_Date: txnRecord.Date
      });
    }

    return {
      success: true,
      transactionId: newTxnId,
      receiptId: newReceiptId,
      amountPaid: txnRecord.Amount,
      date: txnRecord.Date,
      paymentMethod
    };
  }

  async getTaxSummary() {
    if (apiClient.useBackend) {
      return await apiClient.get('/summary');
    }
    const raw = csvDataLoader.getSummary();
    return {
      totalCitizens: raw.Total_Citizens || 300,
      totalDemand: raw.Total_Annual_Tax_Demand || 5338700,
      totalCollected: raw.Total_Amount_Collected || 3242800,
      totalOutstanding: raw.Total_Outstanding_Dues || 2095900,
      collectionRatePct: raw.Overall_Collection_Rate_pct || 60.7,
      highRiskCitizens: raw.High_Risk_Citizens || 200,
      mediumRiskCitizens: raw.Medium_Risk_Citizens || 14,
      lowRiskCitizens: raw.Low_Risk_Citizens || 86,
      autoPayEnrolled: raw.AutoPay_Enrolled || 132,
      totalTransactions: raw.Total_Transactions || 501,
      totalPenalties: raw.Total_Penalties_Applied || 302,
      totalRewards: raw.Total_Rewards_Issued || 86,
      fiscalYear: raw.fiscal_year || '2023-24',
      municipality: raw.municipality || 'Bangalore Municipal Corporation'
    };
  }

  async getMonthlyTrend() {
    if (apiClient.useBackend) {
      return await apiClient.get('/trends/monthly');
    }
    return csvDataLoader.getMonthlyTrend();
  }
}

export const taxService = new TaxService();
