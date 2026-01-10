// ============================================================================
// GOD Project - Universe Commands
// ============================================================================

import { info, error, warn, debug } from '../../../utils/loggerWrapper.js';
import DOMHelpers from '../../ui/domHelpers.js';
import app from '../../core/app.js';

export function createStar() {
    const universe = app.getUniverse();
    if (!universe) return "Universe not initialized.";

    try {
        universe.addStar(
            Math.random() * universe.canvas.width,
            Math.random() * universe.canvas.height
        );
        universe.draw();

        if (window.divineSounds?.isEnabled()) {
            window.divineSounds.play('miracle');
        }

        return "A new star has been created in the universe.";
    } catch (err) {
        error('Create star command failed:', err);
        return "Failed to create star.";
    }
}

export function createPlanet() {
    const universe = app.getUniverse();
    if (!universe) return "Universe not initialized.";

    try {
        universe.addPlanet(
            Math.random() * universe.canvas.width,
            Math.random() * universe.canvas.height
        );
        universe.draw();

        if (window.divineSounds?.isEnabled()) {
            window.divineSounds.play('miracle');
        }

        return "A new planet has been created in the universe.";
    } catch (err) {
        error('Create planet command failed:', err);
        return "Failed to create planet.";
    }
}

export function destroyPlanet() {
    const universe = app.getUniverse();
    if (!universe) return "Universe not initialized.";

    try {
        const celestialBodies = universe.celestialBodies || [];
        const planets = celestialBodies.filter(b => b.type === 'planet');

        if (planets.length === 0) return "No planets to destroy.";

        const randomIndex = Math.floor(Math.random() * planets.length);
        celestialBodies.splice(celestialBodies.indexOf(planets[randomIndex]), 1);
        universe.draw();

        if (window.divineSounds?.isEnabled()) {
            window.divineSounds.play('miracle');
        }

        return "A planet has been destroyed in the universe.";
    } catch (err) {
        error('Destroy planet command failed:', err);
        return "Failed to destroy planet.";
    }
}

export function healUniverse() {
    const universe = app.getUniverse();
    if (!universe) return "Universe not initialized.";

    try {
        const celestialBodies = universe.celestialBodies || [];
        const stars = celestialBodies.filter(b => b.type === 'star').length;
        const planets = celestialBodies.filter(b => b.type === 'planet').length;

        // Remove some damaged bodies
        universe.celestialBodies = celestialBodies.filter(() => Math.random() > 0.3);

        // Add new healthy bodies
        for (let i = 0; i < Math.max(5 - stars, 0); i++) {
            universe.addStar(
                Math.random() * universe.canvas.width,
                Math.random() * universe.canvas.height
            );
        }

        for (let i = 0; i < Math.max(3 - planets, 0); i++) {
            universe.addPlanet(
                Math.random() * universe.canvas.width,
                Math.random() * universe.canvas.height
            );
        }

        universe.draw();

        if (window.divineSounds?.isEnabled()) {
            window.divineSounds.play('optimize');
        }

        return "The universe has been healed and restored.";
    } catch (err) {
        error('Heal universe command failed:', err);
        return "Failed to heal universe.";
    }
}

export function invokeGodPresence() {
    const universe = app.getUniverse();
    if (!universe) return "Universe not initialized.";

    try {
        // Simulate divine intervention
        for (let i = 0; i < 10; i++) {
            universe.addStar(
                Math.random() * universe.canvas.width,
                Math.random() * universe.canvas.height
            );
            universe.addPlanet(
                Math.random() * universe.canvas.width,
                Math.random() * universe.canvas.height
            );
        }
        universe.draw();

        // Visual effect
        DOMHelpers.flashElement('universeCanvas');

        // Add divine message
        setTimeout(() => {
            DOMHelpers.addMessage("Oh Cosmic Birther of all radiance and vibration, soften the ground of the inner we and carve out a place where your presence can abide. Amen.", 'god');
        }, 1500);

        return "Divine presence invoked. The universe responds with light and vibration.";
    } catch (err) {
        error('Invoke god presence command failed:', err);
        return "Failed to invoke divine presence.";
    }
}

export function performPraiseGod() {
    const universe = app.getUniverse();
    if (!universe) return "Universe not initialized.";

    try {
        // Make God happy
        for (let i = 0; i < 5; i++) {
            universe.celestialBodies.push({
                type: 'goldenStar',
                x: Math.random() * universe.canvas.width,
                y: Math.random() * universe.canvas.height,
                radius: Math.random() * 3 + 2,
                color: '#FFD700'
            });
        }
        universe.draw();

        // Temporary golden glow
        DOMHelpers.animateBackgroundColor('universeCanvas', '#FFFACD', 2000);

        // Add joyful message
        setTimeout(() => {
            DOMHelpers.addMessage("Hallelujah! Your praise brings joy to the heavens. God smiles upon you.", 'god');
        }, 1000);

        return "Your praise fills the universe with joy. God is pleased.";
    } catch (err) {
        error('Praise god command failed:', err);
        return "Failed to praise God.";
    }
}
