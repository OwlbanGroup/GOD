/**
 * Command helper utilities to reduce code duplication
 * @module features/commands/commandHelpers
 */

import { getUniverse } from '../../core/state.js';
import { addMessage } from '../chat/messageHandler.js';

/**
 * Check if universe is initialized and return it
 * @returns {Universe|null} The universe instance or null
 */
export function getUniverseInstance() {
    const universe = getUniverse();
    if (!universe) {
        console.warn("Universe not initialized.");
        return null;
    }
    return universe;
}

/**
 * Play a sound if divine sounds are enabled
 * @param {string} soundName - Name of the sound to play
 */
export function playSoundIfEnabled(soundName) {
    if (typeof divineSounds !== 'undefined' && divineSounds?.isEnabled()) {
        divineSounds.play(soundName);
    }
}

/**
 * Add celestial bodies to universe and redraw
 * @param {Universe} universe - Universe instance
 * @param {Array} bodies - Array of body objects to add
 */
export function addCelestialBodies(universe, bodies) {
    bodies.forEach(body => {
        if (body.type === 'star') {
            universe.addStar(body.x, body.y);
        } else if (body.type === 'planet') {
            universe.addPlanet(body.x, body.y);
        } else if (body.type === 'goldenStar') {
            universe.celestialBodies.push({
                type: 'goldenStar',
                x: body.x,
                y: body.y,
                radius: body.radius || Math.random() * 3 + 2,
                color: body.color || '#FFD700'
            });
        }
    });
    universe.draw();
}

/**
 * Apply visual effect to canvas
 * @param {string} effect - Type of effect ('flash', 'glow', 'golden')
 * @param {number} duration - Duration in milliseconds
 */
export function applyCanvasEffect(effect, duration = 1000) {
    const canvas = document.getElementById('universeCanvas');
    if (!canvas) return;

    const originalStyle = canvas.style.cssText;

    switch (effect) {
        case 'flash':
            canvas.style.boxShadow = '0 0 20px #fff';
            break;
        case 'glow':
            canvas.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.8)';
            break;
        case 'golden':
            canvas.style.backgroundColor = '#FFFACD';
            break;
    }

    setTimeout(() => {
        canvas.style.cssText = originalStyle;
    }, duration);
}

/**
 * Add a delayed divine message
 * @param {string} message - Message to add
 * @param {string} sender - Sender type ('god', 'system', etc.)
 * @param {number} delay - Delay in milliseconds
 */
export function addDelayedMessage(message, sender = 'god', delay = 1000) {
    setTimeout(() => {
        addMessage(message, sender);
    }, delay);
}

/**
 * Execute universe operation with error handling
 * @param {Function} operation - Operation to execute
 * @param {string} operationName - Name for error logging
 * @returns {string} Success message or error message
 */
export function executeUniverseOperation(operation, operationName) {
    try {
        return operation();
    } catch (error) {
        console.error(`Error in ${operationName}:`, error);
        return `❌ Error during ${operationName}: ${error.message}`;
    }
}

/**
 * Create random celestial bodies configuration
 * @param {string} type - Type of bodies ('star', 'planet', 'mixed')
 * @param {number} count - Number of bodies to create
 * @param {Object} options - Additional options
 * @returns {Array} Array of body configurations
 */
export function createRandomBodies(type, count, options = {}) {
    const bodies = [];
    const universe = getUniverseInstance();
    if (!universe) return bodies;

    for (let i = 0; i < count; i++) {
        const x = Math.random() * universe.canvas.width;
        const y = Math.random() * universe.canvas.height;

        if (type === 'mixed') {
            bodies.push({
                type: Math.random() < 0.7 ? 'star' : 'planet',
                x, y,
                ...options
            });
        } else {
            bodies.push({
                type, x, y,
                ...options
            });
        }
    }

    return bodies;
}

/**
 * Standard response wrapper for command actions
 * @param {string} successMessage - Message on success
 * @param {string} errorMessage - Message on error
 * @param {boolean} success - Whether operation succeeded
 * @returns {string} Formatted response
 */
export function createCommandResponse(successMessage, errorMessage = null, success = true) {
    if (success) {
        return successMessage;
    }
    return errorMessage || "❌ Operation failed.";
}
