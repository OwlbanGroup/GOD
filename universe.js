class Universe {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.celestialBodies = [];
        this.animationId = null;
        this.init();
    }

    init() {
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            this.addCelestialBodyAt(x, y);
        });
        this.animate();
    }

    addCelestialBodyAt(x, y) {
        // Randomly add a star or planet
        if (Math.random() < 0.7) {
            this.addStar(x, y);
        } else {
            this.addPlanet(x, y);
        }
        this.draw();
    }

    addStar(x, y) {
        this.celestialBodies.push({
            type: 'star',
            x: x,
            y: y,
            radius: Math.random() * 3 + 1,
            color: '#ffffff',
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.1 + 0.05
        });
    }

    addPlanet(x, y) {
        this.celestialBodies.push({
            type: 'planet',
            x: x,
            y: y,
            radius: Math.random() * 8 + 3,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            orbitRadius: Math.random() * 50 + 20,
            orbitSpeed: Math.random() * 0.02 + 0.005,
            angle: Math.random() * Math.PI * 2,
            rings: Math.random() > 0.7 // Some planets have rings
        });
    }

    animate() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    update() {
        for (const body of this.celestialBodies) {
            if (body.type === 'planet') {
                body.angle += body.orbitSpeed;
            } else if (body.type === 'star') {
                body.twinkle += body.twinkleSpeed;
            }
        }
    }

    draw() {
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#000011');
        gradient.addColorStop(0.5, '#000033');
        gradient.addColorStop(1, '#000011');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (const body of this.celestialBodies) {
            this.ctx.save();
            if (body.type === 'planet') {
                const centerX = body.x;
                const centerY = body.y;
                const orbitX = centerX + Math.cos(body.angle) * body.orbitRadius;
                const orbitY = centerY + Math.sin(body.angle) * body.orbitRadius;

                // Draw orbit path (subtle)
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, body.orbitRadius, 0, Math.PI * 2);
                this.ctx.stroke();

                // Draw planet
                this.ctx.fillStyle = body.color;
                this.ctx.beginPath();
                this.ctx.arc(orbitX, orbitY, body.radius, 0, Math.PI * 2);
                this.ctx.fill();

                // Draw rings if applicable
                if (body.rings) {
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(orbitX, orbitY, body.radius * 1.5, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
            } else if (body.type === 'star') {
                this.ctx.fillStyle = body.color;
                const twinkleFactor = 0.3 + 0.7 * Math.sin(body.twinkle);
                this.ctx.globalAlpha = twinkleFactor;
                this.ctx.beginPath();
                this.ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
                this.ctx.fill();

                // Add star glow effect
                this.ctx.shadowColor = '#ffffff';
                this.ctx.shadowBlur = 10;
                this.ctx.beginPath();
                this.ctx.arc(body.x, body.y, body.radius * 2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            } else if (body.type === 'goldenStar') {
                this.ctx.fillStyle = body.color;
                this.ctx.beginPath();
                this.ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
                this.ctx.fill();

                // Golden glow
                this.ctx.shadowColor = '#FFD700';
                this.ctx.shadowBlur = 15;
                this.ctx.beginPath();
                this.ctx.arc(body.x, body.y, body.radius * 1.5, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
            this.ctx.restore();
        }
    }

    clear() {
        this.celestialBodies = [];
        this.draw();
    }
}
