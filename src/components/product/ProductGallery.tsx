'use client';

import { useState, useRef, MouseEvent } from 'react';
import Image from 'next/image';
import { ZoomIn, Leaf, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface ProductImageProps {
  imageUrl: string;
  productName: string;
  ecoScore: number;
  material: string;
}

export default function ProductImage({ imageUrl, productName, ecoScore, material }: ProductImageProps) {
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Single Realistic Product Image Container with Amazon/Flipkart Hover Zoom */}
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#141414] border border-white/10 group select-none shadow-2xl">
        {/* Top Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-md border border-[#2ECC71]/40 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
            <Leaf className="w-4 h-4 text-[#2ECC71]" />
            <span className="text-xs font-bold text-white">Eco Score: {ecoScore}</span>
          </div>
          <span className="bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/40 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md capitalize">
            100% {material}
          </span>
        </div>

        {/* Top-Right Authenticity Stamp */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-xs text-gray-300 pointer-events-none">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2ECC71]" />
          <span className="font-medium">Verified Authentic Photo</span>
        </div>

        {/* Hover-to-Zoom Image Viewport */}
        <div
          ref={imageContainerRef}
          className="relative w-full h-full cursor-crosshair overflow-hidden"
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
          onMouseMove={handleMouseMove}
        >
          <Image
            src={imageUrl}
            alt={productName}
            fill
            className={`object-cover transition-transform duration-100 ease-out ${
              isZooming ? 'scale-[2.2]' : 'scale-100'
            }`}
            style={
              isZooming
                ? {
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }
                : undefined
            }
            priority
            unoptimized
          />

          {/* Amazon/Flipkart Hover Zoom Indicator */}
          {!isZooming && (
            <div className="absolute bottom-4 right-4 z-10 pointer-events-none bg-black/70 backdrop-blur-sm border border-white/10 text-white/80 text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
              <ZoomIn className="w-3.5 h-3.5 text-[#2ECC71]" />
              <span>Roll over image to zoom</span>
            </div>
          )}
        </div>
      </div>

      {/* Product Image Sub-Banner */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl px-4 py-3 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2ECC71]" />
          <span>High-Resolution Studio Product View</span>
        </div>
        <span className="text-[11px] text-[#2ECC71] font-mono font-bold">100% Eco-Certified</span>
      </div>
    </div>
  );
}
