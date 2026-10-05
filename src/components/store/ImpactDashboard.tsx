'use client';

import { impactData } from '@/lib/data';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Leaf, Droplet, Recycle } from 'lucide-react';

export default function ImpactDashboard() {
  return (
    <div className="mt-12 bg-brand-card rounded-2xl p-6 border border-white/5">
      <h2 className="text-2xl font-bold text-white mb-6">Your Environmental Impact</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-brand-bg rounded-xl p-4 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-full text-brand-primary">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-brand-text-muted">Carbon Saved</div>
            <div className="text-xl font-bold text-white">2.4 kg</div>
          </div>
        </div>
        
        <div className="bg-brand-bg rounded-xl p-4 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-brand-text-muted">Water Conserved</div>
            <div className="text-xl font-bold text-white">14.5 L</div>
          </div>
        </div>

        <div className="bg-brand-bg rounded-xl p-4 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-500">
            <Recycle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-brand-text-muted">Plastic Reduced</div>
            <div className="text-xl font-bold text-white">0.8 kg</div>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={impactData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2ECC71" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#A0A0A0" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#A0A0A0" fontSize={12} tickLine={false} axisLine={false} />
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#ffffff10', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#2ECC71' }}
            />
            <Area type="monotone" dataKey="carbon" stroke="#2ECC71" strokeWidth={3} fillOpacity={1} fill="url(#colorCarbon)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
