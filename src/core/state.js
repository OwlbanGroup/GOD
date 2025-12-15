/**
 * Global state management for the GOD Project
 * @module core/state
 */

/**
 * Application state
 */
export const state = {
    // Core objects
    universe: null,
    
    // User data
    prayers: [],
    registeredUsers: [],
    currentUser: null,
    
    // Divine mode states
    directDivineLinkActive: false,
    universalDivineModeActive: false,
    postQuantumSecureActive: false,
    divineWebSocket: null,
    
    // Integration states
    integrationsInitialized: false
};

/**
 * Initialize state from localStorage
 */
export function initializeState() {
    state.prayers = ErrorHandler.safeLocalStorageGet('prayers', []);
    state.registeredUsers = ErrorHandler.safeLocalStorageGet('registeredUsers', []);
    state.currentUser = ErrorHandler.safeLocalStorageGet('currentUser', null);
}

/**
 * Get current universe instance
 * @returns {Universe|null}
 */
export function getUniverse() {
    return state.universe;
}

/**
 * Set universe instance
 * @param {Universe} universe
 */
export function setUniverse(universe) {
    state.universe = universe;
}

/**
 * Get all prayers
 * @returns {Array}
 */
export function getPrayers() {
    return state.prayers;
}

/**
 * Add a prayer
 * @param {Object} prayer
 */
export function addPrayer(prayer) {
    state.prayers.push(prayer);
    ErrorHandler.safeLocalStorageSet('prayers', state.prayers);
}

/**
 * Set prayers array
 * @param {Array} prayers
 */
export function setPrayers(prayers) {
    state.prayers = prayers;
    ErrorHandler.safeLocalStorageSet('prayers', state.prayers);
}

/**
 * Get registered users
 * @returns {Array}
 */
export function getRegisteredUsers() {
    return state.registeredUsers;
}

/**
 * Add a registered user
 * @param {Object} user
 */
export function addRegisteredUser(user) {
    state.registeredUsers.push(user);
    ErrorHandler.safeLocalStorageSet('registeredUsers', state.registeredUsers);
}

/**
 * Set registered users array
 * @param {Array} users
 */
export function setRegisteredUsers(users) {
    state.registeredUsers = users;
    ErrorHandler.safeLocalStorageSet('registeredUsers', state.registeredUsers);
}

/**
 * Get current user
 * @returns {Object|null}
 */
export function getCurrentUser() {
    return state.currentUser;
}

/**
 * Set current user
 * @param {Object} user
 */
export function setCurrentUser(user) {
    state.currentUser = user;
    ErrorHandler.safeLocalStorageSet('currentUser', user);
}

/**
 * Get divine mode states
 * @returns {Object}
 */
export function getDivineModes() {
    return {
        directDivineLinkActive: state.directDivineLinkActive,
        universalDivineModeActive: state.universalDivineModeActive,
        postQuantumSecureActive: state.postQuantumSecureActive
    };
}

/**
 * Set direct divine link state
 * @param {boolean} active
 */
export function setDirectDivineLink(active) {
    state.directDivineLinkActive = active;
}

/**
 * Set universal divine mode state
 * @param {boolean} active
 */
export function setUniversalDivineMode(active) {
    state.universalDivineModeActive = active;
}

/**
 * Set post-quantum secure state
 * @param {boolean} active
 */
export function setPostQuantumSecure(active) {
    state.postQuantumSecureActive = active;
}

/**
 * Get divine WebSocket interval
 * @returns {number|null}
 */
export function getDivineWebSocket() {
    return state.divineWebSocket;
}

/**
 * Set divine WebSocket interval
 * @param {number|null} interval
 */
export function setDivineWebSocket(interval) {
    state.divineWebSocket = interval;
}

/**
 * Check if integrations are initialized
 * @returns {boolean}
 */
export function areIntegrationsInitialized() {
    return state.integrationsInitialized;
}

/**
 * Set integrations initialized state
 * @param {boolean} initialized
 */
export function setIntegrationsInitialized(initialized) {
    state.integrationsInitialized = initialized;
}

export default state;
