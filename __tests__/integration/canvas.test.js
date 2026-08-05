/**
 * @jest-environment jsdom
 */

const Universe = require('../../universe.js').default;

// Mock canvas
document.body.innerHTML = '<canvas id="universeCanvas"></canvas>';
const canvas = document.getElementById('universeCanvas');
const ctx = canvas.getContext('2d');
ctx.clearRect = jest.fn();
ctx.fillRect = jest.fn();

const universe = new Universe('universeCanvas');

describe('Integration: Canvas/WebGL Rendering', () => {
  test('should initialize canvas correctly', () => {
    expect(universe.canvas).toBeDefined();
    expect(universe.celestialBodies).toBeDefined();
    expect(universe.particles).toBeDefined();
  });

  test('should add star and draw', () => {
    universe.addStar(100, 100);
    universe.draw();

    expect(universe.celestialBodies.length).toBeGreaterThan(0);
  });
});