import './securePlayer.css';

// Utility to extract YouTube Video ID from any format (short link, full watch, embed, live, or shorts)
export function extractYouTubeId(urlOrId) {
  if (!urlOrId) return 'wdaBwIv7Jso';
  const clean = urlOrId.trim();
  if (clean.length === 11 && !clean.includes('/') && !clean.includes('.') && !clean.includes('?')) {
    return clean;
  }
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|live\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = clean.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }
  const idMatch = clean.match(/([a-zA-Z0-9_-]{11})/);
  return idMatch ? idMatch[1] : clean;
}

// Format seconds into MM:SS or HH:MM:SS
export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Singleton YouTube Iframe API Loader
let ytApiPromise = null;
function loadYouTubeIframeApi() {
  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    const existingScript = document.getElementById('yt-iframe-api-script');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0] || document.head;
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousReady === 'function') previousReady();
      resolve(window.YT);
    };
  });

  return ytApiPromise;
}

export class SecureVideoPlayer {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.videoId = extractYouTubeId(options.videoId || 'wdaBwIv7Jso');
    this.title = options.title || 'Parts of Speech: English Grammar Masterclass';
    this.studentPhone = options.studentPhone || '+91 98123 45678';
    this.studentId = options.studentId || 'BEC-9842';
    this.isLive = options.isLive || false;

    this.player = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0; // Fetched dynamically from YouTube
    this.playbackRate = 1.0;
    this.currentQuality = 'Auto (720p)';
    this.controlsVisible = true;
    this.hideTimeout = null;
    this.watermarkTimer = null;
    this.syncInterval = null;
    this.uniqueId = 'yt-player-' + Math.random().toString(36).substring(2, 9);

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="secure-player-container" id="secure-player-box">
        <!-- 1. Embedded YouTube Iframe with Edge-Bleed to crop off YouTube watermark/logo -->
        <div class="secure-iframe-holder">
          <div id="${this.uniqueId}" class="yt-actual-player"></div>
        </div>

        <!-- 2. Anti-Piracy Floating Watermark (Student Mobile + ID) -->
        <div class="secure-player-watermark" id="player-watermark">
          ${this.studentPhone} • ${this.studentId}
        </div>

        <!-- 3. FULL-SCREEN TAP-TO-PLAY/PAUSE AREA (Everywhere except timeline & bottom controls) -->
        <div class="secure-tap-play-area" id="tap-play-area" title="Tap anywhere to Play / Pause">
          <!-- Top Bar: Lecture Title (NO SHARE BUTTON, NO YOUTUBE LINK) -->
          <div class="secure-top-bar">
            <div class="secure-lecture-title">${this.title}</div>
            ${this.isLive ? `
              <div class="secure-live-badge">
                <span style="width:5px;height:5px;border-radius:50%;background:#fff;"></span>
                <span>LIVE CLASS</span>
              </div>
            ` : ''}
          </div>

          <!-- Center Pulse Play/Pause Indicator -->
          <div class="secure-center-pulse-wrapper" id="center-pulse-wrapper">
            <div class="secure-center-play-btn" id="center-play-btn">
              <svg id="center-play-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- 4. BOTTOM BAR: Scrubber Timeline Bar + Dedicated Buttons Row -->
        <div class="secure-bottom-bar" id="secure-bottom-bar">
          <!-- Scrubber Timer Bar (Isolated from Tap-to-Play so seeking is seamless) -->
          <div class="secure-progress-row">
            <span class="secure-time-display" id="time-current">00:00</span>
            <div class="secure-progress-track" id="progress-track" title="Seek video position">
              <div class="secure-progress-buffered" id="progress-buffered"></div>
              <div class="secure-progress-filled" id="progress-filled">
                <div class="secure-progress-thumb"></div>
              </div>
            </div>
            <span class="secure-time-display" id="time-duration">--:--</span>
          </div>

          <!-- Buttons Row: Play/Pause, Rewind, Forward, Speed, Quality, Fullscreen -->
          <div class="secure-actions-row">
            <div class="secure-actions-left">
              <!-- Play/Pause Button -->
              <button class="secure-ctrl-btn" id="btn-play-pause" title="Play/Pause">
                <svg id="play-pause-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>

              <!-- Rewind 10s -->
              <button class="secure-ctrl-btn" id="btn-rewind" title="Rewind 10 seconds">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.2 3.16-1.95 5.12-1.95 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
                </svg>
              </button>

              <!-- Forward 10s -->
              <button class="secure-ctrl-btn" id="btn-forward" title="Forward 10 seconds">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 8c-4.65 0-8.58 3.03-9.96 7.15l2.37.78C3.45 12.74 6.46 10.43 10 10.43c1.96 0 3.73.75 5.12 1.95L11.5 16H20.5V7L16.9 10.6C15.05 8.99 12.65 8 10 8z"/>
                </svg>
              </button>
            </div>

