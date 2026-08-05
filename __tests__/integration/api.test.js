/**
 * @jest-environment jsdom
 */

const azureIntegrations = require('../../azure-integrations.js').default;
const foundryVttIntegrations = require('../../foundry-vtt-integrations.js').default;

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Integration: API Integrations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    azureIntegrations.initialized = true;
  });

  describe('Azure Integrations', () => {
    test('should call Azure API successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'azure response' } }] })
      });

      const result = await azureIntegrations.generateDivineResponse('test prayer', 'believer');
      
      expect(global.fetch).toHaveBeenCalled();
      expect(result).toBe('azure response');
    });

    test('should handle Azure API error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Azure error'));

      await expect(azureIntegrations.generateDivineResponse('test', 'believer'))
        .rejects.toThrow('Azure error');
    });

    test('should save prayer to blob storage', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true });

      const result = await azureIntegrations.savePrayerToBlob({ message: 'test prayer' });
      
      expect(global.fetch).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('Foundry VTT Integrations', () => {
    test('should create character sheet', async () => {
      // Mock WebSocket
      global.WebSocket = jest.fn().mockImplementation(() => ({
        send: jest.fn(),
        close: jest.fn(),
        addEventListener: jest.fn()
      }));

      foundryVttIntegrations.connected = true;
      foundryVttIntegrations.socket = new WebSocket();
      
      const result = await foundryVttIntegrations.createCharacterSheet({ name: 'Test', role: 'believer' });
      
      expect(foundryVttIntegrations.socket.send).toHaveBeenCalled();
    });

    test('should handle Foundry VTT error', async () => {
      foundryVttIntegrations.connected = false;
      
      const result = await foundryVttIntegrations.createCharacterSheet({ name: 'Test', role: 'believer' });
      
      expect(result).toBeUndefined();
    });
  });
});