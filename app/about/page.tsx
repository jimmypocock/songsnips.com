import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About SongSnips - Our Story',
  description: 'Learn about SongSnips, the free YouTube looper built by musicians for musicians. Discover our mission to make practice more efficient.',
  keywords: 'about songsnips, youtube looper story, music practice tool, founder story',
  openGraph: {
    title: 'About SongSnips - Our Story',
    description: 'Learn about SongSnips, the free YouTube looper built by musicians for musicians.',
    type: 'website',
    url: 'https://songsnips.com/about',
  },
};

export default function About() {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <div className="relative py-16 overflow-hidden">
        {/* Gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              About SongSnips
            </h1>
            <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-400">
              Built by musicians, for musicians. SongSnips was born from the frustration of 
              endlessly clicking the YouTube progress bar trying to repeat that one tricky section.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            The Story Behind SongSnips
          </h2>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Hi! I&apos;m the creator of SongSnips. As a passionate musician and developer, I&apos;ve spent 
              countless hours practicing songs on YouTube. Whether it was learning a complex guitar 
              solo, mastering a piano passage, or transcribing drum fills, I always found myself 
              fighting with the YouTube player.
            </p>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              The constant rewinding, the imprecise clicking, the frustration of overshooting the 
              section I wanted to practice – it was taking more time than the actual practice! I 
              searched for solutions, but everything was either too complicated, required browser 
              extensions, or had features I didn&apos;t need.
            </p>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              That&apos;s when I decided to build SongSnips. My goal was simple: create the most 
              intuitive, distraction-free tool for looping YouTube videos. No sign-ups, no 
              installations, no unnecessary features – just pure functionality that works exactly 
              when you need it.
            </p>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Today, SongSnips helps thousands of musicians, language learners, dancers, and 
              students master their craft more efficiently. Every feature – from keyboard shortcuts 
              to speed control – was added based on real user needs and feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Our Mission
          </h2>
          
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
              To make practice more efficient and enjoyable by providing the simplest, 
              most effective tools for repetitive learning.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Simple</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No clutter, no complexity. Just the features you need.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Fast</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Set up your loops in seconds, not minutes.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🆓</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Free</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No subscriptions, no paywalls. Free forever.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Grid */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-12 text-center">
            Who Uses SongSnips?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                emoji: '🎸',
                title: 'Musicians',
                description: 'Master difficult passages, learn solos, and practice with backing tracks at your own pace.'
              },
              {
                emoji: '💃',
                title: 'Dancers',
                description: 'Perfect your choreography by looping specific sections of dance videos.'
              },
              {
                emoji: '🗣️',
                title: 'Language Learners',
                description: 'Repeat pronunciation and dialogue sections until you get them perfect.'
              },
              {
                emoji: '🎓',
                title: 'Students',
                description: 'Review lecture segments and educational content at your own speed.'
              },
              {
                emoji: '🏃',
                title: 'Athletes',
                description: 'Analyze technique and form by studying movement patterns repeatedly.'
              },
              {
                emoji: '🎭',
                title: 'Content Creators',
                description: 'Study viral videos and perfect your own content creation techniques.'
              }
            ].map((useCase, index) => (
              <div 
                key={index} 
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{useCase.emoji}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Ready to Practice Smarter?
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            Join thousands of learners who are mastering their skills more efficiently with SongSnips.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Start Practicing Now
            <span className="text-xl">→</span>
          </Link>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Questions or Feedback?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Have questions, suggestions, or just want to say hi? I&apos;d love to hear from you!
          </p>
          <a 
            href="mailto:jimmycpocock+SongSnips@gmail.com" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Get In Touch
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}