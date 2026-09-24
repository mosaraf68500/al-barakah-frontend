'use client';

import React, { useState } from 'react';
import { 
  X, 
  Search, 
  LogIn, 
  Phone, 
  User as UserIcon, 
  Mail, 
  MapPin, 
  ArrowRight, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { AUTH_COPY, authErrorText } from '@/lib/auth/authMessages';
import { notify } from '@/lib/ui/notify';
import { isStrongPassword } from '@/lib/validation/password';
import { isValidBdMobile, formatBdMobile } from '@/lib/validation/phone';

interface CustomerAuthModalProps {
  onOpenOrderTrack?: (trackingCode: string) => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({ onOpenOrderTrack }) => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    registerWithPhoneAndPassword,
    loginWithPhoneAndPassword,
    signInWithGoogle 
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'TRACK'>('LOGIN');
  const [phoneAuthMode, setPhoneAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  
  // Form fields
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Track order state
  const [trackingInput, setTrackingInput] = useState('');

  if (!isAuthModalOpen) return null;

  const fail = (msg: string) => {
    setErrorMsg(msg);
    notify(msg, 'error');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPhone = formatBdMobile(phone);
    if (!isValidBdMobile(cleanPhone)) {
      fail(AUTH_COPY.phone);
      return;
    }

    if (phoneAuthMode === 'REGISTER' && !isStrongPassword(pin)) {
      fail(AUTH_COPY.passwordRule);
      return;
    }
    if (phoneAuthMode === 'LOGIN' && !pin.trim()) {
      fail(AUTH_COPY.passwordRequired);
      return;
    }

    if (phoneAuthMode === 'REGISTER' && !name.trim()) {
      fail(AUTH_COPY.nameRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      if (phoneAuthMode === 'REGISTER') {
        await registerWithPhoneAndPassword(cleanPhone, name.trim(), pin.trim(), address.trim());
        notify(AUTH_COPY.registerOk);
      } else {
        await loginWithPhoneAndPassword(cleanPhone, pin.trim());
        notify(AUTH_COPY.loginOk);
      }
      closeAuthModal();
    } catch (err: any) {
      const code = err?.message as string | undefined;
      if (code === 'ACCOUNT_ALREADY_EXISTS') setPhoneAuthMode('LOGIN');
      if (code === 'ACCOUNT_NOT_FOUND') setPhoneAuthMode('REGISTER');
      fail(authErrorText(code, phoneAuthMode));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) {
      notify('অর্ডার আইডি লিখুন। যেমন AB-123456', 'error');
      return;
    }
    closeAuthModal();
    if (onOpenOrderTrack) {
      onOpenOrderTrack(trackingInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-[440px] bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        id="customer-auth-modal"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-3.5 right-3.5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors z-20 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Tabs (Exact as Screenshot 2) */}
        <div className="flex border-b border-stone-100 px-6 pt-5 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('LOGIN')}
            className={`pb-3 font-bold text-xs sm:text-[13px] tracking-wider transition-all cursor-pointer mr-6 relative uppercase ${
              activeTab === 'LOGIN'
                ? 'text-[#FF5722]'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            LOGIN / REGISTER
            {activeTab === 'LOGIN' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF5722] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TRACK')}
            className={`pb-3 font-bold text-xs sm:text-[13px] tracking-wider transition-all cursor-pointer flex items-center gap-1.5 uppercase ${
              activeTab === 'TRACK'
                ? 'text-[#FF5722]'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>TRACK ORDER</span>
            {activeTab === 'TRACK' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF5722] rounded-full" />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          {activeTab === 'LOGIN' ? (
            <div>
              {/* Center Circle Icon (Exact as Screenshot 2) */}
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5722] shadow-2xs">
                  <div className="flex items-center text-lg font-black tracking-tighter">
                    <span className="text-sm font-bold">→</span>
                    <span className="text-base font-black">]</span>
                  </div>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="text-center mb-5">
                <h2 
                  className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight font-serif"
                  style={{ fontFamily: "'Cinzel', Georgia, serif" }}
                >
                  Customer Login / Sign Up
                </h2>
                <p className="text-xs text-stone-500 mt-1 font-medium max-w-xs mx-auto leading-relaxed">
                  Fast login with phone number to track orders and save address.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form (Exact fields with Bangladesh Phone & PIN/Password support) */}
              <form onSubmit={handleSubmit} className="space-y-3.5">

                {/* Sub-tab: Login with PIN vs Register */}
                <div className="flex bg-stone-100 p-1 rounded-xl gap-1 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneAuthMode('LOGIN');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      phoneAuthMode === 'LOGIN'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#FF5722]" />
                    <span>লগইন (Login)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPhoneAuthMode('REGISTER');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      phoneAuthMode === 'REGISTER'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>নতুন রেজিস্ট্রেশন</span>
                  </button>
                </div>
                
                {/* 1. Mobile Number */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-800">
                      বাংলাদেশি মোবাইল নাম্বার (১১ ডিজিট) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      BD (+880)
                    </span>
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      maxLength={11}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/90 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-colors font-mono tracking-wider font-semibold"
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">
                    শুধুমাত্র 013, 014, 015, 016, 017, 018, 019 সাপোর্টেড
                  </p>
                </div>

                {/* 2. PIN / Password */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    পাসওয়ার্ড <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      required
                      autoComplete={phoneAuthMode === 'REGISTER' ? 'new-password' : 'current-password'}
                      maxLength={128}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="যেমন Aa1!bc"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200/90 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {phoneAuthMode === 'REGISTER' && (
                    <p className="text-[10px] text-stone-400 mt-1">{AUTH_COPY.passwordRule}</p>
                  )}
                </div>

                {/* Extra fields only for Registration */}
                {phoneAuthMode === 'REGISTER' && (
                  <>
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1.5">
                        আপনার সম্পূর্ণ নাম <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="আপনার নাম লিখুন"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/90 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Delivery Address (Optional during register) */}
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1.5">
                        ডেলিভারি ঠিকানা (ঐচ্ছিক)
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="বাসা, রোড, এলাকা..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/90 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-colors"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Orange Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md shadow-orange-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    'যাচাই করা হচ্ছে...'
                  ) : phoneAuthMode === 'LOGIN' ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>লগইন করুন</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>রেজিস্ট্রেশন সম্পন্ন করুন</span>
                    </>
                  )}
                </button>

                {/* Toggle Helper Link */}
                <div className="text-center pt-1">
                  {phoneAuthMode === 'LOGIN' ? (
                    <p className="text-xs text-stone-500">
                      অ্যাকাউন্ট নেই?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneAuthMode('REGISTER');
                          setErrorMsg('');
                        }}
                        className="text-[#FF5722] font-bold hover:underline cursor-pointer"
                      >
                        নতুন অ্যাকাউন্ট তৈরি করুন
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-stone-500">
                      ইতোমধ্যে অ্যাকাউন্ট আছে?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneAuthMode('LOGIN');
                          setErrorMsg('');
                        }}
                        className="text-[#FF5722] font-bold hover:underline cursor-pointer"
                      >
                        লগইন করুন
                      </button>
                    </p>
                  )}
                </div>

                {/* OR Divider */}
                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      OR
                    </span>
                  </div>
                </div>

                {/* SIGN IN WITH GOOGLE Button */}
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="w-full py-3 px-4 rounded-xl border border-stone-200/90 hover:bg-stone-50 active:scale-[0.99] text-stone-800 font-bold text-xs sm:text-[13px] tracking-wider uppercase flex items-center justify-center gap-3 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>SIGN IN WITH GOOGLE</span>
                </button>
              </form>
            </div>
          ) : (
            /* TRACK ORDER TAB */
            <div className="space-y-4 py-2">
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0A3828] mx-auto mb-2.5">
                  <Truck className="w-6 h-6 text-emerald-800" />
                </div>
                <h3 
                  className="text-lg font-bold text-stone-900 font-serif"
                  style={{ fontFamily: "'Cinzel', Georgia, serif" }}
                >
                  Track Your Order
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Enter your order tracking code or phone number to check live shipping status.
                </p>
              </div>

              <form onSubmit={handleTrackSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Order Tracking Code / Mobile
                  </label>
                  <input
                    type="text"
                    required
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="e.g. ALB-84920 or 017xxxxxxxx"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0A3828] hover:bg-[#072418] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Search className="w-4 h-4" />
                  <span>Check Live Status</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
