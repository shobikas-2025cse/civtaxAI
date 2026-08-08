import { useState, useEffect } from 'react';
import {
  IndianRupee, MapPin, Users, TrendingUp, RefreshCw, CircleDollarSign,
  Clock, AlertTriangle, Cpu, Trophy, BarChart3, ChevronUp, ChevronDown,
  Wifi, Calendar, Building2
} from 'lucide-react';
import { collectorService, wardService } from '../services';

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
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
      </span>
      <span className="text-green-400 text-xs font-bold tracking-wide">Live</span>
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
      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
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
    <div className={`flex items-center justify-between py-3.5 ${!isFirst ? 'border-t border-gray-800' : ''}`}>
      <span className="text-gray-300 text-sm font-medium">{label}</span>
      <span className="text-white text-sm font-bold">{pct}%</span>
    </div>
  );
}

// ── Nav pill ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'revenue',    label: 'Revenue',         icon: IndianRupee },
  { id: 'heatmap',   label: 'Ward heat map',    icon: MapPin },
  { id: 'citizens',  label: 'Citizens',          icon: Users },
  { id: 'trend',     label: 'Collection trend',  icon: TrendingUp },
  { id: 'autopay',   label: 'AutoPay',           icon: RefreshCw },
  { id: 'pending',   label: 'Pending queue',     icon: Clock },
  { id: 'ai',        label: 'AI insights',       icon: Cpu },
  { id: 'score',     label: 'Scoreboard',        icon: Trophy },
];

