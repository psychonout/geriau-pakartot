console.log('[geriau-pakartot] ===== CONTENT SCRIPT LOADED =====');
console.log('[geriau-pakartot] Timestamp:', new Date().toISOString());

(function () {
    'use strict';

    console.log('[geriau-pakartot] Content script starting...');
    console.log('[geriau-pakartot] URL:', window.location.href);
    console.log('[geriau-pakartot] Document ready state:', document.readyState);

    // Track if player was manually paused via extension
    let manuallyPaused = false;

    function simulateTrustedClick(element) {
        if (!element.ownerDocument) {
            console.error('[geriau-pakartot] Element is detached from DOM');
            return;
        }

        const elementWindow = element.ownerDocument.defaultView;
        const events = ['mousedown', 'mouseup', 'click'];

        events.forEach(type => {
            const event = new elementWindow.MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                view: elementWindow
            });
            element.dispatchEvent(event);
            console.log(`[geriau-pakartot] Dispatched ${type} event`);
        });
    }

    function isLastTrackInPlaylist() {
        const currentTrack = $('.jp-playlist-current');
        if (!currentTrack.length) {
            console.log('[geriau-pakartot] No current track found');
            return false;
        }

        const allTracks = currentTrack.parent().children('li');
        const isLast = allTracks.last()[0] === currentTrack[0];
        console.log('[geriau-pakartot] Current track index:', currentTrack.index(), 'Total tracks:', allTracks.length, 'Is last:', isLast);
        return isLast;
    }

    function isFirstTrackInPlaylist() {
        const currentTrack = $('.jp-playlist-current');
        if (!currentTrack.length) {
            console.log('[geriau-pakartot] No current track found');
            return false;
        }

        const allTracks = currentTrack.parent().children('li');
        const isFirst = allTracks.first()[0] === currentTrack[0];
        console.log('[geriau-pakartot] Current track index:', currentTrack.index(), 'Total tracks:', allTracks.length, 'Is first:', isFirst);
        return isFirst;
    }

    function isShuffleOff() {
        // When shuffle is OFF, the visible element has class jp-shuffle
        // When shuffle is ON, the visible element has class jp-shuffle-off
        return $('.jp-shuffle').is(':visible');
    }

    function isRepeatOff() {
        // When repeat is OFF, the visible element has class jp-repeat
        // When repeat is ON, the visible element has class jp-repeat-off
        return $('.jp-repeat').is(':visible');
    }

    function isPlayerPlaying() {
        return $('.jp-pause').is(':visible');
    }

    function isPlayerPaused() {
        return $('.jp-play').is(':visible');
    }

    function getCurrentTrackInfo() {
        console.log('[geriau-pakartot] Getting current track info...');

        // Get the currently playing/last played track from playlist
        const currentTrack = $('a.jp-playlist-current');
        if (!currentTrack.length) {
            console.error('[geriau-pakartot] No current track found in playlist!');
            return null;
        }

        // Parse "Track Title by Artist Name" from the playlist item text
        const fullText = currentTrack.text().trim();
        const byIndex = fullText.indexOf(' by ');
        const currentTrackTitle = byIndex !== -1 ? fullText.substring(0, byIndex) : fullText;
        const currentTrackArtist = byIndex !== -1 ? fullText.substring(byIndex + 4) : '';

        if (!currentTrackTitle.length) {
            console.error('[geriau-pakartot] No track title found!');
            return null;
        }

        console.log(`[geriau-pakartot] Current track: "${currentTrackTitle}" by "${currentTrackArtist}"`);
        return { currentTrack, currentTrackTitle, currentTrackArtist };
    }

    function getCurrentAlbumContainer() {
        console.log('[geriau-pakartot] Getting current album container...');

        const trackInfo = getCurrentTrackInfo();
        if (!trackInfo) {
            return null;
        }

        const { currentTrackTitle } = trackInfo;

        // Find the album in the list that contains this track (case-insensitive)
        console.log(`[geriau-pakartot] Searching for track title (case-insensitive): "${currentTrackTitle}"`);

        const albumLinks = $('div.m-trackName').filter(function () {
            const elementText = $(this).text().toLowerCase();
            const searchText = currentTrackTitle.toLowerCase();
            const matches = elementText.includes(searchText);
            if (matches) {
                console.log(`[geriau-pakartot] Found match: "${$(this).text()}" contains "${currentTrackTitle}"`);
            }
            return matches;
        });

        if (!albumLinks.length) {
            console.error(`[geriau-pakartot] Track "${currentTrackTitle}" not found in album list (case-insensitive)`);
            return null;
        }

        console.log(`[geriau-pakartot] Found ${albumLinks.length} matching track(s)`);

        // Get the album container for the current track by going up 4 levels from the track name
        const currentAlbumContainer = albumLinks.first().parents().eq(4);
        if (!currentAlbumContainer.length) {
            console.error('[geriau-pakartot] Could not find album container for current track');
            return null;
        }

        console.log('[geriau-pakartot] Found current album container');
        return currentAlbumContainer;
    }

    function clickPlayButtonInAlbum(albumContainer, albumType = 'album') {
        console.log(`[geriau-pakartot] Looking for play button in ${albumType}...`);

        if (!albumContainer || !albumContainer.length) {
            console.error(`[geriau-pakartot] No ${albumType} container provided`);
            return false;
        }

        // Look for the play button in the album
        const playButton = albumContainer.find('.play-release.album-big-overflow-play');
        if (playButton.length) {
            console.log(`[geriau-pakartot] Found play button in ${albumType}, clicking...`);
            simulateTrustedClick(playButton[0]);
            manuallyPaused = false; // Reset manual pause flag when auto-advancing
            return true;
        } else {
            console.error(`[geriau-pakartot] Play button not found in ${albumType}`);
            return false;
        }
    }

    function clickPreviousAlbumButton() {
        console.log('[geriau-pakartot] Attempting to click previous album button...');

        const currentAlbumContainer = getCurrentAlbumContainer();
        if (!currentAlbumContainer) {
            return false;
        }

        // Find the previous sibling album
        const prevAlbumContainer = currentAlbumContainer.prev();
        if (!prevAlbumContainer.length) {
            console.error('[geriau-pakartot] No previous album found');
            return false;
        }

        console.log('[geriau-pakartot] Found previous album container');
        const result = clickPlayButtonInAlbum(prevAlbumContainer, 'previous album');
        return result ? { success: true } : false;
    }

    function clickNextAlbumButton() {
        console.log('[geriau-pakartot] Attempting to click next album button...');

        const currentAlbumContainer = getCurrentAlbumContainer();
        if (!currentAlbumContainer) {
            return false;
        }

        // Find the next sibling album
        const nextAlbumContainer = currentAlbumContainer.next();
        if (!nextAlbumContainer.length) {
            console.error('[geriau-pakartot] No next album found');

            // Check if this is the last track in the playlist
            if (isLastTrackInPlaylist()) {
                console.log('[geriau-pakartot] This is the last track in the last album');
                return { isLastTrack: true };
            }
            return false;
        }

        console.log('[geriau-pakartot] Found next album container');
        const result = clickPlayButtonInAlbum(nextAlbumContainer, 'next album');
        return result ? { success: true } : false;
    }

    function checkAndClickNextAlbum() {
        console.log('[geriau-pakartot] Running album check...');

        let isPaused = isPlayerPaused();
        let currentTrack = $('.jp-playlist-current');
        let isLastTrackInPlaylist = currentTrack.parent().children('li:last-child')[0] === currentTrack[0];

        // Don't auto-advance if player was manually paused via extension
        if (manuallyPaused && isPaused) {
            console.log('[geriau-pakartot] Player was manually paused via extension - skipping auto-advance');
            return;
        }

        if (!isPaused || !currentTrack.length || !isLastTrackInPlaylist) {
            console.log('[geriau-pakartot] Player is not paused or not on the last track');
            return;
        }

        console.log('[geriau-pakartot] Player is paused - attempting next album');
        clickNextAlbumButton();
    }

    // Main initialization
    console.log('[geriau-pakartot] Script initialized');
    console.log('[geriau-pakartot] jQuery loaded:', typeof $ !== 'undefined');
    console.log('[geriau-pakartot] Current URL:', window.location.href);

    function startAutoplay() {
        if (window._pakartotInterval) return;
        window._pakartotInterval = setInterval(checkAndClickNextAlbum, 5000);
        console.log('[geriau-pakartot] Autoplay started');
    }

    function stopAutoplay() {
        clearInterval(window._pakartotInterval);
        window._pakartotInterval = null;
        console.log('[geriau-pakartot] Autoplay stopped');
    }

    // Set up Media Session API so browser owns media keys, preventing propagation to other apps
    function setupMediaSession() {
        if (!('mediaSession' in navigator)) return;

        navigator.mediaSession.setActionHandler('play', () => {
            const playBtn = $('.jp-play');
            if (playBtn.is(':visible')) {
                simulateTrustedClick(playBtn[0]);
                manuallyPaused = false;
            }
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            const pauseBtn = $('.jp-pause');
            if (pauseBtn.is(':visible')) {
                simulateTrustedClick(pauseBtn[0]);
                manuallyPaused = true;
            }
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            if (isLastTrackInPlaylist()) {
                clickNextAlbumButton();
            } else {
                const nextBtn = $('.jp-next');
                if (nextBtn.length) simulateTrustedClick(nextBtn[0]);
            }
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => {
            if (isFirstTrackInPlaylist()) {
                clickPreviousAlbumButton();
            } else {
                const prevBtn = $('.jp-previous');
                if (prevBtn.length) simulateTrustedClick(prevBtn[0]);
            }
        });

        console.log('[geriau-pakartot] Media Session handlers registered');
    }

    function updateMediaSessionMetadata() {
        if (!('mediaSession' in navigator)) return;

        const trackInfo = getCurrentTrackInfo();
        if (!trackInfo) return;

        const { currentTrackTitle: title, currentTrackArtist: artist } = trackInfo;

        let artwork = [];
        const albumContainer = getCurrentAlbumContainer();
        if (albumContainer) {
            const img = albumContainer.find('img');
            if (img.length) {
                artwork = [{ src: img.attr('src') }];
            }
        }

        navigator.mediaSession.metadata = new MediaMetadata({ title, artist, artwork });
        console.log('[geriau-pakartot] Media session metadata updated:', title, artist);
    }

    // Watch for track changes to keep OS media session metadata up to date
    function observeTrackChanges(retries = 10) {
        const playlist = document.querySelector('.jp-playlist ul');
        if (!playlist) {
            if (retries > 0) setTimeout(() => observeTrackChanges(retries - 1), 2000);
            return;
        }
        const observer = new MutationObserver(() => {
            if (isPlayerPlaying()) updateMediaSessionMetadata();
        });
        observer.observe(playlist, { attributes: true, subtree: true, attributeFilter: ['class'] });
        console.log('[geriau-pakartot] Track change observer set up');
    }

    // Check storage on load
    chrome.storage.sync.get({ autoplayEnabled: true }, function (data) {
        if (data.autoplayEnabled) startAutoplay();
    });

    // Listen for changes
    chrome.storage.onChanged.addListener(function (changes, area) {
        if (area === 'sync' && changes.autoplayEnabled) {
            if (changes.autoplayEnabled.newValue) startAutoplay();
            else stopAutoplay();
        }
    });

    // Handle messages from popup for media controls
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log(`[geriau-pakartot] Received message: ${request.action}`);

        switch (request.action) {
        case 'previous':
            const prevBtn = $('.jp-previous');
            if (prevBtn.length) {
                // Check if we're at the first track
                if (isFirstTrackInPlaylist()) {
                    console.log('[geriau-pakartot] Already at the first track in playlist');
                    sendResponse({ message: 'Nebėra ankstesnių dainų' });
                } else {
                    console.log('[geriau-pakartot] Clicking previous button');
                    simulateTrustedClick(prevBtn[0]);
                    sendResponse({ message: 'Ankstesnės dainos mygtukas paspaustas' });
                }
            } else {
                console.log('[geriau-pakartot] Previous button not found');
                sendResponse({ message: 'Ankstesnės dainos mygtukas nerastas' });
            }
            break;

        case 'playPause':
            const playBtn = $('.jp-play');
            const pauseBtn = $('.jp-pause');

            if (playBtn.is(':visible')) {
                // Player is paused, so play
                console.log('[geriau-pakartot] Clicking play button');
                simulateTrustedClick(playBtn[0]);
                manuallyPaused = false;
                sendResponse({
                    message: 'Grojimas paleistas',
                    isPlaying: true
                });
            } else if (pauseBtn.is(':visible')) {
                // Player is playing, so pause
                console.log('[geriau-pakartot] Clicking pause button');
                simulateTrustedClick(pauseBtn[0]);
                manuallyPaused = true;
                sendResponse({
                    message: 'Grojimas sustabdytas',
                    isPlaying: false
                });
            } else {
                console.log('[geriau-pakartot] No play/pause buttons found or visible');
                sendResponse({ message: 'Grotuvo mygtukai nerasti' });
            }
            break;

        case 'next':
            const nextBtn = $('.jp-next');
            if (nextBtn.length) {
                // Check if we're at the last track
                if (isLastTrackInPlaylist()) {
                    console.log('[geriau-pakartot] Already at the last track in playlist');
                    sendResponse({ message: 'Jau paskutinė daina šiame grojaraštyje' });
                } else {
                    console.log('[geriau-pakartot] Clicking next button');
                    simulateTrustedClick(nextBtn[0]);
                    sendResponse({ message: 'Sekančios dainos mygtukas paspaustas' });
                }
            } else {
                console.log('[geriau-pakartot] Next button not found');
                sendResponse({ message: 'Sekančios dainos mygtukas nerastas' });
            }
            break;

        case 'previousAlbum':
            const prevAlbumResult = clickPreviousAlbumButton();
            if (prevAlbumResult && prevAlbumResult.success) {
                sendResponse({ message: 'Ankstesnis albumas paleistas' });
            } else {
                sendResponse({ message: 'Nepavyko rasti ankstesnio albumo' });
            }
            break;

        case 'nextAlbum':
            const nextAlbumResult = clickNextAlbumButton();
            if (nextAlbumResult && nextAlbumResult.success) {
                sendResponse({ message: 'Sekantis albumas paleistas' });
            } else if (nextAlbumResult && nextAlbumResult.isLastTrack) {
                sendResponse({ message: 'Tai paskutinė daina šiame albume' });
            } else {
                sendResponse({ message: 'Nepavyko rasti sekančio albumo' });
            }
            break; case 'shuffle':
            // When shuffle is OFF, click .jp-shuffle to turn it ON
            // When shuffle is ON, click .jp-shuffle-off to turn it OFF
            const shuffleOffBtn = $('.jp-shuffle-off');
            const shuffleOnBtn = $('.jp-shuffle');

            if (shuffleOffBtn.is(':visible')) {
                // Shuffle is currently ON, so turn it OFF
                console.log('[geriau-pakartot] Clicking shuffle-off button to disable shuffle');
                simulateTrustedClick(shuffleOffBtn[0]);

                // Return immediate optimistic response for popup UI
                sendResponse({
                    message: 'Maišymas išjungtas',
                    isShuffling: false // Optimistically assume it will turn off
                });
            } else if (shuffleOnBtn.is(':visible')) {
                // Shuffle is currently OFF, so turn it ON
                console.log('[geriau-pakartot] Clicking shuffle button to enable shuffle');
                simulateTrustedClick(shuffleOnBtn[0]);

                // Return immediate optimistic response for popup UI
                sendResponse({
                    message: 'Maišymas įjungtas',
                    isShuffling: true // Optimistically assume it will turn on
                });
            } else {
                console.log('[geriau-pakartot] Shuffle buttons not found');
                sendResponse({ message: 'Maišymo mygtukai nerasti' });
            }
            break; case 'repeat':
            // When repeat is OFF, click .jp-repeat to turn it ON
            // When repeat is ON, click .jp-repeat-off to turn it OFF
            const repeatOffBtn = $('.jp-repeat-off');
            const repeatOnBtn = $('.jp-repeat');

            if (repeatOffBtn.is(':visible')) {
                // Repeat is currently ON, so turn it OFF
                console.log('[geriau-pakartot] Clicking repeat-off button to disable repeat');
                simulateTrustedClick(repeatOffBtn[0]);

                // Return immediate optimistic response for popup UI
                sendResponse({
                    message: 'Kartojimas išjungtas',
                    isRepeating: false // Optimistically assume it will turn off
                });
            } else if (repeatOnBtn.is(':visible')) {
                // Repeat is currently OFF, so turn it ON
                console.log('[geriau-pakartot] Clicking repeat button to enable repeat');
                simulateTrustedClick(repeatOnBtn[0]);

                // Return immediate optimistic response for popup UI
                sendResponse({
                    message: 'Kartojimas įjungtas',
                    isRepeating: true // Optimistically assume it will turn on
                });
            } else {
                console.log('[geriau-pakartot] Repeat buttons not found');
                sendResponse({ message: 'Kartojimo mygtukai nerasti' });
            }
            break;

        case 'getPlayerState':
            const isPlaying = isPlayerPlaying();

            // Check shuffle and repeat states based on visible elements
            const isShuffling = $('.jp-shuffle-off').is(':visible');
            const isRepeating = $('.jp-repeat-off').is(':visible');

            console.log('[geriau-pakartot] Player state:', { isPlaying, isShuffling, isRepeating });
            sendResponse({
                isPlaying: isPlaying,
                isShuffling: isShuffling,
                isRepeating: isRepeating
            });
            break;

        case 'getPlaybackDetails':
            console.log('[geriau-pakartot] Getting playback details...');
            const trackInfo = getCurrentTrackInfo();
            const playbackState = {
                isPlaying: isPlayerPlaying(),
                artist: null,
                title: null,
                artwork: null
            };

            if (trackInfo) {
                const { currentTrackTitle, currentTrackArtist } = trackInfo;
                playbackState.title = currentTrackTitle;
                playbackState.artist = currentTrackArtist;

                // Try to find artwork
                // method 1: check if there's an image in the current album container
                const albumContainer = getCurrentAlbumContainer();
                if (albumContainer) {
                    const img = albumContainer.find('img');
                    if (img.length) {
                        playbackState.artwork = img.attr('src');
                        console.log('[geriau-pakartot] Found artwork in album container:', playbackState.artwork);
                    }
                }
                
                // method 2: fallback to any evident player poster if method 1 failed
                if (!playbackState.artwork) {
                    // This is a guess based on common player class names, 
                    // might need adjustment if a specific class exists for usage
                    const playerPoster = $('.jp-poster img, .jp-jplayer img'); 
                    if (playerPoster.length) {
                        playbackState.artwork = playerPoster.attr('src');
                        console.log('[geriau-pakartot] Found artwork in player poster:', playbackState.artwork);
                    }
                }
            }

            sendResponse(playbackState);
            break;

        default:
            console.log('[geriau-pakartot] Unknown command:', request.action);
            sendResponse({ message: 'Nežinomas komanda' });
        }

        return true; // Keep message channel open for async response
    });

    console.log('[geriau-pakartot] Message listener set up');

    setupMediaSession();
    observeTrackChanges();
})();
