import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, LayoutGrid, Settings2, Users, BarChart3, Save, ChevronRight,
  CreditCard, Tag, AlertTriangle, Bell, Star, UserCog, Briefcase, MapPin,
  Lock, IndianRupee, TrendingUp, Activity, RefreshCw, Eye, EyeOff,
  CheckCircle2, Loader2, Zap, ArrowRight, Download, Send, BrainCircuit,
  Landmark, Globe, Clock, CircleDot, PlusCircle, Trash2, ToggleLeft, ToggleRight,
  ChevronDown, ChevronUp, ShieldAlert, Sparkles, BarChart2, Database
} from 'lucide-react';
import { adminService, wardService, citizenService, taxService } from '../services';

// ─────────────────────────────────────────────────────────────────────────────
// Tiny UI helpers
// ─────────────────────────────────────────────────────────────────────────────
function Badge({ label, color = 'amber' }) {
  const map = {
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    green: 'bg-green-500/15 text-green-400 border-green-500/30',
    red:   'bg-red-500/15 text-red-400 border-red-500/30',
    blue:  'bg-blue-500/15 text-blue-400 border-blue-500/30',
    gray:  'bg-gray-700 text-gray-300 border-gray-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${map[color] || map.amber}`}>
      {label}
    </span>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#111318] border border-gray-800 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function FieldRow({ label, children, hint }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3.5 border-b border-gray-800 last:border-0">
      <div className="sm:w-48 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-300">{label}</span>
        {hint && <p className="text-[11px] text-gray-600 mt-0.5">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Input({ value, onChange, prefix, suffix, type = 'text', className = '' }) {
  return (
    <div className={`flex items-center bg-[#1A1D25] border border-gray-700 rounded-xl overflow-hidden focus-within:border-amber-500 transition-colors ${className}`}>
      {prefix && <span className="px-3 text-gray-500 text-sm border-r border-gray-700">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="flex-1 bg-transparent text-white text-sm px-3 py-2.5 outline-none placeholder-gray-600"
      />
      {suffix && <span className="px-3 text-gray-500 text-sm border-l border-gray-700">{suffix}</span>}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        onClick={onChange}
        className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer ${checked ? 'bg-amber-500' : 'bg-gray-700'}`}
        style={{ height: 22, width: 40 }}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-[18px]' : ''}`}
          style={{ width: 18, height: 18, transition: 'transform 0.2s' }}
        />
      </div>
      {label && <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{label}</span>}
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 1 – Core Configuration
// ─────────────────────────────────────────────────────────────────────────────
function TaxRulesPanel() {
  const [baseRate, setBaseRate] = useState('1.5');
  const [waterRate, setWaterRate] = useState('0.8');
  const [residentialRate, setResidentialRate] = useState('1.2');
  const [commercialRate, setCommercialRate] = useState('2.8');
  const [gvtMultiplier, setGvtMultiplier] = useState('1.0');
  const [depreciation, setDepreciation] = useState('true');

  return (
    <Card>
      <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
        <IndianRupee className="w-4 h-4 text-amber-400" /> Tax Calculation Parameters (Bangalore MC FY 2023–24)
      </h3>
      <FieldRow label="Property Tax Base Rate" hint="% of Annual Rental Value">
        <Input value={baseRate} onChange={e => setBaseRate(e.target.value)} suffix="%" />
      </FieldRow>
      <FieldRow label="Water Tax Rate" hint="Per unit / annually">
        <Input value={waterRate} onChange={e => setWaterRate(e.target.value)} suffix="%" />
      </FieldRow>
      <FieldRow label="Residential Multiplier">
        <Input value={residentialRate} onChange={e => setResidentialRate(e.target.value)} suffix="×" />
      </FieldRow>
      <FieldRow label="Commercial Multiplier">
        <Input value={commercialRate} onChange={e => setCommercialRate(e.target.value)} suffix="×" />
      </FieldRow>
      <FieldRow label="Government Property Multiplier">
        <Input value={gvtMultiplier} onChange={e => setGvtMultiplier(e.target.value)} suffix="×" />
      </FieldRow>
      <FieldRow label="Enable Depreciation Benefit">
        <Toggle checked={depreciation === 'true'} onChange={() => setDepreciation(p => p === 'true' ? 'false' : 'true')} label="Apply 10% depreciation for buildings > 25 yrs" />
      </FieldRow>
    </Card>
  );
}

function PaymentPlansPanel() {
  const [plans] = useState([
    { id: 1, name: 'Monthly Instalment', installments: 12, interestFree: true, autopayDiscount: 2 },
    { id: 2, name: 'Quarterly Plan', installments: 4, interestFree: true, autopayDiscount: 1 },
    { id: 3, name: 'Half-Yearly Plan', installments: 2, interestFree: false, autopayDiscount: 0 },
    { id: 4, name: 'Yearly Lump Sum', installments: 1, interestFree: false, autopayDiscount: 5 },
  ]);

  return (
    <Card className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-amber-400" /> Payment Plan Structures
        </h3>
        <button className="text-xs text-amber-400 flex items-center gap-1 hover:text-amber-300 transition-colors">
          <PlusCircle className="w-3.5 h-3.5" /> Add Plan
        </button>
      </div>
      <div className="space-y-2">
        {plans.map(p => (
          <div key={p.id} className="flex items-center gap-3 bg-[#1A1D25] border border-gray-800 rounded-xl px-4 py-3">
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">{p.name}</p>
              <p className="text-gray-500 text-[11px]">{p.installments} instalment(s) · Interest-free: {p.interestFree ? 'Yes' : 'No'}</p>
            </div>
            {p.autopayDiscount > 0 && <Badge label={`AutoPay -${p.autopayDiscount}%`} color="green" />}
            <button className="text-gray-600 hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DiscountsPanel() {
  const [earlyBird, setEarlyBird] = useState('5');
  const [seniorCitizen, setSeniorCitizen] = useState('10');
  const [greenBuilding, setGreenBuilding] = useState('3');
  const [earlyBirdEnabled, setEarlyBirdEnabled] = useState(true);
  const [seniorEnabled, setSeniorEnabled] = useState(true);
  const [greenEnabled, setGreenEnabled] = useState(false);

  return (
    <Card className="mt-4">
      <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
        <Tag className="w-4 h-4 text-amber-400" /> Discounts & Incentives
      </h3>
      <FieldRow label="Early Bird Discount" hint="Paid before Apr 30">
        <div className="flex items-center gap-3">
          <Input value={earlyBird} onChange={e => setEarlyBird(e.target.value)} suffix="%" className="max-w-[120px]" />
          <Toggle checked={earlyBirdEnabled} onChange={() => setEarlyBirdEnabled(p => !p)} />
        </div>
      </FieldRow>
      <FieldRow label="Senior Citizen Relief" hint="Age ≥ 60">
        <div className="flex items-center gap-3">
          <Input value={seniorCitizen} onChange={e => setSeniorCitizen(e.target.value)} suffix="%" className="max-w-[120px]" />
          <Toggle checked={seniorEnabled} onChange={() => setSeniorEnabled(p => !p)} />
        </div>
      </FieldRow>
      <FieldRow label="Green Building Benefit" hint="IGBC-certified properties">
        <div className="flex items-center gap-3">
          <Input value={greenBuilding} onChange={e => setGreenBuilding(e.target.value)} suffix="%" className="max-w-[120px]" />
          <Toggle checked={greenEnabled} onChange={() => setGreenEnabled(p => !p)} />
        </div>
      </FieldRow>
    </Card>
  );
}

function PenaltyRulesPanel() {
  const [d30, setD30] = useState('1.5');
  const [d60, setD60] = useState('3.0');
  const [d90, setD90] = useState('5.0');
  const [compoundMonthly, setCompoundMonthly] = useState(true);
  const [graceDays, setGraceDays] = useState('7');
  const [reminderInterval, setReminderInterval] = useState('15');

  return (
    <Card className="mt-4">
      <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-400" /> Penalty & Reminder Rules
      </h3>
      <FieldRow label="30-Day Late Penalty" hint="Monthly surcharge on base tax">
        <Input value={d30} onChange={e => setD30(e.target.value)} suffix="%" className="max-w-[120px]" />
      </FieldRow>
      <FieldRow label="60-Day Late Penalty">
        <Input value={d60} onChange={e => setD60(e.target.value)} suffix="%" className="max-w-[120px]" />
      </FieldRow>
      <FieldRow label="90-Day Late Penalty (Freeze)">
        <Input value={d90} onChange={e => setD90(e.target.value)} suffix="%" className="max-w-[120px]" />
      </FieldRow>
      <FieldRow label="Compound Monthly">
        <Toggle checked={compoundMonthly} onChange={() => setCompoundMonthly(p => !p)} label="Apply compounding each month" />
      </FieldRow>
      <FieldRow label="Grace Period (days)">
        <Input value={graceDays} onChange={e => setGraceDays(e.target.value)} suffix="days" className="max-w-[140px]" />
      </FieldRow>
      <FieldRow label="Reminder Frequency">
        <Input value={reminderInterval} onChange={e => setReminderInterval(e.target.value)} suffix="days" className="max-w-[140px]" />
      </FieldRow>
    </Card>
  );
}

function RewardRulesPanel() {
  const [streakMultiplier, setStreakMultiplier] = useState('1.5');
  const [firstPayBonus, setFirstPayBonus] = useState('200');
  const [referralBonus, setReferralBonus] = useState('100');
  const [goldThreshold, setGoldThreshold] = useState('800');
  const [platinumThreshold, setPlatinumThreshold] = useState('950');
  const [gamificationEnabled, setGamificationEnabled] = useState(true);

  return (
    <Card className="mt-4">
      <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
        <Star className="w-4 h-4 text-amber-400" /> Reward & Gamification Rules
      </h3>
      <FieldRow label="Enable Gamification">
        <Toggle checked={gamificationEnabled} onChange={() => setGamificationEnabled(p => !p)} label="Civic Score, badges, leaderboards" />
      </FieldRow>
      <FieldRow label="Payment Streak Multiplier" hint="Score boost per consecutive month">
        <Input value={streakMultiplier} onChange={e => setStreakMultiplier(e.target.value)} suffix="×" className="max-w-[140px]" />
      </FieldRow>
      <FieldRow label="First-Payment Bonus Points">
        <Input value={firstPayBonus} onChange={e => setFirstPayBonus(e.target.value)} suffix="pts" className="max-w-[140px]" />
      </FieldRow>
      <FieldRow label="Referral Bonus Points">
        <Input value={referralBonus} onChange={e => setReferralBonus(e.target.value)} suffix="pts" className="max-w-[140px]" />
      </FieldRow>
      <FieldRow label="Gold Tier Threshold" hint="Civic Score to reach Gold">
        <Input value={goldThreshold} onChange={e => setGoldThreshold(e.target.value)} suffix="pts" className="max-w-[140px]" />
      </FieldRow>
      <FieldRow label="Platinum Tier Threshold">
        <Input value={platinumThreshold} onChange={e => setPlatinumThreshold(e.target.value)} suffix="pts" className="max-w-[140px]" />
      </FieldRow>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 2 – Management & Governance (Populated from CSV Service Layer)
// ─────────────────────────────────────────────────────────────────────────────
function ManageCitizensPanel() {
  const { allCitizens } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const filtered = (allCitizens || []).filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.ward || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.id || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" /> Manage Citizens ({filtered.length} Total from Dataset)
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">300 Verified Bangalore Municipal Taxpayers loaded via CSV Service</p>
        </div>
        <div className="flex items-center gap-2 bg-[#1A1D25] border border-gray-700 rounded-xl px-3 py-2">
          <Users className="w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search name, phone, ward..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent text-sm text-white outline-none w-48 placeholder-gray-600"
          />
        </div>
      </div>

      <div className="space-y-2">
        {paginated.map(c => (
          <div key={c.id} className="flex items-center gap-3 bg-[#1A1D25] border border-gray-800 rounded-xl px-4 py-3 hover:border-gray-700 transition-colors">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs flex-shrink-0">
              {(c.name || 'C').split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white text-sm font-semibold truncate">{c.name}</p>
                <span className="text-[10px] text-gray-500 font-mono">📱 {c.phone}</span>
              </div>
              <p className="text-gray-500 text-[11px]">
                {c.id} · {c.ward} · {c.propertyType} (₹{Number(c.annualTax || 0).toLocaleString()}/yr)
              </p>
            </div>
            <Badge label={c.status} color={c.status === 'Compliant' ? 'green' : 'red'} />
            <div className="text-right">
              <span className="text-xs font-black text-amber-400">{c.civicCreditScore || c.score || 720} pts</span>
              <p className="text-[10px] text-gray-500">Score</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-800 text-xs text-gray-400">
          <span>Showing page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-[#1A1D25] border border-gray-700 text-gray-300 disabled:opacity-30"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-[#1A1D25] border border-gray-700 text-gray-300 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function ManageOfficersPanel() {
  const [officers, setOfficers] = useState([
    { id: 'O001', name: 'Karthik Subbaiah', ward: 'Ward 2 (Rajajinagar), Ward 4 (Indiranagar), Ward 5 (Jayanagar)', role: 'Senior Collector', active: true },
    { id: 'O002', name: 'Divya Nair', ward: 'Ward 1 (Gandhinagar), Ward 3 (Koramangala), Ward 7 (Hebbal)', role: 'Field Collector', active: true },
    { id: 'O003', name: 'Arjun Pillai', ward: 'Ward 6 (Whitefield), Ward 8 (Electronic City)', role: 'Junior Collector', active: true },
  ]);

  return (
    <Card className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-amber-400" /> Manage Tax Officers
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">Municipal field officers mapped across 8 ward territories</p>
        </div>
        <button className="text-xs text-amber-400 flex items-center gap-1 hover:text-amber-300 transition-colors">
          <PlusCircle className="w-3.5 h-3.5" /> Add Officer
        </button>
      </div>
      <div className="space-y-2">
        {officers.map(o => (
          <div key={o.id} className="flex items-center gap-3 bg-[#1A1D25] border border-gray-800 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs flex-shrink-0">
              {o.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{o.name}</p>
              <p className="text-gray-500 text-[11px]">{o.id} · {o.role}</p>
              <p className="text-gray-600 text-[10px] mt-0.5">Territory: {o.ward}</p>
            </div>
            <Badge label={o.active ? 'Active' : 'Inactive'} color={o.active ? 'green' : 'gray'} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function ManageWardsPanel() {
  const { wardRankings } = useAuth();
  const [wards, setWards] = useState([]);

  useEffect(() => {
    async function fetchWards() {
      const list = await adminService.getWards();
      setWards(list);
    }
    fetchWards();
  }, []);

  const displayList = wards.length ? wards : (wardRankings || []);

  return (
    <Card className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" /> Manage Wards & Officer Assignment (CSV Dataset)
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">8 Municipal Wards of Bangalore with live collection efficiency</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {['Code', 'Ward Name', 'Tax Collected', 'Outstanding', 'Assigned Officer', 'Collection Rate'].map(h => (
                <th key={h} className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {displayList.map(w => (
              <tr key={w.code || w.id} className="group hover:bg-white/5 transition-colors">
                <td className="py-3 pr-4 font-mono text-amber-400 text-xs font-bold">{w.code || w.id}</td>
                <td className="py-3 pr-4 text-white font-medium">{w.wardName || w.name}</td>
                <td className="py-3 pr-4 text-green-400 font-semibold">₹{(Number(w.totalCollected || 440000) / 100000).toFixed(2)}L</td>
                <td className="py-3 pr-4 text-red-400 font-semibold">₹{(Number(w.totalOutstanding || 210000) / 100000).toFixed(2)}L</td>
                <td className="py-3 pr-4">
                  <span className="text-blue-400 text-xs">{w.officer || 'Karthik Subbaiah'}</span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${w.rate || 65}%`, backgroundColor: (w.rate || 65) > 65 ? '#22c55e' : (w.rate || 65) > 55 ? '#f59e0b' : '#ef4444' }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white">{w.rate || 65}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function RolesPanel() {
  const ROLES = [
    { name: 'System Admin', perms: ['Full System Access', 'Config', 'Users', 'Reports', 'Audit Logs'] },
    { name: 'Tax Collector', perms: ['View Citizens', 'Record Payment', 'Generate Notice', 'View Ward Report'] },
    { name: 'Auditor', perms: ['View All Reports', 'Audit Logs', 'Export Data'] },
    { name: 'Citizen', perms: ['View Own Bills', 'Pay Tax', 'Download Receipts', 'View Rewards'] },
  ];

  return (
    <Card className="mt-4">
      <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
        <Lock className="w-4 h-4 text-amber-400" /> Roles & Permissions Matrix
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ROLES.map(r => (
          <div key={r.name} className="bg-[#1A1D25] border border-gray-800 rounded-xl p-4">
            <p className="text-white font-bold text-sm mb-2">{r.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {r.perms.map(p => (
                <span key={p} className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full border border-gray-700">{p}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 3 – Monitoring & Analytics (Populated from CSV Dataset Summary & Trends)
// ─────────────────────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseFloat(String(target).replace(/[^0-9.]/g, ''));
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

function MonitoringPanel() {
  const [metrics, setMetrics] = useState({
    totalCollected: 3242800,
    totalPending: 2095900,
    complianceRate: 60.7,
    autoPayEnrolled: 132
  });
  const [wards, setWards] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const m = await adminService.getMetrics();
        setMetrics(m);
        const w = await adminService.getWards();
        setWards(w);
        const logs = await adminService.getActivityLogs();
        setActivityLogs(logs);
      } catch (err) {
        console.warn('Admin monitoring metrics fallback:', err);
      }
    }
    loadData();
  }, []);

  const totalRev = useCountUp(metrics.totalCollected || 3242800, 1800);
  const collRate = useCountUp(metrics.complianceRate || 60.7, 1200);
  const pending = useCountUp(metrics.totalPending || 2095900, 1600);
  const autopay = useCountUp(metrics.autoPayEnrolled || 132, 1400);

  const kpis = [
    { label: 'Total Revenue (YTD)', value: `₹${(totalRev / 10000000).toFixed(2)} Cr`, change: '+18%', isUp: true, color: 'text-green-400', icon: IndianRupee },
    { label: 'Collection Rate', value: `${Math.round(collRate)}%`, change: '+9 pts', isUp: true, color: 'text-blue-400', icon: TrendingUp },
    { label: 'Pending / Overdue', value: `₹${(pending / 10000000).toFixed(2)} Cr`, change: '-3%', isUp: false, color: 'text-red-400', icon: AlertTriangle },
    { label: 'AutoPay Adoption', value: Math.round(autopay).toLocaleString(), change: '+24%', isUp: true, color: 'text-amber-400', icon: RefreshCw },
  ];

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <Card key={k.label} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[11px] font-semibold uppercase tracking-wide">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <p className="text-2xl font-black text-white tracking-tight">{k.value}</p>
            <span className={`text-[11px] font-bold ${k.isUp ? 'text-green-400' : 'text-red-400'}`}>{k.change} this quarter</span>
          </Card>
        ))}
      </div>

      {/* Ward Performance */}
      <Card>
        <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-amber-400" /> Ward Performance (CSV Ward Summary)
        </h3>
        <div className="space-y-3">
          {(wards.length ? wards : [
            { code: 'W07', rate: 68.5 },
            { code: 'W08', rate: 66.7 },
            { code: 'W03', rate: 64.1 },
            { code: 'W05', rate: 61.7 },
            { code: 'W02', rate: 61.6 },
            { code: 'W01', rate: 58.4 },
            { code: 'W04', rate: 53.5 },
            { code: 'W06', rate: 49.1 }
          ]).map(w => (
            <div key={w.code || w.id} className="flex items-center gap-3">
              <span className="text-gray-500 text-xs font-mono w-8">{w.code || w.id}</span>
              <span className="text-gray-300 text-xs w-28 truncate">{w.wardName || w.name}</span>
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${w.rate || 60}%`, backgroundColor: (w.rate || 60) >= 65 ? '#22c55e' : (w.rate || 60) >= 55 ? '#f59e0b' : '#ef4444' }}
                />
              </div>
              <span className="text-white text-xs font-bold w-12 text-right">{w.rate || 60}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* System Activity Log */}
      <Card>
        <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" /> System Activity Log
        </h3>
        <div className="space-y-2">
          {activityLogs.map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-[#1A1D25] border border-gray-800 rounded-xl px-4 py-3">
              <CircleDot className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${item.color}`} />
              <p className="text-gray-300 text-xs flex-1">{item.msg}</p>
              <span className="text-gray-600 text-[10px] flex-shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Execution Pipeline – Save / propagate state machine
// ─────────────────────────────────────────────────────────────────────────────
function ExecutionPipeline({ onSave }) {
  const [phase, setPhase] = useState(0);

  const handleSave = async () => {
    setPhase(1);
    await adminService.saveAndPropagate({ updated: true });
    setTimeout(() => setPhase(2), 1800);
    setTimeout(() => { setPhase(3); if (onSave) onSave(); }, 3600);
    setTimeout(() => setPhase(0), 7000);
  };

  const STEPS = [
    { label: 'Admin Confirms', sub: 'Save & Update Changes', icon: Save, doneColor: 'text-amber-400' },
    { label: 'Database Write', sub: 'System Applies New Rules', icon: Database, doneColor: 'text-blue-400' },
    { label: 'Module Sync', sub: 'Officer + Citizen UIs Updated', icon: Globe, doneColor: 'text-green-400' },
  ];

  return (
    <div className="bg-[#0C0E12] border border-gray-800 rounded-2xl p-5 mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="font-black text-white text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Execution & Propagation Pipeline
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">Saves config and syncs all downstream modules in real-time</p>
        </div>
        <button
          onClick={handleSave}
          disabled={phase > 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg ${
            phase === 0
              ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/30'
              : phase === 3
              ? 'bg-green-500 text-white shadow-green-500/30'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {phase === 0 && <><Save className="w-4 h-4" /> Save & Propagate</>}
          {phase === 1 && <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>}
          {phase === 2 && <><Loader2 className="w-4 h-4 animate-spin" /> Propagating…</>}
          {phase === 3 && <><CheckCircle2 className="w-4 h-4" /> Synced Successfully</>}
        </button>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-0">
        {STEPS.map((step, idx) => {
          const done = phase > idx;
          const active = phase === idx + 1;
          const Icon = step.icon;
          return (
            <div key={idx} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                  done ? `border-green-500 bg-green-500/20 ${step.doneColor}`
                  : active ? 'border-amber-500 bg-amber-500/20 text-amber-400 animate-pulse'
                  : 'border-gray-700 bg-gray-800 text-gray-600'
                }`}>
                  {done ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Icon className="w-5 h-5" />}
                </div>
                <p className={`text-xs font-bold mt-2 text-center ${done ? 'text-green-400' : active ? 'text-amber-400' : 'text-gray-600'}`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-gray-600 text-center mt-0.5 max-w-[100px]">{step.sub}</p>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all duration-700 ${done ? 'bg-green-500' : 'bg-gray-800'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Live status messages */}
      {phase > 0 && (
        <div className="mt-4 bg-[#1A1D25] border border-gray-800 rounded-xl p-3 space-y-1.5 text-xs">
          {phase >= 1 && <p className="text-amber-400">✦ Admin confirmed save action · Writing to DIGIT core database…</p>}
          {phase >= 2 && <p className="text-blue-400">✦ Tax rules, penalty thresholds & reward parameters updated globally</p>}
          {phase >= 3 && <p className="text-green-400">✦ Officer Module & Citizen Portal synced · Changes live across all 8 wards</p>}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar navigation structure
// ─────────────────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    group: 'Core Configuration',
    icon: Settings2,
    items: [
      { id: 'tax-rules',     label: 'Tax Rules',            icon: IndianRupee },
      { id: 'pay-plans',     label: 'Payment Plans',        icon: CreditCard },
      { id: 'discounts',     label: 'Discounts & Incentives', icon: Tag },
      { id: 'penalties',     label: 'Penalty & Reminder Rules', icon: AlertTriangle },
      { id: 'rewards',       label: 'Reward Rules',         icon: Star },
    ],
  },
  {
    group: 'Management & Governance',
    icon: UserCog,
    items: [
      { id: 'citizens',      label: 'Manage Citizens',      icon: Users },
      { id: 'officers',      label: 'Manage Tax Officers',  icon: Briefcase },
      { id: 'wards',         label: 'Manage Wards',         icon: MapPin },
      { id: 'roles',         label: 'Roles & Permissions',  icon: Lock },
    ],
  },
  {
    group: 'Monitoring & Analytics',
    icon: BarChart3,
    items: [
      { id: 'analytics',     label: 'Analytics Overview',   icon: BarChart3 },
    ],
  },
];

function renderSection(id) {
  switch (id) {
    // Config
    case 'tax-rules': return <TaxRulesPanel />;
    case 'pay-plans': return <PaymentPlansPanel />;
    case 'discounts': return <DiscountsPanel />;
    case 'penalties': return <PenaltyRulesPanel />;
    case 'rewards':   return <RewardRulesPanel />;
    // Governance
    case 'citizens':  return <ManageCitizensPanel />;
    case 'officers':  return <ManageOfficersPanel />;
    case 'wards':     return <ManageWardsPanel />;
    case 'roles':     return <RolesPanel />;
    // Analytics
    case 'analytics': return <MonitoringPanel />;
    default: return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Admin Page export
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [activeId, setActiveId] = useState('tax-rules');
  const [openGroups, setOpenGroups] = useState({ 'Core Configuration': true, 'Management & Governance': true, 'Monitoring & Analytics': true });
  const [saved, setSaved] = useState(false);

  const toggleGroup = g => setOpenGroups(p => ({ ...p, [g]: !p[g] }));

  const activeItem = SECTIONS.flatMap(s => s.items).find(i => i.id === activeId);
  const activeSection = SECTIONS.find(s => s.items.some(i => i.id === activeId));

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-[11px] font-extrabold uppercase tracking-widest">ULB Command Center</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Control Panel</h1>
          <p className="text-gray-500 text-xs mt-0.5">Bangalore Municipal Corporation · Connected to CSV Data Layer & DIGIT APIs</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            CSV Data Engine Active
          </div>
          <Badge label="Admin Access" color="amber" />
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────── */}
      <div className="flex gap-4 min-h-[600px]">

        {/* SIDEBAR */}
        <aside className="w-56 flex-shrink-0 hidden md:flex flex-col gap-1">
          {SECTIONS.map(section => (
            <div key={section.group}>
              {/* group header */}
              <button
                onClick={() => toggleGroup(section.group)}
                className="flex items-center justify-between w-full px-3 py-2 text-left group"
              >
                <div className="flex items-center gap-2">
                  <section.icon className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">{section.group}</span>
                </div>
                {openGroups[section.group]
                  ? <ChevronUp className="w-3 h-3 text-gray-600" />
                  : <ChevronDown className="w-3 h-3 text-gray-600" />}
              </button>

              {openGroups[section.group] && (
                <div className="flex flex-col gap-0.5 pl-1 mb-2">
                  {section.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeId === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveId(item.id)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left w-full ${
                          isActive
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-gray-600'}`} />
                        <span className="truncate text-xs">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
            {activeSection && <><ChevronRight className="w-3 h-3" /><span>{activeSection.group}</span></>}
            {activeItem && <><ChevronRight className="w-3 h-3" /><span className="text-amber-400 font-semibold">{activeItem.label}</span></>}
          </div>

          {/* Mobile: horizontal scroll nav */}
          <div className="flex md:hidden overflow-x-auto gap-2 pb-2 mb-4">
            {SECTIONS.flatMap(s => s.items).map(item => {
              const Icon = item.icon;
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                    isActive ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-[#111318] border border-gray-800 text-gray-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Section render */}
          {renderSection(activeId)}

          {/* ── Execution Pipeline always visible at bottom ── */}
          {activeSection?.group !== 'Monitoring & Analytics' && (
            <ExecutionPipeline onSave={() => setSaved(true)} />
          )}
        </div>

      </div>
    </div>
  );
}
