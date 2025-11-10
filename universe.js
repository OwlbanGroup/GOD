class Universe {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) {
            console.error('WebGL not supported, falling back to 2D canvas');
            // Fallback to 2D if WebGL fails
            this.ctx = this.canvas.getContext('2d');
            this.useWebGL = false;
            this.celestialBodies = [];
            this.animationId = null;
            this.init2D();
            return;
        }
        this.useWebGL = true;
        this.particles = []; // For particle system
        this.program = null;
        this.vertexBuffer = null;
        this.colorBuffer = null;
        this.initWebGL();
    }

    initWebGL() {
        // Initialize WebGL context
        const gl = this.gl;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0, 0, 0.05, 1); // Dark space background
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

        // Vertex shader
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec4 a_color;
            uniform mat4 u_matrix;
            varying vec4 v_color;
            void main() {
                gl_Position = u_matrix * vec4(a_position, 0, 1);
                gl_PointSize = 5;
                v_color = a_color;
            }
        `;

        // Fragment shader
        const fragmentShaderSource = `
            precision mediump float;
            varying vec4 v_color;
            void main() {
                float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
                if (dist > 0.5) discard;
                gl_FragColor = v_color;
            }
        `;

        const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        this.program = this.createProgram(gl, vertexShader, fragmentShader);

        this.vertexBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();

        // Add initial particles
        for (let i = 0; i < 100; i++) {
            this.addParticle(Math.random() * this.canvas.width, Math.random() * this.canvas.height, 'star');
        }

        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            this.addParticle(x, y, Math.random() < 0.7 ? 'star' : 'planet');
        });

        this.animate();
    }

    createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        return program;
    }

    addParticle(x, y, type) {
        const particle = {
            x: x,
            y: y,
            type: type,
            size: type === 'star' ? Math.random() * 3 + 1 : Math.random() * 8 + 3,
            color: type === 'star' ? [1, 1, 1, 1] : [Math.random(), Math.random(), Math.random(), 1],
            velocity: [Math.random() * 2 - 1, Math.random() * 2 - 1],
            life: 1,
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.1 + 0.05,
            orbitRadius: type === 'planet' ? Math.random() * 50 + 20 : 0,
            orbitSpeed: type === 'planet' ? Math.random() * 0.02 + 0.005 : 0,
            angle: Math.random() * Math.PI * 2
        };
        this.particles.push(particle);
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (p.type === 'planet') {
                p.angle += p.orbitSpeed;
                p.x += Math.cos(p.angle) * p.orbitRadius * 0.01; // Subtle movement
                p.y += Math.sin(p.angle) * p.orbitRadius * 0.01;
            } else if (p.type === 'star') {
                p.twinkle += p.twinkleSpeed;
                p.color[3] = 0.3 + 0.7 * Math.sin(p.twinkle); // Twinkle effect
            }
            // Simple physics
            p.x += p.velocity[0];
            p.y += p.velocity[1];
            // Wrap around edges
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
            p.life -= 0.001;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        this.updateEntanglementConnections();
    }

    draw() {
        if (!this.useWebGL) {
            this.draw2D();
            return;
        }
        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this.program);

        // Set up matrices for 2D projection
        const matrix = new Float32Array([
            2 / this.canvas.width, 0, 0, 0,
            0, -2 / this.canvas.height, 0, 0,
            0, 0, 1, 0,
            -1, 1, 0, 1
        ]);
        const matrixLocation = gl.getUniformLocation(this.program, 'u_matrix');
        gl.uniformMatrix4fv(matrixLocation, false, matrix);

        // Prepare vertex and color data
        const vertices = [];
        const colors = [];
        for (const p of this.particles) {
            vertices.push(p.x, p.y);
            colors.push(...p.color);
        }

        // Bind vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
        const positionLocation = gl.getAttribLocation(this.program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Bind color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
        const colorLocation = gl.getAttribLocation(this.program, 'a_color');
        gl.enableVertexAttribArray(colorLocation);
        gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

        // Draw particles
        gl.drawArrays(gl.POINTS, 0, this.particles.length);

        // Draw entanglement connections
        this.drawEntanglementConnections();
    }

    clear() {
        if (this.useWebGL) {
            this.particles = [];
            for (let i = 0; i < 100; i++) {
                this.addParticle(Math.random() * this.canvas.width, Math.random() * this.canvas.height, 'star');
            }
        } else {
            this.celestialBodies = [];
            this.draw2D();
        }
    }

    // Fallback 2D methods
    init2D() {
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            this.addCelestialBodyAt(x, y);
        });
        this.animate();
    }

    addCelestialBodyAt(x, y) {
        if (Math.random() < 0.7) {
            this.addStar(x, y);
        } else {
            this.addPlanet(x, y);
        }
        this.draw2D();
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
            rings: Math.random() > 0.7
        });
    }

    update2D() {
        for (const body of this.celestialBodies) {
            if (body.type === 'planet') {
                body.angle += body.orbitSpeed;
            } else if (body.type === 'star') {
                body.twinkle += body.twinkleSpeed;
            }
        }
    }

    draw2D() {
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

                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, body.orbitRadius, 0, Math.PI * 2);
                this.ctx.stroke();

                this.ctx.fillStyle = body.color;
                this.ctx.beginPath();
                this.ctx.arc(orbitX, orbitY, body.radius, 0, Math.PI * 2);
                this.ctx.fill();

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

                this.ctx.shadowColor = '#FFD700';
                this.ctx.shadowBlur = 15;
                this.ctx.beginPath();
                this.ctx.arc(body.x, body.y, body.radius * 1.5, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
            this.ctx.restore();
        }

        // Draw entanglement connections for 2D
        this.drawEntanglementConnections();
    }

    // Divine mode methods
    enableQuantumEntanglement() {
        this.quantumEntanglementActive = true;
        // Add entanglement connections between nearby particles
        this.entanglementConnections = [];
        this.updateEntanglementConnections();
    }

    disableQuantumEntanglement() {
        this.quantumEntanglementActive = false;
        this.entanglementConnections = [];
    }

    updateEntanglementConnections() {
        if (!this.quantumEntanglementActive) return;

        this.entanglementConnections = [];
        const particles = this.useWebGL ? this.particles : this.celestialBodies;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.hypot(dx, dy);

                if (distance < 100) { // Connection threshold
                    this.entanglementConnections.push({
                        x1: p1.x, y1: p1.y,
                        x2: p2.x, y2: p2.y,
                        strength: 1 - (distance / 100),
                        color: this.quantumEntanglementColor || [0.5, 0.8, 1, 0.3]
                    });
                }
            }
        }
    }

    drawEntanglementConnections() {
        if (!this.quantumEntanglementActive || !this.entanglementConnections.length) return;

        if (this.useWebGL) {
            // WebGL entanglement lines
            const gl = this.gl;
            gl.useProgram(this.program);

            const matrix = new Float32Array([
                2 / this.canvas.width, 0, 0, 0,
                0, -2 / this.canvas.height, 0, 0,
                0, 0, 1, 0,
                -1, 1, 0, 1
            ]);
            const matrixLocation = gl.getUniformLocation(this.program, 'u_matrix');
            gl.uniformMatrix4fv(matrixLocation, false, matrix);

            // Draw lines for entanglement
            for (const conn of this.entanglementConnections) {
                const vertices = [conn.x1, conn.y1, conn.x2, conn.y2];
                const colors = [...conn.color, ...conn.color];

                gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
                const positionLocation = gl.getAttribLocation(this.program, 'a_position');
                gl.enableVertexAttribArray(positionLocation);
                gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
                const colorLocation = gl.getAttribLocation(this.program, 'a_color');
                gl.enableVertexAttribArray(colorLocation);
                gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

                gl.drawArrays(gl.LINES, 0, 2);
            }
        } else {
            // 2D entanglement lines
            this.ctx.save();
            for (const conn of this.entanglementConnections) {
                this.ctx.strokeStyle = `rgba(${Math.floor(conn.color[0] * 255)}, ${Math.floor(conn.color[1] * 255)}, ${Math.floor(conn.color[2] * 255)}, ${conn.strength * 0.5})`;
                this.ctx.lineWidth = conn.strength * 2;
                this.ctx.beginPath();
                this.ctx.moveTo(conn.x1, conn.y1);
                this.ctx.lineTo(conn.x2, conn.y2);
                this.ctx.stroke();
            }
            this.ctx.restore();
        }
    }

    animate() {
        if (this.useWebGL) {
            this.update();
            this.draw();
        } else {
            this.update2D();
            this.draw2D();
        }
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}