            <!-- Right Controls: Speed, Quality, Fullscreen -->
            <div class="secure-actions-right">
              <!-- Playback Speed -->
              <div style="position:relative;">
                <button class="secure-text-btn" id="btn-speed" title="Playback Speed">
                  <span id="speed-label">1.0x</span>
                </button>
                <div class="secure-menu-popover" id="speed-popover" style="display:none;">
                  <button class="secure-menu-item" data-speed="0.5">0.5x</button>
                  <button class="secure-menu-item" data-speed="0.75">0.75x</button>
                  <button class="secure-menu-item active" data-speed="1.0">1.0x (Normal)</button>
                  <button class="secure-menu-item" data-speed="1.25">1.25x</button>
                  <button class="secure-menu-item" data-speed="1.5">1.5x</button>
                  <button class="secure-menu-item" data-speed="2.0">2.0x</button>
                </div>
              </div>

              <!-- Video Quality -->
              <div style="position:relative;">
                <button class="secure-text-btn" id="btn-quality" title="Video Quality">
                  <span id="quality-label">Quality</span>
                </button>
                <div class="secure-menu-popover" id="quality-popover" style="display:none;">
                  <button class="secure-menu-item active" data-quality="Auto (720p)">Auto (720p)</button>
                  <button class="secure-menu-item" data-quality="1080p HD">1080p HD</button>
                  <button class="secure-menu-item" data-quality="720p HD">720p HD</button>
                  <button class="secure-menu-item" data-quality="480p">480p SD</button>
                  <button class="secure-menu-item" data-quality="360p Data Saver">360p Data Saver</button>
                </div>
              </div>

