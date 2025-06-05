'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
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

  return (
    <footer className="mt-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              {theme === 'light' ? (
                <Image 
                  src="/images/logo.webp" 
                  alt="SongSnips Logo" 
                  width={150} 
                  height={50} 
                  className="h-10 w-auto"
                />
              ) : (
                <Image 
                  src="/images/logo-white.webp" 
                  alt="SongSnips Logo" 
                  width={150} 
                  height={50} 
                  className="h-10 w-auto"
                />
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The simplest way to loop YouTube videos for music practice. 
              Master difficult passages, learn songs faster, and improve your musical skills.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Built with ❤️ by musicians, for musicians
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:jimmycpocock+SongSnips@gmail.com" 
                  className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              © {currentYear} SongSnips. All rights reserved.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Not affiliated with YouTube or Google
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}