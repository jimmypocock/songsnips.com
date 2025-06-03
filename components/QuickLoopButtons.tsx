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
    <div className="flex flex-wrap gap-2 justify-center">
      <div className="flex gap-2">
        <button
          onClick={() => handleQuickLoop(5)}
          disabled={isDisabled || currentTime < 1}
          className="px-3 py-1.5 text-sm bg-secondary/10 hover:bg-secondary/20 dark:bg-secondary/20 dark:hover:bg-secondary/30 text-secondary dark:text-secondary font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Loop Last 5s
        </button>
        <button
          onClick={() => handleQuickLoop(10)}
          disabled={isDisabled || currentTime < 1}
          className="px-3 py-1.5 text-sm bg-secondary/10 hover:bg-secondary/20 dark:bg-secondary/20 dark:hover:bg-secondary/30 text-secondary dark:text-secondary font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Loop Last 10s
        </button>
        <button
          onClick={() => handleQuickLoop(30)}
          disabled={isDisabled || currentTime < 1}
          className="px-3 py-1.5 text-sm bg-secondary/10 hover:bg-secondary/20 dark:bg-secondary/20 dark:hover:bg-secondary/30 text-secondary dark:text-secondary font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Loop Last 30s
        </button>
      </div>
      <div className="hidden sm:flex gap-2">
        <button
          onClick={() => handleLoopFromHere(5)}
          disabled={isDisabled || currentTime >= duration - 1}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next 5s
        </button>
        <button
          onClick={() => handleLoopFromHere(10)}
          disabled={isDisabled || currentTime >= duration - 1}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next 10s
        </button>
      </div>
    </div>
  );
}