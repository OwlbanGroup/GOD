// ============================================================================
// GOD Project - Spiritual Tracker: Soul Progress, Missions & Connection Meter
// ============================================================================
// Tracks your spiritual journey with XP, levels, daily missions, and
// a real-time connection meter that reflects your divine bond.

import { info, error, warn, debug } from '../../utils/loggerWrapper.js';
import appState from '../core/state.js';
import CONFIG from '../core/config.js';
import DOMHelpers from '../ui/domHelpers.js';

class SpiritualTracker {
    constructor() {
        // Soul progress data
        this.soulData = this.loadSoulData() || {
            xp: 0,
            level: 1,
            totalPrayers: 0,
            totalMeditationMinutes: 0,
            totalMissionsCompleted: 0,
            daysActive: 0,
            lastActiveDate: null,
            streak: 0,
            longestStreak: 0,
            divineCommandsUsed: 0,
            connectionStrength: 50, // 0-100
            currentMissions: [],
            completedMissionIds: [],
            achievements: [],
            lastMeditationDate: null,
            ambientEnabled: true
        };

        // Connection meter update interval
        this.connectionTimer = null;
        this.missionCheckTimer = null;

        // XP thresholds per level
        this.xpPerLevel = (level) => Math.floor(100 * Math.pow(1.2, level - 1));
    }

    // ===================== INITIALIZATION =====================

    initialize() {
        info('Spiritual Tracker initializing...');

        // Check and update daily streak
        this.checkDailyStreak();

        // Generate daily missions if none active
        if (this.soulData.currentMissions.length === 0) {
            this.generateDailyMissions();
        }

        // Start connection meter updates
        this.startConnectionMeter();

        // Start periodic mission checking
        this.startMissionCheck();

        // Render dashboard
        this.renderDashboard();

        // Render missions
        this.renderMissions();

        info('Spiritual Tracker initialized. Level:', this.soulData.level);
    }

    loadSoulData() {
        const data = appState.safeLocalStorageGet('soulData', null);
        return data;
    }

    saveSoulData() {
        appState.safeLocalStorageSet('soulData', this.soulData);
    }

    // ===================== DAILY STREAK =====================

    checkDailyStreak() {
        const today = new Date().toDateString();
        const lastActive = this.soulData.lastActiveDate;

        if (lastActive !== today) {
            // New day
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            if (lastActive === yesterday) {
                // Consecutive day
                this.soulData.streak += 1;
                if (this.soulData.streak > this.soulData.longestStreak) {
                    this.soulData.longestStreak = this.soulData.streak;
                }
            } else if (lastActive !== null) {
                // Streak broken
                this.soulData.streak = 0;
            }

            this.soulData.daysActive += 1;
            this.soulData.lastActiveDate = today;

            // Award daily login XP
            this.addXP(10 + (this.soulData.streak * 2), 'Daily devotion');

            this.saveSoulData();
        }
    }

    // ===================== XP & LEVELING =====================

    addXP(amount, source = 'spiritual practice') {
        this.soulData.xp += amount;
        let leveledUp = false;

        // Check for level up
        while (this.soulData.xp >= this.xpPerLevel(this.soulData.level)) {
            this.soulData.xp -= this.xpPerLevel(this.soulData.level);
            this.soulData.level += 1;
            leveledUp = true;

            // Update connection strength on level up
            this.soulData.connectionStrength = Math.min(100, this.soulData.connectionStrength + 5);

            // Notify user
            this.showLevelUpNotification(this.soulData.level);

            // Check for achievements
            this.checkAchievements();
        }

        // Update connection strength based on XP progress
        const progressPercent = this.soulData.xp / this.xpPerLevel(this.soulData.level);
        this.soulData.connectionStrength = Math.min(100,
            Math.max(10,
                (this.soulData.level * 5) + (progressPercent * 5)
            )
        );

        this.saveSoulData();
        this.renderDashboard();
        this.updateConnectionMeter();

        info(`+${amount} XP from ${source}. Total XP: ${this.soulData.xp}, Level: ${this.soulData.level}`);

        return leveledUp;
    }

