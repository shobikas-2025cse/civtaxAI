import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Percent, Trophy, Flame, X, Clock, AlertTriangle, CheckCircle, ShieldCheck, ArrowRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function GamificationDetailModals({ activeModal, onClose }) {
  const { t } = useTranslation();
  const { wardRankings, user } = useAuth();
  const [simulatedDays, setSimulatedDays] = useState(35);

  if (!activeModal) return null;

  const getDynamicDiscount = (days) => {
    if (days > 30) return { discount: 15, label: 'Early Bird Max Rebate', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (days > 14) return { discount: 10, label: 'Mid-Cycle Discount', color: 'text-[#E5B80B]', bg: 'bg-[#E5B80B]/20' };
    if (days > 0) return { discount: 5, label: 'Last Minute Rebate', color: 'text-[#FFDC69]', bg: 'bg-[#E5B80B]/10' };
    return { discount: 0, label: '0% Discount (Surcharge Penalty Applies)', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const currentInc = getDynamicDiscount(simulatedDays);
  const sampleTax = 10000;
  const savings = (sampleTax * currentInc.discount) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up font-sans text-white">
      <div className="bg-[#12141C] border-2 border-[#2A3042] rounded-3xl p-6 lg:p-8 max-w-2xl w-full relative shadow-2xl shadow-black/80 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#181B26] border border-[#2D3346] flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* MODAL 1: Dynamic Incentive Engine */}
        {activeModal === 'incentive' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-[#E5B80B]/20 border border-[#E5B80B]/40 rounded-2xl flex items-center justify-center text-[#E5B80B]">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[#E5B80B] text-xs font-extrabold uppercase tracking-wider">{t('rewards.title')}</span>
                <h2 className="text-2xl font-black text-white tracking-tight">{t('rewards.earlyBird')}</h2>
              </div>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed">
              Municipal tax discounts shrinking as the due date approaches encourage early settlement. Pay early to lock in maximum savings!
            </p>

            {/* Interactive Deadline Simulator */}
            <div className="bg-[#181B26] border border-[#2A3042] rounded-2xl p-5 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('dashboard.dueDate')}</span>
                <span className="text-sm font-extrabold text-[#E5B80B]">{simulatedDays} {t('dashboard.daysLeft')}</span>
              </div>
              
              <input
                type="range"
                min="0"
                max="45"
                value={simulatedDays}
                onChange={(e) => setSimulatedDays(Number(e.target.value))}
                className="w-full accent-[#E5B80B] bg-[#0E1017] h-2 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#12141F] border border-[#2A3042]">
                <div>
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full uppercase ${currentInc.bg} ${currentInc.color}`}>
                    {currentInc.label}
                  </span>
                  <p className="text-gray-400 text-xs mt-2">
                    {t('dashboard.saveAmount')} <strong className="text-white">₹{savings.toLocaleString()}</strong> on a ₹10,000 tax bill
                  </p>
                </div>
                <span className={`text-2xl font-black ${currentInc.color}`}>{currentInc.discount}%</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-[#E5B80B] hover:bg-[#D1A000] text-black font-extrabold py-3.5 rounded-2xl text-base transition-all cursor-pointer"
            >
              {t('common.close')}
            </button>
          </div>
        )}

        {/* MODAL 2: Ward Compliance Leaderboard */}
        {activeModal === 'leaderboard' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-cyan-500/20 border border-cyan-500/40 rounded-2xl flex items-center justify-center text-cyan-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-cyan-400 text-xs font-extrabold uppercase tracking-wider">{t('rewards.leaderboard')}</span>
                <h2 className="text-2xl font-black text-white tracking-tight">{t('rewards.leaderboard')}</h2>
              </div>
            </div>

            <div className="space-y-3">
              {(wardRankings || []).map((w, index) => (
                <div 
                  key={w.id || index}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    w.wardName?.includes('Jubilee') ? 'bg-[#E5B80B]/10 border-[#E5B80B]' : 'bg-[#181B26] border-[#2A3042]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-8 h-8 rounded-xl font-black flex items-center justify-center text-sm ${
                      index === 0 ? 'bg-[#E5B80B] text-black' : 'bg-[#262B3D] text-gray-300'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{w.wardName || `Ward ${index + 1}`}</p>
                      <p className="text-gray-400 text-xs">{w.totalCitizens || 300} {t('rewards.citizenName')}s</p>
                    </div>
                  </div>
                  <span className="font-black text-sm text-[#E5B80B]">{w.collectionEfficiency || 85}%</span>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full bg-[#E5B80B] hover:bg-[#D1A000] text-black font-extrabold py-3.5 rounded-2xl text-base transition-all cursor-pointer"
            >
              {t('common.close')}
            </button>
          </div>
        )}

        {/* MODAL 3: Payment Streaks */}
        {activeModal === 'streaks' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-orange-500/20 border border-orange-500/40 rounded-2xl flex items-center justify-center text-orange-400">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-orange-400 text-xs font-extrabold uppercase tracking-wider">{t('rewards.streak')}</span>
                <h2 className="text-2xl font-black text-white tracking-tight">{user?.streak || 6} {t('dashboard.unbrokenStreak')}</h2>
              </div>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed">
              Paying tax on time consecutively builds up your payment streak and unlocks VIP municipal permits.
            </p>

            <button
              onClick={onClose}
              className="w-full bg-[#E5B80B] hover:bg-[#D1A000] text-black font-extrabold py-3.5 rounded-2xl text-base transition-all cursor-pointer"
            >
              {t('common.close')}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