              <!-- Fullscreen -->
              <button class="secure-ctrl-btn" id="btn-fullscreen" title="Toggle Fullscreen">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 5. CUSTOM END-SCREEN SHIELD (Blocks YouTube's related video recommendations completely) -->
        <div class="secure-endscreen-card" id="endscreen-card" style="display:none;">
          <div class="endscreen-badge">🎉 LECTURE COMPLETED</div>
          <div class="endscreen-title">${this.title}</div>
          <p class="endscreen-desc">Great job finishing this session! Revise key points or replay anytime.</p>
          <div class="endscreen-btns">
            <button class="endscreen-btn-replay" id="btn-replay-lecture">↺ Replay Lecture</button>
          </div>
        </div>
      </div>
    `;

    this.initYouTubePlayer();
    this.initEvents();
    this.startWatermarkAnimation();
  }

  // Initializes YouTube Iframe API to fetch exact video duration and control playback
  initYouTubePlayer() {
    loadYouTubeIframeApi().then((YT) => {
      this.player = new YT.Player(this.uniqueId, {
        videoId: this.videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          playsinline: 1,
          cc_load_policy: 0,
          cc_lang_pref: 'none',
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            this.onPlayerReady(event);
          },
          onStateChange: (event) => {
            this.onPlayerStateChange(event);
          }
        }
      });
    }).catch((err) => {
      console.warn('Failed to load YouTube API, falling back to iframe embed', err);
    });
  }

  // Completely turns off and unloads captions/subtitles across every video
  disableCaptions() {
    if (!this.player) return;
    try {
      if (typeof this.player.unloadModule === 'function') {
        this.player.unloadModule('captions');
        this.player.unloadModule('cc');
      }
      if (typeof this.player.setOption === 'function') {
        this.player.setOption('captions', 'track', {});
        this.player.setOption('cc', 'track', {});
        this.player.setOption('captions', 'fontSize', 0);
      }
    } catch (e) {}
  }

  onPlayerReady(event) {
    if (!this.player) return;

    // Turn off captions immediately on ready
    this.disableCaptions();

    // Fetch exact duration directly from YouTube video
    const realDuration = this.player.getDuration();
    if (realDuration && realDuration > 0) {
      this.duration = realDuration;
      const durElem = document.getElementById('time-duration');
      if (durElem) durElem.textContent = formatTime(this.duration);
    }
  }

  onPlayerStateChange(event) {
    const YTState = window.YT ? window.YT.PlayerState : { PLAYING: 1, PAUSED: 2, ENDED: 0, BUFFERING: 3 };

    if (event.data === YTState.PLAYING) {
      this.isPlaying = true;
      // Ensure captions remain completely turned off on playback start
      this.disableCaptions();

      // Fetch duration in case it wasn't ready earlier
      const realDuration = this.player.getDuration();
      if (realDuration && realDuration > 0) {
        this.duration = realDuration;
      }
      this.updatePlayStateUI(true);
      this.startNativeSync();
      this.hideEndScreen();
    } else if (event.data === YTState.PAUSED) {
      this.isPlaying = false;
      this.updatePlayStateUI(false);
      this.stopNativeSync();
    } else if (event.data === YTState.ENDED) {
      // YouTube Video Finished: Trigger End Screen to block YouTube recommendations
      this.handleVideoEnded();
    }
  }

  // Intercepts the end of video so YouTube's recommended videos NEVER appear
  handleVideoEnded() {
    this.isPlaying = false;
    this.stopNativeSync();
    this.updatePlayStateUI(false);

    // Pause player and reset to 0 so YouTube doesn't show related video grid
    if (this.player && typeof this.player.pauseVideo === 'function') {
      this.player.pauseVideo();
      this.player.seekTo(0, true);
    }

    const endScreen = document.getElementById('endscreen-card');
    if (endScreen) {
      endScreen.style.display = 'flex';
    }
  }

  hideEndScreen() {
    const endScreen = document.getElementById('endscreen-card');
    if (endScreen) {
      endScreen.style.display = 'none';
    }
  }

  // High-frequency native clock synchronizer (Moves timeline scrubber synchronously with video)
  startNativeSync() {
    if (this.syncInterval) clearInterval(this.syncInterval);

    this.syncInterval = setInterval(() => {
      if (!this.player || typeof this.player.getCurrentTime !== 'function') return;

      const current = this.player.getCurrentTime();
      const dur = this.player.getDuration() || this.duration;

      if (dur > 0) {
        this.duration = dur;
        this.currentTime = current;

        // Check if video is about to finish (within 0.3s) to prevent YouTube end-screen from flashing
        if (current >= dur - 0.4 && dur > 5) {
          this.handleVideoEnded();
          return;
        }

        // Update UI
        const curElem = document.getElementById('time-current');
        const durElem = document.getElementById('time-duration');
        const filled = document.getElementById('progress-filled');
        const buffered = document.getElementById('progress-buffered');

        if (curElem) curElem.textContent = formatTime(current);
        if (durElem) durElem.textContent = formatTime(dur);

        const pct = Math.min(100, (current / dur) * 100);
        if (filled) filled.style.width = `${pct}%`;

        // Update buffered fraction if available
        if (typeof this.player.getVideoLoadedFraction === 'function' && buffered) {
          const loaded = this.player.getVideoLoadedFraction();
          buffered.style.width = `${loaded * 100}%`;
        }
      }
    }, 200);
  }

  stopNativeSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  initEvents() {
    const tapPlayArea = document.getElementById('tap-play-area');
    const playPauseBtn = document.getElementById('btn-play-pause');
    const rewindBtn = document.getElementById('btn-rewind');
    const forwardBtn = document.getElementById('btn-forward');
    const progressTrack = document.getElementById('progress-track');
    const speedBtn = document.getElementById('btn-speed');
    const speedPopover = document.getElementById('speed-popover');
    const qualityBtn = document.getElementById('btn-quality');
    const qualityPopover = document.getElementById('quality-popover');
    const fullscreenBtn = document.getElementById('btn-fullscreen');
    const replayBtn = document.getElementById('btn-replay-lecture');

    // ISSUE 1 RESOLVED: Tapping ANYWHERE on the video (top/middle screen) toggles Play/Pause!
    if (tapPlayArea) {
      tapPlayArea.addEventListener('click', (e) => {
        // Prevent toggle if clicking on speed/quality menus
        if (e.target.closest('.secure-top-bar')) return;
        this.togglePlayPause(true);
      });
    }

    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePlayPause(false);
      });
    }

    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        this.hideEndScreen();
        if (this.player && typeof this.player.seekTo === 'function') {
          this.player.seekTo(0, true);
          this.player.playVideo();
        }
      });
    }

    // Rewind 10s
    if (rewindBtn) {
      rewindBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.player && typeof this.player.getCurrentTime === 'function') {
          const target = Math.max(0, this.player.getCurrentTime() - 10);
          this.player.seekTo(target, true);
        }
      });
    }

    // Forward 10s
    if (forwardBtn) {
      forwardBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.player && typeof this.player.getCurrentTime === 'function') {
          const dur = this.duration || 1800;
          const target = Math.min(dur, this.player.getCurrentTime() + 10);
          this.player.seekTo(target, true);
        }
      });
    }

    // Timeline Scrubber Click / Seek
    if (progressTrack) {
      progressTrack.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!this.player || !this.duration) return;
        const rect = progressTrack.getBoundingClientRect();
        const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const seekSeconds = clickRatio * this.duration;
        this.player.seekTo(seekSeconds, true);

        // Immediate visual update
        const filled = document.getElementById('progress-filled');
        if (filled) filled.style.width = `${clickRatio * 100}%`;
        const curElem = document.getElementById('time-current');
        if (curElem) curElem.textContent = formatTime(seekSeconds);
      });
    }

    // Speed Popover Toggle
    if (speedBtn && speedPopover) {
      speedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        speedPopover.style.display = speedPopover.style.display === 'none' ? 'flex' : 'none';
        if (qualityPopover) qualityPopover.style.display = 'none';
      });

      speedPopover.querySelectorAll('.secure-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const speed = parseFloat(item.getAttribute('data-speed'));
          this.playbackRate = speed;
          if (this.player && typeof this.player.setPlaybackRate === 'function') {
            this.player.setPlaybackRate(speed);
          }
          document.getElementById('speed-label').textContent = `${speed}x`;
          speedPopover.querySelectorAll('.secure-menu-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          speedPopover.style.display = 'none';
        });
      });
    }

    // Quality Popover Toggle
    if (qualityBtn && qualityPopover) {
      qualityBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        qualityPopover.style.display = qualityPopover.style.display === 'none' ? 'flex' : 'none';
        if (speedPopover) speedPopover.style.display = 'none';
      });

      qualityPopover.querySelectorAll('.secure-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const q = item.getAttribute('data-quality');
          this.currentQuality = q;
          document.getElementById('quality-label').textContent = q.split(' ')[0];
          qualityPopover.querySelectorAll('.secure-menu-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          qualityPopover.style.display = 'none';
        });
      });
    }

    // Fullscreen Toggle
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const playerBox = document.getElementById('secure-player-box');
        if (!document.fullscreenElement) {
          if (playerBox.requestFullscreen) playerBox.requestFullscreen();
        } else {
          if (document.exitFullscreen) document.exitFullscreen();
        }
      });
    }

    // Close menus when clicking outside
    document.addEventListener('click', () => {
      if (speedPopover) speedPopover.style.display = 'none';
      if (qualityPopover) qualityPopover.style.display = 'none';
    });
  }

  // Toggles play/pause and triggers micro-animation on center indicator
  togglePlayPause(animatePulse = false) {
    this.hideEndScreen();

    if (!this.player) {
      // Fallback postMessage
      this.isPlaying = !this.isPlaying;
      this.sendFallbackCommand(this.isPlaying ? 'playVideo' : 'pauseVideo');
      this.updatePlayStateUI(this.isPlaying);
      return;
    }

    if (this.isPlaying) {
      this.player.pauseVideo();
    } else {
      this.player.playVideo();
    }

    if (animatePulse) {
      const pulseWrapper = document.getElementById('center-pulse-wrapper');
      if (pulseWrapper) {
        pulseWrapper.classList.remove('pulse-anim');
        // Force reflow
        void pulseWrapper.offsetWidth;
        pulseWrapper.classList.add('pulse-anim');
      }
    }
  }

  sendFallbackCommand(func, args = []) {
    const iframe = document.querySelector(`#${this.uniqueId} iframe`) || document.getElementById('yt-player-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: func,
        args: args
      }), '*');
    }
  }

  updatePlayStateUI(playing) {
    const playPauseIcon = document.getElementById('play-pause-icon');
    const centerPlayIcon = document.getElementById('center-play-icon');
    const pulseWrapper = document.getElementById('center-pulse-wrapper');

    if (playing) {
      if (playPauseIcon) playPauseIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
      if (centerPlayIcon) centerPlayIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
      if (pulseWrapper) pulseWrapper.style.opacity = '0';
    } else {
      if (playPauseIcon) playPauseIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
      if (centerPlayIcon) centerPlayIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
      if (pulseWrapper) pulseWrapper.style.opacity = '1';
    }
  }

  // Moves the student anti-piracy watermark across the player every 5 seconds
  startWatermarkAnimation() {
    const watermark = document.getElementById('player-watermark');
    if (!watermark) return;

    const move = () => {
      const top = Math.floor(Math.random() * 65) + 12;
      const left = Math.floor(Math.random() * 55) + 10;
      watermark.style.top = `${top}%`;
      watermark.style.left = `${left}%`;
    };

    move();
    this.watermarkTimer = setInterval(move, 5000);
  }

  destroy() {
    this.stopNativeSync();
    if (this.watermarkTimer) clearInterval(this.watermarkTimer);
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    if (this.player && typeof this.player.destroy === 'function') {
      try {
        this.player.destroy();
      } catch (e) {}
    }
  }
}
