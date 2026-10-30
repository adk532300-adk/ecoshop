'use client';

import { useState } from 'react';
import { ShoppingCart, Check, Heart, Zap, Sparkles, X, ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ProductActionButtonsProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    ecoScore: number;
    imageUrl: string;
    category: string;
    material: string;
  };
}

export default function ProductActionButtons({ product }: ProductActionButtonsProps) {
  const [addedToCart, setAddedToCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Delivery details form state
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('600001');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('upi');

  const handleAddToCart = () => {
    // Save to localStorage so store page cart can also read it
    try {
      const stored = localStorage.getItem('ecoshop_cart');
      const cart = stored ? JSON.parse(stored) : [];
      const existing = cart.find((item: any) => item.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({ ...product, quantity });
      }
      localStorage.setItem('ecoshop_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleToggleWishlist = () => {
    setInWishlist(!inWishlist);
  };

  const handleBuyNow = () => {
    setCheckoutModalOpen(true);
    setOrderSuccess(false);
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSuccess(true);
    setTimeout(() => {
      // Clear modal after a few seconds
      setCheckoutModalOpen(false);
      setOrderSuccess(false);
    }, 3000);
  };

  const totalAmount = product.price * quantity;

  return (
    <>
      <div className="space-y-4 mb-8">
        {/* Quantity selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">Quantity:</span>
          <div className="flex items-center bg-[#161616] border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-bold"
            >
              -
            </button>
            <span className="px-4 text-xs font-mono font-bold text-white">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-bold"
            >
              +
            </button>
          </div>
          <span className="text-[11px] text-gray-500">
            Total: <strong className="text-[#2ECC71]">₹{totalAmount}</strong>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-[#2ECC71] hover:bg-green-400 text-[#0D0D0D] font-black py-3.5 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(46,204,113,0.3)] hover:shadow-[0_0_25px_rgba(46,204,113,0.5)] text-sm uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Buy Now</span>
          </button>

          <button
            onClick={handleAddToCart}
            className={`flex-1 font-bold py-3.5 px-6 rounded-xl transition-all border text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
              addedToCart
                ? 'bg-green-500/20 text-[#2ECC71] border-[#2ECC71]'
                : 'bg-[#1A1A1A] hover:bg-[#252525] text-white border-white/10 hover:border-white/20'
            }`}
          >
            {addedToCart ? (
              <>
                <Check className="w-4 h-4 text-[#2ECC71]" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            onClick={handleToggleWishlist}
            className={`p-3.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
              inWishlist
                ? 'border-red-500 bg-red-500/15 text-red-400'
                : 'border-white/10 bg-[#161616] text-gray-400 hover:text-red-400 hover:border-white/20'
            }`}
            title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Success toast notification */}
        <AnimatePresence>
          {addedToCart && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#142814] border border-[#2ECC71]/40 rounded-xl p-3 flex items-center justify-between text-xs text-gray-200"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-ping" />
                <span>{quantity} item(s) added to your eco shopping cart!</span>
              </div>
              <Link href="/store" className="text-[#2ECC71] font-bold hover:underline flex items-center gap-1">
                View in Store <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckoutModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#141414] border border-white/10 p-6 md:p-8 rounded-3xl z-[70] shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>

              {!orderSuccess ? (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#2ECC71] uppercase tracking-wider">Fast Checkout</span>
                  </div>
                  <h2 className="text-2xl font-black mb-4">Complete Your Eco Order</h2>

                  {/* Item Summary Card */}
                  <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5 mb-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-black flex-shrink-0 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Qty: {quantity} • Eco Score: <strong className="text-[#2ECC71]">{product.ecoScore}/10</strong>
                      </p>
                      <span className="text-sm font-black text-[#2ECC71] block mt-1">₹{totalAmount}</span>
                    </div>
                  </div>

                  <form onSubmit={handleCompleteOrder} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Delivery Address</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Flat / House No., Street, City"
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#2ECC71] transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Pincode</label>
                        <input
                          type="text"
                          required
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="600001"
                          className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#2ECC71] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Shipping</label>
                        <div className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#2ECC71] font-bold">
                          Free Carbon-Neutral
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-2">Payment Method</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'upi', label: 'UPI / GPay' },
                          { id: 'card', label: 'Card' },
                          { id: 'cod', label: 'Cash on Deliv.' }
                        ].map((m) => (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => setPaymentMethod(m.id as any)}
                            className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                              paymentMethod === m.id
                                ? 'bg-[#2ECC71]/10 border-[#2ECC71] text-[#2ECC71]'
                                : 'bg-[#1A1A1A] border-white/5 text-gray-400 hover:border-white/20'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-[#2ECC71] hover:bg-green-400 text-[#0D0D0D] font-black py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(46,204,113,0.3)] text-xs uppercase tracking-wider"
                      >
                        Confirm Order — ₹{totalAmount}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-[#2ECC71]/20 text-[#2ECC71] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#2ECC71]/40">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 text-white">Order Confirmed!</h3>
                  <p className="text-gray-300 text-xs max-w-sm mx-auto leading-relaxed mb-4">
                    Thank you for supporting sustainable living. Your order for <strong>{product.name}</strong> will be shipped in 100% plastic-free packaging to pincode <strong>{pincode}</strong>.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-[#2ECC71]/10 border border-[#2ECC71]/20 px-3 py-1.5 rounded-full text-xs text-[#2ECC71] font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Offset: 120g CO₂e verified</span>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
