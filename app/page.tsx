import SongSnips from "@/components/SongSnips";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SongSnips - Loop YouTube Videos for Practice",
  description: "Free YouTube video looper for musicians, dancers, and language learners. Loop any section of a YouTube video with precision. No sign-up required.",
  keywords: "youtube looper, video loop, music practice, loop youtube, ab repeat, section repeat, practice tool",
  openGraph: {
    title: "SongSnips - Loop YouTube Videos for Practice",
    description: "Free YouTube video looper for musicians, dancers, and language learners. Loop any section of a YouTube video with precision.",
    type: "website",
    url: "https://songsnips.com",
  },
};

export default function Home() {
  return (
    <main className="relative z-10 max-w-4xl mx-auto px-2 sm:px-4 py-8">
      <SongSnips />
    </main>
  );
}