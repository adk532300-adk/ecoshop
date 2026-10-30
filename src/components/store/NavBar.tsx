'use client';

import { useState, useRef } from 'react';
import { Search, Image as ImageIcon, User, Leaf, Loader2, Scan } from 'lucide-react';
import Link from 'next/link';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

export default function NavBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      // Ensure backend is ready
      await tf.ready();
      
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const model = await mobilenet.load();
      const predictions = await model.classify(img);
      
      if (predictions && predictions.length > 0) {
        // Take the top prediction and use the first term (usually a general noun)
        const topMatch = predictions[0].className.split(',')[0];
        setSearchQuery(`Eco-friendly ${topMatch}`);
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <header className="w-full bg-[#0D0D0D]/90 backdrop-blur-md sticky top-0 z-40 border-b border-white/5">
      <div className="bg-[#121212] border-b border-white/5 text-[#2ECC71] text-center text-xs py-1.5 font-semibold tracking-wide flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
        <span>⚡ Zero-Server-GPU Edge Computer Vision • Real-Time Material Diagnostics • 100% Zero-Plastic Mission</span>
      </div>

      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/store" className="flex items-center gap-2 flex-shrink-0">
          <div className="bg-[#2ECC71] p-1.5 rounded-lg">
            <Leaf className="w-4 h-4 text-black" />
          </div>
          <span className="text-xl font-bold text-white hidden sm:block">
            <span className="text-[#2ECC71]">Eco</span>Shop
          </span>
        </Link>

        <div className="flex-1 max-w-2xl relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sustainable products or upload image..."
              className="w-full bg-[#181818] border border-white/10 rounded-full py-2 pl-10 pr-12 text-sm text-white focus:outline-none focus:border-[#2ECC71] transition-colors"
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
              title="Search by image (TensorFlow.js)"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin text-[#2ECC71]" /> : <ImageIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/scanner"
            className="flex items-center gap-1.5 bg-[#2ECC71] hover:bg-green-400 text-black font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(46,204,113,0.3)] hover:scale-105"
          >
            <Scan className="w-4 h-4" />
            <span className="hidden sm:inline">AI Vision Scanner</span>
          </Link>
          <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#2ECC71] transition-colors">
            <User className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
