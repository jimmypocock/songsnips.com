'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  onReady?: (player: any) => void;
  onStateChange?: (event: any) => void;
  onError?: (event: any) => void;
  onDurationChange?: (duration: number) => void;
}

const YouTubePlayer = forwardRef<any, YouTubePlayerProps>(({ onReady, onStateChange, onError, onDurationChange }, ref) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAPIReady, setIsAPIReady] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsAPIReady(true);
      };
    } else if (window.YT && window.YT.Player) {
      setIsAPIReady(true);
    }
  }, []);

  // Initialize player when API is ready
  useEffect(() => {
    if (isAPIReady && containerRef.current && !playerRef.current) {
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '100%',
        width: '100%',
        videoId: '',
        playerVars: {
          controls: 1,
          modestbranding: 1,
          rel: 0,
          autoplay: 0,
        },
        events: {
          onReady: (event: any) => {
            onReady?.(event.target);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING && playerRef.current) {
              const duration = playerRef.current.getDuration();
              onDurationChange?.(duration);
            }
            onStateChange?.(event);
          },
          onError: (event: any) => {
            onError?.(event);
          },
        },
      });
    }
  }, [isAPIReady, onReady, onStateChange, onError, onDurationChange]);

  // Extract video ID from URL
  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Load video function
  const loadVideo = useCallback((url: string) => {
    const extractedVideoId = extractVideoId(url);
    if (extractedVideoId && playerRef.current && playerRef.current.loadVideoById) {
      setVideoId(extractedVideoId);
      playerRef.current.loadVideoById(extractedVideoId);
    }
    return extractedVideoId;
  }, []);

  // Get player instance
  const getPlayer = useCallback(() => {
    return playerRef.current;
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    loadVideo,
    getPlayer,
  }), [loadVideo, getPlayer]);

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#012f49] to-gray-900 p-1">
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-900">
        <div ref={containerRef} className="absolute inset-0" />
        {!isAPIReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#012f49] to-gray-900 text-white">
            <div className="text-center">
              <p className="text-lg mb-2">🎵 Loading YouTube Player...</p>
              <p className="text-sm opacity-75">This may take a moment on first load</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

YouTubePlayer.displayName = 'YouTubePlayer';

export default YouTubePlayer;