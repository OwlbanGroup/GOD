// ============================================================================
// GOD Project - Application State Management
// ============================================================================

import { info, error, warn, debug } from '../../utils/loggerWrapper.js';

// Check if we're running in a browser environment with localStorage
const isBrowser = typeof localStorage !== 'undefined';

// In-memory storage fallback for Node.js environments
const memoryStorage = new Map();

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
            // Use localStorage in browser, fall back to memory storage in Node.js
            if (isBrowser) {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } else {
                // Use in-memory storage in Node.js environment
                const item = memoryStorage.get(key);
                return item !== undefined ? JSON.parse(item) : defaultValue;
            }
        } catch (err) {
            warn(`Failed to get ${key} from storage:`, err);
            return defaultValue;
        }
    }

    safeLocalStorageSet(key, value) {
        try {
            // Use localStorage in browser, fall back to memory storage in Node.js
            if (isBrowser) {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                // Use in-memory storage in Node.js environment
                memoryStorage.set(key, JSON.stringify(value));
            }
        } catch (err) {
            error(`Failed to set ${key} in storage:`, err);
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
