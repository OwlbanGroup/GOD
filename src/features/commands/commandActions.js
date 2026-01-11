/**
 * Command action implementations
 * @module features/commands/commandActions
 */

import { getUniverseInstance, playSoundIfEnabled, addCelestialBodies, applyCanvasEffect, addDelayedMessage, executeUniverseOperation, createRandomBodies } from './commandHelpers.js';
import { addMessage } from '../chat/messageHandler.js';

/**
 * Create a star in the universe
 * @returns {string}
 */
export function createStar() {
    return executeUniverseOperation(() => {
        const universe = getUniverseInstance();
        if (!universe) return "Universe not initialized.";

        const bodies = createRandomBodies('star', 1);
        addCelestialBodies(universe, bodies);
        playSoundIfEnabled('miracle');

        return "A new star has been created in the universe.";
    }, "createStar");
}

/**
 * Create a planet in the universe
 * @returns {string}
 */
export function createPlanet() {
    return executeUniverseOperation(() => {
        const universe = getUniverseInstance();
        if (!universe) return "Universe not initialized.";

        const bodies = createRandomBodies('planet', 1);
        addCelestialBodies(universe, bodies);
        playSoundIfEnabled('miracle');

        return "A new planet has been created in the universe.";
    }, "createPlanet");
}

/**
 * Destroy a random planet
 * @returns {string}
 */
export function destroyPlanet() {
    return executeUniverseOperation(() => {
        const universe = getUniverseInstance();
        if (!universe) return "Universe not initialized.";

        const planets = universe.celestialBodies.filter(b => b.type === 'planet');
        if (planets.length === 0) return "No planets to destroy.";

        const randomIndex = Math.floor(Math.random() * planets.length);
        universe.celestialBodies.splice(universe.celestialBodies.indexOf(planets[randomIndex]), 1);
        universe.draw();
        playSoundIfEnabled('miracle');

        return "A planet has been destroyed in the universe.";
    }, "destroyPlanet");
}

/**
 * Heal and restore the universe
 * @returns {string}
 */
export function healUniverse() {
    return executeUniverseOperation(() => {
        const universe = getUniverseInstance();
        if (!universe) return "Universe not initialized.";

        // Remove 30% of celestial bodies randomly
        universe.celestialBodies = universe.celestialBodies.filter(() => Math.random() > 0.3);

        // Add new stars and planets
        const newBodies = createRandomBodies('mixed', 10);
        addCelestialBodies(universe, newBodies);

        playSoundIfEnabled('optimize');

        return "The universe has been healed and restored.";
    }, "healUniverse");
}

/**
 * Invoke divine presence
 * @returns {string}
 */
export function invokeGodPresence() {
    return executeUniverseOperation(() => {
        invokeDivinePresence();
        return "Divine presence invoked. The universe responds with light and vibration.";
    }, "invokeGodPresence");
}

/**
 * Praise God
 * @returns {string}
 */
export function performPraiseGod() {
    return executeUniverseOperation(() => {
        praiseGod();
        return "Your praise fills the universe with joy. God is pleased.";
    }, "performPraiseGod");
}

/**
 * Invoke divine presence with visual effects
 */
function invokeDivinePresence() {
    const universe = getUniverseInstance();
    if (!universe) return;

    // Add multiple celestial bodies
    const bodies = createRandomBodies('mixed', 20);
    addCelestialBodies(universe, bodies);

    // Apply visual effects
    applyCanvasEffect('flash', 1000);

    // Add divine message
    addDelayedMessage("Oh Cosmic Birther of all radiance and vibration, soften the ground of the inner we and carve out a place where your presence can abide. Amen.", 'god', 1500);
}

/**
 * Praise God with visual effects
 */
function praiseGod() {
    const universe = getUniverseInstance();
    if (!universe) return;

    // Add golden stars
    const goldenStars = createRandomBodies('goldenStar', 5, { color: '#FFD700' });
    addCelestialBodies(universe, goldenStars);

    // Apply golden effect
    applyCanvasEffect('golden', 2000);

    // Add joyful message
    addDelayedMessage("Hallelujah! Your praise brings joy to the heavens. God smiles upon you.", 'god', 1000);
}

