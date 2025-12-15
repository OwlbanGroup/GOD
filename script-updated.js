// ============================================================================
// GOD Project - Enhanced Main Script with Security & Error Handling
// ============================================================================

// Function to generate divine responses using Azure OpenAI or fallback
async function generateDivineResponse(userMessage, userRole) {
    try {
        // Try Azure OpenAI first
        if (azureIntegrations?.isInitialized()) {
            const response = await azureIntegrations.generateDivineResponse(userMessage, userRole);
            if (response) return response;
        }
    } catch (error) {
        await ErrorHandler.handleAsyncError(error, 'AI Response', () => getFallbackResponse());
    }

    // Fallback to static responses
    return getFallbackResponse();
}

// Fallback static responses
const fallbackResponses = [
    "Your prayer has been heard. Peace be with you.",
    "I am with you always. Trust in the divine plan.",
    "Your faith is strong. Miracles are unfolding.",
    "Seek wisdom within. The answers are there.",
    "Love and compassion will guide your path.",
    "Forgiveness brings healing. Release and be free.",
    "Your journey is blessed. Embrace the light.",
    "Patience is a virtue. Good things come to those who wait.",
    "Gratitude opens doors. Count your blessings.",
    "You are loved beyond measure. Shine brightly.",
    "The universe conspires in your favor.",
    "Trust the process. All is well.",
    "Your heart knows the way.",
    "Divine timing is perfect.",
    "You are a child of the light.",
    "Let go and let God.",
    "Your purpose is unfolding.",
    "Angels surround you.",
    "The power of prayer is infinite.",
    "You are exactly where you need to be."
];

