const toggle = document.getElementById('autoplay-toggle');
const prevBtn = document.getElementById('prev-btn');
const playPauseBtn = document.getElementById('play-pause-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const prevAlbumBtn = document.getElementById('prev-album-btn');
const nextAlbumBtn = document.getElementById('next-album-btn');
const statusMessage = document.getElementById('status-message');

// Get current setting and set toggle accordingly
chrome.storage.sync.get({ autoplayEnabled: true }, function (data) {
    toggle.checked = data.autoplayEnabled;
});

// Listen for toggle changes
toggle.addEventListener('change', function () {
    chrome.storage.sync.set({ autoplayEnabled: toggle.checked });
});

// Media control functions
function findPakartotTab(callback) {
    chrome.tabs.query({ url: ['https://pakartot.lt/*', 'https://www.pakartot.lt/*'] }, function (tabs) {
        if (tabs.length > 0) {
            callback(tabs[0]); // Use the first matching tab
        } else {
            callback(null);
        }
    });
}

function sendToggleCommand(command) {
    findPakartotTab(function (tab) {
        if (!tab) {
            updateStatus('Pakartot.lt puslapis nerastas');
            return;
        }

        // Send message to content script
        chrome.tabs.sendMessage(tab.id, { action: command }, function (response) {
            if (chrome.runtime.lastError) {
                // Check if it's a connection error (content script not ready)
                if (chrome.runtime.lastError.message.includes('Could not establish connection')) {
                    updateStatus('Pakartot.lt puslapis nepasiekiamas - pabandykite perkrauti puslapį');
                } else {
                    updateStatus('Klaida: ' + chrome.runtime.lastError.message);
                }
                return;
            }

            if (response) {
                updateStatus(response.message);

                // Update button states immediately if included in response
                if (response.isShuffling !== undefined) {
                    updateShuffleButton(response.isShuffling);
                }
                if (response.isRepeating !== undefined) {
                    updateRepeatButton(response.isRepeating);
                }

                // After toggle command, request updated player state to refresh button states as backup
                setTimeout(() => {
                    chrome.tabs.sendMessage(tab.id, { action: 'getPlayerState' }, function (stateResponse) {
                        if (stateResponse && !chrome.runtime.lastError) {
                            if (stateResponse.isShuffling !== undefined) {
                                updateShuffleButton(stateResponse.isShuffling);
                            }
                            if (stateResponse.isRepeating !== undefined) {
                                updateRepeatButton(stateResponse.isRepeating);
                            }
                        }
                    });
                }, 200); // Small delay to allow DOM to update
            } else {
                updateStatus('Nėra atsakymo iš puslapio');
            }
        });
    });
}

function sendPlayerCommand(command) {
    findPakartotTab(function (tab) {
        if (!tab) {
            updateStatus('Pakartot.lt puslapis nerastas');
            return;
        }

        // Send message to content script
        chrome.tabs.sendMessage(tab.id, { action: command }, function (response) {
            if (chrome.runtime.lastError) {
                // Check if it's a connection error (content script not ready)
                if (chrome.runtime.lastError.message.includes('Could not establish connection')) {
                    updateStatus('Pakartot.lt puslapis nepasiekiamas - pabandykite perkrauti puslapį');
                } else {
                    updateStatus('Klaida: ' + chrome.runtime.lastError.message);
                }
                return;
            }

            if (response) {
                updateStatus(response.message);

                // Safely update button states
                if (response.isPlaying !== undefined) {
                    updatePlayPauseButton(response.isPlaying);
                }
                if (response.isShuffling !== undefined) {
                    updateShuffleButton(response.isShuffling);
                }
                if (response.isRepeating !== undefined) {
                    updateRepeatButton(response.isRepeating);
                }
            } else {
                updateStatus('Nėra atsakymo iš puslapio');
            }
        });
    });
}

function updateStatus(message) {
    statusMessage.textContent = message;
    setTimeout(() => {
        statusMessage.textContent = 'Valdykite pakartot.lt iš bet kur';
    }, 3000);
}

function updatePlayPauseButton(isPlaying) {
    if (!playPauseBtn) return;
    playPauseBtn.textContent = isPlaying ? '⏸️' : '▶️';
    playPauseBtn.title = isPlaying ? 'Sustabdyti' : 'Groti';
}

function updateShuffleButton(isActive) {
    if (!shuffleBtn) return;
    if (isActive) {
        shuffleBtn.classList.add('active');
    } else {
        shuffleBtn.classList.remove('active');
    }
}

function updateRepeatButton(isActive) {
    if (!repeatBtn) return;
    if (isActive) {
        repeatBtn.classList.add('active');
    } else {
        repeatBtn.classList.remove('active');
    }
}

// Add event listeners for media controls
prevBtn.addEventListener('click', () => sendPlayerCommand('previous'));
playPauseBtn.addEventListener('click', () => sendPlayerCommand('playPause'));
nextBtn.addEventListener('click', () => sendPlayerCommand('next'));
shuffleBtn.addEventListener('click', () => sendToggleCommand('shuffle'));
repeatBtn.addEventListener('click', () => sendToggleCommand('repeat'));

// Add event listeners for album controls
prevAlbumBtn.addEventListener('click', () => sendPlayerCommand('previousAlbum'));
nextAlbumBtn.addEventListener('click', () => sendPlayerCommand('nextAlbum'));

// Request current player state when popup opens
findPakartotTab(function (tab) {
    if (tab) {
        chrome.tabs.sendMessage(tab.id, { action: 'getPlayerState' }, function (response) {
            if (chrome.runtime.lastError) {
                // More informative error message
                if (chrome.runtime.lastError.message.includes('Could not establish connection')) {
                    updateStatus('Perkraukite pakartot.lt puslapį');
                }
                return;
            }
            if (response && response.isPlaying !== undefined) {
                updatePlayPauseButton(response.isPlaying);
            }
            if (response && response.isShuffling !== undefined) {
                updateShuffleButton(response.isShuffling);
            }
            if (response && response.isRepeating !== undefined) {
                updateRepeatButton(response.isRepeating);
            }
        });
    } else {
        updateStatus('Atidarykite pakartot.lt puslapį');
    }
});
