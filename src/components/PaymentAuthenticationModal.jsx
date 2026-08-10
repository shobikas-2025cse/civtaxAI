import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, AlertCircle, CheckCircle2, ArrowRight, X, Delete, RefreshCw, KeyRound, Info
} from 'lucide-react';

/**
 * PaymentAuthenticationModal Component
 * 
 * Secure demo payment authentication modal implementing a masked 4-digit PIN verification,
 * keypad, attempt limits, security disclaimers, and loading states.
 * 
 * DEMO ONLY: Does not process or store any real UPI PIN credentials.
 */
export default function PaymentAuthenticationModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  taxName = 'Municipal Tax', 
  amountPaid = 0, 
  paymentMethod = 'UPI One-Tap',
  isAutoPayEnabled = false 
}) {
  const MOCK_DEMO_PIN = '1234';
  const MAX_ATTEMPTS = 3;

  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showForgotTip, setShowForgotTip] = useState(false);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setShowForgotTip(false);
    }
  }, [isOpen]);

  // Support physical keyboard typing for convenience
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

    // Simulate short network verification delay
    setTimeout(() => {
      if (pin === MOCK_DEMO_PIN) {
        setIsVerifying(false);
        const demoTxnId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
        onSuccess({
          txnId: demoTxnId,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          amountPaid,
          taxName,
          paymentMethod,
          isAutoPayEnabled
        });
      } else {
        setIsVerifying(false);
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        setPin('');

        if (newAttempts >= MAX_ATTEMPTS) {
          setIsLocked(true);
          setErrorMsg('Maximum authentication attempts exceeded. Payment locked for demo security.');
        } else {
          setErrorMsg(`Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`);
        }
      }
    }, 1200);
  };

  const handleResetLock = () => {
    setIsLocked(false);
    setFailedAttempts(0);
    setPin('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
      <div className="bg-[#12141C] border-2 border-[#2A3042] rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl shadow-black/80 space-y-6 text-white">
        
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          disabled={isVerifying}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#181B26] border border-[#2D3346] flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#E5B80B]/20 border-2 border-[#E5B80B] text-[#E5B80B] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#E5B80B]/20">
            <ShieldCheck className="w-7 h-7 text-[#E5B80B]" />
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[#E5B80B] text-[11px] font-extrabold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Payment Authentication</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Authenticate Payment</h2>
        </div>

        {/* Payment Summary Card */}
        <div className="bg-[#181B26] border border-[#2A3042] rounded-2xl p-4 space-y-2.5 shadow-md text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-[#2A3042]">
            <span className="text-gray-400 font-semibold">Tax Category</span>
            <span className="font-extrabold text-white">{taxName}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-[#2A3042]">
            <span className="text-gray-400 font-semibold">Amount Payable</span>
            <span className="font-black text-base text-[#E5B80B]">₹{amountPaid.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-semibold">Payment Gateway</span>
            <span className="font-bold text-gray-200">{paymentMethod}</span>
          </div>
          {isAutoPayEnabled && (
            <div className="flex justify-between items-center pt-2 border-t border-[#2A3042] text-emerald-400 font-bold">
              <span>Auto-Debit Status</span>
              <span className="bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[10px]">
                Active (Monthly 5th)
              </span>
            </div>
          )}
        </div>

        {/* PIN Input Dots Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
            <span>Enter Demo UPI PIN</span>
            <span className="text-[#E5B80B] font-mono text-[11px]">Demo PIN: {MOCK_DEMO_PIN}</span>
          </div>

          {/* Masked PIN Display Boxes */}
          <div className="flex justify-center items-center gap-3">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                    errorMsg 
                      ? 'border-red-500/80 bg-red-500/10' 
                      : isFilled 
                        ? 'border-[#E5B80B] bg-[#E5B80B]/10 shadow-md shadow-[#E5B80B]/20' 
                        : 'border-[#2A3042] bg-[#181B26]'
                  }`}
                >
                  {isFilled ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#E5B80B] animate-scale-in" />
                  ) : (
                    <span className="text-gray-600 font-bold text-sm">•</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Error Message & Attempt Alerts */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-semibold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Show Demo Helper Tip if user clicks Forgot PIN */}
          {showForgotTip && (
            <div className="p-2.5 rounded-xl bg-[#E5B80B]/15 border border-[#E5B80B]/40 text-[#FFDC69] text-xs space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" /> Demo Security Hint</span>
                <button onClick={() => setShowForgotTip(false)} className="text-gray-400 hover:text-white text-[10px]">Dismiss</button>
              </div>
              <p className="text-gray-300 text-[11px]">
                For this sandbox demo, enter PIN <strong className="text-white font-mono">1234</strong> to simulate instant bank verification.
              </p>
            </div>
          )}
        </div>

        {/* On-screen Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeypadPress(String(digit))}
              disabled={isLocked || isVerifying || pin.length >= 4}
              className="py-3 bg-[#181B26] hover:bg-[#222738] active:bg-[#E5B80B] active:text-black border border-[#2A3042] rounded-xl text-lg font-bold text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {digit}
            </button>
          ))}
          
          <button
            type="button"
            onClick={handleClear}
            disabled={isLocked || isVerifying || pin.length === 0}
            className="py-3 bg-[#181B26] hover:bg-[#222738] border border-[#2A3042] rounded-xl text-xs font-bold text-gray-400 transition-all cursor-pointer disabled:opacity-40"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            disabled={isLocked || isVerifying || pin.length >= 4}
            className="py-3 bg-[#181B26] hover:bg-[#222738] active:bg-[#E5B80B] active:text-black border border-[#2A3042] rounded-xl text-lg font-bold text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            disabled={isLocked || isVerifying || pin.length === 0}
            className="py-3 bg-[#181B26] hover:bg-[#222738] border border-[#2A3042] rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer disabled:opacity-40"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons: Forgot PIN link, Cancel, Authenticate & Pay */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setShowForgotTip(!showForgotTip)}
              className="text-gray-400 hover:text-[#E5B80B] transition-colors font-medium underline underline-offset-4 cursor-pointer"
            >
              Forgot PIN?
            </button>

            {isLocked && (
              <button
                type="button"
                onClick={handleResetLock}
                className="text-[#E5B80B] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Reset Demo Attempts
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              className="flex-1 bg-[#181B26] hover:bg-[#222738] border border-[#2A3042] text-gray-300 font-bold py-3.5 rounded-2xl text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAuthenticate}
              disabled={isLocked || isVerifying || pin.length < 4}
              className="flex-1 bg-[#E5B80B] hover:bg-[#D1A000] text-black font-black py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#E5B80B]/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Verifying payment...</span>
                </div>
              ) : (
                <>
                  <span>Authenticate & Pay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Disclaimer Note */}
        <div className="flex items-start gap-2 pt-2 border-t border-[#2A3042] text-[11px] text-gray-400 leading-tight">
          <Info className="w-4 h-4 text-[#E5B80B] flex-shrink-0 mt-0.5" />
          <p>
            Demo authentication — real UPI PIN is securely handled by your bank/payment provider.
          </p>
        </div>

      </div>
    </div>
  );
}
