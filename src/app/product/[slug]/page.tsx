import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star, Leaf, CheckCircle2, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import prisma from '@/lib/prisma';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug }
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/store" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Back to Store</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-[#2ECC71] p-1.5 rounded-md"><Leaf className="w-4 h-4 text-[#0D0D0D]" /></div>
            <span className="font-black text-xl tracking-tight"><span className="text-[#2ECC71]">Eco</span>Shop</span>
          </div>
          <div className="w-24"></div> {/* spacer for centering */}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left: Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#151515] border border-white/5">
              <Image 
                src={product.imageUrl} 
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                <Leaf className="w-4 h-4 text-[#2ECC71]" />
                <span className="text-xs font-bold text-white">Eco Score: {product.ecoScore}</span>
              </div>
            </div>
            {/* Thumbnail Placeholders */}
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`aspect-square rounded-xl border ${i === 0 ? 'border-[#2ECC71]' : 'border-white/10'} bg-[#151515] overflow-hidden relative opacity-${i === 0 ? '100' : '50'} hover:opacity-100 cursor-pointer transition-opacity`}>
                   <Image src={product.imageUrl} alt="thumbnail" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col pt-2 md:pt-6">
            
            <div className="mb-2 text-[#2ECC71] text-sm font-bold tracking-wider uppercase">
              {product.category}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">
                <span className="font-bold">{product.rating}</span>
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="text-gray-400 text-sm">{product.reviews.toLocaleString()} verified reviews</span>
            </div>
            
            <div className="flex items-end gap-3 mb-8">
              <span className="text-5xl font-black text-[#2ECC71]">₹{product.price}</span>
              <span className="text-gray-500 line-through text-xl pb-1">₹{Math.floor(product.price * 1.4)}</span>
              <span className="text-green-500 font-bold pb-1 ml-2">28% OFF</span>
            </div>
            
            <p className="text-gray-300 text-lg leading-relaxed mb-10">
              {product.description}
            </p>
            
            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-3 text-sm text-gray-300 bg-[#1A1A1A] p-4 rounded-2xl border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#2ECC71]" />
                <span className="font-medium text-white">Material:</span> <span className="capitalize">{product.material}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300 bg-[#1A1A1A] p-4 rounded-2xl border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#2ECC71]" />
                <span className="font-medium text-white">Stock Status:</span> 
                <span className={product.stock > 0 ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                  {product.stock > 0 ? `In Stock (${product.stock} units)` : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button className="flex-1 bg-[#2ECC71] hover:bg-green-400 text-[#0D0D0D] font-black py-4 px-8 rounded-2xl transition-all shadow-[0_0_20px_rgba(46,204,113,0.3)] text-lg">
                Buy Now
              </button>
              <button className="flex-1 bg-[#1A1A1A] hover:bg-[#252525] text-white font-bold py-4 px-8 rounded-2xl transition-all border border-white/10 text-lg">
                Add to Cart
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
              <div className="flex flex-col items-center justify-center text-center gap-2">
                <div className="bg-[#1A1A1A] p-3 rounded-full"><ShieldCheck className="w-6 h-6 text-[#2ECC71]" /></div>
                <span className="text-xs text-gray-400 font-medium">1 Year<br/>Warranty</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center gap-2">
                <div className="bg-[#1A1A1A] p-3 rounded-full"><Truck className="w-6 h-6 text-[#2ECC71]" /></div>
                <span className="text-xs text-gray-400 font-medium">Free<br/>Delivery</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center gap-2">
                <div className="bg-[#1A1A1A] p-3 rounded-full"><RotateCcw className="w-6 h-6 text-[#2ECC71]" /></div>
                <span className="text-xs text-gray-400 font-medium">7 Days<br/>Return</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
