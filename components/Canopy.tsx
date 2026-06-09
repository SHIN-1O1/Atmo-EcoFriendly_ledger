"use client";

import { motion } from 'framer-motion';
import { useEcoStore } from '@/store/ecoStore';
import { useEffect, useState } from 'react';

export default function Canopy() {
  const { currentXP, currentLevel, levelUpTrigger, resetLevelUpTrigger } = useEcoStore();
  const [showExplosion, setShowExplosion] = useState(false);

  useEffect(() => {
    if (levelUpTrigger) {
      setShowExplosion(true);
      setTimeout(() => {
        setShowExplosion(false);
        resetLevelUpTrigger();
      }, 1000);
    }
  }, [levelUpTrigger, resetLevelUpTrigger]);

  // Base scale starts at 1, maxes out at 1.5 within a level
  const levelBoundary = currentLevel * 100;
  const progressPercent = currentXP / levelBoundary;
  const targetScale = 1 + (progressPercent * 0.5);
  const glowIntensity = 10 + (progressPercent * 40);

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[300px] overflow-hidden">
      
      {/* Background Particle Explosion on Level Up */}
      {showExplosion && (
        <motion.div
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute w-48 h-48 rounded-full bg-[var(--color-electric-mint)] filter blur-xl"
        />
      )}

      {/* Breathing Ecosystem Orb */}
      <motion.div
        animate={{ 
          scale: [targetScale, targetScale * 1.05, targetScale],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 4, 
          ease: "easeInOut" 
        }}
        className="relative z-10 flex items-center justify-center rounded-full"
        style={{
          width: '180px',
          height: '180px',
          background: `radial-gradient(circle, var(--color-electric-mint) 0%, var(--color-obsidian) 70%)`,
          boxShadow: `0 0 ${glowIntensity}px var(--color-electric-mint), inset 0 0 ${glowIntensity/2}px var(--color-deep-moss)`
        }}
      >
        <div className="absolute inset-2 rounded-full border border-[var(--color-muted-sage)] opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-6 rounded-full border border-[var(--color-electric-mint)] opacity-20"></div>
        
        {/* Core level indicator */}
        <div className="flex flex-col items-center text-[var(--color-electric-mint)] drop-shadow-md">
          <span className="text-xs font-mono tracking-widest uppercase opacity-70">Lvl</span>
          <span className="text-3xl font-bold font-mono">{currentLevel}</span>
        </div>
      </motion.div>
    </div>
  );
}
