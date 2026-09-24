'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SafeImage } from '@/components/shared/SafeImage';
import { 
  User, 
  MapPin, 
  Package, 
  Heart, 
  LogOut, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  Phone, 
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  LayoutDashboard,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useCartStore } from '@/store/cartStore';
import { Order, Product } from '@/types';
import { ApiError } from '@/lib/api/http';
import { createMyAddress, deleteMyAddress, getMyOrders, listMyAddresses, updateMyAddress, updateMyProfile } from '@/lib/api';
import { notify } from '@/lib/ui/notify';

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  district: string;
  isDefault: boolean;
}

type DashboardTab = 'OVERVIEW' | 'PROFILE' | 'ORDERS' | 'ADDRESSES' | 'WISHLIST';

const PLACEHOLDER_ADDRESS = {
  id: 'addr_1',
  phone: '01700000000',
  address: 'House #12, Road #4, Dhanmondi',
};

function readLegacyAddresses(): UserAddress[] {
  try {
    const saved = localStorage.getItem('albarakah_user_addresses');
    if (!saved) return [];
    const parsed = JSON.parse(saved) as UserAddress[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (a) => a?.name && a.phone && a.address && !(a.id === PLACEHOLDER_ADDRESS.id && a.phone === PLACEHOLDER_ADDRESS.phone && a.address === PLACEHOLDER_ADDRESS.address),
    );
  } catch {
    return [];
  }
}

function addressErrorText(err: unknown): string {
  const code = err instanceof ApiError ? err.code || err.message : '';
  if (code === 'INVALID_BD_PHONE') return 'ফোন নম্বর সঠিক নয়। ০১ দিয়ে ১১ সংখ্যার নম্বর দিন।';
  if (code === 'ADDRESS_NOT_FOUND') return 'এই ঠিকানাটি আর পাওয়া যায়নি।';
  return 'ঠিকানা সেভ হয়নি। আবার চেষ্টা করুন।';
}

