import AdUnit from './AdUnit';

interface AdSidebarProps {
  adSlot: string;
  className?: string;
  testMode?: boolean;
}

export default function AdSidebar({ adSlot, className = '', testMode = false }: AdSidebarProps) {
  return (
    <div className={`ad-sidebar ${className}`}>
      {/* Desktop: Skyscraper (160x600) or Large Rectangle (336x280) */}
      <div className="hidden xl:block">
        <AdUnit
          adSlot={adSlot}
          adFormat="vertical"
          style={{ width: '160px', height: '600px' }}
          testMode={testMode}
        />
      </div>
      
      {/* Tablet/Smaller Desktop: Medium Rectangle (300x250) */}
      <div className="hidden lg:block xl:hidden">
        <AdUnit
          adSlot={adSlot}
          adFormat="rectangle"
          style={{ width: '300px', height: '250px' }}
          testMode={testMode}
        />
      </div>
      
      {/* Mobile: Hide sidebar ads */}
      <div className="block lg:hidden" />
    </div>
  );
}