'use client';

interface ControlButtonsProps {
  onPlayPause: () => void;
  onStop: () => void;
  onClearLoop: () => void;
  hasLoopPoints: boolean;
}

export default function ControlButtons({
  onPlayPause,
  onStop,
  onClearLoop,
  hasLoopPoints,
}: ControlButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {/* Play/Pause Button */}
      <button
        onClick={onPlayPause}
        className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
      >
        Play/Pause
      </button>

      {/* Stop Button */}
      <button
        onClick={onStop}
        className="px-6 py-3 bg-danger hover:bg-red-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
      >
        Stop
      </button>

      {/* Clear Loop Button */}
      <button
        onClick={onClearLoop}
        disabled={!hasLoopPoints}
        className={`px-6 py-3 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-white
          ${hasLoopPoints 
            ? 'bg-neutral hover:bg-gray-600' 
            : 'bg-gray-400 cursor-not-allowed opacity-50'
          }
        `}
      >
        Clear Loop
      </button>
    </div>
  );
}