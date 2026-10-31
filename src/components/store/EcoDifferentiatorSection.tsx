'use client';

import { useState } from 'react';
import {
  Sparkles, Zap, Leaf, Check,
  ArrowRight, ShoppingCart,
  Layers, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  rating: number;
  reviews: number;
  ecoScore: number;
  description: string;
  category: string;
  imageUrl: string;
  stock: number;
  featured: boolean;
}

interface EcoDifferentiatorSectionProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

interface PlasticItem {
  id: string;
  name: string;
  plasticGramPerYear: number;
  microplasticsPerYear: number;
  landfillYears: number;
  co2eGramPerYear: number;
  slug: string;
  ecoAlternativeName: string;
}

const PLASTIC_AUDIT_ITEMS: PlasticItem[] = [
  {
    id: 'toothbrush',
    name: 'Plastic Toothbrushes (4x / year)',
    plasticGramPerYear: 120,
    microplasticsPerYear: 32000,
    landfillYears: 450,
    co2eGramPerYear: 260,
    slug: 'bamboo-toothbrush',
    ecoAlternativeName: 'Bamboo Toothbrush'
  },
  {
    id: 'bottle',
    name: 'Single-Use Water Bottles (120x / year)',
    plasticGramPerYear: 2400,
    microplasticsPerYear: 180000,
    landfillYears: 500,
    co2eGramPerYear: 9900,
    slug: 'steel-water-bottle',
    ecoAlternativeName: 'Steel Water Bottle'
  },
  {
    id: 'shampoo',
    name: 'Liquid Shampoo Bottles (12x / year)',
    plasticGramPerYear: 960,
    microplasticsPerYear: 45000,
    landfillYears: 400,
    co2eGramPerYear: 5040,
    slug: 'shampoo-bar',
    ecoAlternativeName: 'Organic Shampoo Bar'
  },
  {
    id: 'bags',
    name: 'Plastic Carry Bags (150x / year)',
    plasticGramPerYear: 1200,
    microplasticsPerYear: 120000,
    landfillYears: 300,
    co2eGramPerYear: 4950,
    slug: 'organic-cotton-tote-bag',
    ecoAlternativeName: 'Organic Cotton Tote Bag'
  },
  {
    id: 'wrap',
    name: 'PVC Cling Wrap Rolls (6x / year)',
    plasticGramPerYear: 720,
    microplasticsPerYear: 60000,
    landfillYears: 450,
    co2eGramPerYear: 2160,
    slug: 'beeswax-food-wraps',
    ecoAlternativeName: 'Beeswax Food Wraps'
  },
  {
    id: 'case',
    name: 'Silicone/TPU Phone Cases (2x / year)',
    plasticGramPerYear: 80,
    microplasticsPerYear: 15000,
    landfillYears: 500,
    co2eGramPerYear: 380,
    slug: 'wheat-straw-phone-case',
    ecoAlternativeName: 'Wheat Straw Case'
  }
];

