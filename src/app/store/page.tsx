'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, ShoppingCart, User, Leaf, Loader2, X, Star, CheckCircle2,
  ChevronDown, MapPin, Heart, Truck, Shield, RotateCcw, Tag, Bell,
  ChevronLeft, ChevronRight, Package, Zap, Home, Smartphone, Shirt,
  Coffee, BookOpen, SlidersHorizontal, Filter, ArrowRight, Menu,
  Image as ImageIcon, Scan, Sparkles, Cpu, Check
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChatDrawer from '@/components/chatbot/ChatDrawer';
import EcoDifferentiatorSection from '@/components/store/EcoDifferentiatorSection';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

interface Product {
  id: string; name: string; slug: string; price: number;
  rating: number; reviews: number; ecoScore: number;
  description: string; category: string; imageUrl: string;
  stock: number; featured: boolean;
}
type CartItem = Product & { quantity: number };

const BANNERS = [
  { id: 1, tag: '🤖 EDGE-AI COMPUTER VISION', title: 'AI EcoScanner Live', subtitle: 'Point your camera at any plastic or daily item to detect hazards & eco alternatives in 40ms', cta: 'Open AI Scanner', link: '/scanner', color: 'from-emerald-950 via-[#112211] to-[#0D0D0D]', accent: '#2ECC71' },
  { id: 2, tag: '⚡ CLIENT-SIDE DEEP LEARNING', title: 'Zero Cloud GPU Latency', subtitle: 'MobileNet v1 running via WebGL right in your browser with 100% data privacy', cta: 'Test Model', link: '/scanner', color: 'from-teal-950 via-[#0B2520] to-[#0D0D0D]', accent: '#1ABC9C' },
  { id: 3, tag: '🌍 ZERO PLASTIC ENGINE', title: 'Sustainable Substitution', subtitle: 'Quantifying plastic diversion, carbon offsets, and biodegradability in real-time', cta: 'Explore Catalog', link: '#products-grid', color: 'from-green-950 via-[#142814] to-[#0D0D0D]', accent: '#27AE60' },
];

const CATEGORIES = [
  { name: 'All', icon: <Home className="w-4 h-4" /> },
  { name: 'Personal Care', icon: <Leaf className="w-4 h-4" /> },
  { name: 'Kitchen', icon: <Coffee className="w-4 h-4" /> },
  { name: 'Accessories', icon: <Shirt className="w-4 h-4" /> },
  { name: 'Stationery', icon: <BookOpen className="w-4 h-4" /> },
];

const SORT_OPTIONS = ['Popularity', 'Price: Low to High', 'Price: High to Low', 'Eco Score', 'Rating'];

const impactData = [
  { name: 'Jan', carbon: 400, plastic: 240, water: 300 },
  { name: 'Feb', carbon: 300, plastic: 139, water: 200 },
  { name: 'Mar', carbon: 200, plastic: 380, water: 250 },
  { name: 'Apr', carbon: 278, plastic: 290, water: 320 },
  { name: 'May', carbon: 189, plastic: 480, water: 180 },
  { name: 'Jun', carbon: 239, plastic: 280, water: 240 },
  { name: 'Jul', carbon: 349, plastic: 330, water: 349 },
];

function StarRow({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-700'}`} />
      ))}
      <span className="text-xs text-gray-500 ml-1">{count.toLocaleString()}</span>
    </div>
  );
}

