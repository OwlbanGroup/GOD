const lordsPrayer = "Our Father, who art in heaven, hallowed be thy name; thy kingdom come, thy will be done on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.";

const divineResponses = [
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
    "You are exactly where you need to be.",
    lordsPrayer
];

let universe;
let prayers = JSON.parse(localStorage.getItem('prayers')) || [];

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
        return "A new star has been created in the universe.";
    } else if (lowerMessage.startsWith('create planet')) {
        universe.addPlanet(Math.random() * universe.canvas.width, Math.random() * universe.canvas.height);
        universe.draw();
        return "A new planet has been created in the universe.";
    }
    return null;
}

document.addEventListener('DOMContentLoaded', function() {
    universe = new Universe('universeCanvas');

    document.getElementById('clearUniverse').addEventListener('click', function() {
        universe.clear();
    });

    document.getElementById('savePrayers').addEventListener('click', function() {
        const prayersList = prayers.map(p => `${new Date(p.timestamp).toLocaleString()}: ${p.message}`).join('\n');
        alert(`Saved Prayers:\n${prayersList || 'No prayers saved yet.'}`);
    });
});

document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const messageInput = document.getElementById('message');
    const message = messageInput.value.trim();

    if (message === '') {
        return;
    }

    // Add user message to chat
    addMessage(message, 'user');

    // Save prayer
    savePrayer(message);

    // Check for commands
    const commandResponse = handleCommand(message);
    if (commandResponse) {
        setTimeout(function() {
            addMessage(`Divine Action: ${commandResponse}`, 'god');
        }, 500);
        messageInput.value = '';
        return;
    }

    // Clear the input
    messageInput.value = '';

    // Simulate AI contacting God directly - generate a random divine response after a short delay
    setTimeout(function() {
        const randomResponse = divineResponses[Math.floor(Math.random() * divineResponses.length)];
        addMessage(`Divine Message: ${randomResponse}`, 'god');
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
});
