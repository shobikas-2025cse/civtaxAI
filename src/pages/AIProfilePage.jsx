import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BrainCircuit, ShieldAlert, ShieldCheck, TrendingUp, AlertTriangle, 
  CheckCircle2, Clock, Calendar, Award, Sparkles, PhoneCall, HelpCircle, 
  Percent, ArrowRight, Zap, RefreshCw, Layers, FileText, ChevronRight
} from 'lucide-react';

export default function AIProfilePage() {
  const { user, switchUser, getCitizenHistory } = useAuth();
  const history = getCitizenHistory();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [amnestyApplied, setAmnestyApplied] = useState(false);
  const [callbackRequested, setCallbackRequested] = useState(false);

  const isDefaulter = user?.status === 'Defaulter';
  const riskScore = user?.riskScore || 50;

  const getRiskColor = (score) => {
    if (score < 30) return { text: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/40', stroke: '#22C55E' };
    if (score < 70) return { text: 'text-mustard-300', bg: 'bg-mustard/20', border: 'border-mustard/40', stroke: '#E5A100' };
    return { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40', stroke: '#EF4444' };
  };

  const riskStyle = getRiskColor(riskScore);

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      {/* Top Banner & Quick Citizen Switcher */}
      <div className="bg-[#1E1E1E] border border-mustard/30 rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-mustard/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="w-5 h-5 text-mustard" />
              <span className="text-mustard text-xs font-extrabold uppercase tracking-wider">CivTax AI Engine • Predictive Profiling</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white flex flex-wrap items-center gap-2">
              AI Citizen Profile: <span className="text-mustard">{user?.name}</span>
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Property ID: <span className="text-gray-200 font-mono font-semibold">{user?.propertyId}</span> • {user?.ward}
            </p>
          </div>

          {/* Citizen Switcher Pills */}
          <div className="bg-[#121212] p-2 rounded-2xl border border-[#333333] flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-400 font-semibold px-2 flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 text-mustard" /> Demo Switcher:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => switchUser('CIT002')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  user?.id === 'CIT002'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow'
                    : 'text-gray-400 hover:text-white hover:bg-[#252525]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                Priya (Compliant)
              </button>
              <button
                onClick={() => switchUser('CIT001')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  user?.id === 'CIT001'
                    ? 'bg-mustard/20 text-mustard-300 border border-mustard/50 shadow'
                    : 'text-gray-400 hover:text-white hover:bg-[#252525]'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-mustard" />
                Rajesh (Defaulter)
              </button>
              <button
                onClick={() => switchUser('CIT003')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  user?.id === 'CIT003'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow'
                    : 'text-gray-400 hover:text-white hover:bg-[#252525]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                Suresh (Critical)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profiling Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Score & AI Classification Card */}
        <div className="bg-[#1E1E1E] border border-[#333333] rounded-2xl p-6 flex flex-col justify-between shadow-sm space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">AI Risk Score & Status</span>
              <span className={`text-[11px] px-3 py-1 rounded-full font-extrabold border ${riskStyle.bg} ${riskStyle.text} ${riskStyle.border}`}>
                {user?.riskCategory}
              </span>
            </div>

            {/* Circular Gauge Representation */}
            <div className="relative w-44 h-44 mx-auto my-4 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#2D2D2D"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={riskStyle.stroke}
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * riskScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-4xl font-black ${riskStyle.text}`}>{riskScore}</span>
                <span className="text-gray-400 text-xs mt-0.5 font-semibold">out of 100 Risk</span>
              </div>
            </div>

            {/* Compliance Badge */}
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${
              isDefaulter 
                ? 'bg-red-500/10 border-red-500/30 text-red-300' 
                : 'bg-green-500/10 border-green-500/30 text-green-300'
            }`}>
              {isDefaulter ? (
                <ShieldAlert className="w-8 h-8 text-red-400 flex-shrink-0" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-green-400 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="font-extrabold text-sm text-white truncate">
                  Status: {isDefaulter ? 'DEFAULTER FLAGGED' : 'COMPLIANT STAR TAXPAYER'}
                </p>
                <p className="text-xs text-gray-300 mt-0.5 truncate">
                  Tier: <span className="text-mustard font-bold">{user?.tier}</span>
                </p>
              </div>
            </div>
          </div>

          {/* AI Metrics summary */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#333333]">
            <div className="bg-[#121212] p-3 rounded-xl border border-[#2D2D2D]">
              <p className="text-gray-400 text-[11px] font-semibold">On-Time Rate</p>
              <p className="text-lg font-black text-white mt-0.5">{user?.metrics?.onTimeRate}</p>
            </div>
            <div className="bg-[#121212] p-3 rounded-xl border border-[#2D2D2D]">
              <p className="text-gray-400 text-[11px] font-semibold">Avg Delay</p>
              <p className="text-lg font-black text-mustard mt-0.5">{user?.metrics?.avgDelayDays}</p>
            </div>
          </div>
        </div>

        {/* AI Insight & Behavioral Breakdown */}
        <div className="lg:col-span-2 bg-[#1E1E1E] border border-[#333333] rounded-2xl p-6 flex flex-col justify-between shadow-sm space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-mustard" />
              <h2 className="text-lg font-bold text-white">AI Behavioral Assessment</h2>
            </div>
            
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed bg-[#121212] p-4 rounded-xl border border-[#2D2D2D] mb-6">
              "{user?.aiSummary}"
            </p>

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              AI Targeted Recommendations
            </h3>
            <div className="space-y-2.5">
              {user?.aiRecommendations?.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 bg-[#252525] p-3 rounded-xl border border-[#333333]">
                  <div className="w-6 h-6 rounded-full bg-mustard/20 text-mustard flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-200">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment History Analysis Timeline */}
          <div className="pt-4 border-t border-[#333333]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Payment History Analysis</span>
              <span className="text-mustard text-[11px] font-bold">Verified on Ledger</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {history.slice(0, 3).map((item) => (
                <div key={item.id} className="bg-[#121212] p-3 rounded-xl border border-[#2D2D2D]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-gray-200 truncate">{item.type}</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded flex-shrink-0 ${
                      item.statusOnTime ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {item.statusOnTime ? 'On Time' : 'Delayed'}
                    </span>
                  </div>
                  <p className="text-sm font-black text-mustard">₹{item.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{item.date} • {item.method}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* DIVERGENT UI PATHS ACCORDING TO COMPLIANCE STATUS */}
      
      {isDefaulter ? (
        /* DEFAULTER UI PATH */
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-red-950/40 via-[#1E1E1E] to-[#1E1E1E] border border-red-500/40 rounded-2xl p-6 lg:p-8 shadow-md space-y-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-red-400 flex-shrink-0" />
              <h2 className="text-xl font-bold text-white">AI Defaulter Resolution Portal</h2>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm">
              Our AI engine has prepared personalized compliance options to clear your outstanding dues without penalty interest or legal escalation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
              {/* Option 1: Split Installments */}
              <div className={`bg-[#121212] border rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all ${
                selectedPlan === 'installment' ? 'border-mustard bg-mustard/5' : 'border-[#333333] hover:border-gray-600'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-mustard font-bold uppercase tracking-wider">Option 1</span>
                    <span className="bg-mustard/20 text-mustard text-[10px] font-extrabold px-2 py-0.5 rounded-full">0% Interest</span>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Split into 3 Monthly Parts</h3>
                  <p className="text-gray-400 text-xs">
                    Pay ₹{Math.round((user?.metrics?.outstandingBalance ? parseInt(user.metrics.outstandingBalance.replace(/\D/g, '')) : 12500) / 3).toLocaleString()} / month over 90 days.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPlan('installment')}
                  className={`w-full py-2.5 rounded-lg text-xs font-extrabold transition-colors ${
                    selectedPlan === 'installment' 
                      ? 'bg-mustard text-civic-black' 
                      : 'bg-[#252525] text-white hover:bg-[#333333]'
                  }`}
                >
                  {selectedPlan === 'installment' ? 'Plan Selected ✓' : 'Activate 3-Part Plan'}
                </button>
              </div>

              {/* Option 2: AI Amnesty Waiver */}
              <div className={`bg-[#121212] border rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all ${
                amnestyApplied ? 'border-green-500 bg-green-500/5' : 'border-[#333333] hover:border-gray-600'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-green-400 font-bold uppercase tracking-wider">Option 2</span>
                    <span className="bg-green-500/20 text-green-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full">Amnesty Special</span>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">50% Penalty Waiver</h3>
                  <p className="text-gray-400 text-xs">
                    Settle total outstanding balance within 7 days to get late fee penalty fully refunded.
                  </p>
                </div>
                <button
                  onClick={() => setAmnestyApplied(!amnestyApplied)}
                  className={`w-full py-2.5 rounded-lg text-xs font-extrabold transition-colors ${
                    amnestyApplied 
                      ? 'bg-green-500 text-black' 
                      : 'bg-[#252525] text-white hover:bg-[#333333]'
                  }`}
                >
                  {amnestyApplied ? 'Amnesty Active (50% Off Penalty)' : 'Apply Amnesty Waiver'}
                </button>
              </div>

              {/* Option 3: Request AI Counselor Call */}
              <div className="bg-[#121212] border border-[#333333] rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Option 3</span>
                    <span className="bg-blue-500/20 text-blue-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full">Dispute / Help</span>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Valuation Dispute Assistance</h3>
                  <p className="text-gray-400 text-xs">
                    Think your tax was calculated incorrectly? Request a municipal review with AI dispute officer.
                  </p>
                </div>
                <button
                  onClick={() => setCallbackRequested(true)}
                  disabled={callbackRequested}
                  className="w-full bg-[#252525] hover:bg-[#333333] text-white py-2.5 rounded-lg text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-mustard" />
                  {callbackRequested ? 'Callback Scheduled ✓' : 'Request Counselor Call'}
                </button>
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* COMPLIANT TAXPAYER UI PATH */
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-mustard/20 via-[#1E1E1E] to-[#1E1E1E] border border-mustard/40 rounded-2xl p-6 lg:p-8 shadow-md space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-6 h-6 text-mustard" />
                  <h2 className="text-xl font-bold text-white">Model Citizen Fast-Track Portal</h2>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm">
                  As a top-tier compliant taxpayer, you enjoy exclusive municipal privileges, fast-track approvals, and reward multipliers.
                </p>
              </div>
              <span className="bg-mustard text-civic-black text-xs font-black px-3 py-1.5 rounded-full shadow flex-shrink-0">
                VIP CITIZEN PASS ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              
              <div className="bg-[#121212] border border-[#333333] rounded-xl p-4 hover:border-mustard/50 transition-colors">
                <span className="text-2xl mb-2 block">🎫</span>
                <p className="font-bold text-white text-sm">Fast-Track Permit Clearance</p>
                <p className="text-gray-400 text-xs mt-1">Skip queue for building plan & water connection approvals.</p>
              </div>

              <div className="bg-[#121212] border border-[#333333] rounded-xl p-4 hover:border-mustard/50 transition-colors">
                <span className="text-2xl mb-2 block">⚡</span>
                <p className="font-bold text-white text-sm">10% Extra Cashback Coupon</p>
                <p className="text-gray-400 text-xs mt-1">Automatically applied to your next Water Tax cycle.</p>
              </div>

              <div className="bg-[#121212] border border-[#333333] rounded-xl p-4 hover:border-mustard/50 transition-colors">
                <span className="text-2xl mb-2 block">🏛️</span>
                <p className="font-bold text-white text-sm">Community Hall 20% Off</p>
                <p className="text-gray-400 text-xs mt-1">Discounts on booking municipal event halls in Ward 8.</p>
              </div>

              <div className="bg-[#121212] border border-[#333333] rounded-xl p-4 hover:border-mustard/50 transition-colors">
                <span className="text-2xl mb-2 block">🏅</span>
                <p className="font-bold text-white text-sm">Ward Advisory Panel</p>
                <p className="text-gray-400 text-xs mt-1">Nominated to vote on local green technology initiatives.</p>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
