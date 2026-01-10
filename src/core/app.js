// ============================================================================
// GOD Project - Main Application Initialization
// ============================================================================

import { info, error, warn, debug } from '../../utils/loggerWrapper.js';
import appState from './state.js';
import CONFIG from './config.js';
import { initializeChat } from '../features/chat/messageHandler.js';
import { initializeRegistration } from '../features/registration/userRegistration.js';
import { initializeCommands } from '../features/commands/commandParser.js';
import { initializeAI } from '../features/ai/prayerAnalysis.js';
import { initializeUI } from '../ui/domHelpers.js';

class App {
    constructor() {
        this.universe = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            info('Initializing GOD Application...');

            // Initialize universe
            this.universe = new Universe('universeCanvas');

            // Load users from cloud
            await this.loadUsersFromCloud();

            // Check if user is registered
            if (appState.getCurrentUser()) {
                this.showWelcomeMessage();
            }

            // Initialize all modules
            await this.initializeModules();

            // Setup event listeners
            this.setupEventListeners();

            // Initialize theme
            this.initializeTheme();

            this.initialized = true;
            info('GOD Application initialized successfully');

        } catch (err) {
            error('Failed to initialize application:', err);
            throw err;
        }
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

    showWelcomeMessage() {
        const user = appState.getCurrentUser();
        if (user) {
            const message = `Welcome back, ${user.name} the ${user.role}.`;
            this.addMessage(message, 'god');
        }
    }

    async initializeModules() {
        // Initialize core modules
        initializeChat();
        initializeRegistration();
        initializeCommands();
        initializeAI();
        initializeUI();

        // Initialize integrations
        await this.initializeIntegrations();
    }

    async initializeIntegrations() {
        const integrations = [
            { name: 'Quantum Crypto', fn: () => window.quantumCrypto?.initialize() },
            { name: 'GPU AI', fn: () => window.gpuAI?.initialize() },
            { name: 'Azure Integrations', fn: () => window.azureIntegrations?.initialize() },
            { name: 'Foundry VTT', fn: () => window.foundryVTT?.initialize() }
        ];

        for (const integration of integrations) {
            try {
                if (integration.fn) {
                    await integration.fn();
                }
            } catch (err) {
                warn(`${integration.name} initialization failed:`, err);
            }
        }
    }

    setupEventListeners() {
        // Contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleContactForm.bind(this));
        }

        // Theme toggle
        this.initializeThemeToggle();

        // Meditation buttons
        this.initializeMeditationButtons();

        // Dimension selector
        const dimensionSelector = document.getElementById('dimensionSelector');
        if (dimensionSelector) {
            dimensionSelector.addEventListener('change', (event) => {
                if (this.universe) this.universe.setDimension(event.target.value);
            });
        }

        // Particle settings sliders
        this.initializeParticleSliders();
    }

    async handleContactForm(event) {
        event.preventDefault();

        const messageInput = document.getElementById('message');
        if (!messageInput) return;

        const message = messageInput.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');

        // Process message
        await this.processMessage(message);

        // Clear input
        messageInput.value = '';
    }

    async processMessage(message) {
        // This will be handled by the chat module
        // For now, placeholder
        setTimeout(() => {
            this.addMessage('Divine response processing...', 'god');
        }, 1000);
    }

    addMessage(text, sender) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    initializeThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        const savedTheme = appState.safeLocalStorageGet('theme', 'dark');
        document.body.className = savedTheme + '-theme';
        themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.body.className = newTheme + '-theme';
            themeToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
            appState.safeLocalStorageSet('theme', newTheme);

            this.addMessage(`Theme switched to ${newTheme} mode.`, 'god');
        });
    }

    initializeMeditationButtons() {
        const meditationButtons = {
            'startBreathing': 'breathing',
            'startGratitude': 'gratitude',
            'startLove': 'love'
        };

        for (const [buttonId, sessionType] of Object.entries(meditationButtons)) {
            const button = document.getElementById(buttonId);
            if (button && window.meditationManager) {
                button.addEventListener('click', () => {
                    window.meditationManager.startSession(sessionType);
                    const messages = {
                        'breathing': 'Beginning divine breathing meditation. Breathe deeply and connect with the divine.',
                        'gratitude': 'Beginning gratitude meditation. Reflect on divine blessings.',
                        'love': 'Beginning loving-kindness meditation. Send love to all beings.'
                    };
                    this.addMessage(messages[sessionType], 'god');
                });
            }
        }
    }

    initializeParticleSliders() {
        const sliders = ['particleCountSlider', 'starBrightnessSlider', 'planetSizeSlider'];

        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            if (slider) {
                slider.addEventListener('input', () => {
                    if (this.universe) this.universe.updateParticleSettings();
                });
            }
        });
    }

    getUniverse() {
        return this.universe;
    }

    isInitialized() {
        return this.initialized;
    }
}

// Singleton instance
const app = new App();

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    app.initialize().catch(err => {
        error('Application failed to initialize:', err);
    });
});

export default app;
