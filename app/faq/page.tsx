import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | SongSnips',
  description: 'Find answers to common questions about using SongSnips, the free YouTube video looper for practice and learning.',
  keywords: 'songsnips faq, youtube looper questions, video loop help, practice tool faq',
  openGraph: {
    title: 'FAQ - SongSnips',
    description: 'Get answers to frequently asked questions about SongSnips.',
    type: 'website',
    url: 'https://songsnips.com/faq',
  },
};

export default function FAQ() {
  const faqs = [
    {
      question: "Is SongSnips free to use?",
      answer: "Yes! SongSnips is completely free to use. There are no hidden fees, premium tiers, or subscriptions. We believe practice tools should be accessible to everyone."
    },
    {
      question: "Do I need to create an account?",
      answer: "No account needed! Just paste a YouTube URL and start looping. Your saved loops are stored locally in your browser, giving you full control over your data."
    },
    {
      question: "Which browsers does SongSnips support?",
      answer: "SongSnips works on all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using the latest version of your browser."
    },
    {
      question: "Can I use SongSnips on mobile devices?",
      answer: "Yes! SongSnips is fully responsive and works on smartphones and tablets. The interface automatically adapts to your screen size for comfortable practice on any device."
    },
    {
      question: "Why can't I load certain YouTube videos?",
      answer: "Some YouTube videos have embedding restrictions set by their owners. If a video won't load, it's likely blocked from being embedded on external sites. Try finding an alternative upload of the same content."
    },
    {
      question: "How do I save my loops?",
      answer: "Click the bookmark icon after setting your loop points. Your loops are saved in your browser's local storage, so they'll be there when you return. You can save multiple loops per video and name them for easy reference."
    },
    {
      question: "Can I share my loops with others?",
      answer: "Yes! Once you've set up a loop, use the Share button (next to the save button) to copy a shareable URL. This URL includes the video and your exact loop points, so others can instantly load the same loop. The Share button appears when you have both loop points set."
    },
    {
      question: "Is there a limit to how many loops I can save?",
      answer: "You can save up to 10 loops per video. This keeps the interface clean while giving you plenty of options for different practice sections."
    },
    {
      question: "Can I adjust playback speed?",
      answer: "Yes! Use the speed control to slow down difficult passages or speed up for challenge practice. Speeds range from 0.25x to 2x normal speed."
    },
    {
      question: "What are the keyboard shortcuts?",
      answer: "Press Spacebar to play/pause, Arrow keys to seek forward/backward, and use the number keys 1-9 to jump to different positions in the video. These shortcuts make practice more efficient."
    },
    {
      question: "Does SongSnips work offline?",
      answer: "No, SongSnips requires an internet connection to load and play YouTube videos. However, your saved loop configurations are stored locally and don't require a connection to access."
    },
    {
      question: "Is my data private?",
      answer: "Absolutely. Your loops and preferences are stored locally in your browser. We don't have access to your saved loops or practice history. We only use analytics to understand general usage patterns."
    },
    {
      question: "Can I download videos?",
      answer: "No, SongSnips doesn't support downloading videos. We respect YouTube's terms of service and content creators' rights. The tool is designed for streaming practice only."
    },
    {
      question: "Why does the loop have a slight pause?",
      answer: "The brief pause when looping is due to YouTube's API limitations. We've optimized it as much as possible, but a small delay is unavoidable when seeking back to the start point."
    },
    {
      question: "Can I use SongSnips for teaching?",
      answer: "Yes! Many teachers use SongSnips to create practice assignments for students. You can set up loops for specific sections and share the video URL and timestamps with your students."
    },
    {
      question: "How do I report a bug or suggest a feature?",
      answer: "We'd love to hear from you! Email us at jimmycpocock+SongSnips@gmail.com with bug reports or feature suggestions. We read every message and continuously improve based on user feedback."
    },
    {
      question: "Does SongSnips work with other video platforms?",
      answer: "Currently, SongSnips only supports YouTube videos. We chose to focus on YouTube to provide the best possible experience for the largest library of educational content."
    },
    {
      question: "What makes SongSnips different from browser extensions?",
      answer: "Unlike browser extensions, SongSnips works instantly without installation, operates across all devices and browsers, and doesn't require permissions to access your browsing data. It's simpler, safer, and more accessible."
    }
  ];

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400">
              Everything you need to know about using SongSnips for your practice sessions
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Can&apos;t find what you&apos;re looking for? We&apos;re here to help!
          </p>
          <a 
            href="mailto:jimmycpocock+SongSnips@gmail.com" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Contact Support
            <span className="text-xl">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}