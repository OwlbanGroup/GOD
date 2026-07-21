import { info, error, warn, debug } from '../utils/loggerWrapper.js';

// sounds.js - Audio management for divine sounds and effects

class DivineSounds {
    audioContext;
    sounds = {};
    enabled = true;

    constructor() {
        this.initializeAudio();
    }

    initializeAudio() {
        try {
            this.audioContext = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
            this.loadSounds();
        } catch (error) {
            logger.warn('Audio not supported:', error);
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
        return this.createChord([440, 550, 660], 1);
    }

    createPraiseSound() {
        // Joyful, uplifting melody
        return this.createMelody([523, 659, 784, 1047], 1.5);
    }

    createProphecySound() {
        // Mysterious, echoing tone
        return this.createEchoTone(220, 2);
    }

    createAdviceSound() {
        // Wise, calming tone
        return this.createTone(330, 1, 'triangle');
    }

    createOptimizeSound() {
        // Harmonious, balancing sound
        return this.createChord([261, 330, 392], 1);
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
                for (const osc of tone.oscillators) {
                    if (osc?.oscillator) {
                        osc.oscillator.start();
                        osc.oscillator.stop(this.audioContext.currentTime + osc.duration);
                    }
                }
            }
        } catch (error) {
            logger.warn('Error playing sound:', error);
        }
    }

    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        this.playTone(this.sounds[soundName]);
    }

    toggleAudio() {
        this.enabled = !this.enabled;
        if (!this.enabled) this.stopAmbient();
        return this.enabled;
    }

    // ===================== AMBIENT SOUNDSCAPE =====================

    ambientSources = {
        windChimes: null,
        softDrone: null,
        natureAmbient: null
    };
    ambientGains = {};
    isAmbientPlaying = false;
    ambientFadeDuration = 2;

    createWindChimes() {
        if (!this.enabled) return;
        const ctx = this.audioContext;
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.connect(ctx.destination);

        // Create chime oscillator with random pitches
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(523, ctx.currentTime);
        chimeGain.gain.setValueAtTime(0, ctx.currentTime);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(masterGain);

        // Periodic chime trigger
        const chimeInterval = setInterval(() => {
            if (!this.isAmbientPlaying) {
                clearInterval(chimeInterval);
                return;
            }
            const notes = [523, 659, 784, 880, 1047, 784, 659, 523];
            const freq = notes[Math.floor(Math.random() * notes.length)];
            const now = ctx.currentTime;
            chimeOsc.frequency.setValueAtTime(freq, now);
            chimeGain.gain.setValueAtTime(0.03, now);
            chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        }, 3000 + Math.random() * 4000);

        chimeOsc.start();
        this.ambientSources.windChimes = { oscillator: chimeOsc, gain: chimeGain, masterGain, interval: chimeInterval };
        this.ambientGains.windChimes = masterGain;
    }

    createSoftDrone() {
        if (!this.enabled) return;
        const ctx = this.audioContext;
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.connect(ctx.destination);

        // Two detuned oscillators for rich drone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(55.5, ctx.currentTime); // slightly detuned

        gain1.gain.setValueAtTime(0.04, ctx.currentTime);
        gain2.gain.setValueAtTime(0.04, ctx.currentTime);

        osc1.connect(gain1).connect(masterGain);
        osc2.connect(gain2).connect(masterGain);

        osc1.start();
        osc2.start();

        this.ambientSources.softDrone = { oscillators: [osc1, osc2], gains: [gain1, gain2], masterGain };
        this.ambientGains.softDrone = masterGain;
    }

    createNatureAmbient() {
        if (!this.enabled) return;
        const ctx = this.audioContext;
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.connect(ctx.destination);

        // Brown noise for wind/rain-like texture
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5;
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.03, ctx.currentTime);

        // Low-pass filter for softness
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);

        noiseSource.connect(noiseGain).connect(filter).connect(masterGain);
        noiseSource.start();

        this.ambientSources.natureAmbient = { source: noiseSource, gain: noiseGain, filter, masterGain };
        this.ambientGains.natureAmbient = masterGain;
    }

    startAmbient() {
        if (this.isAmbientPlaying || !this.enabled) return;
        this.isAmbientPlaying = true;

        // Create all ambient layers
        this.createWindChimes();
        this.createSoftDrone();
        this.createNatureAmbient();

        // Fade in all layers
        const now = this.audioContext.currentTime;
        Object.values(this.ambientGains).forEach(gain => {
            if (gain) {
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(1, now + this.ambientFadeDuration);
            }
        });

        logger.info('Ambient soundscape started');
    }

    stopAmbient() {
        if (!this.isAmbientPlaying) return;
        this.isAmbientPlaying = false;

        const now = this.audioContext.currentTime;

        // Fade out all layers
        Object.values(this.ambientGains).forEach(gain => {
            if (gain) {
                gain.gain.setValueAtTime(gain.gain.value || 1, now);
                gain.gain.linearRampToValueAtTime(0, now + this.ambientFadeDuration);
            }
        });

        // Stop wind chimes interval after fade
        setTimeout(() => {
            if (this.ambientSources.windChimes?.interval) {
                clearInterval(this.ambientSources.windChimes.interval);
            }
            // Stop drones
            if (this.ambientSources.softDrone?.oscillators) {
                this.ambientSources.softDrone.oscillators.forEach(osc => {
                    try { osc.stop(); } catch (e) { /* already stopped */ }
                });
            }
            // Stop nature
            if (this.ambientSources.natureAmbient?.source) {
                try { this.ambientSources.natureAmbient.source.stop(); } catch (e) { /* already stopped */ }
            }
            this.ambientSources = { windChimes: null, softDrone: null, natureAmbient: null };
        }, this.ambientFadeDuration * 1000 + 100);

        logger.info('Ambient soundscape stopped');
    }

    setAmbientVolume(level) {
        // level: 0.0 to 1.0
        const now = this.audioContext.currentTime;
        Object.values(this.ambientGains).forEach(gain => {
            if (gain) {
                gain.gain.linearRampToValueAtTime(level, now + 0.5);
            }
        });
    }
}

// Global instance
const divineSounds = new DivineSounds();
