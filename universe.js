class Universe {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.celestialBodies = [];
        this.initialize();
    }

    initialize() {
        // Draw initial stars
        for (let i = 0; i < 50; i++) {
            this.addStar(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
        }
        this.draw();
    }

    addStar(x, y) {
        this.celestialBodies.push({
            type: 'star',
            x: x,
            y: y,
            radius: Math.random() * 2 + 1,
            color: '#ffffff'
        });
    }

    addPlanet(x, y) {
        this.celestialBodies.push({
            type: 'planet',
            x: x,
            y: y,
            radius: Math.random() * 10 + 5,
            color: `hsl(${Math.random() * 360}, 50%, 50%)`
        });
    }

    clear() {
        this.celestialBodies = [];
        this.initialize();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const body of this.celestialBodies) {
            this.ctx.beginPath();
            this.ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = body.color;
            this.ctx.fill();
            // Add glow effect for golden stars
            if (body.type === 'goldenStar') {
                this.ctx.shadowColor = '#FFD700';
                this.ctx.shadowBlur = 10;
                this.ctx.fill();
                this.ctx.shadowBlur = 0; // Reset shadow
            }
        }
    }
}
