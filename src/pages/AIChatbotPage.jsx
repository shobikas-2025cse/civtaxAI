import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BotMessageSquare, Send, Sparkles, ShieldAlert, ShieldCheck,
  TrendingUp, AlertTriangle, Clock, Zap, RefreshCw, IndianRupee,
  User, ChevronRight, CircleDot, Loader2, X, BarChart2, Star
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Predictive Risk Engine (client-side, uses citizen data from AuthContext)
// ─────────────────────────────────────────────────────────────────────────────
function computeRiskProfile(user, taxes) {
  if (!user) return null;

  const overdueTaxes   = taxes.filter(t => t.status === 'overdue');
  const pendingTaxes   = taxes.filter(t => t.status === 'pending');
  const overdueTotal   = overdueTaxes.reduce((s, t) => s + t.amount + (t.arrears || 0), 0);
  const pendingTotal   = pendingTaxes.reduce((s, t) => s + t.amount, 0);
  const maxOverdueDays = overdueTaxes.length
    ? Math.max(...overdueTaxes.map(t => Math.abs(t.daysUntilDue || 0)))
    : 0;

  const score  = user.riskScore ?? 50;
  const civic  = user.civicCreditScore ?? 720;
  const streak = user.streak ?? 0;

  // Severity thresholds
  let level, label, color, bgColor, borderColor, icon;
  if (score < 30) {
    level = 'low';    label = 'Low Risk';      color = '#22c55e'; bgColor = 'bg-green-500/10';  borderColor = 'border-green-500/30'; icon = ShieldCheck;
  } else if (score < 60) {
    level = 'medium'; label = 'Moderate Risk'; color = '#f59e0b'; bgColor = 'bg-amber-500/10';  borderColor = 'border-amber-500/30'; icon = AlertTriangle;
  } else if (score < 80) {
    level = 'high';   label = 'High Risk';     color = '#f97316'; bgColor = 'bg-orange-500/10'; borderColor = 'border-orange-500/30'; icon = ShieldAlert;
  } else {
    level = 'critical'; label = 'Critical Risk'; color = '#ef4444'; bgColor = 'bg-red-500/10';  borderColor = 'border-red-500/30';   icon = ShieldAlert;
  }

  // Projected 30-day outcome
  let projection;
  if (level === 'low')      projection = 'Civic Score likely to rise +15–25 pts if payment streak continues.';
  else if (level === 'medium') projection = 'Penalty surcharge likely in 14 days unless dues cleared now.';
  else if (level === 'high')   projection = 'Property flag risk within 30 days. Immediate action recommended.';
  else                         projection = 'Legal escalation pipeline active. Amnesty waiver window closing.';

  return {
    score, level, label, color, bgColor, borderColor, icon,
    civic, streak, overdueTotal, pendingTotal, overdueTaxes, pendingTaxes, maxOverdueDays,
    projection,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Local AI knowledge base — simulated responses keyed on intent
// ─────────────────────────────────────────────────────────────────────────────
const KB = [
  {
    patterns: ['property tax', 'property', 'house tax'],
    answer: (u, r) =>
      `**Property Tax** is calculated as: Annual Rental Value × applicable zone rate (currently 1.5% for residential). For your property **${u?.propertyId}** in ${u?.ward}, the Q3 2026 bill is the largest pending item. Paying before Sep 15 avoids a 1.5%/month penalty surcharge.`
  },
  {
    patterns: ['water tax', 'water'],
    answer: (u) =>
      `**Water Tax** is charged per unit of annual municipal water consumption. The current rate is 0.8% of assessed value. Your August water bill is due on Aug 30. You can pay in one shot or include it in a monthly instalment plan.`
  },
  {
    patterns: ['waste', 'garbage', 'solid waste'],
    answer: () =>
      `**Solid Waste Tax** is ₹600 per residential unit annually. It funds door-step collection and processing. Overdue waste tax also attracts a ₹50/month late surcharge — clear it to avoid Civic Score impact.`
  },
  {
    patterns: ['penalty', 'fine', 'late fee', 'surcharge'],
    answer: () =>
      `**Penalty Structure:**\n• 30-day overdue → +1.5%/month on base tax\n• 60-day overdue → +3.0%/month compound\n• 90-day overdue → +5.0%/month + account freeze\nPaying within the current billing cycle prevents any penalty from applying.`
  },
  {
    patterns: ['discount', 'rebate', 'incentive', 'early bird'],
    answer: () =>
      `**Active Discounts:**\n• **Early Bird** (before Apr 30): 5% off\n• **Senior Citizen Relief** (age ≥ 60): 10% off\n• **AutoPay Discount**: 2% off each instalment\n• **Annual Lump Sum Bonus**: 5% off + free reward certificate\nEnable AutoPay in the Pay Tax section to lock in savings automatically.`
  },
  {
    patterns: ['instalment', 'installment', 'emi', 'split', 'monthly'],
    answer: () =>
      `You can split your annual tax into **12 monthly instalments** (interest-free with AutoPay enabled), **4 quarterly payments**, or **2 biannual payments**. Go to **Pay Tax → Monthly Instalments** to set this up with a toggle for Auto-debit.`
  },
  {
    patterns: ['autopay', 'auto pay', 'auto-pay'],
    answer: () =>
      `**AutoPay** links your UPI/bank account for automatic monthly deductions on the 5th of each month. Benefits:\n• Never miss a due date\n• 2% discount per instalment\n• Streak maintained automatically\n• +50 XP per successful auto-deduction`
  },
  {
    patterns: ['civic score', 'credit score', 'cred score', 'score'],
    answer: (u, r) =>
      `Your current **Civic Credit Score is ${r?.civic ?? u?.civicCreditScore ?? '—'}** (out of 900). This is calculated from: payment history (40%), on-time rate (30%), dues balance (20%), and community engagement (10%). Paying overdue bills can add **+25 pts** immediately.`
  },
  {
    patterns: ['reward', 'badge', 'xp', 'points', 'streak'],
    answer: (u) =>
      `You have **${u?.xp ?? 0} XP** and a **${u?.streak ?? 0}-month streak**. Rewards include:\n• Streak Master badge (3 months) → +150 XP\n• Platinum Tier (score ≥ 950) → VIP permit fast-track\n• Each on-time payment → +150 XP + Civic Score boost\nCheck the **Rewards** tab for all active badges.`
  },
  {
    patterns: ['risk', 'defaulter', 'overdue', 'default'],
    answer: (u, r) =>
      r?.level === 'low'
        ? `✅ Good news! Your risk level is currently **Low (${r.score}/100)**. Keep your payment streak alive and you're on track for a Civic Score boost next quarter.`
        : `⚠️ Your risk score is **${r?.score}/100 — ${r?.label}**. ${r?.projection} Clear your ₹${r?.overdueTotal?.toLocaleString() ?? 0} in overdue dues immediately via **Pay Tax** to reduce your risk level.`
  },
  {
    patterns: ['upi', 'payment method', 'how to pay', 'pay'],
    answer: () =>
      `**Accepted Payment Methods:**\n• UPI One-Tap (Google Pay, PhonePe, Paytm)\n• Debit/Credit Card\n• Net Banking\n• Counter Cash (offline kiosk)\nUPI is recommended for instant confirmation and +50 XP bonus.`
  },
  {
    patterns: ['receipt', 'download', 'pdf', 'certificate'],
    answer: () =>
      `All paid bills generate a **downloadable PDF receipt** with a unique Transaction ID. Go to **Dashboard → Payment History** tab and click the download icon next to any paid bill. Annual lump-sum payers also receive a Reward Certificate.`
  },
  {
    patterns: ['ward', 'rank', 'ranking'],
    answer: (u) =>
      `Your property is in **${u?.ward}**. Ward rankings are updated monthly based on collective compliance rate. Paying on time contributes to your ward's collective score and can earn the ward a **Green Leader** badge + reduced future tax assessments.`
  },
  {
    patterns: ['amnesty', 'waiver', 'waive penalty'],
    answer: () =>
      `The **AI Amnesty Scheme** is active for eligible defaulters. If you have 60+ day overdue dues, you can apply for a **50% penalty interest waiver** if full principal is paid within 7 days. Click 'Activate Amnesty Waiver' in the Pay Tax section or ask for help here.`
  },
  {
    patterns: ['help', 'contact', 'officer', 'support', 'helpline'],
    answer: () =>
      `For live support:\n• **Municipal Helpline**: 1800-XXX-XXXX (toll-free, Mon–Sat 9am–6pm)\n• **WhatsApp**: Send 'HELP' to +91-98XXX-XXXXX\n• **Kiosk Visit**: Check Ward office locations in your area\nYour assigned officer will be notified automatically if dues exceed 30 days.`
  },
];

function getAIResponse(input, user, riskProfile) {
  const lower = input.toLowerCase();
  for (const entry of KB) {
    if (entry.patterns.some(p => lower.includes(p))) {
      return entry.answer(user, riskProfile);
    }
  }
  return `I'm CivTax AI 🤖 and I can help with questions about:\n• Property / Water / Waste tax calculations\n• Payment instalments & AutoPay\n• Penalties, discounts & rebates\n• Your Civic Score & risk profile\n• Rewards, badges & ward ranking\n\nTry asking something like *"What is my risk level?"* or *"How do I pay in instalments?"*`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Render markdown-ish bold + bullet text in JSX
// ─────────────────────────────────────────────────────────────────────────────
function MsgText({ text }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        // bold **text**
        const parts = line.split(/\*\*(.*?)\*\*/g);
        const formatted = parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="text-white font-bold">{part}</strong> : part
        );
        // bullet
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-amber-400 mt-1 flex-shrink-0">•</span>
              <span>{formatted}</span>
            </div>
          );
        }
        return <div key={i}>{formatted}</div>;
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Risk Panel (always visible at top)
// ─────────────────────────────────────────────────────────────────────────────
function RiskPanel({ rp, user }) {
  if (!rp) return null;
  const Icon = rp.icon;

  // Risk dial arc (SVG)
  const pct = rp.score / 100;
  const r = 42, cx = 54, cy = 54;
  const circumf = Math.PI * r; // half-circle
  const dash = pct * circumf;

  return (
    <div className={`rounded-2xl border p-5 ${rp.bgColor} ${rp.borderColor}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

        {/* Half-dial */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <svg width="108" height="64" viewBox="0 0 108 64">
            {/* Track */}
            <path
              d={`M 12,54 A ${r},${r} 0 0,1 96,54`}
              fill="none" stroke="#1f2937" strokeWidth="10" strokeLinecap="round"
            />
            {/* Value */}
            <path
              d={`M 12,54 A ${r},${r} 0 0,1 96,54`}
              fill="none" stroke={rp.color} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${dash} ${circumf}`}
              style={{ transition: 'stroke-dasharray 1.2s ease' }}
            />
            <text x="54" y="52" textAnchor="middle" fill="white" fontSize="18" fontWeight="900">{rp.score}</text>
            <text x="54" y="64" textAnchor="middle" fill="#6b7280" fontSize="9">/100</text>
          </svg>
          <span className="text-[11px] font-black mt-0.5" style={{ color: rp.color }}>{rp.label}</span>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 flex-shrink-0" style={{ color: rp.color }} />
            <span className="text-white font-extrabold text-sm">AI Risk Assessment · {user?.name}</span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">{rp.projection}</p>

          {/* Quick stats row */}
          <div className="flex flex-wrap gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-gray-400">Civic Score:</span>
              <span className="text-white font-bold">{rp.civic}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Zap className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-gray-400">Streak:</span>
              <span className="text-white font-bold">{rp.streak} mo</span>
            </div>
            {rp.overdueTotal > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400 font-bold">₹{rp.overdueTotal.toLocaleString()} overdue</span>
              </div>
            )}
            {rp.overdueTotal === 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400 font-bold">No overdue dues</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick question chips
// ─────────────────────────────────────────────────────────────────────────────
const QUICK_QUESTIONS = [
  'What is my risk level?',
  'How do I pay in instalments?',
  'How does AutoPay work?',
  'What are my pending dues?',
  'How is my Civic Score calculated?',
  "What penalties apply if I'm late?",
  'Any active discounts?',
  'How do I download a receipt?',
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Chat Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AIChatbotPage() {
  const { user, getTaxes } = useAuth();
  const taxes      = getTaxes();
  const riskProfile = computeRiskProfile(user, taxes);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      text: `👋 Hello **${user?.name ?? 'Citizen'}**! I'm **CivTax AI**, your personal municipal tax assistant.\n\nI can answer questions about your taxes, explain penalties and discounts, and give you a **real-time risk prediction** based on your payment profile.\n\nWhat would you like to know today?`,
      ts: new Date(),
    }
  ]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const bottomRef               = useRef(null);
  const inputRef                = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (text) => {
    const q = (text ?? input).trim();
    if (!q) return;

    const userMsg = { id: Date.now(), role: 'user', text: q, ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate AI thinking delay (400–900 ms)
    const delay = 400 + Math.random() * 500;
    setTimeout(() => {
      const answer = getAIResponse(q, user, riskProfile);
      setTyping(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: answer, ts: new Date() }]);
    }, delay);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const formatTime = (d) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-4 animate-fade-in-up">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <BotMessageSquare className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">CivTax AI Assistant</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Ask about your taxes, penalties, discounts — and get a predictive risk assessment
          </p>
        </div>
      </div>

      {/* ── Predictive Risk Panel ─────────────────────────────────────── */}
      <RiskPanel rp={riskProfile} user={user} />

      {/* ── Chat container ────────────────────────────────────────────── */}
      <div className="bg-[#0C0E12] border border-gray-800 rounded-2xl overflow-hidden flex flex-col"
           style={{ height: 'clamp(420px, 55vh, 560px)' }}>

        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-800 bg-[#111318]">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
            <BotMessageSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-white text-sm font-bold">CivTax AI</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-[10px] font-semibold">Online · Municipal Tax Expert</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3 text-amber-400" />
              AI-Powered · DIGIT API
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                msg.role === 'bot'
                  ? 'bg-amber-500/20'
                  : 'bg-blue-500/20'
              }`}>
                {msg.role === 'bot'
                  ? <BotMessageSquare className="w-4 h-4 text-amber-400" />
                  : <User className="w-4 h-4 text-blue-400" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[78%] space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'bot'
                    ? 'bg-[#1A1D25] border border-gray-700 text-gray-300 rounded-tl-sm'
                    : 'bg-amber-500 text-black font-semibold rounded-tr-sm'
                }`}>
                  {msg.role === 'bot'
                    ? <MsgText text={msg.text} />
                    : <span>{msg.text}</span>}
                </div>
                <span className="text-[10px] text-gray-600 px-1">{formatTime(msg.ts)}</span>
              </div>

            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <BotMessageSquare className="w-4 h-4 text-amber-400" />
              </div>
              <div className="bg-[#1A1D25] border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-gray-800 px-4 py-3 bg-[#111318]">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about your taxes, risk, penalties, rewards…"
              disabled={typing}
              className="flex-1 bg-[#1A1D25] border border-gray-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="w-10 h-10 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-700 disabled:text-gray-500 text-black rounded-xl flex items-center justify-center transition-all shadow-lg shadow-amber-500/20 flex-shrink-0"
            >
              {typing ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>

      {/* ── Quick Questions ───────────────────────────────────────────── */}
      <div>
        <p className="text-gray-600 text-[11px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-400" /> Quick Questions
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={typing}
              className="text-xs text-gray-300 bg-[#111318] border border-gray-800 hover:border-amber-500/50 hover:text-amber-400 px-3 py-1.5 rounded-full transition-all disabled:opacity-40"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
