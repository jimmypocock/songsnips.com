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
        className="px-6 py-3 bg-[#012f49] hover:bg-[#013a5a] text-white font-semibold rounded-lg shadow-lg shadow-[#012f49]/25 transition-all duration-200"
      >
        Play/Pause
      </button>

      {/* Stop Button */}
      <button
        onClick={onStop}
        className="px-6 py-3 bg-[#d62729] hover:bg-[#c11f21] text-white font-semibold rounded-lg shadow-lg shadow-[#d62729]/25 transition-all duration-200"
      >
        Stop
      </button>

      {/* Clear Loop Button */}
      <button
        onClick={onClearLoop}
        disabled={!hasLoopPoints}
        className={`px-6 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200 text-white
          ${hasLoopPoints 
            ? 'bg-gray-500 hover:bg-gray-600 shadow-gray-500/25' 
            : 'bg-gray-400 cursor-not-allowed opacity-50'
          }
        `}
      >
        Clear Loop
      </button>
    </div>
  );
}