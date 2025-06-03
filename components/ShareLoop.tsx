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
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!videoUrl || loopStart === null || loopEnd === null) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#012f49] to-[#012f49]/80 hover:from-[#012f49]/90 hover:to-[#012f49]/70 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9a9.001 9.001 0 00-1.684-5.316m-7.432 0a3 3 0 110 2.684" />
        </svg>
        {copied ? 'Copied!' : 'Share Loop'}
      </button>
    </div>
  );
}