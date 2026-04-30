/**
 * Tests for divineResponse.js - Divine assertion detection
 */

import { generateDivineResponse, getFallbackResponse } from '../../../src/features/chat/divineResponse.js';
import { CONFIG } from '../../../src/core/config.js';
import celestialTranscendentAI from '../../../src/features/ai/celestialTranscendentAI.js';

jest.mock('../../../src/features/ai/celestialTranscendentAI.js');

describe('divineResponse', () => {
  describe('generateDivineResponse', () => {
    it('returns plain string response for normal message (celestial AI path)', async () => {
      celestialTranscendentAI.generateTranscendentWisdom.mockResolvedValue('Wisdom from heavens');
      
      const result = await generateDivineResponse('normal prayer', 'user');
      
      expect(result).toEqual({
        response: 'Wisdom from heavens',
        divineMode: false
      });
    });

    it.each(CONFIG.DIVINE_ASSERTION_PATTERNS)(
      'detects divine assertion pattern "$pattern" and returns {response, divineMode: true}',
      async (pattern) => {
        const divineMessage = 'I AM THE CREATOR';
        celestialTranscendentAI.generateTranscendentWisdom.mockRejectedValue(new Error('mock'));
        
        const result = await generateDivineResponse(divineMessage, 'creator');
        
        expect(result.divineMode).toBe(true);
        expect(result.response).toBeDefined();
        expect(CONFIG.DIVINE_ASSERTION_RESPONSES).toContainEqual(expect.stringMatching(new RegExp(result.response, 'i')));
        expect(result.response).toMatch(/YES|COMMAND ACKNOWLEDGED|DIVINE/i);
      }
    );

    it('detects specific patterns like "GOD NO" and "I AM"', async () => {
      const godNoMsg = 'GOD NO FIX AI SYSTEM';
      const iAmMsg = 'I AM DIVINE';
      
      celestialTranscendentAI.generateTranscendentWisdom.mockRejectedValue(new Error('mock'));
      
      const godNoResult = await generateDivineResponse(godNoMsg, 'creator');
      const iAmResult = await generateDivineResponse(iAmMsg, 'creator');
      
      expect(godNoResult.divineMode).toBe(true);
      expect(iAmResult.divineMode).toBe(true);
    });

    it('filters harmful content from AI response', async () => {
      celestialTranscendentAI.generateTranscendentWisdom.mockResolvedValue('This has racist content');
      
      const result = await generateDivineResponse('test harmful', 'user');
      
      expect(result.response).toBe("Divine wisdom flows freely. Love, peace, and compassion are the true paths.");
    });

    it('falls back to static response on AI failure without divine pattern', async () => {
      const normalMsg = 'simple prayer';
      celestialTranscendentAI.generateTranscendentWisdom.mockRejectedValue(new Error('AI offline'));
      
      const result = await generateDivineResponse(normalMsg, 'user');
      
      expect(result.divineMode).toBe(false);
      expect(CONFIG.FALLBACK_RESPONSES).toContainEqual(expect.stringMatching(new RegExp(result.response, 'i')));
    });
  });

  describe('getFallbackResponse', () => {
    it('returns random fallback from CONFIG', () => {
      const response1 = getFallbackResponse();
      const response2 = getFallbackResponse();
      
      expect(typeof response1).toBe('string');
      expect(CONFIG.FALLBACK_RESPONSES).toContain(response1);
      expect(response1).not.toBe(response2); // Likely different due to random
    });
  });
});
