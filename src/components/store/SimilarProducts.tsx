'use client';

import { similarProducts } from '@/lib/data';
import Image from 'next/image';
import { Star } from 'lucide-react';

export default function SimilarProducts() {
  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Similar Products</h2>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
          <div className="w-2 h-2 rounded-full bg-white/20"></div>
          <div className="w-2 h-2 rounded-full bg-white/20"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {similarProducts.map((product) => (
          <div key={product.id} className="bg-brand-card rounded-xl overflow-hidden border border-white/5 hover:border-brand-primary/50 transition-colors group cursor-pointer">
            <div className="aspect-square relative bg-white/5">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-white truncate">{product.name}</h3>
              <div className="flex items-center gap-1 text-yellow-500 text-sm">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-white">{product.rating}</span>
              </div>
              <div className="text-brand-primary font-bold">₹{product.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
