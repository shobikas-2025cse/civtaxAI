import { apiClient } from './apiClient';
import { csvDataLoader } from './csvDataLoader';

class AdminService {
  async getMetrics() {
    if (apiClient.useBackend) {
      try {
        const data = await apiClient.get('/admin/metrics');
        if (data && data.totalCollected !== undefined) return data;
      } catch (e) {
        console.info('Using local admin metrics fallback');
      }
    }
    const summary = csvDataLoader.getSummary();
    return {
      totalCollected: Number(summary.Total_Amount_Collected || 3242800),
      totalPending: Number(summary.Total_Outstanding_Dues || 2095900),
      totalOverdue: Math.round(Number(summary.Total_Outstanding_Dues || 2095900) * 0.7),
      complianceRate: Number(summary.Overall_Collection_Rate_pct || 60.7),
      totalCitizens: Number(summary.Total_Citizens || 300),
      autoPayEnrolled: Number(summary.AutoPay_Enrolled || 132),
      highRiskCitizens: Number(summary.High_Risk_Citizens || 200)
    };
  }

  async getWards() {
    if (apiClient.useBackend) {
      try {
        const data = await apiClient.get('/admin/wards');
        if (data && Array.isArray(data) && data.length > 0) return data;
      } catch (e) {
        console.info('Using local admin wards fallback');
      }
    }
    const rawWards = csvDataLoader.getWards();
    const officerMap = {
      W01: 'Divya Nair',
      W02: 'Karthik Subbaiah',
      W03: 'Divya Nair',
      W04: 'Karthik Subbaiah',
      W05: 'Karthik Subbaiah',
      W06: 'Arjun Pillai',
      W07: 'Divya Nair',
      W08: 'Arjun Pillai'
    };
    return rawWards.map(w => ({
      code: w.Ward_ID,
      name: `Ward ${w.Ward_ID.replace('W', '')} – ${w.Ward_Name}`,
      wardName: w.Ward_Name,
      population: Number(w.Total_Citizens || 35) * 450,
      officer: officerMap[w.Ward_ID] || 'Karthik Subbaiah',
      rate: Number(w.Collection_Rate_pct || 60),
      totalCollected: w.Total_Collected,
      totalOutstanding: w.Total_Outstanding
    }));
  }

  async getOfficers() {
    if (apiClient.useBackend) {
      try {
        const data = await apiClient.get('/admin/officers');
        if (data && Array.isArray(data) && data.length > 0) return data;
      } catch (e) {
        console.info('Using local officers fallback');
      }
    }
    return [
      { id: 'O001', name: 'Karthik Subbaiah', ward: 'Ward 2, Ward 4, Ward 5', role: 'Senior Collector', active: true },
      { id: 'O002', name: 'Divya Nair', ward: 'Ward 1, Ward 3, Ward 7', role: 'Field Collector', active: true },
      { id: 'O003', name: 'Arjun Pillai', ward: 'Ward 6, Ward 8', role: 'Junior Collector', active: false },
    ];
  }

  async getRoles() {
    if (apiClient.useBackend) {
      try {
        const data = await apiClient.get('/admin/roles');
        if (data && Array.isArray(data) && data.length > 0) return data;
      } catch (e) {
        console.info('Using local roles fallback');
      }
    }
    return [
      { name: 'System Admin', perms: ['Full System Access', 'Config', 'Users', 'Reports', 'Audit Logs'] },
      { name: 'Tax Collector', perms: ['View Citizens', 'Record Payment', 'Generate Notice', 'View Ward Report'] },
      { name: 'Auditor', perms: ['View All Reports', 'Audit Logs', 'Export Data'] },
      { name: 'Citizen', perms: ['View Own Bills', 'Pay Tax', 'Download Receipts', 'View Rewards'] },
    ];
  }

  async getActivityLogs() {
    if (apiClient.useBackend) {
      try {
        const data = await apiClient.get('/admin/logs');
        if (data && Array.isArray(data) && data.length > 0) return data;
      } catch (e) {
        console.info('Using local activity logs fallback');
      }
    }
    return [
      { type: 'config', msg: 'Tax Rules updated by Admin · Property rate 1.5% active', time: '2m ago', color: 'text-amber-400' },
      { type: 'payment', msg: 'Rekha Menon (C001) paid ₹13,800 — Ward 02 · Auto-confirmed', time: '12m ago', color: 'text-green-400' },
      { type: 'alert', msg: 'Anil Reddy (C003) flagged High Risk (Overdue ₹8,300)', time: '45m ago', color: 'text-red-400' },
      { type: 'officer', msg: 'Officer Divya Nair logged in · Bangalore Municipal Zone', time: '2h ago', color: 'text-blue-400' },
      { type: 'reward', msg: 'Lakshmi Pillai (C002) awarded Gold Model Citizen badge', time: '3h ago', color: 'text-purple-400' },
      { type: 'config', msg: 'Early Bird Discount (5%) synchronized across 8 wards', time: '5h ago', color: 'text-amber-400' },
    ];
  }

  async getMonthlyRevenueTrend() {
    if (apiClient.useBackend) {
      try {
        const data = await apiClient.get('/admin/trends');
        if (data && Array.isArray(data) && data.length > 0) return data;
      } catch (e) {
        console.info('Using local revenue trend fallback');
      }
    }
    return csvDataLoader.getMonthlyTrend();
  }

  async saveAndPropagate(config) {
    if (apiClient.useBackend) {
      try {
        const data = await apiClient.post('/admin/rules/propagate', config);
        if (data) return data;
      } catch (e) {
        console.info('Using local save fallback');
      }
    }
    // Save locally
    localStorage.setItem('civtax_admin_config', JSON.stringify(config));
    return { success: true, timestamp: new Date().toISOString(), syncedModules: ['Citizen Portal', 'Tax Collector Dashboard', 'DIGIT Engine'] };
  }
}

export const adminService = new AdminService();
