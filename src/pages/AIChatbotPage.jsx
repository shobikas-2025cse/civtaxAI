import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  BotMessageSquare, Send, Sparkles, ShieldAlert, ShieldCheck,
  TrendingUp, AlertTriangle, Clock, Zap, RefreshCw, IndianRupee,
  User, ChevronRight, CircleDot, Loader2, X, BarChart2, Star
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Multilingual Risk Assessment Projections
// ─────────────────────────────────────────────────────────────────────────────
function computeRiskProfile(user, taxes, lang = 'en') {
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

  // Severity thresholds & localized labels
  let level, label, color, bgColor, borderColor, icon;
  if (score < 30) {
    level = 'low';
    label = lang === 'ta' ? 'குறைந்த அபாயம்' : lang === 'hi' ? 'कम जोखिम' : 'Low Risk';
    color = '#22c55e'; bgColor = 'bg-green-500/10'; borderColor = 'border-green-500/30'; icon = ShieldCheck;
  } else if (score < 60) {
    level = 'medium';
    label = lang === 'ta' ? 'மிதமான அபாயம்' : lang === 'hi' ? 'मध्यम जोखिम' : 'Moderate Risk';
    color = '#f59e0b'; bgColor = 'bg-amber-500/10'; borderColor = 'border-amber-500/30'; icon = AlertTriangle;
  } else if (score < 80) {
    level = 'high';
    label = lang === 'ta' ? 'அதிக அபாயம்' : lang === 'hi' ? 'उच्च जोखिम' : 'High Risk';
    color = '#f97316'; bgColor = 'bg-orange-500/10'; borderColor = 'border-orange-500/30'; icon = ShieldAlert;
  } else {
    level = 'critical';
    label = lang === 'ta' ? 'மிக அதிக அபாயம்' : lang === 'hi' ? 'गंभीर जोखिम' : 'Critical Risk';
    color = '#ef4444'; bgColor = 'bg-red-500/10'; borderColor = 'border-red-500/30'; icon = ShieldAlert;
  }

  // Localized Projected Outcome
  let projection;
  if (lang === 'ta') {
    if (level === 'low')      projection = 'வரி செலுத்தும் தொடர்ச்சி நீடித்தால் குடிமைப் புள்ளி +15–25 புள்ளிகள் அதிகரிக்கும்.';
    else if (level === 'medium') projection = 'நிலுவையை இப்போதே செலுத்தவில்லை என்றால் 14 நாட்களில் அபராதக் கட்டணம் விதிக்கப்படும்.';
    else if (level === 'high')   projection = '30 நாட்களுக்குள் சொத்து முடக்க அபாயம் உள்ளது. உடனடியாக நடவடிக்கை எடுக்கப் பரிந்துரைக்கப்படுகிறது.';
    else                         projection = 'சட்ட நடவடிக்கை தொடர வாய்ப்புள்ளது. மன்னிப்புச் சலுகைக் காலம் முடிகிறது.';
  } else if (lang === 'hi') {
    if (level === 'low')      projection = 'भुगतान जारी रहने पर नागरिक स्कोर में +15-25 अंकों की वृद्धि होने की संभावना है।';
    else if (level === 'medium') projection = 'यदि बकाया राशि का भुगतान अभी नहीं किया गया तो 14 दिनों में जुर्माना शुल्क लग सकता है।';
    else if (level === 'high')   projection = '30 दिनों के भीतर संपत्ति ध्वजांकित होने का जोखिम। तुरंत कार्रवाई की सिफारिश की जाती है।';
    else                         projection = 'कानूनी कार्रवाई पाइपलाइन सक्रिय है। एमनेस्टी छूट विंडो बंद हो रही है।';
  } else {
    if (level === 'low')      projection = 'Civic Score likely to rise +15–25 pts if payment streak continues.';
    else if (level === 'medium') projection = 'Penalty surcharge likely in 14 days unless dues cleared now.';
    else if (level === 'high')   projection = 'Property flag risk within 30 days. Immediate action recommended.';
    else                         projection = 'Legal escalation pipeline active. Amnesty waiver window closing.';
  }

  return {
    score, level, label, color, bgColor, borderColor, icon,
    civic, streak, overdueTotal, pendingTotal, overdueTaxes, pendingTaxes, maxOverdueDays,
    projection,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Multilingual Local Knowledge Base per Language
// ─────────────────────────────────────────────────────────────────────────────
const KB_EN = [
  {
    patterns: ['property tax', 'property', 'house tax'],
    answer: (u) => `**Property Tax** is calculated as: Annual Rental Value × applicable zone rate (currently 1.5% for residential). For your property **${u?.propertyId}** in ${u?.ward}, paying before Sep 15 avoids a 1.5%/month penalty surcharge.`
  },
  {
    patterns: ['water tax', 'water'],
    answer: () => `**Water Tax** is charged per unit of annual municipal water consumption. The current rate is 0.8% of assessed value. Your bill is due on Aug 30.`
  },
  {
    patterns: ['waste', 'garbage', 'solid waste'],
    answer: () => `**Solid Waste Tax** is ₹600 per residential unit annually. Overdue waste tax also attracts a ₹50/month late surcharge.`
  },
  {
    patterns: ['penalty', 'fine', 'late fee', 'surcharge'],
    answer: () => `**Penalty Structure:**\n• 30-day overdue → +1.5%/month\n• 60-day overdue → +3.0%/month\n• 90-day overdue → +5.0%/month + account freeze`
  },
  {
    patterns: ['discount', 'rebate', 'incentive', 'early bird'],
    answer: () => `**Active Discounts:**\n• **Early Bird**: 5% off\n• **Senior Citizen Relief**: 10% off\n• **AutoPay Discount**: 2% off per instalment\n• **Annual Lump Sum**: 5% off + reward certificate`
  },
  {
    patterns: ['instalment', 'installment', 'emi', 'split', 'monthly'],
    answer: () => `You can split your annual tax into **12 monthly instalments** (interest-free with AutoPay), **4 quarterly payments**, or **2 biannual payments** via **Pay Tax → Monthly Instalments**.`
  },
  {
    patterns: ['autopay', 'auto pay', 'auto-pay'],
    answer: () => `**AutoPay** links your UPI/bank account for automatic monthly deductions on the 5th. Benefits:\n• Never miss due date\n• 2% discount per instalment\n• +50 XP per deduction`
  },
  {
    patterns: ['civic score', 'credit score', 'cred score', 'score'],
    answer: (u, r) => `Your current **Civic Credit Score is ${r?.civic ?? u?.civicCreditScore ?? '720'}** (out of 900). Paying overdue bills adds **+25 pts** immediately.`
  },
  {
    patterns: ['risk', 'defaulter', 'overdue', 'default'],
    answer: (u, r) => r?.level === 'low'
      ? `✅ Good news! Your risk level is currently **Low (${r.score}/100)**.`
      : `⚠️ Your risk score is **${r?.score}/100 — ${r?.label}**. ${r?.projection} Clear ₹${r?.overdueTotal?.toLocaleString() ?? 0} in overdue dues immediately.`
  },
  {
    patterns: ['receipt', 'download', 'pdf'],
    answer: () => `All paid bills generate a **downloadable PDF receipt** in **Dashboard → Payment History**.`
  }
];

const KB_TA = [
  {
    patterns: ['சொத்து', 'சொத்து வரி', 'property tax', 'property', 'வீட்டு வரி'],
    answer: (u) => `**சொத்து வரி** கணக்கீடு: ஆண்டு வாடகை மதிப்பு × மண்டல விகிதம் (தற்போது குடியிருப்புக்கு 1.5%). **${u?.propertyId}** சொத்துக்கு செப்டம்பர் 15-க்கு முன் செலுத்துவது மாதத்திற்கு 1.5% அபராதத்தைத் தவிர்க்க உதவும்.`
  },
  {
    patterns: ['குடிநீர்', 'நீர்', 'water tax', 'water'],
    answer: () => `**குடிநீர் வரி** ஆண்டு நுகர்வு அடிப்படையில் கணக்கிடப்படுகிறது. கட்டணம் செலுத்தும் கடைசி தேதி ஆகஸ்ட் 30.`
  },
  {
    patterns: ['குப்பை', 'கழிவு', 'waste', 'garbage'],
    answer: () => `**திடக்கழிவு வரி** ஆண்டுக்கு ₹600. தாமதமானால் மாதத்திற்கு ₹50 அபராதம் விதிக்கப்படும்.`
  },
  {
    patterns: ['அபராதம்', 'தாமதம்', 'penalty', 'fine'],
    answer: () => `**அபராத அமைப்பு:**\n• 30 நாட்கள் தாமதம் → +1.5%/மாதம்\n• 60 நாட்கள் தாமதம் → +3.0%/மாதம் கூட்டமைவு\n• 90 நாட்கள் தாமதம் → +5.0%/மாதம் + கணக்கு முடக்கம்`
  },
  {
    patterns: ['தள்ளுபடி', 'சலுகை', 'discount', 'rebate'],
    answer: () => `**செயலில் உள்ள தள்ளுபடிகள்:**\n• **முன்கூட்டியே செலுத்துதல்**: 5% தள்ளுபடி\n• **மூத்த குடிமக்கள் தள்ளுபடி**: 10% தள்ளுபடி\n• **AutoPay தள்ளுபடி**: தவணைக்கு 2% தள்ளுபடி\n• **ஆண்டு முழுத் தொகை**: 5% தள்ளுபடி + வெகுமதி சான்றிதழ்`
  },
  {
    patterns: ['தவணை', 'மாதாந்திர', 'instalment', 'emi'],
    answer: () => `உங்கள் ஆண்டு வரியை **12 மாதாந்திர தவணைகளாக** (AutoPay மூலம் வட்டி இல்லாமல்), **4 காலாண்டு தவணைகளாக**, அல்லது **2 அரையாண்டு தவணைகளாகப்** பிரிக்கலாம். **Pay Tax → Monthly Instalments** பகுதிக்குச் சென்று அமைக்கலாம்.`
  },
  {
    patterns: ['autopay', 'தானியங்கி'],
    answer: () => `**AutoPay** உங்கள் UPI/வங்கி கணக்கை இணைத்து ஒவ்வொரு மாதமும் 5-ஆம் தேதி தானாகப் பணம் கழிக்கும் வசதியாகும். பலன்கள்:\n• செலுத்தும் தேதியைத் தவறவிட மாட்டீர்கள்\n• 2% தள்ளுபடி\n• +50 XP வெகுமதி`
  },
  {
    patterns: ['குடிமை', 'புள்ளி', 'civic score', 'score'],
    answer: (u, r) => `உங்கள் தற்போதைய **குடிமை கடன் புள்ளி ${r?.civic ?? u?.civicCreditScore ?? '720'}** (900-இல்). வரிகளை நேரத்தில் செலுத்துவது **+25 புள்ளிகளை** சேர்க்கும்.`
  },
  {
    patterns: ['அபாயம்', 'நிலுவை', 'risk', 'overdue'],
    answer: (u, r) => r?.level === 'low'
      ? `✅ நற்செய்தி! உங்கள் அபாய நிலை தற்போது **குறைவு (${r.score}/100)**.`
      : `⚠️ உங்கள் அபாயப் புள்ளி **${r?.score}/100 — ${r?.label}**. ${r?.projection} உங்கள் நிலுவைத் தொகையான ₹${r?.overdueTotal?.toLocaleString() ?? 0}-ஐ உடனடியாகச் செலுத்துங்கள்.`
  },
  {
    patterns: ['ரசீது', 'பதிவிறக்கம்', 'receipt', 'pdf'],
    answer: () => `செலுத்தப்பட்ட அனைத்து வரிகளுக்கும் **பதிவிறக்கக்கூடிய PDF ரசீது** உருவாக்கப்படும். **Dashboard → Payment History** பகுதியில் பதிவிறக்கலாம்.`
  }
];

const KB_HI = [
  {
    patterns: ['संपत्ति', 'संपत्ति कर', 'property tax', 'property', 'मकान कर'],
    answer: (u) => `**संपत्ति कर** वार्षिक किराए के मूल्य के आधार पर गिना जाता है। आपके संपत्ति **${u?.propertyId}** के लिए 15 सितंबर से पहले भुगतान करने पर 1.5%/माह जुर्माने से बचा जा सकता है।`
  },
  {
    patterns: ['जल', 'पानी', 'water tax', 'water'],
    answer: () => `**जल कर** वार्षिक खपत के आधार पर लिया जाता है। 30 अगस्त तक भुगतान देय है।`
  },
  {
    patterns: ['कचरा', 'अपशिष्ट', 'waste', 'garbage'],
    answer: () => `**ठोस अपशिष्ट कर** ₹600 वार्षिक है। विलंब होने पर ₹50/माह शुल्क लगता है।`
  },
  {
    patterns: ['जुर्माना', 'दंड', 'penalty', 'fine'],
    answer: () => `**जुर्माना संरचना:**\n• 30 दिन विलंब → +1.5%/माह\n• 60 दिन विलंब → +3.0%/माह\n• 90 दिन विलंब → +5.0%/माह + खाता फ्रीज`
  },
  {
    patterns: ['छूट', 'रिबेट', 'discount', 'rebate'],
    answer: () => `**सक्रिय छूटें:**\n• **अग्रिम भुगतान**: 5% छूट\n• **वरिष्ठ नागरिक छूट**: 10% छूट\n• **AutoPay छूट**: 2% प्रति किस्त\n• **वार्षिक एकमुश्त**: 5% छूट + प्रमाणपत्र`
  },
  {
    patterns: ['किस्त', 'मासिक', 'instalment', 'emi'],
    answer: () => `आप अपने वार्षिक कर को **12 मासिक किस्तों** (AutoPay के साथ ब्याज मुक्त), **4 त्रैमासिक** या **2 अर्ध-वार्षिक** भुगतानों में विभाजित कर सकते हैं। **Pay Tax → Monthly Instalments** पर जाएं।`
  },
  {
    patterns: ['ऑटोपे', 'autopay', 'auto pay'],
    answer: () => `**AutoPay** हर महीने की 5 तारीख को स्वतः कटौती के लिए आपके बैंक खाता/UPI को जोड़ता है। लाभ:\n• समय पर भुगतान\n• 2% छूट प्रति किस्त\n• +50 XP अंक`
  },
  {
    patterns: ['नागरिक', 'स्कोर', 'civic score', 'score'],
    answer: (u, r) => `आपका वर्तमान **नागरिक क्रेडिट स्कोर ${r?.civic ?? u?.civicCreditScore ?? '720'}** (900 में से) है। बिल चुकाने पर तुरंत **+25 अंक** जुड़ते हैं।`
  },
  {
    patterns: ['जोखिम', 'बकाया', 'risk', 'overdue'],
    answer: (u, r) => r?.level === 'low'
      ? `✅ अच्छी खबर! आपका जोखिम स्तर वर्तमान में **कम (${r.score}/100)** है।`
      : `⚠️ आपका जोखिम स्कोर **${r?.score}/100 — ${r?.label}** है। ${r?.projection} अपनी ₹${r?.overdueTotal?.toLocaleString() ?? 0} बकाया राशि को तुरंत चुकाएं।`
  },
  {
    patterns: ['रसीद', 'डाउनलोड', 'receipt', 'pdf'],
    answer: () => `सभी भुगतान किए गए बिलों के लिए **डाउनलोड योग्य पीडीएफ रसीद** बनती है। **Dashboard → Payment History** से डाउनलोड करें।`
  }
];

function getAIResponse(input, user, riskProfile, lang = 'en') {
  const lower = input.toLowerCase();
  const kb = lang === 'ta' ? KB_TA : lang === 'hi' ? KB_HI : KB_EN;

  for (const entry of kb) {
    if (entry.patterns.some(p => lower.includes(p.toLowerCase()))) {
      return entry.answer(user, riskProfile);
    }
  }

  if (lang === 'ta') {
    return `நான் CivTax AI 🤖 உங்கள் நகராட்சி வரி உதவியாளர்.\n• சொத்து / குடிநீர் / கழிவு வரி கணக்கீடு\n• தவணை முறைகள் & AutoPay\n• அபராதங்கள் மற்றும் தள்ளுபடிகள்\n• குடிமைப் புள்ளி & அபாயக் கணிப்பு\n\nஎடுத்துக்காட்டாக *"எனது அபாய நிலை என்ன?"* அல்லது *"தவணைகளில் எவ்வாறு வரி செலுத்துவது?"* என்று கேட்டுப் பாருங்கள்!`;
  } else if (lang === 'hi') {
    return `मैं CivTax AI 🤖 हूँ, आपका नगर पालिका कर सहायक।\n• संपत्ति / जल / अपशिष्ट कर गणना\n• किस्त प्रणाली और AutoPay\n• जुर्माना और छूट\n• नागरिक स्कोर और जोखिम स्तर\n\nउदाहरण के लिए *"मेरा जोखिम स्तर क्या है?"* या *"किस्तों में भुगतान कैसे करूं?"* पूछें!`;
  } else {
    return `I'm CivTax AI 🤖 and I can help with questions about:\n• Property / Water / Waste tax calculations\n• Payment instalments & AutoPay\n• Penalties, discounts & rebates\n• Your Civic Score & risk profile\n\nTry asking something like *"What is my risk level?"* or *"How do I pay in instalments?"*`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Localized Welcome Message
// ─────────────────────────────────────────────────────────────────────────────
function getWelcomeMessage(user, lang = 'en') {
  const name = user?.name ?? (lang === 'ta' ? 'குடிமகனே' : lang === 'hi' ? 'नागरिक' : 'Citizen');
  if (lang === 'ta') {
    return `👋 வணக்கம் **${name}**! நான் **CivTax AI**, உங்கள் தனிப்பட்ட நகராட்சி வரி உதவியாளர்.\n\nஉங்கள் வரிகள் பற்றிய கேள்விகளுக்கு நான் பதிலளிக்க முடியும், அபராதங்கள் மற்றும் தள்ளுபடிகளை விளக்குவேன், மேலும் உங்கள் வரி செலுத்தல் சுயவிவரத்தின் அடிப்படையில் **நிகழ்நேர அபாயக் கணிப்பை** வழங்குவேன்.\n\nஇன்று நீங்கள் என்ன தெரிந்துகொள்ள விரும்புகிறீர்கள்?`;
  } else if (lang === 'hi') {
    return `👋 नमस्ते **${name}**! मैं **CivTax AI** हूँ, आपका व्यक्तिगत नगर पालिका कर सहायक।\n\nमैं आपके करों, जुर्माने, छूट के प्रश्नों का उत्तर दे सकता हूँ और आपको **वास्तविक समय जोखिम पूर्वानुमान** दे सकता हूँ।\n\nआज आप क्या जानना चाहते हैं?`;
  } else {
    return `👋 Hello **${name}**! I'm **CivTax AI**, your personal municipal tax assistant.\n\nI can answer questions about your taxes, explain penalties and discounts, and give you a **real-time risk prediction** based on your payment profile.\n\nWhat would you like to know today?`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Localized Quick Questions
// ─────────────────────────────────────────────────────────────────────────────
const QUICK_QUESTIONS_MAP = {
  en: [
    'What is my risk level?',
    'How do I pay in instalments?',
    'How does AutoPay work?',
    'What are my pending dues?',
    'How is my Civic Score calculated?',
    "What penalties apply if I'm late?",
    'Any active discounts?',
    'How do I download a receipt?',
  ],
  ta: [
    'எனது அபாய நிலை என்ன?',
    'தவணைகளில் எவ்வாறு வரி செலுத்துவது?',
    'AutoPay எவ்வாறு இயங்குகிறது?',
    'எனது நிலுவைத் தொகைகள் எவை?',
    'எனது குடிமைப் புள்ளி எவ்வாறு கணக்கிடப்படுகிறது?',
    'தாமதமானால் என்ன அபராதம் பொருந்தும்?',
    'செயலில் உள்ள தள்ளுபடிகள் ஏதேனும் உள்ளதா?',
    'ரசீதை எவ்வாறு பதிவிறக்குவது?',
  ],
  hi: [
    'मेरा जोखिम स्तर क्या है?',
    'मैं किस्तों में भुगतान कैसे करूं?',
    'ऑटोपे (AutoPay) कैसे काम करता है?',
    'मेरी बकाया राशियां क्या हैं?',
    'मेरा नागरिक स्कोर कैसे गिना जाता है?',
    'देरी होने पर क्या जुर्माना लगेगा?',
    'क्या कोई सक्रिय छूट उपलब्ध है?',
    'रसीद कैसे डाउनलोड करें?',
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// Render markdown-ish bold + bullet text in JSX
// ─────────────────────────────────────────────────────────────────────────────
function MsgText({ text }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        const formatted = parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="text-white font-bold">{part}</strong> : part
        );
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
function RiskPanel({ rp, user, lang = 'en' }) {
  if (!rp) return null;
  const Icon = rp.icon;

  const pct = rp.score / 100;
  const r = 42, cx = 54, cy = 54;
  const circumf = Math.PI * r;
  const dash = pct * circumf;

  return (
    <div className={`rounded-3xl border-2 p-5 sm:p-6 shadow-xl shadow-black/25 ${rp.bgColor} ${rp.borderColor}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

        <div className="flex-shrink-0 flex flex-col items-center">
          <svg width="108" height="64" viewBox="0 0 108 64">
            <path
              d={`M 12,54 A ${r},${r} 0 0,1 96,54`}
              fill="none" stroke="#262B3A" strokeWidth="10" strokeLinecap="round"
            />
            <path
              d={`M 12,54 A ${r},${r} 0 0,1 96,54`}
              fill="none" stroke={rp.color} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${dash} ${circumf}`}
              style={{ transition: 'stroke-dasharray 1.2s ease' }}
            />
            <text x="54" y="52" textAnchor="middle" fill="#000000" fontSize="18" fontWeight="900">{rp.score}</text>
            <text x="54" y="64" textAnchor="middle" fill="#000000" fontSize="9" fontWeight="700">/100</text>
          </svg>
          <span className="text-[11px] font-black mt-0.5 text-black">{rp.label}</span>
        </div>

        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 flex-shrink-0" style={{ color: rp.color }} />
            <span className="text-black font-extrabold text-sm sm:text-base">
              {lang === 'ta' ? 'AI அபாய மதிப்பீடு' : lang === 'hi' ? 'एआई जोखिम मूल्यांकन' : 'AI Risk Assessment'} · {user?.name}
            </span>
          </div>
          <p className="text-black text-xs sm:text-sm leading-relaxed font-semibold">{rp.projection}</p>

          <div className="flex flex-wrap gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-black">
              <Star className="w-3.5 h-3.5 text-[#B8860B]" />
              <span className="text-black font-medium">{lang === 'ta' ? 'குடிமைப் புள்ளி:' : lang === 'hi' ? 'नागरिक स्कोर:' : 'Civic Score:'}</span>
              <span className="text-black font-black">{rp.civic}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-black">
              <Zap className="w-3.5 h-3.5 text-[#B8860B]" />
              <span className="text-black font-medium">{lang === 'ta' ? 'தொடர்ச்சி:' : lang === 'hi' ? 'निरंतरता:' : 'Streak:'}</span>
              <span className="text-black font-black">{rp.streak} {lang === 'ta' ? 'மாதம்' : lang === 'hi' ? 'माह' : 'mo'}</span>
            </div>
            {rp.overdueTotal > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-black">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span className="text-black font-black">₹{rp.overdueTotal.toLocaleString()} {lang === 'ta' ? 'நிலுவை' : lang === 'hi' ? 'बकाया' : 'overdue'}</span>
              </div>
            )}
            {rp.overdueTotal === 0 && (
              <div className="flex items-center gap-1.5 text-xs text-black">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-black font-black">{lang === 'ta' ? 'நிலுவை வரிகள் எதுவுமில்லை' : lang === 'hi' ? 'कोई अतिदेय बकाया नहीं' : 'No overdue dues'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Chat Page Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AIChatbotPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const { user, getTaxes } = useAuth();
  const taxes      = getTaxes();
  const riskProfile = computeRiskProfile(user, taxes, currentLang);

  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const bottomRef               = useRef(null);
  const inputRef                = useRef(null);

  // Update welcome message when language changes or initial mount
  useEffect(() => {
    setMessages([
      {
        id: 'welcome-' + currentLang,
        role: 'bot',
        text: getWelcomeMessage(user, currentLang),
        ts: new Date(),
      }
    ]);
  }, [currentLang, user]);

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

    const delay = 400 + Math.random() * 500;
    setTimeout(() => {
      const answer = getAIResponse(q, user, riskProfile, currentLang);
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

  const quickQuestions = QUICK_QUESTIONS_MAP[currentLang] || QUICK_QUESTIONS_MAP.en;

  return (
    <div className="space-y-5 animate-fade-in-up font-sans text-white">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-[#E5B80B]/20 border border-[#E5B80B]/40 flex items-center justify-center flex-shrink-0 shadow-md shadow-[#E5B80B]/15">
          <BotMessageSquare className="w-6 h-6 text-[#B8860B]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D27] tracking-tight">{t('aichat.title')}</h1>
          <p className="text-[#555C6E] text-xs sm:text-sm mt-0.5 font-medium">
            {t('aichat.subtitle')}
          </p>
        </div>
      </div>

      {/* ── Predictive Risk Panel ─────────────────────────────────────── */}
      <RiskPanel rp={riskProfile} user={user} lang={currentLang} />

      {/* ── Chat container ────────────────────────────────────────────── */}
      <div className="bg-[#151822] border-2 border-[#262B3A] rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-black/40"
           style={{ height: 'clamp(440px, 58vh, 600px)' }}>

        {/* Chat header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#262B3A] bg-[#11131B]">
          <div className="w-9 h-9 rounded-xl bg-[#E5B80B]/20 border border-[#E5B80B]/40 flex items-center justify-center">
            <BotMessageSquare className="w-4 h-4 text-[#E5B80B]" />
          </div>
          <div>
            <p className="text-white text-sm font-black">{t('aichat.title')}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[10px] font-bold">{t('aichat.onlineStatus')}</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-300 bg-[#181B26] border border-[#292E3E] px-3 py-1 rounded-full font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#E5B80B]" />
              AI-Powered · DIGIT API
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 scrollbar-thin">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                msg.role === 'bot'
                  ? 'bg-[#E5B80B]/20 text-[#E5B80B] border border-[#E5B80B]/30'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}>
                {msg.role === 'bot'
                  ? <BotMessageSquare className="w-4 h-4 text-[#E5B80B]" />
                  : <User className="w-4 h-4 text-cyan-400" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[78%] space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-md ${
                  msg.role === 'bot'
                    ? 'bg-[#181B26] border border-[#2A3042] text-gray-100 rounded-tl-sm'
                    : 'bg-[#E5B80B] text-black font-bold rounded-tr-sm shadow-md shadow-[#E5B80B]/20'
                }`}>
                  {msg.role === 'bot'
                    ? <MsgText text={msg.text} />
                    : <span>{msg.text}</span>}
                </div>
                <span className="text-[10px] text-gray-400 px-1">{formatTime(msg.ts)}</span>
              </div>

            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-[#E5B80B]/20 border border-[#E5B80B]/30 flex items-center justify-center flex-shrink-0">
                <BotMessageSquare className="w-4 h-4 text-[#E5B80B]" />
              </div>
              <div className="bg-[#181B26] border border-[#2A3042] rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#E5B80B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#E5B80B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#E5B80B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-[#262B3A] px-5 py-3.5 bg-[#11131B]">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t('aichat.placeholder')}
              disabled={typing}
              className="flex-1 bg-[#181B26] border border-[#2D3346] focus:border-[#E5B80B] rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-400 outline-none transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="w-11 h-11 bg-[#E5B80B] hover:bg-[#D1A000] disabled:bg-gray-800 disabled:text-gray-600 text-black font-bold rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-[#E5B80B]/25 flex-shrink-0 cursor-pointer"
            >
              {typing ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>

      {/* ── Quick Questions ───────────────────────────────────────────── */}
      <div>
        <p className="text-[#1A1D27] text-[11px] font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-bold">
          <Zap className="w-3.5 h-3.5 text-[#B8860B]" /> {t('aichat.suggestedPrompts')}
        </p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={typing}
              className="text-xs font-bold text-gray-200 bg-[#151822] border border-[#262B3A] hover:border-[#E5B80B] hover:text-[#E5B80B] px-3.5 py-2 rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
