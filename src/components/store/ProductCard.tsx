'use client';

import { Star, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { featuredProduct } from '@/lib/data';

export default function ProductCard() {
  return (
    <div className="bg-brand-card rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row gap-8">
      {/* Product Image */}
      <div className="w-full md:w-1/2 aspect-square relative rounded-xl overflow-hidden bg-white/5">
        <Image
          src={featuredProduct.imageUrl}
          alt={featuredProduct.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{featuredProduct.name}</h1>
          <p className="text-brand-text-muted text-lg">{featuredProduct.description}</p>
        </div>

        <div className="flex items-end gap-4">
          <span className="text-4xl font-bold text-brand-primary">₹{featuredProduct.price}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-5 h-5 fill-current" />
            <span className="text-white font-medium ml-1">{featuredProduct.rating}</span>
            <span className="text-brand-text-muted text-sm">({featuredProduct.reviews.toLocaleString()} Reviews)</span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-green-500/10 text-brand-primary px-4 py-2 rounded-full w-fit border border-brand-primary/20">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold">Eco Score: {featuredProduct.ecoScore}</span>
        </div>

        <div className="flex gap-4 pt-4">
          <button className="flex-1 bg-brand-primary hover:bg-green-500 text-brand-bg font-bold py-3 px-6 rounded-lg transition-colors shadow-[0_0_15px_rgba(46,204,113,0.3)]">
            Buy Now
          </button>
          <button className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-lg transition-colors border border-white/10">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
