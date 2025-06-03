'use client';

import { useState } from 'react';
import AdUnit from './AdUnit';

interface AdStickyBottomProps {
  adSlot: string;
  testMode?: boolean;
}

export default function AdStickyBottom({ adSlot, testMode = false }: AdStickyBottomProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-700 z-40 lg:hidden">
      <div className="relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-opacity-90 transition-opacity z-10"
          aria-label="Close ad"
        >
          ×
        </button>
        <AdUnit
          adSlot={adSlot}
          adFormat="horizontal"
          style={{ width: '320px', height: '50px' }}
          className="mx-auto"
          testMode={testMode}
        />
      </div>
    </div>
  );
}