// ============================================================================
// GOD Project - Threat Prediction
// ============================================================================

import { info, error, warn, debug } from '../../../utils/loggerWrapper.js';
import appState from '../../core/state.js';
import DOMHelpers from '../../ui/domHelpers.js';

class ThreatPrediction {
    constructor() {
        this.threatLevels = {
            low: { level: 'Low', color: '#4CAF50', description: 'System secure' },
            medium: { level: 'Medium', color: '#FF9800', description: 'Minor threats detected' },
            high: { level: 'High', color: '#FF5722', description: 'Significant threats present' },
            critical: { level: 'Critical', color: '#F44336', description: 'Immediate intervention required' }
        };

        this.currentThreatLevel = 'low';
        this.threats = [];
        this.monitoringInterval = null;
    }

    initialize() {
        this.startMonitoring();
        info('Threat prediction system initialized');
    }

    startMonitoring() {
        // Monitor every 30 seconds
        this.monitoringInterval = setInterval(() => {
            this.analyzeThreats();
        }, 30000);

        // Initial analysis
        this.analyzeThreats();
    }

    async analyzeThreats() {
        try {
            const threats = [];

            // Check system resources
            const resourceThreat = await this.checkSystemResources();
            if (resourceThreat) threats.push(resourceThreat);

            // Check user activity patterns
            const activityThreat = this.checkUserActivity();
            if (activityThreat) threats.push(activityThreat);

            // Check for malicious patterns
            const patternThreat = this.checkMaliciousPatterns();
            if (patternThreat) threats.push(patternThreat);

            // Check external threats (simulated)
            const externalThreat = await this.checkExternalThreats();
            if (externalThreat) threats.push(externalThreat);

            // Update threat level
            this.updateThreatLevel(threats);

            // Store threats
            this.threats = threats;

            // Update UI
            this.updateThreatDisplay();

        } catch (err) {
            error('Threat analysis failed:', err);
        }
    }

    async checkSystemResources() {
        try {
            if ('memory' in performance) {
                const memInfo = performance.memory;
                const usedPercent = (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100;

                if (usedPercent > 90) {
                    return {
                        type: 'resource',
                        severity: 'high',
                        message: `High memory usage: ${usedPercent.toFixed(1)}%`,
                        timestamp: new Date().toISOString()
                    };
                } else if (usedPercent > 75) {
                    return {
                        type: 'resource',
                        severity: 'medium',
                        message: `Elevated memory usage: ${usedPercent.toFixed(1)}%`,
                        timestamp: new Date().toISOString()
                    };
                }
            }
        } catch (err) {
            warn('Memory check failed:', err);
        }
        return null;
    }

    checkUserActivity() {
        const prayers = appState.getPrayers();
        const recentPrayers = prayers.filter(p =>
            new Date(p.timestamp) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        );

        if (recentPrayers.length > 10) {
            return {
                type: 'activity',
                severity: 'medium',
                message: `High prayer frequency: ${recentPrayers.length} prayers in 5 minutes`,
                timestamp: new Date().toISOString()
            };
        }

        return null;
    }

    checkMaliciousPatterns() {
        const messages = appState.getPrayers().map(p => p.message.toLowerCase());

        // Check for suspicious keywords
        const suspiciousKeywords = ['hack', 'exploit', 'attack', 'malware', 'virus', 'trojan'];
        const suspiciousCount = messages.filter(msg =>
            suspiciousKeywords.some(keyword => msg.includes(keyword))
        ).length;

        if (suspiciousCount > 0) {
            return {
                type: 'pattern',
                severity: 'high',
                message: `Suspicious keywords detected in ${suspiciousCount} messages`,
                timestamp: new Date().toISOString()
            };
        }

        return null;
    }

    async checkExternalThreats() {
        // Simulate external threat checking
        try {
            // Check if quantum crypto is active
            if (window.quantumCrypto && window.quantumCrypto.isActive()) {
                return null; // Secure
            } else {
                return {
                    type: 'external',
                    severity: 'medium',
                    message: 'Quantum encryption not active - potential vulnerability',
                    timestamp: new Date().toISOString()
                };
            }
        } catch (err) {
            warn('External threat check failed:', err);
        }

        return null;
    }

    updateThreatLevel(threats) {
        let maxSeverity = 'low';

        for (const threat of threats) {
            const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
            if (severityOrder[threat.severity] > severityOrder[maxSeverity]) {
                maxSeverity = threat.severity;
            }
        }

        this.currentThreatLevel = maxSeverity;
    }

    updateThreatDisplay() {
        const threatLevelElement = DOMHelpers.getElement('threatLevelValue');
        const systemStatusElement = DOMHelpers.getElement('systemStatusValue');

        if (threatLevelElement) {
            threatLevelElement.textContent = this.threatLevels[this.currentThreatLevel].level;
            threatLevelElement.style.color = this.threatLevels[this.currentThreatLevel].color;
        }

        if (systemStatusElement) {
            systemStatusElement.textContent = this.threatLevels[this.currentThreatLevel].description;
        }

        // Show monitoring dashboard if threats exist
        const dashboard = DOMHelpers.getElement('monitoringDashboard');
        if (dashboard) {
            if (this.threats.length > 0) {
                dashboard.classList.remove('hidden');
            } else {
                dashboard.classList.add('hidden');
            }
        }
    }

    getCurrentThreatLevel() {
        return this.currentThreatLevel;
    }

    getThreats() {
        return this.threats;
    }

    clearThreats() {
        this.threats = [];
        this.currentThreatLevel = 'low';
        this.updateThreatDisplay();
    }

    destroy() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }
}

// Singleton instance
const threatPrediction = new ThreatPrediction();

export function initializeThreatPrediction() {
    threatPrediction.initialize();
}

export default threatPrediction;
