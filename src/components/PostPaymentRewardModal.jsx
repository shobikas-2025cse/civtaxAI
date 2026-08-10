import { useState } from 'react';
import { Sparkles, Trophy, Award, TrendingUp, CheckCircle, ShieldCheck, X, Zap } from 'lucide-react';

export default function PostPaymentRewardModal({ reward, onClose }) {
  const [scratched, setScratched] = useState(false);

  if (!reward) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
      <div className="bg-[#12141C] border-2 border-[#2A3042] rounded-3xl p-6 lg:p-8 max-w-lg w-full relative shadow-2xl shadow-black/80 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#181B26] border border-[#2D3346] flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#E5B80B]/20 border-2 border-[#E5B80B] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#E5B80B]/20 text-[#E5B80B]">
            <CheckCircle className="w-10 h-10 text-[#E5B80B]" />
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Payment Confirmed • Arrears Cleared
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">Payment Success! 🎉</h2>
          <p className="text-gray-300 text-xs">
            Paid <span className="text-white font-bold">₹{reward.amountPaid.toLocaleString()}</span> for {reward.taxType}
            {reward.clearedArrears > 0 && <span className="text-emerald-400 font-semibold"> (Arrears of ₹{reward.clearedArrears} auto-cleared)</span>}
          </p>
        </div>

        {/* LOOP STEP 1: Instant Scratch Card Reward */}
        <div className="bg-[#181B26] border border-[#2A3042] rounded-2xl p-5 text-center relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#E5B80B] text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Instant Reward Scratch Card
            </span>
            <span className="text-gray-400 text-[10px]">Tap card to reveal</span>
          </div>

          <div
            onClick={() => setScratched(true)}
            className={`cursor-pointer rounded-xl p-6 transition-all duration-500 flex flex-col items-center justify-center min-h-[120px] ${
              scratched
                ? 'bg-gradient-to-r from-[#E5B80B]/20 via-[#1C202E] to-[#E5B80B]/20 border border-[#E5B80B] shadow-lg shadow-[#E5B80B]/20'
                : 'bg-gradient-to-r from-[#D1A000] to-[#E5B80B] text-black font-extrabold shadow-md hover:scale-[1.02]'
            }`}
          >
            {scratched ? (
              <div className="space-y-1 animate-fade-in-up">
                <span className="text-3xl block">🎁</span>
                <p className="font-extrabold text-[#FFDC69] text-base">{reward.rewardScratchPrize}</p>
                <p className="text-gray-300 text-xs">+ Badge Unlocked: <span className="text-white font-bold">{reward.unlockedBadge}</span></p>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-3xl block animate-bounce">🪙</span>
                <p className="text-black font-black text-sm uppercase tracking-wider">TAP TO SCRATCH REWARD</p>
              </div>
            )}
          </div>
        </div>

        {/* LOOP STEP 2: Live Ward Rank Update */}
        <div className="bg-[#181B26] border border-[#2A3042] rounded-2xl p-4 flex items-center gap-4 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">Live Ward Rank Update</p>
            <p className="font-bold text-white text-sm truncate">{reward.wardRankBoost}</p>
          </div>
          <span className="text-emerald-400 font-extrabold text-xs bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 rounded-full">
            +1.4% Rate
          </span>
        </div>

        {/* LOOP STEP 3: Civic Credit Score Increment & Perk Unlock */}
        <div className="bg-[#181B26] border border-[#E5B80B]/40 rounded-2xl p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E5B80B]/20 text-[#E5B80B] border border-[#E5B80B]/40 flex items-center justify-center font-extrabold text-sm">
              +25
            </div>
            <div>
              <p className="text-xs text-gray-400">Civic Credit Score Boost</p>
              <p className="font-extrabold text-white text-base">{reward.newCreditScore} <span className="text-[#E5B80B] text-xs font-bold">CRED Score</span></p>
            </div>
          </div>
          <span className="text-xs text-[#E5B80B] font-bold bg-[#E5B80B]/15 px-3 py-1 rounded-full border border-[#E5B80B]/30">
            Perk Unlocked ⚡
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full bg-[#E5B80B] hover:bg-[#D1A000] text-black font-black py-4 rounded-2xl text-base transition-all shadow-lg shadow-[#E5B80B]/25 cursor-pointer"
        >
          Claim All Rewards & Continue
        </button>

      </div>
    </div>
  );
}
