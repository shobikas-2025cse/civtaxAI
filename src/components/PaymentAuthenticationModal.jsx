import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, Lock, AlertCircle, CheckCircle2, ArrowRight, X, Delete, RefreshCw, KeyRound, Info
} from 'lucide-react';

export default function PaymentAuthenticationModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  taxName = 'Municipal Tax', 
  amountPaid = 0, 
  paymentMethod = 'UPI One-Tap',
  isAutoPayEnabled = false 
}) {
  const { t } = useTranslation();
  const MOCK_DEMO_PIN = '1234';
  const MAX_ATTEMPTS = 3;

  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showForgotTip, setShowForgotTip] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setShowForgotTip(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || isLocked || isVerifying) return;

    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < 4) {
          setPin(prev => prev + e.key);
          setErrorMsg('');
        }
      } else if (e.key === 'Backspace') {
        setPin(prev => prev.slice(0, -1));
        setErrorMsg('');
      } else if (e.key === 'Enter' && pin.length === 4) {
        handleAuthenticate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, isLocked, isVerifying]);

  if (!isOpen) return null;

  const handleKeypadPress = (digit) => {
    if (isLocked || isVerifying) return;
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      setErrorMsg('');
    }
  };

  const handleBackspace = () => {
    if (isLocked || isVerifying) return;
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    if (isLocked || isVerifying) return;
    setPin('');
    setErrorMsg('');
  };

  const handleAuthenticate = () => {
    if (isLocked || isVerifying) return;

    if (pin.length < 4) {
      setErrorMsg('Please enter all 4 digits of your demo PIN.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    setTimeout(() => {
      if (pin === MOCK_DEMO_PIN) {
        setIsVerifying(false);
        const txnId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
        const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        onSuccess({ txnId, date: dateStr, amountPaid });
      } else {
        setIsVerifying(false);
        const newFailCount = failedAttempts + 1;
        setFailedAttempts(newFailCount);
        setPin('');

        if (newFailCount >= MAX_ATTEMPTS) {
          setIsLocked(true);
          setErrorMsg('Maximum PIN attempts reached. Account locked for 60 seconds.');
          setTimeout(() => {
            setIsLocked(false);
            setFailedAttempts(0);
            setErrorMsg('');
          }, 60000);
        } else {
          setErrorMsg(`Incorrect Demo PIN. Try "1234" (${MAX_ATTEMPTS - newFailCount} attempt remaining).`);
        }
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#12141F] border-2 border-[#2B3145] rounded-3xl w-full max-w-md p-6 sm:p-7 space-y-6 shadow-2xl shadow-black/80 relative text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#252A3B] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E5B80B]/20 border border-[#E5B80B]/40 flex items-center justify-center text-[#E5B80B]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base sm:text-lg tracking-tight">
                {t('payment.enterPIN')}
              </h3>
              <p className="text-gray-400 text-[11px]">
                {paymentMethod} • <span className="text-[#E5B80B] font-bold">₹{amountPaid.toLocaleString()}</span>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1A1E2B] border border-[#2B3145] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#E5B80B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount & Bill Context Card */}
        <div className="bg-[#181B28] border border-[#2B3145] rounded-2xl p-4 flex items-center justify-between shadow-inner">
          <div>
            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">{taxName}</p>
            <p className="text-2xl font-black text-white mt-0.5">₹{amountPaid.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/40">
              {t('login.secure')}
            </span>
          </div>
        </div>

        {/* Demo PIN Helper Banner */}
        <div className="bg-[#1A1D2D] border border-[#E5B80B]/40 rounded-xl p-3 flex items-center gap-2.5 text-xs text-gray-300">
          <Info className="w-4 h-4 text-[#E5B80B] flex-shrink-0" />
          <span>
            {t('payment.pinNotice')}
          </span>
        </div>

        {/* Masked PIN Box (4 Indicator Dots) */}
        <div className="space-y-2">
          <div className="flex justify-center gap-3.5 py-2">
            {[0, 1, 2, 3].map((index) => (
              <div 
                key={index} 
                className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-bold transition-all shadow-md ${
                  pin.length > index
                    ? 'border-[#E5B80B] bg-[#E5B80B]/20 text-[#E5B80B] shadow-[#E5B80B]/20 scale-105'
                    : 'border-[#2D344B] bg-[#161926] text-gray-600'
                }`}
              >
                {pin.length > index ? '●' : ''}
              </div>
            ))}
          </div>

          {errorMsg && (
            <p className="text-red-400 text-xs text-center font-bold flex items-center justify-center gap-1.5 bg-red-500/10 border border-red-500/30 p-2.5 rounded-xl">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {errorMsg}
            </p>
          )}
        </div>

        {/* Keypad Grid (1-9, Clear, 0, Backspace) */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeypadPress(num)}
              disabled={isLocked || isVerifying}
              className="h-12 rounded-2xl bg-[#181B28] border border-[#2B3145] text-white font-extrabold text-lg hover:bg-[#E5B80B] hover:text-black hover:border-[#E5B80B] active:scale-95 transition-all disabled:opacity-30 cursor-pointer shadow"
            >
              {num}
            </button>
          ))}

          <button
            onClick={handleClear}
            disabled={isLocked || isVerifying || pin.length === 0}
            className="h-12 rounded-2xl bg-[#181B28] border border-[#2B3145] text-gray-400 font-bold text-xs hover:text-white hover:border-gray-400 active:scale-95 transition-all disabled:opacity-30 cursor-pointer"
          >
            {t('common.cancel')}
          </button>

          <button
            onClick={() => handleKeypadPress('0')}
            disabled={isLocked || isVerifying}
            className="h-12 rounded-2xl bg-[#181B28] border border-[#2B3145] text-white font-extrabold text-lg hover:bg-[#E5B80B] hover:text-black hover:border-[#E5B80B] active:scale-95 transition-all disabled:opacity-30 cursor-pointer shadow"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            disabled={isLocked || isVerifying || pin.length === 0}
            className="h-12 rounded-2xl bg-[#181B28] border border-[#2B3145] text-gray-400 hover:text-red-400 hover:border-red-400 active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="pt-2">
          <button
            onClick={handleAuthenticate}
            disabled={pin.length < 4 || isLocked || isVerifying}
            className="w-full bg-[#E5B80B] hover:bg-[#D1A000] text-black font-extrabold py-3.5 rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg shadow-[#E5B80B]/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                {t('payment.verifyingPIN')}
              </>
            ) : (
              <>
                {t('payment.confirmPayment')}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Footer Disclaimer */}
        <div className="border-t border-[#252A3B] pt-3 text-center">
          <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            256-bit Municipal Gateway Encryption • {t('login.dataSafe')}
          </p>
        </div>

      </div>
    </div>
  );
}