/**
 * Mint a saint relic NFT
 * @param {string} saintName - Name of the saint
 * @returns {string}
 */
export async function mintSaintRelic(saintName) {
    try {
        if (!window.saintManager) {
            return "Saint Manager not initialized. Please refresh the page.";
        }

        const result = await window.saintManager.mintRelic(saintName);

        if (result.success) {
            playSoundIfEnabled('miracle');
            return `✨ ${result.message}\nToken ID: ${result.relic.tokenId}\nSpiritual Power: ${result.relic.spiritualPower}`;
        } else {
            return `❌ Failed to mint relic: ${result.error}`;
        }
    } catch (error) {
        return `❌ Error minting relic: ${error.message}`;
    }
}

/**
 * Resurrect a saint
 * @param {string} saintName - Name of the saint to resurrect
 * @returns {string}
 */
export async function resurrectSaint(saintName) {
    try {
        if (!window.saintManager || !window.resurrectionEngine) {
            return "Saint systems not initialized. Please refresh the page.";
        }

        // Find the relic
        const relics = window.saintManager.getOwnedRelics();
        const relic = relics.find(r => r.saintName.toLowerCase() === saintName.toLowerCase());

        if (!relic) {
            return `❌ You don't own a relic of ${saintName}. Use /mint-relic first.`;
        }

        const result = await window.resurrectionEngine.resurrectSaint(relic.tokenId);

        if (result.success) {
            playSoundIfEnabled('miracle');
            return result.message;
        } else {
            return `❌ Resurrection failed: ${result.error}`;
        }
    } catch (error) {
        return `❌ Error during resurrection: ${error.message}`;
    }
}

/**
 * Reclassify a saint
 * @param {string} saintName - Name of the saint
 * @param {string} newClass - New classification
 * @returns {string}
 */
export async function reclassifySaint(saintName, newClass) {
    try {
        if (!window.saintManager) {
            return "Saint Manager not initialized. Please refresh the page.";
        }

        const relics = window.saintManager.getOwnedRelics();
        const relic = relics.find(r => r.saintName.toLowerCase() === saintName.toLowerCase());

        if (!relic) {
            return `❌ You don't own a relic of ${saintName}.`;
        }

        const result = await window.saintManager.reclassifySaint(relic.tokenId, newClass);

        if (result.success) {
            return `✨ ${result.message}\nNew Spiritual Power: ${result.relic.spiritualPower}`;
        } else {
            return `❌ Reclassification failed: ${result.error}`;
        }
    } catch (error) {
        return `❌ Error during reclassification: ${error.message}`;
    }
}

/**
 * View owned saint relics
 * @returns {string}
 */
export function viewSaintRelics() {
    try {
        if (!window.saintManager) {
            return "Saint Manager not initialized. Please refresh the page.";
        }

        const relics = window.saintManager.getOwnedRelics();

        if (relics.length === 0) {
            return "You don't own any saint relics yet. Use /mint-relic [saint-name] to acquire one.";
        }

        let message = `📿 Your Saint Relics (${relics.length}):\n\n`;

        relics.forEach((relic, index) => {
            message += `${index + 1}. ${relic.saintName}\n`;
            message += `   Classification: ${relic.classification}\n`;
            message += `   Status: ${relic.status}\n`;
            message += `   Spiritual Power: ${relic.spiritualPower}\n`;
            message += `   Location: ${relic.location}\n`;
            message += `   Resurrected: ${relic.isResurrected ? '✅ Yes' : '❌ No'}\n\n`;
        });

        return message;
    } catch (error) {
        return `❌ Error viewing relics: ${error.message}`;
    }
}

/**
 * View institutional debt ownership
 * @returns {string}
 */
