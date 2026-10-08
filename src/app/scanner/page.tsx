'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Leaf, ArrowLeft, Camera, Upload, X, Loader2,
  Star, CheckCircle2, RefreshCw, Scan, Zap
} from 'lucide-react';

interface Alternative {
  id: string;
  name: string;
  slug: string;
  price: number;
  rating: number;
  ecoScore: number;
  imageUrl: string;
  category: string;
  description: string;
}

type ScanState = 'idle' | 'scanning' | 'results' | 'error';

export default function ScannerPage() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectedItem, setDetectedItem] = useState<string>('');
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeImage = useCallback(async (file: File) => {
    setScanState('scanning');
    setUploadedImage(URL.createObjectURL(file));

    try {
      // Dynamically load TF.js to avoid SSR issues
      const tf = await import('@tensorflow/tfjs');
      const mobilenet = await import('@tensorflow-models/mobilenet');

      await tf.ready();
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.src = URL.createObjectURL(file);
      await new Promise<void>((resolve) => { img.onload = () => resolve(); });

      const model = await mobilenet.load();
      const predictions = await model.classify(img);

      if (!predictions || predictions.length === 0) {
        throw new Error('Could not identify the product. Please try a clearer image.');
      }

      const topLabel = predictions[0].className.split(',')[0].trim();
      setDetectedItem(topLabel);

      // Search our store for eco alternatives
      const res = await fetch(`/api/products?search=${encodeURIComponent(topLabel)}`);
      let products: Alternative[] = await res.json();

      // If no exact match, fetch all products as fallback
      if (!products.length) {
        const fallback = await fetch('/api/products');
        products = await fallback.json();
      }

      setAlternatives(products.slice(0, 4));
      setScanState('results');
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Could not analyze image. Please try again.');
      setScanState('error');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) analyzeImage(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) analyzeImage(file);
  };

  const reset = () => {
    setScanState('idle');
    setUploadedImage(null);
    setDetectedItem('');
    setAlternatives([]);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/store" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Store</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-[#2ECC71] p-1.5 rounded-md">
              <Leaf className="w-4 h-4 text-[#0D0D0D]" />
            </div>
            <span className="font-black text-xl tracking-tight">
              <span className="text-[#2ECC71]">Eco</span>Scanner
            </span>
          </div>
          <div className="w-24" />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-[#2ECC71]/10 border border-[#2ECC71]/20 text-[#2ECC71] px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <Zap className="w-4 h-4" />
            AI-Powered Eco Scanner
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Scan Any Product.<br />
            <span className="text-[#2ECC71]">Find a Greener Alternative.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Upload or take a photo of any product — our AI instantly identifies it and suggests the best eco-friendly alternatives from EcoShop.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* IDLE STATE: Upload Zone */}
          {scanState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div
                className="border-2 border-dashed border-white/10 hover:border-[#2ECC71]/50 rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 bg-[#111] hover:bg-[#151515] group"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-[#2ECC71]/10 rounded-full flex items-center justify-center group-hover:bg-[#2ECC71]/20 transition-colors">
                      <Scan className="w-12 h-12 text-[#2ECC71]" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#2ECC71] rounded-full flex items-center justify-center">
                      <Camera className="w-3 h-3 text-[#0D0D0D]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-[#2ECC71] transition-colors">
                      Drop image here or click to upload
                    </h3>
                    <p className="text-gray-500 text-sm">Supports JPG, PNG, WEBP • Max 10MB</p>
                  </div>
                  <div className="flex gap-4 flex-wrap justify-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="flex items-center gap-2 bg-[#2ECC71] hover:bg-green-400 text-[#0D0D0D] font-bold px-6 py-3 rounded-xl transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </button>
                  </div>
                </div>
              </div>

              {/* Example products */}
              <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm mb-4">Try scanning these common non-eco products:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {['🧴 Plastic Bottle', '🛍️ Plastic Bag', '🪥 Plastic Toothbrush', '📦 Styrofoam Cup', '🧻 Paper Towels'].map(item => (
                    <span key={item} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-sm text-gray-400">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </motion.div>
          )}

          {/* SCANNING STATE */}
          {scanState === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                {/* Uploaded Image */}
                {uploadedImage && (
                  <div className="relative w-64 h-64 rounded-2xl overflow-hidden border border-white/10">
                    <Image src={uploadedImage} alt="Scanning..." fill className="object-cover" unoptimized />
                    {/* Scan line animation */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#2ECC71]/20 to-transparent animate-pulse" />
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-[#2ECC71] shadow-[0_0_10px_#2ECC71]"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                )}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-[#2ECC71]/10 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[#2ECC71] animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Analyzing Product...</h3>
                    <p className="text-gray-400">AI is identifying your product and finding eco alternatives</p>
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-gray-500 text-left">
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> Loading AI model...</div>
                    <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-yellow-400" /> Classifying product...</div>
                    <div className="flex items-center gap-2 opacity-40"><CheckCircle2 className="w-4 h-4" /> Finding eco alternatives...</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULTS STATE */}
          {scanState === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Detected item */}
              <div className="flex flex-col md:flex-row gap-6 mb-8 bg-[#111] rounded-2xl p-6 border border-white/5">
                {uploadedImage && (
                  <div className="relative w-full md:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={uploadedImage} alt="Scanned" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded-full">Your product</div>
                  </div>
                )}
                <div className="flex flex-col justify-center gap-3">
                  <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold w-fit">
                    🔍 AI Detected
                  </div>
                  <h2 className="text-2xl font-black capitalize">{detectedItem}</h2>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    This product may not be eco-friendly. Here are <span className="text-[#2ECC71] font-bold">{alternatives.length} sustainable alternatives</span> we found in EcoShop for you!
                  </p>
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-fit"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Scan another product
                  </button>
                </div>
              </div>

              {/* Alternatives Grid */}
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-[#2ECC71]" />
                Eco-Friendly Alternatives
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {alternatives.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link href={`/product/${product.slug}`}>
                      <div className="group bg-[#111] rounded-2xl border border-white/5 hover:border-[#2ECC71]/40 hover:shadow-[0_0_20px_rgba(46,204,113,0.08)] transition-all duration-300 overflow-hidden flex gap-4 p-4">
                        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-[#1A1A1A]">
                          <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <span className="text-xs text-[#2ECC71] font-bold">{product.category}</span>
                            <h4 className="font-bold text-sm leading-snug mt-0.5 group-hover:text-[#2ECC71] transition-colors line-clamp-2">{product.name}</h4>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-lg font-black text-[#2ECC71]">₹{product.price}</span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-yellow-400 text-xs">
                                <Star className="w-3 h-3 fill-current" />
                                <span>{product.rating}</span>
                              </div>
                              <div className="bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/20">
                                🌿 {product.ecoScore}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Link href="/store" className="inline-flex items-center gap-2 text-[#2ECC71] hover:underline font-semibold">
                  View all eco products in store →
                </Link>
              </div>
            </motion.div>
          )}

          {/* ERROR STATE */}
          {scanState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Could Not Analyze Image</h3>
              <p className="text-gray-400 mb-6">{errorMsg || 'Please try again with a clearer photo.'}</p>
              <button
                onClick={reset}
                className="flex items-center gap-2 bg-[#2ECC71] text-[#0D0D0D] font-bold px-6 py-3 rounded-xl mx-auto hover:bg-green-400 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
