'use client';

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface FloatingWhatsAppButtonProps {
  phoneNumber?: string; // e.g. "01316534171" or "8801316534171"
  shopName?: string;
  defaultMessage?: string;
}

export const FloatingWhatsAppButton: React.FC<FloatingWhatsAppButtonProps> = ({
  phoneNumber = '01316534171',
  shopName = 'Al Barakah Premium',
  defaultMessage = 'আসসালামু আলাইকুম! আল বারাকাহ প্রিমিয়াম শপ সম্পর্কে এবং প্রোডাক্ট অর্ডার সম্পর্কে বিস্তারিত জানতে চাচ্ছি।',
}) => {
  const [showTooltip, setShowTooltip] = useState(true);

  // Normalize BD phone number for WhatsApp international format (e.g. 8801316534171)
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('880')
    ? cleanPhone
    : cleanPhone.startsWith('0')
    ? `88${cleanPhone}`
    : `880${cleanPhone}`;

  const encodedMessage = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

  return (
    <div
      id="floating-whatsapp-widget"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-45 flex items-end flex-col gap-2 pointer-events-auto select-none"
    >
      {/* Speech Bubble / Tooltip Notice */}
      {showTooltip && (
        <div
          id="whatsapp-chat-bubble"
          className="relative max-w-[210px] sm:max-w-[240px] bg-white text-stone-800 text-xs px-3.5 py-2.5 rounded-2xl shadow-xl border border-stone-200/90 animate-bounce duration-1000 flex items-start justify-between gap-2"
        >
          <div>
            <p className="font-bold text-[#075E54] text-[11px] sm:text-xs">
              সরাসরি চ্যাট বা অর্ডার করুন
            </p>
            <p className="text-[10px] sm:text-[11px] text-stone-600 leading-tight mt-0.5">
              WhatsApp এ আমাদের সাথে কথা বলুন
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-stone-400 hover:text-stone-700 transition-colors p-0.5 rounded-full"
            title="Close hint"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {/* Bubble Pointer Arrow */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-stone-200/90 rotate-45" />
        </div>
      )}

      {/* Floating Action Button */}
      <a
        id="whatsapp-direct-chat-btn"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-[0_4px_20px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_26px_rgba(37,211,102,0.6)] transition-all duration-300 transform hover:scale-108 active:scale-95"
        title="WhatsApp এ সরাসরি চ্যাট করুন"
      >
        {/* Glowing Ripple Ring */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-35 animate-ping duration-1000 -z-10" />

        {/* WhatsApp Vector Icon */}
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          stroke="currentColor"
          strokeWidth="0"
          fill="currentColor"
          className="text-white drop-shadow-xs"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.968.545 1.931.847 2.791.847h.002c3.18 0 5.767-2.586 5.768-5.766.001-3.182-2.585-5.768-5.77-5.768zm0 10.455h-.002c-.822 0-1.63-.222-2.336-.642l-.167-.099-1.737.456.464-1.693-.109-.173c-.463-.736-.708-1.59-.707-2.535.001-2.474 2.013-4.486 4.488-4.486 2.474 0 4.486 2.012 4.487 4.486 0 2.475-2.013 4.486-4.488 4.486zm3.177-3.376c-.174-.087-1.031-.509-1.19-.567-.159-.058-.275-.087-.391.087-.116.174-.45 0.567-.552.683-.101.116-.203.13-.377.043-.174-.087-.735-.271-1.401-.865-.518-.462-.868-1.033-.97-1.207-.101-.174-.011-.268.076-.354.078-.078.174-.203.261-.305.087-.101.116-.174.174-.29.058-.116.029-.217-.014-.305-.043-.087-.391-.942-.536-1.29-.141-.339-.285-.293-.391-.298l-.334-.006c-.116 0-.305.043-.464.217-.159.174-.609.595-.609 1.45s.623 1.682.71 1.798c.087.116 1.226 1.872 2.97 2.625.415.179.739.286.992.367.417.133.796.114 1.096.069.335-.05 1.031-.422 1.176-.828.145-.406.145-.754.101-.828-.043-.072-.159-.116-.333-.203z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.982-1.396C8.423 21.493 10.155 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.5a8.47 8.47 0 01-4.328-1.183l-.31-.184-3.21.899.855-3.123-.202-.321A8.468 8.468 0 013.5 12c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5-3.806 8.5-8.5 8.5z"
          />
        </svg>
      </a>
    </div>
  );
};
