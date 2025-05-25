# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Running the application
```bash
python3 -m http.server 8000
```
Then visit: http://localhost:8000/

Note: The application requires being served over HTTP/HTTPS (not file://) due to YouTube API requirements.

## Architecture

This is a single-page web application for looping sections of YouTube videos, designed for music practice. The application consists of:

- **index.html**: Self-contained application with embedded CSS and JavaScript using YouTube IFrame API
- **index_old.html, script_old.js, styles_old.css**: Previous version of the application (preserved for reference)
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