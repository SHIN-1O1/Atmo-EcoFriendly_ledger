"use client";

import { useEcoStore } from '@/store/ecoStore';
import { Flame, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StreakConduit() {
  const { currentStreak, habitsLoggedToday } = useEcoStore();

  const isStreakBroken = currentStreak === 0 && Object.keys(habitsLoggedToday).length === 0;

  return (
    <div className="w-full bg-[var(--color-deep-moss)] border border-[var(--color-muted-sage)]/20 rounded-2xl p-4 flex items-center justify-between">
      
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${isStreakBroken ? 'bg-[var(--color-vibrant-ember)]/10 text-[var(--color-vibrant-ember)]' : 'bg-[var(--color-electric-mint)]/20 text-[var(--color-electric-mint)]'}`}>
          <Flame size={24} className={isStreakBroken ? '' : 'animate-pulse'} />
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Daily Streak Conduit</h3>
          <div className="flex items-center space-x-2">
            <span className={`text-2xl font-mono font-bold ${isStreakBroken ? 'text-[var(--color-vibrant-ember)]' : 'text-[var(--color-electric-mint)]'}`}>
              {currentStreak}
            </span>
            <span className="text-xs text-[var(--color-muted-sage)] uppercase tracking-wider">Days Active</span>
          </div>
        </div>
      </div>

      <div className="flex-1 ml-8 max-w-lg">
        {isStreakBroken ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 p-3 bg-[var(--color-obsidian)] border border-[var(--color-vibrant-ember)]/30 rounded-lg"
          >
            <AlertCircle size={18} className="text-[var(--color-vibrant-ember)] flex-shrink-0" />
            <p className="text-xs text-[var(--color-foreground)]">
              <span className="text-[var(--color-vibrant-ember)] font-semibold">Streak Broken:</span> Your canopy lost its glow. Log an action right now to revive it.
            </p>
          </motion.div>
        ) : (
          <div className="relative w-full h-2 bg-[var(--color-obsidian)] rounded-full overflow-hidden border border-[var(--color-muted-sage)]/20">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--color-electric-mint)] to-[#00f5a0]/50"
            />
          </div>
        )}
      </div>

    </div>
  );
}
