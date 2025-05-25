# YouTube Section Repeater

A web-based application that allows you to loop any section of a YouTube video. Perfect for practicing music, learning languages, studying tutorials, or mastering any skill that requires repetition. No login or API keys required!

## Local hosting

To start the app:

```bash
python3 -m http.server 8000
```

Then visit: http://localhost:8000/

The rest of the README below is not actually applicable to the current iteration of the application, as it needed to go through a

## Features

- 🎬 **YouTube Integration**: Stream any public YouTube video
- 🎯 **Visual Timeline with Draggable Markers**:
  - Green marker for start time
  - Red marker for end time
  - Live timestamps on each marker
  - Yellow playhead shows current position
- ⏱️ **Multiple Ways to Set Times**:
  - Drag markers on the timeline
  - Type times manually (MM:SS format)
  - Set to current playback position
  - Quick preset durations
- 🔁 **Auto-Repeat**: Loop your selected section endlessly
- 🎚️ **Speed Control**: Practice at 0.25x to 2x speed
- 📊 **Progress Tracking**: Visual progress bar with scrubbing
- 🎨 **Modern UI**: Clean, intuitive dark theme

## Prerequisites

- **Modern Web Browser** (Chrome, Firefox, Safari, or Edge)
- **Internet Connection** for YouTube streaming
- **Local Web Server** or file hosting (due to YouTube API requirements)

## Setup Instructions

### 1. Download the Files

Download all four files:

- `index.html`
- `styles.css`
- `script.js`
- `README.md`

### 2. Run the Application

YouTube's API requires the files to be served from a web server (not just opened as files). Here are several options:

#### Option A: Using Python's built-in server

```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

#### Option B: Using Node.js http-server

```bash
# Install http-server globally
npm install -g http-server

# Run the server
http-server -p 8080
```

#### Option C: Using Live Server (VS Code)

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

#### Option D: Using PHP

```bash
php -S localhost:8080
```

### 3. Access the Application

Open your browser and navigate to `http://localhost:8080`

## How to Use

### Basic Usage

1. **Load a Video**: Paste a YouTube link and click "Load Video"
2. **Set Section**:
   - Use the visual timeline to drag start/end markers
   - Or type times directly (format: `MM:SS` or `SS`)
   - Or use the "clock" buttons to set times to current playback position
3. **Play**: Click "Play Section" to start playback
4. **Repeat**: Toggle the repeat button to loop the section automatically
5. **Adjust Speed**: Use the speed selector to slow down or speed up playback

### Using the Visual Timeline

The timeline is the most intuitive way to select your section:

1. **Draggable Markers**:
   - 🟢 **Green marker** = Start time (drag left/right)
   - 🔴 **Red marker** = End time (drag left/right)
   - Each marker shows its timestamp above it

2. **Click to Position**:
   - Click anywhere on the timeline to move the nearest marker
   - The marker closest to your click will jump to that position

3. **Live Playhead**:
   - 🟡 **Yellow line** = Current playback position
   - Shows current time in the center below timeline

4. **Visual Feedback**:
   - Red shaded area shows your selected section
   - Timestamps update in real-time as you drag

## Supported YouTube URL Formats

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- Just the video ID: `VIDEO_ID`

## Example YouTube Links

### ✅ Embed-Friendly Videos (These should work)

- <https://www.youtube.com/watch?v=dQw4w9WgXcQ> (Rick Astley - Never Gonna Give You Up)
- <https://www.youtube.com/watch?v=jNQXAC9IVRw> (Me at the zoo - First YouTube video)
- <https://www.youtube.com/watch?v=9bZkp7q19f0> (PSY - Gangnam Style)
- <https://www.youtube.com/watch?v=kJQP7kiw5Fk> (Luis Fonsi - Despacito)

### ❌ Videos That Often Block Embedding

- Music videos from major labels (Universal, Sony, Warner)
- Official movie trailers from major studios
- Some educational content from institutions
- Videos with copyright claims
- Videos marked "Watch on YouTube"

### JavaScript Errors: "player.loadVideoById is not a function"

This error occurs when the YouTube player gets into a bad state. The app now automatically handles this by recreating the player.

If you still see this error:

1. **Manual Reset** (in browser console):

   ```javascript
   resetPlayer()  // Completely resets the player
   ```

2. **Check Player State**:

   ```javascript
   checkPlayerState()  // Shows current player status
   ```

3. **Full Page Refresh**:
   - Sometimes the simplest solution
   - Press Ctrl+F5 (or Cmd+Shift+R on Mac)

## Debugging Console Commands

Open your browser's Developer Console (F12) and use these commands:

```javascript
// Test with a known working video
testEmbedding()

// Test basic iframe embedding
simpleEmbedTest()

// Check current player state
checkPlayerState()

// Debug timeline dragging issues
debugTimeline()

// Toggle timeline on/off
toggleTimeline(true)  // Enable
toggleTimeline(false) // Disable

// Completely reset the player
resetPlayer()

// Enable debug logging
window.YT_DEBUG = true
```

### Troubleshooting the "loadVideoById is not a function" Error

This error has been fixed. The app now:

1. Always destroys and recreates the player for each new video
2. Uses the player object from the onReady event
3. Properly cleans up on errors

If you still see this error:

1. **Hard refresh**: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. **Clear cache**: Clear your browser cache and cookies
3. **Check console**: Run `checkPlayerState()` to see what's happening

