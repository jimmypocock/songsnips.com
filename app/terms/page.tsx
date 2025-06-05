import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - SongSnips',
  description: 'SongSnips terms of service. Understand your rights and responsibilities when using our YouTube video looping tool.',
  keywords: 'terms of service, user agreement, songsnips terms, youtube looper terms',
  openGraph: {
    title: 'Terms of Service - SongSnips',
    description: 'Read the SongSnips terms of service to understand your rights and responsibilities.',
    type: 'website',
    url: 'https://songsnips.com/terms',
  },
};

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Terms of Service
      </h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last updated: December 6, 2024
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            By accessing and using SongSnips (&quot;the Service&quot;), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            2. Description of Service
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            SongSnips is a web-based tool that allows users to:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Loop specific sections of YouTube videos</li>
            <li>Save loop points for future practice sessions</li>
            <li>Control playback speed for learning purposes</li>
            <li>Share loop configurations via URL</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            SongSnips does not host, store, or distribute any video content. We simply provide an interface 
            to control YouTube&apos;s embedded player functionality.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            3. Use of Service
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You agree to use SongSnips only for lawful purposes and in accordance with these Terms. You agree not to:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Use the Service to violate any applicable laws or regulations</li>
            <li>Attempt to circumvent YouTube&apos;s terms of service or content restrictions</li>
            <li>Use the Service to access content you don&apos;t have rights to view</li>
            <li>Attempt to reverse engineer, decompile, or hack the Service</li>
            <li>Use automated scripts or bots to access the Service</li>
            <li>Interfere with or disrupt the Service or its servers</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            4. YouTube Content
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            All video content accessed through SongSnips is provided by YouTube and is subject to YouTube&apos;s 
            Terms of Service. We do not control, endorse, or assume responsibility for any content viewed 
            through our Service.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You are responsible for complying with YouTube&apos;s Terms of Service and any applicable copyright laws 
            when using content through our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            5. Intellectual Property
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The SongSnips service, including its original content, features, and functionality, is owned by 
            SongSnips and is protected by international copyright, trademark, and other intellectual property laws.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our Service may contain links to third-party websites or services that are not owned or controlled 
            by SongSnips. We have no control over and assume no responsibility for the content, privacy policies, 
            or practices of any third-party websites or services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            6. User Data and Privacy
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Your use of our Service is also governed by our Privacy Policy. By using SongSnips, you consent 
            to our collection and use of information as described in the Privacy Policy.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Loop configurations saved in your browser are stored locally and are not transmitted to our servers. 
            We do not have access to your saved loops unless you choose to share them via URL.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            7. Disclaimer of Warranties
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            SongSnips is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind, either express 
            or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses 
            or other harmful components.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We make no warranties about the accuracy, reliability, completeness, or timeliness of the Service 
            or any content accessed through it.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            8. Limitation of Liability
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To the maximum extent permitted by law, SongSnips shall not be liable for any indirect, incidental, 
            special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
            directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting 
            from your use of the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            9. Indemnification
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You agree to indemnify and hold harmless SongSnips and its officers, directors, employees, and 
            agents from any claims, liabilities, damages, losses, and expenses, including reasonable attorney&apos;s 
            fees, arising out of or in any way connected with your access to or use of the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            10. Modifications to Service and Terms
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We reserve the right to modify or discontinue the Service at any time without notice. We also 
            reserve the right to modify these Terms at any time. Your continued use of the Service after 
            any such changes constitutes your acceptance of the new Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            11. Termination
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We may terminate or suspend your access to the Service immediately, without prior notice or 
            liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            12. Governing Law
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            These Terms shall be governed by and construed in accordance with the laws of the United States, 
            without regard to its conflict of law provisions. Any disputes arising from these Terms or your 
            use of the Service shall be resolved in the courts of the United States.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            13. Contact Information
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you have any questions about these Terms of Service, please contact us at:
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