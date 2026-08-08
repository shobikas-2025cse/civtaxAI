import { useState } from 'react';
import { Percent, Trophy, Flame, X, Clock, AlertTriangle, CheckCircle, ShieldCheck, ArrowRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function GamificationDetailModals({ activeModal, onClose }) {
  const { wardRankings, user } = useAuth();
  const [simulatedDays, setSimulatedDays] = useState(35);

  if (!activeModal) return null;

  // Dynamic incentive calculation
  const getDynamicDiscount = (days) => {
    if (days > 30) return { discount: 15, label: 'Early Bird Max Rebate', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (days > 14) return { discount: 10, label: 'Mid-Cycle Discount', color: 'text-mustard', bg: 'bg-mustard/20' };
    if (days > 0) return { discount: 5, label: 'Last Minute Rebate', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    return { discount: 0, label: '0% Discount (Surcharge Penalty Applies)', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const currentInc = getDynamicDiscount(simulatedDays);
  const sampleTax = 10000;
  const savings = (sampleTax * currentInc.discount) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
      <div className="bg-[#1E1E1E] border border-mustard/40 rounded-3xl p-6 lg:p-8 max-w-2xl w-full relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#252525] border border-[#333333] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* MODAL 1: Dynamic Incentive Engine */}
        {activeModal === 'incentive' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-mustard/20 border border-mustard/40 rounded-2xl flex items-center justify-center text-mustard">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <span className="text-mustard text-xs font-extrabold uppercase tracking-wider">AI Gamification Engine</span>
                <h2 className="text-2xl font-extrabold text-white">Dynamic Incentive Engine</h2>
              </div>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed">
              Municipal tax discounts shrinking as the due date approaches encourage early settlement. Pay early to lock in maximum savings!
            </p>

            {/* Interactive Deadline Simulator */}
            <div className="bg-[#121212] border border-[#333333] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase">Simulate Days Remaining</span>
                <span className="text-sm font-extrabold text-mustard">{simulatedDays} Days Left</span>
              </div>
              
              <input
                type="range"
                min="0"
                max="45"
                value={simulatedDays}
                onChange={(e) => setSimulatedDays(parseInt(e.target.value))}
                className="w-full accent-mustard h-2 bg-[#252525] rounded-lg cursor-pointer"
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
                <div className={`p-2 rounded-xl border ${simulatedDays > 30 ? 'border-green-500 bg-green-500/10 text-white font-bold' : 'border-[#333333] text-gray-500'}`}>
                  &gt;30 Days (15% Off)
                </div>
                <div className={`p-2 rounded-xl border ${simulatedDays > 14 && simulatedDays <= 30 ? 'border-mustard bg-mustard/10 text-white font-bold' : 'border-[#333333] text-gray-500'}`}>
                  15-30 Days (10% Off)
                </div>
                <div className={`p-2 rounded-xl border ${simulatedDays > 0 && simulatedDays <= 14 ? 'border-amber-500 bg-amber-500/10 text-white font-bold' : 'border-[#333333] text-gray-500'}`}>
                  1-14 Days (5% Off)
                </div>
                <div className={`p-2 rounded-xl border ${simulatedDays === 0 ? 'border-red-500 bg-red-500/10 text-white font-bold' : 'border-[#333333] text-gray-500'}`}>
                  0 Days (0% Off)
                </div>
              </div>
            </div>

            {/* Calculated Savings Box */}
            <div className="bg-[#121212] border border-mustard/30 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Estimated Rebate on ₹10,000 Tax Bill</p>
                <p className={`text-2xl font-extrabold mt-0.5 ${currentInc.color}`}>{currentInc.label}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Instant Savings</p>
                <p className="text-3xl font-extrabold text-mustard">₹{savings.toLocaleString()}</p>
              </div>
            </div>

            <button onClick={onClose} className="w-full bg-mustard hover:bg-mustard-dark text-civic-black font-extrabold py-3 rounded-xl transition-colors">
              Close View
            </button>
          </div>
        )}

        {/* MODAL 2: Ward Leaderboard Detail */}
        {activeModal === 'leaderboard' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-mustard/20 border border-mustard/40 rounded-2xl flex items-center justify-center text-mustard">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-mustard text-xs font-extrabold uppercase tracking-wider">Civic Competition</span>
                <h2 className="text-2xl font-extrabold text-white">Ward Tax Efficiency Rankings</h2>
              </div>
            </div>

            <p className="text-gray-300 text-sm">
              Wards compete for municipal development grants! Paying your taxes on time boosts your ward's overall ranking.
            </p>

            <div className="space-y-3">
              {wardRankings.map((ward) => (
                <div
                  key={ward.rank}
                  className={`bg-[#121212] border rounded-2xl p-4 flex items-center gap-4 ${
                    ward.name.includes(user?.ward?.split(' - ')[0] || 'Ward 12')
                      ? 'border-mustard bg-mustard/10 shadow-md'
                      : 'border-[#333333]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs ${
                    ward.rank === 1 ? 'bg-mustard text-civic-black' :
                    ward.rank === 2 ? 'bg-gray-300 text-black' :
                    ward.rank === 3 ? 'bg-amber-700 text-white' : 'bg-[#252525] text-gray-400'
                  }`}>
                    #{ward.rank}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{ward.name}</p>
                    <p className="text-gray-400 text-xs">Total Collection: <span className="text-gray-200">{ward.totalCollected}</span> • {ward.streakMonths}m Streak</p>
                  </div>

                  <div className="text-right">
                    <p className="font-extrabold text-mustard text-base">{ward.collectionEfficiency}%</p>
                    <span className="text-[10px] text-gray-400 bg-[#252525] px-2 py-0.5 rounded-full">{ward.badge}</span>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={onClose} className="w-full bg-mustard hover:bg-mustard-dark text-civic-black font-extrabold py-3 rounded-xl transition-colors">
              Back to Gamification
            </button>
          </div>
        )}

        {/* MODAL 3: Payment Streaks & Loss Aversion Detail */}
        {activeModal === 'streaks' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-mustard/20 border border-mustard/40 rounded-2xl flex items-center justify-center text-mustard">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-mustard text-xs font-extrabold uppercase tracking-wider">Behavioral Economics</span>
                <h2 className="text-2xl font-extrabold text-white">Payment Streaks & Loss Aversion</h2>
              </div>
            </div>

            {/* Loss Aversion Warning Banner */}
            <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-300 text-sm">Loss Aversion Warning ⚠️</p>
                <p className="text-xs text-gray-300">If you miss your upcoming cycle deadline, your <span className="text-mustard font-bold">{user?.streak || 1}-Month Streak</span> will reset to 0 and your 1.5x XP multiplier will be forfeited!</p>
              </div>
            </div>

            <div className="bg-[#121212] border border-[#333333] rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-white text-sm">Streak Milestone Rewards</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-[#1E1E1E] p-3 rounded-xl border border-[#2D2D2D]">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <p className="font-bold text-white text-xs">1-Month Streak</p>
                      <p className="text-gray-400 text-[11px]">+50 Bonus XP Credited</p>
                    </div>
                  </div>
                  <span className="text-green-400 text-xs font-bold bg-green-500/20 px-2.5 py-0.5 rounded-full">Unlocked</span>
                </div>

                <div className="flex items-center justify-between bg-[#1E1E1E] p-3 rounded-xl border border-[#2D2D2D]">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <p className="font-bold text-white text-xs">3-Month Streak</p>
                      <p className="text-gray-400 text-[11px]">1.25x XP Multiplier + Streak Badge</p>
                    </div>
                  </div>
                  <span className="text-mustard text-xs font-bold bg-mustard/20 px-2.5 py-0.5 rounded-full">In Progress</span>
                </div>

                <div className="flex items-center justify-between bg-[#1E1E1E] p-3 rounded-xl border border-[#2D2D2D] opacity-60">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <p className="font-bold text-white text-xs">6-Month Streak</p>
                      <p className="text-gray-400 text-[11px]">1.5x XP Multiplier + Priority Municipal Permit Pass</p>
                    </div>
                  </div>
                  <span className="text-gray-500 text-xs font-bold">Locked</span>
                </div>
              </div>
            </div>

            <button onClick={onClose} className="w-full bg-mustard hover:bg-mustard-dark text-civic-black font-extrabold py-3 rounded-xl transition-colors">
              Close Streak View
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
