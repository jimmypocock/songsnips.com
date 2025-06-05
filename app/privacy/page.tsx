import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - SongSnips',
  description: 'SongSnips privacy policy. Learn how we protect your data and respect your privacy while using our YouTube video looper.',
  keywords: 'privacy policy, data protection, songsnips privacy, youtube looper privacy',
  openGraph: {
    title: 'Privacy Policy - SongSnips',
    description: 'Learn how SongSnips protects your privacy and handles your data.',
    type: 'website',
    url: 'https://songsnips.com/privacy',
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Privacy Policy
      </h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last updated: December 6, 2024
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            1. Introduction
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            SongSnips (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you use our website 
            and service at songsnips.com.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Please read this privacy policy carefully. If you do not agree with the terms of this privacy 
            policy, please do not access the site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            2. Information We Collect
          </h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Information Automatically Collected
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            When you visit SongSnips, we automatically collect certain information about your device:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Referring website</li>
            <li>Pages viewed and time spent on pages</li>
            <li>Links clicked</li>
            <li>General geographic location (country/city level)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Information Stored Locally
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            SongSnips stores certain information locally in your browser:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Loop configurations (start/end points for videos)</li>
            <li>Theme preferences (light/dark mode)</li>
            <li>Playback speed preferences</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            This information is stored using browser localStorage and is not transmitted to our servers. 
            We do not have access to this data unless you explicitly share it (e.g., by sharing a loop URL).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            3. How We Use Your Information
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Provide and maintain our Service</li>
            <li>Improve and optimize our Service</li>
            <li>Understand how users interact with our Service</li>
            <li>Diagnose technical issues and errors</li>
            <li>Protect against fraudulent or illegal activity</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            4. Third-Party Services
          </h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Google Analytics
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We use Google Analytics to analyze usage of our Service. Google Analytics collects information 
            such as how often users visit the site, what pages they visit, and what other sites they used 
            prior to coming to our site. We use this information solely to improve our Service.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Google Analytics uses cookies to collect this information. You can opt-out of Google Analytics 
            by installing the Google Analytics opt-out browser add-on.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Google AdSense
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We use Google AdSense to display advertisements on our Service. Google AdSense uses cookies to 
            serve ads based on your prior visits to our website or other websites. You can opt out of 
            personalized advertising by visiting Google&apos;s Ads Settings.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            YouTube API
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our Service uses the YouTube IFrame Player API to embed and control YouTube videos. When you 
            use our Service to play YouTube videos, you are also subject to YouTube&apos;s Terms of Service 
            and Google&apos;s Privacy Policy.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Amazon Web Services (AWS)
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We use AWS to host our Service. AWS may collect technical information about your connection 
            to ensure the security and performance of our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            5. Cookies and Tracking Technologies
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We use cookies and similar tracking technologies to track activity on our Service. Cookies are 
            files with a small amount of data that are sent to your browser from a website and stored on 
            your device.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
            However, if you do not accept cookies, you may not be able to use some portions of our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            6. Data Security
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We implement appropriate technical and organizational security measures to protect your information. 
            However, please note that no method of transmission over the Internet or method of electronic 
            storage is 100% secure.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Since most user data (loop configurations, preferences) is stored locally in your browser, you 
            maintain control over this data. You can clear this data at any time by clearing your browser&apos;s 
            localStorage.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            7. Data Retention
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We retain automatically collected information (such as analytics data) for up to 26 months, 
            after which it is automatically deleted or anonymized.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Data stored locally in your browser persists until you clear your browser data or until you 
            manually delete it through our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            8. Children&apos;s Privacy
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our Service is not intended for children under 13 years of age. We do not knowingly collect 
            personal information from children under 13. If you are a parent or guardian and believe your 
            child has provided us with personal information, please contact us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            9. International Users
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you are accessing our Service from outside the United States, please be aware that your 
            information may be transferred to, stored, and processed in the United States where our servers 
            are located and our central database is operated.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            10. Your Privacy Rights
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>The right to access the personal information we hold about you</li>
            <li>The right to request correction of inaccurate personal information</li>
            <li>The right to request deletion of your personal information</li>
            <li>The right to object to or restrict processing of your personal information</li>
            <li>The right to data portability</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To exercise these rights, please contact us using the information provided below.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            11. California Privacy Rights
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you are a California resident, you have additional rights under the California Consumer 
            Privacy Act (CCPA), including the right to know what personal information is collected, used, 
            shared, or sold.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            12. Do Not Track Signals
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We do not currently respond to Do Not Track (DNT) browser signals. However, you can control 
            tracking through your browser settings and by opting out of Google Analytics as described above.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            13. Changes to This Privacy Policy
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by 
            posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date at the top 
            of this Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            14. Contact Us
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Email: jimmycpocock+SongSnips@gmail.com<br />
            Website: https://songsnips.com
          </p>
        </section>
      </div>
    </div>
  );
}