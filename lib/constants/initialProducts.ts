import { Product } from '@/types';

export const INITIAL_PRODUCTS: Product[] = [
  // 1. Combo
  {
    id: 'prod-combo-1',
    name: 'Al-Barakah VIP Ramadan Combo (Cambodi Oud + Ebony Tasbeeh + Ajwa Dates)',
    category: 'Combo',
    price: 3450,
    costPrice: 2100,
    originalPrice: 4800,
    rating: 5.0,
    reviewCount: 380,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'The ultimate luxury Islamic gift set. Includes 6ml Aged Cambodi Pure Oudh, 99-bead hand-carved natural Ebony Tasbeeh, and 500g Madinah VIP Ajwa Dates inside a gold-foiled velvet gift box.',
    features: ['Exclusive 3-in-1 Premium Gift Set', '100% Pure Alcohol-Free Cambodi Oudh', 'Handcrafted 99-Bead Indonesian Ebony Tasbeeh', 'Original Madinah Al-Munawwarah Ajwa Dates (500g)'],
    inStock: true,
    stockCount: 20,
    badge: 'BESTSELLER',
    tags: ['combo', 'gift', 'oud', 'tasbeeh', 'dates', 'ramadan', 'special']
  },
  {
    id: 'prod-combo-2',
    name: 'Royal Heritage Combo (Eastern Arabic Watch + Luxury Black Musk Attar)',
    category: 'Combo',
    price: 4200,
    costPrice: 2500,
    originalPrice: 5800,
    rating: 4.9,
    reviewCount: 195,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'A prestige combination featuring our Arabic Numeral Automatic Skeleton Watch paired with 12ml Velvet Black Musk concentrated oil.',
    features: ['Automatic Mechanical Arabic Numerals Watch', '12ml Long-lasting Velvet Musk Attar', 'Hard leather collector case included', 'Warranty card and certificate'],
    inStock: true,
    stockCount: 14,
    badge: 'HOT',
    tags: ['combo', 'watch', 'musk', 'luxury', 'bundle']
  },

  // 2. Offer Zone
  {
    id: 'prod-offer-1',
    name: 'Flash Sale: Taif Rose & Ambergris Concentrated Oil (Buy 1 Get 1)',
    category: 'Offer Zone',
    price: 950,
    costPrice: 520,
    originalPrice: 1900,
    rating: 4.8,
    reviewCount: 412,
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Limited time mega discount offer! Pure Taif Rose attar distilled with organic amber notes. 50% Flat discount for this week only.',
    features: ['50% Off Flash Deal', '100% Pure Non-Alcoholic Formulation', 'Long lasting sillage', 'Crystal flacon packaging'],
    inStock: true,
    stockCount: 45,
    badge: 'SALE',
    tags: ['offer', 'sale', 'discount', 'bogo', 'attar']
  },
  {
    id: 'prod-offer-2',
    name: 'Clearance Mega Deal: Polarized Gold-Rim Aviator Sunglasses',
    category: 'Offer Zone',
    price: 1250,
    costPrice: 650,
    originalPrice: 2500,
    rating: 4.7,
    reviewCount: 220,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Special seasonal price slash on our ultra-popular UV400 HD polarized aviator glasses with titanium gold frames.',
    features: ['50% Price Drop', 'UV400 HD Polarized Lenses', 'Silicone nose pads & hard leather case'],
    inStock: true,
    stockCount: 30,
    badge: 'SALE',
    tags: ['offer', 'sale', 'sunglasses', 'discount']
  },

  // 3. Organic Foods
  {
    id: 'prod-mustard-oil-5l',
    name: 'Deshi Authentic Mustard Oil 5 liter',
    category: 'Organic Foods',
    price: 1650,
    costPrice: 1250,
    originalPrice: 1700,
    rating: 5.0,
    reviewCount: 485,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80'
    ],
    description: '১০০% খাঁটি দেশি ঘানি ভাঙ্গা কাঠের ঘানির সরিষার তেল। ঝাঁঝালো সুবাস, গাড় সোনালী বর্ণ এবং স্বাস্থ্যকর। রান্নায় এনে দেয় আসল খাঁটি দেশি স্বাদ ও অতুলনীয় সুবাস।',
    features: ['১০০% খাঁটি কাঠের ঘানি ভাঙা দেশি সরিষার তেল', 'কোনোরকম কেমিক্যাল বা প্রিজারভেটিভ মুক্ত', 'উচ্চ ঝাঁঝ ও খাঁটি প্রাকৃতিক স্বাদ', '৫ লিটার ফুড-গ্রেড হ্যান্ডি বোতল'],
    inStock: true,
    stockCount: 65,
    badge: 'BESTSELLER',
    sizes: ['1 Liter (৳350)', '2 Liter (৳680)', '5 Liter Bottle (৳1650)'],
    tags: ['mustard oil', 'oil', 'organic foods', 'ghani vanga', 'deshi mustard oil', 'pure'],
    landingPage: {
      enabled: true,
      headline: 'ঐতিহ্যবাহী কাঠের ঘানি ভাঙা ১০০% খাঁটি দেশি সরিষার তেল',
      subheadline: 'তীব্র ঝাঁঝ, প্রাকৃতিক সোনালী রং এবং অতুলনীয় সুবাস — পরিবারের সুস্বাস্থ্যে খাঁটি পুষ্টির নিশ্চয়তা।',
      highlightBadge: '🔥 ফেসবুক স্পেশাল অফার - ক্যাশ অন ডেলিভারি',
      bannerNote: '🎉 আজকের সীমিত সময়ের অফার: ৫ লিটার ফ্যামিলি প্যাক নিলে সারা বাংলাদেশে ডেলিভারি সম্পূর্ণ ফ্রি!',
      customerHelpline: '01712-345678',
      keyBenefits: [
        'বাছাইকৃত প্রিমিয়াম দেশি মাঘী সরিষার বীজ থেকে প্রস্তুত',
        'ঐতিহ্যবাহী কাঠের ঘানিতে কোল্ড-প্রেসড (Cold Pressed) পদ্ধতিতে ভাঙা',
        'কোনো প্রকার কৃত্রিম ঝাঁঝ, রাসায়নিক ফ্লেভার বা ক্ষতিকর পাম অয়েল মুক্ত',
        'প্রাকৃতিক অ্যান্টিঅক্সিডেন্ট ও ওমেগা-৩ ও ৬ ফ্যাটি অ্যাসিড সমৃদ্ধ',
        'ডেলিভারি ম্যানের সামনে ঘ্রাণ ও ঝাঁঝ পরীক্ষা করে টাকা দেওয়ার সুবিধা'
      ],
      variants: [
        {
          id: 'v-1l',
          label: '১ লিটার বোতল',
          size: '1 Litre',
          price: 350,
          originalPrice: 400,
          isPopular: false,
          freeDelivery: false
        },
        {
          id: 'v-2l',
          label: '২ লিটার বোতল',
          size: '2 Litre',
          price: 680,
          originalPrice: 780,
          isPopular: false,
          freeDelivery: false
        },
        {
          id: 'v-5l',
          label: '৫ লিটার ফ্যামিলি প্যাক (বেস্ট সেলার)',
          size: '5 Litre Family Pack',
          price: 1650,
          originalPrice: 1850,
          isPopular: true,
          freeDelivery: true
        }
      ],
      guaranteeTitle: '১০০% খাঁটি মানের নিশ্চয়তা ও সহজ রিটার্ন গ্যারান্টি',
      guaranteeText: 'ডেলিভারি ম্যান থাকা অবস্থায় বোতলের মুখ সামান্য খুলে তেলের ঝাঁঝ, ঘনত্ব ও সুবাস নিজে পরীক্ষা করুন। বিন্দুমাত্র অপছন্দ হলে সাথে সাথে কোনো চার্জ ছাড়াই ডেলিভারি ম্যানের হাতে ফেরত দেওয়ার সুযোগ রয়েছে।',
      trustPoints: [
        'ক্যাশ অন ডেলিভারিতে পণ্য বুঝে পেয়ে টাকা দিন',
        'সারা বাংলাদেশে ২-৩ দিনে দ্রুত হোম ডেলিভারি',
        'নিরাপদ ও লিক-প্রুফ ফুড-গ্রেড বোতল প্যাকেজিং',
        '২৪/৭ কাস্টমার সাপোর্ট ও হেল্পলাইন'
      ],
      faqs: [
        {
          question: 'তেলটি কি আসলেই কাঠের ঘানিতে ভাঙা?',
          answer: 'জি, আল-বারাকাহ প্রিমিয়ামের সরিষার তেল শতভাগ খাঁটি দেশি কাঠের ঘানিতে ধীরগতিতে কোল্ড-প্রেসড পদ্ধতিতে ভাঙা হয়, ফলে কোনো পুষ্টিগুণ নষ্ট হয় না এবং প্রাকৃতিক ঝাঁঝ অটুট থাকে।'
        },
        {
          question: 'আমি কীভাবে নিশ্চিত হব যে তেল খাঁটি?',
          answer: 'আমাদের পণ্য হাতে পাওয়ার পর আপনি ডেলিভারি ম্যানের সামনে ঝাঁঝ, গন্ধ ও সোনালী রং পরীক্ষা করতে পারবেন। পছন্দ না হলে কোনো চার্জ ছাড়াই ফেরত দিতে পারবেন।'
        },
        {
          question: 'ডেলিভারি পেতে কতদিন সময় লাগে?',
          answer: 'ঢাকার ভেতরে সাধারণত ২৪-৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২-৩ কার্যদিবসের মধ্যে আপনার দোরগোড়ায় পৌঁছে দেওয়া হয়।'
        }
      ]
    }
  },
  {
    id: 'prod-org-1',
    name: 'Madinah Jumbo Ajwa Dates (VIP Grade A - 500g Resealable Tin)',
    category: 'Organic Foods',
    price: 1450,
    originalPrice: 1800,
    rating: 5.0,
    reviewCount: 520,
    image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Directly sourced from certified organic date palm groves in Al-Madinah Al-Munawwarah. Soft, deeply flavorful, and rich in natural nutrients and Sunnah blessings.',
    features: ['100% Original Madinah Al-Munawwarah Origin', 'Zero Added Sugars or Preservatives', 'Airtight resealable food-grade luxury tin box', 'Tested for purity and grade-A moisture balance'],
    inStock: true,
    stockCount: 50,
    badge: 'BESTSELLER',
    sizes: ['500g Pack (৳1450)', '1kg Tin Box (৳2800)', '2kg Family Pack (৳5400)'],
    tags: ['dates', 'ajwa', 'organic', 'sunnah', 'madinah', 'food']
  },
  {
    id: 'prod-org-2',
    name: 'Pure Sundarban Wild Raw Flower Honey (500g Glass Jar)',
    category: 'Organic Foods',
    price: 850,
    originalPrice: 1100,
    rating: 4.9,
    reviewCount: 310,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Raw, unpasteurized natural honey sustainably collected by certified Mouwals from deep inside the mangrove forests of the Sundarbans.',
    features: ['100% Pure & Unfiltered Khalsi/Goran Nectar', 'Zero artificial sugar or processing', 'Rich in natural active enzymes & pollen', 'Laboratory purity certified'],
    inStock: true,
    stockCount: 40,
    badge: 'HOT',
    sizes: ['500g Glass Jar (৳850)', '1kg Jar (৳1600)'],
    tags: ['honey', 'sundarban', 'raw honey', 'organic foods', 'pure']
  },

  // 4. Premium Watches
  {
    id: 'prod-watch-1',
    name: 'Arabic Numerals Automatic Mechanical Skeleton Watch',
    category: 'Premium Watches',
    price: 3850,
    originalPrice: 5200,
    rating: 4.9,
    reviewCount: 176,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Exquisite automatic timepiece featuring classic Eastern Arabic numerals (١ ٢ ٣), open-heart skeleton mechanism, and scratch-proof sapphire glass.',
    features: ['Eastern Arabic Numerals Dial', 'Self-Winding Automatic Mechanical Movement', 'Scratch-Proof Sapphire Crystal', 'Genuine Leather Strap + 50m Water Resistance'],
    inStock: true,
    stockCount: 16,
    badge: 'HOT',
    colors: [
      { name: 'Emerald & Gold', hex: '#064e3b' },
      { name: 'Royal Black & Rose Gold', hex: '#18181b' }
    ],
    tags: ['watch', 'arabic numerals', 'luxury watch', 'premium watches']
  },
  {
    id: 'prod-watch-2',
    name: 'Chronograph Royal Sapphire Chronometer (Rose Gold Edition)',
    category: 'Premium Watches',
    price: 4450,
    originalPrice: 6200,
    rating: 4.8,
    reviewCount: 92,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Precision Japanese quartz movement with triple sub-dials, date display, luminous hands, and solid stainless steel case.',
    features: ['Triple Chronograph Subdials', 'Rose Gold Ion-Plated Stainless Steel', 'Luminous Hands & Markers', 'Includes official luxury gift case'],
    inStock: true,
    stockCount: 12,
    badge: 'NEW',
    tags: ['chronograph', 'rose gold', 'watch', 'premium']
  },

  // 5. Luxury Attar
  {
    id: 'prod-attar-1',
    name: 'Dehn Al Oudh Royale (100% Pure Aged Cambodi Agarwood)',
    category: 'Luxury Attar',
    price: 2450,
    originalPrice: 3200,
    rating: 4.9,
    reviewCount: 234,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'A deeply aromatic, long-lasting master distillation of 12-year aged Cambodian and Hindi agarwood. Warm, woody, and prestigious with non-alcoholic formulation.',
    features: ['100% Non-Alcoholic Pure Concentrated Perfume Oil', '12-Year Aged Cambodi Grade-A Distillation', 'Long-lasting projection (24+ hours)', 'Handcrafted crystal flacon with gold applicator'],
    inStock: true,
    stockCount: 25,
    badge: 'BESTSELLER',
    sizes: ['6ml (৳2450)', '12ml (৳4600)', '24ml (৳8800)'],
    tags: ['oud', 'attar', 'perfume', 'luxury attar', 'non-alcoholic']
  },
  {
    id: 'prod-attar-2',
    name: 'Musk Al Kaaba & Taif Rose Deluxe Concentrated Oil',
    category: 'Luxury Attar',
    price: 1350,
    originalPrice: 1800,
    rating: 4.9,
    reviewCount: 310,
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Inspired by the sacred ambiance of the Holy Kaaba, combining pure velvet black musk, authentic Taif rose petals, and subtle ambergris notes.',
    features: ['Sacred Kiswah-inspired fragrance notes', 'Alcohol-Free Halal certified attar', 'Silky on skin, stain-resistant on fabrics', 'Luxury velvet keepsake box included'],
    inStock: true,
    stockCount: 35,
    badge: 'HOT',
    sizes: ['6ml (৳1350)', '12ml (৳2500)'],
    tags: ['musk', 'kaaba', 'rose', 'attar', 'sunnah']
  },

  // 6. Sunnah Products
  {
    id: 'prod-sunnah-1',
    name: 'Natural Ebony Wood 99-Bead Handcarved Tasbeeh',
    category: 'Sunnah Products',
    price: 850,
    originalPrice: 1200,
    rating: 4.9,
    reviewCount: 167,
    image: 'https://images.unsplash.com/photo-1584441405886-bc91be61e56a?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1584441405886-bc91be61e56a?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Indonesian dark Ebony wood hand-turned into 99 smooth 8mm beads with traditional woven tassels and dividing markers.',
    features: ['Authentic Indonesian Natural Ebony Wood', '99 Beads with 33-Count Dividers', 'High-tensile durable nylon threading', 'Comes with embroidered gift pouch'],
    inStock: true,
    stockCount: 40,
    badge: 'BESTSELLER',
    tags: ['tasbeeh', 'dhikr', 'sunnah', 'prayer', 'islamic']
  },
  {
    id: 'prod-sunnah-2',
    name: 'Fresh Olive Wood Peelu Miswak with Hygienic Holder (Pack of 5)',
    category: 'Sunnah Products',
    price: 450,
    originalPrice: 650,
    rating: 4.9,
    reviewCount: 280,
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Fresh, 100% natural Salvadora Persica (Peelu) miswak sticks vacuum sealed for optimal freshness, natural silica, and oral dental health.',
    features: ['Vacuum Sealed Pack of 5 Sticks', '100% Natural Peelu Root', 'Includes pocket hygienic miswak case', 'Natural teeth whitening and gum strengthening'],
    inStock: true,
    stockCount: 60,
    badge: 'HOT',
    tags: ['miswak', 'sunnah', 'dental', 'natural', 'peelu']
  },

  // 7. Women Collection
  {
    id: 'prod-women-1',
    name: 'Dubai Silk Velvet Modest Abaya with Embroidered Cuffs',
    category: 'Women Collection',
    price: 3200,
    originalPrice: 4500,
    rating: 4.9,
    reviewCount: 142,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Flowy, elegant Dubai premium Nidha silk abaya with subtle floral wrist embroidery and matching breathable chiffon hijab scarf.',
    features: ['Premium Dubai Nidha Silk Fabric', 'Includes Matching Chiffon Shayla/Hijab', 'Wrinkle-resistant and breathable', 'Modest wide-cut silhouette'],
    inStock: true,
    stockCount: 22,
    badge: 'NEW',
    sizes: ['52', '54', '56', '58'],
    tags: ['abaya', 'women collection', 'hijab', 'modest', 'dubai']
  },
  {
    id: 'prod-women-2',
    name: 'Floral Silk Chiffon Hijab & Magnetic Pin Gift Set',
    category: 'Women Collection',
    price: 950,
    originalPrice: 1400,
    rating: 4.8,
    reviewCount: 96,
    image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Soft touch non-slip breathable chiffon hijab set featuring 2 snag-free magnetic matte pins.',
    features: ['Ultra-soft Premium Chiffon', 'Snag-free No-Damage Magnetic Pins', 'Breathable for all seasons'],
    inStock: true,
    stockCount: 35,
    badge: 'SALE',
    tags: ['hijab', 'scarf', 'women', 'modest fashion']
  },

  // 8. Medicine & Health
  {
    id: 'prod-med-1',
    name: 'Cold-Pressed Ethiopian Black Seed Oil (Nigella Sativa 250ml)',
    category: 'Medicine & Health',
    subcategory: 'Medicines & Wellness',
    price: 980,
    originalPrice: 1350,
    rating: 4.9,
    reviewCount: 260,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80'
    ],
    description: '100% Pure virgin cold-pressed Kalonji (Black Seed) oil with high thymoquinone potency for immune support and holistic wellness.',
    features: ['100% Virgin Cold-Pressed & Unrefined', 'High Thymoquinone (TQ) Potency', 'Rich in Omega 3, 6, 9 & Antioxidants', 'Glass amber bottle with safety seal'],
    inStock: true,
    stockCount: 40,
    badge: 'BESTSELLER',
    tags: ['black seed', 'kalonji', 'medicine and health', 'wellness', 'immunity']
  },
  {
    id: 'prod-med-2',
    name: 'Natural Herbal Honey Lozenges & Immune Defense drops',
    category: 'Medicine & Health',
    subcategory: 'Medicines & Wellness',
    price: 650,
    originalPrice: 900,
    rating: 4.7,
    reviewCount: 115,
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Formulated with raw honey, propolis, ginger extract, and eucalyptus for soothing throat relief and respiratory support.',
    features: ['Natural Propolis & Honey Formula', 'Zero artificial colors or sugar alcohols', 'Fast soothing relief'],
    inStock: true,
    stockCount: 30,
    badge: 'HOT',
    tags: ['health', 'herbal', 'honey', 'medicine']
  },

  // 9. Baby Toys
  {
    id: 'prod-toys-1',
    name: 'Eco-Friendly Wooden Alphabet & Islamic Geometric Puzzle Board',
    category: 'Baby Toys',
    price: 1150,
    originalPrice: 1650,
    rating: 4.9,
    reviewCount: 154,
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Montessori-inspired wooden peg puzzle designed for toddlers to learn shapes, colors, and hand-eye coordination with non-toxic water-based paints.',
    features: ['100% Natural Beech Wood & Smooth Sanded Edges', 'Non-Toxic Child-Safe Water-Based Paints', 'Montessori Sensory & Motor Skills Development', 'BPA-Free, Lead-Free Certified'],
    inStock: true,
    stockCount: 25,
    badge: 'BESTSELLER',
    tags: ['toys', 'baby toys', 'wooden puzzle', 'montessori', 'kids', 'learning']
  },
  {
    id: 'prod-toys-2',
    name: 'Soft Plush Sensory Animal Rattle & Teething Ring Set',
    category: 'Baby Toys',
    price: 750,
    originalPrice: 1100,
    rating: 4.8,
    reviewCount: 88,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Ultra-soft organic cotton plush rattle with crinkle paper ears and natural food-grade silicone teething ring for soothing gums.',
    features: ['100% Organic Cotton Plush', 'Food-grade BPA Free Silicone Teether', 'Gentle chime rattle inside', 'Machine washable'],
    inStock: true,
    stockCount: 30,
    badge: 'HOT',
    tags: ['baby toys', 'plush', 'teether', 'rattle', 'toddler']
  },
  {
    id: 'prod-toys-3',
    name: 'Interactive Early Learning Musical Quran & Dua Companion Pillow',
    category: 'Baby Toys',
    price: 1650,
    originalPrice: 2200,
    rating: 5.0,
    reviewCount: 210,
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Gentle, soothing plush audio toy with recited soothing Surahs, daily Duas, bedtime lullabies, and soft warm glowing nightlight for peaceful sleep.',
    features: ['Crystal clear audio recordings with volume control', 'Soft velvet cuddly exterior safe for newborns', 'Built-in warm glow soothing nightlight', 'Auto-shutoff timer for bedtime'],
    inStock: true,
    stockCount: 45,
    badge: 'HOT',
    tags: ['baby toys', 'learning', 'audio toy', 'islamic toy', 'dua pillow']
  },
  {
    id: 'prod-toys-4',
    name: 'Natural Wooden Stacking Rings & Balancing Rainbow Blocks',
    category: 'Baby Toys',
    price: 950,
    originalPrice: 1350,
    rating: 4.9,
    reviewCount: 96,
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Classic Waldorf & Montessori rainbow stacker made of solid organic wood, nurturing fine motor dexterity, spatial balance, and creative logic.',
    features: ['Solid sustainably sourced wood', 'Vibrant non-toxic organic vegetable dyes', 'Encourages open-ended sensory play', 'Certified EN71 child safety standard'],
    inStock: true,
    stockCount: 28,
    badge: 'NEW',
    tags: ['baby toys', 'wooden', 'stacker', 'montessori', 'kids']
  }
];

export const CATEGORIES = [
  'All',
  'Organic Foods',
  'Premium Watches',
  'Luxury Attar',
  'Sunnah Products',
  'Women Collection',
  'Medicine & Health',
  'Baby Toys',
  'Combo',
  'Offer Zone'
] as const;

export const PROMO_CODES: Record<string, number> = {};
