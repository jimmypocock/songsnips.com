# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Running the application
```bash
npm run dev
```
Then visit: http://localhost:3000/

### Building for production
```bash
npm run build
npm run export
```

## Architecture

This is a Next.js web application for looping sections of YouTube videos, designed for music practice. The application consists of:

- **app/**: Next.js app directory with pages and layouts
- **components/**: React components including the main SongSnips player
- **hooks/**: Custom React hooks for YouTube player functionality
- **docs/**: Research documentation on alternative approaches and platform restrictions

The application uses the YouTube IFrame Player API to provide video playback with custom section looping functionality. Key features include:
- Visual timeline with draggable start/end markers for loop selection
- Real-time progress tracking and loop control
- No backend required - runs entirely in the browser
- No API keys or authentication needed

## Key Implementation Details

The YouTube player integration requires careful handling:
- Player must be properly initialized before calling methods like `loadVideoById`
- The app automatically handles player recreation to avoid state issues
- CORS restrictions require serving from a web server (not file://)
- Some YouTube videos block embedding due to owner restrictions

The looping mechanism uses JavaScript timers with the YouTube API's seek functionality to create seamless section repeats, though there may be brief pauses during loop transitions due to API limitations.