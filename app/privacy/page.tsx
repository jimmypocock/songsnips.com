import Link from 'next/link';

export default function Privacy() {
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
            Privacy Policy
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Last updated: [Date]
            </p>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.
            </p>

            <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We may collect the following types of information:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
              <li><strong>Usage Data:</strong> Information about how you use our application</li>
              <li><strong>Device Information:</strong> Browser type, device type, and technical information</li>
              <li><strong>Cookies:</strong> Small files stored on your device to improve functionality</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We use the collected information to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
              <li>Provide and maintain our service</li>
              <li>Improve user experience and application functionality</li>
              <li>Analyze usage patterns and performance</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our application may use third-party services that have their own privacy policies:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
              <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
              <li><strong>Google AdSense:</strong> For displaying relevant advertisements</li>
              <li><strong>AWS:</strong> For hosting and infrastructure services</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Cookies and Tracking</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our application</li>
              <li>Show relevant advertisements</li>
              <li>Improve our services</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You can control cookie settings through our consent banner and your browser settings.
            </p>

            <h2 className="text-2xl font-bold mb-4">Data Security</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We implement appropriate security measures to protect your information, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and authentication</li>
              <li>Compliance with industry standards</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
              <li>Right to access your personal information</li>
              <li>Right to correct inaccurate information</li>
              <li>Right to delete your information</li>
              <li>Right to restrict or object to processing</li>
              <li>Right to data portability</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Email: [Your Contact Email]<br />
              Address: [Your Address]
            </p>

            <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page with an updated date.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href="/terms" className="btn-primary text-center">
                View Terms of Service
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