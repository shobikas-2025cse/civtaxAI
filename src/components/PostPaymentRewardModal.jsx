import { useState } from 'react';
import { Sparkles, Trophy, Award, TrendingUp, CheckCircle, ShieldCheck, X, Zap } from 'lucide-react';

export default function PostPaymentRewardModal({ reward, onClose }) {
  const [scratched, setScratched] = useState(false);

  if (!reward) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
      <div className="bg-[#1E1E1E] border border-mustard/40 rounded-3xl p-6 lg:p-8 max-w-lg w-full relative shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#252525] border border-[#333333] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-mustard/20 border border-mustard/50 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-mustard/20">
            <CheckCircle className="w-10 h-10 text-mustard" />
          </div>
          <span className="bg-green-500/20 text-green-400 border border-green-500/40 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Payment Confirmed • Arrears Cleared
          </span>
          <h2 className="text-2xl font-extrabold text-white">Payment Success! 🎉</h2>
          <p className="text-gray-400 text-xs">
            Paid <span className="text-white font-bold">₹{reward.amountPaid.toLocaleString()}</span> for {reward.taxType}
            {reward.clearedArrears > 0 && <span className="text-green-400 font-semibold"> (Arrears of ₹{reward.clearedArrears} auto-cleared)</span>}
          </p>
        </div>

        {/* LOOP STEP 1: Instant Scratch Card Reward */}
        <div className="bg-[#121212] border border-[#333333] rounded-2xl p-5 text-center relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-mustard text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Instant Reward Scratch Card
            </span>
            <span className="text-gray-400 text-[10px]">Tap card to reveal</span>
          </div>

          <div
            onClick={() => setScratched(true)}
            className={`cursor-pointer rounded-xl p-6 transition-all duration-500 flex flex-col items-center justify-center min-h-[120px] ${
              scratched
                ? 'bg-gradient-to-r from-mustard/20 via-[#252525] to-mustard/20 border border-mustard shadow-lg shadow-mustard/20'
                : 'bg-gradient-to-r from-mustard-600 to-mustard-700 text-civic-black font-extrabold shadow-md hover:scale-[1.02]'
            }`}
          >
            {scratched ? (
              <div className="space-y-1 animate-fade-in-up">
                <span className="text-3xl block">🎁</span>
                <p className="font-extrabold text-mustard text-base">{reward.rewardScratchPrize}</p>
                <p className="text-gray-300 text-xs">+ Badge Unlocked: <span className="text-white font-bold">{reward.unlockedBadge}</span></p>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-3xl block animate-bounce">🪙</span>
                <p className="text-civic-black font-black text-sm uppercase tracking-wider">TAP TO SCRATCH REWARD</p>
              </div>
            )}
          </div>
        </div>

        {/* LOOP STEP 2: Live Ward Rank Update */}
        <div className="bg-[#121212] border border-[#333333] rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">Live Ward Rank Update</p>
            <p className="font-bold text-white text-sm truncate">{reward.wardRankBoost}</p>
          </div>
          <span className="text-green-400 font-extrabold text-xs bg-green-500/20 px-2.5 py-1 rounded-full">
            +1.4% Rate
          </span>
        </div>

        {/* LOOP STEP 3: Civic Credit Score Increment & Perk Unlock */}
        <div className="bg-[#121212] border border-mustard/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mustard/20 text-mustard flex items-center justify-center font-extrabold text-sm">
              +25
            </div>
            <div>
              <p className="text-xs text-gray-400">Civic Credit Score Boost</p>
              <p className="font-extrabold text-white text-base">{reward.newCreditScore} <span className="text-mustard text-xs font-normal">CRED Score</span></p>
            </div>
          </div>
          <span className="text-xs text-mustard font-bold bg-mustard/15 px-3 py-1 rounded-full border border-mustard/30">
            Perk Unlocked ⚡
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full bg-mustard hover:bg-mustard-dark text-civic-black font-extrabold py-3.5 rounded-xl text-base transition-colors shadow-lg"
        >
          Claim All Rewards & Continue
        </button>

      </div>
    </div>
  );
}
