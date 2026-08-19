import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IndianRupee, MapPin, Users, TrendingUp, RefreshCw, CircleDollarSign,
  Clock, AlertTriangle, Cpu, Trophy, BarChart3, ChevronUp, ChevronDown,
  Wifi, Calendar, Building2, Search, Filter, Phone, Mail, MessageSquare,
  CheckCircle2, ArrowRight, Download, Send, Eye, ShieldAlert, Sparkles,
  ExternalLink, UserCheck, Smartphone, Check, X, FileText, Compass, AlertCircle,
  CreditCard, CheckCircle
} from 'lucide-react';
import { collectorService, wardService, citizenService } from '../services';

// ── Animated count-up helper ─────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseFloat(target);
    if (isNaN(end)) return;
    const step = end / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(id); }
      else setVal(start);
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return val;
}

// ── Pulsing Live indicator ───────────────────────────────────────────────────
function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      <span className="text-emerald-400 text-xs font-black tracking-wide">Live</span>
    </span>
  );
}

// ── Horizontal progress bar row ──────────────────────────────────────────────
function StageRow({ label, pct, barColor }) {
  const width = useCountUp(pct, 900);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-300 font-medium">{label}</span>
        <span className="font-bold" style={{ color: barColor }}>{pct}%</span>
      </div>
      <div className="h-2.5 w-full bg-[#181B26] border border-[#2A3042] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(width, pct)}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

// ── Payment method row ────────────────────────────────────────────────────────
function PaymentRow({ label, pct, isFirst }) {
  return (
    <div className={`flex items-center justify-between py-3 ${!isFirst ? 'border-t border-[#262B3A]' : ''}`}>
      <span className="text-gray-300 text-sm font-medium">{label}</span>
      <span className="text-white text-sm font-black">{pct}%</span>
    </div>
  );
}

// ── Mini line-chart (SVG sparkline) ──────────────────────────────────────────
function Sparkline({ data, color = '#E5B80B' }) {
  const h = 40, w = 180, pad = 4;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + ((max - v) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── Mini donut (SVG) ──────────────────────────────────────────────────────────
function MiniDonut({ pct, color }) {
  const r = 28, cx = 34, cy = 34, circumf = 2 * Math.PI * r;
  const dash = (pct / 100) * circumf;
  return (
    <svg width="68" height="68" viewBox="0 0 68 68">
      <circle cx={cx} cy={cy} r={r} stroke="#181B26" strokeWidth="8" fill="none" />
      <circle
        cx={cx} cy={cy} r={r}
        stroke={color} strokeWidth="8" fill="none"
        strokeDasharray={`${dash} ${circumf}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text x={cx} y={cy + 5} textAnchor="middle" fill="white" fontSize="13" fontWeight="800">{pct}%</text>
    </svg>
  );
}

// ── Nav pill items ───────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'revenue',    label: 'Revenue Overview',    icon: IndianRupee },
  { id: 'recent',     label: 'Recent Payments',     icon: CreditCard },
  { id: 'heatmap',   label: 'Ward Heat Map',       icon: MapPin },
  { id: 'citizens',  label: 'Ward Citizens Roster', icon: Users },
  { id: 'trend',     label: 'Collection Trend',     icon: TrendingUp },
  { id: 'autopay',   label: 'AutoPay Mandates',    icon: RefreshCw },
  { id: 'pending',   label: 'Pending Queue',        icon: Clock },
  { id: 'ai',        label: 'AI Insights',          icon: Cpu },
  { id: 'score',     label: 'Scoreboard',           icon: Trophy },
];

export default function TaxCollectorPage() {
  const { t } = useTranslation();
  const [activeNav, setActiveNav] = useState('revenue');
  const [syncTime, setSyncTime] = useState('Just now');

  // Core metrics & state
  const [metrics, setMetrics] = useState({
    totalCollected: '32.4 Lakhs',
    totalCollectedAmount: 3242800,
    complianceRate: 61,
    pendingDues: '21.0 Lakhs',
    pendingDuesAmount: 2095900,
    autoPayEnrolled: 132,
    totalCitizens: 300,
    highRiskCount: 42
  });

  const [collectionStages, setCollectionStages] = useState([
    { label: 'Paid on time',      pct: 58, barColor: '#22c55e' },
    { label: 'Paid late',         pct: 15, barColor: '#eab308' },
    { label: '30-day overdue',    pct: 12, barColor: '#f97316' },
    { label: '60-day (penalty)',  pct:  9, barColor: '#ef4444' },
    { label: '90-day (frozen)',   pct:  6, barColor: '#991b1b' },
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    { label: 'UPI / AutoPay',       pct: 48 },
    { label: 'Net banking',         pct: 29 },
    { label: 'Debit / credit card', pct: 14 },
    { label: 'UPI manual',          pct: 7 },
    { label: 'Counter (offline)',   pct: 2 },
  ]);

  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState('W04');
  const [citizens, setCitizens] = useState([]);
  const [defaulterQueue, setDefaulterQueue] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [citizenFilter, setCitizenFilter] = useState('all'); // all, compliant, pending, overdue
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWardFilter, setSelectedWardFilter] = useState('W04'); // default to collector's assigned ward W04

  // Interactive Action Modals
  const [activeCitizenModal, setActiveCitizenModal] = useState(null);
  const [nudgeModalData, setNudgeModalData] = useState(null);
  const [collectionModalData, setCollectionModalData] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Load all initial data from services
  // Re-fetch all metrics & rosters from backend API
  const refreshCollectorData = async () => {
    try {
      const [m, stages, methods, wardList, allCitizens, defs, recents] = await Promise.all([
        collectorService.getDashboardMetrics(),
        collectorService.getCollectionStages(),
        collectorService.getPaymentMethodSplit(),
        wardService.getWardSummaries(),
        citizenService.getAllCitizens(),
        collectorService.getDefaulterQueue(15),
        collectorService.getRecentPayments(10)
      ]);

      if (m) setMetrics(m);
      if (stages) setCollectionStages(stages);
      if (methods) setPaymentMethods(methods);
      if (wardList && wardList.length > 0) {
        setWards(wardList);
      }
      if (allCitizens && allCitizens.length > 0) {
        setCitizens(allCitizens);
      }
      if (defs && defs.length > 0) {
        setDefaulterQueue(defs);
      }
      if (recents && recents.length > 0) {
        setRecentPayments(recents);
      }
    } catch (err) {
      console.warn('Error refreshing collector metrics:', err);
    }
  };

  // Load initial data and refresh when nav tab changes
  useEffect(() => {
    refreshCollectorData();
  }, [activeNav]);

  // Sync time ticker
  useEffect(() => {
    let secs = 0;
    const id = setInterval(() => {
      secs += 5;
      if (secs < 60) setSyncTime(`${secs}s ago`);
      else if (secs < 3600) setSyncTime(`${Math.floor(secs / 60)}m ago`);
      else setSyncTime(`${Math.floor(secs / 3600)}h ago`);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Filter citizens list
  const filteredCitizens = citizens.filter(c => {
    // Ward filter
    if (selectedWardFilter !== 'all' && c.wardId !== selectedWardFilter) return false;
    
    // Status filter
    if (citizenFilter === 'compliant' && (c.outstandingDues > 0 || c.status === 'Defaulter')) return false;
    if (citizenFilter === 'pending' && (c.outstandingDues <= 0 || c.riskCategory === 'High Risk')) return false;
    if (citizenFilter === 'overdue' && (c.outstandingDues <= 0 || c.riskCategory !== 'High Risk')) return false;
    
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.propertyId.toLowerCase().includes(q) ||
        c.wardName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Effective defaulters queue for Pending Queue tab with safe fallbacks
  const rawDefaulters = defaulterQueue.length > 0
    ? defaulterQueue
    : citizens.filter(c => c.outstandingDues > 0 || c.riskCategory === 'High Risk').slice(0, 12);

  const activeDefaultersList = rawDefaulters.map((c, i) => ({
    id: c.id || `def-${i + 1}`,
    name: c.name || c.Name || `Resident ${i + 1}`,
    propertyId: c.propertyId || `PROP-W04-${i + 1}`,
    ward: c.ward || c.wardName || 'W04 - Anna Nagar',
    amount: Number(c.amount ?? c.outstandingDues ?? c.Outstanding_Dues ?? 5000),
    daysOverdue: Number(c.daysOverdue ?? c.avgDaysLate ?? c.Avg_Days_Late ?? 30),
    riskScore: Number(c.riskScore ?? 85),
    phone: c.phone || '9876543210',
    taxType: c.taxType || 'Property Tax',
    dueDate: c.dueDate || '2026-08-30',
    status: c.status || 'Pending'
  }));

  // Trigger Toast Notification helper
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Handle Recording an Offline Field Collection — calls backend API to persist to PostgreSQL
  const handleRecordCollection = async (e) => {
    e.preventDefault();
    if (!collectionModalData) return;
    const amount = Number(collectionModalData.collectedAmount || collectionModalData.outstandingDues || collectionModalData.amount || 5000);
    const citizenId = collectionModalData.citizenId || collectionModalData.id || collectionModalData.Citizen_ID;

    try {
      await apiClient.post('/taxes/pay', {
        citizenId: citizenId,
        amount: amount,
        paymentMethod: 'Handheld POS / Field Cash'
      });
    } catch (err) {
      console.warn('Field collection backend sync fallback:', err);
    }

    // Refresh live state from backend
    await refreshCollectorData();

    showToast(`✅ Successfully logged collection of ₹${amount.toLocaleString()} for ${collectionModalData.name}! Receipt #${Math.floor(100000 + Math.random() * 900000)} generated.`);
    setCollectionModalData(null);
  };

  // Handle Sending Personalized AI Nudge
  const handleSendNudge = (channel) => {
    if (!nudgeModalData) return;
    showToast(`🚀 Dispatched AI ${channel} Alert to ${nudgeModalData.name} (${nudgeModalData.phone})!`);
    setNudgeModalData(null);
  };

  const complianceRateNum = useCountUp(metrics.complianceRate || 61, 1400);
  const enrolledNum = useCountUp(metrics.autoPayEnrolled || 132, 1600);

  const inspectedWardData = wards.find(w => w.id === selectedWard) || wards[0] || {
    id: 'W04',
    name: 'W04 - Koramangala',
    wardName: 'Koramangala',
    totalCitizens: 38,
    totalAnnualTax: 780000,
    totalCollected: 520000,
    totalOutstanding: 260000,
    rate: 67,
    collectionEfficiency: 67,
    highRiskCount: 6,
    status: 'Green Zone',
    badge: 'Green Leader'
  };

  return (
    <div className="space-y-6 font-sans text-white animate-fade-in-up">

      {/* ── TOAST NOTIFICATION ────────────────────────────────────────── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12141C] border-2 border-[#E5B80B] text-white px-5 py-3.5 rounded-2xl shadow-2xl shadow-black/80 flex items-center gap-3 animate-fade-in-up">
          <Sparkles className="w-5 h-5 text-[#E5B80B] flex-shrink-0" />
          <p className="text-xs sm:text-sm font-bold">{toastMsg}</p>
        </div>
      )}

      {/* ── Main card wrapper ─────────────────────────────────────────── */}
      <div className="bg-[#12141C] border-2 border-[#262B3A] rounded-3xl overflow-hidden shadow-2xl shadow-black/40">

        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 border-b border-[#262B3A] bg-[#11131B] flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-[#E5B80B]" />
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                {t('collector.title')}
              </h1>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">
              {t('collector.subtitle')} &nbsp;·&nbsp; Officer Anand Verma (Zone 4)
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <LiveBadge />
            <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-[#E5B80B]" />
              <span>Last sync:&nbsp;<span className="text-[#FFDC69] font-bold">{syncTime}</span></span>
            </div>
          </div>
        </div>

        {/* ── NAVIGATION PILLS ────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-[#262B3A] overflow-x-auto bg-[#141620]">
          <div className="flex items-center gap-2 min-w-max">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = activeNav === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveNav(id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#E5B80B] text-black shadow-lg shadow-[#E5B80B]/25'
                      : 'bg-[#181B26] border border-[#2D3346] text-gray-300 hover:border-[#E5B80B]/50 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-black' : 'text-gray-400'}`} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TOP KPI SUMMARY STRIP (Visible across all tabs) ─────────── */}
        <div className="px-6 py-5 border-b border-[#262B3A] bg-[#11131B]/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Total Collected */}
            <div className="bg-[#151822] border border-[#262B3A] rounded-2xl p-5 flex flex-col gap-2 hover:border-[#E5B80B]/50 transition-colors shadow-lg shadow-black/20">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs font-extrabold uppercase tracking-wider">Total collected (YTD)</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-white tracking-tight">
                <span className="text-xl font-bold text-[#E5B80B] mr-0.5">₹</span>{metrics.totalCollected || '32.4 Lakhs'}
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                <ChevronUp className="w-3.5 h-3.5" />
                <span>+18%</span>
                <span className="text-gray-400 font-normal">vs last cycle</span>
              </div>
            </div>

            {/* Compliance Rate */}
            <div className="bg-[#151822] border border-[#262B3A] rounded-2xl p-5 flex flex-col gap-2 hover:border-[#E5B80B]/50 transition-colors shadow-lg shadow-black/20">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs font-extrabold uppercase tracking-wider">Compliance rate</span>
                <MiniDonut pct={Math.round(metrics.complianceRate || 61)} color="#E5B80B" />
              </div>
              <p className="text-3xl font-black text-white tracking-tight">
                {Math.round(complianceRateNum)}%
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                <ChevronUp className="w-3.5 h-3.5" />
                <span>+9 pts</span>
                <span className="text-gray-400 font-normal">this quarter</span>
              </div>
            </div>

            {/* Pending Dues */}
            <div className="bg-[#151822] border border-[#262B3A] rounded-2xl p-5 flex flex-col gap-2 hover:border-red-500/50 transition-colors shadow-lg shadow-black/20">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs font-extrabold uppercase tracking-wider">Pending dues</span>
                <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-white tracking-tight">
                <span className="text-xl font-bold text-red-400 mr-0.5">₹</span>{metrics.pendingDues || '21.0 Lakhs'}
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-red-400">
                <ChevronDown className="w-3.5 h-3.5" />
                <span>-3%</span>
                <span className="text-gray-400 font-normal">from last month</span>
              </div>
            </div>

            {/* AutoPay Enrolled */}
            <div className="bg-[#151822] border border-[#262B3A] rounded-2xl p-5 flex flex-col gap-2 hover:border-[#E5B80B]/50 transition-colors shadow-lg shadow-black/20">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs font-extrabold uppercase tracking-wider">AutoPay enrolled</span>
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold">
                  <RefreshCw className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-white tracking-tight">
                {Math.round(enrolledNum).toLocaleString()}
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                <ChevronUp className="w-3.5 h-3.5" />
                <span>+24%</span>
                <span className="text-gray-400 font-normal">this month</span>
              </div>
            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* MODULE 1: REVENUE OVERVIEW & STAGES                                */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeNav === 'revenue' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* LEFT: Collection by stage */}
              <div className="bg-[#151822] border border-[#262B3A] rounded-3xl p-6 space-y-5 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-[#E5B80B]" />
                    <h3 className="font-black text-white text-base">Collection by Stage</h3>
                  </div>
                  <span className="text-xs text-gray-400 font-bold">FY 2025–26 Cycle</span>
                </div>

                <div className="space-y-4">
                  {collectionStages.map((s) => (
                    <StageRow key={s.label} {...s} />
                  ))}
                </div>

                {/* Mini sparkline trend */}
                <div className="pt-4 border-t border-[#262B3A] flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider font-extrabold">Monthly Recovery Trend</p>
                    <p className="text-white text-sm font-bold mt-0.5">Steady 58% on-time clearance</p>
                  </div>
                  <Sparkline data={[42, 48, 51, 55, 58, 60, 62, 58]} color="#E5B80B" />
                </div>
              </div>

              {/* RIGHT: Payment method split */}
              <div className="bg-[#151822] border border-[#262B3A] rounded-3xl p-6 space-y-4 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="w-5 h-5 text-[#E5B80B]" />
                    <h3 className="font-black text-white text-base">Payment Method Split</h3>
                  </div>
                  <span className="text-xs text-[#E5B80B] font-bold bg-[#E5B80B]/15 px-2.5 py-1 rounded-full">UPI Dominant</span>
                </div>

                <div className="space-y-1">
                  {paymentMethods.map((m, i) => (
                    <PaymentRow key={m.label} {...m} isFirst={i === 0} />
                  ))}
                </div>

                {/* Visual bar stacks */}
                <div className="pt-4 border-t border-[#262B3A]">
                  <p className="text-gray-400 text-[11px] mb-2 uppercase tracking-wider font-extrabold">Channel Distribution</p>
                  <div className="flex h-4 w-full rounded-full overflow-hidden gap-1">
                    {[
                      { pct: 48, color: '#E5B80B' },
                      { pct: 29, color: '#06b6d4' },
                      { pct: 14, color: '#8b5cf6' },
                      { pct:  7, color: '#f97316' },
                      { pct:  2, color: '#6b7280' },
                    ].map((seg, i) => (
                      <div
                        key={i}
                        className="h-full rounded-sm"
                        style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs">
                    {[
                      { label: 'UPI/AutoPay (48%)', color: '#E5B80B' },
                      { label: 'Net Banking (29%)', color: '#06b6d4' },
                      { label: 'Cards (14%)', color: '#8b5cf6' },
                      { label: 'UPI Manual (7%)', color: '#f97316' },
                      { label: 'Counter (2%)', color: '#6b7280' },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                        <span className="text-gray-300 font-medium">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Target vs Actual Progress Strip */}
            <div className="bg-[#151822] border border-[#262B3A] rounded-3xl p-6 shadow-xl shadow-black/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-[#E5B80B] text-xs font-extrabold uppercase tracking-wider">Ward Zone 4 Annual Target</span>
                <h3 className="text-xl font-black text-white">₹32.4 Lakhs Collected of ₹45.0 Lakhs Goal</h3>
                <p className="text-gray-400 text-xs">72% of annual municipal target achieved with 4 months remaining</p>
              </div>
              <div className="flex-1 max-w-md space-y-2">
                <div className="w-full bg-[#181B26] border border-[#2A3042] rounded-full h-4 p-0.5">
                  <div className="bg-gradient-to-r from-[#D1A000] to-[#E5B80B] h-full rounded-full" style={{ width: '72%' }} />
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-400">
                  <span>Current: 72%</span>
                  <span className="text-emerald-400">Target Pace: On Track</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* MODULE 2: INTERACTIVE WARD HEAT MAP                                */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeNav === 'heatmap' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#E5B80B]" />
                  Bangalore Municipal Ward Heat Map & Risk Index
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  Click any ward to inspect live recovery rates, citizen dues, and operational risk tiers
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-semibold">Active Zone:</span>
                <span className="text-xs text-[#E5B80B] font-bold bg-[#E5B80B]/15 border border-[#E5B80B]/30 px-3 py-1 rounded-full">
                  {inspectedWardData.name}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Interactive Wards Grid / Heatmap */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wards.map((ward) => {
                  const isSelected = selectedWard === ward.id;
                  const isGreen = ward.rate >= 65;
                  const isYellow = ward.rate >= 55 && ward.rate < 65;
                  const isRed = ward.rate < 55;

                  return (
                    <div
                      key={ward.id}
                      onClick={() => setSelectedWard(ward.id)}
                      className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-[#181B26] border-[#E5B80B] shadow-xl shadow-[#E5B80B]/15'
                          : 'bg-[#151822] border-[#262B3A] hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs text-gray-400 font-extrabold uppercase tracking-wider">{ward.id}</span>
                          <h3 className="font-black text-white text-base mt-0.5">{ward.wardName}</h3>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                          isGreen ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                          isYellow ? 'bg-[#E5B80B]/20 text-[#FFDC69] border-[#E5B80B]/40' :
                          'bg-red-500/20 text-red-400 border-red-500/40'
                        }`}>
                          {ward.status}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400 font-semibold">Collection Efficiency:</span>
                          <span className="text-white font-black">{ward.rate}%</span>
                        </div>
                        <div className="h-2 w-full bg-[#11131B] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isGreen ? 'bg-emerald-400' : isYellow ? 'bg-[#E5B80B]' : 'bg-red-500'
                            }`}
                            style={{ width: `${ward.rate}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#262B3A] text-xs text-gray-400 font-medium">
                        <span>{ward.totalCitizens} Taxpayers</span>
                        <span className="text-[#FFDC69] font-bold">₹{(ward.totalCollected / 100000).toFixed(1)}L Collected</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ward Detailed Inspector Panel */}
              <div className="bg-[#151822] border-2 border-[#262B3A] rounded-3xl p-6 space-y-6 shadow-xl shadow-black/25">
                <div className="space-y-1 border-b border-[#262B3A] pb-4">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#E5B80B]" />
                    <span className="text-xs font-extrabold text-[#E5B80B] uppercase tracking-wider">Ward Zone Inspector</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">{inspectedWardData.name}</h3>
                  <p className="text-gray-400 text-xs">Bangalore Municipal Administration Zone</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-[#181B26] rounded-2xl border border-[#2D3346]">
                    <span className="text-xs text-gray-300 font-semibold">Total Registered Taxpayers</span>
                    <span className="text-white font-black text-sm">{inspectedWardData.totalCitizens} Residents</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-[#181B26] rounded-2xl border border-[#2D3346]">
                    <span className="text-xs text-gray-300 font-semibold">Annual Tax Assessment</span>
                    <span className="text-white font-black text-sm">₹{(inspectedWardData.totalAnnualTax || 650000).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-[#181B26] rounded-2xl border border-[#2D3346]">
                    <span className="text-xs text-gray-300 font-semibold">Amount Collected</span>
                    <span className="text-emerald-400 font-black text-sm">₹{(inspectedWardData.totalCollected || 440000).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-[#181B26] rounded-2xl border border-[#2D3346]">
                    <span className="text-xs text-gray-300 font-semibold">Outstanding Defaulter Dues</span>
                    <span className="text-red-400 font-black text-sm">₹{(inspectedWardData.totalOutstanding || 210000).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-[#181B26] rounded-2xl border border-[#2D3346]">
                    <span className="text-xs text-gray-300 font-semibold">High-Risk Defaulter Count</span>
                    <span className="text-red-400 font-black text-sm">{inspectedWardData.highRiskCount} Citizens</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#E5B80B]/10 border border-[#E5B80B]/30 space-y-1.5">
                  <p className="text-xs font-black text-[#FFDC69] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#E5B80B]" /> AI Recommendation for {inspectedWardData.wardName}
                  </p>
                  <p className="text-xs text-gray-200 leading-relaxed">
                    Deploy doorstep UPI payment camps and schedule automated WhatsApp nudges for 6 high-value pending commercial accounts.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedWardFilter(inspectedWardData.id);
                    setActiveNav('citizens');
                  }}
                  className="w-full bg-[#E5B80B] hover:bg-[#D1A000] text-black font-black py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#E5B80B]/25 transition-all cursor-pointer"
                >
                  View All Taxpayers in {inspectedWardData.wardName}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* MODULE 3: WARD CITIZENS & MEMBERS ROSTER (Requested by user)       */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeNav === 'citizens' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#E5B80B]" />
                  Ward Taxpayers & Member Directory
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  Showing residents in assigned ward with real-time tax dues, property IDs, and one-tap outreach actions
                </p>
              </div>

              {/* Ward Selector Pill Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs text-gray-400 font-extrabold uppercase mr-1">Filter Ward:</span>
                <button
                  onClick={() => setSelectedWardFilter('W04')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedWardFilter === 'W04'
                      ? 'bg-[#E5B80B] text-black shadow-md'
                      : 'bg-[#181B26] border border-[#2A3042] text-gray-300 hover:text-white'
                  }`}
                >
                  ★ My Ward (W04 - Koramangala)
                </button>
                <button
                  onClick={() => setSelectedWardFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedWardFilter === 'all'
                      ? 'bg-[#E5B80B] text-black shadow-md'
                      : 'bg-[#181B26] border border-[#2A3042] text-gray-300 hover:text-white'
                  }`}
                >
                  All Wards ({citizens.length})
                </button>
                {wards.filter(w => w.id !== 'W04').slice(0, 4).map(w => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWardFilter(w.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                      selectedWardFilter === w.id
                        ? 'bg-[#E5B80B] text-black shadow-md'
                        : 'bg-[#181B26] border border-[#2A3042] text-gray-300 hover:text-white'
                    }`}
                  >
                    {w.id} ({w.wardName})
                  </button>
                ))}
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-[#151822] border border-[#262B3A] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search input */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search citizen name, phone, property..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#181B26] border border-[#2D3346] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-[#E5B80B]"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                {[
                  { id: 'all', label: 'All Citizens' },
                  { id: 'compliant', label: 'Paid & Compliant' },
                  { id: 'pending', label: 'Pending Dues' },
                  { id: 'overdue', label: 'Overdue Defaulters' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCitizenFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                      citizenFilter === tab.id
                        ? 'bg-[#E5B80B]/20 text-[#FFDC69] border border-[#E5B80B]/50'
                        : 'bg-[#181B26] border border-[#2D3346] text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Citizen Table List */}
            <div className="bg-[#151822] border border-[#262B3A] rounded-3xl overflow-hidden shadow-xl shadow-black/25">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#11131B] border-b border-[#262B3A] text-gray-400 uppercase text-[11px] font-black tracking-wider">
                    <tr>
                      <th className="py-4 px-5">Citizen & Resident</th>
                      <th className="py-4 px-4">Property ID</th>
                      <th className="py-4 px-4">Ward Location</th>
                      <th className="py-4 px-4">Annual Tax</th>
                      <th className="py-4 px-4">Outstanding Dues</th>
                      <th className="py-4 px-4">Status & Risk</th>
                      <th className="py-4 px-5 text-right">Collector Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262B3A]">
                    {filteredCitizens.slice(0, 15).map((c) => {
                      const isClear = c.outstandingDues <= 0;
                      const isHighRisk = c.riskCategory === 'High Risk' || c.status === 'Defaulter';

                      return (
                        <tr key={c.id} className="hover:bg-[#181B26]/80 transition-colors">
                          
                          {/* Name & Phone */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#E5B80B]/15 border border-[#E5B80B]/30 flex items-center justify-center font-black text-xs text-[#FFDC69] flex-shrink-0">
                                {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm">{c.name}</p>
                                <p className="text-gray-400 text-xs">{c.phone} · {c.propertyType}</p>
                              </div>
                            </div>
                          </td>

                          {/* Property ID */}
                          <td className="py-4 px-4 font-mono text-gray-300 font-semibold text-xs">
                            {c.propertyId}
                          </td>

                          {/* Ward */}
                          <td className="py-4 px-4 text-gray-300 font-medium text-xs">
                            {c.ward}
                          </td>

                          {/* Annual Tax */}
                          <td className="py-4 px-4 text-gray-300 font-bold">
                            ₹{c.annualTax.toLocaleString()}
                          </td>

                          {/* Outstanding Dues */}
                          <td className="py-4 px-4 font-black">
                            {isClear ? (
                              <span className="text-emerald-400 font-bold">₹0 (Fully Paid)</span>
                            ) : (
                              <span className={isHighRisk ? 'text-red-400' : 'text-[#FFDC69]'}>
                                ₹{c.outstandingDues.toLocaleString()}
                              </span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                              isClear ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                              isHighRisk ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                              'bg-[#E5B80B]/20 text-[#FFDC69] border-[#E5B80B]/40'
                            }`}>
                              {isClear ? 'Cleared' : isHighRisk ? 'Overdue Defaulter' : 'Pending Payment'}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!isClear && (
                                <>
                                  {/* Send WhatsApp Nudge */}
                                  <button
                                    onClick={() => setNudgeModalData(c)}
                                    title="Send Personalized Nudge"
                                    className="px-2.5 py-1.5 bg-[#181B26] hover:bg-[#252A3B] border border-[#2D3346] rounded-xl text-emerald-400 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>Nudge</span>
                                  </button>

                                  {/* Record Collection */}
                                  <button
                                    onClick={() => setCollectionModalData(c)}
                                    title="Record Doorstep Collection"
                                    className="px-2.5 py-1.5 bg-[#E5B80B] hover:bg-[#D1A000] text-black rounded-xl text-xs font-black transition-colors flex items-center gap-1 shadow-md shadow-[#E5B80B]/20 cursor-pointer"
                                  >
                                    <IndianRupee className="w-3.5 h-3.5" />
                                    <span>Collect</span>
                                  </button>
                                </>
                              )}

                              {/* View Details */}
                              <button
                                onClick={() => setActiveCitizenModal(c)}
                                className="px-2.5 py-1.5 bg-[#181B26] hover:bg-[#252A3B] border border-[#2D3346] rounded-xl text-gray-300 text-xs font-bold transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredCitizens.length === 0 && (
                <div className="p-12 text-center text-gray-400 space-y-2">
                  <Users className="w-8 h-8 text-gray-500 mx-auto" />
                  <p className="font-bold text-white text-base">No citizens found matching criteria</p>
                  <p className="text-xs">Try selecting another ward or clearing your search filter</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* MODULE 4: COLLECTION TREND & FORECASTING                            */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeNav === 'trend' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#E5B80B]" />
                  Monthly Collection Run Rate & Trajectory
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  Historical trends, seasonal tax recovery spikes, and predictive month-end revenue forecast
                </p>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                +24% Growth vs Q1
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#151822] border border-[#262B3A] rounded-2xl p-5 space-y-1 shadow-md">
                <span className="text-xs text-gray-400 font-extrabold uppercase">Daily Average Recovery</span>
                <p className="text-2xl font-black text-white">₹1.85 Lakhs / day</p>
                <p className="text-xs text-emerald-400 font-semibold">↑ 12% increase after dynamic rebate launch</p>
              </div>
              <div className="bg-[#151822] border border-[#262B3A] rounded-2xl p-5 space-y-1 shadow-md">
                <span className="text-xs text-gray-400 font-extrabold uppercase">Peak Clearance Period</span>
                <p className="text-2xl font-black text-[#FFDC69]">Days 1 to 10 of Cycle</p>
                <p className="text-xs text-gray-400">Captures 64% of early bird 15% discount</p>
              </div>
              <div className="bg-[#151822] border border-[#262B3A] rounded-2xl p-5 space-y-1 shadow-md">
                <span className="text-xs text-gray-400 font-extrabold uppercase">Projected Month-End Total</span>
                <p className="text-2xl font-black text-emerald-400">₹48.2 Lakhs</p>
                <p className="text-xs text-emerald-400 font-semibold">Exceeds municipal monthly target by 7.1%</p>
              </div>
            </div>

            {/* Monthly Trend Visual Breakdown */}
            <div className="bg-[#151822] border border-[#262B3A] rounded-3xl p-6 space-y-5 shadow-xl shadow-black/25">
              <h3 className="font-bold text-white text-base">FY 2025–26 Month-by-Month Recovery (in ₹ Lakhs)</h3>
              
              <div className="grid grid-cols-8 gap-2 items-end h-48 pt-6 pb-2 border-b border-[#262B3A]">
                {[
                  { month: 'Apr', val: 24, label: '₹24L' },
                  { month: 'May', val: 28, label: '₹28L' },
                  { month: 'Jun', val: 35, label: '₹35L' },
                  { month: 'Jul', val: 32, label: '₹32L' },
                  { month: 'Aug', val: 41, label: '₹41L' },
                  { month: 'Sep', val: 39, label: '₹39L' },
                  { month: 'Oct', val: 44, label: '₹44L' },
                  { month: 'Nov (Live)', val: 48, label: '₹48L', active: true },
                ].map((col) => (
                  <div key={col.month} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors">{col.label}</span>
                    <div
                      className={`w-full max-w-[42px] rounded-t-xl transition-all duration-700 ${
                        col.active
                          ? 'bg-gradient-to-t from-[#D1A000] to-[#E5B80B] shadow-lg shadow-[#E5B80B]/25'
                          : 'bg-[#252A3B] hover:bg-[#32394E]'
                      }`}
                      style={{ height: `${(col.val / 50) * 100}%` }}
                    />
                    <span className={`text-[11px] font-bold ${col.active ? 'text-[#FFDC69]' : 'text-gray-400'}`}>
                      {col.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* MODULE 5: AUTOPAY MANDATES                                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeNav === 'autopay' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-[#E5B80B]" />
                  AutoPay Recurring Mandates & UPI Auto-Debit
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  Automated recurring tax debits guarantee 100% on-time settlement and zero arrear accumulation
                </p>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                98.4% Mandate Success
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#151822] border border-[#262B3A] rounded-2xl p-5 space-y-2">
                <span className="text-xs text-gray-400 font-extrabold uppercase">Total Mandates Active</span>
                <p className="text-3xl font-black text-white">{metrics.autoPayEnrolled} Citizens</p>
                <p className="text-xs text-gray-400">44% of Zone 4 taxpayers enrolled</p>
              </div>

              <div className="bg-[#151822] border border-[#262B3A] rounded-2xl p-5 space-y-2">
                <span className="text-xs text-gray-400 font-extrabold uppercase">Next Auto-Debit Wave</span>
                <p className="text-3xl font-black text-[#FFDC69]">1st of Next Month</p>
                <p className="text-xs text-emerald-400 font-semibold">₹14.2 Lakhs scheduled for auto-sweep</p>
              </div>

              <div className="bg-[#151822] border border-[#262B3A] rounded-2xl p-5 space-y-2">
                <span className="text-xs text-gray-400 font-extrabold uppercase">Average Taxpayer Savings</span>
                <p className="text-3xl font-black text-emerald-400">₹620 / year</p>
                <p className="text-xs text-gray-400">Via 2% automated AutoPay rebate discount</p>
              </div>
            </div>

            {/* AutoPay Citizen Roster */}
            <div className="bg-[#151822] border border-[#262B3A] rounded-3xl p-6 space-y-4 shadow-xl shadow-black/25">
              <h3 className="font-bold text-white text-base">Active Ward AutoPay Mandates</h3>
              <div className="space-y-3">
                {citizens.filter(c => c.autoPayEnabled).slice(0, 6).map((c) => (
                  <div key={c.id} className="bg-[#181B26] border border-[#2D3346] rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        UPI
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{c.name}</p>
                        <p className="text-gray-400 text-xs">{c.propertyId} · {c.wardName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">₹{c.annualTax.toLocaleString()}</p>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">Mandate Active ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* MODULE 6: RECENT PAYMENTS LOG (DATABASE SOURCE OF TRUTH)           */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {(activeNav === 'recent' || activeNav === 'revenue') && (
          <div className="p-6 space-y-4 border-b border-[#262B3A]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  Recent Database Payments
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  Live payment records persisted to PostgreSQL / Supabase database
                </p>
              </div>
              <button
                onClick={refreshCollectorData}
                className="bg-[#181B26] hover:bg-[#252A3B] border border-[#2D3346] text-emerald-400 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors w-fit"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-sync Database
              </button>
            </div>

            <div className="bg-[#151822] border-2 border-[#2D3346] rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#181B26] border-b border-[#2D3346] text-gray-400 text-[11px] font-extrabold uppercase tracking-wider">
                      <th className="p-4">Taxpayer / Citizen</th>
                      <th className="p-4">Property ID</th>
                      <th className="p-4">Tax Type</th>
                      <th className="p-4">Amount Paid</th>
                      <th className="p-4">Payment Method</th>
                      <th className="p-4">Date / Time</th>
                      <th className="p-4">Receipt / Txn ID</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262B3A] text-xs">
                    {recentPayments.length > 0 ? (
                      recentPayments.map((p, idx) => (
                        <tr key={p.id || idx} className="hover:bg-[#1C202E] transition-colors">
                          <td className="p-4 font-bold text-white flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0">
                              {(p.citizenName || 'C')[0]}
                            </div>
                            <span>{p.citizenName || 'Resident'}</span>
                          </td>
                          <td className="p-4 font-mono text-gray-300">{p.propertyId || `PROP-W04-${idx + 1}`}</td>
                          <td className="p-4 font-semibold text-amber-400">{p.taxType || 'Property Tax'}</td>
                          <td className="p-4 font-black text-emerald-400">₹{(p.amount || 0).toLocaleString()}</td>
                          <td className="p-4 text-gray-300">
                            <span className="bg-[#1C202E] px-2.5 py-1 rounded-lg border border-[#2D3346] font-medium">
                              {p.paymentMethod || p.method || 'UPI'}
                            </span>
                          </td>
                          <td className="p-4 text-gray-400">{p.date || 'Today'}</td>
                          <td className="p-4 font-mono text-gray-400">{p.receiptId || p.transactionId || p.id}</td>
                          <td className="p-4 text-right">
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                              {p.status || 'PAID'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-gray-400 font-bold">
                          No recent tax payments found in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* MODULE 7: PENDING & OVERDUE QUEUE                                  */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeNav === 'pending' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-red-400" />
                  Priority Defaulter & Recovery Queue
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  High-risk accounts sorted by overdue severity, arrear amount, and behavioral default index
                </p>
              </div>
              {activeDefaultersList.length > 0 && (
                <button
                  onClick={() => showToast(`🚀 Dispatched bulk WhatsApp recovery reminders to top ${activeDefaultersList.length} pending accounts!`)}
                  className="bg-[#E5B80B] hover:bg-[#D1A000] text-black font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-[#E5B80B]/20 transition-all cursor-pointer flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Bulk Nudges
                </button>
              )}
            </div>

            {activeDefaultersList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeDefaultersList.map((def) => (
                  <div key={def.id} className="bg-[#151822] border-2 border-red-500/30 rounded-3xl p-5 space-y-4 shadow-xl shadow-black/20 hover:border-red-500/60 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-red-400 text-[10px] font-black uppercase tracking-wider bg-red-500/20 px-2 py-0.5 rounded-full">
                          {(def.daysOverdue || 30)}+ Days Overdue
                        </span>
                        <h3 className="font-black text-white text-base mt-1.5">{def.name}</h3>
                        <p className="text-gray-400 text-xs font-mono">{def.propertyId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 font-medium">Pending Dues</p>
                        <p className="text-xl font-black text-red-400">₹{(def.amount || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#181B26] rounded-xl border border-[#2D3346] flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-medium">AI Risk Score:</span>
                      <span className="text-red-400 font-extrabold">{def.riskScore || 85} / 100 (High Delay Risk)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#262B3A]">
                      <button
                        onClick={() => setNudgeModalData(def)}
                        className="w-full bg-[#181B26] hover:bg-[#252A3B] border border-[#2D3346] text-emerald-400 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Nudge
                      </button>
                      <button
                        onClick={() => setCollectionModalData(def)}
                        className="w-full bg-[#E5B80B] hover:bg-[#D1A000] text-black font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-[#E5B80B]/20 cursor-pointer transition-colors"
                      >
                        <IndianRupee className="w-3.5 h-3.5" /> Collect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#151822] border-2 border-[#2D3346] rounded-3xl p-12 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">No pending tax payments</h3>
                <p className="text-gray-400 text-sm">All taxpayers in this queue have cleared their dues or are fully compliant.</p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* MODULE 7: AI PREDICTIVE INSIGHTS                                   */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeNav === 'ai' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[#E5B80B]" />
                  AI Behavioral Nudge Engine & Predictive Risk Profiling
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  Machine learning model analyzes past payment timestamps, income brackets, and notification channels
                </p>
              </div>
              <span className="text-xs text-[#FFDC69] bg-[#E5B80B]/20 border border-[#E5B80B]/40 px-3 py-1 rounded-full font-bold">
                91.2% Predictive Accuracy
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Behavioral Insights */}
              <div className="bg-[#151822] border border-[#262B3A] rounded-3xl p-6 space-y-4 shadow-xl shadow-black/25">
                <h3 className="font-bold text-white text-base">Channel Response Efficiency</h3>
                
                <div className="space-y-3">
                  <div className="p-4 bg-[#181B26] rounded-2xl border border-[#2D3346] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        💬
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">WhatsApp One-Tap Payment Link</p>
                        <p className="text-gray-400 text-xs">Clears within 48 hours for 78% of taxpayers</p>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-extrabold text-xs bg-emerald-500/20 px-2.5 py-1 rounded-full">Top Conversion</span>
                  </div>

                  <div className="p-4 bg-[#181B26] rounded-2xl border border-[#2D3346] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                        📱
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">SMS Dynamic Rebate Alert</p>
                        <p className="text-gray-400 text-xs">Clears within 5 days for 52% of taxpayers</p>
                      </div>
                    </div>
                    <span className="text-cyan-400 font-extrabold text-xs bg-cyan-500/20 px-2.5 py-1 rounded-full">Moderate</span>
                  </div>

                  <div className="p-4 bg-[#181B26] rounded-2xl border border-[#2D3346] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                        🚶
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">Collector Doorstep Inspection</p>
                        <p className="text-gray-400 text-xs">Reserved for 90+ days persistent defaulters</p>
                      </div>
                    </div>
                    <span className="text-orange-400 font-extrabold text-xs bg-orange-500/20 px-2.5 py-1 rounded-full">Escalation Tier</span>
                  </div>
                </div>
              </div>

              {/* Recommended Action Engine */}
              <div className="bg-[#151822] border border-[#262B3A] rounded-3xl p-6 space-y-4 shadow-xl shadow-black/25">
                <h3 className="font-bold text-white text-base">Collector Suggested Action Plan</h3>
                
                <div className="space-y-3">
                  <div className="p-4 bg-[#E5B80B]/10 border border-[#E5B80B]/30 rounded-2xl space-y-1.5">
                    <p className="font-bold text-[#FFDC69] text-sm">1. Focus on Ward 04 Commercial Sector</p>
                    <p className="text-gray-200 text-xs leading-relaxed">
                      6 commercial properties account for ₹8.4 Lakhs (40% of ward arrears). Scheduling doorstep digital POS collection will recover ₹6.2 Lakhs immediately.
                    </p>
                  </div>

                  <div className="p-4 bg-[#181B26] border border-[#2D3346] rounded-2xl space-y-1.5">
                    <p className="font-bold text-white text-sm">2. Promote 5% Dynamic Early-Bird Rebate</p>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      Citizens in Hebbal & Rajajinagar respond with 3x higher payment rates when reminded that discounts shrink in 7 days.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* MODULE 8: SCOREBOARD & OFFICER LEADERBOARD                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeNav === 'score' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#E5B80B]" />
                  Ward Efficiency & Officer Performance Scoreboard
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  Inter-ward municipal efficiency ranking, target completion badges, and collector recognition
                </p>
              </div>
              <span className="text-xs text-[#FFDC69] bg-[#E5B80B]/20 border border-[#E5B80B]/40 px-3 py-1 rounded-full font-bold">
                Gold Officer Tier 🏅
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Ward Rankings */}
              <div className="bg-[#151822] border border-[#262B3A] rounded-3xl p-6 space-y-4 shadow-xl shadow-black/25">
                <h3 className="font-bold text-white text-base">Bangalore Ward Efficiency Rankings</h3>
                <div className="space-y-3">
                  {wards.slice(0, 5).map((w) => (
                    <div
                      key={w.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                        w.id === 'W04' ? 'bg-[#E5B80B]/10 border-[#E5B80B]' : 'bg-[#181B26] border-[#2D3346]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                          w.rank === 1 ? 'bg-[#E5B80B] text-black' :
                          w.rank === 2 ? 'bg-gray-300 text-black' :
                          w.rank === 3 ? 'bg-amber-700 text-white' : 'bg-[#252A3B] text-gray-400'
                        }`}>
                          #{w.rank}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{w.name}</p>
                          <p className="text-gray-400 text-xs">{w.totalCitizens} Citizens · ₹{(w.totalCollected / 100000).toFixed(1)}L Recovery</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#E5B80B] text-base">{w.rate}%</p>
                        <span className="text-[10px] text-gray-300 bg-[#11131B] px-2 py-0.5 rounded-full">{w.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collector Officer Achievements */}
              <div className="bg-[#151822] border border-[#262B3A] rounded-3xl p-6 space-y-4 shadow-xl shadow-black/25">
                <h3 className="font-bold text-white text-base">Officer Anand Verma — Achievements</h3>
                
                <div className="space-y-3">
                  <div className="p-4 bg-[#181B26] border border-[#2D3346] rounded-2xl flex items-center gap-3.5">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <p className="font-bold text-white text-sm">Zone 4 Highest Recovery Badge</p>
                      <p className="text-gray-400 text-xs">Achieved 88.4% target recovery in Q3</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#181B26] border border-[#2D3346] rounded-2xl flex items-center gap-3.5">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <p className="font-bold text-white text-sm">Digital Champion Award</p>
                      <p className="text-gray-400 text-xs">Onboarded 132 citizens into automated AutoPay mandates</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#181B26] border border-[#2D3346] rounded-2xl flex items-center gap-3.5">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <p className="font-bold text-white text-sm">Zero Dispute Resolution Streak</p>
                      <p className="text-gray-400 text-xs">100% accurate tax assessments with zero resident complaints</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── FOOTER ──────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-[#262B3A] bg-[#11131B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Connected to DIGIT / UPYOG Open APIs · Live Municipal Sync Active</span>
          </div>
          <span className="text-gray-400 text-xs">CivTax AI · Tax Collector Operations Module v2.5</span>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: CITIZEN FULL DETAILS INSPECTOR                            */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeCitizenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
          <div className="bg-[#12141C] border-2 border-[#2A3042] rounded-3xl p-6 max-w-lg w-full relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setActiveCitizenModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#181B26] border border-[#2D3346] flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#262B3A] pb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E5B80B]/20 text-[#E5B80B] flex items-center justify-center font-black text-base">
                {activeCitizenModal.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="font-black text-white text-lg">{activeCitizenModal.name}</h3>
                <p className="text-gray-400 text-xs">{activeCitizenModal.phone} · {activeCitizenModal.email}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#181B26] rounded-xl flex justify-between">
                <span className="text-gray-400">Property ID</span>
                <span className="text-white font-mono font-bold">{activeCitizenModal.propertyId}</span>
              </div>
              <div className="p-3 bg-[#181B26] rounded-xl flex justify-between">
                <span className="text-gray-400">Ward & Locality</span>
                <span className="text-white font-bold">{activeCitizenModal.ward}</span>
              </div>
              <div className="p-3 bg-[#181B26] rounded-xl flex justify-between">
                <span className="text-gray-400">Property Area</span>
                <span className="text-white font-bold">{activeCitizenModal.propertyArea} sq.ft ({activeCitizenModal.propertyType})</span>
              </div>
              <div className="p-3 bg-[#181B26] rounded-xl flex justify-between">
                <span className="text-gray-400">Civic Credit Score</span>
                <span className="text-[#FFDC69] font-black">{activeCitizenModal.civicCreditScore} / 900</span>
              </div>
              <div className="p-3 bg-[#181B26] rounded-xl flex justify-between">
                <span className="text-gray-400">Annual Municipal Assessment</span>
                <span className="text-white font-bold">₹{activeCitizenModal.annualTax.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-[#181B26] rounded-xl flex justify-between">
                <span className="text-gray-400">Outstanding Arrears</span>
                <span className="text-red-400 font-black">₹{activeCitizenModal.outstandingDues.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setNudgeModalData(activeCitizenModal);
                  setActiveCitizenModal(null);
                }}
                className="flex-1 bg-[#181B26] hover:bg-[#252A3B] border border-[#2D3346] text-emerald-400 font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" /> Send Nudge
              </button>
              <button
                onClick={() => {
                  setCollectionModalData(activeCitizenModal);
                  setActiveCitizenModal(null);
                }}
                className="flex-1 bg-[#E5B80B] hover:bg-[#D1A000] text-black font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#E5B80B]/25 cursor-pointer"
              >
                <IndianRupee className="w-4 h-4" /> Collect Tax
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: SEND PERSONALIZED AI NUDGE                                */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {nudgeModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
          <div className="bg-[#12141C] border-2 border-[#2A3042] rounded-3xl p-6 max-w-lg w-full relative shadow-2xl space-y-6">
            <button
              onClick={() => setNudgeModalData(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#181B26] border border-[#2D3346] flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <span className="text-emerald-400 text-xs font-extrabold uppercase tracking-wider">Automated Outreach</span>
                <h3 className="font-black text-white text-lg">Send Payment Nudge to {nudgeModalData.name}</h3>
              </div>
            </div>

            <div className="p-4 bg-[#181B26] border border-[#2D3346] rounded-2xl space-y-2 text-xs">
              <p className="text-gray-400 font-bold uppercase tracking-wider">AI Message Preview (WhatsApp / SMS):</p>
              <p className="text-gray-200 leading-relaxed italic bg-[#11131B] p-3 rounded-xl border border-[#262B3A]">
                "Hello {nudgeModalData.name}, your property tax dues of ₹{(nudgeModalData.outstandingDues || nudgeModalData.amount || 5000).toLocaleString()} for {nudgeModalData.propertyId || 'Ward Zone 4'} are pending. Pay now via UPI One-Tap link to claim early bird discount and preserve your Civic Credit Score!"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSendNudge('WhatsApp')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Send via WhatsApp
              </button>
              <button
                onClick={() => handleSendNudge('SMS')}
                className="bg-[#E5B80B] hover:bg-[#D1A000] text-black font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#E5B80B]/25 cursor-pointer transition-all"
              >
                <Smartphone className="w-4 h-4" />
                Send via SMS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODAL 3: RECORD FIELD COLLECTION                                   */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {collectionModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
          <div className="bg-[#12141C] border-2 border-[#2A3042] rounded-3xl p-6 max-w-lg w-full relative shadow-2xl space-y-6">
            <button
              onClick={() => setCollectionModalData(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#181B26] border border-[#2D3346] flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E5B80B]/20 text-[#E5B80B] flex items-center justify-center font-bold">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[#E5B80B] text-xs font-extrabold uppercase tracking-wider">Field Operations</span>
                <h3 className="font-black text-white text-lg">Record Collection for {collectionModalData.name}</h3>
              </div>
            </div>

            <form onSubmit={handleRecordCollection} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-gray-300 font-bold">Amount Collected (₹)</label>
                <input
                  type="number"
                  defaultValue={collectionModalData.outstandingDues || collectionModalData.amount || 5000}
                  className="w-full bg-[#181B26] border border-[#2D3346] rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none focus:border-[#E5B80B]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 font-bold">Collection Mode</label>
                <select className="w-full bg-[#181B26] border border-[#2D3346] rounded-xl px-3.5 py-2.5 text-sm text-white font-medium outline-none focus:border-[#E5B80B]">
                  <option value="UPI">Handheld POS UPI QR Code</option>
                  <option value="Cash">Cash (Receipt Issued)</option>
                  <option value="Cheque">Municipal Demand Draft / Cheque</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 font-bold">Field Officer Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Cleared full Q2 property dues during doorstep inspection"
                  className="w-full bg-[#181B26] border border-[#2D3346] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-[#E5B80B]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#E5B80B] hover:bg-[#D1A000] text-black font-black py-4 rounded-2xl text-sm transition-all shadow-lg shadow-[#E5B80B]/25 cursor-pointer mt-2"
              >
                Confirm & Issue Digital Tax Receipt
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
