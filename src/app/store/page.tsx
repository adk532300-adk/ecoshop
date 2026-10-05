'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, ShoppingCart, User, Leaf, Loader2, X, Star, CheckCircle2,
  ChevronDown, MapPin, Heart, Truck, Shield, RotateCcw, Tag, Bell,
  ChevronLeft, ChevronRight, Package, Zap, Home, Smartphone, Shirt,
  Coffee, BookOpen, SlidersHorizontal, Filter, ArrowRight, Menu,
  Image as ImageIcon
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChatDrawer from '@/components/chatbot/ChatDrawer';
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
  { id: 1, title: 'Go Green, Save More', subtitle: 'Up to 70% off on Eco-Friendly Products', cta: 'Shop Now', color: 'from-green-900 to-[#0D0D0D]', accent: '#2ECC71' },
  { id: 2, title: "Today's Best Eco Deals", subtitle: 'Bamboo Toothbrush Set — Only ₹299', cta: 'Grab Deal', color: 'from-emerald-900 to-[#0D0D0D]', accent: '#27AE60' },
  { id: 3, title: 'Free Shipping', subtitle: 'On orders above ₹499. Sustainable delivery.', cta: 'Shop All', color: 'from-teal-900 to-[#0D0D0D]', accent: '#1ABC9C' },
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
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSort, setActiveSort] = useState('Popularity');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [minEco, setMinEco] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeBanner, setActiveBanner] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState<'carbon' | 'plastic' | 'water'>('carbon');
  const bannerTimer = useRef<ReturnType<typeof setInterval> | null>(null);

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
      let filtered = data.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1] && p.ecoScore >= minEco);
      if (activeSort === 'Price: Low to High') filtered = [...filtered].sort((a, b) => a.price - b.price);
      else if (activeSort === 'Price: High to Low') filtered = [...filtered].sort((a, b) => b.price - a.price);
      else if (activeSort === 'Eco Score') filtered = [...filtered].sort((a, b) => b.ecoScore - a.ecoScore);
      else if (activeSort === 'Rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating);
      setProducts(filtered);
      setFeatured(data.find(p => p.featured) ?? null);
    } finally { setLoading(false); }
  }, [search, activeCategory, activeSort, priceRange, minEco]);

  useEffect(() => { const t = setTimeout(fetchProducts, 300); return () => clearTimeout(t); }, [fetchProducts]);

  const addToCart = (p: Product) => setCart(prev => {
    const ex = prev.find(i => i.id === p.id);
    return ex ? prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i) : [...prev, { ...p, quantity: 1 }];
  });
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const toggleWishlist = (id: string) => setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [locationPincode, setLocationPincode] = useState('600001');

  const handleBuyNow = (p: Product) => {
    addToCart(p);
    setCartOpen(true);
  };

  const scrollToProducts = () => {
    document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleChangeLocation = () => {
    const pin = prompt('Enter your Pincode:', locationPincode);
    if (pin && pin.trim().length > 0) {
      setLocationPincode(pin.trim());
      // No alert needed since the UI updates instantly
    }
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const metricColors: Record<string, string> = { carbon: '#2ECC71', plastic: '#3498DB', water: '#9B59B6' };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">

      {/* ── TOP HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#0F0F0F] border-b border-white/5 shadow-2xl">
        {/* Topmost strip */}
        <div className="bg-[#2ECC71] text-[#0D0D0D] text-center text-xs py-1.5 font-semibold tracking-wide">
          🌿 Free shipping on orders above ₹499 · 100% Eco-Certified Products · Carbon-neutral delivery
        </div>

        {/* Main header row */}
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Mobile menu */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-white/5">
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <a href="/" className="flex items-center gap-1.5 flex-shrink-0 mr-2">
            <div className="bg-[#2ECC71] p-1.5 rounded-lg">
              <Leaf className="w-4 h-4 text-[#0D0D0D]" />
            </div>
            <span className="text-lg font-black hidden sm:block tracking-tight">
              <span className="text-[#2ECC71]">Eco</span>
              <span className="text-white">Shop</span>
            </span>
          </a>

          {/* Deliver to */}
          <div onClick={handleChangeLocation} className="hidden lg:flex flex-col items-start cursor-pointer hover:text-[#2ECC71] transition-colors">
            <span className="text-[10px] text-gray-500">Deliver to</span>
            <div className="flex items-center gap-1 text-xs font-semibold">
              <MapPin className="w-3 h-3 text-[#2ECC71]" /> {locationPincode}
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 flex">
            <select className="bg-[#2ECC71]/10 border border-[#2ECC71]/30 text-[#2ECC71] text-xs px-2 rounded-l-lg outline-none hidden sm:block">
              <option>All</option>
              <option>Personal Care</option>
              <option>Kitchen</option>
              <option>Accessories</option>
            </select>
            <div className="flex-1 relative flex items-center">
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
                placeholder="Search eco-friendly products, brands..."
                className="w-full bg-[#1A1A1A] border border-white/10 py-2.5 pl-4 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#2ECC71] transition-colors"
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
                className="absolute right-3 text-gray-400 hover:text-[#2ECC71] transition-colors disabled:opacity-50"
                title="Search by image"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={() => setSearch(searchInput)}
              className="bg-[#2ECC71] hover:bg-green-400 px-4 rounded-r-lg transition-colors"
            >
              <Search className="w-4 h-4 text-[#0D0D0D]" />
            </button>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            {/* Account */}
            <button onClick={() => setAuthModalOpen(true)} className="hidden md:flex flex-col items-start px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <span className="text-[10px] text-gray-500">Hello, Guest</span>
              <span className="text-xs font-semibold flex items-center gap-1">Account <ChevronDown className="w-3 h-3" /></span>
            </button>

            {/* Orders */}
            <button onClick={() => setAuthModalOpen(true)} className="hidden md:flex flex-col items-start px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <span className="text-[10px] text-gray-500">Returns &</span>
              <span className="text-xs font-semibold">Orders</span>
            </button>

            {/* Wishlist */}
            <button onClick={() => setWishlistOpen(true)} className="p-2.5 rounded-lg hover:bg-white/5 transition-colors relative">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}
            </button>

            {/* Cart */}
            <button onClick={() => setCartOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors relative">
              <ShoppingCart className="w-5 h-5 text-[#2ECC71]" />
              <span className="hidden sm:block text-sm font-semibold">Cart</span>
              {cartCount > 0 && <span className="absolute -top-0.5 right-0 bg-[#2ECC71] text-[#0D0D0D] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* Category nav */}
        <nav className="hidden md:block bg-[#111] border-t border-white/5">
          <div className="max-w-screen-xl mx-auto px-4 flex items-center gap-1 py-2 overflow-x-auto">
            <span className="text-xs text-[#2ECC71] font-bold flex items-center gap-1 mr-3 flex-shrink-0">
              <Menu className="w-3.5 h-3.5" /> All Categories
            </span>
            {['Deals of the Day', "Today's Offers", 'New Arrivals', 'Personal Care', 'Kitchen', 'Accessories', 'Stationery', 'Gift Cards'].map(item => (
              <button 
                key={item} 
                onClick={() => {
                  if (['Personal Care', 'Kitchen', 'Accessories', 'Stationery'].includes(item)) {
                    setActiveCategory(item);
                    scrollToProducts();
                  } else {
                    alert(`${item} section is currently being updated with new eco-friendly products!`);
                  }
                }}
                className="text-xs text-gray-300 hover:text-[#2ECC71] whitespace-nowrap px-3 py-1.5 rounded hover:bg-white/5 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-10">

        {/* ── HERO BANNER ── */}
        <section className="relative rounded-2xl overflow-hidden h-56 sm:h-72 md:h-80">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBanner}
              initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4 }}
              className={`absolute inset-0 bg-gradient-to-r ${BANNERS[activeBanner].color} flex items-center px-10`}
            >
              <div className="space-y-3 max-w-lg">
                <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm" style={{ color: BANNERS[activeBanner].accent }}>
                  🌱 LIMITED TIME OFFER
                </span>
                <h2 className="text-3xl md:text-5xl font-black leading-tight">{BANNERS[activeBanner].title}</h2>
                <p className="text-gray-300 text-sm md:text-base">{BANNERS[activeBanner].subtitle}</p>
                <button onClick={scrollToProducts} className="px-6 py-2.5 rounded-full font-bold text-[#0D0D0D] text-sm flex items-center gap-2 hover:scale-105 transition-transform" style={{ backgroundColor: BANNERS[activeBanner].accent }}>
                  {BANNERS[activeBanner].cta} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Banner controls */}
          <button onClick={() => setActiveBanner(b => (b - 1 + BANNERS.length) % BANNERS.length)} className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setActiveBanner(b => (b + 1) % BANNERS.length)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {BANNERS.map((_, i) => (
              <button key={i} onClick={() => setActiveBanner(i)} className={`transition-all rounded-full ${i === activeBanner ? 'w-6 h-2 bg-[#2ECC71]' : 'w-2 h-2 bg-white/30'}`} />
            ))}
          </div>
        </section>

        {/* ── DEAL BADGES ── */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Truck className="w-5 h-5 text-[#2ECC71]" />, title: 'Free Delivery', sub: 'Orders above ₹499' },
            { icon: <Shield className="w-5 h-5 text-blue-400" />, title: 'Eco Certified', sub: '100% verified products' },
            { icon: <RotateCcw className="w-5 h-5 text-purple-400" />, title: 'Easy Returns', sub: '7-day return policy' },
            { icon: <Zap className="w-5 h-5 text-yellow-400" />, title: 'Flash Deals', sub: 'Every day at 12 PM' },
          ].map((b, i) => (
            <div key={i} className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 flex items-center gap-3 hover:border-[#2ECC71]/30 transition-colors">
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
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black">Deal of the Day</h2>
                <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full border border-red-500/30 animate-pulse">
                  ⏰ Limited Time
                </span>
              </div>
              <button onClick={() => { setActiveCategory('All'); scrollToProducts(); }} className="text-[#2ECC71] text-sm font-semibold flex items-center gap-1 hover:underline">
                See all <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden grid md:grid-cols-2 hover:border-[#2ECC71]/30 transition-colors group">
              <div className="relative min-h-64 md:min-h-80 overflow-hidden bg-[#111]">
                <Image src={featured.imageUrl} alt={featured.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent md:bg-gradient-to-r" />
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded">🔥 HOT DEAL</span>
              </div>

              <div className="p-7 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <EcoBadge score={featured.ecoScore} />
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">{featured.category}</span>
                  </div>
                  <h3 className="text-2xl font-black leading-tight">{featured.name}</h3>
                  <p className="text-gray-400 text-sm">{featured.description}</p>
                  <StarRow rating={featured.rating} count={featured.reviews} />

                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-4xl font-black text-[#2ECC71]">₹{featured.price}</span>
                    <span className="text-xl text-gray-600 line-through">₹{Math.round(featured.price * 1.5)}</span>
                    <span className="bg-green-500/15 text-[#2ECC71] text-sm font-bold px-2 py-0.5 rounded">33% OFF</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Truck className="w-3.5 h-3.5 text-[#2ECC71]" />
                    <span>FREE delivery by Tomorrow</span>
                  </div>
                  <div className="text-xs text-green-600">✔ In Stock — {featured.stock} left</div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => addToCart(featured)} className="flex-1 bg-[#2ECC71] hover:bg-green-400 text-[#0D0D0D] font-black py-3 rounded-xl transition-all shadow-[0_0_24px_rgba(46,204,113,0.35)] text-sm">
                    Add to Cart
                  </button>
                  <button onClick={() => handleBuyNow(featured)} className="flex-1 bg-orange-500 hover:bg-orange-400 text-white font-black py-3 rounded-xl transition-all text-sm">
                    Buy Now
                  </button>
                  <button onClick={() => toggleWishlist(featured.id)} className={`p-3 rounded-xl border transition-all ${wishlist.includes(featured.id) ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-white/10 bg-white/5 text-gray-400 hover:border-red-400'}`}>
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── SHOP BY CATEGORY ── */}
        <section>
          <h2 className="text-xl font-black mb-4">Shop by Category</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {[
              { name: 'Personal Care', icon: '🪥', color: 'from-green-900 to-green-950' },
              { name: 'Kitchen', icon: '🫙', color: 'from-teal-900 to-teal-950' },
              { name: 'Accessories', icon: '👜', color: 'from-emerald-900 to-emerald-950' },
              { name: 'Stationery', icon: '📔', color: 'from-cyan-900 to-cyan-950' },
              { name: 'All Products', icon: '🌿', color: 'from-lime-900 to-lime-950' },
            ].map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name === 'All Products' ? 'All' : cat.name)}
                className={`bg-gradient-to-br ${cat.color} border border-white/5 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-[#2ECC71]/40 transition-all hover:scale-105`}
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
              <p className="text-gray-500 text-sm">{products.length} results {activeCategory !== 'All' ? `in "${activeCategory}"` : ''}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 bg-[#1A1A1A] border border-white/10 hover:border-[#2ECC71] text-sm px-4 py-2 rounded-lg transition-colors">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <select
                value={activeSort}
                onChange={e => setActiveSort(e.target.value)}
                className="bg-[#1A1A1A] border border-white/10 rounded-lg text-sm px-3 py-2 text-white focus:outline-none focus:border-[#2ECC71] transition-colors"
              >
                {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Sidebar Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.aside
                  initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 240 }}
                  exit={{ opacity: 0, width: 0 }}
                  className="hidden lg:block flex-shrink-0 overflow-hidden"
                >
                  <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 space-y-6 w-60">
                    <div>
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><Filter className="w-4 h-4 text-[#2ECC71]" /> Category</h4>
                      {CATEGORIES.map(c => (
                        <label key={c.name} className="flex items-center gap-2 py-1.5 cursor-pointer hover:text-[#2ECC71] transition-colors">
                          <input type="radio" name="category" checked={activeCategory === c.name} onChange={() => setActiveCategory(c.name)} className="accent-[#2ECC71]" />
                          <span className="text-sm">{c.name}</span>
                        </label>
                      ))}
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
                        <span>0</span><span className="text-[#2ECC71] font-bold">{minEco}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold mb-3">Avg. Customer Rating</h4>
                      {[4, 3, 2].map(r => (
                        <label key={r} className="flex items-center gap-2 py-1 cursor-pointer">
                          <input type="checkbox" className="accent-[#2ECC71]" />
                          <div className="flex">
                            {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r ? 'fill-yellow-400 text-yellow-400' : 'text-gray-700'}`} />)}
                          </div>
                          <span className="text-xs text-gray-400">& up</span>
                        </label>
                      ))}
                    </div>

                    <button onClick={() => { setActiveCategory('All'); setPriceRange([0, 2000]); setMinEco(0); }} className="w-full text-xs text-gray-500 hover:text-[#2ECC71] transition-colors py-2 border border-white/5 rounded-lg">
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
                        <div className="relative aspect-[4/3] bg-[#111] overflow-hidden">
                          <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          <button onClick={() => toggleWishlist(product.id)} className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-colors ${wishlist.includes(product.id) ? 'bg-red-500/20 text-red-400' : 'bg-black/40 text-gray-400 hover:text-red-400'}`}>
                            <Heart className="w-4 h-4" />
                          </button>
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            <EcoBadge score={product.ecoScore} />
                            {product.rating >= 4.5 && <span className="bg-green-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">BESTSELLER</span>}
                          </div>
                        </div>

                        <div className="p-4 flex flex-col flex-1 gap-2">
                          <span className="text-xs text-gray-600">{product.category}</span>
                          <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-[#2ECC71] transition-colors">{product.name}</h3>
                          <StarRow rating={product.rating} count={product.reviews} />

                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xl font-black text-[#2ECC71]">₹{product.price}</span>
                            <span className="text-sm text-gray-600 line-through">₹{Math.round(product.price * 1.4)}</span>
                            <span className="text-xs text-green-400 font-bold">29% off</span>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Truck className="w-3 h-3 text-[#2ECC71]" />
                            <span>Free delivery</span>
                          </div>

                          <div className="flex gap-2 mt-auto pt-2">
                            <button
                              onClick={() => addToCart(product)}
                              className="flex-1 bg-[#2ECC71]/10 hover:bg-[#2ECC71] text-[#2ECC71] hover:text-[#0D0D0D] border border-[#2ECC71]/30 font-bold py-2.5 rounded-xl text-xs transition-all"
                            >
                              Add to Cart
                            </button>
                            <button 
                              onClick={() => handleBuyNow(product)}
                              className="flex-1 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 font-bold py-2.5 rounded-xl text-xs transition-all"
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

        {/* ── IMPACT DASHBOARD ── */}
        <section className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-black">Your Environmental Impact</h2>
              <p className="text-gray-500 text-sm">Track how your purchases help the planet</p>
            </div>
            <span className="text-[#2ECC71] text-xs font-bold bg-[#2ECC71]/10 px-3 py-1 rounded-full border border-[#2ECC71]/20">🌍 7-day view</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {([['carbon', '🌱', 'Carbon Saved', '2.4 kg'], ['plastic', '♻️', 'Plastic Reduced', '0.8 kg'], ['water', '💧', 'Water Conserved', '14.5 L']] as const).map(([key, emoji, label, val]) => (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={`p-4 rounded-xl border text-left transition-all ${activeMetric === key ? 'border-[#2ECC71] bg-[#2ECC71]/10 shadow-[0_0_15px_rgba(46,204,113,0.1)]' : 'border-white/5 bg-[#0D0D0D] hover:border-white/15'}`}
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
              <h4 className="font-bold text-sm mb-3 text-[#2ECC71]">Get to Know Us</h4>
              {['About EcoShop', 'Careers', 'Press Releases', 'Eco Initiative'].map(l => (
                <p key={l} onClick={() => alert(`${l} page coming soon!`)} className="text-xs text-gray-500 hover:text-[#2ECC71] cursor-pointer mb-2 transition-colors">{l}</p>
              ))}
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3 text-[#2ECC71]">Connect with Us</h4>
              {['Facebook', 'Twitter', 'Instagram', 'YouTube'].map(l => (
                <p key={l} onClick={() => alert(`${l} link opening...`)} className="text-xs text-gray-500 hover:text-[#2ECC71] cursor-pointer mb-2 transition-colors">{l}</p>
              ))}
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3 text-[#2ECC71]">Make Money with Us</h4>
              {['Sell on EcoShop', 'Affiliate Programme', 'Become a Supplier', 'Advertise'].map(l => (
                <p key={l} onClick={() => alert(`${l} portal coming soon!`)} className="text-xs text-gray-500 hover:text-[#2ECC71] cursor-pointer mb-2 transition-colors">{l}</p>
              ))}
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3 text-[#2ECC71]">Let Us Help You</h4>
              {['Your Account', 'Returns & Replacements', 'Order Tracking', 'Help'].map(l => (
                <p key={l} onClick={() => alert(`${l} support page coming soon!`)} className="text-xs text-gray-500 hover:text-[#2ECC71] cursor-pointer mb-2 transition-colors">{l}</p>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#2ECC71] p-1 rounded-md"><Leaf className="w-4 h-4 text-[#0D0D0D]" /></div>
              <span className="font-black text-sm"><span className="text-[#2ECC71]">Eco</span>Shop</span>
            </div>
            <p className="text-xs text-gray-600 text-center">© 2026 EcoShop. All rights reserved. · Team Leader: <span className="text-[#2ECC71]">Rahul R K</span> · Team: Dinesh Kumar A, Agneeshwar P · Guide: Midhunadharshni G</p>
            <div className="flex gap-3 text-xs text-gray-500">
              <span onClick={() => alert('Privacy Policy opening...')} className="hover:text-[#2ECC71] cursor-pointer">Privacy</span>
              <span onClick={() => alert('Terms of Service opening...')} className="hover:text-[#2ECC71] cursor-pointer">Terms</span>
              <span onClick={() => alert('Cookies Policy opening...')} className="hover:text-[#2ECC71] cursor-pointer">Cookies</span>
            </div>
          </div>
        </footer>
      </div>

      {/* ── CART DRAWER ── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#151515] border-l border-white/10 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-black text-lg flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#2ECC71]" /> Your Cart
                  <span className="text-sm font-normal text-gray-400">({cartCount} items)</span>
                </h2>
                <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-4">
                    <ShoppingCart className="w-16 h-16 opacity-20" />
                    <p>Your cart is empty</p>
                    <button onClick={() => setCartOpen(false)} className="text-[#2ECC71] text-sm hover:underline">Continue Shopping</button>
                  </div>
                ) : cart.map(item => (
                  <div key={item.id} className="bg-[#1A1A1A] p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#111]">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                      <EcoBadge score={item.ecoScore} />
                      <p className="text-[#2ECC71] font-bold text-sm mt-1">₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-red-400 transition-colors p-1"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>

              {cart.length > 0 && (
                <div className="p-5 border-t border-white/10 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{cartTotal.toFixed(0)}</span></div>
                    <div className="flex justify-between text-gray-400"><span>Delivery</span><span className="text-[#2ECC71]">{cartTotal >= 499 ? 'FREE' : '₹49'}</span></div>
                    <div className="flex justify-between font-black text-base border-t border-white/10 pt-2"><span>Total</span><span className="text-[#2ECC71]">₹{(cartTotal + (cartTotal >= 499 ? 0 : 49)).toFixed(0)}</span></div>
                  </div>
                  <button 
                    onClick={() => {
                      alert('Order placed successfully! Thank you for shopping sustainably. 🌍');
                      setCart([]);
                      setCartOpen(false);
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-400 text-white font-black py-3.5 rounded-xl transition-all text-sm shadow-[0_0_20px_rgba(245,130,32,0.25)]"
                  >
                    Proceed to Checkout
                  </button>
                  <button onClick={() => alert('View Cart page coming soon!')} className="w-full bg-[#2ECC71] hover:bg-green-400 text-[#0D0D0D] font-black py-3 rounded-xl transition-all text-sm">
                    View Cart
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setWishlistOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#151515] border-l border-white/10 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-black text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" /> Your Wishlist
                  <span className="text-sm font-normal text-gray-400">({wishlist.length} items)</span>
                </h2>
                <button onClick={() => setWishlistOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {wishlist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-4">
                    <Heart className="w-16 h-16 opacity-20" />
                    <p>Your wishlist is empty</p>
                    <button onClick={() => setWishlistOpen(false)} className="text-[#2ECC71] text-sm hover:underline">Explore Products</button>
                  </div>
                ) : wishlist.map(id => {
                  const item = products.find(p => p.id === id);
                  if (!item) return null;
                  return (
                    <div key={item.id} className="bg-[#1A1A1A] p-3 rounded-xl border border-white/5 flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#111]">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.name}</p>
                        <EcoBadge score={item.ecoScore} />
                        <p className="text-[#2ECC71] font-bold text-sm mt-1">₹{item.price}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => handleBuyNow(item)} className="bg-[#2ECC71] text-[#0D0D0D] font-bold px-3 py-1.5 rounded-lg text-xs transition-colors">Buy</button>
                        <button onClick={() => toggleWishlist(item.id)} className="text-gray-500 hover:text-red-400 transition-colors text-xs text-center border border-white/10 rounded-lg py-1">Remove</button>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden" />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-3/4 max-w-sm bg-[#151515] border-r border-white/10 z-50 flex flex-col shadow-2xl md:hidden"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1A1A1A]">
                <h2 className="font-black text-lg flex items-center gap-2">
                  <span className="text-[#2ECC71]">Eco</span>Shop
                </h2>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <div className="px-5 pb-4 border-b border-white/5 space-y-3">
                  <button onClick={handleChangeLocation} className="flex items-center gap-3 text-sm text-gray-300 w-full text-left">
                    <MapPin className="w-4 h-4 text-[#2ECC71]" /> Deliver to {locationPincode}
                  </button>
                  <button onClick={() => { setMobileMenuOpen(false); setAuthModalOpen(true); }} className="flex items-center gap-3 text-sm text-gray-300 w-full text-left">
                    <ChevronDown className="w-4 h-4 text-[#2ECC71]" /> Hello, Guest Account
                  </button>
                  <button onClick={() => { setMobileMenuOpen(false); setAuthModalOpen(true); }} className="flex items-center gap-3 text-sm text-gray-300 w-full text-left">
                    <Truck className="w-4 h-4 text-[#2ECC71]" /> Returns & Orders
                  </button>
                </div>
                
                <h3 className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Categories</h3>
                <div className="space-y-1 px-3">
                  {['Deals of the Day', "Today's Offers", 'New Arrivals', 'Personal Care', 'Kitchen', 'Accessories', 'Stationery'].map(item => (
                    <button 
                      key={item} 
                      onClick={() => {
                        if (['Personal Care', 'Kitchen', 'Accessories', 'Stationery'].includes(item)) {
                          setActiveCategory(item);
                          scrollToProducts();
                          setMobileMenuOpen(false);
                        } else {
                          alert(`${item} section is currently being updated!`);
                        }
                      }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-[#2ECC71] hover:bg-white/5 rounded-lg transition-colors"
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

      {/* ── AUTHENTICATION MODAL ── */}
      <AnimatePresence>
        {authModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAuthModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#151515] border border-white/10 p-8 rounded-3xl z-[60] shadow-2xl"
            >
              <button onClick={() => setAuthModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-6">
                <div className="inline-flex bg-[#2ECC71]/10 p-3 rounded-full mb-3">
                  <Leaf className="w-8 h-8 text-[#2ECC71]" />
                </div>
                <h2 className="text-2xl font-black">{authMode === 'login' ? 'Welcome Back' : 'Join EcoShop'}</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {authMode === 'login' ? 'Sign in to access your eco-dashboard and orders.' : 'Create an account to track your environmental impact.'}
                </p>
              </div>

              <form onSubmit={e => { e.preventDefault(); alert(authMode === 'login' ? 'Logged in successfully! (Demo)' : 'Account created! (Demo)'); setAuthModalOpen(false); }} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Full Name</label>
                    <input type="text" required placeholder="John Doe" className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2ECC71] transition-colors" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
                  <input type="email" required placeholder="john@example.com" className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2ECC71] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Password</label>
                  <input type="password" required placeholder="••••••••" className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2ECC71] transition-colors" />
                </div>
                
                <button type="submit" className="w-full bg-[#2ECC71] hover:bg-green-400 text-[#0D0D0D] font-black py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(46,204,113,0.2)] mt-2">
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-400">
                {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-[#2ECC71] font-bold hover:underline">
                  {authMode === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ChatDrawer />
    </div>
  );
}
