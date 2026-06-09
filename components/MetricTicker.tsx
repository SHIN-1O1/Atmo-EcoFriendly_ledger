"use client";

import { useEcoStore } from '@/store/ecoStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function MetricTicker() {
  const { co2SavedSession } = useEcoStore();

  const smartphoneCharges = Math.floor(co2SavedSession * 122);
  const ledHours = Math.floor(co2SavedSession * 90);
  const glacierIce = (co2SavedSession * 3).toFixed(1);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-[var(--color-deep-moss)] border border-[var(--color-muted-sage)]/20 rounded-2xl relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-electric-mint)] to-transparent opacity-20"></div>

      <div className="text-center mb-6">
        <h3 className="text-sm text-[var(--color-muted-sage)] uppercase tracking-wider mb-2 font-semibold">Session Impact</h3>
        <div className="flex items-baseline justify-center space-x-2 text-[var(--color-electric-mint)]">
          <AnimatePresence mode="popLayout">
            <motion.span 
              key={co2SavedSession}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="text-5xl font-mono font-bold tracking-tight"
            >
              {co2SavedSession.toFixed(1)}
            </motion.span>
          </AnimatePresence>
          <span className="text-xl font-mono">kg</span>
        </div>
        <p className="text-xs text-[var(--color-muted-sage)] mt-1">CO₂ Averted</p>
      </div>

      <div className="w-full bg-[var(--color-obsidian)] rounded-xl p-4 border border-[var(--color-muted-sage)]/10">
        <h4 className="text-[10px] text-[var(--color-muted-sage)] uppercase tracking-widest mb-3">Tangible Impact</h4>
        
        <ul className="space-y-3">
          <li className="flex justify-between items-center text-sm">
            <span className="text-[var(--color-foreground)]">📱 Smartphone Charges</span>
            <span className="font-mono font-bold text-[var(--color-electric-mint)]">{smartphoneCharges}</span>
          </li>
          <li className="flex justify-between items-center text-sm">
            <span className="text-[var(--color-foreground)]">💡 LED Bulb Hours</span>
            <span className="font-mono font-bold text-[var(--color-electric-mint)]">{ledHours}h</span>
          </li>
          <li className="flex justify-between items-center text-sm">
            <span className="text-[var(--color-foreground)]">🧊 Glacier Ice Saved</span>
            <span className="font-mono font-bold text-[var(--color-electric-mint)]">{glacierIce}kg</span>
          </li>
        </ul>
      </div>

    </div>
  );
}
