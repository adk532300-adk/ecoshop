'use client';

import { useState, useRef } from 'react';
import { Search, Image as ImageIcon, User, Leaf, Loader2 } from 'lucide-react';
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
    <header className="w-full bg-brand-bg/80 backdrop-blur-md sticky top-0 z-40 border-b border-brand-card">
      <div className="bg-brand-primary text-brand-bg text-center text-sm py-2 font-medium">
        Go Green, Live Clean! Up to 50% Off on Sustainable Products
      </div>

      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link href="/store" className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-brand-primary" />
          <span className="text-xl font-bold text-white hidden sm:block">EcoShop</span>
        </Link>

        <div className="flex-1 max-w-2xl relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-5 h-5 text-brand-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sustainable products..."
              className="w-full bg-brand-card border border-white/10 rounded-full py-2.5 pl-10 pr-12 text-white focus:outline-none focus:border-brand-primary transition-colors"
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
              className="absolute right-3 text-brand-text-muted hover:text-brand-primary transition-colors disabled:opacity-50"
              title="Search by image"
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full bg-brand-card border border-white/10 hover:border-brand-primary transition-colors">
            <User className="w-5 h-5 text-brand-text-muted hover:text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
