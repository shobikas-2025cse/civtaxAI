import { createContext, useContext, useState, useEffect } from 'react';
import { 
  citizenService, 
  taxService, 
  wardService, 
  csvDataLoader,
  formatCitizenFromCSV 
} from '../services';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastPaymentReward, setLastPaymentReward] = useState(null);
  const [allCitizens, setAllCitizens] = useState([]);
  const [wardRankings, setWardRankings] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [taxDataStore, setTaxDataStore] = useState({});

  // Initialize data from service layer
  useEffect(() => {
    async function loadData() {
      try {
        const citizensList = await citizenService.getAllCitizens();
        setAllCitizens(citizensList);

        const wardsList = await wardService.getWardSummaries();
        setWardRankings(wardsList);

        const txnsList = await taxService.getTransactions();
        setPaymentHistory(txnsList);

        // Pre-build tax dictionary per citizen
        const taxesMap = {};
        for (const c of citizensList) {
          taxesMap[c.id] = await taxService.getCitizenTaxes(c.id);
        }
        setTaxDataStore(taxesMap);

        // Check if there is a saved session
        const saved = localStorage.getItem('civtax_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.role === 'citizen') {
              const matched = citizensList.find(c => c.id === parsed.id || c.phone === parsed.phone) || parsed;
              setUser({ ...matched, role: 'citizen' });
            } else {
              setUser(parsed);
            }
            setIsAuthenticated(true);
          } catch {
            localStorage.removeItem('civtax_user');
          }
        }
      } catch (err) {
        console.error('Service layer init error:', err);
      }
    }
    loadData();
  }, []);

  // login(phone, role) — role is 'citizen' | 'collector' | 'admin'
  const login = async (phone, role = 'citizen') => {
    let sessionUser;

    if (role === 'citizen') {
      // Find matching citizen in CSV service layer or format a new one
      const cleanPhone = String(phone).replace(/\D/g, '');
      let citizen = allCitizens.find(c => {
        const p = String(c.phone || '').replace(/\D/g, '');
        return p === cleanPhone || p.endsWith(cleanPhone) || cleanPhone.endsWith(p);
      });

      if (!citizen) {
        // Create new citizen model via service
        citizen = formatCitizenFromCSV({
          Citizen_ID: 'CIT' + Date.now().toString().slice(-3),
          Name: 'Verified Resident',
          Phone: phone,
          Ward_ID: 'W02',
          Ward_Name: 'Rajajinagar',
          Annual_Tax: 14500,
          Amount_Paid: 0,
          Outstanding_Dues: 14500,
          Payment_Delay_Risk: 'Low'
        });
      }

      sessionUser = { ...citizen, role: 'citizen' };
    } else if (role === 'collector') {
      sessionUser = {
        id: 'OFC-' + phone.slice(-4),
        name: 'Tax Officer Anand Verma',
        phone,
        ward: 'Bangalore Municipal Corp · Zone 4',
        role: 'collector',
      };
    } else if (role === 'admin') {
      sessionUser = {
        id: 'ADM-' + phone.slice(-4),
        name: 'Municipal Admin Superuser',
        phone,
        role: 'admin',
      };
    }

    setUser(sessionUser);
    setIsAuthenticated(true);
    localStorage.setItem('civtax_user', JSON.stringify(sessionUser));
    return sessionUser;
  };

  const switchUser = async (citizenId) => {
    const target = allCitizens.find(c => c.id === citizenId || c.Citizen_ID === citizenId);
    if (target) {
      const full = { ...target, role: 'citizen' };
      setUser(full);
      setIsAuthenticated(true);
      localStorage.setItem('civtax_user', JSON.stringify(full));
    }
  };

  const togglePledge = (pledgeId) => {
    if (!user || !user.communityPledges) return;
    const updatedPledges = user.communityPledges.map(p => {
      if (p.id === pledgeId) {
        return { ...p, pledged: !p.pledged, count: p.pledged ? p.count - 1 : p.count + 1 };
      }
      return p;
    });
    const updatedUser = { ...user, communityPledges: updatedPledges };
    setUser(updatedUser);
    localStorage.setItem('civtax_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('civtax_user');
  };

  const getTaxes = () => {
    if (!user) return [];
    if (taxDataStore[user.id]) return taxDataStore[user.id];
    // Generate dynamically from user properties
    const annualTax = user.annualTax || 12500;
    const outstanding = user.outstandingDues !== undefined ? user.outstandingDues : (user.status === 'Defaulter' ? 8300 : 0);
    
    if (outstanding > 0) {
      return [
        { id: `TAX-${user.id}-01`, type: 'Property Tax', amount: Math.round(outstanding * 0.8), due: '2026-06-01', status: 'overdue', period: 'Q2 2026', daysUntilDue: -25, arrears: 50 },
        { id: `TAX-${user.id}-02`, type: 'Water Tax', amount: Math.round(outstanding * 0.2), due: '2026-08-30', status: 'pending', period: 'Aug 2026', daysUntilDue: 22 }
      ];
    }
    return [
      { id: `TAX-${user.id}-01`, type: 'Property Tax', amount: annualTax, due: '2026-06-15', status: 'paid', period: 'Q2 2026', paidOn: '2026-06-10' },
      { id: `TAX-${user.id}-02`, type: 'Water Tax', amount: 1800, due: '2026-07-30', status: 'paid', period: 'Jul 2026', paidOn: '2026-07-25' }
    ];
  };

  const getPaymentHistory = () => {
    return paymentHistory;
  };

  const getCitizenHistory = (citizenId) => {
    const targetId = citizenId || user?.id;
    return paymentHistory.filter(p => p.citizenId === targetId || p.Citizen_ID === targetId);
  };

  // Re-fetch taxes for one citizen from backend and update taxDataStore
  const refreshCitizenTaxes = async (citizenId) => {
    try {
      const freshTaxes = await taxService.getCitizenTaxes(citizenId);
      if (freshTaxes && Array.isArray(freshTaxes)) {
        setTaxDataStore(prev => ({ ...prev, [citizenId]: freshTaxes }));
      }
    } catch (e) {
      console.warn('refreshCitizenTaxes failed, dashboard may show stale data until next load', e);
    }
  };

  // Re-fetch all global lists from backend
  const refreshAllData = async () => {
    try {
      const citizensList = await citizenService.getAllCitizens();
      if (citizensList && Array.isArray(citizensList) && citizensList.length > 0) {
        setAllCitizens(citizensList);
      }
      const wardsList = await wardService.getWardSummaries();
      if (wardsList) setWardRankings(wardsList);
    } catch (e) {
      console.warn('Could not refresh global data:', e);
    }
  };

  // One-Tap Payment — calls backend API to persist payment, then refreshes tax state
  const payTax = async (taxId, paymentMethod = 'UPI One-Tap') => {
    if (!user) return;

    const currentTaxes = taxDataStore[user.id] || getTaxes();
    const targetBill = currentTaxes.find(t => t.id === taxId);

    const paidAmount = targetBill
      ? Number(targetBill.amount || 0)
      : Number(user.outstandingDues || 8300);

    const clearedArrears = (targetBill && targetBill.arrears) ? Number(targetBill.arrears) : 0;
    const currentOutstanding = Number(user.outstandingDues !== undefined ? user.outstandingDues : 8300);
    const newOutstanding = Math.max(0, currentOutstanding - paidAmount);

    // ── BACKEND: persist payment to PostgreSQL/Supabase ─────────────────────
    let backendResult = null;
    try {
      backendResult = await apiClient.post('/taxes/pay', {
        citizenId: user.id,
        taxId: taxId,
        paymentMethod: paymentMethod
      });
    } catch (err) {
      console.error('Backend payment error:', err);
      // Re-throw so caller (PaymentPage / DashboardPage) handles error
      throw err;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const localReceiptId = backendResult?.receiptId || ('RCP' + Math.floor(100000 + Math.random() * 900000));

    const newRecord = {
      id: backendResult?.transactionId || backendResult?.id || ('PAY' + Date.now().toString().slice(-4)),
      citizenId: user.id,
      citizenName: user.name,
      type: targetBill ? `${targetBill.type} Payment` : 'Property & Municipal Tax',
      amount: paidAmount + clearedArrears,
      date: todayStr,
      method: paymentMethod,
      ward: user.ward ? user.ward.split(' - ')[0] : 'W02',
      statusOnTime: true,
      receiptId: localReceiptId
    };

    setPaymentHistory(prev => [newRecord, ...prev]);

    // Update taxDataStore
    setTaxDataStore(prev => {
      const current = prev[user.id] || currentTaxes;
      const updated = current.map(t =>
        (t.id === taxId || (!taxId && newOutstanding === 0))
          ? { ...t, status: 'paid', paidOn: todayStr, arrears: 0 }
          : t
      );
      return { ...prev, [user.id]: updated };
    });

    await refreshCitizenTaxes(user.id);
    await refreshAllData();

    // ── Update citizen gamification & metrics ────────────────────────────────
    const addedXp = 150;
    const newXp = (user.xp || 0) + addedXp;
    const newStreak = (user.streak || 0) + 1;
    const newCreditScore = Math.min(900, (user.civicCreditScore || 700) + (newOutstanding === 0 ? 25 : 10));

    const updatedUser = {
      ...user,
      outstandingDues: newOutstanding,
      amountPaid: (user.amountPaid || 0) + paidAmount,
      xp: newXp,
      streak: newStreak,
      civicCreditScore: newCreditScore,
      civicCreditTier: newCreditScore > 800 ? 'Excellent (Top 2% Taxpayer)' : 'Good Civic Standing',
      status: newOutstanding === 0 ? 'Compliant' : user.status,
      riskScore: newOutstanding === 0 ? 18 : Math.max(25, (user.riskScore || 50) - 20),
      riskCategory: newOutstanding === 0 ? 'Low Risk' : user.riskCategory,
      tier: newCreditScore > 800 ? 'Gold Model Citizen 🌟' : (newCreditScore > 650 ? 'Silver Tier' : user.tier)
    };

    setUser(updatedUser);
    localStorage.setItem('civtax_user', JSON.stringify(updatedUser));
    setAllCitizens(prev => prev.map(c => c.id === user.id ? updatedUser : c));

    // ── Reward modal payload ─────────────────────────────────────────────────
    const rewardPayload = {
      taxType: targetBill ? targetBill.type : 'Property & Municipal Tax',
      amountPaid: paidAmount + clearedArrears,
      clearedArrears,
      addedXp,
      newTotalXp: newXp,
      newStreak,
      newCreditScore,
      unlockedBadge: newStreak >= 3 ? '🔥 Streak Master' : '⚡ Swift Payer',
      rewardScratchPrize: '5% Extra Municipal Cash-Back Voucher + 100 Bonus XP',
      wardRankBoost: `${user.ward ? user.ward.split(' - ')[1] || 'Ward' : 'Ward'} ranked #1 in compliance`,
      backendTxnId: backendResult?.transactionId || backendResult?.id || null,
      backendReceiptId: localReceiptId
    };
    setLastPaymentReward(rewardPayload);
    return rewardPayload;
  };

  const clearRewardModal = () => setLastPaymentReward(null);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      userRole: user?.role ?? null,
      login,
      switchUser,
      logout,
      getTaxes,
      getPaymentHistory,
      getCitizenHistory,
      payTax,
      refreshCitizenTaxes,
      refreshAllData,
      togglePledge,
      lastPaymentReward,
      clearRewardModal,
      allCitizens,
      wardRankings,
      // Direct access to domain services for components
      services: {
        citizen: citizenService,
        tax: taxService,
        ward: wardService,
        collector: csvDataLoader,
        admin: csvDataLoader
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
