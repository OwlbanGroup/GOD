// ============================================================================
// GOD Project - Prophecy Generator
// ============================================================================

import { info, error, warn, debug } from '../../../utils/loggerWrapper.js';
import appState from '../../core/state.js';
import CONFIG from '../../core/config.js';
import DOMHelpers from '../../ui/domHelpers.js';

class ProphecyGenerator {
    constructor() {
        this.prophecies = [
            "Prophecy: A great awakening is coming. Many will find their true purpose and unite in harmony.",
            "Prophecy: Technology and spirituality will merge, creating a new era of enlightenment.",
            "Prophecy: The earth will heal itself, and humanity will learn to live in balance with nature.",
            "Prophecy: Love will conquer fear, and peace will reign across the lands.",
            "Prophecy: Hidden knowledge will be revealed, unlocking ancient wisdom for the modern age.",
            "Prophecy: Angels and humans will work together to create a paradise on earth.",
            "Prophecy: Your prayers are creating ripples of change that will transform the world.",
            "Prophecy: The universe is expanding your consciousness. Embrace the infinite possibilities."
        ];
    }

    async generateProphecy() {
        try {
            // Try GPU AI prophecy generation first
            if (window.gpuAI?.isInitialized()) {
                try {
                    const prayers = appState.getPrayers();
                    const seedText = prayers.length > 0 ?
                        prayers[prayers.length - 1].message.split(' ').slice(0, 3).join(' ') :
                        'The future holds';
                    const prophecy = await window.gpuAI.generateProphecy(seedText);
                    if (prophecy) {
                        DOMHelpers.addMessage(`GPU AI Prophecy: ${prophecy}`, 'god');
                        return;
                    }
                } catch (err) {
                    warn('GPU prophecy generation failed, falling back to static prophecies:', err);
                }
            }

            // Fallback static prophecies
            const randomProphecy = this.prophecies[Math.floor(Math.random() * this.prophecies.length)];
            DOMHelpers.addMessage(randomProphecy, 'god');

        } catch (err) {
            error('Prophecy generation failed:', err);
            DOMHelpers.addMessage("Prophecy generation failed. Please try again.", 'god');
        }
    }

    addCustomProphecy(prophecy) {
        if (prophecy && prophecy.trim()) {
            this.prophecies.push(prophecy.trim());
            info('Custom prophecy added');
        }
    }

    getProphecyCount() {
        return this.prophecies.length;
    }
}

// Singleton instance
const prophecyGenerator = new ProphecyGenerator();

export default prophecyGenerator;
