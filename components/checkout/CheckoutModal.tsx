'use client';

import React, { useState, useEffect } from 'react';
import { SafeImage } from '@/components/shared/SafeImage';
import { 
  X, 
  CheckCircle, 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  Clock,
  Copy,
  Check,
  Smartphone,
  Zap,
  CreditCard
} from 'lucide-react';
import { CartItem, Order, DeliveryConfig, DEFAULT_DELIVERY_CONFIG, BKashPaymentConfig, DEFAULT_BKASH_CONFIG } from '@/types';
import { TakaIcon } from '@/components/shared/TakaIcon';
import { notify } from '@/lib/ui/notify';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal?: number;
  discount?: number;
  total?: number;
  discountPercent?: number;
  promoCode?: string;
  currency?: 'USD' | 'BDT';
  onOrderPlaced?: (orderDetails: Order) => void | Promise<Order | void>;
  onOrderComplete?: (orderDetails: any) => void;
  currentUser?: any;
  deliveryConfig?: DeliveryConfig;
  bkashConfig?: BKashPaymentConfig;
  enableCoupons?: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items = [],
  subtotal,
  discount,
  total,
  discountPercent = 0,
  promoCode = '',
  currency = 'BDT',
  onOrderPlaced,
  onOrderComplete,
  currentUser,
  deliveryConfig = DEFAULT_DELIVERY_CONFIG,
  bkashConfig = DEFAULT_BKASH_CONFIG,
  enableCoupons = false,
}) => {
  const [selectedZone, setSelectedZone] = useState<'inside' | 'outside'>('inside');
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    phone: currentUser?.phone ? currentUser.phone.replace('+880', '') : '',
    address: currentUser?.address || '',
    cityDistrict: 'Inside Dhaka',
    orderNotes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'ADVANCE_DELIVERY' | 'FULL_BKASH' | 'FULL_COD'>('ADVANCE_DELIVERY');
  const [senderBkashNumber, setSenderBkashNumber] = useState('');
  const [bkashTrxId, setBkashTrxId] = useState('');
  const [copiedBkashNumber, setCopiedBkashNumber] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Safely compute subtotal & discount if not directly provided
  const computedSubtotal = items.reduce((sum, item) => {
    const itemPrice = item.customPrice ?? item.product?.price ?? 0;
    return sum + itemPrice * (item.quantity || 1);
  }, 0);

  const activeSubtotal = subtotal !== undefined ? subtotal : computedSubtotal;
  const effectiveDiscountPercent = enableCoupons ? (discountPercent || 0) : 0;
  const activeDiscount = enableCoupons 
    ? (discount !== undefined ? discount : (activeSubtotal * effectiveDiscountPercent))
    : 0;
  const netProductTotal = Math.max(0, activeSubtotal - activeDiscount);

  // Dynamic delivery charge calculation
  const isFreeDeliveryQualified = Boolean(
    deliveryConfig.enableFreeDelivery &&
    deliveryConfig.freeDeliveryThreshold > 0 &&
    netProductTotal >= deliveryConfig.freeDeliveryThreshold
  );

  const getBaseZoneCharge = (zone: 'inside' | 'outside') => {
    if (zone === 'inside') return deliveryConfig.insideDhakaCharge ?? 80;
    return deliveryConfig.outsideDhakaCharge ?? 160;
  };

  const deliveryCharge = isFreeDeliveryQualified ? 0 : getBaseZoneCharge(selectedZone);
  const grandTotal = netProductTotal + deliveryCharge;

  // Calculate Advance Amount and Due Balance on Delivery
  const isAdvanceDeliveryMode = paymentMethod === 'ADVANCE_DELIVERY';
  const isFullBkashMode = paymentMethod === 'FULL_BKASH';
  const isFullCodMode = paymentMethod === 'FULL_COD';

  const advancePayableAmount = isFullBkashMode 
    ? grandTotal 
    : isAdvanceDeliveryMode 
    ? deliveryCharge 
    : 0;

  const duePayableOnDelivery = isFullBkashMode 
    ? 0 
    : isAdvanceDeliveryMode 
    ? netProductTotal 
    : grandTotal;

  // Sync user details if provided
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: currentUser.name || prev.fullName,
        phone: currentUser.phone ? currentUser.phone.replace('+880', '') : prev.phone,
        address: currentUser.address || prev.address,
      }));
    }
  }, [currentUser]);

  // Lock background body scroll completely when checkout modal is open
  useEffect(() => {
    if (isOpen) {
      setOrderSuccess(null);
      setErrorMessage('');
      setIsSubmitting(false);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    setOrderSuccess(null);
    setErrorMessage('');
    setIsSubmitting(false);
    onClose();
  };

  const handleDeliverySelect = (type: 'inside' | 'outside') => {
    setSelectedZone(type);
    if (type === 'inside') {
      setFormData((prev) => ({ ...prev, cityDistrict: 'Inside Dhaka' }));
    } else {
      setFormData((prev) => ({ ...prev, cityDistrict: 'Outside Dhaka' }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const reject = (msg: string) => {
      setErrorMessage(msg);
      notify(msg, 'error');
    };

    if (!formData.fullName.trim()) {
      reject('সম্পূর্ণ নাম লিখুন।');
      return;
    }

    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      reject('সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন।');
      return;
    }

    if (!formData.address.trim()) {
      reject('ডেলিভারির সম্পূর্ণ ঠিকানা লিখুন।');
      return;
    }

    if (deliveryConfig.requireAdvanceDeliveryCharge && paymentMethod === 'FULL_COD') {
      reject('ডেলিভারি চার্জ আগে পরিশোধ করতে হবে। বিকাশ অপশন সিলেক্ট করুন।');
      return;
    }

    if (paymentMethod === 'ADVANCE_DELIVERY' || paymentMethod === 'FULL_BKASH') {
      if (!bkashTrxId.trim()) {
        reject(
          paymentMethod === 'ADVANCE_DELIVERY'
            ? `ডেলিভারি চার্জ (৳${deliveryCharge}) বিকাশে পাঠিয়ে TrxID দিন।`
            : `সম্পূর্ণ বিল (৳${grandTotal.toLocaleString()}) বিকাশে পাঠিয়ে TrxID দিন।`
        );
        return;
      }
    }

    setIsSubmitting(true);

    const generatedOrderId = `AB-${Math.floor(100000 + Math.random() * 900000)}`;
    const fullPhone = cleanPhone.startsWith('880') ? `+${cleanPhone}` : `+880${cleanPhone.replace(/^0/, '')}`;
    const userAccEmail = currentUser?.email || `${cleanPhone}@albarakah.store`;

    const advanceType: 'DELIVERY_ONLY' | 'FULL_PAYMENT' | 'NONE' = 
      paymentMethod === 'ADVANCE_DELIVERY' ? 'DELIVERY_ONLY' : 
      paymentMethod === 'FULL_BKASH' ? 'FULL_PAYMENT' : 'NONE';

    const deliveryStatus: Order['deliveryPaymentStatus'] = 
      paymentMethod === 'ADVANCE_DELIVERY' ? (bkashTrxId ? 'ADVANCE_PAID' : 'ADVANCE_PENDING') :
      paymentMethod === 'FULL_BKASH' ? 'FULL_PAID' : 'COD_PENDING';

    const orderPayload: Order = {
      id: generatedOrderId,
      items: items.map((item) => ({
        id: item.product.id,
        productId: item.product.id,
        name: item.product.name,
        image: item.product.image || '',
        price: item.customPrice ?? item.product.price ?? 0,
        quantity: item.quantity,
        selectedSize: item.selectedSize || item.product.weight || '',
        selectedColor: item.selectedColor || '',
      })),
      subtotal: activeSubtotal,
      discount: activeDiscount,
      shipping: deliveryCharge,
      total: grandTotal,
      currency: (currency as 'USD' | 'BDT') || 'BDT',
      status: 'pending',
      notes: formData.orderNotes || '',
      senderBkashNumber: (paymentMethod === 'ADVANCE_DELIVERY' || paymentMethod === 'FULL_BKASH') ? (senderBkashNumber || '') : '',
      bkashTrxId: (paymentMethod === 'ADVANCE_DELIVERY' || paymentMethod === 'FULL_BKASH') ? (bkashTrxId || '') : '',
      advancePaymentType: advanceType,
      advanceAmount: advancePayableAmount,
      dueAmountOnDelivery: duePayableOnDelivery,
      deliveryPaymentStatus: deliveryStatus,
      userId: currentUser?.id || undefined,
      customerEmail: userAccEmail.toLowerCase(),
      customerPhone: fullPhone,
      customer: {
        fullName: formData.fullName,
        email: userAccEmail.toLowerCase(),
        phone: fullPhone,
        address: formData.address,
        city: formData.cityDistrict,
        postalCode: '',
        paymentMethod: paymentMethod === 'ADVANCE_DELIVERY'
          ? `Advance Delivery Paid ৳${deliveryCharge} (Due COD ৳${netProductTotal.toLocaleString()})`
          : paymentMethod === 'FULL_BKASH'
          ? `Full bKash Paid ৳${grandTotal.toLocaleString()}`
          : 'Cash on Delivery (Full COD)',
      },
      createdAt: new Date().toISOString(),
    };

    try {
      const saved = (await onOrderPlaced?.(orderPayload)) || orderPayload;
      setOrderSuccess(saved);
      if (onOrderComplete) onOrderComplete(saved);
    } catch (err) {
      console.error(err);
      reject('অর্ডার সেভ হয়নি। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-full min-h-screen bg-stone-50 overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col">
      {/* 100% FULL SCREEN HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <button
          type="button"
          onClick={handleCloseModal}
          className="flex items-center gap-2 text-stone-700 hover:text-stone-950 font-bold text-xs sm:text-sm bg-stone-100 hover:bg-stone-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            100% Secure Checkout
          </span>
          <button
            type="button"
            onClick={handleCloseModal}
            className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* FULL SCREEN BODY */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {orderSuccess ? (
          /* Order Success State */
          <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 max-w-xl mx-auto text-center space-y-6 shadow-sm">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                Thank You! Order Confirmed
              </h2>
              <p className="text-sm sm:text-base text-stone-600">
                Your order code is <strong className="text-amber-700 font-mono text-lg font-bold">#{orderSuccess.id}</strong>. Our customer representative will contact you shortly to verify your delivery.
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-left space-y-3 text-xs sm:text-sm text-stone-700">
              <div className="flex justify-between">
                <span className="text-stone-500">Customer Name:</span>
                <span className="font-bold text-stone-900">{orderSuccess.customer.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Phone:</span>
                <span className="font-bold text-stone-900">{orderSuccess.customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Address:</span>
                <span className="font-medium text-stone-800">{orderSuccess.customer.address}</span>
              </div>

              {/* Payment Details */}
              <div className="pt-2 border-t border-stone-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">পেমেন্ট মোড:</span>
                  <span className="font-bold text-emerald-800">{orderSuccess.customer.paymentMethod}</span>
                </div>

                {orderSuccess.bkashTrxId && (
                  <div className="flex justify-between bg-pink-50 p-2.5 rounded-xl border border-pink-200 text-xs">
                    <span className="text-pink-900 font-bold">bKash TrxID:</span>
                    <span className="font-mono font-black text-[#e2136e]">{orderSuccess.bkashTrxId}</span>
                  </div>
                )}
                {orderSuccess.senderBkashNumber && (
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Sender bKash:</span>
                    <span className="font-mono font-semibold">{orderSuccess.senderBkashNumber}</span>
                  </div>
                )}
              </div>

              {/* Amount Split Breakdown */}
              <div className="pt-2 border-t border-stone-200 space-y-1.5">
                <div className="flex justify-between font-bold text-stone-900">
                  <span>মোট বিল:</span>
                  <span className="text-amber-700">৳{(orderSuccess.total ?? 0).toLocaleString()}</span>
                </div>
                {orderSuccess.advanceAmount !== undefined && orderSuccess.advanceAmount > 0 && (
                  <div className="flex justify-between text-xs text-[#e2136e] font-bold">
                    <span>বিকাশে অগ্রিম প্রদেয়:</span>
                    <span>৳{orderSuccess.advanceAmount.toLocaleString()}</span>
                  </div>
                )}
                {orderSuccess.dueAmountOnDelivery !== undefined && (
                  <div className="flex justify-between text-xs text-[#0a5c36] font-bold">
                    <span>পণ্য প্রাপ্তির সময় ক্যাশ অন ডেলিভারি:</span>
                    <span>৳{orderSuccess.dueAmountOnDelivery.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-md transition-all cursor-pointer text-sm sm:text-base"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Checkout Form & Order Summary Grid */
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm p-5 sm:p-8 lg:p-10">
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* LEFT COLUMN: Customer & Delivery Details (7 Cols on lg) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Customer Information */}
                <div className="bg-stone-50/70 p-5 sm:p-6 rounded-3xl border border-stone-200 space-y-4">
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                    1. Customer Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-stone-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="আপনার পূর্ণ নাম লিখুন"
                          className="w-full pl-10 pr-3 py-3 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-stone-900"
                        />
                        <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-stone-700 mb-1.5">
                        Mobile Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-stone-300 bg-stone-100 text-stone-600 text-xs sm:text-sm font-bold font-mono">
                          +880
                        </span>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                          placeholder="1XXXXXXXXX"
                          className="w-full px-3 py-3 bg-white border border-stone-300 rounded-r-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-stone-900 font-mono"
                          maxLength={11}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Complete Address */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-stone-700 mb-1.5">
                      Complete Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        required
                        rows={2}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="বাসা/রোড, এলাকা, থানা ও জেলা লিখুন..."
                        className="w-full p-3.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-stone-900 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Delivery Area Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                      Select Delivery Zone:
                    </label>
                    {isFreeDeliveryQualified && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 border border-emerald-300 animate-pulse">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        Free Delivery Unlocked!
                      </span>
                    )}
                  </div>

                  <div className={`grid grid-cols-1 ${deliveryConfig.enableSubDhaka ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
                    {/* Inside Dhaka */}
                    <div
                      onClick={() => handleDeliverySelect('inside')}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        selectedZone === 'inside'
                          ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs sm:text-sm font-bold text-stone-900">Inside Dhaka</p>
                        <p className="text-xs text-amber-700 font-semibold">
                          {isFreeDeliveryQualified ? (
                            <span className="text-emerald-600 font-bold">FREE (৳০)</span>
                          ) : (
                            `৳${deliveryConfig.insideDhakaCharge ?? 80} Delivery Charge`
                          )}
                        </p>
                        {deliveryConfig.estimatedInsideDhakaDays && (
                          <p className="text-[10px] text-stone-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {deliveryConfig.estimatedInsideDhakaDays}
                          </p>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedZone === 'inside' ? 'border-amber-600 bg-amber-600' : 'border-stone-300'
                      }`}>
                        {selectedZone === 'inside' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>


                    {/* Outside Dhaka */}
                    <div
                      onClick={() => handleDeliverySelect('outside')}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        selectedZone === 'outside'
                          ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs sm:text-sm font-bold text-stone-900">Outside Dhaka</p>
                        <p className="text-xs text-amber-700 font-semibold">
                          {isFreeDeliveryQualified ? (
                            <span className="text-emerald-600 font-bold">FREE (৳০)</span>
                          ) : (
                            `৳${deliveryConfig.outsideDhakaCharge ?? 160} Delivery Charge`
                          )}
                        </p>
                        {deliveryConfig.estimatedOutsideDhakaDays && (
                          <p className="text-[10px] text-stone-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {deliveryConfig.estimatedOutsideDhakaDays}
                          </p>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedZone === 'outside' ? 'border-amber-600 bg-amber-600' : 'border-stone-300'
                      }`}>
                        {selectedZone === 'outside' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>

                  {deliveryConfig.deliveryNotice && (
                    <p className="text-[11px] text-stone-500 bg-stone-100/80 px-3 py-2 rounded-xl flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#0a5c36] shrink-0" />
                      <span>{deliveryConfig.deliveryNotice}</span>
                    </p>
                  )}
                </div>

                {/* 3. Payment Methods with Advance Delivery Charge Option */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs sm:text-sm font-bold text-stone-900">
                      পেমেন্ট পদ্ধতি নির্বাচন করুন (Select Payment Method):
                    </label>
                    <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      🔒 নিরাপদ ও বিশ্বস্ত ডেলিভারি
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Option 1: Advance Delivery Charge Only (Recommended) */}
                    <div
                      onClick={() => setPaymentMethod('ADVANCE_DELIVERY')}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        paymentMethod === 'ADVANCE_DELIVERY'
                          ? 'border-[#0a5c36] bg-emerald-50/60 shadow-xs ring-2 ring-emerald-500/20'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-100 text-[#0a5c36] flex items-center justify-center shrink-0 font-bold">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs sm:text-sm font-bold text-stone-900">
                              ক্যাশ অন ডেলিভারি (অগ্রিম ডেলিভারি চার্জ)
                            </p>
                            <span className="px-2 py-0.5 rounded-full bg-[#0a5c36] text-white text-[10px] font-extrabold">
                              সুপারিশকৃত
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 font-medium mt-0.5">
                            বিকাশে অগ্রিম প্রদেয়: <strong className="text-[#e2136e] font-bold">৳{deliveryCharge}</strong> | বাকি <strong className="text-stone-900 font-bold">৳{netProductTotal.toLocaleString()}</strong> পণ্য পেয়ে পরিশোধ করবেন
                          </p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === 'ADVANCE_DELIVERY' ? 'border-[#0a5c36] bg-[#0a5c36]' : 'border-stone-300'
                      }`}>
                        {paymentMethod === 'ADVANCE_DELIVERY' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>

                    {/* Option 2: Full Payment via bKash */}
                    <div
                      onClick={() => setPaymentMethod('FULL_BKASH')}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        paymentMethod === 'FULL_BKASH'
                          ? 'border-[#e2136e] bg-pink-50/60 shadow-xs ring-2 ring-pink-500/20'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#e2136e]/10 text-[#e2136e] flex items-center justify-center shrink-0 font-bold text-xl font-serif">
                          ৳
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs sm:text-sm font-bold text-stone-900">
                              সম্পূর্ণ পেমেন্ট বিকাশ (Full bKash Payment)
                            </p>
                            <span className="px-2 py-0.5 rounded-full bg-pink-100 text-[#e2136e] border border-pink-200 text-[10px] font-extrabold">
                              ফুল পেইড
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 font-medium mt-0.5">
                            বিকাশে মোট প্রদেয়: <strong className="text-[#e2136e] font-bold">৳{grandTotal.toLocaleString()}</strong> | পার্সেল গ্রহণের সময় ৳০ প্রদেয়
                          </p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === 'FULL_BKASH' ? 'border-[#e2136e] bg-[#e2136e]' : 'border-stone-300'
                      }`}>
                        {paymentMethod === 'FULL_BKASH' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>

                    {/* Option 3: Full Cash on Delivery (Without Advance) */}
                    {deliveryConfig.requireAdvanceDeliveryCharge ? (
                      <div
                        className="p-3.5 sm:p-4 rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 opacity-85 flex items-center justify-between gap-3 cursor-not-allowed"
                        title="ফেক অর্ডার প্রতিরোধে সম্পূর্ণ ক্যাশ অন ডেলিভারি বন্ধ রাখা হয়েছে"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-stone-200 text-stone-400 flex items-center justify-center shrink-0 font-bold">
                            <Truck className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs sm:text-sm font-bold text-stone-500 line-through">
                                সম্পূর্ণ ক্যাশ অন ডেলিভারি (Full COD)
                              </p>
                              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-extrabold">
                                ফেক অর্ডার রোধে বন্ধ
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              ফেক অর্ডার প্রতিরোধে শুধুমাত্র ডেলিভারি চার্জ অগ্রিম নিয়ে অর্ডার নিশ্চিত করা হচ্ছে।
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-stone-400 font-bold px-2 py-1 bg-stone-100 rounded-lg shrink-0">
                          লক করা
                        </span>
                      </div>
                    ) : (
                      <div
                        onClick={() => setPaymentMethod('FULL_COD')}
                        className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          paymentMethod === 'FULL_COD'
                            ? 'border-stone-600 bg-stone-100 shadow-xs ring-2 ring-stone-400/20'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0 font-bold">
                            <Truck className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-stone-900">
                              সম্পূর্ণ ক্যাশ অন ডেলিভারি (Full COD)
                            </p>
                            <p className="text-xs text-stone-500 mt-0.5">
                              পণ্য হাতে পেয়ে সম্পূর্ণ বিল <strong className="text-stone-900 font-bold">৳{grandTotal.toLocaleString()}</strong> ডেলিভারিম্যানকে পরিশোধ করুন
                            </p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          paymentMethod === 'FULL_COD' ? 'border-stone-700 bg-stone-700' : 'border-stone-300'
                        }`}>
                          {paymentMethod === 'FULL_COD' && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* bKash Payment Details Section for Advance or Full bKash */}
                  {(paymentMethod === 'ADVANCE_DELIVERY' || paymentMethod === 'FULL_BKASH') && (
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-50/90 to-amber-50/40 border-2 border-pink-200 space-y-4 animate-in fade-in zoom-in-95 duration-200 shadow-2xs">
                      
                      {/* Amount to Pay Callout */}
                      <div className="p-3.5 rounded-xl bg-white border border-pink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-stone-600">
                            {paymentMethod === 'ADVANCE_DELIVERY' 
                              ? 'বিকাশে অগ্রিম প্রদেয় ডেলিভারি চার্জ:' 
                              : 'বিকাশে সম্পূর্ণ প্রদেয় বিল:'}
                          </span>
                          <div className="text-xl sm:text-2xl font-black text-[#e2136e]">
                            ৳{advancePayableAmount.toLocaleString()}
                          </div>
                        </div>
                        {paymentMethod === 'ADVANCE_DELIVERY' && (
                          <div className="text-left sm:text-right border-t sm:border-t-0 pt-1 sm:pt-0 border-stone-100">
                            <span className="text-[11px] text-stone-500 font-medium">ক্যাশ অন ডেলিভারি (বাকি টাকা):</span>
                            <div className="text-sm font-bold text-stone-900">
                              ৳{duePayableOnDelivery.toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Top Header with bKash Number & Copy Button */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-pink-200/80">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#e2136e] text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                            ৳
                          </div>
                          <div>
                            <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                              <span>বিকাশ নম্বর:</span>
                              <span className="font-mono text-sm text-[#e2136e] font-extrabold tracking-wide">
                                {bkashConfig.personalNumber || '01316534171'}
                              </span>
                            </div>
                            <div className="text-[11px] text-pink-800 font-semibold">
                              {bkashConfig.accountType === 'Personal' 
                                ? 'পার্সোনাল বিকাশ (Send Money)' 
                                : bkashConfig.accountType === 'Merchant' 
                                ? 'মার্চেন্ট বিকাশ (Make Payment)' 
                                : 'এজেন্ট বিকাশ (Cash In)'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(bkashConfig.personalNumber || '01316534171');
                            setCopiedBkashNumber(true);
                            setTimeout(() => setCopiedBkashNumber(false), 2000);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#e2136e] hover:bg-[#c2105e] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all self-start sm:self-auto"
                        >
                          {copiedBkashNumber ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>কপি হয়েছে!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>নম্বর কপি করুন</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Instructions */}
                      <div className="p-3 bg-white/90 rounded-xl border border-pink-100 text-xs text-stone-700 space-y-1">
                        <p className="font-bold text-[#e2136e] flex items-center gap-1">
                          <span>পেমেন্ট নির্দেশনাবলী:</span>
                        </p>
                        <p className="text-[11px] leading-relaxed text-stone-600">
                          {paymentMethod === 'ADVANCE_DELIVERY' 
                            ? `আপনার বিকাশ অ্যাপ বা *247# ডায়াল করে Send Money অপশনে গিয়ে উপরের নাম্বারে শুধুমাত্র ডেলিভারি চার্জ ৳${deliveryCharge} সেন্ড করুন। এরপর নিচের বক্সে আপনার বিকাশ নাম্বার ও ট্রানজেকশন আইডি (TrxID) দিয়ে অর্ডার কনফার্ম করুন। বাকি ৳${netProductTotal.toLocaleString()} পণ্য হাতে পেয়ে পরিশোধ করবেন।`
                            : `আপনার বিকাশ অ্যাপ বা *247# ডায়াল করে Send Money অপশনে গিয়ে উপরের নাম্বারে সম্পূর্ণ বিল ৳${grandTotal.toLocaleString()} সেন্ড করুন এবং নিচে TrxID ও বিকাশ নাম্বার দিন।`}
                        </p>
                      </div>

                      {/* Inputs: Sender Phone & TrxID */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            আপনার বিকাশ নম্বর (Sender Phone):
                          </label>
                          <input
                            type="tel"
                            value={senderBkashNumber}
                            onChange={(e) => setSenderBkashNumber(e.target.value)}
                            placeholder="017xxxxxxxx"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-xs font-mono font-bold text-stone-900 focus:outline-hidden focus:border-[#e2136e]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            বিকাশ TrxID (ট্রানজেকশন আইডি): {bkashConfig.requireTrxId && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            required={bkashConfig.requireTrxId}
                            value={bkashTrxId}
                            onChange={(e) => setBkashTrxId(e.target.value.toUpperCase())}
                            placeholder="যেমন: BKG48X9K2L"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-xs font-mono font-bold text-[#e2136e] placeholder:text-stone-400 uppercase focus:outline-hidden focus:border-[#e2136e]"
                          />
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* 4. Special Note / Instructions */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-stone-400" />
                    Special Notes or Delivery Instructions (Optional):
                  </label>
                  <input
                    type="text"
                    maxLength={90}
                    value={formData.orderNotes}
                    onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                    placeholder="e.g. Please call before delivery, deliver on 3rd floor..."
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-stone-900"
                  />
                  <div className="text-right text-[11px] text-stone-400 mt-1">
                    {formData.orderNotes.length}/90 characters
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-600 font-medium">
                    {errorMessage}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Order Summary & Confirm Button (5 Cols on lg) */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-stone-50/80 p-5 sm:p-7 rounded-3xl border border-stone-200 space-y-5 lg:sticky lg:top-24">
                <div className="space-y-4">
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 pb-3 border-b border-stone-200 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                    Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
                  </h3>

                  {/* Items List */}
                  <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                    {items.map((item, idx) => {
                      const itemPrice = item.customPrice ?? item.product?.price ?? 0;
                      return (
                        <div key={`${item.product?.id || idx}-${idx}`} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200/80">
                          <SafeImage
                            src={item.product?.image}
                            alt={item.product?.name}
                            className="w-14 h-14 object-cover rounded-xl shrink-0 border border-stone-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                              {item.product?.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              {(item.selectedSize || item.product?.weight) && (
                                <span className="text-[10px] sm:text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-semibold border border-amber-200/50">
                                  {item.selectedSize || item.product?.weight}
                                </span>
                              )}
                              <span className="text-xs text-stone-500">
                                Qty: {item.quantity}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0 font-bengali">
                            <span className="text-xs sm:text-sm font-bold text-[#f38018]">
                              ৳{(itemPrice * (item.quantity || 1)).toLocaleString()}
                            </span>
                            <span className="block text-[10px] sm:text-xs text-stone-400">
                              ৳{(itemPrice ?? 0).toLocaleString()} × {item.quantity}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Calculations */}
                  <div className="space-y-2.5 border-t border-stone-200 pt-4 text-xs sm:text-sm text-stone-600 font-bengali">
                    <div className="flex justify-between">
                      <span className="font-sans">Subtotal:</span>
                      <span className="font-bold text-stone-900">
                        ৳{(activeSubtotal ?? 0).toLocaleString()}
                      </span>
                    </div>

                    {activeDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span className="font-sans">Discount:</span>
                        <span>
                          -৳{(activeDiscount ?? 0).toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="font-sans">Delivery Charge:</span>
                      <span className="font-bold text-stone-900">
                        ৳{deliveryCharge}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between border-t border-stone-200 pt-3">
                      <span className="text-sm sm:text-base font-bold text-stone-900 font-sans">মোট প্রদেয় বিল (Total Bill):</span>
                      <span className="text-2xl sm:text-3xl font-black text-[#f38018] tracking-tight select-none">
                        ৳{(grandTotal ?? 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Advance vs Due on Delivery Split Highlight */}
                    <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2 mt-2 font-sans">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-stone-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#e2136e]" />
                          বিকাশে অগ্রিম প্রদেয়:
                        </span>
                        <span className="font-extrabold text-sm text-[#e2136e]">
                          ৳{advancePayableAmount.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs border-t border-stone-100 pt-1.5">
                        <span className="font-bold text-stone-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#0a5c36]" />
                          ক্যাশ অন ডেলিভারি (পণ্য পেয়ে):
                        </span>
                        <span className="font-extrabold text-sm text-[#0a5c36]">
                          ৳{duePayableOnDelivery.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Order Button & Trust Badges */}
                <div className="space-y-3.5 pt-4 border-t border-stone-200">
                  <button
                    type="submit"
                    disabled={isSubmitting || items.length === 0}
                    className="w-full py-4 px-6 bg-[#f38018] hover:bg-[#e0700c] disabled:opacity-50 text-white font-bold rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>
                          {isAdvanceDeliveryMode 
                            ? `অর্ডার কনফার্ম করুন (অগ্রিম ৳${advancePayableAmount})` 
                            : isFullBkashMode 
                            ? `সম্পূর্ণ বিকাশ পেমেন্ট ও অর্ডার কনফার্ম (৳${grandTotal.toLocaleString()})` 
                            : `ক্যাশ অন ডেলিভারি অর্ডার কনফার্ম (৳${grandTotal.toLocaleString()})`}
                        </span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>100% Safe Delivery & Quality Verification Guaranteed</span>
                  </div>
                </div>

              </div>

            </form>
          </div>
        )}
      </main>
    </div>
  );
};
