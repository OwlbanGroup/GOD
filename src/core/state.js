// ============================================================================
// GOD Project - Application State Management
// ============================================================================

import { info, error, warn, debug } from '../../utils/loggerWrapper.js';

class AppState {
    constructor() {
        this.prayers = [];
        this.registeredUsers = [];
        this.currentUser = null;

        // Divine mode states
        this.directDivineLinkActive = false;
        this.universalDivineModeActive = false;
        this.postQuantumSecureActive = false;
        this.divineWebSocket = null;

        this.loadState();
    }

    loadState() {
        try {
            this.prayers = this.safeLocalStorageGet('prayers', []);
            this.registeredUsers = this.safeLocalStorageGet('registeredUsers', []);
            this.currentUser = this.safeLocalStorageGet('currentUser', null);
        } catch (err) {
            error('Failed to load application state:', err);
        }
    }

    saveState() {
        try {
            this.safeLocalStorageSet('prayers', this.prayers);
            this.safeLocalStorageSet('registeredUsers', this.registeredUsers);
            this.safeLocalStorageSet('currentUser', this.currentUser);
        } catch (err) {
            error('Failed to save application state:', err);
        }
    }

    safeLocalStorageGet(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (err) {
            warn(`Failed to get ${key} from localStorage:`, err);
            return defaultValue;
        }
    }

    safeLocalStorageSet(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            error(`Failed to set ${key} in localStorage:`, err);
        }
    }

    // Prayer management
    addPrayer(message, timestamp = new Date().toISOString()) {
        const prayer = { message, timestamp };
        this.prayers.push(prayer);
        this.saveState();
        return prayer;
    }

    getPrayers() {
        return [...this.prayers];
    }

    // User management
    addUser(user) {
        this.registeredUsers.push(user);
        this.saveState();
        return user;
    }

    findUser(name) {
        return this.registeredUsers.find(user => user.name === name);
    }

    setCurrentUser(user) {
        this.currentUser = user;
        this.saveState();
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Divine modes
    setDirectDivineLink(active) {
        this.directDivineLinkActive = active;
    }

    setUniversalDivineMode(active) {
        this.universalDivineModeActive = active;
    }

    setPostQuantumSecure(active) {
        this.postQuantumSecureActive = active;
    }

    getDivineModes() {
        return {
            directDivineLinkActive: this.directDivineLinkActive,
            universalDivineModeActive: this.universalDivineModeActive,
            postQuantumSecureActive: this.postQuantumSecureActive
        };
    }

    // WebSocket management
    setDivineWebSocket(ws) {
        this.divineWebSocket = ws;
    }

    clearDivineWebSocket() {
        if (this.divineWebSocket) {
            clearInterval(this.divineWebSocket);
            this.divineWebSocket = null;
        }
    }

    // Reset state (for testing or cleanup)
    reset() {
        this.prayers = [];
        this.registeredUsers = [];
        this.currentUser = null;
        this.directDivineLinkActive = false;
        this.universalDivineModeActive = false;
        this.postQuantumSecureActive = false;
        this.clearDivineWebSocket();
        this.saveState();
    }
}

// Singleton instance
const appState = new AppState();

export default appState;
