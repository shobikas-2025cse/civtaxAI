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
          <Sparkles className="w-5 h-5 text-mustard" />
          <span className="text-mustard text-xs font-extrabold uppercase tracking-wider">Behavioral Incentive Engine</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white">Gamification & Nudge Hub</h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">
          Earn XP, boost your CRED-style civic score, unlock perks, and participate in community pledges.
        </p>
      </div>

      {/* CRED-STYLE CIVIC CREDIT SCORE PROGRESS BAR */}
      <div className="bg-gradient-to-r from-[#1E1E1E] via-[#252525] to-[#1E1E1E] border border-mustard/40 rounded-3xl p-6 lg:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-mustard/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-mustard" />
              <span className="text-mustard text-xs font-extrabold uppercase tracking-wider">CRED-Style Civic Score Gauge</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
              {creditScore} <span className="text-mustard text-xl font-extrabold">/ 900</span>
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm font-semibold">
              Status: <span className="text-mustard font-bold">{user?.civicCreditTier}</span>
            </p>
          </div>

          <div className="flex-1 max-w-md space-y-2">
            <div className="flex justify-between text-[11px] sm:text-xs text-gray-400 font-bold">
              <span>300 (Poor)</span>
              <span>600 (Fair)</span>
              <span>750 (Good)</span>
              <span className="text-mustard">900 (Excellent)</span>
            </div>

            {/* CRED Style Meter Bar */}
            <div className="w-full bg-[#121212] border border-[#333333] rounded-full h-4 p-0.5 relative">
              <div
                className="bg-gradient-to-r from-mustard-600 via-mustard to-mustard-300 rounded-full h-3 transition-all duration-1000 shadow-md shadow-mustard/20"
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <p className="text-gray-400 text-xs text-right">
              On-time payments increase score by <span className="text-green-400 font-bold">+25 pts</span>
            </p>
          </div>
        </div>
      </div>

      {/* THREE FEATURE CARDS */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Core Gamification Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          
          {/* Feature Card 1: Dynamic Incentive Engine */}
          <div className="civic-card civic-card-hover p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 bg-mustard/20 border border-mustard/40 rounded-2xl flex items-center justify-center text-mustard mb-4 flex-shrink-0">
                <Percent className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg">Dynamic Incentive Engine</h3>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                Tax rebates shrink automatically as the payment deadline nears. Pay early to lock in up to 15% discount savings!
              </p>
            </div>

            <div className="pt-4 border-t border-[#333333] flex items-center justify-between gap-2">
              <span className="text-mustard text-xs font-bold bg-mustard/15 px-2.5 py-1 rounded-full flex-shrink-0">Up to 15% Rebate</span>
              <button
                onClick={() => setActiveModal('incentive')}
                className="text-xs font-extrabold text-white hover:text-mustard transition-colors flex items-center gap-1 flex-shrink-0"
              >
                View Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Feature Card 2: Ward Leaderboard */}
          <div className="civic-card civic-card-hover p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/40 rounded-2xl flex items-center justify-center text-blue-400 mb-4 flex-shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg">Ward Leaderboard</h3>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                Inter-ward competition ranks municipal zones by tax collection efficiency. Top wards earn municipal green grants!
              </p>
            </div>

            <div className="pt-4 border-t border-[#333333] flex items-center justify-between gap-2">
              <span className="text-blue-400 text-xs font-bold bg-blue-500/15 px-2.5 py-1 rounded-full flex-shrink-0">5 Wards Ranked</span>
              <button
                onClick={() => setActiveModal('leaderboard')}
                className="text-xs font-extrabold text-white hover:text-mustard transition-colors flex items-center gap-1 flex-shrink-0"
              >
                View Ranks <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Feature Card 3: Payment Streaks */}
          <div className="civic-card civic-card-hover p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 bg-orange-500/20 border border-orange-500/40 rounded-2xl flex items-center justify-center text-orange-400 mb-4 flex-shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg">Payment Streaks</h3>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                Maintain consecutive on-time clearance to earn badges & XP multipliers. Behavioral loss aversion prevents streak drops!
              </p>
            </div>

            <div className="pt-4 border-t border-[#333333] flex items-center justify-between gap-2">
              <span className="text-orange-400 text-xs font-bold bg-orange-500/15 px-2.5 py-1 rounded-full flex-shrink-0">{user?.streak || 1} Month Active</span>
              <button
                onClick={() => setActiveModal('streaks')}
                className="text-xs font-extrabold text-white hover:text-mustard transition-colors flex items-center gap-1 flex-shrink-0"
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
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-mustard" />
            Personalised AI Nudge Stream
          </h2>
          <span className="text-xs text-gray-400">Targeted Multi-Channel Outreach</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user?.nudges?.map((nudge) => (
            <div key={nudge.id} className="civic-card p-5 space-y-3 border-l-4 border-l-mustard">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                  nudge.channel === 'WhatsApp' ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                  nudge.channel === 'SMS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
                  'bg-mustard/20 text-mustard border border-mustard/40'
                }`}>
                  {nudge.channel} • {nudge.type}
                </span>
                <span className="text-[11px] text-gray-500 flex-shrink-0">{nudge.timestamp}</span>
              </div>
              <p className="text-gray-200 text-xs leading-relaxed">{nudge.message}</p>
              <div className="pt-2 border-t border-[#333333] flex justify-end">
                <span className="text-xs font-extrabold text-mustard cursor-pointer hover:underline flex items-center gap-1">
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
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HandHeart className="w-5 h-5 text-mustard" />
            Citizen Community Pledges
          </h2>
          <span className="text-xs text-gray-400">Ward Participatory Governance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {user?.communityPledges?.map((pledge) => (
            <div key={pledge.id} className="civic-card p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-mustard font-bold uppercase">Community Action</span>
                  <span className="text-xs text-gray-400">{pledge.count} Pledged</span>
                </div>
                <h3 className="font-bold text-white text-sm">{pledge.title}</h3>
              </div>

              <button
                onClick={() => togglePledge(pledge.id)}
                className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                  pledge.pledged
                    ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                    : 'bg-mustard text-civic-black hover:bg-mustard-dark'
                }`}
              >
                {pledge.pledged ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" /> Pledged ✓
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
