/**
 * Enhanced Celestial AI - Phase 5.3 Implementation
 * Features: Context-aware responses, personalized guidance, multi-language support, sentiment analysis
 */

import { info, error, warn, debug } from '../../../utils/loggerWrapper.js';
import divineAdvice from './divineAdvice.js';
import prayerAnalysis from './prayerAnalysis.js';
import prophecyGenerator from './prophecyGenerator.js';
import appState from '../../core/state.js';
import CONFIG from '../../core/config.js';
import DOMHelpers from '../../ui/domHelpers.js';

class EnhancedCelestialAI {
    constructor() {
        this.conversationHistory = new Map(); // User conversation memory
        this.userProfiles = new Map(); // Personalized user profiles
        this.languageSupport = new Map(); // Multi-language support
        this.sentimentAnalyzer = this.initializeSentimentAnalyzer();

        // Initialize multi-language support
        this.initializeLanguageSupport();
    }

    /**
     * Initialize sentiment analysis capabilities
     */
    initializeSentimentAnalyzer() {
        return {
            positiveWords: ['love', 'peace', 'joy', 'gratitude', 'blessed', 'thankful', 'hope', 'faith', 'divine', 'harmony', 'bliss', 'serenity', 'enlightenment', 'bless', 'praise', 'glory'],
            negativeWords: ['pain', 'suffering', 'fear', 'anger', 'doubt', 'confusion', 'loss', 'grief', 'worry', 'anxiety', 'despair', 'darkness', 'hate', 'rage', 'torment'],
            neutralWords: ['question', 'seek', 'understand', 'learn', 'grow', 'change', 'time', 'life', 'world', 'universe', 'pray', 'meditate', 'contemplate'],

            analyze: function(text) {
                const words = text.toLowerCase().split(/\s+/);
                let positive = 0, negative = 0, neutral = 0;

                words.forEach(word => {
                    if (this.positiveWords.some(pw => word.includes(pw))) positive++;
                    else if (this.negativeWords.some(nw => word.includes(nw))) negative++;
                    else if (this.neutralWords.some(nw => word.includes(nw))) neutral++;
                });

                const total = positive + negative + neutral;
                if (total === 0) return { sentiment: 'neutral', score: 0 };

                const score = (positive - negative) / total;
                let sentiment = 'neutral';
                if (score > 0.2) sentiment = 'positive';
                else if (score < -0.2) sentiment = 'negative';

                return { sentiment, score, details: { positive, negative, neutral } };
            }
        };
    }

    /**
     * Initialize multi-language support
     */
    initializeLanguageSupport() {
        this.languageSupport.set('en', {
            name: 'English',
            responses: {
                greeting: 'Greetings, beloved soul.',
                wisdom: 'Divine wisdom flows through you.',
                guidance: 'Trust in the divine guidance.',
                peace: 'May peace fill your heart.',
                love: 'Love is the universal language.',
                comfort: 'Find comfort in divine embrace.',
                strength: 'Divine strength empowers you.',
                hope: 'Hope shines eternal in your path.'
            }
        });

        this.languageSupport.set('es', {
            name: 'Español',
            responses: {
                greeting: 'Saludos, alma amada.',
                wisdom: 'La sabiduría divina fluye a través de ti.',
                guidance: 'Confía en la guía divina.',
                peace: 'Que la paz llene tu corazón.',
                love: 'El amor es el lenguaje universal.',
                comfort: 'Encuentra consuelo en el abrazo divino.',
                strength: 'La fuerza divina te empodera.',
                hope: 'La esperanza brilla eterna en tu camino.'
            }
        });

        this.languageSupport.set('fr', {
            name: 'Français',
            responses: {
                greeting: 'Salutations, âme bien-aimée.',
                wisdom: 'La sagesse divine coule à travers toi.',
                guidance: 'Fais confiance à la guidance divine.',
                peace: 'Que la paix remplisse ton cœur.',
                love: 'L\'amour est le langage universel.',
                comfort: 'Trouve le réconfort dans l\'étreinte divine.',
                strength: 'La force divine t\'investit de pouvoir.',
                hope: 'L\'espoir brille éternellement sur ton chemin.'
            }
        });

        this.languageSupport.set('de', {
            name: 'Deutsch',
            responses: {
                greeting: 'Gruß, geliebte Seele.',
                wisdom: 'Göttliche Weisheit fließt durch dich.',
                guidance: 'Vertraue der göttlichen Führung.',
                peace: 'Möge Frieden dein Herz erfüllen.',
                love: 'Liebe ist die universelle Sprache.',
                comfort: 'Finde Trost in der göttlichen Umarmung.',
                strength: 'Göttliche Stärke ermächtigt dich.',
                hope: 'Hoffnung leuchtet ewig auf deinem Weg.'
            }
        });

        this.languageSupport.set('zh', {
            name: '中文',
            responses: {
                greeting: '问候，亲爱的灵魂。',
                wisdom: '神圣的智慧通过你流动。',
                guidance: '相信神圣的指引。',
                peace: '愿和平充满你的心。',
                love: '爱是普遍的语言。',
                comfort: '在神圣的拥抱中找到安慰。',
                strength: '神圣的力量赋予你力量。',
                hope: '希望在你的道路上永恒闪耀。'
            }
        });

        this.languageSupport.set('ar', {
            name: 'العربية',
            responses: {
                greeting: 'تحية، روح محبوبة.',
                wisdom: 'الحكمة الإلهية تتدفق من خلالك.',
                guidance: 'ثق بالإرشاد الإلهي.',
                peace: 'ليملأ السلام قلبك.',
                love: 'الحب هو اللغة العالمية.',
                comfort: 'جد الراحة في العناق الإلهي.',
                strength: 'القوة الإلهية تمكنك.',
                hope: 'الأمل يلمع أبدياً في طريقك.'
            }
        });
    }