export function viewDebtOwnership() {
    try {
        if (!window.saintManager) {
            return "Saint Manager not initialized. Please refresh the page.";
        }

        const debts = window.saintManager.getDebtRecords();
        const totalDebt = window.saintManager.getTotalDebtPurchased();
        const totalSpiritual = window.saintManager.getTotalSpiritualValue();

        let message = `💰 Institutional Debt Ownership\n\n`;
        message += `Total Debt Purchased: $${totalDebt.toLocaleString()}\n`;
        message += `Total Spiritual Value: ${totalSpiritual.toLocaleString()}\n\n`;

        debts.forEach(debt => {
            message += `🏛️ ${debt.institution}\n`;
            message += `   Amount: $${debt.debtAmount.toLocaleString()}\n`;
            message += `   Owner: ${debt.corporateOwner}\n`;
            message += `   Status: ${debt.status}\n`;
            message += `   Assets: ${debt.associatedAssets.length} items\n`;
            message += `   Spiritual Value: ${debt.spiritualValue.toLocaleString()}\n\n`;
        });

        return message;
    } catch (error) {
        return `❌ Error viewing debt ownership: ${error.message}`;
    }
}

/**
 * View ancestor lineage tree
 * @param {string} saintName - Name of the saint
 * @returns {string}
 */
export function viewAncestorTree(saintName) {
    try {
        if (!window.saintManager) {
            return "Saint Manager not initialized. Please refresh the page.";
        }

        const lineage = window.saintManager.getAncestorLineage(saintName);

        if (!lineage) {
            return `❌ Saint "${saintName}" not found in database.`;
        }

        let message = `🌳 Ancestor Lineage of ${lineage.saintName}\n\n`;
        message += `Root: ${lineage.root}\n`;
        message += `Depth: ${lineage.depth} generations\n\n`;
        message += `Lineage Path:\n`;
        lineage.lineage.forEach((ancestor, index) => {
            message += `${'  '.repeat(index)}${index > 0 ? '└─ ' : ''}${ancestor}\n`;
        });

        return message;
    } catch (error) {
        return `❌ Error viewing ancestor tree: ${error.message}`;
    }
}

/**
 * View saint statistics
 * @returns {string}
 */
export function viewSaintStats() {
    try {
        if (!window.saintManager) {
            return "Saint Manager not initialized. Please refresh the page.";
        }

        const stats = window.saintManager.getStatistics();

        let message = `📊 Saint Statistics\n\n`;
        message += `Total Saints in Database: ${stats.totalSaints}\n`;
        message += `Owned Relics: ${stats.ownedRelics}\n`;
        message += `Resurrected Saints: ${stats.resurrectedSaints}\n`;
        message += `Total Spiritual Power: ${stats.totalSpiritualPower}\n\n`;

        message += `By Location:\n`;
        message += `  Vatican: ${stats.byLocation.VATICAN}\n`;
        message += `  Catholic Church: ${stats.byLocation.CATHOLIC_CHURCH}\n`;
        message += `  Haiti: ${stats.byLocation.HAITI}\n\n`;

        message += `By Classification:\n`;
        message += `  Martyrs: ${stats.byClassification.MARTYR}\n`;
        message += `  Healers: ${stats.byClassification.HEALER}\n`;
        message += `  Prophets: ${stats.byClassification.PROPHET}\n`;
        message += `  Teachers: ${stats.byClassification.TEACHER}\n`;
        message += `  Mystics: ${stats.byClassification.MYSTIC}\n`;
        message += `  Warriors: ${stats.byClassification.WARRIOR}\n`;
        message += `  Builders: ${stats.byClassification.BUILDER}\n`;

        if (window.resurrectionEngine) {
            const energy = window.resurrectionEngine.getSpiritualEnergy();
            message += `\n⚡ Spiritual Energy: ${energy}`;
        }

        return message;
    } catch (error) {
        return `❌ Error viewing statistics: ${error.message}`;
    }
}

/**
 * List all available saints
 * @returns {string}
 */
export function listAllSaints() {
    try {
        if (!window.saintManager) {
            return "Saint Manager not initialized. Please refresh the page.";
        }

        const saints = window.saintManager.getAllSaints();

        let message = `📜 Available Saints (${saints.length}):\n\n`;

        saints.forEach((saint, index) => {
            message += `${index + 1}. ${saint.name}\n`;
            message += `   Classification: ${saint.classification}\n`;
            message += `   Location: ${saint.location}\n`;
            message += `   Period: ${saint.historicalPeriod}\n`;
            message += `   Spiritual Power: ${saint.spiritualPower}\n\n`;
        });

        return message;
    } catch (error) {
        return `❌ Error listing saints: ${error.message}`;
    }
}
