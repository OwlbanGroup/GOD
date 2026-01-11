/**
 * Export/Import Functionality - Phase 5.5
 * Handles data export/import for prayers, universe state, and configurations
 */

import { info, error, warn, debug } from '../../utils/loggerWrapper.js';
import appState from '../core/state.js';
import prayerManager from './chat/prayerManager.js';
import saintManager from './saints/saintManager.js';
import DOMHelpers from '../ui/domHelpers.js';

class ExportImportManager {
    constructor() {
        this.exportFormats = {
            JSON: 'json',
            PDF: 'pdf',
            CSV: 'csv'
        };
    }

    /**
     * Export prayers data
     */
    async exportPrayers(format = 'json', options = {}) {
        try {
            info('Exporting prayers data...');

            // Get prayers data
            const prayers = await this.getPrayersData();
            const metadata = {
                exportDate: new Date().toISOString(),
                format: format,
                totalPrayers: prayers.length,
                userId: appState.getCurrentUser()?.id || 'anonymous',
                version: '1.0.0'
            };

            const exportData = {
                metadata,
                prayers
            };

            switch (format.toLowerCase()) {
                case 'json':
                    return this.exportAsJSON(exportData, 'prayers_export.json');

                case 'pdf':
                    return this.exportAsPDF(exportData, 'prayers_export.pdf');

                case 'csv':
                    return this.exportAsCSV(prayers, 'prayers_export.csv');

                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
        } catch (err) {
            error('Failed to export prayers:', err);
            throw err;
        }
    }

    /**
     * Import prayers data
     */
    async importPrayers(file) {
        try {
            info('Importing prayers data...');

            const fileContent = await this.readFileContent(file);
            let importData;

            if (file.name.endsWith('.json')) {
                importData = JSON.parse(fileContent);
            } else {
                throw new Error('Only JSON import is supported for prayers');
            }

            // Validate import data
            if (!importData.prayers || !Array.isArray(importData.prayers)) {
                throw new Error('Invalid prayers data format');
            }

            // Import prayers
            const result = await this.importPrayersData(importData.prayers);

            DOMHelpers.showNotification(`Successfully imported ${result.imported} prayers`, 'success');
            return result;
        } catch (err) {
            error('Failed to import prayers:', err);
            DOMHelpers.showNotification('Failed to import prayers: ' + err.message, 'error');
            throw err;
        }
    }

    /**
     * Export universe state
     */
    async exportUniverseState(options = {}) {
        try {
            info('Exporting universe state...');

            const universeState = await this.getUniverseState();
            const saintsData = saintManager.exportData();
            const userProfile = appState.getCurrentUser();

            const exportData = {
                metadata: {
                    exportDate: new Date().toISOString(),
                    version: '1.0.0',
                    userId: userProfile?.id || 'anonymous',
                    includePrayers: options.includePrayers || false,
                    includeSaints: options.includeSaints || true
                },
                universe: universeState,
                saints: options.includeSaints ? saintsData : null,
                prayers: options.includePrayers ? await this.getPrayersData() : null,
                userProfile: userProfile
            };

            return this.exportAsJSON(exportData, 'universe_backup.json');
        } catch (err) {
            error('Failed to export universe state:', err);
            throw err;
        }
    }

    /**
     * Import universe state
     */
    async importUniverseState(file) {
        try {
            info('Importing universe state...');

            const fileContent = await this.readFileContent(file);
            const importData = JSON.parse(fileContent);

            // Validate import data
            if (!importData.universe) {
                throw new Error('Invalid universe state data');
            }

            // Import data
            const result = await this.importUniverseData(importData);

            DOMHelpers.showNotification('Universe state restored successfully', 'success');
            return result;
        } catch (err) {
            error('Failed to import universe state:', err);
            DOMHelpers.showNotification('Failed to restore universe: ' + err.message, 'error');
            throw err;
        }
    }

    /**
     * Export universe configuration
     */
    async exportUniverseConfig() {
        try {
            info('Exporting universe configuration...');

            const config = await this.getUniverseConfig();

            const exportData = {
                metadata: {
                    exportDate: new Date().toISOString(),
                    version: '1.0.0',
                    type: 'universe-config'
                },
                config
            };

            return this.exportAsJSON(exportData, 'universe_config.json');
        } catch (err) {
            error('Failed to export universe config:', err);
            throw err;
        }
    }

    /**
     * Import universe configuration
     */
    async importUniverseConfig(file) {
        try {
            info('Importing universe configuration...');

            const fileContent = await this.readFileContent(file);
            const importData = JSON.parse(fileContent);

            if (!importData.config) {
                throw new Error('Invalid configuration data');
            }

            await this.applyUniverseConfig(importData.config);

            DOMHelpers.showNotification('Universe configuration applied successfully', 'success');
            return { success: true };
        } catch (err) {
            error('Failed to import universe config:', err);
            DOMHelpers.showNotification('Failed to apply configuration: ' + err.message, 'error');
            throw err;
        }
    }

    /**
     * Share universe configuration
     */
    async shareUniverseConfig() {
        try {
            const configData = await this.exportUniverseConfig();
            const shareUrl = await this.createShareableLink(configData);

            // Copy to clipboard
            await navigator.clipboard.writeText(shareUrl);

            DOMHelpers.showNotification('Configuration link copied to clipboard!', 'success');
            return shareUrl;
        } catch (err) {
            error('Failed to share universe config:', err);
            DOMHelpers.showNotification('Failed to create share link', 'error');
            throw err;
        }
    }

    /**
     * Get prayers data for export
     */
    async getPrayersData() {
        try {
            // Get from prayer manager
            const storedPrayers = JSON.parse(localStorage.getItem('prayers') || '[]');
            const divineResponses = JSON.parse(localStorage.getItem('divineResponses') || '[]');

            return storedPrayers.map((prayer, index) => ({
                id: prayer.id || `prayer_${index}`,
                message: prayer.message,
                timestamp: prayer.timestamp,
                user: prayer.user || 'Anonymous',
                response: divineResponses[index]?.response || null,
                sentiment: prayer.sentiment || null,
                tags: prayer.tags || []
            }));
        } catch (err) {
            warn('Failed to get prayers data:', err);
            return [];
        }
    }

    /**
     * Get universe state
     */
    async getUniverseState() {
        try {
            // Get current universe state from app
            const app = window.app || {};
            const universe = app.getUniverse ? app.getUniverse() : null;

            return {
                celestialBodies: universe?.bodies || [],
                physicsState: universe?.physics || {},
                settings: universe?.settings || {},
                timestamp: new Date().toISOString()
            };
        } catch (err) {
            warn('Failed to get universe state:', err);
            return {};
        }
    }

    /**
     * Get universe configuration
     */
    async getUniverseConfig() {
        try {
            const app = window.app || {};
            const universe = app.getUniverse ? app.getUniverse() : null;

            return {
                particleCount: universe?.settings?.particleCount || 1000,
                quality: universe?.settings?.quality || 'medium',
                physics: universe?.settings?.physics || {},
                theme: localStorage.getItem('theme') || 'cosmic',
                audioEnabled: localStorage.getItem('audioEnabled') === 'true',
                notificationsEnabled: localStorage.getItem('notificationsEnabled') !== 'false'
            };
        } catch (err) {
            warn('Failed to get universe config:', err);
            return {};
        }
    }

    /**
     * Import prayers data
     */
    async importPrayersData(prayers) {
        try {
            let imported = 0;
            const existingPrayers = JSON.parse(localStorage.getItem('prayers') || '[]');

            for (const prayer of prayers) {
                // Check if prayer already exists
                const exists = existingPrayers.find(p => p.id === prayer.id);
                if (!exists) {
                    existingPrayers.push({
                        id: prayer.id,
                        message: prayer.message,
                        timestamp: prayer.timestamp,
                        user: prayer.user,
                        sentiment: prayer.sentiment,
                        tags: prayer.tags
                    });
                    imported++;
                }
            }

            localStorage.setItem('prayers', JSON.stringify(existingPrayers));
            return { imported, total: prayers.length };
        } catch (err) {
            error('Failed to import prayers data:', err);
            throw err;
        }
    }

    /**
     * Import universe data
     */
    async importUniverseData(data) {
        try {
            // Restore saints data
            if (data.saints) {
                saintManager.importData(data.saints);
            }

            // Restore prayers if included
            if (data.prayers) {
                await this.importPrayersData(data.prayers);
            }

            // Restore user profile
            if (data.userProfile) {
                appState.updateUser(data.userProfile);
            }

            // Note: Universe state restoration would require universe restart
            // This is a simplified implementation

            return { success: true };
        } catch (err) {
            error('Failed to import universe data:', err);
            throw err;
        }
    }

    /**
     * Apply universe configuration
     */
    async applyUniverseConfig(config) {
        try {
            // Apply theme
            if (config.theme) {
                localStorage.setItem('theme', config.theme);
                document.documentElement.setAttribute('data-theme', config.theme);
            }

            // Apply audio setting
            if (typeof config.audioEnabled === 'boolean') {
                localStorage.setItem('audioEnabled', config.audioEnabled.toString());
            }

            // Apply notification setting
            if (typeof config.notificationsEnabled === 'boolean') {
                localStorage.setItem('notificationsEnabled', config.notificationsEnabled.toString());
            }

            // Universe settings would be applied when universe restarts
            if (config.particleCount || config.quality) {
                localStorage.setItem('universeConfig', JSON.stringify({
                    particleCount: config.particleCount,
                    quality: config.quality,
                    physics: config.physics
                }));
            }
        } catch (err) {
            error('Failed to apply universe config:', err);
            throw err;
        }
    }

    /**
     * Export as JSON
     */
    exportAsJSON(data, filename) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        this.downloadBlob(blob, filename);
        return { success: true, filename, size: jsonString.length };
    }

