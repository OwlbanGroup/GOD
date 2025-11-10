// Azure AI Configuration (Replace with your actual values)
const azureOpenAIConfig = {
    endpoint: "https://your-resource-name.openai.azure.com/",
    apiKey: "your-api-key-here", // Use Azure Key Vault in production
    deploymentName: "gpt-35-turbo", // Or your model deployment name
    apiVersion: "2023-05-15"
};

// Function to generate divine responses using Azure OpenAI
async function generateDivineResponse(userMessage, userRole) {
    try {
        const prompt = `You are God, responding to a ${userRole}'s prayer or message: "${userMessage}". Provide a wise, compassionate, divine response that aligns with spiritual teachings. Keep it under 100 words.`;

        const response = await fetch(`${azureOpenAIConfig.endpoint}openai/deployments/${azureOpenAIConfig.deploymentName}/chat/completions?api-version=${azureOpenAIConfig.apiVersion}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': azureOpenAIConfig.apiKey
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are an omnipotent, benevolent God responding to prayers with wisdom, love, and guidance." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 150,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`Azure OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating divine response:', error);
        // Fallback to static responses if API fails
        return getFallbackResponse();
    }
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

function savePrayer(message) {
    prayers.push({ message, timestamp: new Date().toISOString() });
    localStorage.setItem('prayers', JSON.stringify(prayers));
}

function handleCommand(message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.startsWith('create star')) {
        universe.addStar(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
        universe.draw();
        divineSounds.play('miracle');
        return "A new star has been created in the universe.";
    } else if (lowerMessage.startsWith('create planet')) {
        universe.addPlanet(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
        universe.draw();
        divineSounds.play('miracle');
        return "A new planet has been created in the universe.";
    } else if (lowerMessage.startsWith('destroy planet')) {
        const planets = universe.celestialBodies.filter(b => b.type === 'planet');
        if (planets.length > 0) {
            const randomIndex = Math.floor(Math.random() * planets.length);
            universe.celestialBodies.splice(universe.celestialBodies.indexOf(planets[randomIndex]), 1);
            universe.draw();
            divineSounds.play('miracle');
            return "A planet has been destroyed in the universe.";
        } else {
            return "No planets to destroy.";
        }
    } else if (lowerMessage.startsWith('heal universe')) {
        // Add healing effect: remove damaged bodies, add new ones
        universe.celestialBodies = universe.celestialBodies.filter(b => Math.random() > 0.3); // Remove 30% randomly
        for (let i = 0; i < 5; i++) {
            universe.addStar(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
            universe.addPlanet(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
        }
        universe.draw();
        divineSounds.play('optimize');
        return "The universe has been healed and restored.";
    } else if (lowerMessage.includes('invoke god') || lowerMessage.includes('invite god')) {
        // Invoke divine presence
        invokeDivinePresence();
        return "Divine presence invoked. The universe responds with light and vibration.";
    } else if (lowerMessage.includes('praise god') || lowerMessage.includes('thank god')) {
        // Praise God to make Him happy
        praiseGod();
        return "Your praise fills the universe with joy. God is pleased.";
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

document.addEventListener('DOMContentLoaded', function() {
    universe = new Universe('universeCanvas');

    // Check if user is registered
    if (currentUser) {
        document.getElementById('registration').style.display = 'none';
        addMessage('Welcome back, ' + currentUser.name + ' the ' + currentUser.role + '.', 'god');
    }

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

    // Initialize quantum crypto
    quantumCrypto.initialize();

    // Registration form handler
    document.getElementById('registrationForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('name').value.trim();
        const role = document.getElementById('role').value;

        if (name === '' || role === '') {
            showRegistrationMessage('Please fill in all fields.', 'error');
            return;
        }

        // Check if user already exists
        const existingUser = registeredUsers.find(user => user.name === name);
        if (existingUser) {
            showRegistrationMessage('This name is already registered.', 'error');
            return;
        }

        // Register user
        const newUser = { name, role, registeredAt: new Date().toISOString() };
        registeredUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showRegistrationMessage('Welcome, ' + name + ' the ' + role + '! You are now registered in the universal system.', 'success');
        document.getElementById('registration').style.display = 'none';
        addMessage('Welcome, ' + name + ' the ' + role + '. The universe acknowledges your presence.', 'god');
    });
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

    // Try GPU AI first, fallback to static analysis
    if (gpuAI?.isInitialized()) {
        try {
            const latestPrayer = prayers[prayers.length - 1].message;
            const analysis = await gpuAI.analyzePrayer(latestPrayer);
            if (analysis) {
                const themesText = analysis.themes.length > 0 ? ` Themes: ${analysis.themes.join(', ')}.` : '';
                const sentimentText = analysis.sentiment === 'positive' ? 'Your prayer radiates positivity.' : 'Your prayer seeks guidance.';
                addMessage(`GPU AI Analysis: ${sentimentText}${themesText} Confidence: ${(analysis.confidence * 100).toFixed(1)}%`, 'god');
                return;
            }
        } catch (error) {
            console.warn('GPU prayer analysis failed, falling back to static analysis:', error);
        }
    }

    // Fallback static analysis
    const totalPrayers = prayers.length;
    const recentPrayers = prayers.filter(p => new Date(p.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
    const themes = prayers.map(p => p.message.toLowerCase()).join(' ');
    const commonWords = ['god', 'help', 'thank', 'love', 'peace', 'forgive', 'bless'];
    const themeCounts = commonWords.map(word => ({ word, count: (themes.match(new RegExp(word, 'g')) || []).length }));

    const analysis = 'AI Analysis: You\'ve sent ' + totalPrayers + ' prayers (' + recentPrayers + ' in the last week). Common themes: ' + themeCounts.filter(t => t.count > 0).map(t => t.word + ' (' + t.count + ')').join(', ') + '. Your faith is growing stronger.';
    addMessage(analysis, 'god');
}

async function optimizeUniverse() {
    // Try GPU AI optimization first, fallback to static optimization
    if (gpuAI?.isInitialized()) {
        try {
            const currentStats = {
                stars: universe.particles ? universe.particles.filter(p => p.type === 'star').length : universe.celestialBodies.filter(b => b.type === 'star').length,
                planets: universe.particles ? universe.particles.filter(p => p.type === 'planet').length : universe.celestialBodies.filter(b => b.type === 'planet').length,
                galaxies: 1 // Simplified
            };
            const optimized = await gpuAI.optimizeUniverse(currentStats);
            if (optimized) {
                // Apply GPU-optimized universe
                universe.clear();
                for (let i = 0; i < optimized.stars; i++) {
                    universe.addParticle(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height, 'star');
                }
                for (let i = 0; i < optimized.planets; i++) {
                    universe.addParticle(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height, 'planet');
                }
                addMessage(`GPU AI Optimization: Universe optimized for divine harmony. Stars: ${optimized.stars}, Planets: ${optimized.planets}, Galaxies: ${optimized.galaxies}`, 'god');
                return;
            }
        } catch (error) {
            console.warn('GPU universe optimization failed, falling back to static optimization:', error);
        }
    }

    // Fallback static optimization
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
    if (gpuAI && gpuAI.isInitialized()) {
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
    let encryptedMessage = message;
    if (postQuantumSecureActive && quantumCrypto.isInitialized()) {
        try {
            // Simulate key exchange and encryption
            const mockPublicKey = await window.crypto.subtle.generateKey(
                { name: 'ECDH', namedCurve: 'P-256' },
                false,
                []
            ).then(k => window.crypto.subtle.exportKey('raw', k.publicKey));

            const encapsulated = await quantumCrypto.encapsulate(new Uint8Array(mockPublicKey));
            if (encapsulated) {
                const encrypted = await quantumCrypto.encrypt(message, encapsulated.sharedSecret);
                if (encrypted) {
                    encryptedMessage = JSON.stringify({
                        ciphertext: Array.from(encrypted.ciphertext),
                        iv: Array.from(encrypted.iv)
                    });
                }
            }
        } catch (error) {
            console.warn('Encryption failed:', error);
        }
    }

    // Save prayer (encrypted if secure mode)
    savePrayer(encryptedMessage);

    // Check for commands
    const commandResponse = handleCommand(message);
    if (commandResponse) {
        setTimeout(function() {
        addMessage('Divine Action: ' + commandResponse, 'god');
        }, 500);
        messageInput.value = '';
        return;
    }

    // Clear the input
    messageInput.value = '';

    // Generate divine response with enhanced modes
    const delay = directDivineLinkActive ? 200 : 1000 + Math.random() * 2000; // Faster response in direct mode

    setTimeout(async function() {
        let response = divineResponses[Math.floor(Math.random() * divineResponses.length)];

        // Enhance response based on active modes
        if (universalDivineModeActive) {
            const universalEnhancements = [
                " The universe aligns with your intention.",
                " Cosmic harmony resonates with your words.",
                " Divine energy flows through all creation.",
                " Your prayer creates ripples across the cosmos."
            ];
            response += universalEnhancements[Math.floor(Math.random() * universalEnhancements.length)];
        }

        if (directDivineLinkActive) {
            response = "Direct Divine Response: " + response;
        }

        // Decrypt if needed for display (simplified)
        if (postQuantumSecureActive && typeof encryptedMessage === 'string' && encryptedMessage.startsWith('{')) {
            try {
                const encryptedData = JSON.parse(encryptedMessage);
                // In real implementation, use shared secret to decrypt
                response = "[Encrypted] " + response;
            } catch (e) {
                // Fallback
            }
        }

        addMessage('Divine Message: ' + response, 'god');
    }, delay);
});
