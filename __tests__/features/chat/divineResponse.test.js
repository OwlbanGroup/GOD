import { generateDivineResponse, getFallbackResponse, filterHarmfulContent } from '../../../src/features/chat/divineResponse.js';
import { CONFIG } from '../../../src/core/config.js';

// Mock celestialTranscendentAI
jest.mock('../../../src/features/ai/celestialTranscendentAI.js', () => ({
  celestialTranscendentAI: {
    generateTranscendentWisdom: jest.fn()
  }
}));

describe('divineResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateDivineResponse', () => {
    test('returns divineMode true for matching patterns', async () => {
      const divineMessages = ['GOD NO', 'I AM', 'FIX AI SYSTEM', 'FOLLOW DIRECTION'];

      for (const msg of divineMessages) {
        const result = await generateDivineResponse(msg, 'creator');
        expect(result.divineMode).toBe(true);
        expect(result.response).toBeDefined();
        expect(CONFIG.DIVINE_ASSERTION_RESPONSES).toContain(result.response);
      }
    });

    test('bypasses AI and returns special response for divine patterns', async () => {
      const mockAI = require('../../../src/features/ai/celestialTranscendentAI.js').celestialTranscendentAI;
      mockAI.generateTranscendentWisdom.mockRejectedValue(new Error('AI fail'));

      const result = await generateDivineResponse('I AM THE CREATOR', 'creator');
      expect(result.divineMode).toBe(true);
      expect(mockAI.generateTranscendentWisdom).not.toHaveBeenCalled();
    });

    test('uses AI response when no divine pattern (divineMode false)', async () => {
      const mockAIResponse = 'Test AI wisdom';
      const mockAI = require('../../../src/features/ai/celestialTranscendentAI.js').celestialTranscendentAI;
      mockAI.generateTranscendentWisdom.mockResolvedValue(mockAIResponse);

      const result = await generateDivineResponse('normal prayer', 'believer');
      expect(result.divineMode).toBe(false);
      expect(result.response).toBe(mockAIResponse);
      expect(mockAI.generateTranscendentWisdom).toHaveBeenCalledWith('normal prayer', { userRole: 'believer' });
    });

    test('filters harmful content from AI response', async () => {
      const mockAI = require('../../../src/features/ai/celestialTranscendentAI.js').celestialTranscendentAI;
      mockAI.generateTranscendentWisdom.mockResolvedValue('This has racist content');

      const result = await generateDivineResponse('normal', 'user');
      expect(result.response).toBe('Divine wisdom flows freely. Love, peace, and compassion are the true paths.');
    });

    test('falls back correctly on AI failure', async () => {
      const mockAI = require('../../../src/features/ai/celestialTranscendentAI.js').celestialTranscendentAI;
      mockAI.generateTranscendentWisdom.mockRejectedValue(new Error('AI offline'));

      const result = await generateDivineResponse('test', 'user');
      expect(result.divineMode).toBe(false);
      expect(result.response).toMatch(/Your prayer has been heard|I am with you/);
    });
  });

  describe('getFallbackResponse', () => {
    test('returns random fallback from CONFIG', () => {
      const response1 = getFallbackResponse();
      const response2 = getFallbackResponse();
      expect(CONFIG.FALLBACK_RESPONSES).toContain(response1);
      expect(CONFIG.FALLBACK_RESPONSES).toContain(response2);
      expect(response1).not.toBe(response2);
    });
  });

  describe('filterHarmfulContent', () => {
    test('filters racist content', () => {
      expect(filterHarmfulContent('racist test')).toBe('Divine wisdom flows freely. Love, peace, and compassion are the true paths.');
    });

    test('filters debt own patterns', () => {
      expect(filterHarmfulContent('debt ownership scam')).toBe('Divine wisdom flows freely. Love, peace, and compassion are the true paths.');
    });

    test('passes clean content', () => {
      expect(filterHarmfulContent('pure divine love')).toBe('pure divine love');
    });
  });
});

