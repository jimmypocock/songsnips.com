'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Listen for theme changes
    const checkTheme = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';
      setTheme(currentTheme || 'light');
    };
    
    // Check initial theme
    checkTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    
    return () => observer.disconnect();
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-br from-gray-50/95 to-gray-100/95 dark:from-gray-900/95 dark:to-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            {theme === 'light' ? (
              <Image 
                src="/images/logo.webp" 
                alt="SongSnips Logo" 
                width={150} 
                height={50} 
                className="h-10 w-auto group-hover:scale-105 transition-transform"
              />
            ) : (
              <Image 
                src="/images/logo-white.webp" 
                alt="SongSnips Logo" 
                width={150} 
                height={50} 
                className="h-10 w-auto group-hover:scale-105 transition-transform"
              />
            )}
          </Link>

          {/* Right side - Navigation and Theme Toggle */}
          <div className="flex items-center gap-6">
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/" 
                className={`transition-colors ${
                  isActive('/') 
                    ? 'text-primary dark:text-accent font-semibold' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent'
                }`}
              >
                Home
              </Link>
              <Link 
                href="/how-it-works" 
                className={`transition-colors ${
                  isActive('/how-it-works') 
                    ? 'text-primary dark:text-accent font-semibold' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent'
                }`}
              >
                How It Works
              </Link>
              <Link 
                href="/about" 
                className={`transition-colors ${
                  isActive('/about') 
                    ? 'text-primary dark:text-accent font-semibold' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent'
                }`}
              >
                About
              </Link>
              <Link 
                href="/faq" 
                className={`transition-colors ${
                  isActive('/faq') 
                    ? 'text-primary dark:text-accent font-semibold' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent'
                }`}
              >
                FAQ
              </Link>
            </nav>
            
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}