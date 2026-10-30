import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, Star, Leaf, CheckCircle2, ShieldCheck, Truck, RotateCcw,
  Sparkles, Award, Globe, TreePine
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import ProductImage from '@/components/product/ProductGallery';
import ProductActionButtons from './ProductActionButtons';
import { getProductSpecs } from '@/lib/productGallery';

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug }
  });

  if (!product) {
    notFound();
  }

  const detailsData = getProductSpecs(product.slug);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Top Vision Banner */}
      <div className="bg-[#111] border-b border-white/5 py-2 px-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
        <span>Verified Sustainable Sourcing • Zero Microplastic Formulation • 100% Zero-Plastic Mission</span>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/store" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Back to Store</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-[#2ECC71] p-1.5 rounded-md"><Leaf className="w-4 h-4 text-[#0D0D0D]" /></div>
            <span className="font-black text-xl tracking-tight"><span className="text-[#2ECC71]">Eco</span>Shop</span>
          </div>
          <Link
            href="/scanner"
            className="flex items-center gap-1.5 bg-[#2ECC71]/10 hover:bg-[#2ECC71]/20 border border-[#2ECC71]/30 text-[#2ECC71] text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI EcoScanner</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/store" className="hover:text-gray-300">Store</Link>
          <span>/</span>
          <span className="text-gray-400">{product.category}</span>
          <span>/</span>
          <span className="text-[#2ECC71] truncate">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column: Single Realistic Product Image with Zoom */}
          <div className="w-full lg:w-1/2">
            <ProductImage
              imageUrl={product.imageUrl}
              productName={product.name}
              ecoScore={product.ecoScore}
              material={product.material}
            />
          </div>

          {/* Right Column: Product Details, Pricing & Specs */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#2ECC71] text-xs font-bold tracking-wider uppercase bg-[#2ECC71]/10 px-2.5 py-1 rounded-full border border-[#2ECC71]/20">
                {product.category}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-yellow-400" />
                Verified Sustainable Choice
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-black mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Reviews */}
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/5">
              <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-400 px-2.5 py-1 rounded-md text-xs font-bold">
                <span>{product.rating}</span>
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-gray-400 text-xs">
                {product.reviews.toLocaleString()} verified customer ratings
              </span>
              <span className="text-xs text-gray-600">|</span>
              <span className="text-xs text-[#2ECC71] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Biodegradable Certified
              </span>
            </div>

            {/* Pricing Card */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl md:text-5xl font-black text-[#2ECC71]">₹{product.price}</span>
              <span className="text-gray-500 line-through text-lg">₹{Math.floor(product.price * 1.4)}</span>
              <span className="text-green-400 text-sm font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                Save 28%
              </span>
            </div>

            {/* Key Sustainability Impact Card */}
            <div className="grid grid-cols-2 gap-3 mb-6 bg-[#161616] p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center text-[#2ECC71]">
                  <TreePine className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-gray-400">Carbon Offset</div>
                  <div className="text-xs font-bold text-white">{detailsData.specs.carbonOffset}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-gray-400">Plastic Diverted</div>
                  <div className="text-xs font-bold text-white">{detailsData.specs.plasticDiverted}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Bullet Highlights ("About this item") */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                About this item
              </h3>
              <ul className="space-y-2">
                {detailsData.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="text-[#2ECC71] mt-0.5 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stock & Material info */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2.5 text-xs text-gray-300 bg-[#161616] p-3 rounded-xl border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-[#2ECC71] flex-shrink-0" />
                <div>
                  <span className="text-gray-500 block text-[10px]">Material</span>
                  <span className="font-semibold text-white capitalize">{product.material}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-300 bg-[#161616] p-3 rounded-xl border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-[#2ECC71] flex-shrink-0" />
                <div>
                  <span className="text-gray-500 block text-[10px]">Availability</span>
                  <span className={product.stock > 0 ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                    {product.stock > 0 ? `In Stock (${product.stock} units)` : "Backorder"}
                  </span>
                </div>
              </div>
            </div>

            {/* Purchase CTA Buttons (Interactive Cart, Buy Now, Quantity, Wishlist) */}
            <ProductActionButtons
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                ecoScore: product.ecoScore,
                imageUrl: product.imageUrl,
                category: product.category,
                material: product.material,
              }}
            />

            {/* Guarantees Strip */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/5">
              <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-white/[0.02]">
                <ShieldCheck className="w-5 h-5 text-[#2ECC71]" />
                <span className="text-[11px] text-gray-400 font-medium">100% Quality<br/>Certified</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-white/[0.02]">
                <Truck className="w-5 h-5 text-[#2ECC71]" />
                <span className="text-[11px] text-gray-400 font-medium">Carbon-Neutral<br/>Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-white/[0.02]">
                <RotateCcw className="w-5 h-5 text-[#2ECC71]" />
                <span className="text-[11px] text-gray-400 font-medium">Zero-Plastic<br/>Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details & Eco Specifications Table */}
        <section className="mt-16 pt-12 border-t border-white/10">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold mb-2">Technical Details & Eco Specifications</h2>
            <p className="text-gray-400 text-xs">
              Complete physical measurements, environmental life-cycle metrics, and independent lab certifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-5 py-3 bg-white/[0.02] border-b border-white/5 text-xs font-bold text-[#2ECC71] uppercase tracking-wider">
                Physical Specifications
              </div>
              <div className="divide-y divide-white/5 text-xs">
                <div className="grid grid-cols-3 px-5 py-3.5">
                  <span className="text-gray-400 font-medium">Dimensions</span>
                  <span className="col-span-2 text-white">{detailsData.specs.dimensions}</span>
                </div>
                <div className="grid grid-cols-3 px-5 py-3.5">
                  <span className="text-gray-400 font-medium">Item Weight</span>
                  <span className="col-span-2 text-white">{detailsData.specs.weight}</span>
                </div>
                <div className="grid grid-cols-3 px-5 py-3.5">
                  <span className="text-gray-400 font-medium">Material Composition</span>
                  <span className="col-span-2 text-white">{detailsData.specs.materialComposition}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-5 py-3 bg-white/[0.02] border-b border-white/5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Sustainability & Lifecycle Metrics
              </div>
              <div className="divide-y divide-white/5 text-xs">
                <div className="grid grid-cols-3 px-5 py-3.5">
                  <span className="text-gray-400 font-medium">Biodegradation</span>
                  <span className="col-span-2 text-white">{detailsData.specs.biodegradationTime}</span>
                </div>
                <div className="grid grid-cols-3 px-5 py-3.5">
                  <span className="text-gray-400 font-medium">Carbon Impact</span>
                  <span className="col-span-2 text-white">{detailsData.specs.carbonOffset}</span>
                </div>
                <div className="grid grid-cols-3 px-5 py-3.5">
                  <span className="text-gray-400 font-medium">Certifications</span>
                  <div className="col-span-2 flex flex-wrap gap-1.5">
                    {detailsData.specs.certifications.map((cert, i) => (
                      <span key={i} className="bg-[#2ECC71]/10 text-[#2ECC71] border border-[#2ECC71]/20 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Digital Material Passport & Zero-Waste Guarantee */}
          <div className="mt-8 bg-gradient-to-r from-emerald-950/40 via-[#132216] to-[#0D0D0D] p-6 rounded-2xl border border-[#2ECC71]/30">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#2ECC71] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  Digital Material Passport & Circular Guarantee
                </div>
                <h3 className="text-lg font-bold text-white">
                  Traceable Circular Supply Chain
                </h3>
                <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                  Unlike generic marketplaces where material origin is obfuscated, this item comes with verified agricultural by-product traceability, zero microplastic shed guarantee, and 100% plastic-free compostable transit packaging.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-[#181818] px-4 py-2.5 rounded-xl border border-white/10 text-center">
                  <span className="text-[10px] text-gray-400 uppercase block font-semibold">Microplastics</span>
                  <span className="text-xs font-black text-[#2ECC71] font-mono">0.00% Zero Shed</span>
                </div>
                <div className="bg-[#181818] px-4 py-2.5 rounded-xl border border-white/10 text-center">
                  <span className="text-[10px] text-gray-400 uppercase block font-semibold">Packaging</span>
                  <span className="text-xs font-black text-cyan-400 font-mono">100% Compostable</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
