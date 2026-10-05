'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AuthSplash() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/store');
  };

  const handleGuest = () => {
    router.push('/store');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 flex flex-col items-center"
      >
        <div className="relative w-64 h-64 mb-4">
          <Image
            src="/logo.png"
            alt="EcoShop Logo"
            fill
            className="object-contain drop-shadow-[0_0_15px_rgba(46,204,113,0.5)]"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md bg-brand-card p-8 rounded-2xl shadow-2xl border border-white/5 relative z-10"
      >
        <h2 className="text-xl text-center mb-6 text-brand-text">
          <span className="text-brand-primary font-medium">Welcome</span> to EcoShop
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-muted" />
            <input
              type="text"
              placeholder="Username or Phone Number"
              className="w-full bg-brand-bg border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-brand-primary transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-muted" />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-brand-bg border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-brand-primary transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-primary hover:bg-green-500 text-brand-bg font-bold py-3 rounded-lg mt-6 transition-colors shadow-[0_0_15px_rgba(46,204,113,0.4)] hover:shadow-[0_0_25px_rgba(46,204,113,0.6)]"
          >
            Login
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-white/10"></div>
          <span className="px-4 text-brand-text-muted text-sm">or</span>
          <div className="flex-1 border-t border-white/10"></div>
        </div>

        <div className="flex justify-between text-sm text-brand-primary">
          <button className="hover:text-green-400 transition-colors">Create Account</button>
          <button type="button" onClick={handleGuest} className="text-brand-text-muted hover:text-white transition-colors">
            Continue as Guest
          </button>
        </div>
      </motion.div>
    </div>
  );
}
