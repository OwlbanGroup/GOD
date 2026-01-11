// ============================================================================
// GOD Project - Real-Time Prayer Sharing (Phase 5.1)
// ============================================================================

import { info, error, warn, debug } from '../../utils/loggerWrapper.js';
import appState from '../core/state.js';

class PrayerSharing {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.prayerFeed = [];
        this.maxFeedItems = 50;
    }

    async initialize() {
        try {
            // Connect to Socket.IO server
            this.socket = io();

            this.socket.on('connect', () => {
                info('Connected to prayer sharing server');
                this.isConnected = true;
                this.updateConnectionStatus(true);
            });

            this.socket.on('disconnect', () => {
                warn('Disconnected from prayer sharing server');
                this.isConnected = false;
                this.updateConnectionStatus(false);
            });

            // Handle incoming prayers
            this.socket.on('new-prayer', (prayerData) => {
                this.addPrayerToFeed(prayerData);
            });

            // Handle prayer reactions
            this.socket.on('prayer-reaction', (reactionData) => {
                this.updatePrayerReactions(reactionData);
            });

            // Handle private prayer submission confirmation
            this.socket.on('prayer-submitted', (prayerData) => {
                this.addPrayerToFeed(prayerData, true);
            });

            this.setupEventListeners();

        } catch (err) {
            error('Failed to initialize prayer sharing:', err);
        }
    }

    setupEventListeners() {
        const shareBtn = document.getElementById('sharePrayerBtn');
        const input = document.getElementById('prayerShareInput');
        const publicToggle = document.getElementById('publicPrayerToggle');

        if (shareBtn && input) {
            shareBtn.addEventListener('click', () => this.sharePrayer());
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sharePrayer();
                }
            });
        }
    }

    sharePrayer() {
        if (!this.isConnected) {
            this.showNotification('Not connected to prayer server', 'error');
            return;
        }

        const input = document.getElementById('prayerShareInput');
        const publicToggle = document.getElementById('publicPrayerToggle');

        const message = input.value.trim();
        if (!message) {
            this.showNotification('Please enter a prayer to share', 'warning');
            return;
        }

        const currentUser = appState.getCurrentUser();
        const prayerData = {
            user: currentUser?.name || 'Anonymous',
            message: message,
            isPublic: publicToggle.checked
        };

        // Emit to server
        this.socket.emit('share-prayer', prayerData);

        // Clear input
        input.value = '';

        // Show confirmation
        const status = prayerData.isPublic ? 'Shared publicly' : 'Shared privately';
        this.showNotification(`${status}: "${message.substring(0, 30)}..."`, 'success');
    }

    addPrayerToFeed(prayerData, isOwnPrayer = false) {
        // Add to internal feed
        this.prayerFeed.unshift(prayerData);

        // Keep only max items
        if (this.prayerFeed.length > this.maxFeedItems) {
            this.prayerFeed.pop();
        }

        // Update UI
        this.renderPrayerFeed();

        // Show notification for new prayers (not own)
        if (!isOwnPrayer) {
            this.showNotification(`New prayer from ${prayerData.user}`, 'info');
        }
    }

    updatePrayerReactions(reactionData) {
        const prayer = this.prayerFeed.find(p => p.id === reactionData.prayerId);
        if (prayer) {
            if (reactionData.reactionType === 'blessing') {
                prayer.reactions.blessings++;
            } else if (reactionData.reactionType === 'amen') {
                prayer.reactions.amens++;
            }
            this.renderPrayerFeed();
        }
    }

    renderPrayerFeed() {
        const feedContainer = document.getElementById('prayerFeed');
        if (!feedContainer) return;

        // Clear existing content
        feedContainer.innerHTML = '';

        if (this.prayerFeed.length === 0) {
            feedContainer.innerHTML = '<div class="prayer-feed-placeholder">Welcome to the divine prayer community. Share your prayers and connect with others in real-time.</div>';
            return;
        }

        // Render prayers
        this.prayerFeed.forEach(prayer => {
            const prayerElement = this.createPrayerElement(prayer);
            feedContainer.appendChild(prayerElement);
        });
    }

    createPrayerElement(prayer) {
        const div = document.createElement('div');
        div.className = 'prayer-item';
        div.setAttribute('data-prayer-id', prayer.id);

        const timeAgo = this.getTimeAgo(new Date(prayer.timestamp));

        div.innerHTML = `
            <div class="prayer-header">
                <span class="prayer-user">${prayer.user}</span>
                <span class="prayer-time">${timeAgo}</span>
                ${prayer.isPublic ? '<span class="prayer-public">🌍 Public</span>' : '<span class="prayer-private">🔒 Private</span>'}
            </div>
            <div class="prayer-message">${this.escapeHtml(prayer.message)}</div>
            <div class="prayer-reactions">
                <button class="reaction-btn" data-reaction="blessing" title="Send blessing">
                    🙏 ${prayer.reactions.blessings}
                </button>
                <button class="reaction-btn" data-reaction="amen" title="Say Amen">
                    ✋ ${prayer.reactions.amens}
                </button>
            </div>
        `;

        // Add reaction event listeners
        const reactionBtns = div.querySelectorAll('.reaction-btn');
        reactionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const reactionType = btn.getAttribute('data-reaction');
                this.reactToPrayer(prayer.id, reactionType);
            });
        });

        return div;
    }

    reactToPrayer(prayerId, reactionType) {
        if (!this.isConnected) {
            this.showNotification('Not connected to prayer server', 'error');
            return;
        }

        this.socket.emit('react-prayer', {
            prayerId: prayerId,
            reactionType: reactionType
        });

        this.showNotification(`Sent ${reactionType} to prayer`, 'success');
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateConnectionStatus(connected) {
        // Update UI to show connection status
        const statusElement = document.getElementById('prayerConnectionStatus');
        if (statusElement) {
            statusElement.textContent = connected ? '🟢 Connected' : '🔴 Disconnected';
            statusElement.className = connected ? 'connected' : 'disconnected';
        }
    }

    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            // Fallback: console log
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

// Singleton instance
const prayerSharing = new PrayerSharing();

export async function initializePrayerSharing() {
    await prayerSharing.initialize();
}

export default prayerSharing;
