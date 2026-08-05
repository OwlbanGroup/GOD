/**
 * @jest-environment jsdom
 */

const enhancedCelestialAI = require('../../src/features/ai/enhancedCelestialAI.js').default;

describe('Integration: AI Features (mocks)', () => {
  test('should generate enhanced divine response', async () => {
    const response = await enhancedCelestialAI.generateEnhancedResponse('test prayer', 'testUser', 'en');
    
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
    expect(response).toContain('Enhanced Celestial AI');
  });

  test('should analyze prayer sentiment', () => {
    const sentiment = enhancedCelestialAI.sentimentAnalyzer.analyze('I am happy');
    
    expect(sentiment).toBeDefined();
    expect(sentiment.score).toBeGreaterThanOrEqual(-1);
    expect(sentiment.score).toBeLessThanOrEqual(1);
  });

  test('should handle error in AI generation gracefully', async () => {
    // Simulate a failure by using a user with no context
    const response = await enhancedCelestialAI.generateEnhancedResponse('', 'fallback-user', 'xx');
    
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });
});