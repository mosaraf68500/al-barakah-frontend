'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  LogIn, 
  Phone, 
  MapPin, 
  Mail,
  CheckCircle2, 
  Truck, 
  Clock, 
  PackageCheck, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Order } from '@/types';
import { useAuth } from '@/providers/AuthProvider';
import { trackOrder } from '@/lib/api';
import { AUTH_COPY, authErrorText } from '@/lib/auth/authMessages';
import { notify } from '@/lib/ui/notify';
import { isStrongPassword } from '@/lib/validation/password';
import { isValidBdMobile, formatBdMobile } from '@/lib/validation/phone';
import { ContinueWithGoogle } from '@/components/account/ContinueWithGoogle';

interface AuthAndTrackViewProps {
  initialTab?: 'LOGIN' | 'TRACK';
  onClose: () => void;
  orders: Order[];
  currency: 'USD' | 'BDT';
  initialTrackingCode?: string;
  onOpenDashboard?: () => void;
  /** Shown above the form, for example when checkout sent the customer here. */
  notice?: string;
}

export const AuthAndTrackView: React.FC<AuthAndTrackViewProps> = ({
  initialTab = 'TRACK',
  onClose,
  orders,
  currency,
  initialTrackingCode = '',
  onOpenDashboard,
  notice,
}) => {
  const { 
    user, 
    profile, 
    signInWithGoogle, 
    registerWithPhoneAndPassword, 
    loginWithPhoneAndPassword, 
    logout, 
    sessionConflictMsg, 
    clearSessionConflict 
  } = useAuth();
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'TRACK'>(initialTab);
  const [phoneAuthMode, setPhoneAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Track Order State
  const [orderIdInput, setOrderIdInput] = useState(initialTrackingCode || '');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Login / Register State
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const rate = 1;
  const symbol = currency === 'BDT' ? '৳' : '$';

  useEffect(() => {
    setActiveTab(initialTab);
    if (initialTrackingCode) {
      setOrderIdInput(initialTrackingCode);
      executeTrack(initialTrackingCode);
    }
  }, [initialTab, initialTrackingCode]);

  const executeTrack = async (queryStr: string) => {
    setSearchError('');
    const query = queryStr.trim().toUpperCase();
    if (!query) {
      const msg = 'অর্ডার আইডি লিখুন। যেমন AB-123456';
      setSearchError(msg);
      notify(msg, 'error');
      return;
    }

    setIsSubmitting(true);
    // BUG_FIXES.md #1: legacy asked a stale Postgres endpoint, then only searched the admin-only order list and a
    // localStorage key nothing ever wrote, so customers could never find their order. Now: one lookup via lib/api
    // (PII masked server-side). Same UI states/messages as before.
    const found = await trackOrder(query).catch(() => null);

    setHasSearched(true);
    if (found) {
      setSearchedOrder(found);
      setSearchError('');
      notify(`অর্ডার ${found.id} পাওয়া গেছে।`);
    } else {
      setSearchedOrder(null);
      const msg = `"${queryStr}" দিয়ে কোনো অর্ডার পাওয়া যায়নি। আইডি আবার মিলিয়ে দেখুন।`;
      setSearchError(msg);
      notify(msg, 'error');
    }
    setIsSubmitting(false);
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeTrack(orderIdInput);
  };

  const failAuth = (msg: string) => {
    setAuthError(msg);
    notify(msg, 'error');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanPhone = formatBdMobile(phone);
    if (!isValidBdMobile(cleanPhone)) {
      failAuth(AUTH_COPY.phone);
      return;
    }

    if (phoneAuthMode === 'REGISTER' && !isStrongPassword(pin)) {
      failAuth(AUTH_COPY.passwordRule);
      return;
    }
    if (phoneAuthMode === 'LOGIN' && !pin.trim()) {
      failAuth(AUTH_COPY.passwordRequired);
      return;
    }

    if (phoneAuthMode === 'REGISTER' && !name.trim()) {
      failAuth(AUTH_COPY.nameRequired);
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

      if (onOpenDashboard) {
        onOpenDashboard();
      } else {
        onClose();
      }
    } catch (err: any) {
      const code = err?.message as string | undefined;
      if (code === 'ACCOUNT_ALREADY_EXISTS') setPhoneAuthMode('LOGIN');
      if (code === 'ACCOUNT_NOT_FOUND') setPhoneAuthMode('REGISTER');
      failAuth(authErrorText(code, phoneAuthMode));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepIndex = (status?: string) => {
    const s = (status || 'Pending').toLowerCase();
    if (s.includes('deliver')) return 3;
    if (s.includes('ship') || s.includes('courier')) return 2;
    if (s.includes('process') || s.includes('confirm')) return 1;
    return 0; // Placed / Pending
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#FAF8F5]/60 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-start animate-in fade-in duration-200">
      
      {/* Session Conflict Notification Banner */}
      {notice && (
        <div className="w-full max-w-[480px] mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm shadow-sm">
          <p className="leading-relaxed font-medium">{notice}</p>
        </div>
      )}

      {sessionConflictMsg && (
        <div className="w-full max-w-[480px] mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{sessionConflictMsg}</p>
          </div>
          <button
            onClick={clearSessionConflict}
            className="text-amber-700 hover:text-amber-900 font-bold text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Centered Main Box matching Screenshot */}
      <div className="w-full max-w-[480px] bg-white rounded-3xl border border-stone-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
        
        {/* Top Header Tabs */}
        <div className="grid grid-cols-2 border-b border-stone-200">
          
          {/* Tab 1: LOGIN / REGISTER */}
          <button
            onClick={() => {
              setActiveTab('LOGIN');
              setSearchError('');
              setAuthError('');
            }}
            className={`py-4 sm:py-4.5 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all relative flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'LOGIN'
                ? 'text-[#FF5722] bg-white font-extrabold'
                : 'text-stone-400 hover:text-stone-700 bg-stone-50/50'
            }`}
            id="auth-tab-login"
          >
            <span>LOGIN / REGISTER</span>
            {activeTab === 'LOGIN' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF5722] rounded-t-full" />
            )}
          </button>

          {/* Tab 2: TRACK ORDER */}
          <button
            onClick={() => {
              setActiveTab('TRACK');
              setSearchError('');
              setAuthError('');
            }}
            className={`py-4 sm:py-4.5 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all relative flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'TRACK'
                ? 'text-[#FF5722] bg-white font-extrabold'
                : 'text-stone-400 hover:text-stone-700 bg-stone-50/50'
            }`}
            id="auth-tab-track"
          >
            <Search className={`w-3.5 h-3.5 ${activeTab === 'TRACK' ? 'text-[#FF5722]' : 'text-stone-400'}`} />
            <span>TRACK ORDER</span>
            {activeTab === 'TRACK' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF5722] rounded-t-full" />
            )}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 sm:p-8">
          
          {/* TAB 1: ORDER TRACKING */}
          {activeTab === 'TRACK' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Circular Search Icon Graphic */}
              <div className="flex justify-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-50/80 border border-orange-100/90 flex items-center justify-center text-[#FF5722] shadow-2xs">
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2] text-[#FF5722]" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="text-center space-y-2">
                <h2 
                  className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight font-serif"
                  style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
                >
                  Order Tracking
                </h2>
                <p className="text-xs sm:text-[13px] text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Enter your unique Order ID to track its real-time processing and delivery status.
                </p>
              </div>

              {/* Order ID Form */}
              <form onSubmit={handleTrackSubmit} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-stone-900 mb-2">
                    Order ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="AB-123456"
                      value={orderIdInput}
                      onChange={(e) => setOrderIdInput(e.target.value)}
                      className="w-full py-3.5 px-4 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-sm placeholder:text-stone-400 placeholder:text-center text-center font-medium tracking-wide focus:outline-none focus:bg-white focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722]/30 transition-all uppercase"
                      id="track-order-input"
                    />
                  </div>
                </div>

                {searchError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                    <span>{searchError}</span>
                  </div>
                )}

                {/* Track Order Action Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 sm:py-4 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20 active:scale-98 cursor-pointer"
                  id="track-order-submit-btn"
                >
                  <Search className="w-4 h-4" />
                  <span>TRACK ORDER</span>
                </button>
              </form>

              {/* Display Searched Order Result if Found */}
              {searchedOrder && (
                <div className="mt-6 pt-6 border-t border-stone-200 space-y-4 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        Order #{searchedOrder.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase">
                        {searchedOrder.status || 'Processing'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-emerald-900 font-medium">
                      Total: {symbol}{((searchedOrder.total || 0) * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({searchedOrder.items?.length || 0} items)
                    </p>
                    
                    {/* Status Progress Timeline */}
                    <div className="grid grid-cols-4 gap-1 mt-3 pt-3 border-t border-emerald-200/60 text-center">
                      {['Placed', 'Confirmed', 'Shipped', 'Delivered'].map((step, idx) => {
                        const activeIdx = getStepIndex(searchedOrder.status);
                        const isDone = idx <= activeIdx;
                        return (
                          <div key={step} className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                              isDone ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
                            }`}>
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span className={`text-[9px] ${isDone ? 'font-bold text-emerald-900' : 'text-stone-400'}`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick sample Order IDs hint */}
              {!searchedOrder && (
                <div className="text-center pt-2">
                  <p className="text-[11px] text-stone-400">
                    Need help? Contact support or check confirmation SMS / email.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LOGIN / REGISTER */}
          {activeTab === 'LOGIN' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* If user is already logged in */}
              {user ? (
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-xl font-bold">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-stone-900">Signed In As</h3>
                    <p className="text-xs text-stone-600 font-medium">{profile?.name || user.displayName || 'Valued Customer'}</p>
                    <p className="text-[11px] text-stone-400">{user.email}</p>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    {onOpenDashboard && (
                      <button
                        onClick={onOpenDashboard}
                        className="w-full py-3 rounded-xl bg-[#0A3828] hover:bg-[#072418] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Open My Account & Orders
                      </button>
                    )}
                    <button
                      onClick={() => logout()}
                      className="w-full py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Google / Gmail Instant 1-Click Login Button */}
                  <div>
                    <ContinueWithGoogle onCredential={(idToken) => { void signInWithGoogle(idToken); }} />
                    <p className="text-[11px] text-stone-400 text-center mt-1.5">
                      🔒 জিমেইল ব্যবহারকারীদের জন্য Google অফিসিয়াল ভেরিফিকেশন প্রযোজ্য
                    </p>
                  </div>

                  {/* OR Divider */}
                  <div className="relative my-2 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-stone-200" />
                    </div>
                    <span className="relative bg-white px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      অথবা মোবাইল নাম্বার ও পাসওয়ার্ড দিয়ে লগইন করুন
                    </span>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleAuthSubmit} className="space-y-3.5 pt-1">
                    
                    {/* Sub-mode Toggle: Login vs Register */}
                    <div className="flex bg-stone-100 p-1 rounded-xl gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneAuthMode('LOGIN');
                          setAuthError('');
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
                          setAuthError('');
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

                    {/* Mobile Number */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-stone-900">
                          বাংলাদেশি মোবাইল নাম্বার (১১ সংখ্যা) <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          BD (+880)
                        </span>
                      </div>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type="tel"
                          placeholder="017XXXXXXXX"
                          maxLength={11}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full py-3 pl-10 pr-4 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722]/30 transition-all font-mono tracking-wider font-semibold"
                          required
                        />
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1">
                        শুধুমাত্র 013, 014, 015, 016, 017, 018, 019 সাপোর্টেড
                      </p>
                    </div>

                    {/* PIN / Password */}
                    <div>
                      <label className="block text-xs font-bold text-stone-900 mb-1.5">
                        পাসওয়ার্ড <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type={showPin ? 'text' : 'password'}
                          autoComplete={phoneAuthMode === 'REGISTER' ? 'new-password' : 'current-password'}
                          maxLength={128}
                          placeholder="যেমন Aa1!bc"
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          className="w-full py-3 pl-10 pr-10 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722]/30 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                        >
                          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {phoneAuthMode === 'REGISTER' && (
                        <p className="text-[10px] text-stone-400 mt-1">{AUTH_COPY.passwordRule}</p>
                      )}
                    </div>

                    {/* Registration Only Fields */}
                    {phoneAuthMode === 'REGISTER' && (
                      <>
                        {/* Full Name */}
                        <div>
                          <label className="block text-xs font-bold text-stone-900 mb-1.5">
                            আপনার সম্পূর্ণ নাম <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                            <input
                              type="text"
                              placeholder="আপনার নাম লিখুন"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full py-3 pl-10 pr-4 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722]/30 transition-all font-medium"
                              required
                            />
                          </div>
                        </div>

                        {/* Delivery Address */}
                        <div>
                          <label className="block text-xs font-bold text-stone-900 mb-1.5">
                            ডেলিভারি ঠিকানা (ঐচ্ছিক)
                          </label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                            <input
                              type="text"
                              placeholder="বাসা, রোড, এলাকা, জেলা..."
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              className="w-full py-3 pl-10 pr-4 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722]/30 transition-all font-medium"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {authError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 sm:py-4 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20 active:scale-98 cursor-pointer mt-2"
                      id="auth-submit-btn"
                    >
                      {isSubmitting ? (
                        <span>যাচাই করা হচ্ছে...</span>
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
                              setAuthError('');
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
                              setAuthError('');
                            }}
                            className="text-[#FF5722] font-bold hover:underline cursor-pointer"
                          >
                            লগইন করুন
                          </button>
                        </p>
                      )}
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Bottom return to shop button */}
      <div className="mt-8 text-center">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Store</span>
        </button>
      </div>

    </div>
  );
};

