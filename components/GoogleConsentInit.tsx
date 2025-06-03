import Script from 'next/script';

export default function GoogleConsentInit() {
  return (
    <Script id="google-consent-init" strategy="afterInteractive">
      {`
        window.gtag = window.gtag || function() {
          (window.gtag.q = window.gtag.q || []).push(arguments);
        };
        
        // Set default consent to denied (required for CMP)
        gtag('consent', 'default', {
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied',
          'analytics_storage': 'denied'
        });
      `}
    </Script>
  );
}