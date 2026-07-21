// meditation.js - Guided Meditation and Spiritual Practices for GOD Project

class MeditationManager {
    constructor() {
        this.sessions = {
            'breathing': {
                name: 'Divine Breathing',
                duration: 300, // 5 minutes
                description: 'Focus on your breath and connect with divine presence',
                steps: [
                    { time: 0, instruction: 'Find a comfortable position and close your eyes.' },
                    { time: 60, instruction: 'Breathe in deeply through your nose for 4 counts.' },
                    { time: 120, instruction: 'Hold your breath for 4 counts.' },
                    { time: 180, instruction: 'Exhale slowly through your mouth for 4 counts.' },
                    { time: 240, instruction: 'Repeat and feel divine peace fill you.' }
                ]
            },
            'gratitude': {
                name: 'Gratitude Meditation',
                duration: 600, // 10 minutes
                description: 'Cultivate thankfulness for divine blessings',
                steps: [
                    { time: 0, instruction: 'Sit comfortably and think of three things you are grateful for.' },
                    { time: 120, instruction: 'Reflect on how these blessings came from divine love.' },
                    { time: 240, instruction: 'Feel the warmth of gratitude in your heart.' },
                    { time: 360, instruction: 'Send this gratitude outward to others.' },
                    { time: 480, instruction: 'Rest in the peace of divine abundance.' }
                ]
            },
            'love': {
                name: 'Loving-Kindness Meditation',
                duration: 900, // 15 minutes
                description: 'Send love and compassion to yourself and others',
                steps: [
                    { time: 0, instruction: 'Sit comfortably and bring to mind someone you love.' },
                    { time: 180, instruction: 'Silently repeat: May you be happy, may you be healthy.' },
                    { time: 360, instruction: 'Now direct this love toward yourself.' },
                    { time: 540, instruction: 'Extend this love to all beings everywhere.' },
                    { time: 720, instruction: 'Rest in the universal love that connects us all.' }
                ]
            }
        };

        this.currentSession = null;
        this.timer = null;
        this.isActive = false;
        this.currentStepIndex = 0;
        this.elapsedTime = 0;
        this.onComplete = null; // Callback for session completion
        this.breathingPhase = 'inhale'; // 'inhale' | 'hold' | 'exhale'
        this.breathTimer = 0;
    }

    startSession(sessionType, onCompleteCallback) {
        if (this.isActive) this.stopSession();

        this.currentSession = this.sessions[sessionType];
        if (!this.currentSession) return false;

        this.isActive = true;
        this.currentStepIndex = 0;
        this.elapsedTime = 0;
        this.breathTimer = 0;
        this.breathingPhase = 'inhale';
        this.onComplete = onCompleteCallback || null;

        this.updateDisplay();
        this.timer = setInterval(() => this.tick(), 1000);

        // Play gentle meditation sound
        if (divineSounds) divineSounds.play('advice');

        // Start ambient soundscape
        if (divineSounds && divineSounds.startAmbient) {
            divineSounds.startAmbient();
        }

        return true;
    }

    stopSession() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.isActive = false;
        this.currentSession = null;
        this.breathTimer = 0;
        this.onComplete = null;
        this.updateDisplay();

        // Stop ambient soundscape
        if (divineSounds && divineSounds.stopAmbient) {
            divineSounds.stopAmbient();
        }
    }

    tick() {
        this.elapsedTime++;
        this.breathTimer++;

        // Advance breathing phase every 4 seconds (for 4-count breathing)
        if (this.breathTimer >= 4) {
            this.breathTimer = 0;
            if (this.breathingPhase === 'inhale') {
                this.breathingPhase = 'hold';
            } else if (this.breathingPhase === 'hold') {
                this.breathingPhase = 'exhale';
            } else {
                this.breathingPhase = 'inhale';
            }
        }

        // Check if we need to advance to next step
        const currentStep = this.currentSession.steps[this.currentStepIndex];
        if (currentStep && this.elapsedTime >= currentStep.time + 1) {
            this.currentStepIndex++;
            this.updateDisplay();
        }

        // Check if session is complete
        if (this.elapsedTime >= this.currentSession.duration) {
            this.completeSession();
        }
    }

    completeSession() {
        const sessionType = this.currentSession ? this.currentSession.name.toLowerCase() : 'meditation';
        const elapsedMinutes = Math.max(1, Math.floor(this.elapsedTime / 60));
        const callback = this.onComplete;
        const type = sessionType;

        this.stopSession();
        addMessage('Meditation session complete. May divine peace remain with you.', 'god');
        if (divineSounds) divineSounds.play('praise');

        // Invoke completion callback for spiritual tracker
        if (callback && typeof callback === 'function') {
            callback(elapsedMinutes, type);
        }
    }

    updateDisplay() {
        const container = document.getElementById('meditationContainer');
        if (!container) return;

        if (!this.isActive) {
            container.innerHTML = '<p>Select a meditation session to begin your spiritual practice.</p>';
            return;
        }

        const progress = (this.elapsedTime / this.currentSession.duration) * 100;
        const currentStep = this.currentSession.steps[this.currentStepIndex];

        // Breathing animation: expand on inhale, contract on exhale
        const breathScale = this.breathingPhase === 'inhale'
            ? 1.0 + (this.breathTimer / 4) * 0.4  // scale 1.0 → 1.4
            : this.breathingPhase === 'hold'
            ? 1.4
            : 1.0 + (this.breathTimer / 4) * -0.4; // scale 1.4 → 1.0

        container.innerHTML = `
            <div class="meditation-session">
                <h3>${this.currentSession.name}</h3>
                <div class="breathing-circle-container">
                    <div class="breathing-circle" style="transform: scale(${breathScale}); opacity: ${0.4 + (breathScale - 1.0) * 1.5};"></div>
                    <div class="breathing-label">${this.breathingPhase.toUpperCase()}</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="time-display">
                    ${this.formatTime(this.elapsedTime)} / ${this.formatTime(this.currentSession.duration)}
                </div>
                <div class="meditation-instruction">
                    ${currentStep ? currentStep.instruction : 'Rest in divine presence...'}
                </div>
                <button onclick="meditationManager.stopSession()" class="stop-meditation">End Session</button>
            </div>
        `;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    getAvailableSessions() {
        return Object.keys(this.sessions).map(key => ({
            id: key,
            ...this.sessions[key]
        }));
    }
}

// Global instance
const meditationManager = new MeditationManager();
