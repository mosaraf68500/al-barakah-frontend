'use client';

import React from 'react';
import { X, ShieldCheck, FileText, AlertCircle, Mail, CheckCircle2 } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'return' | 'terms';
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-stone-950 w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-800 overflow-hidden text-stone-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-800/90 flex items-center justify-between bg-stone-900/50">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              Privacy & Return Policy
            </h2>
            <p className="text-[11px] text-stone-400 mt-1 font-medium">
              Last Updated: July 11, 2026
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Policy Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs leading-relaxed scrollbar-thin scrollbar-thumb-stone-800">
          {/* Welcome Text */}
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Welcome to <strong className="text-amber-400">Al Barakah Premium</strong>. We are deeply committed to protecting your personal information and ensuring full transparency. By using our website and services, you consent to the terms outlined in this policy.
          </p>

          {/* Section 1 */}
          <div className="space-y-2.5">
            <h3 className="font-serif font-bold text-xs sm:text-sm text-amber-400 uppercase tracking-wider">
              1. INFORMATION WE COLLECT
            </h3>
            <p className="text-stone-300">
              To complete orders and provide a personalized experience, we collect:
            </p>
            <ul className="space-y-1.5 pl-2 text-stone-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>Your Name & Contact Number</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>Detailed Shipping Address</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>Email address & Payment transaction details (if online method is used)</span>
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2.5">
            <h3 className="font-serif font-bold text-xs sm:text-sm text-amber-400 uppercase tracking-wider">
              2. HOW WE USE YOUR INFORMATION
            </h3>
            <p className="text-stone-300">
              Your gathered information is strictly utilized to:
            </p>
            <ul className="space-y-1.5 pl-2 text-stone-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>Process and fulfill your orders.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>Communicate and contact you for order verification.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>Enhance our system layouts or provide dynamic discount updates.</span>
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-2.5">
            <h3 className="font-serif font-bold text-xs sm:text-sm text-amber-400 uppercase tracking-wider">
              3. SECURITY AND THIRD-PARTY SHARING
            </h3>
            <p className="text-stone-300 leading-relaxed">
              Al Barakah Premium enforces a strict zero-sharing protocol. We do not sell or trade your data. Customer information is accessible only to authorized personnel and shipping courier partners solely to carry out delivery.
            </p>
          </div>

          {/* Section 4 - Special Highlight Box for Return & Exchange */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-xs sm:text-sm text-amber-400 uppercase tracking-wider">
              4. RETURN & EXCHANGE POLICY
            </h3>
            
            <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 space-y-2">
              <div className="font-bold text-stone-100 text-xs sm:text-sm">
                Important Notice Regarding Delivery Charges:
              </div>
              <p className="text-stone-300 text-xs leading-relaxed">
                If you wish to return or cancel an order at the time of delivery, the customer must pay the applicable delivery charge (inside or outside Dhaka).
              </p>
            </div>
          </div>

          {/* Footer Contact Note */}
          <div className="pt-4 border-t border-stone-800/80 text-center">
            <p className="text-[11px] text-stone-400">
              For further queries regarding your personal records, please email:{' '}
              <a href="mailto:info@albarakahpremium.com" className="text-amber-400 hover:underline">
                info@albarakahpremium.com
              </a>
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-900/60 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Close Policy
          </button>
        </div>
      </div>
    </div>
  );
};
