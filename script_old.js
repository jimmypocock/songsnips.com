/**
 * YouTube Section Repeater
 * A web application for looping specific sections of YouTube videos
 */

// Global variables
let player = null;
let isPlayerReady = false;
let currentVideoId = null;
let videoDuration = 0;
let isPlaying = false;
let isRepeating = false;
let sectionStartTime = 0;
let sectionEndTime = 30;
let playbackInterval = null;
let isDraggingProgress = false;
let isDraggingTimeline = false;
let dragTarget = null;
let waitingForPlayer = false;

// DOM Elements
const youtubeInput = document.getElementById('youtube-link');
const loadVideoButton = document.getElementById('load-video');
const playerContainer = document.getElementById('player-container');
const videoInfo = document.getElementById('video-info');
const videoTitle = document.getElementById('video-title');
const videoDurationDisplay = document.getElementById('video-duration');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');
const timeRange = document.getElementById('time-range');
const sectionDurationDisplay = document.getElementById('section-duration');
const playButton = document.getElementById('play-section');
const stopButton = document.getElementById('stop-playback');
const repeatButton = document.getElementById('toggle-repeat');
const repeatStatus = document.getElementById('repeat-status');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');
const progressHandle = document.getElementById('progress-handle');
const currentTimeDisplay = document.getElementById('current-time');
const totalTimeDisplay = document.getElementById('total-time');
const statusMessage = document.getElementById('status-message');
const playbackSpeedSelect = document.getElementById('playback-speed');
const setStartCurrentButton = document.getElementById('set-start-current');
const setEndCurrentButton = document.getElementById('set-end-current');
const timeline = document.querySelector('.timeline');
const timelineSelection = document.getElementById('timeline-selection');
const startMarkerContainer = document.getElementById('start-marker-container');
const endMarkerContainer = document.getElementById('end-marker-container');
const startMarkerTime = document.getElementById('start-marker-time');
const endMarkerTime = document.getElementById('end-marker-time');
const timelineStart = document.getElementById('timeline-start');
const timelineEnd = document.getElementById('timeline-end');
const timelineCurrent = document.getElementById('timeline-current');
const timelinePlayhead = document.getElementById('timeline-playhead');

// Initialize YouTube IFrame API
window.onYouTubeIframeAPIReady = function() {
    console.log('YouTube IFrame API ready');
    console.log('Debugging functions available: testEmbedding(), checkPlayerState(), resetPlayer()');
    isPlayerReady = true;
};

// Load YouTube IFrame API
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Initialize the application
window.onload = () => {
    setupEventListeners();
    updateTimeDisplay();

    // Initialize timeline markers to default positions
    startMarkerContainer.style.left = '0%';
    endMarkerContainer.style.left = '30%'; // Default 30 seconds out of 100
    startMarkerTime.textContent = '0:00';
    endMarkerTime.textContent = '0:30';
    timelineSelection.style.left = '0%';
    timelineSelection.style.width = '30%';

    // Debug mode - add to URL: ?debug=true
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true') {
        console.log('Debug mode enabled');
        window.YT_DEBUG = true;
    }
};

// Setup event listeners
function setupEventListeners() {
    // Video loading
    loadVideoButton.addEventListener('click', loadVideo);
    youtubeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loadVideo();
    });

    // Sample videos
    document.querySelectorAll('.btn-sample').forEach(button => {
        button.addEventListener('click', () => {
            const videoId = button.dataset.video;
            youtubeInput.value = `https://www.youtube.com/watch?v=${videoId}`;
            loadVideo();
        });
    });

    // Playback controls
    playButton.addEventListener('click', togglePlayback);
    stopButton.addEventListener('click', stopPlayback);
    repeatButton.addEventListener('click', toggleRepeat);
    playbackSpeedSelect.addEventListener('change', updatePlaybackSpeed);

    // Time inputs
    startTimeInput.addEventListener('input', handleTimeInput);
    endTimeInput.addEventListener('input', handleTimeInput);
    setStartCurrentButton.addEventListener('click', setStartToCurrent);
    setEndCurrentButton.addEventListener('click', setEndToCurrent);

    // Progress bar
    progressBar.addEventListener('mousedown', startProgressDrag);

    // Timeline - add both mouse and pointer events
    timeline.addEventListener('mousedown', handleTimelineMouseDown);
    timeline.addEventListener('pointerdown', handleTimelineMouseDown);

    // Document-level mouse events
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('pointermove', handleMouseMove);
    document.addEventListener('pointerup', handleMouseUp);

    // Prevent text selection while dragging
    document.addEventListener('selectstart', (e) => {
        if (isDraggingTimeline || isDraggingProgress) {
            e.preventDefault();
        }
    });

    // Preset buttons
    document.querySelectorAll('.btn-preset').forEach(button => {
        button.addEventListener('click', () => {
            const duration = parseInt(button.dataset.duration);
            const currentStart = parseTimeToSeconds(startTimeInput.value) || 0;
            sectionEndTime = currentStart + duration;
            endTimeInput.value = formatTime(sectionEndTime);
            updateTimeDisplay();
            updateTimeline();
        });
    });
}