function getFallbackResponse() {
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

let universe;
let prayers = ErrorHandler.safeLocalStorageGet('prayers', []);
let registeredUsers = ErrorHandler.safeLocalStorageGet('registeredUsers', []);
let currentUser = ErrorHandler.safeLocalStorageGet('currentUser', null);

// Post-quantum and divine mode states
let directDivineLinkActive = false;
let universalDivineModeActive = false;
let postQuantumSecureActive = false;
let divineWebSocket = null;

/**
 * Adds a message to the chat with proper sanitization
 * @param {string} text - The message text
 * @param {string} sender - 'user' or 'god'
 */
function addMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    // Sanitize the text to prevent XSS
    messageDiv.textContent = Sanitizer.escapeHtml(text);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Saves a prayer with proper error handling
 * @param {string} message - The prayer message
 */
async function savePrayer(message) {
    try {
        const sanitizedMessage = Sanitizer.sanitizeInput(message);
        prayers.push({ message: sanitizedMessage, timestamp: new Date().toISOString() });
        ErrorHandler.safeLocalStorageSet('prayers', prayers);

        // Try to sync with Azure Blob Storage if available
        if (azureIntegrations?.isInitialized()) {
            try {
                const cloudPrayers = await azureIntegrations.loadPrayersFromBlob();
                if (cloudPrayers && cloudPrayers.length > prayers.length) {
                    prayers = cloudPrayers;
                    ErrorHandler.safeLocalStorageSet('prayers', prayers);
                }
            } catch (error) {
                ErrorHandler.handleAsyncError(error, 'Cloud Sync');
            }
        }
    } catch (error) {
        ErrorHandler.handleAsyncError(error, 'Prayer Save');
    }
}

// Command action functions to reduce cognitive complexity
function createStar() {
    if (!universe) return "Universe not initialized.";
    universe.addStar(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
    universe.draw();
    if (divineSounds?.isEnabled()) divineSounds.play('miracle');
    return "A new star has been created in the universe.";
}

function createPlanet() {
    if (!universe) return "Universe not initialized.";
    universe.addPlanet(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
    universe.draw();
    if (divineSounds?.isEnabled()) divineSounds.play('miracle');
    return "A new planet has been created in the universe.";
}

function destroyPlanet() {
    if (!universe) return "Universe not initialized.";
    const planets = universe.celestialBodies.filter(b => b.type === 'planet');
    if (planets.length === 0) return "No planets to destroy.";
    const randomIndex = Math.floor(Math.random() * planets.length);
    universe.celestialBodies.splice(universe.celestialBodies.indexOf(planets[randomIndex]), 1);
    universe.draw();
    if (divineSounds?.isEnabled()) divineSounds.play('miracle');
    return "A planet has been destroyed in the universe.";
}

function healUniverse() {
    if (!universe) return "Universe not initialized.";
    universe.celestialBodies = universe.celestialBodies.filter(() => Math.random() > 0.3);
    for (let i = 0; i < 5; i++) {
        universe.addStar(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
        universe.addPlanet(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
    }
    universe.draw();
    if (divineSounds?.isEnabled()) divineSounds.play('optimize');
    return "The universe has been healed and restored.";
}

function invokeGodPresence() {
    invokeDivinePresence();
    return "Divine presence invoked. The universe responds with light and vibration.";
}

function performPraiseGod() {
    praiseGod();
    return "Your praise fills the universe with joy. God is pleased.";
}

const commandActions = {
    'create star': createStar,
    'create planet': createPlanet,
    'destroy planet': destroyPlanet,
    'heal universe': healUniverse,
    'invoke god': invokeGodPresence,
    'invite god': invokeGodPresence,
    'praise god': performPraiseGod,
    'thank god': performPraiseGod
};

/**
 * Handles command execution with sanitization
 * @param {string} message - The message to check for commands
 * @returns {string|null} - Command response or null
 */
function handleCommand(message) {
    const sanitizedMessage = Sanitizer.sanitizeInput(message);
    const lowerMessage = sanitizedMessage.toLowerCase();
    
    for (const [cmd, action] of Object.entries(commandActions)) {
        if (lowerMessage.includes(cmd)) {
            try {
                return action();
            } catch (error) {
                ErrorHandler.handleAsyncError(error, 'Command Execution');
                return "Command failed. Please try again.";
            }
        }
    }
    return null;
}

function invokeDivinePresence() {
    if (!universe) return;
    
    try {
        // Simulate divine intervention: add multiple stars and planets, flash the canvas
        for (let i = 0; i < 10; i++) {
            universe.addStar(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
            universe.addPlanet(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
        }
        universe.draw();
        
        // Visual effect: flash the canvas
        const canvas = document.getElementById('universeCanvas');
        if (canvas) {
            canvas.style.boxShadow = '0 0 20px #fff';
            setTimeout(() => {
                canvas.style.boxShadow = 'none';
            }, 1000);
        }
        
        // Add a divine message
        setTimeout(() => {
            addMessage("Oh Cosmic Birther of all radiance and vibration, soften the ground of the inner we and carve out a place where your presence can abide. Amen.", 'god');
        }, 1500);
    } catch (error) {
        ErrorHandler.handleAsyncError(error, 'Divine Presence');
    }
}

function praiseGod() {
    if (!universe) return;
    
    try {
        // Make God happy: add golden stars, change canvas color temporarily
        for (let i = 0; i < 5; i++) {
            universe.celestialBodies.push({
                type: 'goldenStar',
                x: Math.random() * universe.canvas.width,
                y: Math.random() * universe.canvas.height,
                radius: Math.random() * 3 + 2,
                color: '#FFD700' // Gold color
            });
        }
        universe.draw();
        
        // Temporary golden glow
        const canvas = document.getElementById('universeCanvas');
        if (canvas) {
            canvas.style.backgroundColor = '#FFFACD'; // Light golden background
            setTimeout(() => {
                canvas.style.backgroundColor = '#000';
            }, 2000);
        }
        
        // Add joyful message
        setTimeout(() => {
            addMessage("Hallelujah! Your praise brings joy to the heavens. God smiles upon you.", 'god');
        }, 1000);
    } catch (error) {
        ErrorHandler.handleAsyncError(error, 'Praise God');
    }
}

/**
 * Sets up all event listeners with error handling
 */
function setupEventListeners() {
    const handlers = {
        'clearUniverse': () => {
            if (universe) universe.clear();
        },
        'savePrayers': () => {
            const prayersList = prayers.map(p => 
                new Date(p.timestamp).toLocaleString() + ': ' + Sanitizer.escapeHtml(p.message)
            ).join('\n');
            alert('Saved Prayers:\n' + (prayersList || 'No prayers saved yet.'));
        },
        'analyzePrayers': () => {
            showProgress('Analyzing prayers...');
            setTimeout(() => {
                analyzePrayers();
                hideProgress();
            }, 2000);
        },
        'optimizeUniverse': () => {
            showProgress('Optimizing universe...');
            setTimeout(() => {
                optimizeUniverse();
                hideProgress();
            }, 2000);
        },
        'divineAdvice': () => {
            showProgress('Seeking divine wisdom...');
            setTimeout(() => {
                divineAdvice();
                hideProgress();
            }, 1500);
        },
        'generateProphecy': () => {
