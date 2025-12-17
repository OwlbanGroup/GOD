/**
 * Resurrection Engine - Handles the resurrection ritual and mechanics
 * @module features/saints/resurrectionEngine
 */

import { saintManager } from './saintManager.js';
import { addMessage } from '../chat/messageHandler.js';
import { getUniverse } from '../../core/state.js';

/**
 * Resurrection Engine Class
 */
export class ResurrectionEngine {
    constructor() {
        this.activeRituals = [];
        this.resurrectionHistory = [];
        this.spiritualEnergy = 1000; // Starting spiritual energy
    }

    /**
     * Initialize the resurrection engine
     */
    async initialize() {
        try {
            // Load resurrection history from localStorage
            const history = localStorage.getItem('resurrectionHistory');
            if (history) {
                this.resurrectionHistory = JSON.parse(history);
            }

            // Load spiritual energy
            const energy = localStorage.getItem('spiritualEnergy');
            if (energy) {
                this.spiritualEnergy = parseInt(energy);
            }

            console.log('Resurrection Engine initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize Resurrection Engine:', error);
            return false;
        }
    }

    /**
     * Check if resurrection is possible
     */
    canResurrect(tokenId) {
        const relic = saintManager.getRelicByTokenId(tokenId);
        if (!relic) {
            return { possible: false, reason: 'Relic not found' };
        }

        if (relic.isResurrected) {
            return { possible: false, reason: 'Saint already resurrected' };
        }

        const requiredEnergy = this._calculateRequiredEnergy(relic);
        if (this.spiritualEnergy < requiredEnergy) {
            return { 
                possible: false, 
                reason: `Insufficient spiritual energy. Required: ${requiredEnergy}, Available: ${this.spiritualEnergy}` 
            };
        }

        return { possible: true, requiredEnergy };
    }