// Extract video ID from YouTube URL
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Reset player state
function resetPlayerState() {
    // Stop any ongoing playback monitoring
    if (playbackInterval) {
        clearInterval(playbackInterval);
        playbackInterval = null;
    }

    // Reset UI elements
    progressFill.style.width = '0%';
    progressHandle.style.left = '0%';
    currentTimeDisplay.textContent = '0:00';
    timelinePlayhead.classList.remove('active');
    timelineCurrent.classList.remove('active');

    // Reset playback state
    isPlaying = false;
    updatePlayButton(false);

    // Clear video info
    videoDuration = 0;
    currentVideoId = null;
}

// Load video from YouTube link
function loadVideo() {
    const url = youtubeInput.value.trim();
    if (!url) {
        showStatus('Please enter a YouTube video link', 'warning');
        return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
        showStatus('Invalid YouTube link format', 'error');
        return;
    }

    if (!isPlayerReady) {
        showStatus('YouTube player is still loading. Please try again.', 'warning');
        return;
    }

    // Clear any previous alternative method display
    const altContainer = document.querySelector('.alternative-container');
    if (altContainer) {
        altContainer.remove();
    }

    currentVideoId = videoId;

    // Always destroy existing player and create new one
    if (player) {
        try {
            if (typeof player.destroy === 'function') {
                player.destroy();
            }
        } catch (e) {
            console.error('Error destroying player:', e);
        }
        player = null;
    }

    // Clear the container and recreate the div
    playerContainer.innerHTML = '<div id="youtube-player"></div>';

    // Create new player
    console.log('Creating new player for video:', videoId);
    player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'playsinline': 1,
            'controls': 1,
            'rel': 0,
            'enablejsapi': 1,
            'origin': window.location.origin
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });

    playerContainer.style.display = 'block';
    showStatus('Loading video...', 'info');
    waitingForPlayer = true;
}

// Create YouTube player
function createPlayer(videoId) {
    // Ensure container exists
    let playerElement = document.getElementById('youtube-player');
    if (!playerElement) {
        playerElement = document.createElement('div');
        playerElement.id = 'youtube-player';
        playerContainer.appendChild(playerElement);
    }

    player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'playsinline': 1,
            'controls': 1,
            'modestbranding': 1,
            'rel': 0,
            'origin': window.location.origin,
            'widget_referrer': window.location.origin,
            'enablejsapi': 1,
            'autoplay': 0,
            'fs': 1,
            'disablekb': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

// Player event handlers
function onPlayerReady(event) {
    console.log('Player ready event fired');
    waitingForPlayer = false;

    // The player object from the event is the actual YouTube player
    const ytPlayer = event.target;

    // Ensure we're using the right player reference
    player = ytPlayer;

    console.log('Player ready for video:', currentVideoId);
    console.log('Player methods available:', typeof player.loadVideoById, typeof player.getVideoData);

    // Get video info
    videoDuration = player.getDuration();
    const videoData = player.getVideoData();
    const title = videoData.title;

    if (window.YT_DEBUG) {
        console.log('Video data:', videoData);
        console.log('Duration:', videoDuration);
        console.log('Player state:', player.getPlayerState());
    }

    // Update UI
    videoTitle.textContent = title || 'Untitled Video';
    videoDurationDisplay.textContent = `Duration: ${formatTime(videoDuration)}`;
    videoInfo.style.display = 'block';

    // Enable controls
    enableControls();

    // Update time inputs
    startTimeInput.value = '0:00';
    endTimeInput.value = formatTime(Math.min(30, videoDuration));
    updateTimeDisplay();
    updateTimeline();

    // Update timeline end label
    timelineEnd.textContent = formatTime(videoDuration);

    showStatus('Video loaded successfully!', 'success');
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        startPlaybackMonitoring();
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
        if (playbackInterval) {
            clearInterval(playbackInterval);
            playbackInterval = null;
        }
    }
}

