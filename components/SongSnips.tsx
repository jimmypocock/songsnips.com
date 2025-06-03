'use client';

import { useRef, useState } from 'react';
import YouTubePlayer from './YouTubePlayer';
import Timeline from './Timeline';
import ControlButtons from './ControlButtons';
import QuickLoopButtons from './QuickLoopButtons';
import LoopCounter from './LoopCounter';
import SpeedControl from './SpeedControl';
import KeyboardShortcuts, { KeyboardShortcutsHelp } from './KeyboardShortcuts';
import ShareLoop from './ShareLoop';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { useEffect } from 'react';

export default function SongSnips() {
  const [videoUrl, setVideoUrl] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const playerComponentRef = useRef<any>(null);

  const {
    duration,
    currentTime,
    loopPoints,
    isLooping,
    error,
    success,
    handlePlayerReady,
    handleStateChange,
    handleError,
    handleDurationChange,
    togglePlayPause,
    stopPlayback,
    setLoopPoint,
    clearLoop,
    toggleLoop,
    seekTo,
    setError,
    setSuccess,
  } = useYouTubePlayer();

  // Load from URL parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const videoId = params.get('v');
      const startTime = params.get('start');
      const endTime = params.get('end');
      
      if (videoId) {
        const url = `https://youtube.com/watch?v=${videoId}`;
        setVideoUrl(url);
        
        // Auto-load the video after a short delay
        setTimeout(() => {
          if (playerComponentRef.current) {
            const player = playerComponentRef.current.getPlayer();
            if (player && player.loadVideoById) {
              player.loadVideoById(videoId);
              
              // Set loop points if provided
              if (startTime && endTime) {
                setTimeout(() => {
                  setLoopPoint('start', parseFloat(startTime));
                  setLoopPoint('end', parseFloat(endTime));
                  setSuccess('Video and loop loaded from shared link!');
                }, 1000);
              }
            }
          }
        }, 1000);
      }
    }
  }, [setLoopPoint, setSuccess]);

  // Extract video ID from URL
  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Load video
  const handleLoadVideo = () => {
    const videoId = extractVideoId(videoUrl);
    
    if (!videoId) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    if (playerComponentRef.current) {
      const player = playerComponentRef.current.getPlayer();
      if (player && player.loadVideoById) {
        player.loadVideoById(videoId);
        clearLoop();
        setSuccess('Video loaded successfully! Click on the timeline to set your loop points.');
        setError(null);
      } else {
        setError('Player is initializing... Please try again in a moment.');
      }
    }
  };

  // Load test video
  const handleLoadTestVideo = () => {
    const testUrl = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';
    setVideoUrl(testUrl);
    
    // Use the video ID directly
    if (playerComponentRef.current) {
      const player = playerComponentRef.current.getPlayer();
      if (player && player.loadVideoById) {
        player.loadVideoById('jNQXAC9IVRw');
        clearLoop();
        setSuccess('Test video loaded successfully! Click on the timeline to set your loop points.');
        setError(null);
      }
    }
  };

  // Handle timeline click
  const handleTimelineClick = (time: number) => {
    // Set loop points
    if (loopPoints.start === null) {
      setLoopPoint('start', time);
      seekTo(time);
    } else if (loopPoints.end === null) {
      if (time > loopPoints.start) {
        setLoopPoint('end', time);
        // Don't seek when setting end point
      } else {
        setLoopPoint('start', time);
        seekTo(time);
      }
    } else {
      // Both points set, update closest one
      const distToStart = Math.abs(time - loopPoints.start);
      const distToEnd = Math.abs(time - loopPoints.end);
      
      if (distToStart < distToEnd) {
        setLoopPoint('start', time);
        seekTo(time);
      } else {
        setLoopPoint('end', time);
        // Don't seek when adjusting end point
      }
    }
  };

  // Handle loop point change (from dragging or clicking)
  const handleLoopPointChange = (type: 'start' | 'end', time: number, isDragging: boolean = false) => {
    setLoopPoint(type, time);
    
    // Only adjust playback position when dragging, not clicking
    if (isDragging) {
      // Smart playback position handling when dragging
      if (type === 'end') {
        // When adjusting end point
        if (time < currentTime) {
          // If new end is before current position, jump to loop start
          if (loopPoints.start !== null) {
            seekTo(loopPoints.start);
          }
        }
        // Otherwise, don't interrupt playback
      } else if (type === 'start') {
        // When adjusting start point
        if (time > currentTime) {
          // If new start is after current position, jump to new start
          seekTo(time);
        }
        // Otherwise, don't interrupt playback
      }
    }
  };

  // Handle speed change
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    const player = playerComponentRef.current?.getPlayer();
    if (player && player.setPlaybackRate) {
      player.setPlaybackRate(speed);
    }
  };

  // Handle quick loop
  const handleQuickLoop = (start: number, end: number) => {
    setLoopPoint('start', start);
    setLoopPoint('end', end);
    // Loop will auto-enable when both points are set
    seekTo(start);
  };

  // Handle keyboard shortcut actions
  const handleSeek = (delta: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + delta));
    seekTo(newTime);
  };

  const handleSetLoopPointAtCurrentTime = (type: 'start' | 'end') => {
    setLoopPoint(type, currentTime);
  };

  const hasLoopPoints = loopPoints.start !== null && loopPoints.end !== null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <KeyboardShortcuts
        onPlayPause={togglePlayPause}
        onStop={stopPlayback}
        onClearLoop={clearLoop}
        onSeek={handleSeek}
        onSetLoopPoint={handleSetLoopPointAtCurrentTime}
      />
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            🎵 SongSnips
          </span>
        </h1>
        <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
          Master any song section with smart looping
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <span className="inline-block w-16 h-1 bg-primary rounded-full"></span>
          <span className="inline-block w-16 h-1 bg-secondary rounded-full"></span>
          <span className="inline-block w-16 h-1 bg-accent rounded-full"></span>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && !error && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg font-medium">
          {success}
        </div>
      )}

      {/* Video URL Input */}
      <div className="space-y-3 bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLoadVideo()}
              placeholder="Paste YouTube URL here (e.g., https://youtube.com/watch?v=...)"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary dark:focus:border-accent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            />
          </div>
          <button
            onClick={handleLoadVideo}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            Load Video
          </button>
        </div>
        
        <div className="text-center">
          <button
            onClick={handleLoadTestVideo}
            className="text-sm text-secondary hover:text-secondary-hover dark:text-secondary dark:hover:text-secondary-hover font-medium underline underline-offset-2"
          >
            Load Test Video
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
            Try this if you're having trouble
          </span>
        </div>
      </div>

      {/* YouTube Player */}
      <div className="relative">
        <div className="relative rounded-xl overflow-hidden shadow-2xl">
          <YouTubePlayer
            ref={playerComponentRef}
            onReady={handlePlayerReady}
            onStateChange={handleStateChange}
            onError={handleError}
            onDurationChange={handleDurationChange}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 space-y-4 shadow-lg backdrop-blur-sm">
        {/* Loop Status Indicator */}
        {loopPoints.start !== null && loopPoints.end !== null && (
          <div className={`text-center py-2 px-4 rounded-lg font-medium transition-all ${
            isLooping 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
          }`}>
            {isLooping ? '🔁 Loop Active' : '⏸️ Loop Ready (Play to activate)'}
          </div>
        )}
        
        <Timeline
          duration={duration}
          currentTime={currentTime}
          loopStart={loopPoints.start}
          loopEnd={loopPoints.end}
          onTimelineClick={handleTimelineClick}
          onLoopPointChange={handleLoopPointChange}
        />
        
        {/* Quick Loop Buttons */}
        <QuickLoopButtons
          currentTime={currentTime}
          duration={duration}
          onSetQuickLoop={handleQuickLoop}
          isDisabled={duration === 0}
        />
        
        {/* Loop Counter */}
        <LoopCounter
          isLooping={isLooping}
          currentTime={currentTime}
          loopEnd={loopPoints.end}
        />
      </div>

      {/* Control Buttons */}
      <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 space-y-4 shadow-lg backdrop-blur-sm">
        <ControlButtons
          onPlayPause={togglePlayPause}
          onStop={stopPlayback}
          onClearLoop={clearLoop}
          hasLoopPoints={hasLoopPoints}
        />
        
        {/* Speed Control */}
        <div className="flex justify-center">
          <SpeedControl
            currentSpeed={playbackSpeed}
            onSpeedChange={handleSpeedChange}
          />
        </div>
        
        {/* Share Loop */}
        <div className="flex justify-center pt-2">
          <ShareLoop
            videoUrl={videoUrl}
            loopStart={loopPoints.start}
            loopEnd={loopPoints.end}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary p-6 rounded-lg">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-primary dark:text-accent">
            How to Use:
          </h3>
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="text-sm text-secondary hover:text-secondary-hover dark:text-secondary dark:hover:text-secondary-hover font-medium underline underline-offset-2"
          >
            {showShortcuts ? 'Hide' : 'Show'} Keyboard Shortcuts
          </button>
        </div>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Paste any YouTube URL and click "Load Video"</li>
          <li>Click anywhere on the timeline to set the loop start point</li>
          <li>Click again to set the loop end point - the loop starts automatically!</li>
          <li>Drag the green handles to fine-tune your loop</li>
          <li>Use "Clear Loop" to remove loop points and start over</li>
        </ol>
        <div className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Tip:</strong> Use the quick loop buttons to instantly loop the last few seconds.</p>
          <p><strong>Note:</strong> Adjust playback speed to practice difficult sections slowly.</p>
        </div>
        {showShortcuts && <KeyboardShortcutsHelp />}
      </div>
    </div>
  );
}