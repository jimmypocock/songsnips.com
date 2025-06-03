'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdUnitProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal' | 'video';
  style?: React.CSSProperties;
  className?: string;
  testMode?: boolean;
}

export default function AdUnit({
  adSlot,
  adFormat = 'auto',
  style,
  className = '',
  testMode = false
}: AdUnitProps) {
  const showAds = process.env.NEXT_PUBLIC_SHOW_ADS === 'true';
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const consent = localStorage.getItem('cookie-consent');
    if (showAds && !testMode && adClient && consent === 'accepted') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [showAds, testMode, adClient]);

  // If ads are disabled via env var, return nothing
  if (!showAds) {
    return null;
  }
  
  // Always show placeholder when ads are enabled
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-400 dark:border-gray-500 flex items-center justify-center text-gray-600 dark:text-gray-400 ${className}`}
      style={{
        minHeight: '90px',
        ...style
      }}
    >
      <div className="text-center p-4">
        <p className="font-semibold">
          {adFormat === 'video' ? '📹 Video Ad Placeholder' : 'Ad Placeholder'}
        </p>
        <p className="text-sm">Slot: {adSlot}</p>
        <p className="text-xs mt-1">
          {!adClient ? 'No AdSense Client ID' : 'Ad Placeholder'}
        </p>
        {adFormat === 'video' && (
          <p className="text-xs mt-2 text-gray-500">
            Video ads typically have higher revenue
          </p>
        )}
      </div>
    </div>
  );
}