### Testing Timeline Dragging

The timeline markers should be draggable once a video is loaded:

1. Load any video first
2. Drag the **green marker** to set start time
3. Drag the **red marker** to set end time
4. Click anywhere on timeline to move nearest marker

If markers aren't dragging:

- Check console for errors
- Make sure a video is loaded (you'll see "Please load a video first" if not)
- Try clicking directly on the colored circles

### Quick Diagnostic Test

If you're having issues, run this test:

1. Open the app in your browser
2. Open Developer Console (F12)
3. Run these tests in order:

```javascript
// 1. Check if basic embedding works
simpleEmbedTest()
// You should see a popup with a working YouTube video

// 2. Test the player system
testEmbedding()
// This loads a test video automatically

// 3. Check player state
checkPlayerState()
// Shows detailed info about the player

// 4. Debug timeline issues
debugTimeline()
// Shows timeline state and positions

// 5. If nothing works, reset everything
resetPlayer()
```

### Common Issues and Solutions

**Issue**: Every video shows "Player exists but loadVideoById not available"
**Solution**: Fixed in latest version - the player now recreates itself each time

**Issue**: Can't drag timeline markers
**Solution**:

- Make sure a video is loaded first
- The markers are the colored circles (green for start, red for end)
- Click and drag on the circles, not the lines

**Issue**: Permission policy violations in console
**Solution**: These are just warnings, not errors. They don't affect functionality.

**About the video you mentioned** (`https://www.youtube.com/watch?v=us7Dogka6mU`):
Without being able to test it directly, it's likely that this video also has embedding disabled. Music videos, especially from artists signed to major labels, frequently block embedding.

## Use Cases

- 🎵 **Musicians**: Practice difficult passages, learn solos, master rhythm sections
- 🗣️ **Language Learners**: Repeat phrases, practice pronunciation, study dialogues
- 💃 **Dancers**: Loop choreography sections, practice specific moves
- 🎓 **Students**: Review lecture segments, practice presentations
- 🎮 **Gamers**: Study speedrun techniques, learn combos
- 👨‍🍳 **Cooking**: Repeat recipe steps, master techniques
- 🏋️ **Fitness**: Follow exercise demonstrations at your pace

## Troubleshooting

### "This video cannot be embedded" (Error 150)

Some video owners disable embedding. Solutions:

1. **Try the sample videos** provided in the app (they're embed-friendly)
2. **Use the alternative method**: Open the video in YouTube and use our timer as a guide
3. **Find another version** of the same content that allows embedding
4. **Check the video on YouTube** - if it says "Watch on YouTube" only, it can't be embedded

### All Videos Seem Blocked?

If EVERY video gives Error 150, even the samples:

1. **Check your setup**:

   ```bash
   # Make sure you're using http:// not file://
   # Bad:  file:///Users/name/youtube-repeater/index.html
   # Good: http://localhost:8080
   ```

2. **Test embedding manually**:
   - Open browser console (F12)
   - Type: `testEmbedding()`
   - This will test with a known working video

3. **Check for blockers**:
   - Disable ad blockers/privacy extensions
   - Try incognito/private mode
   - Check if your network blocks YouTube embeds

4. **Debug mode**:
   - Add `?debug=true` to your URL
   - Example: `http://localhost:8080?debug=true`
   - Check console for detailed logs

### "Invalid YouTube link format"

- Ensure you're using a standard YouTube URL
- Try copying the link directly from YouTube's address bar

### Video won't load

- Check your internet connection
- Ensure the video is not private or age-restricted
- Try a different browser
- Try one of the sample videos first

### Playback issues

- Refresh the page
- Check if the video plays normally on YouTube
- Disable browser extensions that might interfere

### "YouTube player is still loading"

- Wait a moment and try again
- Ensure JavaScript is enabled in your browser

### Permission Policy Warnings in Console

You might see warnings about "autoplay", "encrypted-media", etc. These are **normal** and don't affect functionality. They're just YouTube's player requesting features it can't use in an iframe.

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Microsoft Edge
- ⚠️ Mobile browsers may have limited functionality

## Privacy & Security

- No login required
- No data is stored or transmitted to any server
- All processing happens in your browser
- YouTube's standard terms apply for video content

## Known Limitations

- **Embed Restrictions**: Some videos block embedding (this is a YouTube policy, not a bug)
- **Frontend-Only**: Unlike server-based apps (NotePGT, etc.) that can bypass restrictions, this runs entirely in your browser
- Mobile browsers may have autoplay restrictions
- Very long videos might have performance impacts

### Why Some Apps Can Access Restricted Videos

Apps like NotePGT use server-side APIs that:

- Download/process videos on their servers
- Use YouTube's Data API (requires API keys)
- May violate YouTube's Terms of Service

Our app is 100% legal and respects YouTube's embedding policies.

## Future Enhancements

- Lyrics display integration
- Bookmark multiple sections
- Export/import section presets
- Waveform visualization
- Loop counter
- Keyboard shortcuts
- A-B repeat with multiple sections
- Link to lyrics in VocalTechniqueTranslator

## Technical Notes

This application uses:

- YouTube IFrame API for video playback
- Vanilla JavaScript (no frameworks required)
- CSS3 for styling and animations
- HTML5 for structure

## License

This project is for educational purposes. Respect YouTube's Terms of Service and copyright laws when using this tool.

---

Built with ❤️ for singers and music learners
