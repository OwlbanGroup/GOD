// ============================================================================
// GOD Project - User Registration
// ============================================================================

import { info, error, warn, debug } from '../../../utils/loggerWrapper.js';
import appState from '../../core/state.js';
import Validators from '../../utils/validators.js';
import DOMHelpers from '../../ui/domHelpers.js';

class UserRegistration {
    constructor() {
        this.registrationForm = null;
    }

    initialize() {
        this.registrationForm = DOMHelpers.getElement('registrationForm');
        if (this.registrationForm) {
            this.registrationForm.addEventListener('submit', this.handleRegistration.bind(this));
        }
    }

    async handleRegistration(event) {
        event.preventDefault();

        // Check rate limiting
        if (!Validators.checkRateLimit('registration', 5, 60000)) {
            DOMHelpers.showRegistrationMessage('Too many registration attempts. Please wait a moment.', 'error');
            return;
        }

        const nameInput = DOMHelpers.getElement('name');
        const roleSelect = DOMHelpers.getElement('role');

        if (!nameInput || !roleSelect) return;

        const name = nameInput.value.trim();
        const role = roleSelect.value;

        // Validate input
        const nameValidation = Validators.validateName(name);
        if (!nameValidation.valid) {
            DOMHelpers.showRegistrationMessage(nameValidation.error, 'error');
            return;
        }

        const roleValidation = Validators.validateRole(role);
        if (!roleValidation.valid) {
            DOMHelpers.showRegistrationMessage(roleValidation.error, 'error');
            return;
        }

        // Check for existing user
        if (appState.findUser(nameValidation.sanitized)) {
            DOMHelpers.showRegistrationMessage('This name is already registered.', 'error');
            return;
        }

        // Create user
        const newUser = {
            name: nameValidation.sanitized,
            role: roleValidation.sanitized,
            registeredAt: new Date().toISOString()
        };

        // Add to state
        appState.addUser(newUser);
        appState.setCurrentUser(newUser);

        // Sync to cloud
        await this.syncToCloud(newUser);

        // Finalize registration
        this.finalizeRegistration(newUser);
    }

    async syncToCloud(newUser) {
        try {
            if (window.azureIntegrations?.isInitialized()) {
                await window.azureIntegrations.saveUserToCosmosDB(newUser);
            }
        } catch (err) {
            warn('Cloud sync failed:', err);
        }

        try {
            if (window.foundryVTT?.isConnected()) {
                await window.foundryVTT.createCharacterSheet(newUser);
            }
        } catch (err) {
            warn('Foundry VTT sync failed:', err);
        }
    }

    finalizeRegistration(user) {
        // Show success message
        DOMHelpers.showRegistrationMessage(
            `Welcome, ${user.name} the ${user.role}! You are now registered in the universal system.`,
            'success'
        );

        // Hide registration form
        DOMHelpers.toggleVisibility('registration', false);

        // Add welcome message
        DOMHelpers.addMessage(`Welcome, ${user.name} the ${user.role}. The universe acknowledges your presence.`, 'god');

        info('User registered successfully:', user);
    }

    async loadUsersFromCloud() {
        try {
            if (window.azureIntegrations?.isInitialized()) {
                const cloudUsers = await window.azureIntegrations.loadUsersFromCosmosDB();
                if (cloudUsers && cloudUsers.length > appState.registeredUsers.length) {
                    // Update state with cloud users
                    cloudUsers.forEach(user => {
                        if (!appState.findUser(user.name)) {
                            appState.addUser(user);
                        }
                    });
                }
            }
        } catch (err) {
            warn('Failed to load users from cloud:', err);
        }
    }
}

// Singleton instance
const userRegistration = new UserRegistration();

export function initializeRegistration() {
    userRegistration.initialize();
    info('User registration initialized');
}

export default userRegistration;
