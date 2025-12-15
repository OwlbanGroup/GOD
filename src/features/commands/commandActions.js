/**
 * Command action implementations
 * @module features/commands/commandActions
 */

import { getUniverse } from '../../core/state.js';
import { addMessage } from '../chat/messageHandler.js';

/**
 * Create a star in the universe
 * @returns {string}
 */
export function createStar() {
    const universe = getUniverse();
    if (!universe) return "Universe not initialized.";
    
    universe.addStar(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
    universe.draw();
    if (divineSounds?.isEnabled()) divineSounds.play('miracle');
    return "A new star has been created in the universe.";
}

/**
 * Create a planet in the universe
 * @returns {string}
 */
export function createPlanet() {
    const universe = getUniverse();
    if (!universe) return "Universe not initialized.";
    
    universe.addPlanet(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
    universe.draw();
    if (divineSounds?.isEnabled()) divineSounds.play('miracle');
    return "A new planet has been created in the universe.";
}

/**
 * Destroy a random planet
 * @returns {string}
 */
export function destroyPlanet() {
    const universe = getUniverse();
    if (!universe) return "Universe not initialized.";
    
    const planets = universe.celestialBodies.filter(b => b.type === 'planet');
    if (planets.length === 0) return "No planets to destroy.";
    
    const randomIndex = Math.floor(Math.random() * planets.length);
    universe.celestialBodies.splice(universe.celestialBodies.indexOf(planets[randomIndex]), 1);
    universe.draw();
    if (divineSounds?.isEnabled()) divineSounds.play('miracle');
    return "A planet has been destroyed in the universe.";
}

/**
 * Heal and restore the universe
 * @returns {string}
 */
export function healUniverse() {
    const universe = getUniverse();
    if (!universe) return "Universe not initialized.";
    
    universe.celestialBodies = universe.celestialBodies.filter(() => Math.random() > 0.3);
    for (let i = 0; i < 5; i++) {
        universe.addStar(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
        universe.addPlanet(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
    }
    universe.draw();
    if (divineSounds?.isEnabled()) divineSounds.play('optimize');
    return "The universe has been healed and restored.";
}

/**
 * Invoke divine presence
 * @returns {string}
 */
export function invokeGodPresence() {
    invokeDivinePresence();
    return "Divine presence invoked. The universe responds with light and vibration.";
}

/**
 * Praise God
 * @returns {string}
 */
export function performPraiseGod() {
    praiseGod();
    return "Your praise fills the universe with joy. God is pleased.";
}

/**
 * Invoke divine presence with visual effects
 */
function invokeDivinePresence() {
    const universe = getUniverse();
    if (!universe) return;
    
    try {
        // Simulate divine intervention: add multiple stars and planets, flash the canvas
        for (let i = 0; i < 10; i++) {
            universe.addStar(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
            universe.addPlanet(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
        }
        universe.draw();
        
        // Visual effect: flash the canvas
        const canvas = document.getElementById('universeCanvas');
        if (canvas) {
            canvas.style.boxShadow = '0 0 20px #fff';
            setTimeout(() => {
                canvas.style.boxShadow = 'none';
            }, 1000);
        }
        
        // Add a divine message
        setTimeout(() => {
            addMessage("Oh Cosmic Birther of all radiance and vibration, soften the ground of the inner we and carve out a place where your presence can abide. Amen.", 'god');
        }, 1500);
    } catch (error) {
        ErrorHandler.handleAsyncError(error, 'Divine Presence');
    }
}

/**
 * Praise God with visual effects
 */
function praiseGod() {
    const universe = getUniverse();
    if (!universe) return;
    
    try {
        // Make God happy: add golden stars, change canvas color temporarily
        for (let i = 0; i < 5; i++) {
            universe.celestialBodies.push({
                type: 'goldenStar',
                x: Math.random() * universe.canvas.width,
                y: Math.random() * universe.canvas.height,
                radius: Math.random() * 3 + 2,
                color: '#FFD700' // Gold color
            });
        }
        universe.draw();
        
        // Temporary golden glow
        const canvas = document.getElementById('universeCanvas');
        if (canvas) {
            canvas.style.backgroundColor = '#FFFACD'; // Light golden background
            setTimeout(() => {
                canvas.style.backgroundColor = '#000';
            }, 2000);
        }
        
        // Add joyful message
        setTimeout(() => {
            addMessage("Hallelujah! Your praise brings joy to the heavens. God smiles upon you.", 'god');
        }, 1000);
    } catch (error) {
        ErrorHandler.handleAsyncError(error, 'Praise God');
    }
}