export default function EcoDifferentiatorSection({ products, onAddToCart }: EcoDifferentiatorSectionProps) {
  // Plastic Audit state
  const [selectedItems, setSelectedItems] = useState<string[]>([
    'toothbrush',
    'bottle',
    'bags'
  ]);
  const [bundleAdded, setBundleAdded] = useState(false);

  // Material truth comparison tab state
  const [activeCompareTab, setActiveCompareTab] = useState<'toothbrush' | 'bottle' | 'shampoo'>('toothbrush');

  const toggleItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Calculations
  const totalPlasticGrams = selectedItems.reduce((acc, id) => {
    const item = PLASTIC_AUDIT_ITEMS.find(p => p.id === id);
    return acc + (item?.plasticGramPerYear || 0);
  }, 0);

  const totalMicroplastics = selectedItems.reduce((acc, id) => {
    const item = PLASTIC_AUDIT_ITEMS.find(p => p.id === id);
    return acc + (item?.microplasticsPerYear || 0);
  }, 0);

  const totalCo2e = selectedItems.reduce((acc, id) => {
    const item = PLASTIC_AUDIT_ITEMS.find(p => p.id === id);
    return acc + (item?.co2eGramPerYear || 0);
  }, 0);

  // Add bundle to cart
  const handleAddBundle = () => {
    const matchedProducts = selectedItems
      .map(id => {
        const auditItem = PLASTIC_AUDIT_ITEMS.find(p => p.id === id);
        return products.find(p => p.slug === auditItem?.slug);
      })
      .filter((p): p is Product => Boolean(p));

    matchedProducts.forEach(prod => onAddToCart(prod));
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 3500);
  };

  return (
    <section className="space-y-12">
      {/* ── 1. WHAT MAKES ECOSHOP DIFFERENT HEADER ── */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#2ECC71]/10 border border-[#2ECC71]/20 px-3.5 py-1.5 rounded-full text-xs text-[#2ECC71] font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          The Sustainable Commerce Revolution
        </div>
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
          Why EcoShop is <span className="text-[#2ECC71]">Fundamentally Different</span> From Traditional Stores
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
          Traditional e-commerce platforms sell you convenience at the cost of plastic pollution. 
          EcoShop integrates Edge Computer Vision, radical material transparency, and certified zero-waste packaging.
        </p>
      </div>

      {/* ── 2. INTERACTIVE HOUSEHOLD PLASTIC AUDIT CALCULATOR ── */}
      <div className="bg-[#121212] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#2ECC71]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
          {/* Left: Checklist */}
          <div className="w-full lg:w-7/12 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#2ECC71] uppercase tracking-wider mb-1">
                <Layers className="w-4 h-4" />
                Interactive Diagnostic Tool
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Personal Plastic Audit & Swap Calculator
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                Select the everyday plastic products currently in your home to see your annual footprint and instant bio-swaps:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {PLASTIC_AUDIT_ITEMS.map(item => {
                const isSelected = selectedItems.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2ECC71]/10 border-[#2ECC71]/40 text-white shadow-[0_0_15px_rgba(46,204,113,0.1)]'
                        : 'bg-[#181818] border-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isSelected ? 'bg-[#2ECC71] text-black font-bold' : 'border border-gray-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold leading-tight text-white mb-0.5">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-1.5">
                        <span>Swap for:</span>
                        <span className="text-[#2ECC71] font-medium">{item.ecoAlternativeName}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Dynamic Impact HUD */}
          <div className="w-full lg:w-5/12 bg-[#181818] rounded-2xl p-6 border border-[#2ECC71]/20 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-between">
                <span>Annual Diverted Footprint</span>
                <span className="text-[#2ECC71] font-mono text-[11px]">
                  {selectedItems.length} Swaps Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#121212] p-3.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Plastic Waste Saved</div>
                  <div className="text-2xl font-black font-mono text-[#2ECC71] mt-0.5">
                    {(totalPlasticGrams / 1000).toFixed(1)} <span className="text-xs font-normal text-gray-400">kg/yr</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">Diverted from city landfills</div>
                </div>

                <div className="bg-[#121212] p-3.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Microplastics Blocked</div>
                  <div className="text-2xl font-black font-mono text-cyan-400 mt-0.5">
                    {(totalMicroplastics / 1000).toFixed(0)}k <span className="text-xs font-normal text-gray-400">particles</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">Ocean & water protection</div>
                </div>

                <div className="bg-[#121212] p-3.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">CO₂ Emissions Avoided</div>
                  <div className="text-2xl font-black font-mono text-amber-400 mt-0.5">
                    {(totalCo2e / 1000).toFixed(1)} <span className="text-xs font-normal text-gray-400">kg CO₂e</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">Cleaner manufacturing</div>
                </div>

                <div className="bg-[#121212] p-3.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Landfill Decay Saved</div>
                  <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                    450+ <span className="text-xs font-normal text-gray-400">years</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">Zero non-biodegradable trash</div>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div>
              <button
                onClick={handleAddBundle}
                disabled={selectedItems.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-[#2ECC71] hover:bg-green-400 disabled:bg-gray-800 disabled:text-gray-500 text-black font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(46,204,113,0.3)] hover:scale-[1.02] cursor-pointer"
              >
                {bundleAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Bundle Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add {selectedItems.length} Eco Swaps to Cart</span>
                  </>
                )}
              </button>
              <div className="text-[10px] text-gray-500 text-center mt-2">
                100% Plastic-Free Compostable Shipping Included
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. MATERIAL TRUTH: PLASTIC VS BIODEGRADABLE SHOWDOWN ── */}
      <div className="bg-[#141414] rounded-3xl p-6 sm:p-8 border border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold text-[#2ECC71] uppercase tracking-wider block mb-1">
              Material Transparency Showdown
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Conventional Plastic vs EcoShop Natural Material
            </h3>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 bg-[#0D0D0D] p-1.5 rounded-xl border border-white/10 w-fit">
            {[
              { id: 'toothbrush', label: 'Toothbrush' },
              { id: 'bottle', label: 'Water Bottle' },
              { id: 'shampoo', label: 'Shampoo' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCompareTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeCompareTab === tab.id
                    ? 'bg-[#2ECC71] text-black shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plastic Column */}
          <div className="bg-[#1A1110] rounded-2xl p-5 border border-red-500/20 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Everyday Synthetic Plastic
              </span>
              <span className="text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                Petroleum Derivative
              </span>
            </div>

            {activeCompareTab === 'toothbrush' && (
              <div className="space-y-3 text-xs text-gray-300">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Material Composition:</span>
                  <span className="font-medium text-white">Polypropylene + Nylon-4 Bristles</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Decomposition Time:</span>
                  <span className="font-mono text-red-400 font-bold">450 - 500 Years</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Microplastic Leaching:</span>
                  <span className="text-red-300 font-medium">Sheds ~32,000 particles into gums/gut</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Recyclability:</span>
                  <span className="text-red-400 font-bold">0% (Rejected by municipal recycling)</span>
                </div>
              </div>
            )}

            {activeCompareTab === 'bottle' && (
              <div className="space-y-3 text-xs text-gray-300">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Material Composition:</span>
                  <span className="font-medium text-white">PET Polymer (Polyethylene Terephthalate)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Decomposition Time:</span>
                  <span className="font-mono text-red-400 font-bold">450+ Years</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Chemical Hazard:</span>
                  <span className="text-red-300 font-medium">Antimony leaching when exposed to sunlight</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ocean Fate:</span>
                  <span className="text-red-400 font-bold">Breaks down into secondary microplastics</span>
                </div>
              </div>
            )}

            {activeCompareTab === 'shampoo' && (
              <div className="space-y-3 text-xs text-gray-300">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Bottle Material:</span>
                  <span className="font-medium text-white">HDPE Plastic + Pump Springs</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Water Transport Waste:</span>
                  <span className="font-mono text-red-400 font-bold">80% Water (Shipping heavy water carbon)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Chemical Preservatives:</span>
                  <span className="text-red-300 font-medium">Sulfates & synthetic parabens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Packaging Landfill Fate:</span>
                  <span className="text-red-400 font-bold">300+ Years in landfills</span>
                </div>
              </div>
            )}
          </div>

          {/* EcoShop Natural Material Column */}
          <div className="bg-[#0D1F13] rounded-2xl p-5 border border-[#2ECC71]/30 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#2ECC71] uppercase tracking-wider flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5" />
                EcoShop Certified Alternative
              </span>
              <span className="text-[10px] font-mono bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30 px-2 py-0.5 rounded-full font-bold">
                100% Bio-Circular
              </span>
            </div>

            {activeCompareTab === 'toothbrush' && (
              <div className="space-y-3 text-xs text-gray-300">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Material Composition:</span>
                  <span className="font-medium text-white">100% Organic Moso Bamboo + Charcoal</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Decomposition Time:</span>
                  <span className="font-mono text-[#2ECC71] font-bold">180 Days in home compost</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Microplastic Leaching:</span>
                  <span className="text-[#2ECC71] font-medium">Absolute Zero (Certified natural plant fibers)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Soil Regeneration:</span>
                  <span className="text-[#2ECC71] font-bold">Enriches garden soil with organic matter</span>
                </div>
              </div>
            )}

            {activeCompareTab === 'bottle' && (
              <div className="space-y-3 text-xs text-gray-300">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Material Composition:</span>
                  <span className="font-medium text-white">Food-Grade 304 Stainless Steel</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Durability / Lifespan:</span>
                  <span className="font-mono text-[#2ECC71] font-bold">10+ Years of daily reuse</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Chemical Hazard:</span>
                  <span className="text-[#2ECC71] font-medium">100% BPA & phthalate-free, non-toxic</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Plastic Displacement:</span>
                  <span className="text-[#2ECC71] font-bold">Replaces ~1,400 disposable bottles</span>
                </div>
              </div>
            )}

            {activeCompareTab === 'shampoo' && (
              <div className="space-y-3 text-xs text-gray-300">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Product Format:</span>
                  <span className="font-medium text-white">Solid Cold-Pressed Botanical Bar</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Packaging Format:</span>
                  <span className="font-mono text-[#2ECC71] font-bold">Zero Plastic (Recycled paper wrap)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Ingredients:</span>
                  <span className="text-[#2ECC71] font-medium">Argan oil, neem extract, rosemary</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lifespan:</span>
                  <span className="text-[#2ECC71] font-bold">Outlasts 3 liquid plastic bottles</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Vision Shortcut Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#102414] to-[#0D0D0D] p-6 rounded-3xl border border-[#2ECC71]/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="bg-[#2ECC71] p-3 rounded-2xl text-black">
            <Zap className="w-5 h-5 fill-black" />
          </div>
          <div>
            <div className="text-base font-black text-white">Experience the Difference: Try the AI EcoScanner</div>
            <div className="text-xs text-gray-300">Point your camera at any everyday item to run instant real-time material classification.</div>
          </div>
        </div>
        <Link
          href="/scanner"
          className="flex items-center gap-2 bg-[#2ECC71] hover:bg-green-400 text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(46,204,113,0.35)] hover:scale-105 flex-shrink-0"
        >
          <span>Launch Scanner</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
