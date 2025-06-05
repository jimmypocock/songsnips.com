'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

declare global {
  interface Window {
    gtag: {
      (...args: unknown[]): void;
      q?: unknown[];
    };
  }
}

export default function GoogleCMP() {
  const [showBanner, setShowBanner] = useState(false);
  const [showManageOptions, setShowManageOptions] = useState(false);

  useEffect(() => {
    // Initialize gtag if not already present
    if (!window.gtag) {
      window.gtag = Object.assign(
        function(...args: unknown[]) {
          window.gtag.q = window.gtag.q || [];
          window.gtag.q.push(args);
        },
        { q: [] as unknown[] }
      );
    }

    // Set default consent to denied
    window.gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied'
    });

    // Check if user has already made a choice
    const consent = localStorage.getItem('google-cmp-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      // Update consent based on stored preference
      const consentSettings = JSON.parse(consent);
      window.gtag('consent', 'update', consentSettings);
    }
  }, []);

  const handleAcceptAll = () => {
    const consentSettings = {
      'ad_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted',
      'analytics_storage': 'granted'
    };
    
    window.gtag('consent', 'update', consentSettings);
    localStorage.setItem('google-cmp-consent', JSON.stringify(consentSettings));
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    setShowManageOptions(false);
  };

  const handleManageOptions = () => {
    setShowManageOptions(true);
  };

  const handleSaveCustom = (settings: Record<string, string>) => {
    window.gtag('consent', 'update', settings);
    localStorage.setItem('google-cmp-consent', JSON.stringify(settings));
    localStorage.setItem('cookie-consent', settings.ad_storage === 'granted' ? 'accepted' : 'declined');
    setShowBanner(false);
    setShowManageOptions(false);
  };

  if (!showBanner && !showManageOptions) return null;

  return (
    <>

      {/* Consent Banner */}
      {showBanner && !showManageOptions && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
          <div className="max-w-screen-xl mx-auto p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  We value your privacy
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We and our partners store and/or access information on a device, such as cookies and process personal data, 
                  such as unique identifiers and standard information sent by a device for personalised advertising and content, 
                  advertising and content measurement, audience research and services development.{' '}
                  <Link href="/privacy" className="underline hover:text-primary">
                    Privacy Policy
                  </Link>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
                <button
                  onClick={handleManageOptions}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  Manage Options
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm text-white rounded transition-colors"
                  style={{ backgroundColor: 'var(--primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                >
                  Consent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Options Modal */}
      {showManageOptions && (
        <ManageOptionsModal onSave={handleSaveCustom} onClose={() => setShowManageOptions(false)} />
      )}
    </>
  );
}

function ManageOptionsModal({ onSave, onClose }: { onSave: (settings: Record<string, string>) => void; onClose: () => void }) {
  const [adStorage, setAdStorage] = useState(false);
  const [adPersonalization, setAdPersonalization] = useState(false);
  const [analyticsStorage, setAnalyticsStorage] = useState(false);

  const handleSave = () => {
    const settings = {
      'ad_storage': adStorage ? 'granted' : 'denied',
      'ad_user_data': adStorage ? 'granted' : 'denied',
      'ad_personalization': adPersonalization ? 'granted' : 'denied',
      'analytics_storage': analyticsStorage ? 'granted' : 'denied'
    };
    onSave(settings);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy Preferences</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={adStorage}
                  onChange={(e) => setAdStorage(e.target.checked)}
                  className="mt-1 rounded border-gray-300"
                  style={{ 
                    accentColor: 'var(--primary)',
                    '--tw-ring-color': 'var(--primary)'
                  } as React.CSSProperties & { '--tw-ring-color': string }}
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Advertising</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Allow personalized ads based on your interests and browsing behavior.
                  </div>
                </div>
              </label>
            </div>

            <div>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={adPersonalization}
                  onChange={(e) => setAdPersonalization(e.target.checked)}
                  className="mt-1 rounded border-gray-300"
                  style={{ 
                    accentColor: 'var(--primary)',
                    '--tw-ring-color': 'var(--primary)'
                  } as React.CSSProperties & { '--tw-ring-color': string }}
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Ad Personalization</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Customize ads based on your profile and preferences.
                  </div>
                </div>
              </label>
            </div>

            <div>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={analyticsStorage}
                  onChange={(e) => setAnalyticsStorage(e.target.checked)}
                  className="mt-1 rounded border-gray-300"
                  style={{ 
                    accentColor: 'var(--primary)',
                    '--tw-ring-color': 'var(--primary)'
                  } as React.CSSProperties & { '--tw-ring-color': string }}
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Analytics</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Help us understand how you use our site to improve your experience.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onSave({
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied'
              })}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline transition-colors"
            >
              Reject All
            </button>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm text-white rounded transition-colors"
                style={{ backgroundColor: 'var(--primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}