import { Lock, RotateCcw, Shield, Truck } from 'lucide-react';

/** Legacy App.tsx trust bar (100% pure & halal / fast delivery / easy return / secure payment). */
export function TrustBadges() {
  return (
      <section className="bg-white border-t border-b border-stone-200/90 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl hover:bg-stone-50/80 transition-colors">
              <div className="w-14 h-14 rounded-full border border-amber-600/40 bg-amber-50/50 flex items-center justify-center text-amber-700 shadow-xs">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-sm tracking-wider text-stone-900 uppercase">
                100% PURE & HALAL
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed max-w-xs">
                All our attars are completely alcohol-free and prepared from pure ingredients.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl hover:bg-stone-50/80 transition-colors">
              <div className="w-14 h-14 rounded-full border border-amber-600/40 bg-amber-50/50 flex items-center justify-center text-amber-700 shadow-xs">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-sm tracking-wider text-stone-900 uppercase">
                FAST DELIVERY BANGLADESH
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed max-w-xs">
                Home delivery in 24–48 hours inside Dhaka and 3–5 days across Bangladesh.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl hover:bg-stone-50/80 transition-colors">
              <div className="w-14 h-14 rounded-full border border-amber-600/40 bg-amber-50/50 flex items-center justify-center text-amber-700 shadow-xs">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-sm tracking-wider text-stone-900 uppercase">
                EASY RETURN POLICY
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed max-w-xs">
                Easy 7–day return if you are not satisfied or receive a defective product.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl hover:bg-stone-50/80 transition-colors">
              <div className="w-14 h-14 rounded-full border border-amber-600/40 bg-amber-50/50 flex items-center justify-center text-amber-700 shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-sm tracking-wider text-stone-900 uppercase">
                SECURE PAYMENT
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed max-w-xs">
                Your payment information is 100% safe and secure with us.
              </p>
            </div>
          </div>
        </div>
      </section>
  );
}
