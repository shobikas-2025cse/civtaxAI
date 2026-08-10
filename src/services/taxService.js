import { apiClient } from './apiClient';
import { csvDataLoader } from './csvDataLoader';

class TaxService {
  async getCitizenTaxes(citizenId) {
    if (apiClient.useBackend) {
      try {
        const data = await apiClient.get(`/taxes/citizen/${citizenId}`);
        if (data && Array.isArray(data) && data.length > 0) return data;
      } catch (e) {
        console.info('Using local citizen taxes fallback');
      }
    }

    const citizen = csvDataLoader.getCitizenById(citizenId);
    if (!citizen) {
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
      try {
        const data = await apiClient.get('/transactions', citizenId ? { citizenId } : {});
        if (data && Array.isArray(data) && data.length > 0) return data;
      } catch (e) {
        console.info('Using local transactions fallback');
      }
    }

    const rawList = csvDataLoader.getTransactions(citizenId);
    return rawList.map(t => ({
      id: t.Transaction_ID,
      citizenId: t.Citizen_ID,
      citizenName: t.Citizen_ID,
      ward: t.Ward_ID,
      amount: Number(t.Amount || 0),
      paymentMethod: t.Payment_Method || 'UPI',
      status: t.Payment_Status || 'Success',
      date: t.Payment_Date || '2026-08-01',
      taxType: t.Tax_Type || 'Property Tax',
      receiptNo: `REC-${t.Transaction_ID.replace(/\D/g, '').padStart(6, '0')}`,
      rebateApplied: Number(t.Rebate_Discount_Applied || 0)
    }));
  }

  async payTax(taxId, paymentData) {
    if (apiClient.useBackend) {
      try {
        const data = await apiClient.post(`/taxes/pay`, { taxId, ...paymentData });
        if (data) return data;
      } catch (e) {
        console.info('Using local payTax fallback');
      }
    }

    // Local simulation
    const txId = `TXN${Math.floor(100000 + Math.random() * 900000)}`;
    const newTx = {
      Transaction_ID: txId,
      Citizen_ID: paymentData.citizenId || 'CIT001',
      Amount: paymentData.amount,
      Payment_Method: paymentData.paymentMethod || 'UPI',
      Payment_Status: 'Success',
      Payment_Date: new Date().toISOString().split('T')[0],
      Tax_Type: paymentData.taxType || 'Property Tax',
      Rebate_Discount_Applied: paymentData.rebate || 0
    };

    csvDataLoader.transactions.unshift(newTx);
    return {
      success: true,
      transactionId: txId,
      receiptNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      amountPaid: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      timestamp: new Date().toISOString(),
      xpEarned: 150,
      civicScoreDelta: +25
    };
  }
}

export const taxService = new TaxService();
