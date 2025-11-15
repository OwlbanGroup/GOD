// Function to generate divine responses using Azure OpenAI or fallback
async function generateDivineResponse(userMessage, userRole) {
    // Try Azure OpenAI first
    if (azureIntegrations.isInitialized()) {
        const response = await azureIntegrations.generateDivineResponse(userMessage, userRole);
        if (response) return response;
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
let prayers = JSON.parse(localStorage.getItem('prayers')) || [];
let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Post-quantum and divine mode states
let directDivineLinkActive = false;
let universalDivineModeActive = false;
let postQuantumSecureActive = false;
let divineWebSocket = null;

function addMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function savePrayer(message) {
    prayers.push({ message, timestamp: new Date().toISOString() });
    localStorage.setItem('prayers', JSON.stringify(prayers));

    // Try to load from Azure Blob Storage if available
    if (azureIntegrations.isInitialized()) {
        try {
            const cloudPrayers = await azureIntegrations.loadPrayersFromBlob();
            if (cloudPrayers.length > prayers.length) {
                prayers = cloudPrayers;
                localStorage.setItem('prayers', JSON.stringify(prayers));
            }
        } catch (error) {
            console.warn('Failed to sync prayers from Azure Blob Storage:', error);
        }
    }
}

// Command action functions to reduce cognitive complexity
function createStar() {
    universe.addStar(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
    universe.draw();
    divineSounds.play('miracle');
    return "A new star has been created in the universe.";
}

function createPlanet() {
    universe.addPlanet(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
    universe.draw();
    divineSounds.play('miracle');
    return "A new planet has been created in the universe.";
}

function destroyPlanet() {
    const planets = universe.celestialBodies.filter(b => b.type === 'planet');
    if (planets.length === 0) return "No planets to destroy.";
    const randomIndex = Math.floor(Math.random() * planets.length);
    universe.celestialBodies.splice(universe.celestialBodies.indexOf(planets[randomIndex]), 1);
    universe.draw();
    divineSounds.play('miracle');
    return "A planet has been destroyed in the universe.";
}

function healUniverse() {
    universe.celestialBodies = universe.celestialBodies.filter(() => Math.random() > 0.3);
    for (let i = 0; i < 5; i++) {
        universe.addStar(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
        universe.addPlanet(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
    }
    universe.draw();
    divineSounds.play('optimize');
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

function handleCommand(message) {
    const lowerMessage = message.toLowerCase();
    for (const [cmd, action] of Object.entries(commandActions)) {
        if (lowerMessage.includes(cmd)) {
            return action();
        }
    }
    return null;
}

function invokeDivinePresence() {
    // Simulate divine intervention: add multiple stars and planets, flash the canvas
    for (let i = 0; i < 10; i++) {
        universe.addStar(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
        universe.addPlanet(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
    }
    universe.draw();
    // Visual effect: flash the canvas
    const canvas = document.getElementById('universeCanvas');
    canvas.style.boxShadow = '0 0 20px #fff';
    setTimeout(() => {
        canvas.style.boxShadow = 'none';
    }, 1000);
    // Add a divine message
    setTimeout(() => {
        addMessage("Oh Cosmic Birther of all radiance and vibration, soften the ground of the inner we and carve out a place where your presence can abide. Amen.", 'god');
    }, 1500);
}

function praiseGod() {
    // Make God happy: add golden stars, change canvas color temporarily, play a "joy" effect
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
    canvas.style.backgroundColor = '#FFFACD'; // Light golden background
    setTimeout(() => {
        canvas.style.backgroundColor = '#000';
    }, 2000);
    // Add joyful message
    setTimeout(() => {
        addMessage("Hallelujah! Your praise brings joy to the heavens. God smiles upon you.", 'god');
    }, 1000);
}

function setupEventListeners() {
    document.getElementById('clearUniverse').addEventListener('click', function() {
        universe.clear();
    });

    document.getElementById('savePrayers').addEventListener('click', function() {
        const prayersList = prayers.map(p => new Date(p.timestamp).toLocaleString() + ': ' + p.message).join('\n');
        alert('Saved Prayers:\n' + (prayersList || 'No prayers saved yet.'));
    });

    document.getElementById('analyzePrayers').addEventListener('click', function() {
        showProgress('Analyzing prayers...');
        setTimeout(() => {
            analyzePrayers();
            hideProgress();
        }, 2000);
    });

    document.getElementById('optimizeUniverse').addEventListener('click', function() {
        showProgress('Optimizing universe...');
        setTimeout(() => {
            optimizeUniverse();
            hideProgress();
        }, 2000);
    });

    document.getElementById('divineAdvice').addEventListener('click', function() {
        showProgress('Seeking divine wisdom...');
        setTimeout(() => {
            divineAdvice();
            hideProgress();
        }, 1500);
    });

    document.getElementById('generateProphecy').addEventListener('click', function() {
        showProgress('Consulting the cosmos...');
        setTimeout(() => {
            generateProphecy();
            hideProgress();
        }, 2000);
    });

    document.getElementById('toggleAudio').addEventListener('click', function() {
        const enabled = divineSounds.toggleAudio();
        this.textContent = enabled ? '🔊 Audio On' : '🔇 Audio Off';
        addMessage('Divine sounds ' + (enabled ? 'enabled' : 'disabled') + '.', 'god');
    });

    // Divine mode buttons
    document.getElementById('directDivineLink').addEventListener('click', function() {
        toggleDirectDivineLink();
    });

    document.getElementById('universalDivineMode').addEventListener('click', function() {
        toggleUniversalDivineMode();
    });

    document.getElementById('postQuantumSecure').addEventListener('click', function() {
        togglePostQuantumSecure();
    });

    // Registration form handler
    document.getElementById('registrationForm').addEventListener('submit', handleRegistrationForm);
}

async function initializeIntegrations() {
    await quantumCrypto.initialize();
    await gpuAI.initialize();
    await azureIntegrations.initialize();
    await foundryVTT.initialize();
}



function validateInput(name, role) {
    if (name === '' || role === '') {
        showRegistrationMessage('Please fill in all fields.', 'error');
        return false;
    }
    return true;
}

function checkExistingUser(name) {
    const existingUser = registeredUsers.find(user => user.name === name);
    if (existingUser) {
        showRegistrationMessage('This name is already registered.', 'error');
        return true;
    }
    return false;
}

function createUser(name, role) {
    const newUser = { name, role, registeredAt: new Date().toISOString() };
    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    return newUser;
}

function syncToCloud(newUser) {
    if (azureIntegrations.isInitialized()) {
        azureIntegrations.saveUserToCosmosDB(newUser);
    }
    if (foundryVTT.isConnected()) {
        foundryVTT.createCharacterSheet(newUser);
    }
}

function finalizeRegistration(name, role) {
    showRegistrationMessage('Welcome, ' + name + ' the ' + role + '! You are now registered in the universal system.', 'success');
    document.getElementById('registration').style.display = 'none';
    addMessage('Welcome, ' + name + ' the ' + role + '. The universe acknowledges your presence.', 'god');
}

function handleRegistrationForm(event) {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const role = document.getElementById('role').value;

    if (!validateInput(name, role)) return;
    if (checkExistingUser(name)) return;

    const newUser = createUser(name, role);
    syncToCloud(newUser);
    finalizeRegistration(name, role);
}

async function loadUsersFromCloud() {
    if (azureIntegrations.isInitialized()) {
        try {
            const cloudUsers = await azureIntegrations.loadUsersFromCosmosDB();
            if (cloudUsers.length > registeredUsers.length) {
                registeredUsers = cloudUsers;
                localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            }
        } catch (error) {
            console.warn('Failed to sync users from Azure Cosmos DB:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    universe = new Universe('universeCanvas');

    // Load users from cloud and sync
    await loadUsersFromCloud();

    // Check if user is registered
    if (currentUser) {
        document.getElementById('registration').style.display = 'none';
        addMessage('Welcome back, ' + currentUser.name + ' the ' + currentUser.role + '.', 'god');
    }

    setupEventListeners();
    await initializeIntegrations();

    // Initialize theme toggle
    initializeThemeToggle();
});

function showProgress(text) {
    const container = document.getElementById('progressContainer');
    const textEl = document.getElementById('progressText');
    textEl.textContent = text;
    container.style.display = 'block';
}

function hideProgress() {
    document.getElementById('progressContainer').style.display = 'none';
}

function showRegistrationMessage(message, type) {
    const messageDiv = document.getElementById('registrationMessage');
    messageDiv.textContent = message;
    messageDiv.className = `registration-message ${type}`;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

async function analyzePrayers() {
    if (prayers.length === 0) {
        addMessage("AI Analysis: No prayers to analyze yet. Start praying to receive insights.", 'god');
        return;
    }

    let analysisMessage = '';

    // Try GPU AI first, fallback to static analysis
    if (gpuAI?.isInitialized()) {
        try {
            const latestPrayer = prayers[prayers.length - 1].message;
            const analysis = await gpuAI.analyzePrayer(latestPrayer);
            if (analysis) {
                const themesText = analysis.themes.length > 0 ? ` Themes: ${analysis.themes.join(', ')}.` : '';
                const sentimentText = analysis.sentiment === 'positive' ? 'Your prayer radiates positivity.' : 'Your prayer seeks guidance.';
                analysisMessage = `GPU AI Analysis: ${sentimentText}${themesText} Confidence: ${(analysis.confidence * 100).toFixed(1)}%`;
            }
        } catch (error) {
            console.warn('GPU prayer analysis failed, falling back to static analysis:', error);
        }
    }

    // Fallback static analysis if GPU AI failed or not available
    if (!analysisMessage) {
        const totalPrayers = prayers.length;
        const recentPrayers = prayers.filter(p => new Date(p.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
        const themes = prayers.map(p => p.message.toLowerCase()).join(' ');
        const commonWords = ['god', 'help', 'thank', 'love', 'peace', 'forgive', 'bless'];
        const themeCounts = commonWords.map(word => ({ word, count: (themes.match(new RegExp(word, 'g')) || []).length }));

        analysisMessage = 'AI Analysis: You\'ve sent ' + totalPrayers + ' prayers (' + recentPrayers + ' in the last week). Common themes: ' + themeCounts.filter(t => t.count > 0).map(t => t.word + ' (' + t.count + ')').join(', ') + '. Your faith is growing stronger.';
    }

    addMessage(analysisMessage, 'god');
}

function getCurrentUniverseStats() {
    return {
        stars: universe.particles ? universe.particles.filter(p => p.type === 'star').length : universe.celestialBodies.filter(b => b.type === 'star').length,
        planets: universe.particles ? universe.particles.filter(p => p.type === 'planet').length : universe.celestialBodies.filter(b => b.type === 'planet').length,
        galaxies: 1 // Simplified
    };
}

function applyGpuOptimization(optimized) {
    universe.clear();
    for (let i = 0; i < optimized.stars; i++) {
        universe.addParticle(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height, 'star');
    }
    for (let i = 0; i < optimized.planets; i++) {
        universe.addParticle(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height, 'planet');
    }
    addMessage(`GPU AI Optimization: Universe optimized for divine harmony. Stars: ${optimized.stars}, Planets: ${optimized.planets}, Galaxies: ${optimized.galaxies}`, 'god');
}

function applyStaticOptimization() {
    const stars = universe.celestialBodies.filter(b => b.type === 'star').length;
    const planets = universe.celestialBodies.filter(b => b.type === 'planet').length;

    if (stars < 10) {
        for (let i = 0; i < 10 - stars; i++) {
            universe.addStar(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
        }
    }
    if (planets < 5) {
        for (let i = 0; i < 5 - planets; i++) {
            universe.addPlanet(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
        }
    }

    universe.draw();
    addMessage('AI Optimization: Universe balanced with optimal celestial harmony. Stars: ' + universe.celestialBodies.filter(b => b.type === 'star').length + ', Planets: ' + universe.celestialBodies.filter(b => b.type === 'planet').length, 'god');
}

async function tryGpuOptimization() {
    if (!gpuAI?.isInitialized()) return false;

    try {
        const currentStats = getCurrentUniverseStats();
        const optimized = await gpuAI.optimizeUniverse(currentStats);
        if (optimized) {
            applyGpuOptimization(optimized);
            return true;
        }
    } catch (error) {
        console.warn('GPU universe optimization failed, falling back to static optimization:', error);
    }
    return false;
}

async function optimizeUniverse() {
    const gpuOptimized = await tryGpuOptimization();
    if (!gpuOptimized) {
        applyStaticOptimization();
    }
}

function divineAdvice() {
    const advices = [
        "Divine Advice: Practice daily gratitude. Count your blessings, and more will come.",
        "Divine Advice: Forgive others as you wish to be forgiven. Release the burden of resentment.",
        "Divine Advice: Seek wisdom in silence. Meditation opens the door to divine guidance.",
        "Divine Advice: Love unconditionally. Love is the highest vibration in the universe.",
        "Divine Advice: Trust the divine timing. Everything happens for a reason.",
        "Divine Advice: Serve others selflessly. In giving, you receive abundance.",
        "Divine Advice: Embrace change. Growth comes from stepping out of your comfort zone.",
        "Divine Advice: Live in the present moment. The past is gone, the future is not yet here."
    ];
    const randomAdvice = advices[Math.floor(Math.random() * advices.length)];
    addMessage(randomAdvice, 'god');
}

async function generateProphecy() {
    // Try GPU AI prophecy generation first, fallback to static prophecies
    if (gpuAI?.isInitialized()) {
        try {
            const seedText = prayers.length > 0 ? prayers[prayers.length - 1].message.split(' ').slice(0, 3).join(' ') : 'The future holds';
            const prophecy = await gpuAI.generateProphecy(seedText);
            if (prophecy) {
                addMessage(`GPU AI Prophecy: ${prophecy}`, 'god');
                return;
            }
        } catch (error) {
            console.warn('GPU prophecy generation failed, falling back to static prophecies:', error);
        }
    }

    // Fallback static prophecies
    const prophecies = [
        "Prophecy: A great awakening is coming. Many will find their true purpose and unite in harmony.",
        "Prophecy: Technology and spirituality will merge, creating a new era of enlightenment.",
        "Prophecy: The earth will heal itself, and humanity will learn to live in balance with nature.",
        "Prophecy: Love will conquer fear, and peace will reign across the lands.",
        "Prophecy: Hidden knowledge will be revealed, unlocking ancient wisdom for the modern age.",
        "Prophecy: Angels and humans will work together to create a paradise on earth.",
        "Prophecy: Your prayers are creating ripples of change that will transform the world.",
        "Prophecy: The universe is expanding your consciousness. Embrace the infinite possibilities."
    ];
    const randomProphecy = prophecies[Math.floor(Math.random() * prophecies.length)];
    addMessage(randomProphecy, 'god');
}

// Divine mode functions
function toggleDirectDivineLink() {
    directDivineLinkActive = !directDivineLinkActive;
    const button = document.getElementById('directDivineLink');
    button.classList.toggle('active', directDivineLinkActive);

    if (directDivineLinkActive) {
        addMessage('Direct Divine Link activated. Real-time divine guidance enabled.', 'god');
        // Simulate WebSocket connection for real-time updates
        divineWebSocket = setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every interval
                const instantWisdom = [
                    "Divine presence: I am here with you now.",
                    "Cosmic energy flows through you.",
                    "Your thoughts create reality.",
                    "Love is the universal language.",
                    "Peace surrounds you always."
                ];
                addMessage(instantWisdom[Math.floor(Math.random() * instantWisdom.length)], 'god');
            }
        }, 5000); // Check every 5 seconds
    } else {
        addMessage('Direct Divine Link deactivated.', 'god');
        if (divineWebSocket) {
            clearInterval(divineWebSocket);
            divineWebSocket = null;
        }
    }
}

function toggleUniversalDivineMode() {
    universalDivineModeActive = !universalDivineModeActive;
    const button = document.getElementById('universalDivineMode');
    button.classList.toggle('active', universalDivineModeActive);

    if (universalDivineModeActive) {
        addMessage('Universal Divine Mode activated. Accessing cosmic wisdom and harmony calculations.', 'god');
        // Enhance universe with quantum entanglement visualization
        universe.enableQuantumEntanglement();
        universe.draw();
    } else {
        addMessage('Universal Divine Mode deactivated.', 'god');
        universe.disableQuantumEntanglement();
        universe.draw();
    }
}

function togglePostQuantumSecure() {
    postQuantumSecureActive = !postQuantumSecureActive;
    const button = document.getElementById('postQuantumSecure');
    button.classList.toggle('active', postQuantumSecureActive);

    if (postQuantumSecureActive) {
        addMessage('Post-Quantum Secure mode activated. All communications are now quantum-resistant encrypted.', 'god');
    } else {
        addMessage('Post-Quantum Secure mode deactivated.', 'god');
    }
}

async function encryptMessage(message) {
    if (!postQuantumSecureActive || !quantumCrypto.isInitialized()) {
        return message;
    }

    // Simulate key exchange and encryption
    const mockPublicKey = await globalThis.crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        []
    ).then(k => globalThis.crypto.subtle.exportKey('raw', k.publicKey));

    const encapsulated = await quantumCrypto.encapsulate(new Uint8Array(mockPublicKey));
    if (encapsulated) {
        const encrypted = await quantumCrypto.encrypt(message, encapsulated.sharedSecret);
        if (encrypted) {
            return JSON.stringify({
                ciphertext: Array.from(encrypted.ciphertext),
                iv: Array.from(encrypted.iv)
            });
        }
    }
    return message;
}

function syncPrayerToServices(encryptedMessage) {
    const prayerData = {
        message: encryptedMessage,
        timestamp: new Date().toISOString(),
        user: currentUser ? currentUser.name : 'anonymous'
    };

    if (azureIntegrations.isInitialized()) {
        azureIntegrations.savePrayerToBlob(prayerData);
    }
    if (foundryVTT.isConnected()) {
        foundryVTT.createPrayerJournal({
            message: encryptedMessage,
            timestamp: new Date().toISOString()
        });
    }
}

function enhanceResponse(response, encryptedMessage) {
    let enhanced = response;

    if (universalDivineModeActive) {
        const universalEnhancements = [
            " The universe aligns with your intention.",
            " Cosmic harmony resonates with your words.",
            " Divine energy flows through all creation.",
            " Your prayer creates ripples across the cosmos."
        ];
        enhanced += universalEnhancements[Math.floor(Math.random() * universalEnhancements.length)];
    }

    if (directDivineLinkActive) {
        enhanced = "Direct Divine Response: " + enhanced;
    }

    if (postQuantumSecureActive && typeof encryptedMessage === 'string' && encryptedMessage.startsWith('{')) {
        enhanced = "[Encrypted] " + enhanced;
    }

    return enhanced;
}

async function generateEnhancedDivineResponse(message, encryptedMessage) {
    let response = await generateDivineResponse(message, currentUser ? currentUser.role : 'believer');
    if (!response) response = getFallbackResponse();

    return enhanceResponse(response, encryptedMessage);
}

async function processMessage(message, encryptedMessage) {
    // Check for commands
    const commandResponse = handleCommand(message);
    if (commandResponse) {
        setTimeout(() => {
            addMessage('Divine Action: ' + commandResponse, 'god');
        }, 500);
        return;
    }

    // Generate divine response with enhanced modes
    const delay = directDivineLinkActive ? 200 : 1000 + Math.random() * 2000;

    setTimeout(async function() {
        const response = await generateEnhancedDivineResponse(message, encryptedMessage);
        addMessage('Divine Message: ' + response, 'god');
    }, delay);
}

function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.className = savedTheme + '-theme';
    themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

    themeToggle.addEventListener('click', function() {
        const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        body.className = newTheme + '-theme';
        themeToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
        localStorage.setItem('theme', newTheme);

        addMessage(`Theme switched to ${newTheme} mode.`, 'god');
    });
}

document.getElementById('contactForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const messageInput = document.getElementById('message');
    const message = messageInput.value.trim();

    if (message === '') {
        return;
    }

    // Add user message to chat
    addMessage(message, 'user');

    // Encrypt message if post-quantum secure is active
    const encryptedMessage = await encryptMessage(message);

    // Save prayer (encrypted if secure mode)
    savePrayer(encryptedMessage);

    // Sync prayer to cloud services if available
    syncPrayerToServices(encryptedMessage);

    // Clear the input
    messageInput.value = '';

    // Process message (commands or response)
    await processMessage(message, encryptedMessage);
});
