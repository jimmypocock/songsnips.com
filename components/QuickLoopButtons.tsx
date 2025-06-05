'use client';

interface QuickLoopButtonsProps {
  currentTime: number;
  duration: number;
  onSetQuickLoop: (start: number, end: number) => void;
  isDisabled?: boolean;
}

export default function QuickLoopButtons({
  currentTime,
  duration,
  onSetQuickLoop,
  isDisabled = false,
}: QuickLoopButtonsProps) {
  const handleQuickLoop = (seconds: number) => {
    const start = Math.max(0, currentTime - seconds);
    const end = currentTime;
    onSetQuickLoop(start, end);
  };

  const handleLoopFromHere = (seconds: number) => {
    const start = currentTime;
    const end = Math.min(duration, currentTime + seconds);
    onSetQuickLoop(start, end);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleQuickLoop(5)}
          disabled={isDisabled || currentTime < 1}
          className="relative px-2 py-2 text-xs md:text-sm bg-gradient-to-r from-secondary/10 to-accent/10 hover:from-secondary/20 hover:to-accent/20 active:from-secondary/30 active:to-accent/30 text-secondary dark:text-secondary font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] transform hover:scale-105 hover:-translate-y-0.5 shadow-sm hover:shadow-md overflow-hidden group"
        >
          <span className="relative z-10">-5s</span>
          <div className="absolute inset-0 bg-gradient-to-r from-secondary to-accent opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
        </button>
        <button
          onClick={() => handleQuickLoop(10)}
          disabled={isDisabled || currentTime < 1}
          className="relative px-2 py-2 text-xs md:text-sm bg-gradient-to-r from-secondary/10 to-accent/10 hover:from-secondary/20 hover:to-accent/20 active:from-secondary/30 active:to-accent/30 text-secondary dark:text-secondary font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] transform hover:scale-105 hover:-translate-y-0.5 shadow-sm hover:shadow-md overflow-hidden group"
        >
          <span className="relative z-10">-10s</span>
          <div className="absolute inset-0 bg-gradient-to-r from-secondary to-accent opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
        </button>
        <button
          onClick={() => handleQuickLoop(30)}
          disabled={isDisabled || currentTime < 1}
          className="relative px-2 py-2 text-xs md:text-sm bg-gradient-to-r from-secondary/10 to-accent/10 hover:from-secondary/20 hover:to-accent/20 active:from-secondary/30 active:to-accent/30 text-secondary dark:text-secondary font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] transform hover:scale-105 hover:-translate-y-0.5 shadow-sm hover:shadow-md overflow-hidden group"
        >
          <span className="relative z-10">-30s</span>
          <div className="absolute inset-0 bg-gradient-to-r from-secondary to-accent opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
        </button>
      </div>
      <div className="hidden md:grid grid-cols-2 gap-2">
        <button
          onClick={() => handleLoopFromHere(5)}
          disabled={isDisabled || currentTime >= duration - 1}
          className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next 5s
        </button>
        <button
          onClick={() => handleLoopFromHere(10)}
          disabled={isDisabled || currentTime >= duration - 1}
          className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next 10s
        </button>
      </div>
    </div>
  );
}