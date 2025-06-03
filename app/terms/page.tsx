import Link from 'next/link';

export default function Terms() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
              Your App
            </h1>
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
              How it Works
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="glass-card p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Terms of Service
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Last updated: [Date]
            </p>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              These Terms of Service govern your use of our application and services. By using our service, you agree to these terms.
            </p>

            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by these terms, please do not use this service.
            </p>

            <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Permission is granted to temporarily access our application for personal, non-commercial transitory viewing only. 
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained in the application</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">3. Disclaimer</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The materials in this application are provided on an &apos;as is&apos; basis. We make no warranties, expressed or implied, 
              and hereby disclaim and negate all other warranties including without limitation, implied warranties or conditions 
              of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h2 className="text-2xl font-bold mb-4">4. Limitations</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for 
              loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials 
              in this application, even if we or our authorized representative has been notified orally or in writing of the 
              possibility of such damage.
            </p>

            <h2 className="text-2xl font-bold mb-4">5. Accuracy of Materials</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The materials appearing in this application could include technical, typographical, or photographic errors. 
              We do not warrant that any of the materials are accurate, complete, or current. We may make changes to the 
              materials contained in this application at any time without notice.
            </p>

            <h2 className="text-2xl font-bold mb-4">6. Links</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We have not reviewed all of the sites linked to our application and are not responsible for the contents of 
              any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any 
              such linked website is at the user&apos;s own risk.
            </p>

            <h2 className="text-2xl font-bold mb-4">7. Modifications</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We may revise these terms of service for its application at any time without notice. By using this application, 
              you are agreeing to be bound by the then current version of these terms of service.
            </p>

            <h2 className="text-2xl font-bold mb-4">8. Governing Law</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              These terms and conditions are governed by and construed in accordance with the laws of [Your Jurisdiction] 
              and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
            </p>

            <h2 className="text-2xl font-bold mb-4">9. Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Email: [Your Contact Email]<br />
              Address: [Your Address]
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href="/privacy" className="btn-primary text-center">
                View Privacy Policy
              </Link>
              <Link 
                href="/" 
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}