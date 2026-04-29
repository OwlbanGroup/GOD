/**
 * @jest-environment jsdom
 */

const universe = require('../../universe.js');

// Mock canvas
document.body.innerHTML = '<canvas id="universeCanvas"></canvas>';
const canvas = document.getElementById('universeCanvas');
const ctx = canvas.getContext('2d');
ctx.clearRect = jest.fn();
ctx.fillRect = jest.fn();

describe('Integration: Canvas/WebGL Rendering', () => {
  test('should initialize canvas correctly', () => {
    expect(universe.canvas).toBeDefined();
    expect(universe.celestialBodies).toBeDefined();
    expect(universe.particles).toBeDefined();
  });

  test('should add star and draw', () => {
    universe.addStar(100, 100);
    universe.draw();

    expect(universe.celestial
