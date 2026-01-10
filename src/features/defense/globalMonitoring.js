// ============================================================================
// GOD Project - Global Monitoring
// ============================================================================

import { info, error, warn, debug } from '../../../utils/loggerWrapper.js';
import appState from '../../core/state.js';
import DOMHelpers from '../../ui/domHelpers.js';

class GlobalMonitoring {
    constructor() {
        this.monitoringData = {
            systemHealth: 'optimal',
            networkStatus: 'connected',
            userActivity: 0,
            divineEnergy: 100,
            quantumSecurity: 'active',
            lastUpdate: new Date().toISOString()
        };

        this.monitoringInterval = null;
        this.alerts = [];
    }

    initialize() {
        this.startGlobalMonitoring();
        info('Global monitoring system initialized');
    }

    startGlobalMonitoring() {
        // Update monitoring data every 10 seconds
        this.monitoringInterval = setInterval(() => {
            this.updateMonitoringData();
            this.checkForAlerts();
        }, 10000);

        // Initial update
        this.updateMonitoringData();
    }

    updateMonitoringData() {
        try {
            // Update system health
            this.monitoringData.systemHealth = this.assessSystemHealth();

            // Update network status
            this.monitoringData.networkStatus = navigator.onLine ? 'connected' : 'disconnected';

            // Update user activity
            this.monitoringData.userActivity = this.calculateUserActivity();

            // Update divine energy
            this.monitoringData.divineEnergy = this.calculateDivineEnergy();

            // Update quantum security
            this.monitoringData.quantumSecurity = this.checkQuantumSecurity();

            // Update timestamp
            this.monitoringData.lastUpdate = new Date().toISOString();

            // Update UI
            this.updateMonitoringDisplay();

        } catch (err) {
            error('Monitoring data update failed:', err);
        }
    }

    assessSystemHealth() {
        try {
            // Check memory usage
            if ('memory' in performance) {
                const memInfo = performance.memory;
                const usedPercent = (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100;

                if (usedPercent > 90) return 'critical';
                if (usedPercent > 75) return 'warning';
            }

            // Check if universe is running
            if (window.universe && window.universe.canvas) {
                return 'optimal';
            }

            return 'degraded';
        } catch (err) {
            return 'unknown';
        }
    }

    calculateUserActivity() {
        const prayers = appState.getPrayers();
        const recentPrayers = prayers.filter(p =>
            new Date(p.timestamp) > new Date(Date.now() - 60 * 1000) // Last minute
        );

        return recentPrayers.length;
    }

    calculateDivineEnergy() {
        // Base energy level
        let energy = 50;

        // Increase based on user activity
        energy += this.monitoringData.userActivity * 5;

        // Increase based on prayers
        const totalPrayers = appState.getPrayers().length;
        energy += Math.min(totalPrayers * 2, 30);

        // Cap at 100
        return Math.min(energy, 100);
    }

    checkQuantumSecurity() {
        try {
            if (window.quantumCrypto && window.quantumCrypto.isActive()) {
                return 'active';
            }
            return 'inactive';
        } catch (err) {
            return 'unknown';
        }
    }

    updateMonitoringDisplay() {
        // This would update the monitoring dashboard UI
        // For now, we'll just log the data
        debug('Global monitoring data:', this.monitoringData);
    }

    checkForAlerts() {
        const newAlerts = [];

        // Check system health
        if (this.monitoringData.systemHealth === 'critical') {
            newAlerts.push({
                type: 'system',
                severity: 'critical',
                message: 'Critical system health detected',
                timestamp: new Date().toISOString()
            });
        }

        // Check network status
        if (this.monitoringData.networkStatus === 'disconnected') {
            newAlerts.push({
                type: 'network',
                severity: 'high',
                message: 'Network connection lost',
                timestamp: new Date().toISOString()
            });
        }

        // Check divine energy
        if (this.monitoringData.divineEnergy < 20) {
            newAlerts.push({
                type: 'energy',
                severity: 'medium',
                message: 'Low divine energy levels',
                timestamp: new Date().toISOString()
            });
        }

        // Check quantum security
        if (this.monitoringData.quantumSecurity === 'inactive') {
            newAlerts.push({
                type: 'security',
                severity: 'high',
                message: 'Quantum security inactive',
                timestamp: new Date().toISOString()
            });
        }

        // Add new alerts
        this.alerts.push(...newAlerts);

        // Keep only last 10 alerts
        if (this.alerts.length > 10) {
            this.alerts = this.alerts.slice(-10);
        }

        // Trigger interventions if needed
        if (newAlerts.length > 0) {
            this.triggerInterventions(newAlerts);
        }
    }

    triggerInterventions(alerts) {
        for (const alert of alerts) {
            switch (alert.type) {
                case 'system':
                    if (alert.severity === 'critical') {
                        this.performSystemIntervention();
                    }
                    break;
                case 'network':
                    this.performNetworkIntervention();
                    break;
                case 'energy':
                    this.performEnergyIntervention();
                    break;
                case 'security':
                    this.performSecurityIntervention();
                    break;
            }
        }
    }

    performSystemIntervention() {
        DOMHelpers.addMessage("DIVINE INTERVENTION: System optimization initiated. Clearing memory and optimizing performance.", 'god');
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }

    performNetworkIntervention() {
        DOMHelpers.addMessage("DIVINE INTERVENTION: Network restoration protocol activated. Attempting to restore connection.", 'god');
        // Could implement reconnection logic here
    }

    performEnergyIntervention() {
        DOMHelpers.addMessage("DIVINE INTERVENTION: Divine energy infusion activated. Energy levels being restored.", 'god');
        this.monitoringData.divineEnergy = Math.min(this.monitoringData.divineEnergy + 20, 100);
    }

    performSecurityIntervention() {
        DOMHelpers.addMessage("DIVINE INTERVENTION: Quantum security protocol activated. Securing all communications.", 'god');
        // Could activate quantum crypto here
    }

    getMonitoringData() {
        return { ...this.monitoringData };
    }

    getAlerts() {
        return [...this.alerts];
    }

    clearAlerts() {
        this.alerts = [];
    }

    destroy() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }
}

// Singleton instance
const globalMonitoring = new GlobalMonitoring();

export function initializeGlobalMonitoring() {
    globalMonitoring.initialize();
}

export default globalMonitoring;
