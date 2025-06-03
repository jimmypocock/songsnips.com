'use client';

interface SpeedControlProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function SpeedControl({ currentSpeed, onSpeedChange }: SpeedControlProps) {
  return (
    <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-400">Speed:</span>
      <div className="flex gap-1">
        {SPEED_OPTIONS.map((speed) => (
          <button
            key={speed}
            onClick={() => onSpeedChange(speed)}
            className={`
              px-2 py-1 text-xs rounded transition-all
              ${currentSpeed === speed 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }
            `}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
}