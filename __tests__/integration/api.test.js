/**
 * @jest-environment jsdom
 */

const { default: azureIntegrations } = await import('../../azure-integrations.js');
const foundryVttIntegrations = require('../../foundry-vtt-integrations.js');

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Integration: API Integrations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Azure Integrations', () => {
    test('should call Azure API successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'azure response' })
      });

      const result = await azureIntegrations.callAzureAPI('test');
      
      expect(global.fetch).toHaveBeenCalled();
      expect(result).toEqual({ data: 'azure response' });
    });

    test('should handle Azure API error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Azure error'));

      const result = await azureIntegrations.callAzureAPI('test');
      
      expect(global.fetch).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('Foundry VTT Integrations', () => {
    test('should send prayer to Foundry VTT', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true })
      });

      const result = await foundryVttIntegrations.sendPrayerToFoundry('test prayer');
      
      expect(global.fetch).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test('should handle Foundry VTT error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Foundry error'));

      const result = await foundryVttIntegrations.sendPrayerToFoundry('test');
      
      expect(global.fetch).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
