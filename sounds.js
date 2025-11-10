// sounds.js - Audio management for divine sounds and effects

class DivineSounds {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.enabled = true;
        this.initializeAudio();
    }

    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.loadSounds();
        } catch (error) {
            console.warn('Audio not supported:', error);
            this.enabled = false;
        }
    }

    async loadSounds() {
        // Create synthetic sounds for divine effects
        this.sounds = {
            prayer: this.createPrayerSound(),
            miracle: this.createMiracleSound(),
            praise: this.createPraiseSound(),
            prophecy: this.createProphecySound(),
            advice: this.createAdviceSound(),
            optimize: this.createOptimizeSound(),
            analyze: this.createAnalyzeSound()
        };
    }

    createPrayerSound() {
        // Gentle, ethereal tone
        return this.createTone(440, 0.5, 'sine');
    }

    createMiracleSound() {
        // Harmonic chord
        return this.createChord([440, 550, 660], 1.0);
    }

    createPraiseSound() {
        // Joyful, uplifting melody
        return this.createMelody([523, 659, 784, 1047], 1.5);
    }

    createProphecySound() {
        // Mysterious, echoing tone
        return this.createEchoTone(220, 2.0);
    }

    createAdviceSound() {
        // Wise, calming tone
        return this.createTone(330, 1.0, 'triangle');
    }

    createOptimizeSound() {
        // Harmonious, balancing sound
        return this.createChord([261, 330, 392], 1.0);
    }

    createAnalyzeSound() {
        // Analytical, thinking sound
        return this.createTone(523, 0.8, 'sawtooth');
    }

    createTone(frequency, duration, waveType = 'sine') {
        if (!this.enabled) return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = waveType;

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        return { oscillator, gainNode, duration };
    }

    createChord(frequencies, duration) {
        if (!this.enabled) return;
        const oscillators = frequencies.map(freq => this.createTone(freq, duration));
        return { oscillators, duration };
    }

    createMelody(frequencies, duration) {
        if (!this.enabled) return;
        const noteDuration = duration / frequencies.length;
        const oscillators = frequencies.map((freq, index) => {
            const tone = this.createTone(freq, noteDuration);
            if (tone) {
                setTimeout(() => this.playTone(tone), index * noteDuration * 1000);
            }
            return tone;
        });
        return { oscillators, duration };
    }

    createEchoTone(frequency, duration) {
        if (!this.enabled) return;
        const tone = this.createTone(frequency, duration);
        if (tone) {
            // Add delay effect
            const delay = this.audioContext.createDelay();
            const feedback = this.audioContext.createGain();
            delay.delayTime.setValueAtTime(0.3, this.audioContext.currentTime);
            feedback.gain.setValueAtTime(0.3, this.audioContext.currentTime);

            tone.gainNode.connect(delay);
            delay.connect(feedback);
            feedback.connect(delay);
            feedback.connect(this.audioContext.destination);
        }
        return tone;
    }

    playTone(tone) {
        if (!this.enabled || !tone) return;
        try {
            if (tone.oscillator) {
                tone.oscillator.start();
                tone.oscillator.stop(this.audioContext.currentTime + tone.duration);
            } else if (tone.oscillators) {
                tone.oscillators.forEach(osc => {
                    if (osc && osc.oscillator) {
                        osc.oscillator.start();
                        osc.oscillator.stop(this.audioContext.currentTime + osc.duration);
                    }
                });
            }
        } catch (error) {
            console.warn('Error playing sound:', error);
        }
    }

    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        this.playTone(this.sounds[soundName]);
    }

    toggleAudio() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// Global instance
const divineSounds = new DivineSounds();
