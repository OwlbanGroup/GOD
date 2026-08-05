/**
 * @jest-environment jsdom
 */

const Universe = require('../../universe.js').default;

// Mock canvas 2D context since jsdom doesn't implement it
const mockContext = {
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  })),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  globalAlpha: 1,
  shadowColor: '',
  shadowBlur: 0
};

// Mock canvas element - return null for webgl (not supported) and 2D mock for '2d'
document.body.innerHTML = '<canvas id="universeCanvas"></canvas>';
HTMLCanvasElement.prototype.getContext = jest.fn((type) => 
  type === '2d' ? mockContext : null
);

const universe = new Universe('universeCanvas');

describe('Integration: Canvas/WebGL Rendering', () => {
  test('should initialize canvas correctly', () => {
    expect(universe.canvas).toBeDefined();
    // In 2D fallback mode, celestialBodies is defined; in WebGL mode, particles is defined
    expect(universe.celestialBodies || universe.particles).toBeDefined();
  });

  test('should add star and draw', () => {
    universe.addStar(100, 100);
    universe.draw();

    expect(universe.celestialBodies.length).toBeGreaterThan(0);
  });
});