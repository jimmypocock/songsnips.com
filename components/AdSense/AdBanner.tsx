import AdUnit from './AdUnit';

interface AdBannerProps {
  adSlot: string;
  className?: string;
  testMode?: boolean;
}

export default function AdBanner({ adSlot, className = '', testMode = false }: AdBannerProps) {
  return (
    <div className={`w-full overflow-hidden ad-container ${className}`}>
      <div className="mx-auto max-w-screen-xl px-4 py-2">
        {/* Desktop: Leaderboard (728x90) */}
        <div className="hidden lg:block">
          <AdUnit
            adSlot={adSlot}
            adFormat="horizontal"
            style={{ width: '728px', height: '90px' }}
            className="mx-auto"
            testMode={testMode}
          />
        </div>
        
        {/* Tablet: Banner (468x60) */}
        <div className="hidden md:block lg:hidden">
          <AdUnit
            adSlot={adSlot}
            adFormat="horizontal"
            style={{ width: '468px', height: '60px' }}
            className="mx-auto"
            testMode={testMode}
          />
        </div>
        
        {/* Mobile: Responsive */}
        <div className="block md:hidden">
          <AdUnit
            adSlot={adSlot}
            adFormat="auto"
            testMode={testMode}
          />
        </div>
      </div>
    </div>
  );
}