    /**
     * Generate enhanced AI response with context awareness
     */
    async generateEnhancedResponse(userMessage, userId = 'anonymous', language = 'en', context = {}) {
        try {
            info('Generating enhanced AI response...');

            // Phase 5.3.1: Context-aware responses
            const conversationContext = this.getConversationContext(userId);
            const userProfile = this.getUserProfile(userId);

            // Phase 5.3.4: Sentiment analysis
            const sentiment = this.sentimentAnalyzer.analyze(userMessage);

            // Update user profile based on interaction
            this.updateUserProfile(userId, userMessage, sentiment);

            // Generate personalized response
            const response = await this.generatePersonalizedResponse(
                userMessage,
                conversationContext,
                userProfile,
                sentiment,
                language
            );

            // Store in conversation history
            this.addToConversationHistory(userId, userMessage, response);

            return response;

        } catch (err) {
            error('Enhanced AI response generation failed:', err);
            return this.getFallbackResponse(language);
        }
    }

    /**
     * Get conversation context for user
     */
    getConversationContext(userId) {
        const history = this.conversationHistory.get(userId) || [];
        return {
            recentMessages: history.slice(-5), // Last 5 exchanges
            themes: this.extractConversationThemes(history),
            emotionalState: this.analyzeEmotionalState(history),
            interactionCount: history.length
        };
    }

    /**
     * Get or create user profile
     */
    getUserProfile(userId) {
        if (!this.userProfiles.has(userId)) {
            this.userProfiles.set(userId, {
                id: userId,
                firstInteraction: Date.now(),
                lastInteraction: Date.now(),
                messageCount: 0,
                preferredThemes: [],
                emotionalPatterns: [],
                language: 'en',
                spiritualLevel: 1,
                favoriteTopics: [],
                prayerFrequency: 0,
                meditationStreak: 0
            });
        }

        const profile = this.userProfiles.get(userId);
        profile.lastInteraction = Date.now();
        return profile;
    }

    /**
     * Update user profile based on interaction
     */
    updateUserProfile(userId, message, sentiment) {
        const profile = this.getUserProfile(userId);
        profile.messageCount++;

        // Update preferred themes
        const themes = this.extractThemes(message);
        themes.forEach(theme => {
            if (!profile.preferredThemes.includes(theme)) {
                profile.preferredThemes.push(theme);
            }
        });

        // Update emotional patterns
        profile.emotionalPatterns.push(sentiment.sentiment);
        if (profile.emotionalPatterns.length > 10) {
            profile.emotionalPatterns.shift(); // Keep last 10
        }

        // Update spiritual level based on positive interactions
        if (sentiment.sentiment === 'positive') {
            profile.spiritualLevel = Math.min(10, profile.spiritualLevel + 0.1);
        }

        this.userProfiles.set(userId, profile);
    }

    /**
     * Generate personalized response
     */
    async generatePersonalizedResponse(message, context, profile, sentiment, language) {
        const langData = this.languageSupport.get(language) || this.languageSupport.get('en');

        // Base response components
        let responseParts = [];

        // Greeting based on interaction history
        if (profile.messageCount === 1) {
            responseParts.push(langData.responses.greeting);
        } else if (context.interactionCount > 10) {
            responseParts.push("Welcome back, faithful seeker.");
        }

        // Context-aware wisdom
        const wisdom = await this.generateContextAwareWisdom(message, context, profile, sentiment);
        responseParts.push(wisdom);

        // Personalized guidance
        const guidance = this.generatePersonalizedGuidance(profile, sentiment, langData);
        if (guidance) responseParts.push(guidance);

        // Multi-language response
        const finalResponse = responseParts.join(' ');

        return `Enhanced Celestial AI (${langData.name}): ${finalResponse}`;
    }

