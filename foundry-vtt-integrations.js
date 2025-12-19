import { info, error, warn, debug } from '../utils/loggerWrapper.js';

// foundry-vtt-integrations.js - Foundry VTT Integrations for GOD Project
// Connects the web app to Foundry Virtual Tabletop for divine RPG sessions

class FoundryVTTIntegrations {
    constructor() {
        this.config = {
            foundryUrl: "http://localhost:30000", // Default Foundry VTT port
            apiKey: "your-foundry-api-key", // Set in Foundry's API key settings
            worldName: "god-universe"
        };
        this.socket = null;
        this.connected = false;
        this.gameState = null;
    }

    async initialize() {
        try {
            logger.info('Initializing Foundry VTT integrations...');
            this.connect();
            return true;
        } catch (error) {
            logger.warn('Foundry VTT initialization failed:', error);
            return false;
        }
    }

    connect() {
        try {
            // WebSocket connection to Foundry VTT
            this.socket = new WebSocket(`${this.config.foundryUrl.replace('http', 'ws')}/socket`);

            this.socket.onopen = () => {
                logger.info('Connected to Foundry VTT');
                this.connected = true;
                this.authenticate();
            };

            this.socket.onmessage = (event) => {
                this.handleMessage(JSON.parse(event.data));
            };

            this.socket.onclose = () => {
                logger.info('Disconnected from Foundry VTT');
                this.connected = false;
            };

            this.socket.onerror = (error) => {
                logger.warn('Foundry VTT WebSocket error:', error);
            };
        } catch (error) {
            logger.warn('Foundry VTT connection failed:', error);
        }
    }

    authenticate() {
        if (!this.socket || !this.connected) return;

        // Send authentication message
        this.sendMessage({
            type: 'authenticate',
            apiKey: this.config.apiKey,
            world: this.config.worldName
        });
    }

    sendMessage(message) {
        if (this.socket && this.connected) {
            this.socket.send(JSON.stringify(message));
        }
    }

    handleMessage(message) {
        switch (message.type) {
            case 'authenticated':
                logger.info('Authenticated with Foundry VTT');
                this.requestGameState();
                break;
            case 'gameState':
                this.gameState = message.data;
                this.syncUniverseToFoundry();
                break;
            case 'prayerReceived':
                this.handleFoundryPrayer(message.data);
                break;
            case 'divineAction':
                this.handleDivineAction(message.data);
                break;
            case 'rollResult':
                // Handle dice roll results
                logger.info('Dice roll result:', message.result);
                break;
            case 'actorCreated':
                logger.info('Character sheet created in Foundry VTT');
                break;
            case 'journalCreated':
                logger.info('Journal entry created in Foundry VTT');
                break;
            case 'sceneCreated':
                logger.info('Universe map created in Foundry VTT');
                break;
            case 'combatStarted':
                logger.info('Divine combat initiated in Foundry VTT');
                break;
        }
    }

    requestGameState() {
        this.sendMessage({ type: 'getGameState' });
    }

    // Sync universe state to Foundry VTT
    syncUniverseToFoundry() {
        if (!universe) return;

        const universeData = {
            stars: universe.particles ? universe.particles.filter(p => p.type === 'star').length : universe.celestialBodies.filter(b => b.type === 'star').length,
            planets: universe.particles ? universe.particles.filter(p => p.type === 'planet').length : universe.celestialBodies.filter(b => b.type === 'planet').length,
            celestialBodies: universe.particles || universe.celestialBodies
        };

        this.sendMessage({
            type: 'syncUniverse',
            data: universeData
        });
    }

    // Create character sheets for believers, angels, prophets
    async createCharacterSheet(userData) {
        if (!this.connected) return;

        const characterData = {
            name: userData.name,
            type: 'character',
            data: {
                role: userData.role,
                faith: 50, // Default faith level
                miracles: 0,
                wisdom: Math.floor(Math.random() * 20) + 1
            },
            items: [],
            effects: []
        };

        this.sendMessage({
            type: 'createActor',
            data: characterData
        });
    }