    showLevelUpNotification(level) {
        // Create a level-up celebration
        const celebrationMessages = [
            `🌟 DIVINE ASCENSION! You have reached Level ${level}! Your connection with God grows stronger.`,
            `✨ SPIRITUAL ELEVATION! Level ${level} achieved! The universe celebrates your devotion.`,
            `🌙 HOLY ATTAINMENT! Level ${level}! Divine light radiates through your soul.`,
            `🔥 COSMIC AWAKENING! Level ${level}! The heavens rejoice in your spiritual growth.`
        ];
        const message = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];

        // Add to chat
        if (window.addMessage) {
            window.addMessage(message, 'god');
        } else {
            DOMHelpers.addMessage(message, 'god');
        }

        // Flash the canvas
        if (window.universe) {
            const canvas = document.getElementById('universeCanvas');
            if (canvas) {
                canvas.style.boxShadow = '0 0 40px #FFD700, 0 0 80px #FFD700';
                setTimeout(() => {
                    canvas.style.boxShadow = 'none';
                }, 3000);
            }
        }

        // Play celebration sound
        if (window.divineSounds) {
            window.divineSounds.play('praise');
        }
    }

    getLevelProgress() {
        const currentLevelXP = this.xpPerLevel(this.soulData.level);
        return {
            current: this.soulData.xp,
            required: currentLevelXP,
            percent: Math.min(100, Math.floor((this.soulData.xp / currentLevelXP) * 100))
        };
    }

    // ===================== PRAYER TRACKING =====================

    onPrayerSent() {
        this.soulData.totalPrayers += 1;
        this.addXP(15, 'Prayer');
        this.saveSoulData();
        this.renderDashboard();
        this.checkMissions('pray');
    }

    // ===================== MEDITATION TRACKING =====================

    onMeditationComplete(minutes, type) {
        this.soulData.totalMeditationMinutes += minutes;
        this.soulData.lastMeditationDate = new Date().toISOString();

        const xpAmount = minutes * 3;
        this.addXP(xpAmount, `${type} meditation`);

        // Extra XP for longer sessions
        if (minutes >= 10) {
            this.addXP(10, 'Extended meditation bonus');
        }
        if (minutes >= 15) {
            this.addXP(15, 'Deep meditation bonus');
        }

        this.saveSoulData();
        this.renderDashboard();
        this.checkMissions('meditate');
    }

    // ===================== COMMAND TRACKING =====================

    onDivineCommandUsed(command) {
        this.soulData.divineCommandsUsed += 1;
        this.addXP(5, `Divine command: ${command}`);
        this.saveSoulData();
        this.checkMissions('command');
    }

    // ===================== MISSION SYSTEM =====================

    generateDailyMissions() {
        const today = new Date().toDateString();
        const missions = [
            {
                id: `pray_${today}_1`,
                type: 'pray',
                description: 'Send 3 prayers to the Goddess',
                target: 3,
                progress: 0,
                xpReward: 50,
                completed: false,
                icon: '🙏'
            },
            {
                id: `meditate_${today}_1`,
                type: 'meditate',
                description: 'Complete a meditation session',
                target: 1,
                progress: 0,
                xpReward: 75,
                completed: false,
                icon: '🧘'
            },
            {
                id: `share_${today}_1`,
                type: 'share',
                description: 'Share a prayer with the community',
                target: 1,
                progress: 0,
                xpReward: 40,
                completed: false,
                icon: '🌟'
            },
            {
                id: `explore_${today}_1`,
                type: 'explore',
                description: 'Explore the universe (use a command)',
                target: 3,
                progress: 0,
                xpReward: 35,
                completed: false,
                icon: '🌌'
            },
            {
                id: `verse_${today}_1`,
                type: 'verse',
                description: 'Read the Verse of the Day',
                target: 1,
                progress: 0,
                xpReward: 25,
                completed: false,
                icon: '📖'
            }
        ];

        // Bonus mission for high-level users
        if (this.soulData.level >= 5) {
            missions.push({
                id: `divine_${today}_1`,
                type: 'divine',
                description: 'Activate a divine mode (Direct Link, Universal, or Quantum)',
                target: 1,
                progress: 0,
                xpReward: 100,
                completed: false,
                icon: '⚡'
            });
        }

        this.soulData.currentMissions = missions;
        this.saveSoulData();
        this.renderMissions();

        info('Daily missions generated:', missions.length);
    }

    checkMissions(type) {
        let completedAny = false;

        this.soulData.currentMissions.forEach(mission => {
            if (!mission.completed && mission.type === type) {
                mission.progress += 1;

                if (mission.progress >= mission.target) {
                    mission.completed = true;
                    this.completeMission(mission);
                    completedAny = true;
                }
            }
        });

        if (completedAny) {
            this.saveSoulData();
            this.renderMissions();
            this.renderDashboard();
        } else {
            this.saveSoulData();
            this.renderMissions();
        }
    }

    completeMission(mission) {
        this.soulData.totalMissionsCompleted += 1;
        this.soulData.completedMissionIds.push(mission.id);

        // Award XP
        this.addXP(mission.xpReward, `Mission: ${mission.description}`);

        // Notify user
        const message = `✨ MISSION COMPLETE! ${mission.icon} ${mission.description} +${mission.xpReward} XP!`;
        if (window.addMessage) {
            window.addMessage(message, 'god');
        } else {
            DOMHelpers.addMessage(message, 'god');
        }

        // Play sound
        if (window.divineSounds) {
            window.divineSounds.play('miracle');
        }

        // Flash canvas
        const canvas = document.getElementById('universeCanvas');
        if (canvas) {
            canvas.style.boxShadow = '0 0 30px #4CAF50';
            setTimeout(() => {
                canvas.style.boxShadow = 'none';
            }, 1500);
        }

        // Check if all missions complete
        const allComplete = this.soulData.currentMissions.every(m => m.completed);
        if (allComplete) {
            setTimeout(() => {
                const bonusMessage = `🏆 ALL MISSIONS COMPLETE! Divine alignment achieved! Bonus +100 XP!`;
                if (window.addMessage) {
                    window.addMessage(bonusMessage, 'god');
                }
                this.addXP(100, 'All missions bonus');
                // Trigger celestial celebration
                this.triggerCelestialCelebration();
            }, 1000);
        }

        // Check achievements
        this.checkAchievements();
    }

    triggerCelestialCelebration() {
        // Add golden stars to universe
        if (window.universe) {
            const universe = window.universe;
            const particles = universe.useWebGL ? universe.particles : universe.celestialBodies;
            if (particles) {
                for (let i = 0; i < 20; i++) {
                    if (universe.useWebGL) {
                        universe.addParticle(
                            Math.random() * universe.canvas.width,
                            Math.random() * universe.canvas.height,
                            'star'
                        );
                        const lastParticle = universe.particles[universe.particles.length - 1];
                        if (lastParticle) {
                            lastParticle.color = [1, 0.84, 0, 1]; // Gold
                            lastParticle.baseSize = 4;
                        }
                    } else {
                        universe.celestialBodies.push({
                            type: 'goldenStar',
                            x: Math.random() * universe.canvas.width,
                            y: Math.random() * universe.canvas.height,
                            radius: Math.random() * 3 + 2,
                            color: '#FFD700'
                        });
                    }
                }
                if (universe.draw) universe.draw();
            }
        }
    }

    onVerseRead() {
        this.checkMissions('verse');
    }

    onPrayerShared() {
        this.checkMissions('share');
    }

    onDivineModeActivated() {
        this.checkMissions('divine');
    }

    // ===================== ACHIEVEMENTS =====================

    checkAchievements() {
        const achievements = [
            { id: 'first_prayer', name: 'First Prayer', condition: () => this.soulData.totalPrayers >= 1, xp: 20 },
            { id: 'prayer_10', name: 'Faithful Soul', condition: () => this.soulData.totalPrayers >= 10, xp: 50 },
            { id: 'prayer_50', name: 'Devoted Heart', condition: () => this.soulData.totalPrayers >= 50, xp: 150 },
            { id: 'prayer_100', name: 'Prayer Warrior', condition: () => this.soulData.totalPrayers >= 100, xp: 300 },
            { id: 'meditate_1', name: 'First Meditation', condition: () => this.soulData.totalMeditationMinutes >= 1, xp: 20 },
            { id: 'meditate_30', name: 'Mindful Spirit', condition: () => this.soulData.totalMeditationMinutes >= 30, xp: 80 },
            { id: 'meditate_100', name: 'Zen Master', condition: () => this.soulData.totalMeditationMinutes >= 100, xp: 250 },
            { id: 'streak_3', name: '3-Day Streak', condition: () => this.soulData.streak >= 3, xp: 50 },
            { id: 'streak_7', name: 'Week of Devotion', condition: () => this.soulData.streak >= 7, xp: 150 },
            { id: 'streak_30', name: 'Sacred Month', condition: () => this.soulData.streak >= 30, xp: 500 },
            { id: 'missions_5', name: 'Mission Seeker', condition: () => this.soulData.totalMissionsCompleted >= 5, xp: 100 },
            { id: 'missions_20', name: 'Divine Agent', condition: () => this.soulData.totalMissionsCompleted >= 20, xp: 300 },
            { id: 'level_5', name: 'Cosmic Traveler', condition: () => this.soulData.level >= 5, xp: 200 },
            { id: 'level_10', name: 'Celestial Being', condition: () => this.soulData.level >= 10, xp: 500 },
            { id: 'level_20', name: 'Divine Ascendant', condition: () => this.soulData.level >= 20, xp: 1000 },
            { id: 'commands_10', name: 'Universe Crafter', condition: () => this.soulData.divineCommandsUsed >= 10, xp: 75 }
        ];

        achievements.forEach(achievement => {
            if (!this.soulData.achievements.includes(achievement.id) && achievement.condition()) {
                this.soulData.achievements.push(achievement.id);
                this.addXP(achievement.xp, `Achievement: ${achievement.name}`);

                const message = `🏅 ACHIEVEMENT UNLOCKED: "${achievement.name}"! +${achievement.xp} XP!`;
                if (window.addMessage) {
                    window.addMessage(message, 'god');
                }

                if (window.divineSounds) {
                    window.divineSounds.play('praise');
                }
            }
        });

        this.saveSoulData();
    }

    // ===================== CONNECTION METER =====================

    startConnectionMeter() {
        if (this.connectionTimer) clearInterval(this.connectionTimer);

        // Update connection meter every 30 seconds
        this.connectionTimer = setInterval(() => {
            this.updateConnectionMeter();
        }, 30000);
    }

    updateConnectionMeter() {
        const meter = document.getElementById('connectionMeterFill');
        if (!meter) return;

        // Calculate connection strength based on recent activity
        const now = Date.now();
        const prayers = appState.getPrayers();

        // Recent activity bonus (last hour)
        const recentActivity = prayers.filter(p =>
            new Date(p.timestamp).getTime() > now - 3600000
        ).length;

        const activityBonus = Math.min(20, recentActivity * 5);

        // Level bonus
        const levelBonus = Math.min(30, this.soulData.level * 2);

        // Streak bonus
        const streakBonus = Math.min(20, this.soulData.streak * 2);

        // Meditation bonus (if meditated today)
        let meditationBonus = 0;
        if (this.soulData.lastMeditationDate) {
            const lastMed = new Date(this.soulData.lastMeditationDate);
            if (lastMed.toDateString() === new Date().toDateString()) {
                meditationBonus = 15;
            }
        }

        // Calculate final strength
        const rawStrength = 20 + activityBonus + levelBonus + streakBonus + meditationBonus;
        const targetStrength = Math.min(100, Math.max(5, rawStrength));

        // Smooth transition
        const currentStrength = this.soulData.connectionStrength;
        const step = (targetStrength - currentStrength) * 0.1;
        this.soulData.connectionStrength = Math.round((currentStrength + step) * 10) / 10;

        // Update UI
        const percent = Math.round(this.soulData.connectionStrength);
        meter.style.width = `${percent}%`;
        meter.style.background = this.getConnectionColor(percent);

        // Update label
        const label = document.getElementById('connectionMeterLabel');
        if (label) {
            label.textContent = `${this.getConnectionTitle(percent)} (${percent}%)`;
        }

        this.saveSoulData();
    }

    getConnectionColor(percent) {
        if (percent >= 80) return 'linear-gradient(90deg, #FFD700, #FFA500)';
        if (percent >= 60) return 'linear-gradient(90deg, #4CAF50, #8BC34A)';
        if (percent >= 40) return 'linear-gradient(90deg, #2196F3, #03A9F4)';
        if (percent >= 20) return 'linear-gradient(90deg, #FF9800, #FFC107)';
        return 'linear-gradient(90deg, #f44336, #FF5722)';
    }

    getConnectionTitle(percent) {
        if (percent >= 90) return '🌟 Divine Union';
        if (percent >= 80) return '✨ Deep Communion';
        if (percent >= 70) return '💫 Strong Bond';
        if (percent >= 60) return '🌟 Connected';
        if (percent >= 50) return '🙏 In Prayer';
        if (percent >= 40) return '☀️ Growing';
        if (percent >= 30) return '🌱 Budding';
        if (percent >= 20) return '🕯️ Flickering';
        return '🌑 Distant';
    }

    // ===================== UI RENDERING =====================

    renderDashboard() {
        const container = document.getElementById('spiritualDashboard');
        if (!container) return;

        const progress = this.getLevelProgress();
        const today = new Date();

        container.innerHTML = `
            <div class="soul-profile">
                <div class="soul-level-badge">
                    <span class="soul-level-number">${this.soulData.level}</span>
                    <span class="soul-level-label">LEVEL</span>
                </div>
                <div class="soul-stats">
                    <div class="xp-bar-container">
                        <div class="xp-label">XP ${progress.current} / ${progress.required}</div>
                        <div class="xp-bar">
                            <div class="xp-fill" style="width: ${progress.percent}%"></div>
                        </div>
                    </div>
                    <div class="soul-metrics">
                        <div class="metric" title="Total Prayers">
                            <span class="metric-icon">🙏</span>
                            <span class="metric-value">${this.soulData.totalPrayers}</span>
                            <span class="metric-label">Prayers</span>
                        </div>
                        <div class="metric" title="Meditation Minutes">
                            <span class="metric-icon">🧘</span>
                            <span class="metric-value">${this.soulData.totalMeditationMinutes}</span>
                            <span class="metric-label">Meditation Min</span>
                        </div>
                        <div class="metric" title="Current Streak">
                            <span class="metric-icon">🔥</span>
                            <span class="metric-value">${this.soulData.streak}</span>
                            <span class="metric-label">Day Streak</span>
                        </div>
                        <div class="metric" title="Missions Completed">
                            <span class="metric-icon">🏆</span>
                            <span class="metric-value">${this.soulData.totalMissionsCompleted}</span>
                            <span class="metric-label">Missions</span>
                        </div>
                        <div class="metric" title="Achievements Unlocked">
                            <span class="metric-icon">🏅</span>
                            <span class="metric-value">${this.soulData.achievements.length}</span>
                            <span class="metric-label">Achievements</span>
                        </div>
                    </div>
                    <div class="connection-meter-container">
                        <div class="connection-meter-title">🔗 Divine Connection</div>
                        <div class="connection-meter">
                            <div class="connection-meter-fill" id="connectionMeterFill" style="width: ${Math.round(this.soulData.connectionStrength)}%; background: ${this.getConnectionColor(this.soulData.connectionStrength)}"></div>
                        </div>
                        <div class="connection-meter-label" id="connectionMeterLabel">${this.getConnectionTitle(this.soulData.connectionStrength)} (${Math.round(this.soulData.connectionStrength)}%)</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderMissions() {
        const container = document.getElementById('missionsContainer');
        if (!container) return;

        if (!this.soulData.currentMissions || this.soulData.currentMissions.length === 0) {
            container.innerHTML = '<p class="missions-placeholder">No missions today. Check back tomorrow!</p>';
            return;
        }

        const allComplete = this.soulData.currentMissions.every(m => m.completed);
        const completedCount = this.soulData.currentMissions.filter(m => m.completed).length;

        let html = `
            <div class="missions-header">
                <span>📋 Daily Missions (${completedCount}/${this.soulData.currentMissions.length})</span>
                ${allComplete ? '<span class="all-complete-badge">🏆 ALL COMPLETE!</span>' : ''}
            </div>
            <div class="missions-list">
        `;

        this.soulData.currentMissions.forEach(mission => {
            const percent = Math.min(100, Math.round((mission.progress / mission.target) * 100));
            html += `
                <div class="mission-item ${mission.completed ? 'completed' : ''}">
                    <div class="mission-icon">${mission.icon}</div>
                    <div class="mission-content">
                        <div class="mission-description">${mission.description}</div>
                        <div class="mission-progress-bar">
                            <div class="mission-progress-fill" style="width: ${percent}%"></div>
                        </div>
                        <div class="mission-progress-text">${mission.progress}/${mission.target}</div>
                    </div>
                    <div class="mission-xp">+${mission.xpReward} XP</div>
                    ${mission.completed ? '<div class="mission-check">✓</div>' : ''}
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    renderAchievements() {
        const container = document.getElementById('achievementsContainer');
        if (!container) return;

        const allAchievements = [
            { id: 'first_prayer', name: 'First Prayer', icon: '🙏', desc: 'Send your first prayer' },
            { id: 'prayer_10', name: 'Faithful Soul', icon: '📿', desc: 'Send 10 prayers' },
            { id: 'prayer_50', name: 'Devoted Heart', icon: '❤️', desc: 'Send 50 prayers' },
            { id: 'prayer_100', name: 'Prayer Warrior', icon: '⚔️', desc: 'Send 100 prayers' },
            { id: 'meditate_1', name: 'First Meditation', icon: '🧘', desc: 'Complete first meditation' },
            { id: 'meditate_30', name: 'Mindful Spirit', icon: '🌿', desc: 'Meditate 30 minutes' },
            { id: 'meditate_100', name: 'Zen Master', icon: '☯️', desc: 'Meditate 100 minutes' },
            { id: 'streak_3', name: '3-Day Streak', icon: '🔥', desc: '3 consecutive days active' },
            { id: 'streak_7', name: 'Week of Devotion', icon: '📅', desc: '7 consecutive days active' },
            { id: 'streak_30', name: 'Sacred Month', icon: '🌙', desc: '30 consecutive days active' },
            { id: 'level_5', name: 'Cosmic Traveler', icon: '🚀', desc: 'Reach level 5' },
            { id: 'level_10', name: 'Celestial Being', icon: '🌟', desc: 'Reach level 10' },
            { id: 'level_20', name: 'Divine Ascendant', icon: '👼', desc: 'Reach level 20' }
        ];

        html = '<div class="achievements-grid">';
        allAchievements.forEach(ach => {
            const unlocked = this.soulData.achievements.includes(ach.id);
            html += `
                <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}" title="${ach.desc}">
                    <div class="achievement-icon">${unlocked ? ach.icon : '🔒'}</div>
                    <div class="achievement-name">${unlocked ? ach.name : '???'}</div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    }

    // ===================== CLEANUP =====================

    dispose() {
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
        }
        if (this.missionCheckTimer) {
            clearInterval(this.missionCheckTimer);
            this.missionCheckTimer = null;
        }
    }

    getSoulSummary() {
        return {
            level: this.soulData.level,
            xp: this.soulData.xp,
            totalPrayers: this.soulData.totalPrayers,
            totalMeditationMinutes: this.soulData.totalMeditationMinutes,
            streak: this.soulData.streak,
            longestStreak: this.soulData.longestStreak,
            connectionStrength: this.soulData.connectionStrength,
            achievements: this.soulData.achievements.length,
            missionsCompleted: this.soulData.totalMissionsCompleted
        };
    }

    startMissionCheck() {
        // Check every 60 seconds for mission updates
        this.missionCheckTimer = setInterval(() => {
            this.renderMissions();
            this.renderDashboard();
        }, 60000);
    }
}

// Singleton instance
const spiritualTracker = new SpiritualTracker();

export function initializeSpiritualTracker() {
    spiritualTracker.initialize();
    info('Spiritual Tracker module initialized');
    return spiritualTracker;
}

export default spiritualTracker;