function onPlayerError(event) {
    console.error('Player error:', event.data);
    console.log('Failed video ID:', currentVideoId);

    // Reset player state on error
    resetPlayerState();

    let errorMessage = 'Error loading video. ';

    switch(event.data) {
        case 2:
            errorMessage += 'Invalid video ID. Please check the link.';
            break;
        case 5:
            errorMessage += 'HTML5 player error. Try a different browser.';
            break;
        case 100:
            errorMessage += 'Video not found. It may have been removed.';
            break;
        case 101:
        case 150:
            errorMessage += 'This video cannot be embedded. ';
            errorMessage += 'Common reasons: 1) Copyright restrictions, 2) Owner disabled embedding, 3) Regional restrictions. ';
            errorMessage += 'Try the sample videos or use the alternative method below.';

            // Log more details
            console.log('Error 150 - Embedding blocked for:', `https://www.youtube.com/watch?v=${currentVideoId}`);
            console.log('This is a YouTube restriction, not a bug in the app.');

            // Show alternative method
            showAlternativeMethod();
            break;
        default:
            errorMessage += 'Unknown error. Please try a different video.';
    }

    showStatus(errorMessage, 'error');

    // If player is in bad state, prepare for recreation on next load
    if (player && typeof player.destroy === 'function') {
        try {
            player.destroy();
        } catch (e) {
            console.error('Error destroying player:', e);
        }
    }
    player = null;
}

// Show alternative method for restricted videos
function showAlternativeMethod() {
    const alternativeHTML = `
        <div class="alternative-method">
            <h4>Alternative Method for Restricted Videos:</h4>
            <ol>
                <li>Open the video in a new YouTube tab</li>
                <li>Use our timer controls to set your loop times</li>
                <li>Manually seek to your start time in YouTube</li>
                <li>Use our visual timer to track your practice</li>
            </ol>
            <button onclick="openYouTubeInNewTab()" class="btn btn-secondary">
                Open Video in YouTube
            </button>
        </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = alternativeHTML;
    div.className = 'alternative-container';
    videoInfo.appendChild(div);
}

// Open YouTube video in new tab
function openYouTubeInNewTab() {
    if (currentVideoId) {
        window.open(`https://www.youtube.com/watch?v=${currentVideoId}`, '_blank');
        showStatus('Video opened in new tab. Use the timer controls here to track your practice.', 'success');
    }
}

// Enable playback controls
function enableControls() {
    playButton.disabled = false;
    stopButton.disabled = false;
    repeatButton.disabled = false;
    playbackSpeedSelect.disabled = false;
    setStartCurrentButton.disabled = false;
    setEndCurrentButton.disabled = false;
}

// Parse time string (MM:SS or SS) to seconds
function parseTimeToSeconds(timeStr) {
    if (!timeStr) return 0;

    const parts = timeStr.split(':').map(p => parseFloat(p) || 0);
    if (parts.length === 1) {
        return parts[0];
    } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    return 0;
}

// Format seconds to MM:SS
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Handle time input changes
function handleTimeInput(event) {
    const input = event.target;
    const seconds = parseTimeToSeconds(input.value);

    if (input.id === 'start-time') {
        sectionStartTime = Math.max(0, Math.min(seconds, videoDuration));
        if (sectionStartTime >= sectionEndTime) {
            sectionEndTime = Math.min(sectionStartTime + 1, videoDuration);
            endTimeInput.value = formatTime(sectionEndTime);
        }
    } else {
        sectionEndTime = Math.max(sectionStartTime + 1, Math.min(seconds, videoDuration));
    }

    updateTimeDisplay();
    updateTimeline();
}

// Update time display
function updateTimeDisplay() {
    const duration = sectionEndTime - sectionStartTime;
    timeRange.textContent = `Section: ${formatTime(sectionStartTime)} - ${formatTime(sectionEndTime)}`;
    sectionDurationDisplay.textContent = `Duration: ${formatTime(duration)}`;
    totalTimeDisplay.textContent = formatTime(sectionEndTime);
}

