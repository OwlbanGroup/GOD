/**
 * Prayer management and storage
 * @module features/chat/prayerManager
 */

import { getPrayers, addPrayer, setPrayers } from '../../core/state.js';

/**
 * Saves a prayer with proper error handling
 * @param {string} message - The prayer message
 */
export async function savePrayer(message) {
    try {
        const sanitizedMessage = Sanitizer.sanitizeInput(message);
        addPrayer({ 
            message: sanitizedMessage, 
            timestamp: new Date().toISOString() 
        });

        // Try to sync with Azure Blob Storage if available
        if (azureIntegrations?.isInitialized()) {
            try {
                const cloudPrayers = await azureIntegrations.loadPrayersFromBlob();
                if (cloudPrayers && cloudPrayers.length > getPrayers().length) {
                    setPrayers(cloudPrayers);
                }
            } catch (error) {
                ErrorHandler.handleAsyncError(error, 'Cloud Sync');
            }
        }
    } catch (error) {
        ErrorHandler.handleAsyncError(error, 'Prayer Save');
    }
}

/**
 * Sync prayer to cloud services
 * @param {string} encryptedMessage - Encrypted prayer message
 */
export function syncPrayerToServices(encryptedMessage) {
    const prayerData = {
        message: encryptedMessage,
        timestamp: new Date().toISOString(),
        user: getCurrentUser() ? getCurrentUser().name : 'anonymous'
    };

    if (azureIntegrations?.isInitialized()) {
        azureIntegrations.savePrayerToBlob(prayerData).catch(error => {
            ErrorHandler.handleAsyncError(error, 'Cloud Sync');
        });
    }
    
    if (foundryVTT?.isConnected()) {
        foundryVTT.createPrayerJournal({
            message: encryptedMessage,
            timestamp: new Date().toISOString()
        }).catch(error => {
            ErrorHandler.handleAsyncError(error, 'Foundry VTT Sync');
        });
    }
}

// Import getCurrentUser from state
import { getCurrentUser } from '../../core/state.js';
