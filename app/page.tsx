import Link from "next/link";
import Image from "next/image";
import SongSnips from "@/components/SongSnips";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <>
      {/* Header with Theme Toggle */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="h-0.5 bg-gradient-to-r from-primary via-secondary to-secondary"></div>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Image 
            src="/images/logo.webp" 
            alt="SongSnips Logo" 
            width={150} 
            height={50} 
            className="h-10 w-auto"
          />
          <div className="flex items-center gap-4">
            <Link href="/how-it-works" className="text-sm text-gray-600 dark:text-gray-400 hover:text-secondary px-2 py-1 rounded-md hover:bg-secondary/10 transition-all duration-200">
              Help
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content - Compact */}
      <main className="relative z-10 max-w-4xl mx-auto px-2 sm:px-4 py-4 pb-20">
        <SongSnips />
      </main>

      {/* Minimal Footer */}
      <footer className="mt-auto py-4 text-center text-xs text-gray-500">
        <Link href="/privacy" className="hover:text-secondary">Privacy</Link>
        <span className="mx-2">•</span>
        <Link href="/terms" className="hover:text-secondary">Terms</Link>
      </footer>
    </>
  );
}