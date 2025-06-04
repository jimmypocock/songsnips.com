'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface LoopPoint {
  start: number | null;
  end: number | null;
}

export function useYouTubePlayer() {
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loopPoints, setLoopPoints] = useState<LoopPoint>({ start: null, end: null });
  const [isLooping, setIsLooping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<any>(null);
  const isLoopingRef = useRef(isLooping);
  const loopPointsRef = useRef(loopPoints);
  
  // Update refs when state changes
  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);
  
  useEffect(() => {
    loopPointsRef.current = loopPoints;
  }, [loopPoints]);

  // Handle player ready
  const handlePlayerReady = useCallback((playerInstance: any) => {
    setPlayer(playerInstance);
    playerRef.current = playerInstance;
    setError(null);
  }, []);

  // Handle state change
  const handleStateChange = useCallback((event: any) => {
    if (!window.YT) return;
    
    const state = event.data;
    setIsPlaying(state === window.YT.PlayerState.PLAYING);
    
    if (state === window.YT.PlayerState.PLAYING) {
      // Start update interval
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
      
      updateIntervalRef.current = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
          
          // Check if we need to loop using refs to get current values
          if (isLoopingRef.current && loopPointsRef.current.end !== null && time >= loopPointsRef.current.end) {
            playerRef.current.seekTo(loopPointsRef.current.start || 0);
          }
        }
      }, 100);
    } else {
      // Clear interval when not playing
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    }
  }, []);

  // Handle errors
  const handleError = useCallback((event: any) => {
    let errorMessage = 'Error loading video. ';
    
    
    switch (event.data) {
      case 2:
        errorMessage += 'Invalid video ID. Please check the URL.';
        break;
      case 5:
        errorMessage += 'This video cannot be played in embedded players.';
        break;
      case 100:
        errorMessage += 'This video was not found or is private.';
        break;
      case 101:
      case 150:
        errorMessage += "The video owner doesn't allow embedded playback.";
        break;
      case -1:
        errorMessage = 'Failed to initialize player. Please refresh the page and try again.';
        break;
      default:
        errorMessage += 'Please check the URL and try again.';
    }
    
    setError(errorMessage);
  }, []);

  // Handle duration change
  const handleDurationChange = useCallback((newDuration: number) => {
    setDuration(newDuration);
  }, []);

  // Play/pause toggle
  const togglePlayPause = useCallback(() => {
    if (!player || !player.getPlayerState) return;
    
    const state = player.getPlayerState();
    if (state === window.YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, [player]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    if (!player) return;
    
    player.pauseVideo();
    const seekTime = loopPoints.start !== null ? loopPoints.start : 0;
    player.seekTo(seekTime);
    // Update currentTime immediately to reflect the UI change
    setCurrentTime(seekTime);
  }, [player, loopPoints.start]);

  // Set loop point
  const setLoopPoint = useCallback((type: 'start' | 'end', time: number) => {
    setLoopPoints(prev => {
      const newPoints = { ...prev };
      
      if (type === 'start') {
        newPoints.start = time;
        // If end is before start, clear end
        if (newPoints.end !== null && newPoints.end <= time) {
          newPoints.end = null;
        }
      } else {
        newPoints.end = time;
      }
      
      // Auto-enable looping when both points are set
      if (newPoints.start !== null && newPoints.end !== null) {
        setIsLooping(true);
      }
      
      return newPoints;
    });
  }, []);

  // Clear loop
  const clearLoop = useCallback(() => {
    setLoopPoints({ start: null, end: null });
    setIsLooping(false);
  }, []);


  // Seek to position
  const seekTo = useCallback((time: number) => {
    if (player && player.seekTo) {
      player.seekTo(time);
    }
  }, [player]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  return {
    player,
    isPlaying,
    duration,
    currentTime,
    loopPoints,
    isLooping,
    error,
    handlePlayerReady,
    handleStateChange,
    handleError,
    handleDurationChange,
    togglePlayPause,
    stopPlayback,
    setLoopPoint,
    clearLoop,
    seekTo,
    setError,
  };
}