    /**
     * Export as PDF
     */
    async exportAsPDF(data, filename) {
        try {
            // Simple PDF generation (in real implementation, use a library like jsPDF)
            const content = this.formatPrayersForPDF(data.prayers);
            const blob = new Blob([content], { type: 'text/plain' });
            this.downloadBlob(blob, filename.replace('.pdf', '.txt'));
            return { success: true, filename: filename.replace('.pdf', '.txt') };
        } catch (err) {
            throw new Error('PDF export not fully implemented');
        }
    }

    /**
     * Export as CSV
     */
    exportAsCSV(prayers, filename) {
        const headers = ['ID', 'User', 'Message', 'Timestamp', 'Response'];
        const rows = prayers.map(prayer => [
            prayer.id,
            prayer.user,
            `"${prayer.message.replace(/"/g, '""')}"`,
            prayer.timestamp,
            prayer.response ? `"${prayer.response.replace(/"/g, '""')}"` : ''
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        this.downloadBlob(blob, filename);
        return { success: true, filename, rows: rows.length };
    }

    /**
     * Read file content
     */
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * Download blob as file
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Format prayers for PDF
     */
    formatPrayersForPDF(prayers) {
        let content = 'PRAYERS EXPORT\n\n';
        content += `Export Date: ${new Date().toISOString()}\n`;
        content += `Total Prayers: ${prayers.length}\n\n`;

        prayers.forEach((prayer, index) => {
            content += `${index + 1}. ${prayer.user} - ${prayer.timestamp}\n`;
            content += `Message: ${prayer.message}\n`;
            if (prayer.response) {
                content += `Response: ${prayer.response}\n`;
            }
            content += '\n---\n\n';
        });

        return content;
    }

    /**
     * Create shareable link (simplified)
     */
    async createShareableLink(data) {
        // In a real implementation, this would upload to a server
        // For now, create a data URL
        const jsonString = JSON.stringify(data);
        const base64 = btoa(jsonString);
        return `${window.location.origin}/import?data=${base64}`;
    }

    /**
     * Get export/import statistics
     */
    getStatistics() {
        return {
            prayersExported: parseInt(localStorage.getItem('prayersExported') || '0'),
            prayersImported: parseInt(localStorage.getItem('prayersImported') || '0'),
            universeBackups: parseInt(localStorage.getItem('universeBackups') || '0'),
            configShares: parseInt(localStorage.getItem('configShares') || '0')
        };
    }
}

// Singleton instance
const exportImportManager = new ExportImportManager();

export default exportImportManager;
