// DELETE if you don't need it
export default function AdSenseVerification() {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (!adClient) {
    return null;
  }

  // Return the exact script tag Google expects for verification
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
      crossOrigin="anonymous"
      dangerouslySetInnerHTML={{ __html: '' }}
    />
  );
}