// Update timeline visualization
function updateTimeline() {
    if (videoDuration === 0) {
        console.log('Cannot update timeline - no video duration');
        return;
    }

    const startPercent = (sectionStartTime / videoDuration) * 100;
    const endPercent = (sectionEndTime / videoDuration) * 100;
    const widthPercent = endPercent - startPercent;

    // Update selection area
    timelineSelection.style.left = `${startPercent}%`;
    timelineSelection.style.width = `${widthPercent}%`;

    // Update marker positions
    startMarkerContainer.style.left = `${startPercent}%`;
    endMarkerContainer.style.left = `${endPercent}%`;

    // Update marker timestamps
    startMarkerTime.textContent = formatTime(sectionStartTime);
    endMarkerTime.textContent = formatTime(sectionEndTime);

    if (window.YT_DEBUG) {
        console.log('Timeline updated:', {
            startPercent,
            endPercent,
            widthPercent,
            videoDuration
        });
    }
}

// Timeline interaction
function handleTimelineMouseDown(event) {
    // Check if we have a video loaded
    if (!player || videoDuration === 0) {
        showStatus('Please load a video first', 'warning');
        return;
    }

    event.preventDefault(); // Prevent text selection

    const rect = timeline.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const time = (percent / 100) * videoDuration;

    // Log for debugging
    if (window.YT_DEBUG) {
        console.log('Timeline click:', { x, percent, time, videoDuration });
    }

    // Check if clicking on markers
    const startRect = startMarkerContainer.getBoundingClientRect();
    const endRect = endMarkerContainer.getBoundingClientRect();

    const clickX = event.clientX;
    const startCenter = startRect.left + (startRect.width / 2);
    const endCenter = endRect.left + (endRect.width / 2);

    // Check if clicking near start marker
    if (Math.abs(clickX - startCenter) < 30) {
        isDraggingTimeline = true;
        dragTarget = 'start';
        document.body.style.cursor = 'ew-resize';
        document.body.classList.add('dragging');
        console.log('Started dragging start marker');
    }
    // Check if clicking near end marker
    else if (Math.abs(clickX - endCenter) < 30) {
        isDraggingTimeline = true;
        dragTarget = 'end';
        document.body.style.cursor = 'ew-resize';
        document.body.classList.add('dragging');
        console.log('Started dragging end marker');
    }
    // Clicking elsewhere on timeline
    else {
        // Move nearest marker
        const distToStart = Math.abs(time - sectionStartTime);
        const distToEnd = Math.abs(time - sectionEndTime);

        if (distToStart < distToEnd) {
            sectionStartTime = Math.max(0, Math.min(time, sectionEndTime - 1));
            startTimeInput.value = formatTime(sectionStartTime);
        } else {
            sectionEndTime = Math.max(sectionStartTime + 1, Math.min(time, videoDuration));
            endTimeInput.value = formatTime(sectionEndTime);
        }

        updateTimeDisplay();
        updateTimeline();
    }
}

function handleMouseMove(event) {
    if (!isDraggingTimeline || !dragTarget) return;

    event.preventDefault();

    const rect = timeline.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    const time = (percent / 100) * videoDuration;

    if (dragTarget === 'start') {
        sectionStartTime = Math.max(0, Math.min(time, sectionEndTime - 1));
        startTimeInput.value = formatTime(sectionStartTime);
    } else if (dragTarget === 'end') {
        sectionEndTime = Math.max(sectionStartTime + 1, Math.min(time, videoDuration));
        endTimeInput.value = formatTime(sectionEndTime);
    }

    updateTimeDisplay();
    updateTimeline();
}

function handleMouseUp(event) {
    if (isDraggingTimeline || isDraggingProgress) {
        event.preventDefault();
    }

    isDraggingTimeline = false;
    dragTarget = null;
    isDraggingProgress = false;
    document.body.style.cursor = 'default';
    document.body.classList.remove('dragging');
}

// Set time to current playback position
function setStartToCurrent() {
    if (!player) return;

    const currentTime = player.getCurrentTime();
    sectionStartTime = Math.min(currentTime, sectionEndTime - 1);
    startTimeInput.value = formatTime(sectionStartTime);
    updateTimeDisplay();
    updateTimeline();
    showStatus('Start time set to current position', 'success');
}

