'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Facebook, Mail, MapPin, Phone, Sparkles, Truck } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';

export function Footer() {
  const router = useRouter();
  const setPolicyOpen = useUiStore((s) => s.setPolicyOpen);
  const setSearchQuery = useUiStore((s) => s.setSearchQuery);

  const goHome = () => {
    setSearchQuery('');
    router.push('/');
  };

  return (
      <footer className="bg-stone-900 text-stone-300 text-xs border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Col 1: Brand Info */}
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 font-bold shadow-md">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-stone-100 tracking-wider font-serif block" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
                      AL BARAKAH
                    </span>
                    <span className="text-[9px] tracking-[0.22em] text-amber-400 font-semibold uppercase block">
                      PREMIUM
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <p className="text-amber-400 font-bold text-xs tracking-wide">
                    “বরকতের সাথে বিশুদ্ধতা”
                  </p>
                  <p className="text-stone-400 text-[11px] italic">
                    • Purity with Blessing •
                  </p>
                </div>
              </div>

              <p className="text-stone-400 text-xs leading-relaxed">
                Al Barakah Premium is a luxury Islamic brand based in Bangladesh, offering high-end alcohol-free attars and authentic products.
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-xs text-amber-400 tracking-wider uppercase border-b border-stone-800 pb-1.5">
                QUICK LINKS
              </h4>
              <ul className="space-y-1.5 text-stone-300">
                <li>
                  <button 
                    onClick={() => {
                      // BUG_FIXES.md #2: legacy set an unknown 'HOME' view (blank page). Intended behaviour: go home, reset filters.
                      goHome();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="flex items-center gap-1.5 hover:text-amber-300 cursor-pointer transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 text-amber-500/80" />
                    <span>Home</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      goHome();
                      setTimeout(() => {
                        const catSec = document.getElementById('catalog-section');
                        if (catSec) catSec.scrollIntoView({ behavior: 'smooth' });
                      }, 50);
                    }} 
                    className="flex items-center gap-1.5 hover:text-amber-300 cursor-pointer transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 text-amber-500/80" />
                    <span>Shop All Products</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      const aboutSec = document.getElementById('catalog-section');
                      if (aboutSec) aboutSec.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    className="flex items-center gap-1.5 hover:text-amber-300 cursor-pointer transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 text-amber-500/80" />
                    <span>About Us</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      const footerSec = document.querySelector('footer');
                      if (footerSec) footerSec.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    className="flex items-center gap-1.5 hover:text-amber-300 cursor-pointer transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 text-amber-500/80" />
                    <span>Contact Us</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setPolicyOpen(true)} 
                    className="flex items-center gap-1.5 hover:text-amber-300 cursor-pointer transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 text-amber-500/80" />
                    <span>Privacy & Return Policy</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setPolicyOpen(true)} 
                    className="flex items-center gap-1.5 hover:text-amber-300 cursor-pointer transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 text-amber-500/80" />
                    <span>Terms & Conditions</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => router.push('/track')} 
                    className="flex items-center gap-1.5 hover:text-amber-300 cursor-pointer transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 text-amber-500/80" />
                    <span>Track Order</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Contact Info */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-xs text-amber-400 tracking-wider uppercase border-b border-stone-800 pb-1.5">
                CONTACT INFO
              </h4>
              <ul className="space-y-2.5 text-stone-300">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Tongi BSCIC, Gazipur, Bangladesh.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href="tel:01316534171" className="hover:text-amber-300 font-medium transition-colors">
                    01316534171
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href="mailto:info@albarakahpremium.com" className="hover:text-amber-300 transition-colors">
                    info@albarakahpremium.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-amber-400 shrink-0" />
                  <a 
                    href="https://www.facebook.com/share/19EEJXoVg1/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-amber-300 font-semibold transition-colors underline decoration-amber-500/50 underline-offset-2"
                  >
                    Al Barakah Premium
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Payment Gateways */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-xs text-amber-400 tracking-wider uppercase border-b border-stone-800 pb-1.5">
                PAYMENT GATEWAYS
              </h4>
              <p className="text-stone-400 text-xs mt-2 mb-2.5 leading-relaxed">
                We support trusted local payment methods in Bangladesh:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {/* Premium Styled COD Badge */}
                <div className="bg-stone-800/90 border border-stone-700/90 rounded-lg px-3 py-2 flex items-center gap-2 shadow-xs hover:border-amber-500/50 transition-colors">
                  <div className="w-6 h-6 rounded bg-emerald-950/80 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black tracking-tight text-stone-100 uppercase leading-none">
                      Cash On Delivery
                    </div>
                    <div className="text-[9px] text-stone-400 font-medium">হাতে পেয়ে মূল্য পরিশোধ</div>
                  </div>
                </div>

                {/* Premium Styled bKash Badge */}
                <div className="bg-stone-800/90 border border-stone-700/90 rounded-lg px-3 py-2 flex items-center gap-2 shadow-xs hover:border-pink-500/50 transition-colors">
                  <div className="w-6 h-6 rounded bg-[#E2136E]/10 border border-[#E2136E]/40 flex items-center justify-center text-[#E2136E] font-black text-xs">
                    ৳
                  </div>
                  <div>
                    <div className="text-[11px] font-black tracking-tight text-white leading-none flex items-center gap-1">
                      <span className="text-[#ff2e8c]">bKash</span>
                      <span className="text-stone-300 font-bold text-[10px]">বিকাশ</span>
                    </div>
                    <div className="text-[9px] text-stone-400 font-medium">Instant Direct Payment</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar - 3 Columns (Left, Center, Right) */}
          <div className="pt-6 mt-6 border-t border-stone-800/90 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-stone-400">
            {/* Left */}
            <div className="text-center md:text-left">
              © 2026 <strong className="text-amber-400 font-semibold">AL BARAKAH PREMIUM</strong>. All Rights Reserved.
            </div>

            {/* Center */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-stone-300">
              <button 
                onClick={() => setPolicyOpen(true)} 
                className="hover:text-amber-400 cursor-pointer transition-colors"
              >
                Privacy Policy
              </button>
              <span className="text-stone-700">|</span>
              <button 
                onClick={() => setPolicyOpen(true)} 
                className="hover:text-amber-400 cursor-pointer transition-colors"
              >
                Return Policy
              </button>
              <span className="text-stone-700">|</span>
              <button 
                onClick={() => setPolicyOpen(true)} 
                className="hover:text-amber-400 cursor-pointer transition-colors"
              >
                Terms & Conditions
              </button>
            </div>

            {/* Right */}
            <div className="text-center md:text-right">
              Developed by <strong className="text-amber-400 font-semibold">AL BARAKAH PREMIUM</strong>
            </div>
          </div>
        </div>
      </footer>
  );
}
