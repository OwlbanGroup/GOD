// ============================================================================
// GOD Project - localStorage Wrapper
// ============================================================================

import { error, warn } from '../../utils/loggerWrapper.js';

class StorageManager {
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (err) {
            warn(`Failed to get ${key} from localStorage:`, err);
            return defaultValue;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (err) {
            error(`Failed to set ${key} in localStorage:`, err);
            return false;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (err) {
            error(`Failed to remove ${key} from localStorage:`, err);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (err) {
            error('Failed to clear localStorage:', err);
            return false;
        }
    }

    static getAllKeys() {
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                keys.push(localStorage.key(i));
            }
            return keys;
        } catch (err) {
            error('Failed to get localStorage keys:', err);
            return [];
        }
    }

    static has(key) {
        return localStorage.getItem(key) !== null;
    }

    // Safe versions that handle errors gracefully
    static safeGet(key, defaultValue = null) {
        return this.get(key, defaultValue);
    }

    static safeSet(key, value) {
        return this.set(key, value);
    }
}

export default StorageManager;
