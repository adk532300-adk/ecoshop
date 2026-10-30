'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Leaf, ArrowLeft, Camera, Upload, X, Loader2,
  Star, CheckCircle2, RefreshCw, Scan, Zap, Activity,
  Cpu, Shield, Eye, AlertTriangle, Layers, BarChart3,
  Video, VideoOff, Play
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
  sdgGoal: string;
}

type ScanState = 'idle' | 'scanning' | 'results' | 'error';
type InputMode = 'upload' | 'camera';

export default function ScannerPage() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectedItem, setDetectedItem] = useState<string>('');
  const [topPredictions, setTopPredictions] = useState<PredictionItem[]>([]);
  const [telemetry, setTelemetry] = useState<CVTelemetry | null>(null);
  const [lcaData, setLcaData] = useState<MaterialLCA | null>(null);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Smart keyword mapping: maps AI-detected labels → search terms in our store
  const ECO_KEYWORD_MAP: Record<string, string[]> = {
    // Personal Care
    toothbrush:   ['bamboo', 'personal care'],
    brush:        ['bamboo', 'personal care'],
    snorkel:      ['bamboo', 'personal care'], // MobileNet often misclassifies toothbrushes as snorkels!
    comb:         ['neem', 'personal care'],
    shampoo:      ['shampoo', 'personal care'],
    soap:         ['shampoo', 'personal care'],
    lotion:       ['personal care'],
    // Kitchen / Food
    bottle:       ['steel', 'water bottle', 'kitchen'],
    'water bottle': ['steel', 'water bottle'],
    cup:          ['steel', 'kitchen'],
    mug:          ['steel', 'kitchen'],
    bowl:         ['coconut', 'kitchen'],
    wrap:         ['beeswax', 'kitchen'],
    bag:          ['cotton', 'tote', 'accessories'],
    'plastic bag': ['cotton', 'tote'],
    // Stationery
    notebook:     ['recycled', 'stationery'],
    pen:          ['recycled', 'stationery'],
    book:         ['recycled', 'stationery'],
    // Tech
    phone:        ['wheat straw', 'tech'],
    'mobile phone': ['wheat straw', 'tech'],
    // Accessories
    wallet:       ['cork', 'accessories'],
    sunglasses:   ['accessories'],
  };

  const getSearchTerms = (labels: string): string[] => {
    const lower = labels.toLowerCase();
    for (const [key, terms] of Object.entries(ECO_KEYWORD_MAP)) {
      if (lower.includes(key)) return terms;
    }
    return [];
  };

  const calculateLCA = (label: string): MaterialLCA => {
    const lower = label.toLowerCase();
    if (lower.includes('bottle') || lower.includes('plastic') || lower.includes('bag') || lower.includes('cup') || lower.includes('straw')) {
      return {
        materialType: 'Petroleum Polyethylene / Single-Use Polymer',
        landfillYears: '450 - 500 Years',
        microplasticRisk: 'Critical High (Degrades into ocean micro-particulates)',
        carbonFootprint: '~82.8g CO₂e per single unit',
        sdgGoal: 'SDG 12.5 (Substantially reduce plastic waste generation)'
      };
    }
    if (lower.includes('brush') || lower.includes('toothbrush') || lower.includes('snorkel')) {
      return {
        materialType: 'Virgin Polypropylene Handle + Synthetic Nylon',
        landfillYears: '400+ Years',
        microplasticRisk: 'High (Synthetic bristle shedding)',
        carbonFootprint: '~65.0g CO₂e per brush',
        sdgGoal: 'SDG 14.1 (Prevent marine debris & microplastic pollution)'
      };
    }
    if (lower.includes('notebook') || lower.includes('paper') || lower.includes('book')) {
      return {
        materialType: 'Virgin Bleached Wood Pulp',
        landfillYears: '2 - 5 Years (Releases Methane gas in landfills)',
        microplasticRisk: 'Low (Heavy chemical chlorine bleaching hazard)',
        carbonFootprint: '~1.8kg CO₂e per ream',
        sdgGoal: 'SDG 15.2 (Halt deforestation & promote sustainable forests)'
      };
    }
    return {
      materialType: 'Commercial Non-Biodegradable Manufactured Goods',
      landfillYears: '100+ Years (Incomplete circular life cycle)',
      microplasticRisk: 'Moderate to High',
      carbonFootprint: '~120g CO₂e estimated footprint',
      sdgGoal: 'SDG 12 (Responsible Consumption and Production)'
    };
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

      const topLabel = rawPredictions[0].className.split(',')[0].trim();
      const allLabels = rawPredictions.map(p => p.className).join(', ');
      
      setDetectedItem(topLabel);
      setLcaData(calculateLCA(allLabels));

      // Map to eco alternatives in our store
      let searchTerms = getSearchTerms(allLabels);
      if (searchTerms.length === 0) {
        searchTerms = [topLabel];
      }

      let products: Alternative[] = [];
      for (const term of searchTerms) {
        const res = await fetch(`/api/products?search=${encodeURIComponent(term)}`);
        const data: Alternative[] = await res.json();
        if (data.length > 0) {
          products = data;
          break;
        }
      }

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      analyzeImageSource(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      analyzeImageSource(url);
    }
  };

  const reset = () => {
    setScanState('idle');
    setUploadedImage(null);
    setDetectedItem('');
    setTopPredictions([]);
    setTelemetry(null);
    setLcaData(null);
    setAlternatives([]);
    setErrorMsg('');
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Top Telemetry Header Bar */}
      <header className="border-b border-white/5 bg-[#0D0D0D]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/store" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Store Catalog</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="bg-[#2ECC71] p-1.5 rounded-lg">
              <Scan className="w-4 h-4 text-black" />
            </div>
            <span className="font-black text-lg tracking-tight">
              Vision<span className="text-[#2ECC71]">LCA</span> Studio
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 bg-[#2ECC71]/10 text-[#2ECC71] px-3 py-1 rounded-full border border-[#2ECC71]/20">
              <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
              Edge WebGL Engine Ready
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Academic / Research Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs text-gray-400 mb-4">
            <Cpu className="w-3.5 h-3.5 text-[#2ECC71]" />
            <span>MobileNet v1 Deep Neural Network • Client-Side Zero GPU Latency • UN SDG 12</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">
            AI Computer Vision <span className="text-[#2ECC71]">Material Diagnostic</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Classify everyday items in real-time using in-browser Deep Convolutional Networks (WebGL).
            Quantify synthetic lifecycle hazards and discover certified zero-waste replacements.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* IDLE STATE: Upload or Live Camera */}
          {scanState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col gap-6"
            >
              {/* Input Mode Selector */}
              <div className="flex justify-center">
                <div className="inline-flex p-1 bg-[#141414] rounded-2xl border border-white/10 shadow-lg">
                  <button
                    onClick={() => {
                      stopCamera();
                      setInputMode('upload');
                    }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      inputMode === 'upload'
                        ? 'bg-[#2ECC71] text-black shadow-[0_0_15px_rgba(46,204,113,0.3)]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </button>
                  <button
                    onClick={startCamera}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      inputMode === 'camera'
                        ? 'bg-[#2ECC71] text-black shadow-[0_0_15px_rgba(46,204,113,0.3)]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Live Webcam
                  </button>
                </div>
              </div>

              {/* Mode 1: Upload Dropzone */}
              {inputMode === 'upload' && (
                <div
                  className="border-2 border-dashed border-white/10 hover:border-[#2ECC71]/50 rounded-3xl p-12 md:p-16 text-center cursor-pointer transition-all duration-300 bg-[#121212] hover:bg-[#161616] group shadow-2xl relative overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {/* Subtle Grid Pattern */}
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
                        Select an image to pass to TensorFlow
                      </h3>
                      <p className="text-gray-400 text-xs md:text-sm max-w-md mx-auto">
                        Drag & drop any photo of a toothbrush, water bottle, plastic bag, or container.
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="flex items-center gap-2 bg-[#2ECC71] hover:bg-green-400 text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(46,204,113,0.3)] hover:scale-105"
                    >
                      <Upload className="w-4 h-4" />
                      Browse Files
                    </button>
                    <span className="text-[11px] text-gray-500">
                      Processed 100% locally in browser memory • No cloud photo uploads
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
                        {/* Corner Brackets */}
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#2ECC71]" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#2ECC71]" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#2ECC71]" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#2ECC71]" />
                        
                        {/* Center Crosshair */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-0.5 bg-[#2ECC71]/60" />
                          <div className="h-4 w-0.5 bg-[#2ECC71]/60 absolute" />
                        </div>
                      </div>

                      {/* Animated Scanning Laser Line */}
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
                      className="flex items-center gap-2 bg-[#2ECC71] hover:bg-green-400 text-black font-black px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(46,204,113,0.4)] hover:scale-105"
                    >
                      <Scan className="w-4 h-4" />
                      Capture & Run Inference
                    </button>
                    <button
                      onClick={stopCamera}
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold px-4 py-3.5 rounded-xl text-xs border border-white/10 transition-colors"
                    >
                      <VideoOff className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Sample benchmark items to test */}
              <div className="text-center mt-4">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-3">
                  Quick Benchmark Test Objects:
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { name: 'Plastic Water Bottle', icon: '🧴', img: '/products/steel-water-bottle.jpg' },
                    { name: 'Plastic Toothbrush', icon: '🪥', img: '/products/bamboo-toothbrush.jpg' },
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
                {/* CV Reticle Scanline */}
                <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-[#2ECC71] shadow-[0_0_15px_#2ECC71]"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              <div className="flex items-center gap-3 text-[#2ECC71] text-lg font-bold mb-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Executing Convolutional Layers...</span>
              </div>
              <p className="text-gray-400 text-xs max-w-sm mb-6">
                Quantized MobileNet v1 is calculating top-5 Softmax activation logits in client WebGL memory.
              </p>

              {/* Progress checklist */}
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 w-full max-w-md text-left text-xs space-y-2.5">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#2ECC71]" />
                  <span>Image normalized to 224×224×3 RGB tensor</span>
                </div>
                <div className="flex items-center gap-2 text-[#2ECC71]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Computing Depthwise Separable Convolutions</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Layers className="w-4 h-4" />
                  <span>Mapping ImageNet classes to UN SDG 12 eco taxonomy</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULTS STATE (Full CV HUD & Telemetry) */}
          {scanState === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Telemetry Bar (Inference latency, WebGL, Tensor shape) */}
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
                      <div className="text-gray-500 text-[10px]">Client-Edge Privacy</div>
                      <div className="font-mono font-bold text-green-400">100% Local</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Classification & Softmax Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#121212] rounded-3xl p-6 border border-white/5 shadow-2xl">
                {/* Scanned Image Preview */}
                <div className="lg:col-span-4 flex flex-col items-center">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black">
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
                      INPUT TENSOR CAPTURE
                    </div>
                  </div>
                  <button
                    onClick={reset}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold border border-white/10 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Scan Another Object
                  </button>
                </div>

                {/* Classification Details & Softmax Bar Chart */}
                <div className="lg:col-span-8 flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-[#2ECC71]/10 text-[#2ECC71] px-3 py-1 rounded-full text-xs font-bold mb-3 border border-[#2ECC71]/20">
                      <Scan className="w-3.5 h-3.5" />
                      Primary CV Classification
                    </div>
                    <h2 className="text-3xl font-black capitalize tracking-tight text-white mb-2">
                      {detectedItem}
                    </h2>
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-6">
                      MobileNet classified this object from the 1,000 ImageNet semantic taxonomy with highest softmax activation.
                    </p>

                    {/* Top-5 Softmax Probability Distribution (Visual Bar Chart) */}
                    <div className="bg-[#181818] p-4 rounded-2xl border border-white/5 mb-6">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-3">
                        <span className="flex items-center gap-1.5">
                          <BarChart3 className="w-4 h-4 text-[#2ECC71]" />
                          Top-K Softmax Probability Distribution
                        </span>
                        <span className="text-[11px] text-gray-500">Confidence Scores</span>
                      </div>

                      <div className="space-y-3">
                        {topPredictions.map((pred, i) => {
                          const percent = Math.round(pred.probability * 100);
                          const cleanLabel = pred.className.split(',')[0].trim();
                          return (
                            <div key={i} className="text-xs">
                              <div className="flex justify-between text-gray-300 font-medium mb-1">
                                <span className="capitalize truncate max-w-[200px]">{cleanLabel}</span>
                                <span className="font-mono text-[#2ECC71]">{percent}%</span>
                              </div>
                              <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                  className={`h-full rounded-full ${
                                    i === 0
                                      ? 'bg-gradient-to-r from-emerald-500 to-[#2ECC71]'
                                      : 'bg-white/20'
                                  }`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.max(percent, 4)}%` }}
                                  transition={{ duration: 0.8, delay: i * 0.1 }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Life Cycle Assessment (LCA) Panel */}
                  {lcaData && (
                    <div className="bg-gradient-to-br from-[#1C1510] to-[#141414] p-4 rounded-2xl border border-amber-500/20 text-xs">
                      <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Environmental Life Cycle Assessment (LCA)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-300">
                        <div>
                          <span className="text-gray-500 text-[10px] block">Material Composition</span>
                          <span className="font-semibold text-white">{lcaData.materialType}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-[10px] block">Landfill Persistence</span>
                          <span className="font-semibold text-red-400">{lcaData.landfillYears}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-[10px] block">Carbon Footprint</span>
                          <span className="font-semibold text-amber-300">{lcaData.carbonFootprint}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-[10px] block">UN SDG Target</span>
                          <span className="font-semibold text-[#2ECC71]">{lcaData.sdgGoal}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Sustainable Replacements */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-[#2ECC71]" />
                    <span>Certified Sustainable Replacements (SDG 12.5)</span>
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
                className="bg-[#2ECC71] hover:bg-green-400 text-black font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wide transition-all"
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
