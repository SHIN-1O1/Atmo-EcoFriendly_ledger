"use client";

import { motion } from 'framer-motion';
import { useEcoStore, HABITS } from '@/store/ecoStore';
import { Check, Leaf, Bike, Droplet, ZapOff } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const icons = {
  plant_meal: Leaf,
  active_transit: Bike,
  cold_wash: Droplet,
  unplug_vampire: ZapOff,
};

export default function HabitLedger() {
  const { toggleHabit, habitsLoggedToday } = useEcoStore();

  const habitList = Object.values(HABITS);

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {habitList.map((habit) => {
        const isLogged = habitsLoggedToday[habit.id] || false;
        const Icon = icons[habit.id as keyof typeof icons];

        return (
          <motion.button
            key={habit.id}
            onClick={() => toggleHabit(habit.id as keyof typeof HABITS)}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 350, damping: 18 }}
            className={cn(
              "relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-colors duration-300",
              isLogged 
                ? "bg-[var(--color-deep-moss)] border-[var(--color-electric-mint)] shadow-[0_0_15px_rgba(0,245,160,0.15)]" 
                : "bg-[var(--color-deep-moss)] border-[var(--color-muted-sage)]/20 hover:border-[var(--color-electric-mint)]/50"
            )}
          >
            <div className={cn(
              "mb-2 p-2 rounded-full transition-colors duration-300",
              isLogged ? "bg-[var(--color-electric-mint)]/20 text-[var(--color-electric-mint)]" : "bg-[var(--color-obsidian)] text-[var(--color-muted-sage)]"
            )}>
              {isLogged ? <Check size={24} className="animate-in zoom-in duration-300" /> : <Icon size={24} />}
            </div>
            <span className={cn(
              "text-sm font-medium text-center transition-colors duration-300",
              isLogged ? "text-[var(--color-electric-mint)]" : "text-[var(--color-foreground)]"
            )}>
              {habit.name}
            </span>
            <div className="mt-2 flex space-x-2 text-xs opacity-70">
              <span className="text-[var(--color-electric-mint)] font-mono">+{habit.xp} XP</span>
              <span className="text-[var(--color-muted-sage)] font-mono">-{habit.co2}kg</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
