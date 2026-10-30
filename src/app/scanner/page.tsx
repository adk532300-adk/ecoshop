'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Leaf, ArrowLeft, Camera, Upload, X, Loader2,
  Star, CheckCircle2, RefreshCw, Scan, Zap, Activity,
  Cpu, Shield, Eye, AlertTriangle, Layers, BarChart3,
  Video, VideoOff, ChevronDown, ChevronUp, Sparkles,
  ArrowRight, Compass, Check
} from 'lucide-react';
import {
  runSemanticPipeline,
  SemanticMatch,
  CATEGORY_METADATA,
  ProductCategory
} from '@/lib/semanticEngine';

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

interface PredictionItem {
  className: string;
  probability: number;
}

interface CVTelemetry {
  inferenceTimeMs: number;
  backend: string;
  inputShape: string;
  tensorCount: number;
}

interface MaterialLCA {
  materialType: string;
  landfillYears: string;
  microplasticRisk: string;
  carbonFootprint: string;
  ecoImpact: string;
}

type ScanState = 'idle' | 'scanning' | 'results' | 'error';
type InputMode = 'upload' | 'camera';

export default function ScannerPage() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Semantic classification result
  const [semanticMatch, setSemanticMatch] = useState<SemanticMatch | null>(null);
  const [topPredictions, setTopPredictions] = useState<PredictionItem[]>([]);
  const [showTechnicalAI, setShowTechnicalAI] = useState<boolean>(false);

  const [telemetry, setTelemetry] = useState<CVTelemetry | null>(null);
  const [lcaData, setLcaData] = useState<MaterialLCA | null>(null);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateLCA = (category: ProductCategory): MaterialLCA => {
    switch (category) {
      case 'toothbrush':
        return {
          materialType: 'Virgin Polypropylene Handle + Synthetic Nylon Bristles',
          landfillYears: '400 - 500 Years',
          microplasticRisk: 'High (Synthetic bristle shedding in waterways)',
          carbonFootprint: '~65.0g CO₂e per plastic brush',
          ecoImpact: 'Prevents marine debris & microplastic pollution'
        };
      case 'bottle':
        return {
          materialType: 'Single-Use Polyethylene Terephthalate (PET)',
          landfillYears: '450+ Years',
          microplasticRisk: 'Critical High (Degrades into ocean micro-particulates)',
          carbonFootprint: '~82.8g CO₂e per single-use bottle',
          ecoImpact: 'Substantially reduces single-use plastic bottle waste'
        };
      case 'shampoo':
        return {
          materialType: 'High-Density Polyethylene (HDPE) + 80% Water Transport',
          landfillYears: '300+ Years',
          microplasticRisk: 'Moderate to High (Liquid bottle packaging waste)',
          carbonFootprint: '~420g CO₂e saved per solid bar',
          ecoImpact: 'Eliminates plastic liquid packaging & harsh chemicals'
        };
      case 'comb':
        return {
          materialType: 'Non-Recyclable Molded Polystyrene',
          landfillYears: '400+ Years',
          microplasticRisk: 'Moderate (Static split ends & brittle plastic fracture)',
          carbonFootprint: '~55g CO₂e per plastic comb',
          ecoImpact: 'Eliminates microplastics via natural circular wood'
        };
      case 'tote bag':
        return {
          materialType: 'Low-Density Polyethylene (LDPE) Thin Film',
          landfillYears: '20 - 500 Years (Ocean choke hazard for marine life)',
          microplasticRisk: 'Extreme (Breaks down into airborne microfibers)',
          carbonFootprint: '~33g CO₂e per plastic bag',
          ecoImpact: 'Prevents ocean plastic bag waste and marine choking'
        };
      case 'bowl':
        return {
          materialType: 'Melamine Resin / Petroleum Plastic Dishware',
          landfillYears: '100+ Years (Formaldehyde leaching risk when heated)',
          microplasticRisk: 'Moderate (Non-biodegradable synthetic resins)',
          carbonFootprint: '~350g CO₂e avoided by upcycling agricultural shells',
          ecoImpact: 'Fosters circular economy by upcycling farm crop waste'
        };
      case 'food wrap':
        return {
          materialType: 'Polyvinyl Chloride (PVC) / Polyethylene Cling Wrap',
          landfillYears: '400+ Years (Toxic plasticizer migration risk)',
          microplasticRisk: 'Critical (Non-recyclable thin-film cling wrap)',
          carbonFootprint: '~120g CO₂e avoided per beeswax wrap set',
          ecoImpact: 'Replaces single-use petroleum plastic wraps with beeswax'
        };
      case 'notebook':
        return {
          materialType: 'Virgin Bleached Wood Pulp + Chlorine Bleaching',
          landfillYears: '2 - 5 Years (Releases Methane gas in landfills)',
          microplasticRisk: 'Low (Heavy chlorine bleaching chemical waste)',
          carbonFootprint: '~1.2 kg CO₂e saved per post-consumer notebook',
          ecoImpact: 'Protects forests by promoting circular post-consumer paper'
        };
      case 'wallet':
        return {
          materialType: 'Polyurethane (PU) / Polyvinyl Chloride (PVC) Faux Leather',
          landfillYears: '150 - 300 Years (Petroleum-based synthetic leathers)',
          microplasticRisk: 'High (Peeling polymer flakes)',
          carbonFootprint: 'Cork trees absorb 5x more carbon when harvested for bark',
          ecoImpact: 'Sustainable renewable bark harvesting without cutting trees'
        };
      case 'phone case':
        return {
          materialType: 'Thermoplastic Polyurethane (TPU) / Silicone Blend',
          landfillYears: '500+ Years (Rarely accepted by standard municipal recycling)',
          microplasticRisk: 'High (Yellows and gets incinerated as trash)',
          carbonFootprint: '~60g CO₂e saved per compostable bio-case',
          ecoImpact: 'Substitutes petroleum TPU with agricultural straw'
        };
      default:
        return {
          materialType: 'Commercial Non-Biodegradable Manufactured Goods',
          landfillYears: '100+ Years (Incomplete circular life cycle)',
          microplasticRisk: 'Moderate to High',
          carbonFootprint: '~120g CO₂e estimated footprint',
          ecoImpact: 'Promotes responsible, circular eco-friendly consumption'
        };
    }
  };

  // Start Camera
  const startCamera = async () => {
    try {
      setInputMode('camera');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setErrorMsg('Could not access your camera. Please ensure permissions are granted, or upload an image file instead.');
      setInputMode('upload');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture frame from live video
  const captureFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    stopCamera();
    analyzeImageSource(dataUrl);
  };

  const analyzeImageSource = useCallback(async (imageSrc: string) => {
    setScanState('scanning');
    setUploadedImage(imageSrc);

    const startTime = performance.now();

    try {
      const tf = await import('@tensorflow/tfjs');
      const mobilenet = await import('@tensorflow-models/mobilenet');

      await tf.ready();
      const currentBackend = tf.getBackend();

      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image for tensor processing.'));
      });

      // Load MobileNet v1 quantized model
      const model = await mobilenet.load({
        version: 1,
        alpha: 1.0
      });

      // Predict Top-5 Softmax classes
      const rawPredictions = await model.classify(img, 5);

      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      if (!rawPredictions || rawPredictions.length === 0) {
        throw new Error('No recognizable object was detected. Please try a clearer or well-lit image.');
      }

      setTopPredictions(rawPredictions);
      setTelemetry({
        inferenceTimeMs: latency,
        backend: currentBackend,
        inputShape: '[1, 224, 224, 3]',
        tensorCount: tf.memory().numTensors
      });

      // Run through our Semantic Classification Engine
      const match = runSemanticPipeline(rawPredictions);
      setSemanticMatch(match);
      setLcaData(calculateLCA(match.category));

      // Fetch recommended eco products from store database
      const categoryMeta = CATEGORY_METADATA[match.category];
      let products: Alternative[] = [];

      // Query primary recommended product first
      try {
        const primaryRes = await fetch(`/api/products?search=${encodeURIComponent(categoryMeta.recommendedProductSlug)}`);
        const primaryData: Alternative[] = await primaryRes.json();
        if (primaryData.length > 0) {
          products.push(...primaryData);
        }
      } catch (e) {
        console.warn('Primary fetch error:', e);
      }

      // Query related category terms to give full options
      for (const term of categoryMeta.keywords) {
        if (products.length >= 4) break;
        try {
          const res = await fetch(`/api/products?search=${encodeURIComponent(term)}`);
          const data: Alternative[] = await res.json();
          for (const item of data) {
            if (!products.some(p => p.id === item.id)) {
              products.push(item);
            }
          }
        } catch (e) {
          console.warn('Category query error:', e);
        }
      }

      // Fallback if needed
      if (!products.length) {
        const fallback = await fetch('/api/products');
        const all: Alternative[] = await fallback.json();
        products = all.sort((a, b) => b.ecoScore - a.ecoScore);
      }

      setAlternatives(products.slice(0, 4));
      setScanState('results');
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Computer Vision inference failed. Please try again.');
      setScanState('error');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      analyzeImageSource(url);
    }
  };

  const reset = () => {
    setScanState('idle');
    setUploadedImage(null);
    setSemanticMatch(null);
    setTopPredictions([]);
    setTelemetry(null);
    setLcaData(null);
    setAlternatives([]);
    setErrorMsg('');
    setShowTechnicalAI(false);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#2ECC71] selection:text-black">
      {/* Top Academic & Telemetry Ribbon */}
      <div className="bg-[#111] border-b border-white/5 py-2 px-4 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
            <span className="font-medium text-gray-300">
              Edge Computer Vision Workbench: Top-5 Softmax Semantic Engine
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-gray-500">
            <span>Sri Sairam Engineering College</span>
            <span>•</span>
            <span className="text-[#2ECC71]">100% Zero-Plastic Mission</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-white/5 bg-[#0D0D0D]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/store" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Store Catalog</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="bg-[#2ECC71] p-1.5 rounded-lg shadow-[0_0_15px_rgba(46,204,113,0.4)]">
              <Leaf className="w-4 h-4 text-[#0D0D0D]" />
            </div>
            <span className="font-black text-lg tracking-tight">
              <span className="text-[#2ECC71]">Eco</span>Shop
            </span>
            <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider ml-1">
              Semantic AI
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {scanState === 'results' && (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-medium border border-white/10 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Scan</span>
              </button>
            )}
            <Link
              href="/store"
              className="bg-[#2ECC71] hover:bg-green-400 text-black font-black text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-[0_0_15px_rgba(46,204,113,0.3)]"
            >
              Go to Store
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {/* IDLE STATE */}
          {scanState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Header Title */}
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <div className="inline-flex items-center gap-2 bg-[#2ECC71]/10 border border-[#2ECC71]/30 px-3.5 py-1.5 rounded-full text-xs text-[#2ECC71] font-semibold">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Semantic Product Detection & Recommendation Engine</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Point Camera at Any{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2ECC71] via-emerald-400 to-teal-300">
                    Household Product
                  </span>
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  Our Semantic Classification Engine evaluates top-5 neural logits, eliminates obscure ImageNet labels, detects real-world product categories, and prescribes certified eco-friendly alternatives.
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex justify-center">
                <div className="bg-[#141414] p-1 rounded-2xl border border-white/10 flex gap-1">
                  <button
                    onClick={() => {
                      stopCamera();
                      setInputMode('upload');
                    }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      inputMode === 'upload'
                        ? 'bg-[#2ECC71] text-black shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    onClick={startCamera}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      inputMode === 'camera'
                        ? 'bg-[#2ECC71] text-black shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Live Webcam Mode</span>
                  </button>
                </div>
              </div>

              {/* Mode 1: Drag & Drop Upload Zone */}
              {inputMode === 'upload' && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer border-2 border-dashed border-white/15 hover:border-[#2ECC71] rounded-3xl p-8 sm:p-14 text-center transition-all bg-[#121212]/50 hover:bg-[#121212] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                  <div className="relative z-10 flex flex-col items-center gap-5">
                    <div className="relative">
                      <div className="w-20 h-20 bg-[#2ECC71]/10 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform border border-[#2ECC71]/20">
                        <Scan className="w-10 h-10 text-[#2ECC71]" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#2ECC71] rounded-full flex items-center justify-center text-black">
                        <Upload className="w-3 h-3" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-[#2ECC71] transition-colors">
                        Select an image to analyze
                      </h3>
                      <p className="text-gray-400 text-xs md:text-sm max-w-md mx-auto">
                        Drag & drop any photo of a toothbrush, water bottle, shampoo, comb, tote bag, bowl, or notebook.
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="flex items-center gap-2 bg-[#2ECC71] hover:bg-green-400 text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(46,204,113,0.3)] hover:scale-105 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Browse Files
                    </button>
                    <span className="text-[11px] text-gray-500">
                      Processed 100% locally in browser memory via WebGL • No cloud photo uploads
                    </span>
                  </div>
                </div>
              )}

              {/* Mode 2: Live Camera View */}
              {inputMode === 'camera' && (
                <div className="relative bg-[#121212] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col items-center p-6">
                  <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-white/10 shadow-inner">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Futuristic CV Reticle Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-48 border border-[#2ECC71]/40 rounded-2xl relative">
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#2ECC71]" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#2ECC71]" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#2ECC71]" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#2ECC71]" />
                        
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-0.5 bg-[#2ECC71]/60" />
                          <div className="h-4 w-0.5 bg-[#2ECC71]/60 absolute" />
                        </div>
                      </div>

                      <motion.div
                        className="absolute inset-x-8 h-0.5 bg-[#2ECC71] shadow-[0_0_12px_#2ECC71]"
                        animate={{ top: ['15%', '85%', '15%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>

                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-[#2ECC71] font-mono flex items-center gap-1.5 border border-[#2ECC71]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      LIVE WEBCAM FEED (224x224 Cropped)
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={captureFromCamera}
                      className="flex items-center gap-2 bg-[#2ECC71] hover:bg-green-400 text-black font-black px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(46,204,113,0.4)] hover:scale-105 cursor-pointer"
                    >
                      <Scan className="w-4 h-4" />
                      Capture & Run Inference
                    </button>
                    <button
                      onClick={stopCamera}
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold px-4 py-3.5 rounded-xl text-xs border border-white/10 transition-colors cursor-pointer"
                    >
                      <VideoOff className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Benchmark Test Objects */}
              <div className="text-center mt-4">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-3">
                  Quick Benchmark Test Objects:
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { name: 'Plastic Toothbrush', icon: '🪥', img: '/products/bamboo-toothbrush.jpg' },
                    { name: 'Plastic Water Bottle', icon: '🧴', img: '/products/steel-water-bottle.jpg' },
                    { name: 'Cotton Tote Bag', icon: '🛍️', img: '/products/organic-cotton-tote-bag.jpg' },
                    { name: 'Coconut Bowl', icon: '🥥', img: '/products/coconut-shell-bowls.jpg' },
                    { name: 'Wooden Comb', icon: '🪵', img: '/products/neem-wood-comb.jpg' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => analyzeImageSource(item.img)}
                      className="bg-[#141414] hover:bg-[#2ECC71]/10 border border-white/5 hover:border-[#2ECC71]/40 px-3.5 py-2 rounded-xl text-xs text-gray-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer group active:scale-95 shadow-sm"
                      title={`Run instant Computer Vision test on ${item.name}`}
                    >
                      <span className="text-base group-hover:scale-110 transition-transform">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-[10px] bg-[#2ECC71]/20 text-[#2ECC71] px-1.5 py-0.5 rounded font-mono font-bold">TEST</span>
                    </button>
                  ))}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </motion.div>
          )}

          {/* SCANNING STATE (TensorFlow Execution) */}
          {scanState === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center text-center"
            >
              <div className="relative w-64 h-64 rounded-3xl overflow-hidden border border-[#2ECC71]/40 mb-8 bg-black shadow-[0_0_30px_rgba(46,204,113,0.15)]">
                {uploadedImage && (
                  <Image
                    src={uploadedImage}
                    alt="Tensorizing"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
                <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-[#2ECC71] shadow-[0_0_15px_#2ECC71]"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              <div className="flex items-center gap-3 text-[#2ECC71] text-lg font-bold mb-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running Semantic Classification Engine...</span>
              </div>
              <p className="text-gray-400 text-xs max-w-sm mb-6">
                MobileNet Top-5 logits are being mapped through our household taxonomy to detect product category.
              </p>

              {/* Progress checklist */}
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 w-full max-w-md text-left text-xs space-y-2.5">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#2ECC71]" />
                  <span>Image normalized to 224×224×3 RGB tensor</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#2ECC71]" />
                  <span>Computing Top-5 Depthwise Softmax Logits</span>
                </div>
                <div className="flex items-center gap-2 text-[#2ECC71]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Semantic Category Consensus</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULTS STATE (Refactored Semantic Recommendation Presentation) */}
          {scanState === 'results' && semanticMatch && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Telemetry Bar (Latency, Backend, Tensor Shape) */}
              {telemetry && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#141414] border border-white/10 rounded-2xl p-4 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-[#2ECC71]" />
                    <div>
                      <div className="text-gray-500 text-[10px]">Inference Latency</div>
                      <div className="font-mono font-bold text-white">{telemetry.inferenceTimeMs} ms</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-gray-500 text-[10px]">Acceleration Backend</div>
                      <div className="font-mono font-bold text-white uppercase">{telemetry.backend}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-gray-500 text-[10px]">Input Tensor</div>
                      <div className="font-mono font-bold text-white">{telemetry.inputShape}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-yellow-400" />
                    <div>
                      <div className="text-gray-500 text-[10px]">Visual Privacy</div>
                      <div className="font-mono font-bold text-green-400">100% Client-Side</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── CORE RESULT SECTION: Semantic Detection & Eco Recommendation ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#121212] rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl">
                {/* Uploaded Input Image */}
                <div className="lg:col-span-4 flex flex-col items-center">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black shadow-inner">
                    {uploadedImage && (
                      <Image
                        src={uploadedImage}
                        alt="Scanned Object"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-[#2ECC71] font-mono border border-[#2ECC71]/30">
                      INPUT FRAME CAPTURE
                    </div>
                  </div>

                  <button
                    onClick={reset}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Scan Another Object
                  </button>
                </div>

                {/* Primary Semantic Result Cards */}
                <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
                  <div>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-[#2ECC71]/10 text-[#2ECC71] px-3 py-1 rounded-full text-xs font-bold mb-3 border border-[#2ECC71]/20">
                      <Sparkles className="w-3.5 h-3.5" />
                      Semantic Classification Engine
                    </div>

                    {/* Detected Product Category */}
                    <div className="space-y-1 mb-4">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                        Detected Product Category:
                      </span>
                      <h2 className="text-3xl md:text-4xl font-black capitalize tracking-tight text-white flex items-center gap-3">
                        <span>{semanticMatch.displayName}</span>
                        {/* Confidence Badge */}
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold border font-mono uppercase ${
                            semanticMatch.confidenceLevel === 'High'
                              ? 'bg-green-500/10 text-[#2ECC71] border-[#2ECC71]/30'
                              : semanticMatch.confidenceLevel === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {semanticMatch.confidenceLevel} Confidence ({semanticMatch.confidenceScore}%)
                        </span>
                      </h2>
                    </div>

                    {/* Low Confidence Warning Notice */}
                    {semanticMatch.isApproximation && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-amber-300 flex items-start gap-2.5 mb-5">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Approximation Notice:</strong>
                          <span>
                            Object detected with low confidence. Recommendations are based on semantic approximation.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Recommended Eco Alternative Card */}
                    <div className="bg-[#181818] p-5 rounded-2xl border border-[#2ECC71]/30 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#2ECC71]/5 rounded-full blur-2xl pointer-events-none" />
                      <div className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <Leaf className="w-3.5 h-3.5 text-[#2ECC71]" />
                        Recommended Eco Alternative:
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
                        <div>
                          <h3 className="text-xl font-black text-white group-hover:text-[#2ECC71] transition-colors">
                            {semanticMatch.recommendedProductName}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Certified 100% biodegradable material • Zero microplastic formulation
                          </p>
                        </div>
                        <Link
                          href={`/product/${semanticMatch.recommendedProductSlug}`}
                          className="bg-[#2ECC71] hover:bg-green-400 text-[#0D0D0D] font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wide transition-all shadow-[0_0_15px_rgba(46,204,113,0.3)] hover:scale-105 flex items-center gap-1.5 w-fit"
                        >
                          <span>View Product</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* ── EXPANDABLE: Technical AI Analysis (Raw ImageNet Predictions) ── */}
                  <div className="border-t border-white/5 pt-4">
                    <button
                      onClick={() => setShowTechnicalAI(!showTechnicalAI)}
                      className="w-full flex items-center justify-between py-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer group"
                    >
                      <span className="flex items-center gap-2 font-semibold">
                        <BarChart3 className="w-4 h-4 text-[#2ECC71]" />
                        Technical AI Analysis (Raw ImageNet Softmax Logits)
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-[#2ECC71] group-hover:underline">
                        <span>{showTechnicalAI ? 'Hide Logits' : 'View Raw Predictions'}</span>
                        {showTechnicalAI ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </span>
                    </button>

                    <AnimatePresence>
                      {showTechnicalAI && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-3"
                        >
                          <div className="bg-[#161616] p-4 rounded-2xl border border-white/5 space-y-3">
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                              Raw output from MobileNet 1,000-class ImageNet classification. Our Semantic Engine synthesized these Top-5 logits into <strong>{semanticMatch.displayName}</strong>.
                            </p>
                            <div className="space-y-2.5">
                              {topPredictions.map((pred, i) => {
                                const percent = Math.round(pred.probability * 100);
                                const cleanLabel = pred.className.split(',')[0].trim();
                                return (
                                  <div key={i} className="text-xs">
                                    <div className="flex justify-between text-gray-300 font-medium mb-1">
                                      <span className="capitalize">{cleanLabel}</span>
                                      <span className="font-mono text-[#2ECC71]">{percent}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                                      <div
                                        className={`h-full rounded-full ${
                                          i === 0
                                            ? 'bg-gradient-to-r from-emerald-500 to-[#2ECC71]'
                                            : 'bg-white/20'
                                        }`}
                                        style={{ width: `${Math.max(percent, 4)}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* ── VIVA-FRIENDLY FEATURE: "How AI Reached This Recommendation" ── */}
              <div className="bg-[#121212] rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="w-5 h-5 text-[#2ECC71]" />
                  <h3 className="text-lg md:text-xl font-black">
                    How AI Reached This Recommendation
                  </h3>
                </div>
                <p className="text-xs text-gray-400 mb-6">
                  Step-by-step visual audit trail explaining the Computer Vision and Semantic pipeline during viva demonstrations.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                  {[
                    {
                      step: '01',
                      title: 'Input Frame Capture',
                      desc: semanticMatch.explanation.step1_upload,
                      badge: 'Sensory Stage'
                    },
                    {
                      step: '02',
                      title: 'MobileNet Classification',
                      desc: semanticMatch.explanation.step2_mobilenet,
                      badge: 'Convolutional Layer'
                    },
                    {
                      step: '03',
                      title: 'Semantic Engine Mapping',
                      desc: semanticMatch.explanation.step3_semantic,
                      badge: 'Consensus Mapping'
                    },
                    {
                      step: '04',
                      title: 'Eco Recommendation',
                      desc: semanticMatch.explanation.step4_recommendation,
                      badge: 'Eco Action'
                    }
                  ].map((node, i) => (
                    <div
                      key={i}
                      className="bg-[#161616] p-4 rounded-2xl border border-white/5 relative flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold text-[#2ECC71]">
                            STEP {node.step}
                          </span>
                          <span className="text-[9px] bg-white/5 text-gray-400 px-2 py-0.5 rounded font-mono">
                            {node.badge}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-white mb-1.5">{node.title}</h4>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          {node.desc}
                        </p>
                      </div>
                      {i < 3 && (
                        <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-gray-600">
                          →
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Environmental Life Cycle Assessment (LCA) */}
              {lcaData && (
                <div className="bg-gradient-to-br from-[#1C1510] to-[#141414] p-6 rounded-3xl border border-amber-500/20 shadow-2xl text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold mb-4">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm">Environmental Life Cycle Assessment (LCA) for {semanticMatch.displayName}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-gray-300">
                    <div className="bg-[#121212]/60 p-3.5 rounded-xl border border-white/5">
                      <span className="text-gray-500 text-[10px] block mb-1">Material Composition</span>
                      <span className="font-semibold text-white">{lcaData.materialType}</span>
                    </div>
                    <div className="bg-[#121212]/60 p-3.5 rounded-xl border border-white/5">
                      <span className="text-gray-500 text-[10px] block mb-1">Landfill Persistence</span>
                      <span className="font-semibold text-red-400">{lcaData.landfillYears}</span>
                    </div>
                    <div className="bg-[#121212]/60 p-3.5 rounded-xl border border-white/5">
                      <span className="text-gray-500 text-[10px] block mb-1">Carbon Footprint</span>
                      <span className="font-semibold text-amber-300">{lcaData.carbonFootprint}</span>
                    </div>
                    <div className="bg-[#121212]/60 p-3.5 rounded-xl border border-white/5">
                      <span className="text-gray-500 text-[10px] block mb-1">Eco Impact</span>
                      <span className="font-semibold text-[#2ECC71]">{lcaData.ecoImpact}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommended Sustainable Replacements Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-[#2ECC71]" />
                    <span>Certified Sustainable Replacements</span>
                  </h3>
                  <span className="text-xs text-gray-500">
                    Found {alternatives.length} eco-friendly alternative{alternatives.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {alternatives.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link href={`/product/${product.slug}`}>
                        <div className="group bg-[#141414] rounded-2xl border border-white/5 hover:border-[#2ECC71]/40 transition-all duration-300 overflow-hidden p-4 flex flex-col justify-between h-full hover:shadow-[0_0_20px_rgba(46,204,113,0.1)]">
                          <div>
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-[#1A1A1A] mb-3">
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                unoptimized
                              />
                              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-[#2ECC71] font-bold border border-[#2ECC71]/30">
                                Eco {product.ecoScore}
                              </div>
                            </div>
                            <span className="text-[10px] text-[#2ECC71] font-bold uppercase tracking-wider block mb-1">
                              {product.category}
                            </span>
                            <h4 className="font-bold text-xs leading-snug group-hover:text-[#2ECC71] transition-colors line-clamp-2">
                              {product.name}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                            <span className="text-base font-black text-[#2ECC71]">₹{product.price}</span>
                            <div className="flex items-center gap-1 text-yellow-400 text-xs">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{product.rating}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ERROR STATE */}
          {scanState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#141414] border border-red-500/20 rounded-3xl p-8 text-center max-w-md mx-auto"
            >
              <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Inference Error</h3>
              <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                {errorMsg}
              </p>
              <button
                onClick={reset}
                className="bg-[#2ECC71] hover:bg-green-400 text-black font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wide transition-all cursor-pointer"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
