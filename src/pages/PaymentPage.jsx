import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Smartphone, Building, CheckCircle, XCircle, ArrowLeft, Download, Percent, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import PostPaymentRewardModal from '../components/PostPaymentRewardModal';
import PaymentAuthenticationModal from '../components/PaymentAuthenticationModal';
import { generateReceiptPDF } from '../utils/generateReceiptPDF';

export default function PaymentPage() {
  const { user, getTaxes, payTax } = useAuth();
  const taxes = getTaxes().filter(t => t.status !== 'paid');
  
  const [selectedTax, setSelectedTax] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [step, setStep] = useState('select'); // 'select' | 'review' | 'processing' | 'success'
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [rewardLoopData, setRewardLoopData] = useState(null);

  const paymentMethods = [
    { id: 'upi', name: 'One-Tap UPI Gateway', icon: <Zap className="w-5 h-5 text-mustard" />, desc: 'Google Pay, PhonePe, Paytm (Instant 1-Tap)' },
    { id: 'card', name: 'Saved Card / Debit Card', icon: <CreditCard className="w-5 h-5 text-blue-400" />, desc: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', name: 'Net Banking', icon: <Building className="w-5 h-5 text-green-400" />, desc: 'All major Indian Banks' },
  ];

  const getEarlyDiscount = (tax) => {
    const daysUntilDue = tax.daysUntilDue ?? 30;
    if (daysUntilDue > 30) return 15;
    if (daysUntilDue > 14) return 10;
    if (daysUntilDue > 0) return 5;
    return 0;
  };

  const handleOneTapPay = () => {
    setStep('processing');
    setTimeout(() => {
      const reward = payTax(selectedTax.id, paymentMethod === 'upi' ? 'One-Tap UPI' : 'Credit/Debit Card');
      setRewardLoopData(reward);
      setStep('success');
    }, 1200);
  };

  const resetPayment = () => {
    setSelectedTax(null);
    setPaymentMethod('upi');
    setStep('select');
    setIsAuthModalOpen(false);
    setRewardLoopData(null);
  };

  // Selection Step
  if (step === 'select') {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-extrabold text-white">One-Tap Municipal Payment Screen</h1>
          <p className="text-gray-400 text-sm mt-1">Select tax bill to proceed with one-tap payment and auto-clear past arrears</p>
        </div>

        {taxes.length === 0 ? (
          <div className="civic-card p-12 text-center shadow-lg space-y-4">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">All Municipal Dues Cleared! 🎉</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Your property, water, and waste tax accounts are fully paid. Your civic credit score is at peak!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {taxes.map((tax) => {
              const discount = getEarlyDiscount(tax);
              const arrears = tax.arrears || 0;
              const discountAmount = Math.round((tax.amount * discount) / 100);
              const finalAmount = tax.amount - discountAmount + arrears;

              return (
                <div
                  key={tax.id}
                  onClick={() => { setSelectedTax(tax); setStep('review'); }}
                  className={`civic-card p-6 cursor-pointer civic-card-hover ${
                    tax.status === 'overdue' ? 'border-red-500/40 bg-red-500/5' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                        tax.type.includes('Property') ? 'bg-blue-500/20 text-blue-400' :
                        tax.type.includes('Water') ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {tax.type.includes('Property') ? '🏠' : tax.type.includes('Water') ? '💧' : '♻️'}
                      </div>
                      <div>
                        <p className="font-extrabold text-white text-base">{tax.type}</p>
                        <p className="text-gray-400 text-xs">{tax.period} • Due: {tax.due}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {discount > 0 && (
                            <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-green-500/30">
                              <Percent className="w-3 h-3" />
                              {discount}% Dynamic Rebate
                            </span>
                          )}
                          {arrears > 0 && (
                            <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-500/30">
                              Arrears Attached: +₹{arrears} (Auto-Clears)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      {discount > 0 && (
                        <p className="text-gray-500 text-xs line-through">₹{(tax.amount + arrears).toLocaleString()}</p>
                      )}
                      <p className="text-2xl font-black text-mustard">₹{Math.round(finalAmount).toLocaleString()}</p>
                      <button className="mt-2 bg-mustard hover:bg-mustard-dark text-civic-black text-xs font-extrabold px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1 sm:ml-auto">
                        One-Tap Pay <Zap className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Review & One-Tap Checkout Step
  if (step === 'review') {
    const discount = getEarlyDiscount(selectedTax);
    const arrears = selectedTax.arrears || 0;
    const discountAmount = Math.round((selectedTax.amount * discount) / 100);
    const finalAmount = selectedTax.amount - discountAmount + arrears;

    return (
      <div className="space-y-6 max-w-2xl mx-auto animate-fade-in-up">
        <button onClick={resetPayment} className="flex items-center gap-2 text-gray-400 hover:text-mustard text-xs transition-colors">
          <ArrowLeft className="w-4 h-4" /> Return to Tax Selection
        </button>

        <div>
          <h1 className="text-2xl font-extrabold text-white">One-Tap Checkout & Arrears Auto-Clear</h1>
          <p className="text-gray-400 text-sm mt-1">Review bill summary & select payment gateway</p>
        </div>

        {/* Itemized Breakdown */}
        <div className="civic-card p-6 shadow-lg space-y-4">
          <h3 className="font-extrabold text-white text-base border-b border-[#333333] pb-3">
            {selectedTax.type} — {selectedTax.period}
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Base Demand Amount</span>
              <span className="font-bold text-white">₹{selectedTax.amount.toLocaleString()}</span>
            </div>

            {arrears > 0 && (
              <div className="flex justify-between text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/30">
                <span>Overdue Arrears (Auto-Cleared)</span>
                <span className="font-extrabold">+₹{arrears.toLocaleString()}</span>
              </div>
            )}

            {discount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Dynamic Incentive Rebate ({discount}%)</span>
                <span className="font-extrabold">-₹{discountAmount.toLocaleString()}</span>
              </div>
            )}

            <div className="border-t border-[#333333] pt-4 flex justify-between items-center">
              <div>
                <span className="font-extrabold text-white text-base">Total Payable</span>
                <p className="text-[11px] text-gray-400">Arrears will be marked 100% cleared</p>
              </div>
              <span className="text-3xl font-black text-mustard">₹{Math.round(finalAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* One-Tap Gateway Selection */}
        <div>
          <h3 className="font-bold text-white text-sm mb-3">Select One-Tap Gateway</h3>
          <div className="space-y-2.5">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`civic-card p-4 flex items-center gap-4 cursor-pointer transition-all ${
                  paymentMethod === method.id
                    ? 'border-mustard bg-mustard/10 shadow-md'
                    : 'hover:border-gray-500'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  paymentMethod === method.id ? 'bg-mustard text-civic-black font-bold' : 'bg-[#252525] text-gray-300'
                }`}>
                  {method.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">{method.name}</p>
                  <p className="text-gray-400 text-xs">{method.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === method.id ? 'border-mustard' : 'border-gray-600'
                }`}>
                  {paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-mustard rounded-full" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="w-full bg-mustard hover:bg-mustard-dark text-civic-black font-black py-4 rounded-xl text-lg transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
        >
          <Zap className="w-5 h-5 fill-civic-black" /> Pay ₹{Math.round(finalAmount).toLocaleString()} Now (One-Tap)
        </button>

        {/* Payment Authentication Modal */}
        <PaymentAuthenticationModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            handleOneTapPay();
          }}
          taxName={selectedTax?.type || 'Municipal Tax'}
          amountPaid={Math.round(finalAmount)}
          paymentMethod={paymentMethod === 'upi' ? 'One-Tap UPI Gateway' : (paymentMethod === 'card' ? 'Saved Card / Debit Card' : 'Net Banking')}
        />
      </div>
    );
  }

  // Processing Step
  if (step === 'processing') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 border-4 border-mustard/30 border-t-mustard rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-extrabold text-white">Clearing Arrears & Processing...</h2>
          <p className="text-gray-400 text-sm">Communicating with Municipal Treasury Gateway</p>
        </div>
      </div>
    );
  }

  // Success Step + Post-Payment Reward Loop Overlay
  if (step === 'success') {
    return (
      <div className="space-y-6 max-w-xl mx-auto animate-fade-in-up">
        {/* Post-Payment Reward Loop Trigger Modal */}
        <PostPaymentRewardModal reward={rewardLoopData} onClose={resetPayment} />

        <div className="civic-card p-8 text-center shadow-xl space-y-4">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
          <h2 className="text-2xl font-extrabold text-white">Payment & Arrears Cleared!</h2>
          <p className="text-gray-400 text-sm">Download official municipal e-receipt below:</p>
          
          <button
            onClick={() => generateReceiptPDF({
              id: rewardLoopData?.receiptId || 'RCP-' + Date.now().toString().slice(-6),
              receiptId: rewardLoopData?.receiptId || 'RCP-' + Date.now().toString().slice(-6),
              type: selectedTax?.type || 'Property Tax',
              amountPaid: rewardLoopData?.amountPaid || selectedTax?.amount || 11650,
              date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              method: paymentMethod === 'upi' ? 'One-Tap UPI Gateway' : 'Credit/Debit Card'
            }, user)}
            className="w-full bg-[#181D2C] hover:bg-[#22293E] border border-[#2B3349] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4 text-[#E5B80B]" />
            Download Official PDF Receipt
          </button>

          <button
            onClick={resetPayment}
            className="w-full bg-mustard text-civic-black font-extrabold py-3.5 rounded-xl transition-all cursor-pointer"
          >
            Back to Payments
          </button>
        </div>
      </div>
    );
  }
}
