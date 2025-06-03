import Script from 'next/script';

export default function AdSenseScript() {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  
  if (!adClient || process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}