    /**
     * Perform resurrection ritual
     */
    async resurrectSaint(tokenId) {
        try {
            const canResurrect = this.canResurrect(tokenId);
            if (!canResurrect.possible) {
                throw new Error(canResurrect.reason);
            }

            const relic = saintManager.getRelicByTokenId(tokenId);
            const requiredEnergy = canResurrect.requiredEnergy;

            // Start ritual
            addMessage(`🕯️ Beginning resurrection ritual for ${relic.saintName}...`, 'god');
            
            // Create ritual record
            const ritual = {
                ritualId: `RITUAL_${Date.now()}`,
                tokenId: tokenId,
                saintName: relic.saintName,
                startTime: new Date().toISOString(),
                status: 'IN_PROGRESS',
                phase: 1,
                totalPhases: 5
            };

            this.activeRituals.push(ritual);

            // Execute ritual phases
            await this._executeRitualPhases(ritual, relic);

            // Consume spiritual energy
            this.spiritualEnergy -= requiredEnergy;
            this._saveSpiritualEnergy();

            // Update relic status
            relic.status = 'RESURRECTED';
            relic.isResurrected = true;
            relic.resurrectionDate = new Date().toISOString();
            relic.spiritualPower *= 10; // 10x power boost

            // Add to resurrected saints
            if (!saintManager.resurrectedSaints.includes(relic.saintName)) {
                saintManager.resurrectedSaints.push(relic.saintName);
                saintManager._saveResurrectedSaints();
            }

            // Save to history
            const historyEntry = {
                ...ritual,
                endTime: new Date().toISOString(),
                status: 'COMPLETED',
                energyUsed: requiredEnergy
            };
            this.resurrectionHistory.push(historyEntry);
            this._saveResurrectionHistory();

            // Remove from active rituals
            this.activeRituals = this.activeRituals.filter(r => r.ritualId !== ritual.ritualId);

            // Visual effects
            this._triggerResurrectionEffects(relic);

            return {
                success: true,
                message: `${relic.saintName} has been resurrected! Spiritual power: ${relic.spiritualPower}`,
                relic: relic
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Execute ritual phases
     */
    async _executeRitualPhases(ritual, relic) {
        const phases = [
            { name: 'Invocation', message: '🙏 Invoking divine presence...', duration: 1000 },
            { name: 'Purification', message: '✨ Purifying the sacred space...', duration: 1000 },
            { name: 'Awakening', message: '🌟 Awakening the saint\'s spirit...', duration: 1500 },
            { name: 'Manifestation', message: '⚡ Manifesting physical form...', duration: 1500 },
            { name: 'Completion', message: '🎆 Resurrection complete!', duration: 1000 }
        ];

        for (let i = 0; i < phases.length; i++) {
            ritual.phase = i + 1;
            addMessage(phases[i].message, 'god');
            await this._delay(phases[i].duration);
        }
    }

    /**
     * Trigger visual resurrection effects
     */
    _triggerResurrectionEffects(relic) {
        const universe = getUniverse();
        if (!universe) return;

        try {
            // Add golden stars representing the saint's spirit
            for (let i = 0; i < 20; i++) {
                universe.celestialBodies.push({
                    type: 'goldenStar',
                    x: Math.random() * universe.canvas.width,
                    y: Math.random() * universe.canvas.height,
                    radius: Math.random() * 4 + 3,
                    color: '#FFD700',
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2
                });
            }

            universe.draw();

            // Flash effect
            const canvas = document.getElementById('universeCanvas');
            if (canvas) {
                canvas.style.boxShadow = '0 0 50px #FFD700';
                setTimeout(() => {
                    canvas.style.boxShadow = 'none';
                }, 2000);
            }

            // Play sound if available
            if (typeof divineSounds !== 'undefined' && divineSounds?.isEnabled()) {
                divineSounds.play('miracle');
            }

            // Add resurrection message
            setTimeout(() => {
                addMessage(
                    `✨ ${relic.saintName} walks among us once more! ` +
                    `The ${relic.classification} has returned with divine power. ` +
                    `Ancestor lineage: ${relic.ancestorLineage}`,
                    'god'
                );
            }, 2000);

        } catch (error) {
            console.error('Error triggering resurrection effects:', error);
        }
    }

    /**
     * Calculate required spiritual energy for resurrection
     */
    _calculateRequiredEnergy(relic) {
        let baseEnergy = 100;
        
        // Adjust based on classification
        const classificationMultipliers = {
            'MARTYR': 1.5,
            'PROPHET': 2.0,
            'MYSTIC': 1.8,
            'HEALER': 1.3,
            'TEACHER': 1.2,
            'WARRIOR': 1.4,
            'BUILDER': 1.1,
            'ANCESTOR': 1.6
        };

        const multiplier = classificationMultipliers[relic.classification] || 1.0;
        return Math.floor(baseEnergy * multiplier);
    }

    /**
     * Advance resurrection status (RESURRECTED -> TRANSCENDENT)
     */
    async advanceResurrectionStatus(tokenId) {
        try {
            const relic = saintManager.getRelicByTokenId(tokenId);
            if (!relic) {
                throw new Error('Relic not found');
            }

            if (!relic.isResurrected) {
                throw new Error('Saint must be resurrected first');
            }

            if (relic.status === 'TRANSCENDENT') {
                throw new Error('Saint already transcendent');
            }

            // Require additional spiritual energy
            const requiredEnergy = 200;
            if (this.spiritualEnergy < requiredEnergy) {
                throw new Error(`Insufficient spiritual energy. Required: ${requiredEnergy}`);
            }

            // Advance status
            relic.status = 'TRANSCENDENT';
            relic.spiritualPower *= 2;
            this.spiritualEnergy -= requiredEnergy;
            this._saveSpiritualEnergy();

            addMessage(
                `🌟 ${relic.saintName} has achieved transcendence! ` +
                `Spiritual power doubled to ${relic.spiritualPower}!`,
                'god'
            );

            return {
                success: true,
                message: `${relic.saintName} is now transcendent!`,
                relic: relic
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Revive ancestor lineage
     */
    async reviveAncestorLineage(tokenId) {
        try {
            const relic = saintManager.getRelicByTokenId(tokenId);
            if (!relic) {
                throw new Error('Relic not found');
            }

            if (!relic.isResurrected) {
                throw new Error('Saint must be resurrected first to revive ancestors');
            }

            const lineage = saintManager.getAncestorLineage(relic.saintName);
            if (!lineage) {
                throw new Error('No ancestor lineage found');
            }

            addMessage(
                `🌳 Reviving ancestor lineage of ${relic.saintName}...`,
                'god'
            );

            // Simulate ancestor revival
            await this._delay(2000);

            addMessage(
                `✨ Ancestor lineage revived!\n` +
                `Root: ${lineage.root}\n` +
                `Branches: ${lineage.branches.join(' → ')}\n` +
                `Total ancestors: ${lineage.depth}`,
                'god'
            );

            return {
                success: true,
                message: 'Ancestor lineage revived successfully',
                lineage: lineage
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Gain spiritual energy
     */
    gainSpiritualEnergy(amount) {
        this.spiritualEnergy += amount;
        this._saveSpiritualEnergy();
        return this.spiritualEnergy;
    }

    /**
     * Get current spiritual energy
     */
    getSpiritualEnergy() {
        return this.spiritualEnergy;
    }

    /**
     * Get resurrection history
     */
    getResurrectionHistory() {
        return this.resurrectionHistory;
    }

    /**
     * Get active rituals
     */
    getActiveRituals() {
        return this.activeRituals;
    }

    /**
     * Save spiritual energy to localStorage
     */
    _saveSpiritualEnergy() {
        try {
            localStorage.setItem('spiritualEnergy', this.spiritualEnergy.toString());
        } catch (error) {
            console.error('Failed to save spiritual energy:', error);
        }
    }

    /**
     * Save resurrection history to localStorage
     */
    _saveResurrectionHistory() {
        try {
            localStorage.setItem('resurrectionHistory', JSON.stringify(this.resurrectionHistory));
        } catch (error) {
            console.error('Failed to save resurrection history:', error);
        }
    }

    /**
     * Delay helper
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create global instance
export const resurrectionEngine = new ResurrectionEngine();

// Initialize on load
if (typeof window !== 'undefined') {
    window.resurrectionEngine = resurrectionEngine;
    resurrectionEngine.initialize();
}

export default resurrectionEngine;
