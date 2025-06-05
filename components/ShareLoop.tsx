'use client';

import { useState } from 'react';

interface ShareLoopProps {
  videoUrl: string;
  loopStart: number | null;
  loopEnd: number | null;
}

export default function ShareLoop({ videoUrl, loopStart, loopEnd }: ShareLoopProps) {
  const [copied, setCopied] = useState(false);

  const generateShareUrl = (): string => {
    if (!videoUrl || loopStart === null || loopEnd === null) return '';
    
    // Extract video ID
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = videoUrl.match(regex);
    const videoId = match ? match[1] : '';
    
    if (!videoId) return '';
    
    // Create shareable URL with loop parameters
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams({
      v: videoId,
      start: loopStart.toFixed(1),
      end: loopEnd.toFixed(1)
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  const handleCopy = async () => {
    const shareUrl = generateShareUrl();
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Failed to copy to clipboard
    }
  };

  const canShare = videoUrl && loopStart !== null && loopEnd !== null;

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        disabled={!canShare}
        title={canShare ? (copied ? "Link copied!" : "Share this loop") : "Set both loop markers to share"}
        className={`p-2 rounded-lg transition-colors ${
          canShare
            ? copied 
              ? 'bg-green-500 text-white'
              : 'bg-accent hover:bg-blue-600 text-white'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
        }`}
      >
        {copied && canShare ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
          </svg>
        )}
      </button>
    </div>
  );
}