function setEndToCurrent() {
    if (!player) return;

    const currentTime = player.getCurrentTime();
    sectionEndTime = Math.max(currentTime, sectionStartTime + 1);
    endTimeInput.value = formatTime(sectionEndTime);
    updateTimeDisplay();
    updateTimeline();
    showStatus('End time set to current position', 'success');
}

// Toggle playback
function togglePlayback() {
    if (!player) return;

    const playerState = player.getPlayerState();

    if (playerState === YT.PlayerState.PLAYING) {
        player.pauseVideo();
        updatePlayButton(false);
    } else {
        playSection();
    }
}

// Play the selected section
function playSection() {
    if (!player) return;

    player.seekTo(sectionStartTime, true);
    player.playVideo();
    updatePlayButton(true);
    showStatus('Playing section...', 'success');
}

// Stop playback
function stopPlayback() {
    if (!player) return;

    player.pauseVideo();
    player.seekTo(sectionStartTime, true);
    updatePlayButton(false);
    progressFill.style.width = '0%';
    currentTimeDisplay.textContent = formatTime(sectionStartTime);

    // Hide timeline playhead
    timelinePlayhead.classList.remove('active');
    timelineCurrent.classList.remove('active');
}

// Update play button state
function updatePlayButton(playing) {
    isPlaying = playing;
    playButton.innerHTML = playing ? `
        <svg viewBox="0 0 24 24" class="control-icon">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
        Pause
    ` : `
        <svg viewBox="0 0 24 24" class="control-icon">
            <path d="M8 5v14l11-7z"/>
        </svg>
        Play Section
    `;
}

// Toggle repeat mode
function toggleRepeat() {
    isRepeating = !isRepeating;
    repeatButton.classList.toggle('active', isRepeating);
    repeatStatus.textContent = `Repeat: ${isRepeating ? 'ON' : 'OFF'}`;
    showStatus(`Repeat ${isRepeating ? 'enabled' : 'disabled'}`, 'success');
}

// Update playback speed
function updatePlaybackSpeed() {
    if (!player) return;

    const speed = parseFloat(playbackSpeedSelect.value);
    player.setPlaybackRate(speed);
    showStatus(`Playback speed: ${speed}x`, 'success');
}

// Start monitoring playback position
function startPlaybackMonitoring() {
    if (playbackInterval) {
        clearInterval(playbackInterval);
    }

    playbackInterval = setInterval(() => {
        if (!player) return;

        const currentTime = player.getCurrentTime();
        updateProgressBar(currentTime);

        // Check if we've reached the end of the section
        if (currentTime >= sectionEndTime) {
            if (isRepeating) {
                player.seekTo(sectionStartTime, true);
            } else {
                stopPlayback();
            }
        }
    }, 100);
}

// Update progress bar
function updateProgressBar(currentTime) {
    const sectionDuration = sectionEndTime - sectionStartTime;
    const sectionProgress = Math.max(0, currentTime - sectionStartTime);
    const progressPercentage = (sectionProgress / sectionDuration) * 100;

    progressFill.style.width = `${Math.max(0, Math.min(100, progressPercentage))}%`;
    progressHandle.style.left = `${Math.max(0, Math.min(100, progressPercentage))}%`;
    currentTimeDisplay.textContent = formatTime(currentTime);

    // Update timeline playhead
    if (videoDuration > 0) {
        const playheadPercent = (currentTime / videoDuration) * 100;
        timelinePlayhead.style.left = `${playheadPercent}%`;
        timelinePlayhead.classList.add('active');
        timelineCurrent.textContent = formatTime(currentTime);
        timelineCurrent.classList.add('active');
    }
}

// Progress bar interaction
function startProgressDrag(event) {
    if (!player) return;

    isDraggingProgress = true;
    updateProgressFromMouse(event);
}

function updateProgressFromMouse(event) {
    const rect = progressBar.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const percent = x / rect.width;
    const sectionDuration = sectionEndTime - sectionStartTime;
    const seekTime = sectionStartTime + (sectionDuration * percent);

    player.seekTo(seekTime, true);
}

