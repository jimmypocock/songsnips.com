import Link from "next/link";
import SongSnips from "@/components/SongSnips";

export default function Home() {
  return (
    <>
      {/* Top accent bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#012f49] via-orange-500 to-[#fcc04a] z-50"></div>
      
      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#012f49]/5 via-transparent to-[#fcc04a]/5 rounded-2xl blur-xl"></div>
          <div className="relative flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl px-6 py-3 border border-[#012f49]/10">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            SongSnips
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-yellow-500 transition-colors">
              How It Works
            </Link>
            <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-yellow-500 transition-colors">
              About
            </Link>
          </div>
        </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <SongSnips />
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
    </>
  );
}