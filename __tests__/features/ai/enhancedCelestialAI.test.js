/**
 * Enhanced Celestial AI - Phase 5.3 Test Suite
 * Tests context-aware responses, multi-language support, and sentiment analysis
 */

import enhancedCelestialAI from '../../../src/features/ai/enhancedCelestialAI.js';

describe('Enhanced Celestial AI - Phase 5.3', () => {
    beforeEach(() => {
        // Reset AI state before each test
        enhancedCelestialAI.conversationHistory.clear();
        enhancedCelestialAI.userProfiles.clear();
    });

    describe('Sentiment Analysis', () => {
        test('should analyze positive sentiment correctly', () => {
            const result = enhancedCelestialAI.sentimentAnalyzer.analyze('I feel blessed and full of love');
            expect(result.sentiment).toBe('positive');
            expect(result.score).toBeGreaterThan(0.2);
        });

        test('should analyze negative sentiment correctly', () => {
            const result = enhancedCelestialAI.sentimentAnalyzer.analyze('I am suffering and in pain');
            expect(result.sentiment).toBe('negative');
            expect(result.score).toBeLessThan(-0.2);
        });

        test('should analyze neutral sentiment correctly', () => {
            const result = enhancedCelestialAI.sentimentAnalyzer.analyze('I seek guidance and understanding');
            expect(result.sentiment).toBe('neutral');
        });
    });

    describe('Multi-language Support', () => {
        test('should have English responses', () => {
            const langData = enhancedCelestialAI.languageSupport.get('en');
            expect(langData).toBeDefined();
            expect(langData.name).toBe('English');
            expect(langData.responses.greeting).toBe('Greetings, beloved soul.');
        });

        test('should have Spanish responses', () => {
            const langData = enhancedCelestialAI.languageSupport.get('es');
            expect(langData).toBeDefined();
            expect(langData.name).toBe('Español');
            expect(langData.responses.greeting).toBe('Saludos, alma amada.');
        });

        test('should have multiple languages supported', () => {
            const supportedLanguages = ['en', 'es', 'fr', 'de', 'zh', 'ar'];
            supportedLanguages.forEach(lang => {
                expect(enhancedCelestialAI.languageSupport.has(lang)).toBe(true);
            });
        });
    });

    describe('User Profiling', () => {
        test('should create user profile on first interaction', () => {
            const profile = enhancedCelestialAI.getUserProfile('testUser');
            expect(profile).toBeDefined();
            expect(profile.id).toBe('testUser');
            expect(profile.messageCount).toBe(0);
            expect(profile.spiritualLevel).toBe(1);
        });

        test('should update user profile based on interactions', () => {
            enhancedCelestialAI.updateUserProfile('testUser', 'I feel blessed and loved', { sentiment: 'positive' });
            const profile = enhancedCelestialAI.getUserProfile('testUser');
            expect(profile.messageCount).toBe(1);
            expect(profile.preferredThemes).toContain('love');
            expect(profile.emotionalPatterns).toContain('positive');
            expect(profile.spiritualLevel).toBeGreaterThan(1);
        });
    });

    describe('Conversation Context', () => {
        test('should maintain conversation history', () => {
            enhancedCelestialAI.addToConversationHistory('user1', 'Hello', 'Greetings, beloved soul.');
            const context = enhancedCelestialAI.getConversationContext('user1');
            expect(context.recentMessages).toHaveLength(1);
            expect(context.interactionCount).toBe(1);
        });

        test('should extract conversation themes', () => {
            enhancedCelestialAI.addToConversationHistory('user1', 'I seek peace and love', 'Peace fills your heart.');
            enhancedCelestialAI.addToConversationHistory('user1', 'I need guidance', 'Divine guidance is here.');
            const context = enhancedCelestialAI.getConversationContext('user1');
            expect(context.themes).toContain('peace');
            expect(context.themes).toContain('love');
            expect(context.themes).toContain('guidance');
        });
    });

    describe('Enhanced Response Generation', () => {
        test('should generate enhanced response', async () => {
            const response = await enhancedCelestialAI.generateEnhancedResponse(
                'I seek peace and love',
                'testUser',
                'en'
            );
            expect(response).toBeDefined();
            expect(typeof response).toBe('string');
            expect(response).toContain('Enhanced Celestial AI');
        });

        test('should provide personalized guidance', async () => {
            // First create a profile with positive interactions
            enhancedCelestialAI.updateUserProfile('testUser', 'I feel blessed', { sentiment: 'positive' });
            enhancedCelestialAI.updateUserProfile('testUser', 'I am grateful', { sentiment: 'positive' });

            const response = await enhancedCelestialAI.generateEnhancedResponse(
                'I need strength',
                'testUser',
                'en'
            );
            expect(response).toBeDefined();
        });

        test('should support different languages', async () => {
            const response = await enhancedCelestialAI.generateEnhancedResponse(
                'Hola, busco paz',
                'testUser',
                'es'
            );
            expect(response).toContain('Español');
        });
    });

    describe('AI Statistics', () => {
        test('should provide enhanced AI statistics', () => {
            const stats = enhancedCelestialAI.getEnhancedAIStats();
            expect(stats).toBeDefined();
            expect(stats.supportedLanguages).toContain('en');
            expect(stats.supportedLanguages).toContain('es');
            expect(typeof stats.totalUsers).toBe('number');
        });
    });
});
