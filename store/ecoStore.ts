import { create } from 'zustand';

export const HABITS = {
  plant_meal: { id: 'plant_meal', name: 'Ate Plant-Based', xp: 30, co2: 2.5 },
  active_transit: { id: 'active_transit', name: 'Bike / Public Transit', xp: 50, co2: 4.2 },
  cold_wash: { id: 'cold_wash', name: 'Cold Water Wash', xp: 20, co2: 1.1 },
  unplug_vampire: { id: 'unplug_vampire', name: 'Killed Phantom Loads', xp: 15, co2: 0.6 },
};

interface EcoState {
  currentXP: number;
  currentLevel: number;
  currentStreak: number;
  co2SavedSession: number;
  habitsLoggedToday: Record<string, boolean>;
  levelUpTrigger: boolean;

  // Actions
  toggleHabit: (habitId: keyof typeof HABITS) => void;
  resetLevelUpTrigger: () => void;
  setInitialState: (state: Partial<EcoState>) => void;
  initializeStore: () => Promise<void>;
}

export const useEcoStore = create<EcoState>((set, get) => ({
  currentXP: 0,
  currentLevel: 1,
  currentStreak: 0,
  co2SavedSession: 0,
  habitsLoggedToday: {},
  levelUpTrigger: false,

  toggleHabit: async (habitId) => {
    const state = get();
    const isLogged = state.habitsLoggedToday[habitId];
    const habit = HABITS[habitId];
    
    const xpChange = isLogged ? -habit.xp : habit.xp;
    const co2Change = isLogged ? -habit.co2 : habit.co2;
    
    let newXP = state.currentXP + xpChange;
    let newLevel = state.currentLevel;
    let triggerLevelUp = false;

    if (newXP < 0) {
      if (newLevel > 1) {
        newLevel -= 1;
        newXP = (newLevel * 100) + newXP; 
      } else {
        newXP = 0;
      }
    }

    const levelBoundary = newLevel * 100;
    if (newXP >= levelBoundary) {
      newLevel += 1;
      newXP -= levelBoundary;
      triggerLevelUp = true;
    }

    // Update state synchronously for optimistic UI
    set({
      currentXP: newXP,
      currentLevel: newLevel,
      co2SavedSession: Math.max(0, state.co2SavedSession + co2Change),
      habitsLoggedToday: {
        ...state.habitsLoggedToday,
        [habitId]: !isLogged
      },
      levelUpTrigger: triggerLevelUp ? true : state.levelUpTrigger,
      currentStreak: state.currentStreak === 0 && !isLogged ? 1 : state.currentStreak,
    });

    // Fire API call asynchronously
    try {
      if (!isLogged) {
        const res = await fetch('/api/habits/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ habit_id: habitId }),
        });
        if (!res.ok) console.error('Failed to log habit:', await res.text());
      } else {
        const res = await fetch(`/api/habits/log?habit_id=${habitId}`, {
          method: 'DELETE',
        });
        if (!res.ok) console.error('Failed to unlog habit:', await res.text());
      }
    } catch (err) {
      console.error('Failed to log/unlog habit:', err);
    }
  },

  resetLevelUpTrigger: () => set({ levelUpTrigger: false }),
  
  setInitialState: (newState) => set((state) => ({ ...state, ...newState })),

  initializeStore: async () => {
    try {
      const response = await fetch('/api/user/sync');
      const result = await response.json();
      
      if (result.status === 'success') {
        set((state) => ({
          ...state,
          currentXP: result.data.currentXP,
          currentLevel: result.data.currentLevel,
          currentStreak: result.data.currentStreak,
          habitsLoggedToday: result.data.habitsLoggedToday
        }));
      }
    } catch (err) {
      console.error('Failed to initialize store from backend:', err);
    }
  },
}));
