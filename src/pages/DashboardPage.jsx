import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Droplets, Trash2, Clock, TrendingUp, ChevronRight, CalendarDays, 
  AlertTriangle, Sparkles, ShieldCheck, ShieldAlert, ArrowUpRight, Download, 
  CreditCard, CheckCircle2, Award, Zap, Trophy, FileText, Check, Flame, 
  ArrowRight, X, RefreshCw, Layers, Shield
} from 'lucide-react';

export default function DashboardPage() {
  const { user, getTaxes, payTax, getPaymentHistory } = useAuth();
  const taxes = getTaxes();
  const paymentHistory = getPaymentHistory().filter(p => !user || p.citizenId === user.id);
  
  const pendingTaxes = taxes.filter(t => t.status === 'pending');
  const overdueTaxes = taxes.filter(t => t.status === 'overdue');
  const paidTaxes = taxes.filter(t => t.status === 'paid');
  const totalDue = [...pendingTaxes, ...overdueTaxes].reduce((sum, t) => sum + (t.amount + (t.arrears || 0)), 0);

  // Hub Active Tab: 'pending' | 'ranking' | 'history'
  const [activeHubTab, setActiveHubTab] = useState('pending');
  
  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTaxToPay, setSelectedTaxToPay] = useState(null);
  const [paymentMode, setPaymentMode] = useState('yearly'); // 'monthly' | 'yearly'
  const [isAutoPayEnabled, setIsAutoPayEnabled] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  
  // PDF Download Toast State
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);

  const getTaxIcon = (type) => {
    if (type.includes('Property')) return <Building2 className="w-5 h-5 text-amber-400" />;
    if (type.includes('Water')) return <Droplets className="w-5 h-5 text-cyan-400" />;
    return <Trash2 className="w-5 h-5 text-orange-400" />;
  };

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  };

  // Open Payment Modal
  const handleOpenPaymentModal = (taxItem = null) => {
    setSelectedTaxToPay(taxItem);
    setPaymentSuccessData(null);
    setIsPaymentModalOpen(true);
  };

  // Execute Payment Simulation
  const handleExecutePayment = () => {
    setIsProcessingPayment(true);
    const targetTaxId = selectedTaxToPay ? selectedTaxToPay.id : (overdueTaxes[0]?.id || pendingTaxes[0]?.id || 'TAX001');
    
    setTimeout(() => {
      setIsProcessingPayment(false);
      const rewardResult = payTax(targetTaxId, paymentMode === 'yearly' ? 'Yearly Lump Sum (5% Rebate)' : 'Monthly Auto-Debit (Instalment 1/3)');
      
      const paymentAmount = selectedTaxToPay 
        ? (selectedTaxToPay.amount + (selectedTaxToPay.arrears || 0))
        : totalDue;
      
      const discountedAmount = paymentMode === 'yearly' 
        ? Math.round(paymentAmount * 0.95)
        : Math.round(paymentAmount / 3);

      setPaymentSuccessData({
        txnId: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
        amountPaid: discountedAmount,
        discountApplied: paymentMode === 'yearly' ? Math.round(paymentAmount * 0.05) : 0,
        mode: paymentMode,
        autoPay: isAutoPayEnabled,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        rewardCertificate: paymentMode === 'yearly' ? '🌟 Gold Model Citizen Tax Compliance Certificate' : null
      });
    }, 1000);
  };

  // Simulate PDF Download
  const handleDownloadPDF = (receiptId, taxType) => {
    setDownloadingReceiptId(receiptId);
    setTimeout(() => {
      setDownloadingReceiptId(null);
      // Create a mock download blob trigger
      const element = document.createElement('a');
      const file = new Blob([
        `=====================================================\n` +
        `GOVERNMENT OF TELANGANA — CIVTAX AI MUNICIPAL RECEIPT\n` +
        `=====================================================\n` +
        `Receipt ID: ${receiptId}\n` +
        `Citizen: ${user?.name || 'Citizen'}\n` +
        `Property ID: ${user?.propertyId || 'PROP-JH-4521'}\n` +
        `Ward: ${user?.ward || 'Ward 12'}\n` +
        `Tax Category: ${taxType}\n` +
        `Payment Status: 100% CLEARED & VERIFIED (256-Bit SSL)\n` +
        `Date: ${new Date().toISOString().split('T')[0]}\n` +
        `Civic Credit Score: +25 XP Boosted\n` +
        `=====================================================\n`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `CivTax_Receipt_${receiptId}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 800);
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up font-sans text-white">
      
      {/* ========================================================================= */}
      {/* 1. DASHBOARD HEADER: Citizen Profile, Civic Score (780 - Gold), Ward Rank  */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-[#0C0E15] via-[#121522] to-[#0C0E15] border border-[#222838] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF8C00]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Citizen Profile Details */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[#FF8C00] text-xs font-bold uppercase tracking-wider">
                  Citizen Portal • {user?.status === 'Defaulter' ? 'Action Required' : 'Active Resident'}
                </p>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {user?.name || 'Citizen'}
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm">
                {user?.ward || 'Ward 02 - Rajajinagar'} • Property ID: <span className="text-gray-200 font-mono font-bold">{user?.propertyId || 'PROP-W02-0001'}</span>
              </p>
            </div>

            {/* Header Widgets: Civic Score & Ward Ranking Badge */}
            <div className="flex flex-wrap items-center gap-3.5">
              
              {/* Civic Score Gauge Card */}
              <div className="bg-[#161A28] border border-[#2B3349] px-4 py-3 rounded-2xl flex items-center gap-3.5 shadow-md">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-black text-lg shadow-md shadow-amber-500/20">
                  <Trophy className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Civic Credit Score</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-amber-400">{user?.civicCreditScore || 780}</span>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {user?.civicCreditScore >= 800 ? 'Gold Tier 🌟' : user?.civicCreditScore >= 650 ? 'Silver Tier' : 'Needs Action 🚨'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ward Ranking Badge Card */}
              <div className="bg-[#161A28] border border-[#2B3349] px-4 py-3 rounded-2xl flex items-center gap-3.5 shadow-md">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-black text-lg">
                  #{user?.rank || (user?.civicCreditScore >= 800 ? 3 : 12)}
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Ward Ranking</p>
                  <p className="text-sm font-black text-white">#{user?.rank || (user?.civicCreditScore >= 800 ? 3 : 12)} in {user?.wardName || 'Ward'}</p>
                  <p className="text-[10px] text-gray-400">Top {user?.civicCreditScore >= 800 ? '2%' : '15%'} on-time taxpayer</p>
                </div>
              </div>

              {/* Status Compliance Pill */}
              <div className="self-center">
                <span className={`px-4 py-2 rounded-2xl text-xs font-black border flex items-center gap-1.5 shadow ${
                  user?.status === 'Defaulter' 
                    ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                }`}>
                  {user?.status === 'Defaulter' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{user?.status || 'Compliant'}</span>
                </span>
              </div>

            </div>

          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 border-t border-[#222838]">
            <div className="bg-[#111420] p-3.5 rounded-2xl border border-[#202636]">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Pending Dues</p>
              <p className="text-xl sm:text-2xl font-black text-[#FF8C00] mt-0.5">₹{totalDue.toLocaleString()}</p>
            </div>
            <div className="bg-[#111420] p-3.5 rounded-2xl border border-[#202636]">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Payment Streak</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 flex items-center gap-1">
                <Flame className="w-5 h-5 text-orange-400 fill-orange-400" /> {user?.streak || 3} Months
              </p>
            </div>
            <div className="bg-[#111420] p-3.5 rounded-2xl border border-[#202636]">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Taxes Paid</p>
              <p className="text-xl sm:text-2xl font-black text-white mt-0.5">₹{(user?.amountPaid || 0).toLocaleString()}</p>
            </div>
            <div className="bg-[#111420] p-3.5 rounded-2xl border border-[#202636]">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Citizen XP Score</p>
              <p className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">{user?.xp || 2250} XP</p>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN HUB TABS NAVIGATION                                               */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-[#222838] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveHubTab('pending')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeHubTab === 'pending'
              ? 'bg-[#FF8C00] text-black shadow-lg shadow-[#FF8C00]/25'
              : 'bg-[#111420] text-gray-400 hover:text-white border border-[#222838]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Pending Payments ({pendingTaxes.length + overdueTaxes.length})
        </button>

        <button
          onClick={() => setActiveHubTab('ranking')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeHubTab === 'ranking'
              ? 'bg-[#FF8C00] text-black shadow-lg shadow-[#FF8C00]/25'
              : 'bg-[#111420] text-gray-400 hover:text-white border border-[#222838]'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Citizen Ranking & Rewards
        </button>

        <button
          onClick={() => setActiveHubTab('history')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeHubTab === 'history'
              ? 'bg-[#FF8C00] text-black shadow-lg shadow-[#FF8C00]/25'
              : 'bg-[#111420] text-gray-400 hover:text-white border border-[#222838]'
          }`}
        >
          <FileText className="w-4 h-4" />
          Payment History & Receipts ({paymentHistory.length + paidTaxes.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB 1: PENDING PAYMENTS CARD (Itemized Dues, Timeline, Countdown, Pay)   */}
      {/* ========================================================================= */}
      {activeHubTab === 'pending' && (
        <div className="space-y-6 animate-fade-in-up">
          
          {/* Overdue Warning Notice if applicable */}
          {overdueTaxes.length > 0 && (
            <div className="bg-red-500/10 border-2 border-red-500/40 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-red-500/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-center justify-center text-red-400 flex-shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-red-300 font-extrabold text-base">Overdue Notice ({overdueTaxes.length} Pending Bills)</h3>
                    <span className="text-[10px] bg-red-500/30 text-red-300 font-bold px-2 py-0.5 rounded-full uppercase">Action Required</span>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm mt-0.5">
                    Clear arrears immediately to protect your Civic Credit Score (780) and qualify for penalty amnesty waivers.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenPaymentModal(overdueTaxes[0])}
                className="bg-red-500 hover:bg-red-600 text-white font-extrabold px-6 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all flex-shrink-0 cursor-pointer"
              >
                Clear Overdue Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Itemized Tax Dues Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Itemized Tax Cards */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#FF8C00]" />
                  Itemized Municipal Tax Dues
                </h2>
                <span className="text-xs text-gray-400 font-medium">Auto-Synced with DIGIT / UPYOG</span>
              </div>

              <div className="space-y-4">
                {[...overdueTaxes, ...pendingTaxes].map((tax) => {
                  const daysLeft = getDaysUntilDue(tax.due);
                  const isOverdue = daysLeft < 0;
                  const totalTaxAmount = tax.amount + (tax.arrears || 0);

                  return (
                    <div 
                      key={tax.id} 
                      className={`bg-[#0F121C] border-2 rounded-3xl p-5 sm:p-6 transition-all relative overflow-hidden ${
                        isOverdue ? 'border-red-500/40 hover:border-red-500' : 'border-[#222838] hover:border-[#FF8C00]/50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        {/* Tax Type & Details */}
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className="w-12 h-12 bg-[#161B28] border border-[#2B3349] rounded-2xl flex items-center justify-center flex-shrink-0">
                            {getTaxIcon(tax.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-white text-base sm:text-lg">{tax.type}</h3>
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                                isOverdue ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-[#FF8C00]/20 text-[#FF8C00] border-[#FF8C00]/40'
                              }`}>
                                {tax.period}
                              </span>
                            </div>
                            <p className="text-gray-400 text-xs mt-0.5">
                              Due Date: <span className="text-gray-200 font-medium">{tax.due}</span>
                              {tax.arrears && <span className="text-red-400 ml-2 font-bold">(Includes ₹{tax.arrears} arrears)</span>}
                            </p>
                          </div>
                        </div>

                        {/* Due Countdown Pill & Amount */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#222838]">
                          
                          {/* Countdown Indicator */}
                          <div className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                            isOverdue 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                              : daysLeft <= 15
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{isOverdue ? `${Math.abs(daysLeft)} Days Overdue` : `${daysLeft} Days Left`}</span>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-black text-white">₹{totalTaxAmount.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400">Net Payable</p>
                          </div>

                          {/* Individual Pay Button */}
                          <button
                            onClick={() => handleOpenPaymentModal(tax)}
                            className="bg-[#FF8C00] hover:bg-[#E07B00] text-black font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-[#FF8C00]/20 transition-all cursor-pointer"
                          >
                            Pay Bill
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                        </div>

                      </div>
                    </div>
                  );
                })}

                {pendingTaxes.length === 0 && overdueTaxes.length === 0 && (
                  <div className="bg-[#0F121C] border border-[#222838] rounded-3xl p-10 text-center space-y-3">
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-white">All Municipal Dues Cleared!</h3>
                    <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto">
                      You have 0 pending dues. Thank you for being a Gold Model Citizen and supporting your ward's development.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right 1 Column: Penalty Escalation Timeline Indicator & Pay All CTA */}
            <div className="space-y-6">
              
              {/* Grand Total Pay Now Card */}
              <div className="bg-gradient-to-br from-[#141724] to-[#0D101A] border-2 border-[#FF8C00]/40 rounded-3xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#FF8C00] uppercase tracking-wider">Quick Checkout</span>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    5% Yearly Discount Active
                  </span>
                </div>

                <div>
                  <p className="text-gray-400 text-xs">Total Outstanding Municipal Balance</p>
                  <p className="text-3xl sm:text-4xl font-black text-white mt-1">₹{totalDue.toLocaleString()}</p>
                </div>

                <button
                  onClick={() => handleOpenPaymentModal(null)}
                  disabled={totalDue === 0}
                  className="w-full bg-[#FF8C00] hover:bg-[#E07B00] disabled:opacity-40 disabled:cursor-not-allowed text-black font-black py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg shadow-[#FF8C00]/25 transition-all cursor-pointer"
                >
                  <Zap className="w-5 h-5 fill-black" />
                  Pay Total Dues Now
                </button>

                <p className="text-[11px] text-gray-400 text-center">
                  Instant receipt generation • 0% installment option available
                </p>
              </div>

              {/* Penalty Warning Timeline Indicator (+30 / +60 / +90 Days Escalation) */}
              <div className="bg-[#0F121C] border border-[#222838] rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h3 className="font-extrabold text-white text-sm">Penalty Escalation Timeline</h3>
                </div>
                
                <p className="text-gray-400 text-xs leading-relaxed">
                  Municipal tax collection operates on progressive behavioral timelines:
                </p>

                {/* Timeline Stages */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-emerald-300">0 – 30 Days (On-Time Grace Window)</p>
                      <p className="text-gray-400 text-[11px] mt-0.5">0% penalty surcharge • Claim up to 5% early-bird discount & +25 XP.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-amber-300">+30 Days Delay (First Surcharge)</p>
                      <p className="text-gray-400 text-[11px] mt-0.5">+5% penalty interest applied • Civic credit score dips by 15 pts.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/30">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-red-300">+60 – 90 Days (Legal Demand Escalation)</p>
                      <p className="text-gray-400 text-[11px] mt-0.5">+10% penalty + ULB legal demand notice • Doorstep mobile kiosk visit.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB 2: CITIZEN RANKING & REWARDS WIDGET (Streaks, Badges, Perks, Wards)  */}
      {/* ========================================================================= */}
      {activeHubTab === 'ranking' && (
        <div className="space-y-6 animate-fade-in-up">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Streaks, Active Badges & Unlocked Civic Perks */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Payment Streak & Loss Aversion Banner */}
              <div className="bg-gradient-to-r from-[#171B2A] to-[#111420] border-2 border-[#FF8C00]/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#FF8C00]/20 border-2 border-[#FF8C00] rounded-2xl flex items-center justify-center text-[#FF8C00] shadow-lg shadow-[#FF8C00]/20">
                      <Flame className="w-8 h-8 fill-[#FF8C00]" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-[#FF8C00] uppercase tracking-wider">Active Payment Streak</span>
                      <h3 className="text-2xl sm:text-3xl font-black text-white">{user?.streak || 6} Months Unbroken</h3>
                    </div>
                  </div>

                  <div className="bg-[#0B0D14] px-4 py-2 rounded-2xl border border-[#232A3E] text-right">
                    <p className="text-gray-400 text-[10px] uppercase font-bold">Next Milestone</p>
                    <p className="text-sm font-black text-amber-300">12 Months (Diamond Pass)</p>
                  </div>
                </div>

                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  Protect your streak to preserve your <strong className="text-amber-400">Gold Model Citizen</strong> standing and maintain priority access to municipal permits.
                </p>
              </div>

              {/* Active Badges Grid */}
              <div className="bg-[#0F121C] border border-[#222838] rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#FF8C00]" />
                    Earned Municipal Badges
                  </h3>
                  <span className="text-xs text-gray-400">4 of 6 Unlocked</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {[
                    { title: 'Streak Master', desc: '6 months on-time', icon: '🔥', active: true, color: 'border-orange-500/40 bg-orange-500/10' },
                    { title: 'Early Bird', desc: 'Paid in grace window', icon: '⚡', active: true, color: 'border-amber-500/40 bg-amber-500/10' },
                    { title: 'Zero Waste Hero', desc: 'Pledged segregation', icon: '🌱', active: true, color: 'border-emerald-500/40 bg-emerald-500/10' },
                    { title: 'Gold Taxpayer', desc: 'Civic score >750', icon: '🏆', active: true, color: 'border-cyan-500/40 bg-cyan-500/10' },
                  ].map((b) => (
                    <div key={b.title} className={`p-4 rounded-2xl border ${b.color} text-center space-y-1.5 shadow-sm`}>
                      <span className="text-2xl block">{b.icon}</span>
                      <h4 className="font-extrabold text-white text-xs">{b.title}</h4>
                      <p className="text-gray-400 text-[10px]">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unlocked Civic Perks */}
              <div className="bg-[#0F121C] border border-[#222838] rounded-3xl p-6 space-y-4">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Unlocked Civic Perks & Benefits
                </h3>

                <div className="space-y-3">
                  {[
                    { perk: 'VIP Fast-Track Municipal Permit Clearance', value: '48h SLA turnaround', icon: '⚡', status: 'Active' },
                    { perk: '10% Extra Cashback Coupon on Water Tax', value: 'Saved ₹220', icon: '🎁', status: 'Claimed' },
                    { perk: 'Community Hall 25% Booking Rebate', value: 'Applicable across Ward 12', icon: '🏛️', status: 'Active' },
                  ].map((p) => (
                    <div key={p.perk} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#141724] border border-[#232A3E]">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{p.icon}</span>
                        <div>
                          <p className="font-bold text-white text-xs sm:text-sm">{p.perk}</p>
                          <p className="text-gray-400 text-[11px]">{p.value}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/40">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right 1 Column: Ward Leaderboard */}
            <div className="space-y-6">
              <div className="bg-[#0F121C] border border-[#222838] rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    Ward Leaderboard
                  </h3>
                  <span className="text-[11px] text-gray-400">Live Collection %</span>
                </div>

                <div className="space-y-3">
                  {[
                    { rank: 1, ward: 'Ward 5 - Tech Park', eff: '94%', prize: '₹25L Green Fund 🏆' },
                    { rank: 2, ward: 'Ward 12 - Jubilee Hills', eff: '87%', prize: 'Your Ward (Rank #2)' },
                    { rank: 3, ward: 'Ward 8 - Banjara Hills', eff: '84%', prize: 'Top 3 Pod' },
                    { rank: 4, ward: 'Ward 1 - Central Zone', eff: '79%', prize: 'Moderate' },
                    { rank: 5, ward: 'Ward 3 - Old City', eff: '64%', prize: 'Intervention' },
                  ].map((w) => (
                    <div 
                      key={w.ward} 
                      className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                        w.ward.includes('Ward 12') 
                          ? 'bg-[#FF8C00]/10 border-[#FF8C00]/50 shadow-md' 
                          : 'bg-[#141724] border-[#222838]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                          w.rank === 1 ? 'bg-amber-400 text-black' : 'bg-[#222838] text-gray-300'
                        }`}>
                          {w.rank}
                        </span>
                        <div>
                          <p className="font-bold text-white text-xs">{w.ward}</p>
                          <p className="text-[10px] text-gray-400">{w.prize}</p>
                        </div>
                      </div>
                      <span className="font-black text-xs text-amber-400">{w.eff}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 3: PAYMENT HISTORY (Receipts with PDF Download, Statements)         */}
      {/* ========================================================================= */}
      {activeHubTab === 'history' && (
        <div className="space-y-6 animate-fade-in-up">
          
          <div className="bg-[#0F121C] border border-[#222838] rounded-3xl p-6 sm:p-8 space-y-6">
            
            {/* Header & Export Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222838] pb-6">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#FF8C00]" />
                  Verified Tax Payment History & Receipts
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                  Download official digitally signed municipal receipts and yearly statements.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownloadPDF('STATEMENT-2025-26', 'Annual Consolidated Statement')}
                  className="bg-[#161B28] hover:bg-[#20273A] border border-[#2B3349] text-gray-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#FF8C00]" />
                  Export FY 2025–26 Statement
                </button>
              </div>
            </div>

            {/* Payment Ledger Table */}
            <div className="space-y-3">
              {paymentHistory.length > 0 ? (
                paymentHistory.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#141724] border border-[#222838] hover:border-[#FF8C00]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-white text-sm sm:text-base">{item.type}</h4>
                          <span className="text-[10px] font-mono bg-[#1E2436] text-gray-300 px-2 py-0.5 rounded border border-[#2F3750]">
                            {item.id}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-0.5">
                          Paid on {item.date} via <strong className="text-gray-300">{item.method}</strong> • {item.ward}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#222838]">
                      <div className="text-right">
                        <p className="font-black text-emerald-400 text-base sm:text-lg">₹{item.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400">100% Cleared</p>
                      </div>

                      {/* Download PDF Button */}
                      <button
                        onClick={() => handleDownloadPDF(item.id, item.type)}
                        disabled={downloadingReceiptId === item.id}
                        className="bg-[#1B2030] hover:bg-[#FF8C00] hover:text-black border border-[#2E374E] text-gray-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {downloadingReceiptId === item.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>Receipt PDF</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-gray-400 space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-gray-500" />
                  <p className="text-sm">No transaction records found</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: CHOOSE PAYMENT MODE (Monthly Instalments vs Yearly Lump Sum)    */}
      {/* ========================================================================= */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0D1018] border-2 border-[#252C3E] rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-full bg-[#181D2C] border border-[#2B3349] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!paymentSuccessData ? (
              <div className="space-y-6">
                
                {/* Modal Title */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#FF8C00]" />
                    <span className="text-[#FF8C00] text-xs font-bold uppercase tracking-wider">One-Tap Municipal Checkout</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">Choose Payment Mode</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    {selectedTaxToPay 
                      ? `Paying for ${selectedTaxToPay.type} (${selectedTaxToPay.period})` 
                      : `Consolidated payment for all pending municipal dues`}
                  </p>
                </div>

                {/* Mode Selector Tabs: Monthly Instalments vs Yearly Payment */}
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#141724] border border-[#232A3E] rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('monthly')}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                      paymentMode === 'monthly'
                        ? 'bg-[#FF8C00] text-black shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Monthly Instalments
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('yearly')}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer relative ${
                      paymentMode === 'yearly'
                        ? 'bg-[#FF8C00] text-black shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>Yearly Lump Sum</span>
                    <span className="ml-1.5 text-[9px] bg-emerald-500 text-black px-1.5 py-0.5 rounded-full font-black">
                      5% OFF
                    </span>
                  </button>
                </div>

                {/* Mode Details Card */}
                {paymentMode === 'monthly' ? (
                  <div className="p-5 rounded-2xl bg-[#141724] border border-[#232A3E] space-y-4 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">3 Equal Monthly Instalments (0% Interest)</h4>
                        <p className="text-gray-400 text-xs mt-0.5">Split payments across 3 cycles with zero penalty.</p>
                      </div>
                      <span className="text-lg font-black text-amber-400">
                        ₹{Math.round((selectedTaxToPay ? (selectedTaxToPay.amount + (selectedTaxToPay.arrears || 0)) : totalDue) / 3).toLocaleString()}/mo
                      </span>
                    </div>

                    {/* Auto-pay Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F121C] border border-[#222838]">
                      <div className="flex items-center gap-2.5">
                        <RefreshCw className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="font-bold text-xs text-white">Enable Auto-Debit on 5th of each month</p>
                          <p className="text-gray-400 text-[10px]">Via UPI e-Mandate / Net Banking</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAutoPayEnabled(!isAutoPayEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          isAutoPayEnabled ? 'bg-emerald-500' : 'bg-gray-700'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          isAutoPayEnabled ? 'right-1' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-emerald-300 text-sm">Yearly One-Shot Payment</h4>
                        <p className="text-gray-300 text-xs mt-0.5">5% Early-Bird Municipal Rebate + Digital Reward Certificate.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs line-through text-gray-400 block">
                          ₹{(selectedTaxToPay ? (selectedTaxToPay.amount + (selectedTaxToPay.arrears || 0)) : totalDue).toLocaleString()}
                        </span>
                        <span className="text-xl font-black text-emerald-400">
                          ₹{Math.round((selectedTaxToPay ? (selectedTaxToPay.amount + (selectedTaxToPay.arrears || 0)) : totalDue) * 0.95).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/20 p-2.5 rounded-xl">
                      <Award className="w-4 h-4 flex-shrink-0" />
                      <span>Unlocks <strong>Gold Model Citizen Certificate</strong> & +25 Civic XP!</span>
                    </div>
                  </div>
                )}

                {/* CTA Execution Button */}
                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={isProcessingPayment}
                  className="w-full bg-[#FF8C00] hover:bg-[#E07B00] text-black font-black py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg shadow-[#FF8C00]/25 transition-all cursor-pointer"
                >
                  {isProcessingPayment ? (
                    <div className="w-6 h-6 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      Confirm & Pay Now
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Success Confirmation Screen */
              <div className="space-y-6 text-center py-4 animate-fade-in-up">
                <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Payment Cleared Successfully</span>
                  <h3 className="text-2xl font-black text-white mt-1">₹{paymentSuccessData.amountPaid.toLocaleString()} Paid</h3>
                  <p className="text-gray-400 text-xs mt-1">Transaction ID: <span className="font-mono text-gray-200">{paymentSuccessData.txnId}</span></p>
                </div>

                {paymentSuccessData.rewardCertificate && (
                  <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-left space-y-1">
                    <p className="text-amber-300 font-bold text-xs flex items-center gap-1.5">
                      <Award className="w-4 h-4" /> Reward Certificate Unlocked!
                    </p>
                    <p className="text-gray-300 text-xs">{paymentSuccessData.rewardCertificate}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownloadPDF(paymentSuccessData.txnId, selectedTaxToPay?.type || 'Property Tax')}
                    className="flex-1 bg-[#181D2C] hover:bg-[#22293E] border border-[#2B3349] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#FF8C00]" />
                    Download Receipt
                  </button>

                  <button
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="flex-1 bg-[#FF8C00] hover:bg-[#E07B00] text-black font-black py-3 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
