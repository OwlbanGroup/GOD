/**
 * @jest-environment jsdom
 */

const enhancedCelestialAI = require('../../src/features/ai/enhancedCelestialAI.js');

describe('Integration: AI Features (mocks)', () => {
  test('should generate divine response', () => {
    const response = enhancedCelestialAI.generateDivineResponse('test prayer');
    
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  test('should analyze prayer sentiment', () => {
    const sentiment = enhancedCelestialAI.analyzePrayerSentiment('I am happy');
    
    expect(sentiment).toBeDefined();
    expect(sentiment.score).toBeGreaterThanOrEqual(-1);
    expect(sentiment.score).toBeLessThanOrEqual(1);
  });

  test('should handle error in AI generation', () => {
    // Mock error throwing
    const originalGenerate = enhancedCelestialAI.generateDivineResponse;
    enhancedCelestialAI.generateDivineResponse = jest.fn(() => {
      throw new Error('AI error');
    });

    const result = enhancedCelestialAI.generateDivineResponse('test');
    
    expect(result).toBe('Divine fallback response.');
    
    // Restore
    enhancedCelestialAI.generateDivineResponse = originalGenerate;
  });
});
