import { useState } from 'react';
import { Trophy, Flame, Percent, Sparkles, MessageSquare, HandHeart, ShieldCheck, ArrowRight, Zap, Award, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GamificationDetailModals from '../components/GamificationDetailModals';

export default function RewardsPage() {
  const { user, togglePledge } = useAuth();
  const [activeModal, setActiveModal] = useState(null); // 'incentive' | 'leaderboard' | 'streaks'

  const creditScore = user?.civicCreditScore || 720;
  const scorePercent = Math.min(100, Math.max(0, ((creditScore - 300) / 600) * 100));

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      
      {/* Page Title & Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-[#B8860B]" />
          <span className="text-[#B8860B] text-xs font-extrabold uppercase tracking-wider">Behavioral Incentive Engine</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-[#1A1D27] tracking-tight">Gamification & Nudge Hub</h1>
        <p className="text-[#555C6E] text-xs sm:text-sm mt-1 font-medium">
          Earn XP, boost your CRED-style civic score, unlock perks, and participate in community pledges.
        </p>
      </div>

      {/* CRED-STYLE CIVIC CREDIT SCORE PROGRESS BAR */}
      <div className="bg-gradient-to-r from-[#11131B] via-[#161924] to-[#11131B] border-2 border-[#262B3A] rounded-3xl p-6 lg:p-8 shadow-2xl shadow-black/35 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E5B80B]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#E5B80B]" />
              <span className="text-[#E5B80B] text-xs font-extrabold uppercase tracking-wider">CRED-Style Civic Score Gauge</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
              {creditScore} <span className="text-[#E5B80B] text-xl font-extrabold">/ 900</span>
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm font-semibold">
              Status: <span className="text-[#FFDC69] font-bold">{user?.civicCreditTier || 'Gold Tier'}</span>
            </p>
          </div>

          <div className="flex-1 max-w-md space-y-2">
            <div className="flex justify-between text-[11px] sm:text-xs text-gray-400 font-bold">
              <span>300 (Poor)</span>
              <span>600 (Fair)</span>
              <span>750 (Good)</span>
              <span className="text-[#E5B80B]">900 (Excellent)</span>
            </div>

            {/* CRED Style Meter Bar */}
            <div className="w-full bg-[#0E1017] border border-[#262B3A] rounded-full h-4 p-0.5 relative">
              <div
                className="bg-gradient-to-r from-[#D1A000] via-[#E5B80B] to-[#FFDC69] rounded-full h-3 transition-all duration-1000 shadow-md shadow-[#E5B80B]/30"
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <p className="text-gray-400 text-xs text-right">
              On-time payments increase score by <span className="text-emerald-400 font-bold">+25 pts</span>
            </p>
          </div>
        </div>
      </div>

      {/* THREE FEATURE CARDS */}
      <div>
        <h2 className="text-lg font-black text-[#1A1D27] mb-4">Core Gamification Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          
          {/* Feature Card 1: Dynamic Incentive Engine */}
          <div className="bg-[#151822] border border-[#262B3A] rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl shadow-black/20 hover:border-[#E5B80B]/50 transition-all">
            <div>
              <div className="w-12 h-12 bg-[#E5B80B]/20 border border-[#E5B80B]/40 rounded-2xl flex items-center justify-center text-[#E5B80B] mb-4 flex-shrink-0">
                <Percent className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg">Dynamic Incentive Engine</h3>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                Tax rebates shrink automatically as the payment deadline nears. Pay early to lock in up to 15% discount savings!
              </p>
            </div>

            <div className="pt-4 border-t border-[#262B3A] flex items-center justify-between gap-2">
              <span className="text-[#E5B80B] text-xs font-bold bg-[#E5B80B]/15 border border-[#E5B80B]/30 px-2.5 py-1 rounded-full flex-shrink-0">Up to 15% Rebate</span>
              <button
                onClick={() => setActiveModal('incentive')}
                className="text-xs font-extrabold text-white hover:text-[#E5B80B] transition-colors flex items-center gap-1 flex-shrink-0 cursor-pointer"
              >
                View Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Feature Card 2: Ward Leaderboard */}
          <div className="bg-[#151822] border border-[#262B3A] rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl shadow-black/20 hover:border-[#E5B80B]/50 transition-all">
            <div>
              <div className="w-12 h-12 bg-cyan-500/20 border border-cyan-500/40 rounded-2xl flex items-center justify-center text-cyan-400 mb-4 flex-shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg">Ward Leaderboard</h3>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                Inter-ward competition ranks municipal zones by tax collection efficiency. Top wards earn municipal green grants!
              </p>
            </div>

            <div className="pt-4 border-t border-[#262B3A] flex items-center justify-between gap-2">
              <span className="text-cyan-400 text-xs font-bold bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 rounded-full flex-shrink-0">5 Wards Ranked</span>
              <button
                onClick={() => setActiveModal('leaderboard')}
                className="text-xs font-extrabold text-white hover:text-[#E5B80B] transition-colors flex items-center gap-1 flex-shrink-0 cursor-pointer"
              >
                View Ranks <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Feature Card 3: Payment Streaks */}
          <div className="bg-[#151822] border border-[#262B3A] rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl shadow-black/20 hover:border-[#E5B80B]/50 transition-all">
            <div>
              <div className="w-12 h-12 bg-orange-500/20 border border-orange-500/40 rounded-2xl flex items-center justify-center text-orange-400 mb-4 flex-shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg">Payment Streaks</h3>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                Maintain consecutive on-time clearance to earn badges & XP multipliers. Behavioral loss aversion prevents streak drops!
              </p>
            </div>

            <div className="pt-4 border-t border-[#262B3A] flex items-center justify-between gap-2">
              <span className="text-orange-400 text-xs font-bold bg-orange-500/15 border border-orange-500/30 px-2.5 py-1 rounded-full flex-shrink-0">{user?.streak || 1} Month Active</span>
              <button
                onClick={() => setActiveModal('streaks')}
                className="text-xs font-extrabold text-white hover:text-[#E5B80B] transition-colors flex items-center gap-1 flex-shrink-0 cursor-pointer"
              >
                Streak Badges <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* PERSONALISED AI NUDGE SYSTEM */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-[#1A1D27] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#B8860B]" />
            Personalised AI Nudge Stream
          </h2>
          <span className="text-xs text-[#555C6E] font-medium">Targeted Multi-Channel Outreach</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user?.nudges?.map((nudge) => (
            <div key={nudge.id} className="bg-[#151822] border border-[#262B3A] rounded-3xl p-5 space-y-3 border-l-4 border-l-[#E5B80B] shadow-xl shadow-black/20">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                  nudge.channel === 'WhatsApp' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                  nudge.channel === 'SMS' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                  'bg-[#E5B80B]/20 text-[#E5B80B] border border-[#E5B80B]/40'
                }`}>
                  {nudge.channel} • {nudge.type}
                </span>
                <span className="text-[11px] text-gray-400 flex-shrink-0">{nudge.timestamp}</span>
              </div>
              <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">{nudge.message}</p>
              <div className="pt-2 border-t border-[#262B3A] flex justify-end">
                <span className="text-xs font-extrabold text-[#E5B80B] cursor-pointer hover:underline flex items-center gap-1">
                  {nudge.actionLabel} →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COMMUNITY PLEDGE PANEL */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-[#1A1D27] flex items-center gap-2">
            <HandHeart className="w-5 h-5 text-[#B8860B]" />
            Citizen Community Pledges
          </h2>
          <span className="text-xs text-[#555C6E] font-medium">Ward Participatory Governance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {user?.communityPledges?.map((pledge) => (
            <div key={pledge.id} className="bg-[#151822] border border-[#262B3A] rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xl shadow-black/20">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-[#E5B80B] font-bold uppercase tracking-wider">Community Action</span>
                  <span className="text-xs text-gray-400">{pledge.count} Pledged</span>
                </div>
                <h3 className="font-extrabold text-white text-sm">{pledge.title}</h3>
              </div>

              <button
                onClick={() => togglePledge(pledge.id)}
                className={`w-full py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  pledge.pledged
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-[#E5B80B] text-black hover:bg-[#D1A000] shadow-[#E5B80B]/20'
                }`}
              >
                {pledge.pledged ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Pledged ✓
                  </>
                ) : (
                  <>Take Civic Pledge</>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modals Component */}
      <GamificationDetailModals activeModal={activeModal} onClose={() => setActiveModal(null)} />

    </div>
  );
}
