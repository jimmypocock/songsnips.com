import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            SongSnips
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-yellow-500 transition-colors">
              Home
            </Link>
            <Link href="/how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-yellow-500 transition-colors">
              How it Works
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12 rounded-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent text-center">
              About SongSnips
            </h1>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-center">
                Master any song section with smart looping
              </p>

              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                SongSnips was created to help musicians, language learners, dancers, and anyone who needs to practice specific sections of videos repeatedly. We believe that focused practice on challenging sections is the key to mastery, and we've made it as simple as clicking on a timeline.
              </p>

              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Why SongSnips?</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Traditional video players force you to manually rewind and find your spot over and over. With SongSnips, you can:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
                <li>Set precise loop points with a single click</li>
                <li>Adjust your loops on the fly with draggable handles</li>
                <li>Practice without interruption - the loop continues automatically</li>
                <li>Work with any YouTube video - no downloads required</li>
                <li>Use it completely free, forever</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Who Uses SongSnips?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2 text-orange-700 dark:text-orange-300">🎸 Musicians</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Perfect for learning guitar solos, piano pieces, drum fills, or any challenging musical passage
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2 text-yellow-700 dark:text-yellow-300">🗣️ Language Learners</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Repeat native speaker pronunciations and phrases until you get them just right
                  </p>
                </div>
                <div className="bg-[#e9e2b6] dark:bg-gray-700/20 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2 text-[#012f49] dark:text-gray-300">💃 Dancers</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Master complex choreography by practicing specific moves repeatedly
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2 text-red-700 dark:text-red-300">📚 Students</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Review key concepts from educational videos without constant rewinding
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Privacy & Security</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                SongSnips respects your privacy. We don't store any of your viewing history or personal data. Videos are played directly from YouTube through their official API, ensuring all content remains secure and respects the original creator's settings.
              </p>

              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Get Started</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Ready to improve your practice sessions? Head back to the home page and paste any YouTube URL to begin!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
                <Link href="/" className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-lg shadow-orange-500/25 transition-all duration-200 text-center">
                  Start Practicing
                </Link>
                <Link href="/how-it-works" className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center">
                  Learn How It Works
                </Link>
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
              <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-yellow-500 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-yellow-500 transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}