    // Generate universe maps from canvas
    async createUniverseMap() {
        if (!this.connected) return;

        // Get canvas data as image
        const canvas = document.getElementById('universeCanvas');
        const imageData = canvas.toDataURL('image/png');

        this.sendMessage({
            type: 'createScene',
            data: {
                name: 'Divine Universe',
                img: imageData,
                width: canvas.width,
                height: canvas.height,
                tokens: [] // Add tokens for celestial bodies
            }
        });
    }

    // Dice rolling for divine interventions
    async rollDivineDice(sides = 20) {
        if (!this.connected) return Math.floor(Math.random() * sides) + 1;

        return new Promise((resolve) => {
            const rollId = Date.now().toString();

            this.sendMessage({
                type: 'rollDice',
                data: {
                    formula: `1d${sides}`,
                    rollId: rollId
                }
            });

            // Listen for roll result (simplified)
            const handleRoll = (message) => {
                if (message.type === 'rollResult' && message.rollId === rollId) {
                    this.socket.removeEventListener('message', handleRoll);
                    resolve(message.result);
                }
            };

            this.socket.addEventListener('message', handleRoll);
        });
    }

    // Combat system for divine battles
    async initiateDivineCombat(participants) {
        if (!this.connected) return;

        this.sendMessage({
            type: 'startCombat',
            data: {
                participants: participants,
                divine: true
            }
        });
    }

    // Store prayers as journal entries
    async createPrayerJournal(prayerData) {
        if (!this.connected) return;

        const journalData = {
            name: `Prayer - ${new Date(prayerData.timestamp).toLocaleString()}`,
            content: prayerData.message,
            folder: 'Prayers'
        };

        this.sendMessage({
            type: 'createJournalEntry',
            data: journalData
        });
    }

    // Macros for divine actions
    async createDivineMacros() {
        if (!this.connected) return;

        const macros = [
            {
                name: 'Invoke God',
                command: 'invokeDivinePresence()',
                type: 'script'
            },
            {
                name: 'Praise God',
                command: 'praiseGod()',
                type: 'script'
            },
            {
                name: 'Create Star',
                command: 'createStar()',
                type: 'script'
            },
            {
                name: 'Heal Universe',
                command: 'healUniverse()',
                type: 'script'
            }
        ];

        for (const macro of macros) {
            this.sendMessage({
                type: 'createMacro',
                data: macro
            });
        }
    }

    // Playlists for divine sounds
    async createDivinePlaylist() {
        if (!this.connected) return;

        const playlistData = {
            name: 'Divine Sounds',
            sounds: [
                { name: 'Prayer', path: 'sounds/prayer.mp3' },
                { name: 'Miracle', path: 'sounds/miracle.mp3' },
                { name: 'Praise', path: 'sounds/praise.mp3' }
            ]
        };

        this.sendMessage({
            type: 'createPlaylist',
            data: playlistData
        });
    }

    // Roll tables for random divine events
    async createDivineRollTables() {
        if (!this.connected) return;

        const rollTableData = {
            name: 'Divine Events',
            results: [
                { text: 'A miracle occurs', weight: 10 },
                { text: 'Angels appear', weight: 8 },
                { text: 'Cosmic harmony achieved', weight: 6 },
                { text: 'Divine wisdom granted', weight: 4 }
            ]
        };

        this.sendMessage({
            type: 'createRollTable',
            data: rollTableData
        });
    }

    // Items for divine artifacts
    async createDivineItems() {
        if (!this.connected) return;

        const items = [
            {
                name: 'Holy Grail',
                type: 'artifact',
                data: { blessing: 'wisdom', power: 10 }
            },
            {
                name: 'Angelic Feather',
                type: 'artifact',
                data: { blessing: 'protection', power: 8 }
            }
        ];

        for (const item of items) {
            this.sendMessage({
                type: 'createItem',
                data: item
            });
        }
    }