function EcoBadge({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-1 bg-green-500/15 text-[#2ECC71] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#2ECC71]/20">
      <CheckCircle2 className="w-2.5 h-2.5" /> ECO {score}
    </span>
  );
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; content: string } | null>(null);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSort, setActiveSort] = useState('Popularity');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [minEco, setMinEco] = useState(0);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeBanner, setActiveBanner] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState<'carbon' | 'plastic' | 'water'>('carbon');
  const [locationPincode, setLocationPincode] = useState('600001');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // Checkout address & payment fields
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutPayment, setCheckoutPayment] = useState<'upi' | 'card' | 'cod'>('upi');

  const bannerTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync cart from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ecoshop_cart');
      if (stored) {
        setCart(JSON.parse(stored));
      }
      const storedWishlist = localStorage.getItem('ecoshop_wishlist');
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
      const storedUser = localStorage.getItem('ecoshop_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }
  }, []);

  // Save cart to LocalStorage when changed
  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem('ecoshop_cart', JSON.stringify(newCart));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  const updateWishlist = (newWishlist: string[]) => {
    setWishlist(newWishlist);
    try {
      localStorage.setItem('ecoshop_wishlist', JSON.stringify(newWishlist));
    } catch (e) {
      console.warn('LocalStorage wishlist error:', e);
    }
  };

  // AI Image Search State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      await tf.ready();
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => { img.onload = resolve; });
      const model = await mobilenet.load();
      const predictions = await model.classify(img);
      if (predictions && predictions.length > 0) {
        const topMatch = predictions[0].className.split(',')[0];
        const query = `Eco-friendly ${topMatch}`;
        setSearchInput(query);
        setSearch(query);
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Banner auto-scroll
  useEffect(() => {
    bannerTimer.current = setInterval(() => setActiveBanner(b => (b + 1) % BANNERS.length), 4000);
    return () => { if (bannerTimer.current) clearInterval(bannerTimer.current); };
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (activeCategory !== 'All') params.set('category', activeCategory);
      const res = await fetch(`/api/products?${params.toString()}`);
      const data: Product[] = await res.json();
      
      // Apply local filters
      let filtered = data.filter(p => 
        p.price >= priceRange[0] && 
        p.price <= priceRange[1] && 
        p.ecoScore >= minEco &&
        (!selectedRating || p.rating >= selectedRating)
      );

      if (activeSort === 'Price: Low to High') filtered = [...filtered].sort((a, b) => a.price - b.price);
      else if (activeSort === 'Price: High to Low') filtered = [...filtered].sort((a, b) => b.price - a.price);
      else if (activeSort === 'Eco Score') filtered = [...filtered].sort((a, b) => b.ecoScore - a.ecoScore);
      else if (activeSort === 'Rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating);
      
      setProducts(filtered);
      setFeatured(data.find(p => p.featured) ?? null);
    } finally { setLoading(false); }
  }, [search, activeCategory, activeSort, priceRange, minEco, selectedRating]);

  useEffect(() => { const t = setTimeout(fetchProducts, 300); return () => clearTimeout(t); }, [fetchProducts]);

  const addToCart = (p: Product) => {
    const ex = cart.find(i => i.id === p.id);
    const updated = ex
      ? cart.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i)
      : [...cart, { ...p, quantity: 1 }];
    updateCart(updated);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[];
    updateCart(updated);
  };

  const removeFromCart = (id: string) => {
    updateCart(cart.filter(i => i.id !== id));
  };

  const toggleWishlist = (id: string) => {
    const updated = wishlist.includes(id) ? wishlist.filter(i => i !== id) : [...wishlist, id];
    updateWishlist(updated);
  };

  const handleBuyNow = (p: Product) => {
    addToCart(p);
    setCartOpen(false);
    setCheckoutModalOpen(true);
    setOrderSuccess(false);
  };

  const scrollToProducts = () => {
    document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChangeLocation = () => {
    const pin = prompt('Enter your 6-digit delivery pincode:', locationPincode);
    if (pin && pin.trim().length > 0) {
      setLocationPincode(pin.trim());
    }
  };

  const handleAuthSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string || 'user@ecoshop.com';
    const name = (formData.get('name') as string) || email.split('@')[0];
    const newUser = { name, email };
    setUser(newUser);
    try {
      localStorage.setItem('ecoshop_user', JSON.stringify(newUser));
    } catch (e) {
      console.warn(e);
    }
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('ecoshop_user');
    } catch (e) {
      console.warn(e);
    }
  };

  const handleCompleteCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSuccess(true);
    setTimeout(() => {
      updateCart([]);
      setCheckoutModalOpen(false);
      setOrderSuccess(false);
    }, 2800);
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const metricColors: Record<string, string> = { carbon: '#2ECC71', plastic: '#3498DB', water: '#9B59B6' };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">

      {/* ── TOP HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#0F0F0F] border-b border-white/5 shadow-2xl">
        {/* Topmost strip */}
        <div className="bg-[#121212] border-b border-white/5 text-[#2ECC71] text-center text-xs py-1.5 font-semibold tracking-wide flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
          <span>⚡ Edge-AI Vision Enabled • Real-Time Material Diagnostics • 100% Zero-Plastic Mission</span>
        </div>

        {/* Main header row */}
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Mobile menu */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-white/5 cursor-pointer">
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 flex-shrink-0 mr-2">
            <div className="bg-[#2ECC71] p-1.5 rounded-lg shadow-[0_0_15px_rgba(46,204,113,0.3)]">
              <Leaf className="w-4 h-4 text-[#0D0D0D]" />
            </div>
            <span className="text-lg font-black hidden sm:block tracking-tight">
              <span className="text-[#2ECC71]">Eco</span>
              <span className="text-white">Shop</span>
            </span>
          </Link>

          {/* Deliver to */}
          <button onClick={handleChangeLocation} className="hidden lg:flex flex-col items-start cursor-pointer hover:text-[#2ECC71] transition-colors p-1 rounded-lg hover:bg-white/5">
            <span className="text-[10px] text-gray-500">Deliver to</span>
            <div className="flex items-center gap-1 text-xs font-semibold">
              <MapPin className="w-3 h-3 text-[#2ECC71]" /> {locationPincode}
            </div>
          </button>

          {/* Search */}
          <div className="flex-1 flex">
            <select
              value={activeCategory}
              onChange={(e) => {
                setActiveCategory(e.target.value);
                scrollToProducts();
              }}
              className="bg-[#2ECC71]/10 border border-[#2ECC71]/30 text-[#2ECC71] text-xs px-2.5 rounded-l-xl outline-none hidden sm:block cursor-pointer font-semibold"
            >
              <option value="All" className="bg-[#141414] text-white">All Categories</option>
              <option value="Personal Care" className="bg-[#141414] text-white">Personal Care</option>
              <option value="Kitchen" className="bg-[#141414] text-white">Kitchen</option>
              <option value="Accessories" className="bg-[#141414] text-white">Accessories</option>
              <option value="Stationery" className="bg-[#141414] text-white">Stationery</option>
            </select>
            <div className="flex-1 relative flex items-center">
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
                placeholder="Search eco-friendly products, brands..."
                className="w-full bg-[#1A1A1A] border border-white/10 py-2.5 pl-4 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#2ECC71] transition-colors rounded-l-xl sm:rounded-l-none"
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="absolute right-3 text-gray-400 hover:text-[#2ECC71] transition-colors disabled:opacity-50 cursor-pointer"
                title="Search by image (TensorFlow.js)"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin text-[#2ECC71]" /> : <ImageIcon className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={() => setSearch(searchInput)}
              className="bg-[#2ECC71] hover:bg-green-400 px-4 rounded-r-xl transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4 text-[#0D0D0D]" />
            </button>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            {/* Account */}
            <button
              onClick={() => setAuthModalOpen(true)}
              className="hidden md:flex flex-col items-start px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span className="text-[10px] text-gray-400">
                {user ? `Hi, ${user.name}` : 'Hello, Guest'}
              </span>
              <span className="text-xs font-semibold flex items-center gap-1 text-white">
                Account <ChevronDown className="w-3 h-3 text-[#2ECC71]" />
              </span>
            </button>

            {/* Orders */}
            <button
              onClick={() => setOrdersModalOpen(true)}
              className="hidden md:flex flex-col items-start px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span className="text-[10px] text-gray-400">Returns &</span>
              <span className="text-xs font-semibold text-white">Orders</span>
            </button>

            {/* Eco Scanner Button (Prominent & Larger) */}
            <Link
              href="/scanner"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2ECC71] hover:bg-green-400 text-[#0D0D0D] font-black text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(46,204,113,0.35)] hover:scale-105 border border-[#2ECC71]"
            >
              <Scan className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">AI Vision Scanner</span>
            </Link>

            {/* Wishlist */}
            <button onClick={() => setWishlistOpen(true)} className="p-2.5 rounded-xl hover:bg-white/5 transition-colors relative cursor-pointer" title="Wishlist">
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'text-red-400 fill-current' : 'text-gray-300'}`} />
              {wishlist.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}
            </button>

            {/* Cart */}
            <button onClick={() => setCartOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors relative cursor-pointer" title="Cart">
              <ShoppingCart className="w-5 h-5 text-[#2ECC71]" />
              <span className="hidden sm:block text-sm font-semibold">Cart</span>
              {cartCount > 0 && <span className="absolute -top-0.5 right-0 bg-[#2ECC71] text-[#0D0D0D] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* Category nav */}
        <nav className="hidden md:block bg-[#111] border-t border-white/5">
          <div className="max-w-screen-xl mx-auto px-4 flex items-center gap-1 py-2 overflow-x-auto">
            <button
              onClick={() => { setActiveCategory('All'); setSearch(''); scrollToProducts(); }}
              className={`text-xs font-bold flex items-center gap-1 mr-3 flex-shrink-0 px-2.5 py-1 rounded-lg transition-colors ${activeCategory === 'All' ? 'bg-[#2ECC71]/20 text-[#2ECC71]' : 'text-gray-300 hover:text-white'}`}
            >
              <Menu className="w-3.5 h-3.5" /> All Categories
            </button>
            {['Deals of the Day', 'Personal Care', 'Kitchen', 'Accessories', 'Stationery'].map(item => (
              <button 
                key={item} 
                onClick={() => {
                  if (item === 'Deals of the Day') {
                    document.getElementById('deals-section')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setActiveCategory(item);
                    scrollToProducts();
                  }
                }}
                className={`text-xs whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors ${activeCategory === item ? 'bg-[#2ECC71] text-black font-bold' : 'text-gray-300 hover:text-[#2ECC71] hover:bg-white/5'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-10">

        {/* ── HERO BANNER SLIDER ── */}
        <section className="relative rounded-3xl overflow-hidden min-h-64 sm:min-h-80 border border-white/5 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBanner}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`absolute inset-0 bg-gradient-to-r ${BANNERS[activeBanner].color} flex items-center px-6 md:px-12`}
            >
              <div className="space-y-3 max-w-lg">
                <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm" style={{ color: BANNERS[activeBanner].accent }}>
                  {BANNERS[activeBanner].tag}
                </span>
                <h2 className="text-3xl md:text-5xl font-black leading-tight">{BANNERS[activeBanner].title}</h2>
                <p className="text-gray-300 text-xs md:text-sm leading-relaxed">{BANNERS[activeBanner].subtitle}</p>
                {BANNERS[activeBanner].link.startsWith('/') ? (
                  <Link
                    href={BANNERS[activeBanner].link}
                    className="px-6 py-2.5 rounded-full font-bold text-[#0D0D0D] text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-transform w-fit shadow-lg"
                    style={{ backgroundColor: BANNERS[activeBanner].accent }}
                  >
                    {BANNERS[activeBanner].cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    onClick={scrollToProducts}
                    className="px-6 py-2.5 rounded-full font-bold text-[#0D0D0D] text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer shadow-lg"
                    style={{ backgroundColor: BANNERS[activeBanner].accent }}
                  >
                    {BANNERS[activeBanner].cta} <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Banner controls */}
          <button onClick={() => setActiveBanner(b => (b - 1 + BANNERS.length) % BANNERS.length)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition-colors cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setActiveBanner(b => (b + 1) % BANNERS.length)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition-colors cursor-pointer">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {BANNERS.map((_, i) => (
              <button key={i} onClick={() => setActiveBanner(i)} className={`transition-all rounded-full cursor-pointer ${i === activeBanner ? 'w-6 h-2 bg-[#2ECC71]' : 'w-2 h-2 bg-white/30'}`} />
            ))}
          </div>
        </section>

        {/* ── VALUE PROPOSITIONS ── */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Truck className="w-5 h-5 text-[#2ECC71]" />, title: 'Free Delivery', sub: 'Orders above ₹499' },
            { icon: <Shield className="w-5 h-5 text-blue-400" />, title: 'Eco Certified', sub: '100% verified materials' },
            { icon: <RotateCcw className="w-5 h-5 text-purple-400" />, title: 'Easy Returns', sub: '7-day zero plastic return' },
            { icon: <Zap className="w-5 h-5 text-yellow-400" />, title: 'Flash Deals', sub: 'Up to 33% off' },
          ].map((b, i) => (
            <div key={i} className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 flex items-center gap-3 hover:border-[#2ECC71]/30 transition-colors">
              <div className="flex-shrink-0">{b.icon}</div>
              <div>
                <p className="text-sm font-semibold">{b.title}</p>
                <p className="text-xs text-gray-500">{b.sub}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── DEALS OF THE DAY ── */}
        {featured && (
          <section id="deals-section">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black">Deal of the Day</h2>
                <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full border border-red-500/30 animate-pulse">
                  ⏰ Limited Time
                </span>
              </div>
              <button onClick={() => { setActiveCategory('All'); scrollToProducts(); }} className="text-[#2ECC71] text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer">
                See all in Catalog <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-[#1A1A1A] border border-white/5 rounded-3xl overflow-hidden grid md:grid-cols-2 hover:border-[#2ECC71]/30 transition-colors group shadow-2xl">
              <div className="relative min-h-64 md:min-h-80 overflow-hidden bg-[#111]">
                <Image src={featured.imageUrl} alt={featured.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent md:bg-gradient-to-r" />
                <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-md">🔥 HOT DEAL</span>
              </div>

              <div className="p-7 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <EcoBadge score={featured.ecoScore} />
                    <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">{featured.category}</span>
                  </div>
                  <h3 className="text-2xl font-black leading-tight text-white">{featured.name}</h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{featured.description}</p>
                  <StarRow rating={featured.rating} count={featured.reviews} />

                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl md:text-4xl font-black text-[#2ECC71]">₹{featured.price}</span>
                    <span className="text-lg text-gray-500 line-through">₹{Math.round(featured.price * 1.5)}</span>
                    <span className="bg-green-500/15 text-[#2ECC71] text-xs font-bold px-2 py-0.5 rounded border border-[#2ECC71]/30">33% OFF</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Truck className="w-3.5 h-3.5 text-[#2ECC71]" />
                    <span>FREE delivery by Tomorrow</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-5">
                  <button onClick={() => addToCart(featured)} className="flex-1 bg-[#2ECC71] hover:bg-green-400 text-[#0D0D0D] font-black py-3 rounded-xl transition-all shadow-[0_0_24px_rgba(46,204,113,0.35)] text-xs uppercase tracking-wide cursor-pointer active:scale-95">
                    Add to Cart
                  </button>
                  <button onClick={() => handleBuyNow(featured)} className="flex-1 bg-orange-500 hover:bg-orange-400 text-white font-black py-3 rounded-xl transition-all text-xs uppercase tracking-wide cursor-pointer active:scale-95 shadow-[0_0_20px_rgba(245,130,32,0.25)]">
                    Buy Now
                  </button>
                  <button onClick={() => toggleWishlist(featured.id)} className={`p-3 rounded-xl border transition-all cursor-pointer ${wishlist.includes(featured.id) ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-white/10 bg-white/5 text-gray-400 hover:border-red-400'}`}>
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── SHOP BY CATEGORY ── */}
        <section>
          <h2 className="text-xl font-black mb-4">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { name: 'Personal Care', icon: '🪥', color: 'from-green-900 to-green-950' },
              { name: 'Kitchen', icon: '🫙', color: 'from-teal-900 to-teal-950' },
              { name: 'Accessories', icon: '👜', color: 'from-emerald-900 to-emerald-950' },
              { name: 'Stationery', icon: '📔', color: 'from-cyan-900 to-cyan-950' },
              { name: 'All Products', icon: '🌿', color: 'from-lime-900 to-lime-950' },
            ].map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setActiveCategory(cat.name === 'All Products' ? 'All' : cat.name);
                  scrollToProducts();
                }}
                className={`bg-gradient-to-br ${cat.color} border rounded-2xl p-4 flex flex-col items-center gap-2 transition-all hover:scale-105 cursor-pointer ${activeCategory === (cat.name === 'All Products' ? 'All' : cat.name) ? 'border-[#2ECC71] ring-2 ring-[#2ECC71]/30' : 'border-white/5 hover:border-[#2ECC71]/40'}`}
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-xs font-semibold text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── PRODUCT LISTING WITH FILTERS ── */}
        <section id="products-grid">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-black">All Products</h2>
              <p className="text-gray-500 text-xs">
                {products.length} sustainable product{products.length !== 1 ? 's' : ''} available
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${showFilters ? 'bg-[#2ECC71]/20 border-[#2ECC71] text-[#2ECC71]' : 'bg-[#1A1A1A] border-white/10 text-gray-300 hover:border-white/20'}`}
              >
                <Filter className="w-3.5 h-3.5" /> Filters
              </button>

              <select
                value={activeSort}
                onChange={e => setActiveSort(e.target.value)}
                className="bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2ECC71] cursor-pointer"
              >
                {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            {/* Filter sidebar */}
            <AnimatePresence>
              {showFilters && (
                <motion.aside
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 240 }}
                  exit={{ opacity: 0, width: 0 }}
                  className="hidden md:block flex-shrink-0 overflow-hidden"
                >
                  <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-white/5 space-y-6 text-xs">
                    <div>
                      <h4 className="text-sm font-bold mb-3">Category</h4>
                      <div className="space-y-1">
                        {['All', 'Personal Care', 'Kitchen', 'Accessories', 'Stationery'].map(c => (
                          <button
                            key={c}
                            onClick={() => setActiveCategory(c)}
                            className={`block w-full text-left py-1 px-2 rounded-lg transition-colors cursor-pointer ${activeCategory === c ? 'text-[#2ECC71] bg-[#2ECC71]/10 font-bold' : 'text-gray-400 hover:text-white'}`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold mb-3">Price Range</h4>
                      <div className="space-y-2">
                        <input type="range" min={0} max={2000} step={50} value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])} className="w-full accent-[#2ECC71]" />
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>₹0</span><span className="text-[#2ECC71] font-bold">₹{priceRange[1]}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold mb-3">Min Eco Score</h4>
                      <input type="range" min={0} max={10} step={0.5} value={minEco} onChange={e => setMinEco(+e.target.value)} className="w-full accent-[#2ECC71]" />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>0</span><span className="text-[#2ECC71] font-bold">{minEco}/10</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold mb-3">Avg. Customer Rating</h4>
                      {[4, 3, 2].map(r => (
                        <label key={r} className="flex items-center gap-2 py-1 cursor-pointer">
                          <input
                            type="radio"
                            name="rating-filter"
                            checked={selectedRating === r}
                            onChange={() => setSelectedRating(selectedRating === r ? null : r)}
                            className="accent-[#2ECC71]"
                          />
                          <div className="flex">
                            {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r ? 'fill-yellow-400 text-yellow-400' : 'text-gray-700'}`} />)}
                          </div>
                          <span className="text-xs text-gray-400">& up</span>
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setActiveCategory('All');
                        setPriceRange([0, 2000]);
                        setMinEco(0);
                        setSelectedRating(null);
                        setSearch('');
                        setSearchInput('');
                      }}
                      className="w-full text-xs text-gray-400 hover:text-[#2ECC71] transition-colors py-2 border border-white/5 rounded-xl hover:bg-white/5 cursor-pointer font-bold"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Product Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="flex justify-center py-24">
                  <Loader2 className="w-8 h-8 animate-spin text-[#2ECC71]" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <AnimatePresence>
                    {products.map((product, i) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group bg-[#1A1A1A] rounded-2xl border border-white/5 hover:border-[#2ECC71]/30 hover:shadow-[0_0_30px_rgba(46,204,113,0.07)] transition-all duration-300 overflow-hidden flex flex-col"
                      >
                        <Link href={`/product/${product.slug}`} className="relative aspect-[4/3] bg-[#111] overflow-hidden block">
                          <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                          <button onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }} className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-colors z-10 cursor-pointer ${wishlist.includes(product.id) ? 'bg-red-500/20 text-red-400' : 'bg-black/50 text-gray-400 hover:text-red-400'}`}>
                            <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-current' : ''}`} />
                          </button>
                          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                            <EcoBadge score={product.ecoScore} />
                            {product.rating >= 4.5 && <span className="bg-green-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">BESTSELLER</span>}
                          </div>
                        </Link>

                        <div className="p-4 flex flex-col flex-1 gap-2">
                          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{product.category}</span>
                          <Link href={`/product/${product.slug}`}>
                            <h3 className="font-bold text-sm text-white group-hover:text-[#2ECC71] transition-colors line-clamp-1">{product.name}</h3>
                          </Link>
                          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{product.description}</p>
                          <StarRow rating={product.rating} count={product.reviews} />

                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xl font-black text-[#2ECC71]">₹{product.price}</span>
                            <span className="text-xs text-gray-500 line-through">₹{Math.round(product.price * 1.4)}</span>
                            <span className="text-xs text-green-400 font-bold">29% off</span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-gray-500">
                            <Truck className="w-3 h-3 text-[#2ECC71]" />
                            <span>Free delivery</span>
                          </div>

                          <div className="flex gap-2 mt-auto pt-3">
                            <button
                              onClick={() => addToCart(product)}
                              className="flex-1 bg-[#2ECC71]/10 hover:bg-[#2ECC71] text-[#2ECC71] hover:text-[#0D0D0D] border border-[#2ECC71]/30 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer active:scale-95"
                            >
                              Add to Cart
                            </button>
                            <button 
                              onClick={() => handleBuyNow(product)}
                              className="flex-1 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer active:scale-95"
                            >
                              Buy Now
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {products.length === 0 && !loading && (
                    <div className="col-span-3 text-center py-20 text-gray-500">No products found for the selected filters.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── WHAT MAKES ECOSHOP DIFFERENT (DIFFERENTIATOR SECTION) ── */}
        <EcoDifferentiatorSection
          products={products}
          onAddToCart={addToCart}
        />

        {/* ── IMPACT DASHBOARD ── */}
        <section className="bg-[#1A1A1A] rounded-3xl p-6 border border-white/5 shadow-2xl">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-black">Your Environmental Impact</h2>
              <p className="text-gray-500 text-xs">Track how your sustainable purchases benefit the planet</p>
            </div>
            <span className="text-[#2ECC71] text-xs font-bold bg-[#2ECC71]/10 px-3 py-1 rounded-full border border-[#2ECC71]/20">🌍 Verified Eco Analytics</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {([['carbon', '🌱', 'Carbon Saved', '2.4 kg'], ['plastic', '♻️', 'Plastic Reduced', '0.8 kg'], ['water', '💧', 'Water Conserved', '14.5 L']] as const).map(([key, emoji, label, val]) => (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${activeMetric === key ? 'border-[#2ECC71] bg-[#2ECC71]/10 shadow-[0_0_15px_rgba(46,204,113,0.1)]' : 'border-white/5 bg-[#0D0D0D] hover:border-white/15'}`}
              >
                <div className="text-lg mb-1">{emoji}</div>
                <div className="text-xs text-gray-500 mb-0.5">{label}</div>
                <div className="text-xl font-black" style={{ color: activeMetric === key ? metricColors[key] : 'white' }}>{val}</div>
              </button>
            ))}
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={impactData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricColors[activeMetric]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={metricColors[activeMetric]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#444" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#444" fontSize={11} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" vertical={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2ECC7130', borderRadius: 10, color: '#fff', fontSize: 12 }} />
                <Area type="monotone" dataKey={activeMetric} stroke={metricColors[activeMetric]} strokeWidth={2.5} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/5 pt-10 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-[#2ECC71]">Get to Know Us</h4>
              {[
                { title: 'About EcoShop', text: 'EcoShop is an edge-AI powered sustainable marketplace engineered to bridge in-browser visual neural networks with responsible consumption and zero-waste living. Built at Sri Sairam Engineering College.' },
                { title: 'Careers', text: 'Join our research team focusing on mobile convolutional neural network optimization, green material science, and carbon lifecycle accounting.' },
                { title: 'Press Releases', text: 'EcoShop launches zero-cloud-GPU edge inference scanner achieving sub-50ms material classification.' },
                { title: 'Eco Initiative', text: 'Every purchase guarantees carbon-neutral delivery and zero virgin plastic packaging.' }
              ].map(item => (
                <button
                  key={item.title}
                  onClick={() => setInfoModalContent({ title: item.title, content: item.text })}
                  className="block text-xs text-gray-500 hover:text-[#2ECC71] cursor-pointer mb-2 transition-colors text-left"
                >
                  {item.title}
                </button>
              ))}
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-[#2ECC71]">Project & Research</h4>
              {[
                { title: 'Computer Vision Architecture', text: 'Our pipeline utilizes MobileNet v1 with depthwise separable convolutions running natively inside browser WebGL context without transmitting user camera images to servers.' },
                { title: 'Zero Waste Mission', text: 'Targets waste elimination by automatically diagnosing synthetic polymers and prescribing certified biodegradable alternatives.' },
                { title: 'Research Report', text: 'Complete academic documentation detailing system architecture, benchmarking, and telemetry.' },
                { title: 'Open Source', text: 'Full source code available under MIT License for academic and non-profit environmental use.' }
              ].map(item => (
                <button
                  key={item.title}
                  onClick={() => setInfoModalContent({ title: item.title, content: item.text })}
                  className="block text-xs text-gray-500 hover:text-[#2ECC71] cursor-pointer mb-2 transition-colors text-left"
                >
                  {item.title}
                </button>
              ))}
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-[#2ECC71]">Merchant & Partners</h4>
              {[
                { title: 'Sell on EcoShop', text: 'Are you an eco-certified artisan or manufacturer? Partner with EcoShop to showcase biodegradable products directly to conscious consumers.' },
                { title: 'Affiliate Programme', text: 'Earn sustainable rewards by spreading awareness about plastic reduction.' },
                { title: 'Become a Supplier', text: 'Supply bamboo, coconut shells, cork, or agricultural waste biopolymers for certified products.' },
                { title: 'Verification Standards', text: 'All products undergo rigorous material screening for zero microplastic shedding.' }
              ].map(item => (
                <button
                  key={item.title}
                  onClick={() => setInfoModalContent({ title: item.title, content: item.text })}
                  className="block text-xs text-gray-500 hover:text-[#2ECC71] cursor-pointer mb-2 transition-colors text-left"
                >
                  {item.title}
                </button>
              ))}
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-[#2ECC71]">Customer Care</h4>
              {[
                { title: 'Your Account', action: () => setAuthModalOpen(true) },
                { title: 'Returns & Replacements', action: () => setOrdersModalOpen(true) },
                { title: 'Order Tracking', action: () => setOrdersModalOpen(true) },
                { title: 'Help & FAQ', action: () => setInfoModalContent({ title: 'Help & FAQ', content: 'For support inquiries or assistance using the AI EcoScanner, contact our team at support@ecoshop.org or use the Live Chat assistant in the bottom right.' }) }
              ].map(item => (
                <button
                  key={item.title}
                  onClick={item.action}
                  className="block text-xs text-gray-500 hover:text-[#2ECC71] cursor-pointer mb-2 transition-colors text-left"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#2ECC71] p-1 rounded-md"><Leaf className="w-4 h-4 text-[#0D0D0D]" /></div>
              <span className="font-black text-sm"><span className="text-[#2ECC71]">Eco</span>Shop</span>
            </div>
            <p className="text-xs text-gray-600 text-center">© 2026 EcoShop • Edge-AI Sustainable Commerce</p>
            <div className="flex gap-4 text-xs text-gray-500">
              <button onClick={() => setInfoModalContent({ title: 'Privacy Policy', content: '100% Visual Privacy: Images captured via your camera or uploaded to the AI EcoScanner are processed purely in client-side browser memory via WebGL. No images or video feeds are ever stored or sent to remote servers.' })} className="hover:text-[#2ECC71] cursor-pointer">Privacy</button>
              <button onClick={() => setInfoModalContent({ title: 'Terms of Service', content: 'EcoShop provides product information and material life-cycle diagnostics in good faith based on public environmental data and sustainability standards.' })} className="hover:text-[#2ECC71] cursor-pointer">Terms</button>
              <button onClick={() => setInfoModalContent({ title: 'Cookie Policy', content: 'EcoShop stores only necessary shopping cart and local preference state in browser local storage.' })} className="hover:text-[#2ECC71] cursor-pointer">Cookies</button>
            </div>
          </div>
        </footer>
      </div>

      {/* ── CART DRAWER ── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 cursor-pointer" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#151515] border-l border-white/10 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-black text-lg flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#2ECC71]" /> Shopping Cart
                  <span className="text-sm font-normal text-gray-400">({cartCount} items)</span>
                </h2>
                <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-4">
                    <ShoppingCart className="w-16 h-16 opacity-20" />
                    <p className="text-sm text-gray-400">Your cart is empty</p>
                    <button onClick={() => { setCartOpen(false); scrollToProducts(); }} className="text-[#2ECC71] text-sm hover:underline cursor-pointer font-bold">Continue Shopping</button>
                  </div>
                ) : cart.map(item => (
                  <div key={item.id} className="bg-[#1A1A1A] p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#111]">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                      <EcoBadge score={item.ecoScore} />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[#2ECC71] font-bold text-xs">₹{item.price * item.quantity}</span>
                        {/* Quantity increment / decrement */}
                        <div className="flex items-center bg-[#111] rounded-lg border border-white/10">
                          <button onClick={() => updateCartQuantity(item.id, -1)} className="px-2 py-0.5 text-xs text-gray-400 hover:text-white font-bold cursor-pointer">-</button>
                          <span className="px-2 text-xs font-mono font-bold text-white">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.id, 1)} className="px-2 py-0.5 text-xs text-gray-400 hover:text-white font-bold cursor-pointer">+</button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-400 transition-colors p-1 cursor-pointer" title="Remove"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>

              {cart.length > 0 && (
                <div className="p-5 border-t border-white/10 space-y-4 bg-[#121212]">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{cartTotal.toFixed(0)}</span></div>
                    <div className="flex justify-between text-gray-400"><span>Delivery</span><span className="text-[#2ECC71]">{cartTotal >= 499 ? 'FREE' : '₹49'}</span></div>
                    <div className="flex justify-between font-black text-sm border-t border-white/10 pt-2 text-white"><span>Total</span><span className="text-[#2ECC71] text-base">₹{(cartTotal + (cartTotal >= 499 ? 0 : 49)).toFixed(0)}</span></div>
                  </div>
                  <button 
                    onClick={() => {
                      setCartOpen(false);
                      setCheckoutModalOpen(true);
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-400 text-white font-black py-3.5 rounded-xl transition-all text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,130,32,0.25)] cursor-pointer"
                  >
                    Proceed to Checkout (₹{(cartTotal + (cartTotal >= 499 ? 0 : 49)).toFixed(0)})
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── WISHLIST DRAWER ── */}
      <AnimatePresence>
        {wishlistOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setWishlistOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 cursor-pointer" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#151515] border-l border-white/10 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-black text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-current" /> Your Wishlist
                  <span className="text-sm font-normal text-gray-400">({wishlist.length} items)</span>
                </h2>
                <button onClick={() => setWishlistOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {wishlist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-4">
                    <Heart className="w-16 h-16 opacity-20" />
                    <p className="text-sm text-gray-400">Your wishlist is empty</p>
                    <button onClick={() => { setWishlistOpen(false); scrollToProducts(); }} className="text-[#2ECC71] text-sm hover:underline cursor-pointer font-bold">Explore Products</button>
                  </div>
                ) : wishlist.map(id => {
                  const item = products.find(p => p.id === id);
                  if (!item) return null;
                  return (
                    <div key={item.id} className="bg-[#1A1A1A] p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#111]">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                        <EcoBadge score={item.ecoScore} />
                        <p className="text-[#2ECC71] font-bold text-xs mt-1">₹{item.price}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <button onClick={() => handleBuyNow(item)} className="bg-[#2ECC71] text-[#0D0D0D] font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer active:scale-95">Buy</button>
                        <button onClick={() => toggleWishlist(item.id)} className="text-gray-400 hover:text-red-400 transition-colors text-xs text-center border border-white/10 rounded-lg py-1 cursor-pointer">Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MOBILE MENU DRAWER ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden cursor-pointer" />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-3/4 max-w-sm bg-[#151515] border-r border-white/10 z-50 flex flex-col shadow-2xl md:hidden"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1A1A1A]">
                <h2 className="font-black text-lg flex items-center gap-2">
                  <span className="text-[#2ECC71]">Eco</span>Shop
                </h2>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <div className="px-5 pb-4 border-b border-white/5 space-y-3">
                  <button onClick={handleChangeLocation} className="flex items-center gap-3 text-sm text-gray-300 w-full text-left cursor-pointer">
                    <MapPin className="w-4 h-4 text-[#2ECC71]" /> Deliver to {locationPincode}
                  </button>
                  <button onClick={() => { setMobileMenuOpen(false); setAuthModalOpen(true); }} className="flex items-center gap-3 text-sm text-gray-300 w-full text-left cursor-pointer">
                    <User className="w-4 h-4 text-[#2ECC71]" /> {user ? user.name : 'Hello, Sign In'}
                  </button>
                  <button onClick={() => { setMobileMenuOpen(false); setOrdersModalOpen(true); }} className="flex items-center gap-3 text-sm text-gray-300 w-full text-left cursor-pointer">
                    <Truck className="w-4 h-4 text-[#2ECC71]" /> Returns & Orders
                  </button>
                </div>
                
                <h3 className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Categories</h3>
                <div className="space-y-1 px-3">
                  {['All', 'Personal Care', 'Kitchen', 'Accessories', 'Stationery'].map(item => (
                    <button 
                      key={item} 
                      onClick={() => {
                        setActiveCategory(item);
                        scrollToProducts();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-[#2ECC71] hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── CHECKOUT MODAL ── */}
      <AnimatePresence>
        {checkoutModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCheckoutModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] cursor-pointer" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#141414] border border-white/10 p-6 md:p-8 rounded-3xl z-[70] shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setCheckoutModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>

              {!orderSuccess ? (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#2ECC71] uppercase tracking-wider">Fast Checkout</span>
                  </div>
                  <h2 className="text-2xl font-black mb-4">Complete Your Eco Order</h2>

                  {/* Order items preview */}
                  <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5 mb-6 space-y-2 max-h-48 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                        <span className="text-white truncate max-w-[220px]">{item.name} × {item.quantity}</span>
                        <span className="text-[#2ECC71] font-bold">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs font-black pt-2 text-white">
                      <span>Total Payable:</span>
                      <span className="text-[#2ECC71] text-sm">₹{(cartTotal + (cartTotal >= 499 ? 0 : 49)).toFixed(0)}</span>
                    </div>
                  </div>

                  <form onSubmit={handleCompleteCheckout} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Shipping Address</label>
                      <input
                        type="text"
                        required
                        value={checkoutAddress}
                        onChange={(e) => setCheckoutAddress(e.target.value)}
                        placeholder="Street, Building, City"
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#2ECC71] transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Pincode</label>
                        <input
                          type="text"
                          required
                          value={locationPincode}
                          onChange={(e) => setLocationPincode(e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#2ECC71] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Delivery</label>
                        <div className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#2ECC71] font-bold">
                          {cartTotal >= 499 ? 'Free Carbon-Neutral' : 'Standard (₹49)'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-2">Payment Option</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'upi', label: 'UPI / GPay' },
                          { id: 'card', label: 'Card' },
                          { id: 'cod', label: 'Cash on Deliv.' }
                        ].map((m) => (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => setCheckoutPayment(m.id as any)}
                            className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                              checkoutPayment === m.id
                                ? 'bg-[#2ECC71]/10 border-[#2ECC71] text-[#2ECC71]'
                                : 'bg-[#1A1A1A] border-white/5 text-gray-400 hover:border-white/20'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-[#2ECC71] hover:bg-green-400 text-[#0D0D0D] font-black py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(46,204,113,0.3)] text-xs uppercase tracking-wider cursor-pointer active:scale-95"
                      >
                        Confirm & Pay ₹{(cartTotal + (cartTotal >= 499 ? 0 : 49)).toFixed(0)}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-[#2ECC71]/20 text-[#2ECC71] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#2ECC71]/40">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 text-white">Order Confirmed!</h3>
                  <p className="text-gray-300 text-xs max-w-sm mx-auto leading-relaxed mb-4">
                    Thank you for supporting sustainable living. Your eco order has been logged and will be shipped in 100% plastic-free packaging to pincode <strong>{locationPincode}</strong>.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-[#2ECC71]/10 border border-[#2ECC71]/20 px-3 py-1.5 rounded-full text-xs text-[#2ECC71] font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Diverted: ~850g synthetic plastic waste</span>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── RETURNS & ORDERS MODAL ── */}
      <AnimatePresence>
        {ordersModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOrdersModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] cursor-pointer" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#141414] border border-white/10 p-6 md:p-8 rounded-3xl z-[70] shadow-2xl"
            >
              <button onClick={() => setOrdersModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-[#2ECC71]" />
                <h3 className="text-xl font-black">Returns & Orders</h3>
              </div>
              <p className="text-gray-400 text-xs mb-6">
                Live status of your carbon-neutral deliveries and zero-plastic return requests.
              </p>

              <div className="space-y-3">
                <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-gray-400">#ECO-882914</span>
                    <span className="bg-green-500/10 text-[#2ECC71] border border-[#2ECC71]/20 px-2 py-0.5 rounded text-[10px] font-bold">
                      IN TRANSIT
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">Eco-Friendly Bamboo Toothbrush (Pack of 4)</h4>
                  <p className="text-[11px] text-gray-400">Expected Delivery: Tomorrow by 4:00 PM</p>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-[#2ECC71] h-full w-3/4 rounded-full" />
                  </div>
                </div>

                <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-gray-400">#ECO-774012</span>
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                      DELIVERED
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">Reusable Steel Water Bottle (750ml)</h4>
                  <p className="text-[11px] text-gray-400">Delivered on Oct 28 • Zero Plastic Packaging</p>
                  <button onClick={() => alert('Return portal: Eligible for 7-day carbon-neutral return.')} className="text-[11px] text-[#2ECC71] hover:underline cursor-pointer font-semibold">
                    Request Replacement or Return →
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── INFORMATION MODAL (Footer Links) ── */}
      <AnimatePresence>
        {infoModalContent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setInfoModalContent(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] cursor-pointer" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#141414] border border-white/10 p-6 md:p-8 rounded-3xl z-[70] shadow-2xl"
            >
              <button onClick={() => setInfoModalContent(null)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-black mb-3 text-white flex items-center gap-2">
                <Leaf className="w-5 h-5 text-[#2ECC71]" />
                {infoModalContent.title}
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed mb-6">
                {infoModalContent.content}
              </p>
              <button
                onClick={() => setInfoModalContent(null)}
                className="w-full bg-[#2ECC71] hover:bg-green-400 text-black font-black py-2.5 rounded-xl text-xs uppercase tracking-wide cursor-pointer transition-colors"
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── AUTHENTICATION MODAL ── */}
      <AnimatePresence>
        {authModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAuthModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] cursor-pointer" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#151515] border border-white/10 p-8 rounded-3xl z-[60] shadow-2xl"
            >
              <button onClick={() => setAuthModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-6">
                <div className="inline-flex bg-[#2ECC71]/10 p-3 rounded-full mb-3">
                  <Leaf className="w-8 h-8 text-[#2ECC71]" />
                </div>
                <h2 className="text-2xl font-black">{authMode === 'login' ? 'Welcome Back' : 'Join EcoShop'}</h2>
                <p className="text-gray-400 text-xs mt-1">
                  {user
                    ? `Logged in as ${user.email}`
                    : authMode === 'login'
                    ? 'Sign in to access your eco-dashboard and orders.'
                    : 'Create an account to track your environmental impact.'}
                </p>
              </div>

              {user ? (
                <div className="space-y-4 text-center">
                  <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5">
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-3 rounded-xl transition-all text-xs border border-red-500/30 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Full Name</label>
                      <input name="name" type="text" required placeholder="John Doe" className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2ECC71] transition-colors" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
                    <input name="email" type="email" required placeholder="john@example.com" className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2ECC71] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Password</label>
                    <input name="password" type="password" required placeholder="••••••••" className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2ECC71] transition-colors" />
                  </div>
                  
                  <button type="submit" className="w-full bg-[#2ECC71] hover:bg-green-400 text-[#0D0D0D] font-black py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(46,204,113,0.2)] mt-2 cursor-pointer active:scale-95 text-xs uppercase tracking-wider">
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>
              )}

              {!user && (
                <div className="mt-6 text-center text-xs text-gray-400">
                  {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-[#2ECC71] font-bold hover:underline cursor-pointer">
                    {authMode === 'login' ? 'Sign up' : 'Log in'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ChatDrawer />
    </div>
  );
}