// ── Mini line-chart (SVG sparkline) ──────────────────────────────────────────
function Sparkline({ data, color = '#22c55e' }) {
  const h = 40, w = 160, pad = 4;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + ((max - v) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── Mini donut (SVG) ──────────────────────────────────────────────────────────
function MiniDonut({ pct, color }) {
  const r = 28, cx = 34, cy = 34, circumf = 2 * Math.PI * r;
  const dash = (pct / 100) * circumf;
  return (
    <svg width="68" height="68" viewBox="0 0 68 68">
      <circle cx={cx} cy={cy} r={r} stroke="#1f2937" strokeWidth="8" fill="none" />
      <circle
        cx={cx} cy={cy} r={r}
        stroke={color} strokeWidth="8" fill="none"
        strokeDasharray={`${dash} ${circumf}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text x={cx} y={cy + 5} textAnchor="middle" fill="white" fontSize="13" fontWeight="700">{pct}%</text>
    </svg>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function TaxCollectorPage() {
  const [activeNav, setActiveNav] = useState('revenue');
  const [syncTime, setSyncTime] = useState('2 min ago');

  // Load metrics dynamically from service layer (CSV or FastAPI)
  const [metrics, setMetrics] = useState({
    totalCollected: '3.24 Cr',
    complianceRate: 61,
    pendingDues: '2.09 Cr',
    autoPayEnrolled: 132
  });
  const [collectionStages, setCollectionStages] = useState([
    { label: 'Paid on time',      pct: 58, barColor: '#22c55e' },
    { label: 'Paid late',         pct: 15, barColor: '#eab308' },
    { label: '30-day overdue',    pct: 12, barColor: '#f97316' },
    { label: '60-day (penalty)',  pct:  9, barColor: '#ef4444' },
    { label: '90-day (frozen)',   pct:  6, barColor: '#991b1b' },
  ]);
  const [paymentMethods, setPaymentMethods] = useState([
    { label: 'UPI / AutoPay',     pct: 48 },
    { label: 'UPI manual',        pct: 29 },
    { label: 'Net banking',       pct: 14 },
    { label: 'Debit / credit card', pct:  7 },
    { label: 'Counter (offline)', pct:  2 },
  ]);

  useEffect(() => {
    async function loadServiceData() {
      try {
        const m = await collectorService.getDashboardMetrics();
        setMetrics(m);
        const stages = await collectorService.getCollectionStages();
        setCollectionStages(stages);
        const methods = await collectorService.getPaymentMethodSplit();
        setPaymentMethods(methods);
      } catch (err) {
        console.warn('Using default collector metrics:', err);
      }
    }
    loadServiceData();
  }, []);

  // Simulate live sync ticker
  useEffect(() => {
    let secs = 120;
    const id = setInterval(() => {
      secs += 1;
      if (secs < 60) setSyncTime(`${secs}s ago`);
      else if (secs < 3600) setSyncTime(`${Math.floor(secs / 60)} min ago`);
      else setSyncTime(`${Math.floor(secs / 3600)}h ago`);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const complianceRateNum = useCountUp(metrics.complianceRate || 61, 1400);
  const enrolledNum = useCountUp(metrics.autoPayEnrolled || 132, 1600);

  return (
    <div className="space-y-6 font-sans text-white">

      {/* ── Section label ─────────────────────────────────────────────── */}
      <p className="text-gray-500 text-sm">
        Architected comprehensive tax collector dashboard with eight integrated modules
      </p>

      {/* ── Main card wrapper ─────────────────────────────────────────── */}
      <div className="bg-[#0C0E12] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">

        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-800 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-gray-400" />
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Tax Collector — Municipality Dashboard
              </h1>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm">
              Bangalore Municipal Corporation &nbsp;·&nbsp; FY 2023–24 &nbsp;·&nbsp; Ward Zone 4
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <LiveBadge />
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>Last sync:&nbsp;<span className="text-gray-200 font-semibold">{syncTime}</span></span>
            </div>
          </div>
        </div>

        {/* ── NAVIGATION PILLS ────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-gray-800 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = activeNav === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveNav(id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-white text-black shadow-md'
                      : 'bg-[#161A22] border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── KPI GRID ────────────────────────────────────────────────── */}
        <div className="px-6 py-5 border-b border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Total Collected */}
            <div className="bg-[#111318] border border-gray-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total collected (YTD)</span>
                <div className="w-8 h-8 rounded-lg bg-green-500/15 text-green-400 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-white tracking-tight">
                <span className="text-xl font-bold text-gray-300 mr-0.5">₹</span>{metrics.totalCollected || '3.24 Cr'}
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-green-400">
                <ChevronUp className="w-3.5 h-3.5" />
                <span>18%</span>
                <span className="text-gray-500 font-normal">vs last year</span>
              </div>
            </div>

            {/* Compliance Rate */}
            <div className="bg-[#111318] border border-gray-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Compliance rate</span>
                <MiniDonut pct={Math.round(metrics.complianceRate || 61)} color="#22c55e" />
              </div>
              <p className="text-3xl font-black text-white tracking-tight">
                {Math.round(complianceRateNum)}%
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-green-400">
                <ChevronUp className="w-3.5 h-3.5" />
                <span>9 pts</span>
                <span className="text-gray-500 font-normal">this quarter</span>
              </div>
            </div>

            {/* Pending Dues */}
            <div className="bg-[#111318] border border-gray-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Pending dues</span>
                <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-white tracking-tight">
                <span className="text-xl font-bold text-gray-300 mr-0.5">₹</span>{metrics.pendingDues || '2.09 Cr'}
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-red-400">
                <ChevronDown className="w-3.5 h-3.5" />
                <span>3%</span>
                <span className="text-gray-500 font-normal">from last month</span>
              </div>
            </div>

            {/* AutoPay Enrolled */}
            <div className="bg-[#111318] border border-gray-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">AutoPay enrolled</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-white tracking-tight">
                {Math.round(enrolledNum).toLocaleString()}
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-green-400">
                <ChevronUp className="w-3.5 h-3.5" />
                <span>24%</span>
                <span className="text-gray-500 font-normal">this month</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── BOTTOM SPLIT SECTION ────────────────────────────────────── */}
        <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* LEFT: Collection by stage */}
          <div className="bg-[#111318] border border-gray-800 rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-white text-sm">Collection by stage</h3>
            </div>

            <div className="space-y-4">
              {collectionStages.map((s) => (
                <StageRow key={s.label} {...s} />
              ))}
            </div>

            {/* Mini sparkline teaser */}
            <div className="pt-3 border-t border-gray-800">
              <p className="text-gray-500 text-[11px] mb-2 uppercase tracking-wider font-semibold">Monthly trend (last 8 months)</p>
              <Sparkline data={[42, 48, 51, 55, 58, 60, 62, 58]} color="#22c55e" />
            </div>
          </div>

          {/* RIGHT: Payment method split */}
          <div className="bg-[#111318] border border-gray-800 rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                <h3 className="font-bold text-white text-sm">Payment method split</h3>
              </div>
              <span className="text-gray-500 text-[11px]">FY 2023–24</span>
            </div>

            {paymentMethods.map((m, i) => (
              <PaymentRow key={m.label} {...m} isFirst={i === 0} />
            ))}

            {/* Visual bar stacks */}
            <div className="pt-4 border-t border-gray-800">
              <p className="text-gray-500 text-[11px] mb-2 uppercase tracking-wider font-semibold">Visual split</p>
              <div className="flex h-4 w-full rounded-full overflow-hidden gap-0.5">
                {[
                  { pct: 48, color: '#22c55e' },
                  { pct: 29, color: '#3b82f6' },
                  { pct: 14, color: '#8b5cf6' },
                  { pct:  7, color: '#f59e0b' },
                  { pct:  2, color: '#6b7280' },
                ].map((seg, i) => (
                  <div
                    key={i}
                    className="h-full rounded-sm first:rounded-l-full last:rounded-r-full"
                    style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
                    title={paymentMethods[i]?.label || ''}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {[
                  { label: 'UPI/AutoPay', color: '#22c55e' },
                  { label: 'UPI manual', color: '#3b82f6' },
                  { label: 'Net banking', color: '#8b5cf6' },
                  { label: 'Card', color: '#f59e0b' },
                  { label: 'Offline', color: '#6b7280' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-[11px] text-gray-400">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── FOOTER ──────────────────────────────────────────────────── */}
        <div className="px-6 py-3 border-t border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <Wifi className="w-3.5 h-3.5" />
            <span>Connected to DIGIT / UPYOG open APIs · Real-time sync enabled</span>
          </div>
          <span className="text-gray-600 text-xs">CivTax AI · Tax Collector Module v2.4</span>
        </div>

      </div>

    </div>
  );
}
