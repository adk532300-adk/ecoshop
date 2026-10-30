import Link from 'next/link';
import Image from 'next/image';
import {
  Scan, Leaf, Cpu, ArrowRight, ShieldCheck, Zap,
  Layers, CheckCircle2, Globe, Activity, Lock, User
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#2ECC71] selection:text-black">
      {/* Top Academic & Telemetry Ribbon */}
      <div className="bg-[#121212] border-b border-white/5 py-2 px-4 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
            <span className="font-medium text-gray-300">
              Edge Computer Vision Pipeline: MobileNet v1.0 • WebGL Accelerated
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-gray-500">
            <span>Sri Sairam Engineering College</span>
            <span>•</span>
            <span className="text-[#2ECC71]">UN SDG 12 / 13 / 14</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="border-b border-white/5 bg-[#0D0D0D]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-[#2ECC71] p-1.5 rounded-lg shadow-[0_0_15px_rgba(46,204,113,0.4)]">
              <Leaf className="w-5 h-5 text-[#0D0D0D]" />
            </div>
            <span className="font-black text-xl tracking-tight">
              <span className="text-[#2ECC71]">Eco</span>Shop
            </span>
            <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider ml-1">
              CV v2.4
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/store"
              className="text-gray-300 hover:text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-white/5 transition-colors hidden sm:block"
            >
              Catalog Store
            </Link>
            <Link
              href="/scanner"
              className="flex items-center gap-2 bg-[#2ECC71] hover:bg-green-400 text-[#0D0D0D] text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(46,204,113,0.3)] hover:scale-105 uppercase tracking-wide"
            >
              <Scan className="w-4 h-4" />
              <span>Launch CV Scanner</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 overflow-hidden">
        {/* Glow Shaders */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#2ECC71] opacity-10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs text-gray-300 mb-6 backdrop-blur-md">
            <Cpu className="w-4 h-4 text-[#2ECC71]" />
            <span>In-Browser Deep Learning • Zero Cloud GPU Cost • 100% Visual Privacy</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] mb-6">
            Edge-AI Computer Vision for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2ECC71] via-emerald-400 to-teal-300">
              Sustainable Substitution
            </span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Automating the transition to UN SDG 12 (Responsible Consumption). Point your camera at any everyday plastic or manufactured item — our convolutional network identifies its composition in 40ms and prescribes certified biodegradable alternatives.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/scanner"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#2ECC71] hover:bg-green-400 text-black font-black text-sm uppercase tracking-wider py-4 px-8 rounded-2xl transition-all shadow-[0_0_30px_rgba(46,204,113,0.4)] hover:scale-105"
            >
              <Scan className="w-5 h-5" />
              <span>Open Live Camera Scanner</span>
            </Link>
            <Link
              href="/store"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#161616] hover:bg-[#202020] text-white font-bold text-sm py-4 px-8 rounded-2xl border border-white/10 transition-all hover:border-white/30"
            >
              <span>Explore Sustainable Store</span>
              <ArrowRight className="w-4 h-4 text-[#2ECC71]" />
            </Link>
          </div>

          {/* Live Telemetry Benchmark Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-[#121212] p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <Activity className="w-4 h-4 text-[#2ECC71]" />
                <span>Inference Latency</span>
              </div>
              <div className="text-2xl font-black font-mono text-white">~42 ms</div>
              <span className="text-[11px] text-gray-400">WebGL hardware acceleration</span>
            </div>

            <div className="bg-[#121212] p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Data Privacy</span>
              </div>
              <div className="text-2xl font-black font-mono text-[#2ECC71]">100% Edge</div>
              <span className="text-[11px] text-gray-400">Zero cloud image uploads</span>
            </div>

            <div className="bg-[#121212] p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Classifier Backbone</span>
              </div>
              <div className="text-2xl font-black font-mono text-white">MobileNet</div>
              <span className="text-[11px] text-gray-400">Depthwise Separable Conv</span>
            </div>

            <div className="bg-[#121212] p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Target SDG</span>
              </div>
              <div className="text-2xl font-black font-mono text-amber-400">SDG 12.5</div>
              <span className="text-[11px] text-gray-400">Waste reduction & recycling</span>
            </div>
          </div>
        </div>
      </section>

      {/* Computer Vision Architecture Pipeline Section */}
      <section className="py-16 px-4 border-t border-white/5 bg-[#0C0C0C]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-[#2ECC71] uppercase tracking-wider block mb-2">
              Engineering Architecture
            </span>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight">
              The 5-Stage Edge Computer Vision Pipeline
            </h2>
            <p className="text-gray-400 text-xs md:text-sm max-w-xl mx-auto mt-2">
              How our system bridges low-level RGB pixel tensors to high-level ecological impact scoring and automated commerce substitution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              {
                step: '01',
                title: 'Live Sensor Ingestion',
                tech: 'HTML5 Video & Canvas',
                desc: 'Captures raw frames from device camera without transmitting images to cloud servers.'
              },
              {
                step: '02',
                title: 'Tensor Pre-processing',
                tech: '[1, 224, 224, 3] Float32',
                desc: 'Crops and normalizes RGB pixels between [-1, 1] for optimal neural network receptive field.'
              },
              {
                step: '03',
                title: 'Depthwise Separable Conv',
                tech: 'MobileNet v1 (WebGL)',
                desc: 'Splits standard convolution into depthwise and pointwise operations for sub-50ms execution.'
              },
              {
                step: '04',
                title: 'Softmax Consensus',
                tech: 'Top-5 Probability Logits',
                desc: 'Cross-evaluates multi-class confidence scores to handle specular reflections and misclassifications.'
              },
              {
                step: '05',
                title: 'SDG Semantic Mapping',
                tech: 'Taxonomy & Commerce API',
                desc: 'Translates ImageNet categories into material life-cycle diagnostics and certified organic replacements.'
              }
            ].map((node, i) => (
              <div
                key={i}
                className="bg-[#141414] rounded-2xl p-4 border border-white/5 hover:border-[#2ECC71]/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-[#2ECC71] mb-2 block">
                    STAGE {node.step}
                  </span>
                  <h3 className="font-bold text-sm text-white group-hover:text-[#2ECC71] transition-colors mb-1">
                    {node.title}
                  </h3>
                  <span className="inline-block bg-white/5 text-[10px] font-mono text-gray-400 px-2 py-0.5 rounded mb-3">
                    {node.tech}
                  </span>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {node.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainable Catalog Preview Section */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-[#2ECC71] uppercase tracking-wider block mb-1">
                Verified Inventory
              </span>
              <h2 className="text-2xl md:text-3xl font-black">
                Featured Biodegradable Alternatives
              </h2>
            </div>
            <Link
              href="/store"
              className="inline-flex items-center gap-1.5 text-xs text-[#2ECC71] font-bold hover:underline"
            >
              <span>View All 10+ Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Bamboo Toothbrush', slug: 'bamboo-toothbrush', eco: 9.2, price: 299, img: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=600&q=80' },
              { name: 'Steel Water Bottle', slug: 'steel-water-bottle', eco: 9.0, price: 799, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80' },
              { name: 'Coconut Shell Bowls', slug: 'coconut-shell-bowls', eco: 9.5, price: 499, img: '/products/coconut-bowls.jpg' },
              { name: 'Neem Wood Comb', slug: 'neem-wood-comb', eco: 9.3, price: 150, img: '/products/neem-comb.jpg' }
            ].map((p, idx) => (
              <Link key={idx} href={`/product/${p.slug}`}>
                <div className="bg-[#141414] rounded-2xl border border-white/5 hover:border-[#2ECC71]/40 transition-all p-3 group">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-black mb-3">
                    <Image src={p.img} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded-full text-[10px] text-[#2ECC71] font-bold border border-[#2ECC71]/20">
                      Eco {p.eco}
                    </div>
                  </div>
                  <h4 className="font-bold text-xs group-hover:text-[#2ECC71] transition-colors truncate">{p.name}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-black text-[#2ECC71]">₹{p.price}</span>
                    <span className="text-[10px] text-gray-500">View Specs & Order →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#090909] py-8 px-4 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#2ECC71]" />
            <span className="text-gray-400 font-bold">EcoShop Edge-AI</span>
            <span>•</span>
            <span>Sri Sairam Engineering College</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <Link href="/scanner" className="hover:text-white">CV Scanner</Link>
            <Link href="/store" className="hover:text-white">Store</Link>
            <Link href="https://github.com/Rahulrk-2804/EcoShop" target="_blank" className="hover:text-white">Source Code</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
