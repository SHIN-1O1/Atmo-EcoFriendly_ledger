import Canopy from '@/components/Canopy';
import HabitLedger from '@/components/HabitLedger';
import MetricTicker from '@/components/MetricTicker';
import StreakConduit from '@/components/StreakConduit';
import StoreInitializer from '@/components/StoreInitializer';

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[var(--color-obsidian)] text-[var(--color-foreground)] flex items-center justify-center p-6 sm:p-12">
      <StoreInitializer />
      <div className="w-full max-w-7xl h-[calc(100vh-6rem)] min-h-[600px] flex flex-col gap-6">
        
        <header className="flex justify-between items-end mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Atmo</h1>
            <p className="text-[var(--color-muted-sage)] text-sm mt-1">Gamified Carbon Micro-Tracking Platform</p>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-2 text-xs font-mono bg-[var(--color-deep-moss)] px-3 py-1 rounded-full border border-[var(--color-muted-sage)]/20">
              <span className="w-2 h-2 rounded-full bg-[var(--color-electric-mint)] animate-pulse"></span>
              <span>LIVE SYNC</span>
            </div>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 grid-rows-[minmax(0,1fr)_auto] gap-6 overflow-hidden">
          
          {/* Canopy (50% width on large screens) */}
          <div className="lg:col-span-2 lg:row-span-1 bg-[var(--color-deep-moss)] border border-[var(--color-muted-sage)]/20 rounded-3xl relative overflow-hidden flex flex-col">
            <div className="p-6 pb-0 flex-shrink-0">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-foreground)]">The Canopy</h2>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <Canopy />
            </div>
          </div>

          {/* Quick-Strike Ledger (25% width) */}
          <div className="lg:col-span-1 lg:row-span-1 bg-[var(--color-obsidian)] rounded-3xl flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-foreground)] px-2 pt-2">Quick-Strike Ledger</h2>
            <div className="flex-1">
              <HabitLedger />
            </div>
          </div>

          {/* Micro-Metrics Ticker (25% width) */}
          <div className="lg:col-span-1 lg:row-span-1 h-full">
            <MetricTicker />
          </div>

          {/* Streak Conduit (Footer) */}
          <div className="lg:col-span-4 lg:row-span-1 h-[100px] flex-shrink-0">
            <StreakConduit />
          </div>

        </div>
      </div>
    </main>
  );
}
