// ============================================================================
// GOD Project - Prayer Analysis
// ============================================================================

import { info, error, warn, debug } from '../../../utils/loggerWrapper.js';
import appState from '../../core/state.js';
import CONFIG from '../../core/config.js';
import DOMHelpers from '../../ui/domHelpers.js';

class PrayerAnalysis {
    constructor() {
        this.analysisCache = new Map();
    }

    async analyzePrayers() {
        try {
            const prayers = appState.getPrayers();

            if (prayers.length === 0) {
                DOMHelpers.addMessage("AI Analysis: No prayers to analyze yet. Start praying to receive insights.", 'god');
                return;
            }

            let analysisMessage = '';

            // Try GPU AI first
            if (window.gpuAI?.isInitialized()) {
                try {
                    const latestPrayer = prayers[prayers.length - 1].message;
                    const analysis = await window.gpuAI.analyzePrayer(latestPrayer);
                    if (analysis) {
                        const themesText = analysis.themes.length > 0 ? ` Themes: ${analysis.themes.join(', ')}.` : '';
                        const sentimentText = analysis.sentiment === 'positive' ? 'Your prayer radiates positivity.' : 'Your prayer seeks guidance.';
                        analysisMessage = `GPU AI Analysis: ${sentimentText}${themesText} Confidence: ${(analysis.confidence * 100).toFixed(1)}%`;
                    }
                } catch (err) {
                    warn('GPU prayer analysis failed, falling back to static analysis:', err);
                }
            }

            // Fallback static analysis
            if (!analysisMessage) {
                const totalPrayers = prayers.length;
                const recentPrayers = prayers.filter(p => new Date(p.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
                const themes = prayers.map(p => p.message.toLowerCase()).join(' ');
                const commonWords = ['god', 'help', 'thank', 'love', 'peace', 'forgive', 'bless'];
                const themeCounts = commonWords.map(word => ({
                    word,
                    count: (themes.match(new RegExp(word, 'g')) || []).length
                }));

                analysisMessage = `AI Analysis: You've sent ${totalPrayers} prayers (${recentPrayers} in the last week). Common themes: ${themeCounts.filter(t => t.count > 0).map(t => `${t.word} (${t.count})`).join(', ')}. Your faith is growing stronger.`;
            }

            DOMHelpers.addMessage(analysisMessage, 'god');

        } catch (err) {
            error('Prayer analysis failed:', err);
            DOMHelpers.addMessage("Analysis failed. Please try again.", 'god');
        }
    }

    async optimizeUniverse() {
        try {
            const universe = window.universe;
            if (!universe) {
                DOMHelpers.addMessage("Universe not available for optimization.", 'god');
                return;
            }

            const success = await this.tryGpuOptimization();
            if (!success) {
                this.applyStaticOptimization();
            }

        } catch (err) {
            error('Universe optimization failed:', err);
            DOMHelpers.addMessage("Optimization failed. Please try again.", 'god');
        }
    }

    async tryGpuOptimization() {
        if (!window.gpuAI?.isInitialized()) return false;

        try {
            const universe = window.universe;
            const currentStats = this.getCurrentUniverseStats();
            const optimized = await window.gpuAI.optimizeUniverse(currentStats);

            if (optimized) {
                this.applyGpuOptimization(optimized);
                return true;
            }
        } catch (err) {
            warn('GPU universe optimization failed:', err);
        }

        return false;
    }

    applyGpuOptimization(optimized) {
        const universe = window.universe;
        if (!universe) return;

        universe.clear();

        for (let i = 0; i < optimized.stars; i++) {
            universe.addParticle(
                Math.random() * universe.canvas.width,
                Math.random() * universe.canvas.height,
                'star'
            );
        }

        for (let i = 0; i < optimized.planets; i++) {
            universe.addParticle(
                Math.random() * universe.canvas.width,
                Math.random() * universe.canvas.height,
                'planet'
            );
        }

        DOMHelpers.addMessage(`GPU AI Optimization: Universe optimized for divine harmony. Stars: ${optimized.stars}, Planets: ${optimized.planets}, Galaxies: ${optimized.galaxies}`, 'god');
    }

    applyStaticOptimization() {
        const universe = window.universe;
        if (!universe) return;

        const celestialBodies = universe.celestialBodies || [];
        const stars = celestialBodies.filter(b => b.type === 'star').length;
        const planets = celestialBodies.filter(b => b.type === 'planet').length;

        if (stars < 10) {
            for (let i = 0; i < 10 - stars; i++) {
                universe.addStar(
                    Math.random() * universe.canvas.width,
                    Math.random() * universe.canvas.height
                );
            }
        }

        if (planets < 5) {
            for (let i = 0; i < 5 - planets; i++) {
                universe.addPlanet(
                    Math.random() * universe.canvas.width,
                    Math.random() * universe.canvas.height
                );
            }
        }

        universe.draw();
        DOMHelpers.addMessage(`AI Optimization: Universe balanced with optimal celestial harmony. Stars: ${celestialBodies.filter(b => b.type === 'star').length}, Planets: ${celestialBodies.filter(b => b.type === 'planet').length}`, 'god');
    }

    getCurrentUniverseStats() {
        const universe = window.universe;
        if (!universe) return { stars: 0, planets: 0, galaxies: 0 };

        return {
            stars: universe.particles ?
                universe.particles.filter(p => p.type === 'star').length :
                universe.celestialBodies.filter(b => b.type === 'star').length,
            planets: universe.particles ?
                universe.particles.filter(p => p.type === 'planet').length :
                universe.celestialBodies.filter(b => b.type === 'planet').length,
            galaxies: 1 // Simplified
        };
    }

    clearCache() {
        this.analysisCache.clear();
    }
}

// Singleton instance
const prayerAnalysis = new PrayerAnalysis();

export function initializeAI() {
    info('AI prayer analysis initialized');
}

export default prayerAnalysis;