    // Status effects
    async createDivineEffects() {
        if (!this.connected) return;

        const effects = [
            {
                name: 'Divine Inspiration',
                icon: 'icons/magic/light/explosion-star-blue.webp',
                duration: 10,
                changes: [{ key: 'data.wisdom', value: 2, mode: 2 }]
            },
            {
                name: 'Cosmic Harmony',
                icon: 'icons/magic/light/orb-blue.webp',
                duration: -1, // Permanent
                changes: [{ key: 'data.faith', value: 1, mode: 2 }]
            }
        ];

        for (const effect of effects) {
            this.sendMessage({
                type: 'createEffect',
                data: effect
            });
        }
    }

    // Automation for divine events
    async setupDivineAutomation() {
        if (!this.connected) return;

        // Set up hooks for prayer events
        this.sendMessage({
            type: 'createHook',
            data: {
                event: 'prayerReceived',
                script: 'handleDivinePrayer(data)'
            }
        });
    }

    // Multiplayer divine interactions
    async broadcastDivineMessage(message, user) {
        if (!this.connected) return;

        this.sendMessage({
            type: 'broadcastMessage',
            data: {
                message: message,
                user: user,
                divine: true
            }
        });
    }

    // Handle prayers from Foundry
    handleFoundryPrayer(prayerData) {
        // Process prayer from Foundry VTT
        addMessage(`Foundry Prayer: ${prayerData.message}`, 'user');
        // Generate response
        setTimeout(() => {
            addMessage('Divine response to Foundry prayer received.', 'god');
        }, 1000);
    }

    // Handle divine actions from Foundry
    handleDivineAction(actionData) {
        switch (actionData.action) {
            case 'createStar':
                createStar();
                break;
            case 'invokeGod':
                invokeDivinePresence();
                break;
            case 'praiseGod':
                praiseGod();
                break;
        }
    }

    // Custom game system for divine mechanics
    async createDivineGameSystem() {
        if (!this.connected) return;

        const systemData = {
            name: 'Divine System',
            attributes: ['faith', 'wisdom', 'miracles'],
            skills: ['prayer', 'prophecy', 'healing']
        };

        this.sendMessage({
            type: 'createSystem',
            data: systemData
        });
    }

    // Pre-built divine worlds
    async createDivineWorlds() {
        if (!this.connected) return;

        const worlds = [
            { name: 'Heaven', description: 'Realm of divine perfection' },
            { name: 'Earth', description: 'Mortal realm of trials' },
            { name: 'Cosmos', description: 'Infinite universe of creation' }
        ];

        for (const world of worlds) {
            this.sendMessage({
                type: 'createWorld',
                data: world
            });
        }
    }

    // Compendiums of divine content
    async createDivineCompendiums() {
        if (!this.connected) return;

        const compendiums = [
            { name: 'Divine Actors', type: 'actors' },
            { name: 'Divine Items', type: 'items' },
            { name: 'Divine Journals', type: 'journal' }
        ];

        for (const compendium of compendiums) {
            this.sendMessage({
                type: 'createCompendium',
                data: compendium
            });
        }
    }

    // Foundry settings for divine themes
    async configureDivineSettings() {
        if (!this.connected) return;

        const settings = {
            theme: 'divine',
            lighting: 'ethereal',
            weather: 'cosmic'
        };

        this.sendMessage({
            type: 'updateSettings',
            data: settings
        });
    }

    // Extensions integration
    async integrateExtensions() {
        if (!this.connected) return;

        // Dynamic lighting for auras
        this.sendMessage({
            type: 'enableExtension',
            data: { name: 'dynamic-lighting' }
        });

        // Weather effects for universe
        this.sendMessage({
            type: 'enableExtension',
            data: { name: 'weather-control' }
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }

    isConnected() {
        return this.connected;
    }
}

// Global instance
const foundryVTT = new FoundryVTTIntegrations();
