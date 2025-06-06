# SongSnips

![SongSnips App Interface](/public/images/og-image.png)

A modern web application for looping sections of YouTube videos, perfect for music practice, language learning, and skill development. Built with Next.js and featuring a sleek, intuitive interface.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Then visit: http://localhost:3737/

## Features

- 🎬 **YouTube Integration**: Stream any public YouTube video directly in the app
- 🔁 **Smart Looping**: Create precise loops with visual timeline markers
- ⏱️ **Flexible Time Selection**:
  - Drag orange markers on the timeline
  - Click timeline to set loop points
  - Fine-tune with time input fields
- 🎚️ **Playback Controls**:
  - Speed adjustment (0.25x to 2x)
  - Play/pause with spacebar
  - Skip forward/backward
- 💾 **Save Your Loops**: Store and recall your favorite practice sections
- 📊 **Loop Counter**: Track your practice repetitions
- 🎨 **Modern UI**: Clean, responsive design with light/dark theme support
- ⌨️ **Keyboard Shortcuts**: Efficient workflow with hotkeys
- 🔗 **Share Loops**: Send loop URLs to friends or students

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Modern Web Browser** (Chrome, Firefox, Safari, or Edge)
- **Internet Connection** for YouTube streaming

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/songsnips.git
   cd songsnips
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to http://localhost:3000

## Building for Production

```bash
# Build the application
npm run build

# Export static files
npm run export

# The production-ready files will be in the 'out' directory
```

## How to Use

### Basic Usage

1. **Load a Video**: 
   - Paste a YouTube URL in the input field
   - Click "Load" or press Enter
   - The video will appear with playback controls

2. **Create a Loop**:
   - **Method 1**: Click on the timeline where you want the loop to start and end
   - **Method 2**: Drag the orange markers to set precise loop points
   - **Method 3**: Use the time input fields below the timeline

3. **Control Playback**:
   - Use the play/pause button or press spacebar
   - Adjust playback speed with the speed control
   - Skip forward/backward with arrow keys

4. **Save Your Loops**:
   - Click "Save Loop" to store the current loop
   - Access saved loops from the "Saved Loops" section
   - Each loop saves the video ID and timestamps

### Keyboard Shortcuts

- **Space**: Play/Pause
- **←/→**: Skip backward/forward 5 seconds
- **↑/↓**: Increase/decrease playback speed
- **R**: Reset loop to beginning
- **L**: Toggle loop on/off
- **S**: Save current loop

### Advanced Features

- **Share Loops**: Click "Share" to generate a URL with your loop timestamps
- **Loop Counter**: Track how many times you've repeated a section
- **Quick Loop Buttons**: Set common loop durations (30s, 1min, 2min)
- **Theme Toggle**: Switch between light and dark modes

## Supported YouTube URL Formats

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://m.youtube.com/watch?v=VIDEO_ID`
- Just the video ID: `VIDEO_ID`

## Tips for Best Experience

### ✅ Ideal Use Cases

- **Music Practice**: Loop difficult passages, solos, or rhythm sections
- **Language Learning**: Repeat phrases for pronunciation practice
- **Dance Tutorials**: Master choreography one section at a time
- **Educational Content**: Review key concepts from lectures
- **Gaming**: Study speedrun techniques or combo moves

### ⚠️ Embedding Limitations

Some videos may not work due to YouTube's embedding restrictions:
- Videos marked "Watch on YouTube"
- Content with certain copyright protections
- Region-restricted videos
- Age-restricted content

## Troubleshooting

### Common Issues

**Video won't load**
- Check if the video allows embedding (some videos are restricted)
- Ensure you have a stable internet connection
- Try refreshing the page
- Check browser console for specific error messages

**Loop markers not working**
- Make sure a video is loaded first
- Click directly on the orange markers to drag them
- Try clicking on the timeline to set positions

**Playback issues**
- Clear browser cache and cookies
- Try a different browser
- Disable browser extensions that might interfere
- Check if the video plays normally on YouTube

### Browser Console

For debugging, open the browser console (F12) and check for error messages. The app provides detailed logging to help identify issues.

## Project Structure

```
SongSnips/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout with metadata
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── SongSnips.tsx     # Main player component
│   ├── YouTubePlayer.tsx # YouTube iframe wrapper
│   ├── Timeline.tsx      # Visual timeline control
│   ├── SavedLoops.tsx    # Loop management
│   └── ...               # Other UI components
├── hooks/                # Custom React hooks
│   ├── useYouTubePlayer.ts
│   └── useLoopMemory.ts
└── public/              # Static assets

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Microsoft Edge
- ✅ Mobile browsers (with touch support)

## Privacy & Security

- **No account required**: Use immediately without sign-up
- **Client-side only**: All processing happens in your browser
- **No data collection**: We don't track or store your usage
- **Local storage**: Saved loops are stored only in your browser
- **YouTube compliance**: Respects all YouTube embedding policies

## Development

### Tech Stack

- **Next.js 13+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **YouTube IFrame API** - Video playback
- **React Hooks** - State management

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for musicians, language learners, and anyone who benefits from repetitive practice
- Inspired by the need for a simple, effective loop tool
- Thanks to the YouTube IFrame API for making this possible

---

**SongSnips** - Practice makes perfect, one loop at a time 🎵