// Show status message
function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type} show`;

    setTimeout(() => {
        statusMessage.classList.remove('show');
    }, 3000);
}

// Handle progress bar drag
document.addEventListener('mousemove', (event) => {
    if (isDraggingProgress) {
        updateProgressFromMouse(event);
    }
});

// Test if embedding is working properly
function testEmbedding() {
    console.log('=== Embedding Test ===');
    console.log('Current URL:', window.location.href);
    console.log('Protocol:', window.location.protocol);
    console.log('YouTube API Ready:', isPlayerReady);
    console.log('Player exists:', !!player);

    if (player) {
        console.log('Player type:', typeof player);
        console.log('Player constructor:', player.constructor.name);
        console.log('Available methods:', Object.getOwnPropertyNames(player).filter(prop => typeof player[prop] === 'function'));
    }

    // Test with a known working video
    const testVideoId = 'jNQXAC9IVRw';
    console.log(`Testing with known working video: ${testVideoId}`);
    youtubeInput.value = `https://www.youtube.com/watch?v=${testVideoId}`;
    loadVideo();
}

// Simple embed test
function simpleEmbedTest() {
    console.log('=== Simple Embed Test ===');
    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <iframe width="560" height="315"
            src="https://www.youtube.com/embed/jNQXAC9IVRw"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
        </iframe>
    `;
    testContainer.style.position = 'fixed';
    testContainer.style.top = '50%';
    testContainer.style.left = '50%';
    testContainer.style.transform = 'translate(-50%, -50%)';
    testContainer.style.zIndex = '9999';
    testContainer.style.background = 'white';
    testContainer.style.padding = '20px';
    testContainer.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close Test';
    closeBtn.onclick = () => document.body.removeChild(testContainer);
    testContainer.appendChild(closeBtn);

    document.body.appendChild(testContainer);
    console.log('If you see a video above, basic YouTube embedding works.');
}

// Check player state
function checkPlayerState() {
    if (!player) {
        console.log('No player instance');
        return;
    }

    console.log('=== Player State ===');
    console.log('Player exists:', !!player);
    console.log('Player type:', typeof player);

    // Try to get available properties
    try {
        console.log('Player properties:', Object.keys(player));
        console.log('Player methods:', Object.keys(player).filter(key => typeof player[key] === 'function'));
    } catch (e) {
        console.log('Cannot enumerate player properties:', e);
    }

    // Try common YouTube player methods
    const methods = ['getPlayerState', 'getCurrentTime', 'getDuration', 'getVideoData', 'loadVideoById', 'playVideo', 'pauseVideo'];
    methods.forEach(method => {
        console.log(`${method}:`, typeof player[method]);
    });

    if (player.getPlayerState) {
        try {
            const state = player.getPlayerState();
            const states = {
                '-1': 'unstarted',
                '0': 'ended',
                '1': 'playing',
                '2': 'paused',
                '3': 'buffering',
                '5': 'video cued'
            };
            console.log('Current state:', state, '=', states[state] || 'unknown');
        } catch (e) {
            console.log('Error getting player state:', e);
        }
    }
}

// Enable/disable timeline (for debugging)
function toggleTimeline(enabled) {
    const timeline = document.querySelector('.timeline');
    const markers = document.querySelectorAll('.marker-container');

    if (enabled) {
        timeline.style.pointerEvents = 'auto';
        markers.forEach(m => m.style.pointerEvents = 'auto');
        console.log('Timeline enabled');
    } else {
        timeline.style.pointerEvents = 'none';
        markers.forEach(m => m.style.pointerEvents = 'none');
        console.log('Timeline disabled');
    }
}

// Debug timeline state
function debugTimeline() {
    console.log('=== Timeline Debug ===');
    console.log('Video duration:', videoDuration);
    console.log('Section start:', sectionStartTime);
    console.log('Section end:', sectionEndTime);
    console.log('Is dragging:', isDraggingTimeline);
    console.log('Drag target:', dragTarget);

    const startRect = startMarkerContainer.getBoundingClientRect();
    const endRect = endMarkerContainer.getBoundingClientRect();
    console.log('Start marker position:', startRect);
    console.log('End marker position:', endRect);

    // Check computed styles
    const timelineStyles = window.getComputedStyle(timeline);
    console.log('Timeline pointer-events:', timelineStyles.pointerEvents);
    console.log('Timeline cursor:', timelineStyles.cursor);
}

// Add debugging functions to window
window.toggleTimeline = toggleTimeline;
window.debugTimeline = debugTimeline;