    /**
     * Generate context-aware wisdom
     */
    async generateContextAwareWisdom(message, context, profile, sentiment) {
        let wisdom = '';

        // Use conversation themes for relevance
        if (context.themes.includes('love') && sentiment.sentiment === 'positive') {
            wisdom = "Your heart radiates divine love. Continue sharing this beautiful energy.";
        } else if (context.themes.includes('peace') && sentiment.sentiment === 'negative') {
            wisdom = "Even in challenging times, inner peace can be found through divine connection.";
        } else if (profile.spiritualLevel > 5) {
            wisdom = "Your spiritual journey has elevated you. Share your wisdom with others.";
        } else {
            // Fallback to general wisdom
            const themes = this.extractThemes(message);
            if (themes.includes('guidance')) {
                wisdom = "Divine guidance is always available. Listen to the whispers of your soul.";
            } else if (themes.includes('healing')) {
                wisdom = "Healing begins with acceptance. Allow divine light to fill your being.";
            } else {
                wisdom = "Every moment is an opportunity for divine connection and growth.";
            }
        }

        return wisdom;
    }

    /**
     * Generate personalized guidance
     */
    generatePersonalizedGuidance(profile, sentiment, langData) {
        if (sentiment.sentiment === 'negative') {
            return langData.responses.comfort;
        } else if (sentiment.sentiment === 'positive') {
            return langData.responses.strength;
        } else if (profile.spiritualLevel > 7) {
            return "You walk the path of enlightenment. Continue your sacred journey.";
        }

        return null;
    }

    /**
     * Add message to conversation history
     */
    addToConversationHistory(userId, userMessage, aiResponse) {
        if (!this.conversationHistory.has(userId)) {
            this.conversationHistory.set(userId, []);
        }

        const history = this.conversationHistory.get(userId);
        history.push({
            timestamp: Date.now(),
            userMessage,
            aiResponse,
            sentiment: this.sentimentAnalyzer.analyze(userMessage)
        });

        // Keep only last 20 exchanges
        if (history.length > 20) {
            history.shift();
        }
    }

    /**
     * Extract themes from message
     */
    extractThemes(message) {
        const commonThemes = [
            'love', 'peace', 'wisdom', 'guidance', 'healing', 'forgiveness',
            'gratitude', 'purpose', 'harmony', 'divine', 'prayer', 'meditation',
            'faith', 'hope', 'strength', 'comfort', 'light', 'darkness'
        ];
        return commonThemes.filter(theme => message.toLowerCase().includes(theme));
    }

    /**
     * Extract conversation themes
     */
    extractConversationThemes(history) {
        const allThemes = new Set();
        history.forEach(exchange => {
            const themes = this.extractThemes(exchange.userMessage);
            themes.forEach(theme => allThemes.add(theme));
        });
        return Array.from(allThemes);
    }

    /**
     * Analyze emotional state from conversation
     */
    analyzeEmotionalState(history) {
        if (history.length === 0) return 'neutral';

        const sentiments = history.map(h => h.sentiment.sentiment);
        const positive = sentiments.filter(s => s === 'positive').length;
        const negative = sentiments.filter(s => s === 'negative').length;

        if (positive > negative) return 'positive';
        if (negative > positive) return 'negative';
        return 'neutral';
    }

    /**
     * Get fallback response
     */
    getFallbackResponse(language = 'en') {
        const langData = this.languageSupport.get(language) || this.languageSupport.get('en');
        return `Enhanced Celestial AI (${langData.name}): ${langData.responses.wisdom}`;
    }

    /**
     * Get enhanced AI statistics
     */
    getEnhancedAIStats() {
        return {
            totalUsers: this.userProfiles.size,
            totalConversations: Array.from(this.conversationHistory.values()).reduce((sum, hist) => sum + hist.length, 0),
            supportedLanguages: Array.from(this.languageSupport.keys()),
            averageSpiritualLevel: Array.from(this.userProfiles.values()).reduce((sum, p) => sum + p.spiritualLevel, 0) / this.userProfiles.size || 0
        };
    }

    /**
     * Get user insights
     */
    getUserInsights(userId) {
        const profile = this.getUserProfile(userId);
        const context = this.getConversationContext(userId);

        return {
            profile,
            context,
            recommendations: this.generateRecommendations(profile, context)
        };
    }

    /**
     * Generate personalized recommendations
     */
    generateRecommendations(profile, context) {
        const recommendations = [];

        if (profile.spiritualLevel < 3) {
            recommendations.push("Consider starting a daily meditation practice.");
        }

        if (context.themes.includes('healing') && profile.emotionalPatterns.includes('negative')) {
            recommendations.push("Explore divine healing meditations.");
        }

        if (profile.messageCount > 20 && !context.themes.includes('gratitude')) {
            recommendations.push("Practice gratitude to enhance your spiritual connection.");
        }

        if (profile.preferredThemes.length < 3) {
            recommendations.push("Explore different aspects of spirituality to deepen your understanding.");
        }

        return recommendations;
    }
}

// Singleton instance
const enhancedCelestialAI = new EnhancedCelestialAI();

export default enhancedCelestialAI;