interface CustomerDashboardProps {
  orders: Order[];
  wishlist: Product[];
  onRemoveFromWishlist?: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
  currency?: 'USD' | 'BDT';
  onOpenOrderTrack?: (trackingCode: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  orders,
  wishlist,
  onRemoveFromWishlist,
  onAddToCart,
  currency = 'BDT',
  onOpenOrderTrack
}) => {
  const router = useRouter();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const userEmailLower = user?.email?.toLowerCase().trim() || profile?.email?.toLowerCase().trim() || '';
  
  const [activeTab, setActiveTab] = useState<DashboardTab>('OVERVIEW');
  const [trackCode, setTrackCode] = useState('');
  const cartCount = useCartStore((s) => s.items.reduce((n, item) => n + item.quantity, 0));
  
  // User profile state
  const [name, setName] = useState(profile?.name || user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Orders State (Direct Server-Side Query & Real-time Live Sync)
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);

  // Addresses state
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address: '',
    district: 'Dhaka',
    isDefault: false,
  });

  // Extract / populate name and phone from profile, auth, or storage
  useEffect(() => {
    if (profile?.name || user?.displayName) {
      setName(profile?.name || user?.displayName || '');
    }

    let detectedPhone = profile?.phone || '';
    if (!detectedPhone) {
      const email = user?.email || profile?.email || '';
      const match = email.match(/user_(\d+)@/) || email.match(/^(\d+)@/);
      if (match && match[1]) {
        detectedPhone = match[1];
      }
    }
    if (!detectedPhone) {
      try {
        const stored = localStorage.getItem('albarakah_customer_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.phone) detectedPhone = parsed.phone;
        }
      } catch (e) {}
    }
    if (!detectedPhone && addresses.length > 0) {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      if (def?.phone && def.phone !== '01700000000') {
        detectedPhone = def.phone;
      }
    }
    if (detectedPhone) {
      setPhone(detectedPhone);
    }
  }, [profile, user, addresses]);

  // Fetch customer orders using getFilteredOrders sorted by createdAt descending
  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const queryParams = {
          email: user?.email || profile?.email || '',
          phone: phone || profile?.phone || '',
          userId: user?.uid || profile?.id || '',
        };
        const fetched = await getMyOrders(queryParams);
        if (isMounted) {
          setCustomerOrders(fetched);
        }
      } catch (err) {
        console.error('Error fetching customer orders:', err);
        notify('অর্ডার লোড হয়নি। আবার চেষ্টা করুন।', 'error');
      } finally {
        if (isMounted) setIsLoadingOrders(false);
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [user, profile, phone, orders]);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    const load = async () => {
      try {
        let list = await listMyAddresses();
        if (list.length === 0) {
          for (const addr of readLegacyAddresses()) {
            try {
              list = await createMyAddress({
                name: addr.name,
                phone: addr.phone,
                address: addr.address,
                district: addr.district || 'Dhaka',
                isDefault: addr.isDefault,
              });
            } catch {
              /* skip a row the API rejects; the rest still upload */
            }
          }
        }
        try {
          localStorage.removeItem('albarakah_user_addresses');
        } catch {
          /* ignore */
        }
        if (alive) setAddresses(list);
      } catch (err) {
        console.error(err);
        if (alive) notify(addressErrorText(err), 'error');
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [user]);

  const openTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    setIsAddingAddress(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      notify('প্রোফাইলে নাম লিখুন।', 'error');
      return;
    }
    setIsSavingProfile(true);
    try {
      await updateMyProfile(name.trim());
      await refreshProfile();
      try {
        localStorage.removeItem('albarakah_customer_user');
      } catch {
        /* ignore */
      }
      setProfileSuccessMsg('প্রোফাইল আপডেট হয়েছে।');
      notify('প্রোফাইল আপডেট হয়েছে।');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
      notify('প্রোফাইল সেভ হয়নি। আবার চেষ্টা করুন।', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.name.trim() || !addressForm.address.trim() || !addressForm.phone.trim()) {
      notify('ঠিকানায় নাম, ফোন ও ঠিকানা দিন।', 'error');
      return;
    }
    const body = {
      name: addressForm.name.trim(),
      phone: addressForm.phone.trim(),
      address: addressForm.address.trim(),
      district: addressForm.district.trim() || 'Dhaka',
      isDefault: addressForm.isDefault || addresses.length === 0,
    };
    const wasEdit = Boolean(editingAddressId);
    setIsSavingAddress(true);
    try {
      const list = wasEdit && editingAddressId
        ? await updateMyAddress(editingAddressId, body)
        : await createMyAddress(body);
      setAddresses(list);
      setEditingAddressId(null);
      setAddressForm({ name: '', phone: '', address: '', district: 'Dhaka', isDefault: false });
      setIsAddingAddress(false);
      notify(wasEdit ? 'ঠিকানা আপডেট হয়েছে।' : 'নতুন ঠিকানা সেভ হয়েছে।');
    } catch (err) {
      console.error(err);
      notify(addressErrorText(err), 'error');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleEditAddress = (addr: UserAddress) => {
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      district: addr.district,
      isDefault: addr.isDefault,
    });
    setEditingAddressId(addr.id);
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      setAddresses(await deleteMyAddress(id));
      notify('ঠিকানা মুছে ফেলা হয়েছে।');
    } catch (err) {
      console.error(err);
      notify(addressErrorText(err), 'error');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      setAddresses(await updateMyAddress(id, { isDefault: true }));
      notify('এই ঠিকানাটি ডিফল্ট করা হয়েছে।');
    } catch (err) {
      console.error(err);
      notify(addressErrorText(err), 'error');
    }
  };

  // Robust fallback user's orders calculation from props if live query is empty
  const userEmail = (user?.email || profile?.email || '').toLowerCase().trim();
  const cleanUserPhone = (phone || profile?.phone || '').replace(/\D/g, '').slice(-10);

  const fallbackOrders = orders.filter(o => {
    if (user?.uid && o.userId === user.uid) return true;
    const oEmail = (o.customerEmail || o.customer?.email || '').toLowerCase().trim();
    if (userEmail && oEmail) {
      if (oEmail === userEmail) return true;
      if (oEmail.replace('user_', '') === userEmail.replace('user_', '')) return true;
    }
    const oPhone = (o.customerPhone || o.customer?.phone || '').replace(/\D/g, '').slice(-10);
    if (cleanUserPhone && oPhone && oPhone === cleanUserPhone) return true;
    return false;
  }).sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  const displayOrders = customerOrders.length > 0 ? customerOrders : fallbackOrders;
  const orderedProductCount = displayOrders.reduce((sum, order) => {
    const qty = order.items?.reduce((n: number, item: { quantity?: number }) => n + (item.quantity || 1), 0) ?? 0;
    return sum + (qty || 1);
  }, 0);

  const displayName = profile?.name || user?.displayName || 'Customer';
  const initials = displayName.slice(0, 2).toUpperCase();
  const accountLine = phone || user?.email || profile?.email || '';
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
  const navItems: { id: DashboardTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'OVERVIEW', label: 'ড্যাশবোর্ড', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'ORDERS', label: 'অর্ডার', icon: <Package className="w-4 h-4" />, count: displayOrders.length },
    { id: 'ADDRESSES', label: 'ঠিকানা', icon: <MapPin className="w-4 h-4" />, count: addresses.length },
    { id: 'WISHLIST', label: 'উইশলিস্ট', icon: <Heart className="w-4 h-4" />, count: wishlist.length },
    { id: 'PROFILE', label: 'প্রোফাইল', icon: <User className="w-4 h-4" /> },
  ];

  const statusLabel = (raw: string) => {
    const key = raw.toLowerCase();
    if (key === 'delivered') return 'ডেলিভার্ড';
    if (key === 'shipped') return 'পাঠানো হয়েছে';
    if (key === 'processing' || key === 'confirmed') return 'প্রসেসিং';
    if (key === 'cancelled') return 'বাতিল';
    return 'পেন্ডিং';
  };

  return (
    <div className="w-full bg-[#f6f4f0] min-h-[calc(100vh-72px)]" id="customer-dashboard">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="relative overflow-hidden rounded-3xl bg-[#0A3828] text-white px-5 py-6 sm:px-7 sm:py-7 mb-6 shadow-lg shadow-emerald-950/10">
          <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#D4AF37]/15" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 text-[#D4AF37] flex items-center justify-center font-bold text-base">
                {initials}
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-200/80">আমার অ্যাকাউন্ট</p>
                <h1 className="text-2xl sm:text-[30px] font-bold leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {displayName}
                </h1>
                {accountLine && <p className="text-xs text-emerald-100/80 mt-1">{accountLine}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openTab('PROFILE')}
                className="px-4 py-2 rounded-xl bg-white text-[#0A3828] text-xs font-bold cursor-pointer"
              >
                প্রোফাইল
              </button>
              <button
                type="button"
                onClick={() => { void signOut(); router.push('/'); }}
                className="px-4 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                লগআউট
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-5 items-start">
          <nav className="bg-white border border-stone-200 rounded-2xl p-2 flex lg:flex-col gap-1 overflow-x-auto lg:sticky lg:top-24">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === item.id ? 'bg-[#0A3828] text-white' : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className={`ml-auto text-[10px] font-bold ${activeTab === item.id ? 'text-emerald-200' : 'text-stone-400'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="min-w-0">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'মোট অর্ডার', value: displayOrders.length, hint: 'সব অর্ডার', icon: <Package className="w-4 h-4" />, onClick: () => openTab('ORDERS') },
                  { label: 'অর্ডার করা পণ্য', value: orderedProductCount, hint: 'মোট পিস', icon: <ShoppingBag className="w-4 h-4" />, onClick: () => openTab('ORDERS') },
                  { label: 'উইশলিস্ট', value: wishlist.length, hint: 'সেভ করা', icon: <Heart className="w-4 h-4" />, onClick: () => openTab('WISHLIST') },
                  { label: 'চেকআউটে', value: cartCount, hint: 'কার্টে আছে', icon: <ShoppingCart className="w-4 h-4" />, onClick: () => router.push('/cart') },
                ].map((card) => (
                  <button key={card.label} type="button" onClick={card.onClick} className="text-left bg-white border border-stone-200 rounded-2xl p-4 hover:border-[#0A3828] hover:shadow-sm transition-all cursor-pointer">
                    <div className="w-8 h-8 rounded-xl bg-[#e7f0ec] text-[#0A3828] flex items-center justify-center">{card.icon}</div>
                    <p className="text-2xl font-bold text-stone-900 mt-3">{card.value}</p>
                    <p className="text-xs font-semibold text-stone-800">{card.label}</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">{card.hint}</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] gap-3">
                <div className="bg-white border border-stone-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-stone-900">সাম্প্রতিক অর্ডার</h2>
                    <button type="button" onClick={() => openTab('ORDERS')} className="text-xs font-semibold text-[#0A3828] cursor-pointer">সব দেখুন</button>
                  </div>
                  {isLoadingOrders && displayOrders.length === 0 ? (
                    <p className="text-xs text-stone-500">অর্ডার লোড হচ্ছে...</p>
                  ) : displayOrders.length === 0 ? (
                    <p className="text-xs text-stone-500">এখনো কোনো অর্ডার নেই। শপে গেলে এখানে ট্র্যাক করতে পারবেন।</p>
                  ) : (
                    <ul className="space-y-3">
                      {displayOrders.slice(0, 3).map((order) => {
                        const trackingId = order.trackingCode || order.id;
                        const status = order.orderStatus || order.status || 'pending';
                        return (
                          <li key={order.id} className="flex items-center justify-between gap-3 rounded-xl bg-stone-50 px-3 py-3">
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-stone-900 truncate">#{trackingId}</p>
                              <p className="text-[11px] text-stone-500 mt-0.5">{statusLabel(status)} · ৳{(order.totalAmount || order.total || 0).toLocaleString()}</p>
                            </div>
                            {onOpenOrderTrack && (
                              <button type="button" onClick={() => onOpenOrderTrack(trackingId)} className="shrink-0 px-3 py-1.5 rounded-lg bg-[#0A3828] text-white text-[11px] font-bold cursor-pointer">
                                ট্র্যাক
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="bg-white border border-stone-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-bold text-stone-900">প্রোফাইল</h2>
                      <button type="button" onClick={() => openTab('PROFILE')} className="text-xs font-semibold text-[#0A3828] cursor-pointer">এডিট</button>
                    </div>
                    <div className="text-xs text-stone-600 space-y-1.5">
                      <p className="font-semibold text-stone-900">{displayName}</p>
                      <p>{phone || 'ফোন সেভ হয়নি'}</p>
                      <p className="truncate">{user?.email || profile?.email || 'ইমেইল নেই'}</p>
                    </div>
                  </div>
                  <form
                    className="bg-white border border-stone-200 rounded-2xl p-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const code = trackCode.trim();
                      if (!code) return;
                      onOpenOrderTrack?.(code);
                    }}
                  >
                    <h2 className="text-sm font-bold text-stone-900 mb-2">অর্ডার ট্র্যাক</h2>
                    <p className="text-[11px] text-stone-500 mb-3">অর্ডার আইডি দিয়ে ডেলিভারি স্ট্যাটাস দেখুন।</p>
                    <div className="flex gap-2">
                      <input
                        value={trackCode}
                        onChange={(e) => setTrackCode(e.target.value)}
                        placeholder="AB-000000"
                        className="min-w-0 flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:outline-none focus:border-[#0A3828]"
                      />
                      <button type="submit" className="px-3 py-2 rounded-xl bg-[#FF5722] text-white text-xs font-bold cursor-pointer">খুঁজুন</button>
                    </div>
                  </form>
                  <div className="bg-white border border-stone-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-sm font-bold text-stone-900">ডেলিভারি ঠিকানা</h2>
                      <button type="button" onClick={() => openTab('ADDRESSES')} className="text-xs font-semibold text-[#0A3828] cursor-pointer">ম্যানেজ</button>
                    </div>
                    {defaultAddress ? (
                      <div className="text-xs text-stone-600 space-y-1">
                        <p className="font-semibold text-stone-900">{defaultAddress.name}</p>
                        <p>{defaultAddress.address}, {defaultAddress.district}</p>
                        <p>{defaultAddress.phone}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-stone-500">চেকআউট দ্রুত করতে একটি ঠিকানা যোগ করুন।</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: PROFILE */}
          {activeTab === 'PROFILE' && (
            <div className="max-w-xl mx-auto space-y-6">
              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
                  প্রোফাইল
                </h3>
                <p className="text-[11px] text-stone-500 -mt-2">নাম বদলানো যায়। ফোন লগইনের পরিচয়, তাই সেটা লক করা।</p>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#0A3828] focus:ring-1 focus:ring-[#0A3828]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || profile?.email || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-xs text-stone-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Account email is verified and cannot be changed.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    disabled
                    value={phone}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-xs text-stone-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Login phone cannot be changed.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-5 py-2.5 rounded-xl bg-[#0A3828] hover:bg-[#072418] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { void signOut(); router.push('/'); }}
                    className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === 'ORDERS' && (
            <div className="space-y-4">
              {isLoadingOrders && displayOrders.length === 0 ? (
                <div className="text-center py-12 bg-white border border-stone-200 rounded-2xl p-8 space-y-3">
                  <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-stone-500 font-medium">লোড হচ্ছে... আপনার পূর্বের অর্ডার তালিকা নিয়ে আসা হচ্ছে...</p>
                </div>
              ) : displayOrders.length === 0 ? (
                <div className="text-center py-12 bg-white border border-stone-200 rounded-2xl p-8">
                  <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-stone-800">No orders placed yet</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    When you purchase items from Al Barakah, all tracking updates and receipts will be displayed here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayOrders.map((order) => {
                    const trackingId = order.trackingCode || order.id;
                    const status = order.orderStatus || order.status || 'pending';
                    const amount = order.totalAmount || order.total || 0;
                    const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('bn-BD') : '';
                    const pieces = order.items?.reduce((n: number, item: { quantity?: number }) => n + (item.quantity || 1), 0) || 1;
                    const tone = status.toLowerCase();

                    return (
                      <div
                        key={order.id}
                        className="bg-white border border-stone-200 rounded-2xl p-4 hover:border-[#0A3828]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-stone-900">অর্ডার #{trackingId}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tone === 'delivered' ? 'bg-emerald-100 text-emerald-800' : tone === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {statusLabel(status)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                            {date && <span>{date}</span>}
                            <span>মোট <strong className="text-stone-900">৳{amount.toLocaleString()}</strong></span>
                            <span>{pieces}টি পণ্য</span>
                          </div>
                        </div>
                        {onOpenOrderTrack && (
                          <button
                            onClick={() => onOpenOrderTrack(trackingId)}
                            className="px-3.5 py-2 rounded-xl bg-[#0A3828] hover:bg-[#072418] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>ট্র্যাক করুন</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES (Address Book Editor) */}
          {activeTab === 'ADDRESSES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Delivery Addresses</h3>
                  <p className="text-xs text-stone-500">Manage your shipping destinations for fast checkout</p>
                </div>
                {!isAddingAddress && (
                  <button
                    onClick={() => {
                      setAddressForm({
                        name: profile?.name || user?.displayName || '',
                        phone: '',
                        address: '',
                        district: 'Dhaka',
                        isDefault: addresses.length === 0,
                      });
                      setEditingAddressId(null);
                      setIsAddingAddress(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#0A3828] hover:bg-[#072418] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {isAddingAddress ? (
                <form onSubmit={handleSaveAddress} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-150">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    {editingAddressId ? 'Edit Address' : 'Add New Delivery Address'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Recipient Name / Label
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        placeholder="e.g. Home, Office, Tanvir"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#0A3828]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#0A3828]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Detailed Street Address
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.address}
                        onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                        placeholder="House/Holding no, Road no, Area"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#0A3828]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        City / District
                      </label>
                      <select
                        value={addressForm.district}
                        onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white focus:outline-none focus:border-[#0A3828]"
                      >
                        <option value="Dhaka">Dhaka (Inside City)</option>
                        <option value="Chattogram">Chattogram</option>
                        <option value="Sylhet">Sylhet</option>
                        <option value="Rajshahi">Rajshahi</option>
                        <option value="Khulna">Khulna</option>
                        <option value="Barishal">Barishal</option>
                        <option value="Rangpur">Rangpur</option>
                        <option value="Mymensingh">Mymensingh</option>
                        <option value="Other">Other District</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      className="rounded border-stone-300 text-[#0A3828] focus:ring-[#0A3828]"
                    />
                    <span>Set as primary default shipping address</span>
                  </label>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isSavingAddress}
                      className="px-4 py-2 rounded-xl bg-[#0A3828] hover:bg-[#072418] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSavingAddress ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : addresses.length === 0 ? (
                <div className="text-center py-12 bg-white border border-stone-200 rounded-2xl p-8">
                  <MapPin className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-stone-800">কোনো ঠিকানা সেভ করা নেই</h3>
                  <p className="text-xs text-stone-500 mt-1">ডেলিভারি দ্রুত করতে একটি ঠিকানা যোগ করুন।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div 
                      key={addr.id}
                      className={`bg-white border rounded-2xl p-4.5 transition-all relative ${
                        addr.isDefault ? 'border-emerald-500 shadow-xs' : 'border-stone-200'
                      }`}
                    >
                      {addr.isDefault && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Default
                        </span>
                      )}

                      <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{addr.name}</span>
                      </div>

                      <p className="text-xs text-stone-600 mt-2 line-clamp-2">
                        {addr.address}, {addr.district}
                      </p>
                      
                      <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-1.5">
                        <Phone className="w-3 h-3" />
                        <span>{addr.phone}</span>
                      </div>

                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-stone-100 text-xs">
                        <button
                          onClick={() => handleEditAddress(addr)}
                          className="text-stone-600 hover:text-stone-900 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
                          >
                            Set as default
                          </button>
                        )}

                        {addresses.length > 1 && (
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-rose-500 hover:text-rose-700 font-semibold ml-auto flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WISHLIST */}
          {activeTab === 'WISHLIST' && (
            <div className="space-y-4">
              {wishlist.length === 0 ? (
                <div className="text-center py-12 bg-white border border-stone-200 rounded-2xl p-8">
                  <Heart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-stone-800">Your wishlist is empty</h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Tap the heart icon on any product to save it here for later.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {wishlist.map((prod) => (
                    <div 
                      key={prod.id}
                      className="bg-white border border-stone-200 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs hover:border-emerald-200 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <SafeImage 
                          src={prod.image} 
                          alt={prod.name}
                          className="w-14 h-14 rounded-xl object-cover border border-stone-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-stone-900 truncate">
                            {prod.name}
                          </h4>
                          <div className="text-xs font-bold text-[#0A3828] mt-0.5">
                            {currency === 'BDT' ? `৳${prod.price.toLocaleString()}` : `$${prod.price.toFixed(2)}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {onAddToCart && (
                          <button
                            onClick={() => onAddToCart(prod)}
                            className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-[#0A3828] hover:text-white transition-colors cursor-pointer"
                            title="Add to Cart"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        )}
                        {onRemoveFromWishlist && (
                          <button
                            onClick={() => onRemoveFromWishlist(prod.id)}
                            className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          </div>
        </div>
        <p className="mt-6 text-[11px] text-stone-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          এই ড্যাশবোর্ড শুধু আপনার অ্যাকাউন্টের।
        </p>
      </div>
    </div>
  );
};
