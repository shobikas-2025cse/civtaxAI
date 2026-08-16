import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';
import { Shield, Phone, ArrowRight, CheckCircle2, Landmark, Sparkles, Lock, Star, Trophy, Award, Zap, ShieldCheck, Users, Moon, IndianRupee, UserCheck, Briefcase, Settings, ChevronRight, ArrowLeft } from 'lucide-react';

// Count-up animation hook for statistics
function useCountUp(endValue, duration = 2000, isPercentage = false, prefix = '', suffix = '') {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(endValue);
    if (isNaN(end)) return;
    const stepTime = Math.abs(Math.floor(duration / 60));
    const increment = end / (duration / stepTime);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [endValue, duration]);

  if (isPercentage) {
    return `${count.toFixed(0)}${suffix}`;
  }
  return `${prefix}${Math.floor(count).toLocaleString()}${suffix}`;
}

export default function LoginPage() {
  const { login } = useAuth();

  // 2-Step State Logic
  // role: null (State 1: Role Selection) | 'citizen' | 'collector' | 'admin' (State 2: Login Form)
  const [selectedRole, setSelectedRole] = useState(null);
  const [step, setStep] = useState('input'); // 'input' | 'otp' | 'success'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const otpRefs = useRef([]);

  // Animated Live Statistics matching reference image
  const taxCollected = useCountUp(24, 2000, false, '₹', 'Cr+');
  const activeCitizens = useCountUp(15, 2000, false, '', 'K+');
  const complianceRate = useCountUp(92, 2000, true, '', '%');
  const topRewarders = useCountUp(500, 1800, false, '', '+');

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Role metadata configurations
  const roleConfig = {
    citizen: {
      title: 'Welcome, Citizen! 👋',
      subtitle: 'Enter your registered mobile number to get started.',
      badge: 'SECURE LOGIN',
      label: 'Mobile Number',
      placeholder: 'Enter 10-digit number',
      prefix: '+91',
      demos: [
        { label: '9128492780 (Rekha)', phone: '9128492780' },
        { label: '9803217037 (Naresh)', phone: '9803217037' },
        { label: '9344703907 (Anil)', phone: '9344703907' }
      ]
    },
    collector: {
      title: 'Welcome, Tax Officer! 📋',
      subtitle: 'Enter Officer Mobile / Staff ID to access municipal collection portal.',
      badge: 'FIELD OFFICER ACCESS',
      label: 'Officer Registered Mobile',
      placeholder: 'Enter 10-digit officer phone',
      prefix: '+91',
      demos: [
        { label: '9800112233 (Officer Anand)', phone: '9800112233' }
      ]
    },
    admin: {
      title: 'Welcome, System Admin! 🔐',
      subtitle: 'Enter Admin credentials to access ULB Command Center.',
      badge: 'ULB COMMAND ACCESS',
      label: 'Admin Authorization Mobile',
      placeholder: 'Enter registered admin phone',
      prefix: '+91',
      demos: [
        { label: '9900000001 (ULB Superadmin)', phone: '9900000001' }
      ]
    }
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setStep('input');
    setPhone('');
    setOtp(['', '', '', '', '', '']);
    setError('');
  };

  const handleBackToRoles = () => {
    setSelectedRole(null);
    setStep('input');
    setPhone('');
    setOtp(['', '', '', '', '', '']);
    setError('');
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await authService.sendOTP(phone);
      setIsLoading(false);
      setStep('otp');
      setTimer(30);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Failed to send SMS OTP. Please check your mobile number.');
    }
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await authService.verifyOTP(phone, otpString);
      setStep('success');
      setTimeout(() => {
        login(phone, selectedRole);
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Invalid or expired OTP code.');
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    setError('');
    setIsLoading(true);

    try {
      await authService.sendOTP(phone);
      setIsLoading(false);
      setOtp(['', '', '', '', '', '']);
      setTimer(30);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Failed to resend SMS OTP.');
    }
  };

  const currentRoleConfig = selectedRole ? roleConfig[selectedRole] : roleConfig.citizen;

  return (
    <div className="min-h-screen w-full bg-[#050608] text-white selection:bg-[#FF8C00] selection:text-black overflow-x-hidden font-sans p-3 sm:p-6 lg:p-8 flex items-center justify-center">

      {/* Outer Main Card Container matching reference frame */}
      <div className="w-full max-w-[1440px] bg-[#0A0C10] border border-[#1E222D] rounded-[28px] overflow-hidden shadow-2xl flex flex-col lg:flex-row relative">

        {/* LEFT HERO PANEL — Smart City Night Backdrop */}
        <div className="relative lg:w-[60%] w-full min-h-[520px] lg:min-h-[800px] overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-[#1E222D]">

          {/* Generated Smart City Night Image Background */}
          <img
            src="/city-hero-night.png"
            alt="Smart City Night Scene"
            className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000 ease-out"
          />

          {/* Dark Overlay Vignette for crisp text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/60 to-[#0A0C10]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10]/95 via-[#0A0C10]/70 to-transparent" />

          {/* Content Layer */}
          <div className="relative z-10 flex flex-col justify-between h-full space-y-8">

            {/* Top Brand Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF8C00] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF8C00]/25 flex-shrink-0">
                  <Landmark className="w-5 h-5 text-black font-extrabold" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-white text-xl tracking-tight">CIVTAX</span>
                    <span className="font-extrabold text-[#FF8C00] text-xl tracking-tight">AI</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium">Smart City. Smart Citizens.</p>
                </div>
              </div>

              {/* Decorative Accent Dot Grid */}
              <div className="hidden sm:grid grid-cols-6 gap-1.5 opacity-25">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-gray-400" />
                ))}
              </div>
            </div>

            {/* Main Hero Content */}
            <div className="my-auto space-y-6 max-w-xl">

              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 bg-[#12151C]/90 border border-[#242A38] px-4 py-1.5 rounded-full text-xs font-semibold text-gray-200 backdrop-blur-md">
                <Users className="w-3.5 h-3.5 text-[#FF8C00]" />
                <span>Citizen Engagement & Behaviour</span>
              </div>

              {/* Main Heading — Clean without 'Rewarded.' */}
              <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.12] text-white tracking-tight">
                Smart Municipal<br />
                Tax Payments
              </h1>

              {/* Description */}
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-lg font-normal">
                Pay property tax, water tax & more on time. Earn rewards, climb leaderboards, and help build a better city.
              </p>

              {/* 4 Stat Circles Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">

                <div className="space-y-1.5">
                  <div className="w-9 h-9 bg-[#171A21]/90 border border-[#2B313E] rounded-full flex items-center justify-center text-[#FF8C00]">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-white">{taxCollected}</p>
                  <p className="text-gray-400 text-xs font-medium">Tax Collected</p>
                </div>

                <div className="space-y-1.5">
                  <div className="w-9 h-9 bg-[#171A21]/90 border border-[#2B313E] rounded-full flex items-center justify-center text-cyan-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-white">{activeCitizens}</p>
                  <p className="text-gray-400 text-xs font-medium">Active Citizens</p>
                </div>

                <div className="space-y-1.5">
                  <div className="w-9 h-9 bg-[#171A21]/90 border border-[#2B313E] rounded-full flex items-center justify-center text-[#FF8C00]">
                    <Moon className="w-4 h-4" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-[#FF8C00]">{complianceRate}</p>
                  <p className="text-gray-400 text-xs font-medium">On-time Rate</p>
                </div>

                <div className="space-y-1.5">
                  <div className="w-9 h-9 bg-[#171A21]/90 border border-[#2B313E] rounded-full flex items-center justify-center text-amber-300">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-white">{topRewarders}</p>
                  <p className="text-gray-400 text-xs font-medium">Top Rewarders</p>
                </div>

              </div>

              {/* Trust Badge Bar */}
              <div className="bg-[#12151C]/90 border border-[#242A38] rounded-2xl p-4 flex items-center gap-3 text-xs text-gray-300 backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-[#FF8C00] flex-shrink-0" />
                <span>
                  <strong className="text-white">Trusted by thousands of citizens</strong> across the nation.
                </span>
              </div>

            </div>

            {/* Bottom Footer Bar — Only 100% Secure & Your Data is Safe */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400 border-t border-[#1E222D] pt-5">
              <div className="flex items-center gap-6 flex-wrap">
                <span className="flex items-center gap-1.5 text-gray-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF8C00]" /> 100% Secure
                </span>
                <span className="flex items-center gap-1.5 text-gray-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF8C00]" /> Your Data is Safe
                </span>
              </div>

              <a href="#terms" className="text-gray-400 hover:text-[#FF8C00] flex items-center gap-1 transition-colors font-medium">
                Terms & Conditions <ArrowRight className="w-3 h-3" />
              </a>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL — PITCH-BLACK HIGH-CONTRAST PORTAL GATEWAY */}
        <div className="lg:w-[40%] w-full bg-[#060709] p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">

          {/* Main Solid Pitch-Black Gateway Card with Crisp Borders & Generous Spacing */}
          <div className="bg-[#0A0A0C] border border-[#1E222D] rounded-[28px] p-6 sm:p-8 space-y-6 shadow-2xl relative">

            {/* ========================================================================= */}
            {/* STATE 1: ROLE SELECTION (3 Options: Citizen, Tax Collector, System Admin) */}
            {/* ========================================================================= */}
            {!selectedRole && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-[#FF8C00]" />
                    <span className="text-[#FF8C00] text-xs font-bold uppercase tracking-wider">SELECT ACCESS ROLE</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Portal Gateway</h2>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Select your account profile type to proceed.</p>
                </div>

                <div className="space-y-3.5">
                  {/* Card 1: Citizen */}
                  <div
                    onClick={() => handleSelectRole('citizen')}
                    className="p-5 rounded-2xl bg-[#10121A] border-2 border-[#202533] hover:border-[#FF8C00] hover:bg-[#FF8C00]/5 cursor-pointer transition-all duration-200 flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#FF8C00]/15 border border-[#FF8C00]/30 flex items-center justify-center text-[#FF8C00] group-hover:scale-105 transition-transform flex-shrink-0">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base group-hover:text-[#FF8C00] transition-colors">Citizen</h3>
                        <p className="text-gray-400 text-xs mt-1">Pay taxes, claim early-bird rebates, earn XP & perks.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#FF8C00] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>

                  {/* Card 2: Tax Collector */}
                  <div
                    onClick={() => handleSelectRole('collector')}
                    className="p-5 rounded-2xl bg-[#10121A] border-2 border-[#202533] hover:border-cyan-400 hover:bg-cyan-500/5 cursor-pointer transition-all duration-200 flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform flex-shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base group-hover:text-cyan-400 transition-colors">Tax Collector</h3>
                        <p className="text-gray-400 text-xs mt-1">Doorstep collections, spot receipts & field assessments.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>

                  {/* Card 3: System Admin (Visually distinct & subtle border at bottom) */}
                  <div
                    onClick={() => handleSelectRole('admin')}
                    className="p-4 rounded-xl bg-[#0C0D12] border border-[#1E222D] hover:border-amber-400/60 hover:bg-[#141620] cursor-pointer transition-all duration-200 flex items-center justify-between group mt-5"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-[#161822] border border-[#2B3040] flex items-center justify-center text-gray-400 group-hover:text-amber-400 flex-shrink-0">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-200 text-xs group-hover:text-white transition-colors">System Admin</h4>
                          <span className="text-[9px] font-bold text-gray-400 bg-[#161822] px-1.5 py-0.5 rounded border border-[#262B3A]">ULB Superuser</span>
                        </div>
                        <p className="text-gray-500 text-[11px] mt-0.5">System management and analytics.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-300 transition-colors flex-shrink-0" />
                  </div>
                </div>

                {/* 3 Feature Pills */}
                <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium pt-3 border-t border-[#1E222D]">
                  <span className="flex items-center gap-1.5 text-green-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> OTP Verified
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Trophy className="w-3.5 h-3.5" /> Earn Rewards
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Zap className="w-3.5 h-3.5" /> Instant Pay
                  </span>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STATE 2: DYNAMIC LOGIN VIEW FOR SELECTED ROLE                             */}
            {/* ========================================================================= */}
            {selectedRole && (
              <div className="space-y-6 animate-fade-in-up">

                {/* Back to Role Selection Button */}
                <button
                  onClick={handleBackToRoles}
                  className="text-gray-400 hover:text-[#FF8C00] text-xs font-bold flex items-center gap-2 transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to role selection
                </button>

                {/* STEP 1: PHONE/CREDENTIAL INPUT */}
                {step === 'input' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-4 h-4 text-[#FF8C00]" />
                        <span className="text-[#FF8C00] text-xs font-bold uppercase tracking-wider">
                          {currentRoleConfig.badge}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {currentRoleConfig.title}
                      </h2>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1">{currentRoleConfig.subtitle}</p>
                    </div>

                    {/* Demo Helper Pills */}
                    <div className="space-y-2 bg-[#10121A] border border-[#202533] rounded-2xl p-3.5">
                      <span className="text-[11px] text-gray-400 block font-medium">Demo: Click to auto-fill</span>
                      <div className="flex flex-wrap gap-2">
                        {currentRoleConfig.demos.map((demo) => (
                          <button
                            key={demo.phone}
                            type="button"
                            onClick={() => setPhone(demo.phone)}
                            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                              phone === demo.phone
                                ? 'border-[#FF8C00] bg-[#FF8C00]/20 text-[#FF8C00]'
                                : 'border-[#202533] text-gray-400 hover:text-white bg-[#0A0A0C]'
                            }`}
                          >
                            {demo.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-xs font-semibold mb-2">
                          {currentRoleConfig.label}
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-300 text-sm font-semibold">
                            <span>🇮🇳</span>
                            <span>{currentRoleConfig.prefix}</span>
                          </div>
                          <input
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value.replace(/\D/g, ''));
                              setError('');
                            }}
                            placeholder={currentRoleConfig.placeholder}
                            className="w-full bg-[#10121A] border border-[#202533] focus:border-[#FF8C00] rounded-2xl py-4 pl-20 pr-12 text-white text-base font-semibold placeholder-gray-500 focus:outline-none transition-colors"
                            autoFocus
                          />
                          <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        </div>
                      </div>

                      {error && (
                        <p className="text-red-400 text-xs flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 p-3 rounded-xl font-medium">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading || phone.length < 10}
                        className="w-full bg-[#FF8C00] hover:bg-[#E07B00] text-black font-extrabold py-4 rounded-2xl text-base transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#FF8C00]/20"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          <>
                            Send OTP
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* 3 Feature Pills */}
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium pt-2 border-t border-[#1E222D]">
                      <span className="flex items-center gap-1.5 text-green-400">
                        <ShieldCheck className="w-3.5 h-3.5" /> OTP Verified
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-300">
                        <Trophy className="w-3.5 h-3.5" /> Earn Rewards
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <Zap className="w-3.5 h-3.5" /> Instant Pay
                      </span>
                    </div>
                  </div>
                )}

                {/* STEP 2: OTP VERIFICATION BOXES */}
                {step === 'otp' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-[#FF8C00]" />
                        <span className="text-[#FF8C00] text-xs font-bold uppercase tracking-wider">VERIFICATION</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Enter OTP</h2>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1">
                        We've sent a 6-digit code to <span className="text-[#FF8C00] font-bold">+91 {phone}</span>
                      </p>
                    </div>

                    <form onSubmit={handleVerifyOTP} className="space-y-5">
                      <div className="flex gap-2 sm:gap-2.5 justify-center">
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={el => otpRefs.current[i] = el}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOTPChange(i, e.target.value.replace(/\D/g, ''))}
                            onKeyDown={(e) => handleOTPKeyDown(i, e)}
                            className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-lg font-extrabold border rounded-xl bg-[#10121A] text-white focus:outline-none transition-all ${
                              digit
                                ? 'border-[#FF8C00] bg-[#FF8C00]/10 shadow-md shadow-[#FF8C00]/10'
                                : 'border-[#202533] focus:border-[#FF8C00]'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-gray-500 text-xs text-center font-medium flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                        Twilio SMS OTP Security
                      </p>

                      {error && (
                        <p className="text-red-400 text-xs text-center flex items-center justify-center gap-1.5 bg-red-500/10 border border-red-500/30 p-3 rounded-xl font-medium">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading || otp.join('').length !== 6}
                        className="w-full bg-[#FF8C00] hover:bg-[#E07B00] text-black font-extrabold py-4 rounded-2xl text-base transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#FF8C00]/20"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          <>
                            Verify & Access Portal
                            <CheckCircle2 className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="text-center text-xs text-gray-500">
                        Didn't receive code?{' '}
                        {timer > 0 ? (
                          <span className="text-gray-400 font-medium">Resend in {timer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOTP}
                            className="text-[#FF8C00] font-bold hover:underline"
                          >
                            Resend OTP Now
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}

                {/* STEP 3: SUCCESS REDIRECT */}
                {step === 'success' && (
                  <div className="text-center space-y-4 py-4 animate-fade-in-up">
                    <div className="w-16 h-16 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/20">
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white">Identity Verified!</h2>
                    <p className="text-gray-400 text-xs">Redirecting to your CIVTAX AI portal...</p>
                    <div className="pt-2 flex justify-center">
                      <div className="w-6 h-6 border-2 border-[#FF8C00]/30 border-t-[#FF8C00] rounded-full animate-spin" />
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Graphic Banner Box at Bottom Right matching reference image */}
          <div className="bg-[#0A0A0C] border border-[#1E222D] rounded-[24px] p-6 text-center space-y-3 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-center gap-3 py-2">
              <div className="w-12 h-12 rounded-2xl bg-[#10121A] border border-[#202533] flex items-center justify-center text-2xl shadow">
                🏛️
              </div>
              <div className="w-12 h-12 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center text-green-400 shadow">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#10121A] border border-[#202533] flex items-center justify-center text-2xl shadow">
                🪙
              </div>
            </div>

            <p className="text-gray-300 text-xs font-semibold leading-relaxed">
              Every payment you make builds a <strong className="text-[#FF8C00]">stronger, smarter city.</strong>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
