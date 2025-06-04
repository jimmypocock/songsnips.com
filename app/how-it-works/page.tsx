import Link from "next/link";
import Image from "next/image";

export default function HowItWorks() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Image 
              src="/images/logo.webp" 
              alt="SongSnips Logo" 
              width="150" 
              height="50" 
              className="h-10 w-auto"
            />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-secondary transition-colors font-medium">
              Home
            </Link>
            <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-secondary transition-colors font-medium">
              About
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-8 text-center">
            How It Works
          </h1>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="glass-card p-8 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                    Load Your Video
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Simply paste any YouTube URL into the input field and click &ldquo;Load Video&rdquo;. SongSnips will instantly load the video in our player.
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <code className="text-sm text-secondary dark:text-secondary">
                      https://youtube.com/watch?v=your-video-id
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-8 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                    Set Your Loop Points
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Click anywhere on the timeline to set your loop start point. Click again to set the end point. The green section shows your selected loop.
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600 dark:text-green-400 font-mono font-semibold">[</span>
                    <span className="text-gray-500">Start</span>
                    <span className="text-gray-400 mx-2">———</span>
                    <span className="text-gray-500">End</span>
                    <span className="text-green-600 dark:text-green-400 font-mono font-semibold">]</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-8 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                    Fine-Tune Your Loop
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Drag the green handles to precisely adjust your loop boundaries. You can make your loop as short or as long as needed for perfect practice.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="glass-card p-8 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center font-bold text-xl">
                  4
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                    Practice Away!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Click &ldquo;Enable Loop&rdquo; and the video will automatically repeat your selected section. Use the Stop button to quickly return to your loop start point.
                  </p>
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary p-6 rounded-lg mt-12">
              <h3 className="text-lg font-semibold text-primary dark:text-accent mb-3">
                Pro Tips
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>Use keyboard shortcuts: Space to play/pause, Arrow keys to seek</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>The timeline shows your current position in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>Clear your loop anytime to set new practice sections</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>Works great for music practice, language learning, and tutorials</span>
                </li>
              </ul>
            </div>

            {/* Use Cases */}
            <div className="mt-12">
              <h2 className="text-3xl font-semibold mb-6 text-center text-gray-900 dark:text-gray-100">
                Perfect For
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-xl text-center">
                  <div className="text-4xl mb-3">🎸</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Musicians</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Loop difficult passages, solos, or chord progressions
                  </p>
                </div>
                <div className="glass-card p-6 rounded-xl text-center">
                  <div className="text-4xl mb-3">🗣️</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Language Learners</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Repeat phrases and pronunciation exercises
                  </p>
                </div>
                <div className="glass-card p-6 rounded-xl text-center">
                  <div className="text-4xl mb-3">💃</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Dancers</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Practice specific choreography sections repeatedly
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} SongSnips. Free to use, made with ❤️
              </p>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-secondary dark:hover:text-secondary transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-secondary dark:hover:text-secondary transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}