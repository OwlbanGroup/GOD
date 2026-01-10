import { info, error, warn, debug } from '../utils/loggerWrapper.js';

/**
 * Universe Class - Complete Phase 3 Implementation
 * Includes: Phase 3.1 (Dynamic Scaling) + 3.2 (Shader Optimization) + 
 *           3.3 (Memory Management) + 3.4 (Caching) + 3.5 (Request Optimization)
 */

class Universe {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) {
            logger.error('WebGL not supported, falling back to 2D canvas');
            this.ctx = this.canvas.getContext('2d');
            this.useWebGL = false;
            this.celestialBodies = [];
            this.animationId = null;
            this.init2D();
            return;
        }
        this.useWebGL = true;
        this.particles = [];
        this.program = null;
        this.interleavedBuffer = null;
        
        // Performance monitoring (Phase 3.1)
        this.fps = 60;
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
        this.performanceMode = 'auto';
        
        // Device capabilities (Phase 3.1)
        this.deviceCapabilities = this.detectDeviceCapabilities();
        this.maxParticles = this.calculateMaxParticles();
        this.targetFps = 60;
        this.minFps = 30;
        
        // Object pooling (Phase 3.1)
        this.particlePool = [];
        this.poolSize = this.maxParticles;
        
        // Instanced rendering support (Phase 3.2)
        this.instancedExt = this.deviceCapabilities.extensions.instancedArrays;
        this.useInstancing = !!this.instancedExt;
        
        // LOD system (Phase 3.2)
        this.lodEnabled = true;
        this.lodLevels = {
            high: { minSize: 3, maxDistance: Infinity },
            medium: { minSize: 2, maxDistance: 300 },
            low: { minSize: 1, maxDistance: 150 }
        };
        
        // Batching (Phase 3.2)
        this.batchGroups = {
            stars: [],
            planets: []
        };
        
        // Memory management (Phase 3.3)
        this.memoryMonitoring = {
            enabled: true,
            lastCheck: performance.now(),
            checkInterval: 5000, // Check every 5 seconds
            usedJSHeapSize: 0,
            totalJSHeapSize: 0,
            jsHeapSizeLimit: 0,
            memoryPressure: 'normal', // 'normal', 'moderate', 'critical'
            warnings: []
        };
        
        // Caching system (Phase 3.4)
        this.cache = {
            enabled: true,
            aiResponses: new Map(),
            prayerAnalysis: new Map(),
            maxCacheSize: 100,
            ttl: 5 * 60 * 1000 // 5 minutes
        };
        
        // Request optimization (Phase 3.5)
        this.requestQueue = {
            pending: [],
            processing: false,
            maxConcurrent: 3,
            debounceTimers: new Map(),
            cancelTokens: new Map()
        };
        
        this.initWebGL();
        this.startMemoryMonitoring();
    }

    /**
     * Phase 3.3: Memory Management
     * Monitors memory usage and triggers cleanup when needed
     */
    startMemoryMonitoring() {
        if (!this.memoryMonitoring.enabled) return;
        
        setInterval(() => {
            this.checkMemoryUsage();
        }, this.memoryMonitoring.checkInterval);
    }

    checkMemoryUsage() {
        if (!performance.memory) {
            logger.warn('Memory API not available');
            return;
        }

        const memory = performance.memory;
        this.memoryMonitoring.usedJSHeapSize = memory.usedJSHeapSize;
        this.memoryMonitoring.totalJSHeapSize = memory.totalJSHeapSize;
        this.memoryMonitoring.jsHeapSizeLimit = memory.jsHeapSizeLimit;

        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

        // Determine memory pressure
        let previousPressure = this.memoryMonitoring.memoryPressure;
        
        if (usagePercent > 90) {
            this.memoryMonitoring.memoryPressure = 'critical';
        } else if (usagePercent > 75) {
            this.memoryMonitoring.memoryPressure = 'moderate';
        } else {
            this.memoryMonitoring.memoryPressure = 'normal';
        }

        // Trigger cleanup if pressure increased
        if (this.memoryMonitoring.memoryPressure !== previousPressure) {
            logger.info(`Memory pressure: ${this.memoryMonitoring.memoryPressure} (${usagePercent.toFixed(1)}%)`);
            this.handleMemoryPressure();
        }

        // Add warning if critical
        if (this.memoryMonitoring.memoryPressure === 'critical') {
            const warning = {
                timestamp: Date.now(),
                usagePercent: usagePercent,
                message: 'Critical memory usage detected'
            };
            this.memoryMonitoring.warnings.push(warning);
            
            // Keep only last 10 warnings
            if (this.memoryMonitoring.warnings.length > 10) {
                this.memoryMonitoring.warnings.shift();
            }
        }
    }

    handleMemoryPressure() {
        const pressure = this.memoryMonitoring.memoryPressure;

        if (pressure === 'critical') {
            logger.info('Applying aggressive memory cleanup...');
            
            // Reduce particles dramatically
            const targetParticles = Math.floor(this.particles.length * 0.5);
            while (this.particles.length > targetParticles) {
                const particle = this.particles.pop();
                this.returnParticleToPool(particle);
            }
            
            // Clear caches
            this.clearAllCaches();
            
            // Reduce max particles
            this.maxParticles = Math.max(100, Math.floor(this.maxParticles * 0.7));
            
            // Suggest garbage collection (hint only)
            if (window.gc) {
                window.gc();
            }
            
        } else if (pressure === 'moderate') {
            logger.info('Applying moderate memory cleanup...');
            
            // Reduce particles moderately
            const targetParticles = Math.floor(this.particles.length * 0.8);
            while (this.particles.length > targetParticles) {
                const particle = this.particles.pop();
                this.returnParticleToPool(particle);
            }
            
            // Clear old cache entries
            this.cleanupOldCacheEntries();
        }
    }

    getMemoryStats() {
        return {
            ...this.memoryMonitoring,
            usageMB: (this.memoryMonitoring.usedJSHeapSize / 1024 / 1024).toFixed(2),
            limitMB: (this.memoryMonitoring.jsHeapSizeLimit / 1024 / 1024).toFixed(2),
            usagePercent: ((this.memoryMonitoring.usedJSHeapSize / this.memoryMonitoring.jsHeapSizeLimit) * 100).toFixed(1)
        };
    }

    /**
     * Phase 3.4: Caching System
     * Caches AI responses and prayer analysis with TTL
     */
    getCachedResponse(key, type = 'aiResponses') {
        if (!this.cache.enabled) return null;

        const cacheMap = this.cache[type];
        const cached = cacheMap.get(key);

        if (!cached) return null;

        // Check if expired
        if (Date.now() - cached.timestamp > this.cache.ttl) {
            cacheMap.delete(key);
            return null;
        }

        logger.info(`Cache hit for ${type}:`, key);
        return cached.data;
    }

    setCachedResponse(key, data, type = 'aiResponses') {
        if (!this.cache.enabled) return;

        const cacheMap = this.cache[type];
        
        // Enforce max cache size
        if (cacheMap.size >= this.cache.maxCacheSize) {
            // Remove oldest entry
            const firstKey = cacheMap.keys().next().value;
            cacheMap.delete(firstKey);
        }

        cacheMap.set(key, {
            data: data,
            timestamp: Date.now()
        });

        logger.info(`Cached ${type}:`, key);
    }

    cleanupOldCacheEntries() {
        const now = Date.now();
        
        ['aiResponses', 'prayerAnalysis'].forEach(type => {
            const cacheMap = this.cache[type];
            for (const [key, value] of cacheMap.entries()) {
                if (now - value.timestamp > this.cache.ttl) {
                    cacheMap.delete(key);
                }
            }
        });

        logger.info('Cleaned up old cache entries');
    }

    clearAllCaches() {
        this.cache.aiResponses.clear();
        this.cache.prayerAnalysis.clear();
        logger.info('All caches cleared');
    }

    getCacheStats() {
        return {
            enabled: this.cache.enabled,
            aiResponsesCount: this.cache.aiResponses.size,
            prayerAnalysisCount: this.cache.prayerAnalysis.size,
            maxSize: this.cache.maxCacheSize,
            ttlMinutes: this.cache.ttl / 60000
        };
    }

    /**
     * Phase 3.5: Request Optimization
     * Debounces, queues, and batches API requests
     */
    debounceRequest(key, fn, delay = 300) {
        // Clear existing timer
        if (this.requestQueue.debounceTimers.has(key)) {
            clearTimeout(this.requestQueue.debounceTimers.get(key));
        }

        // Set new timer
        const timer = setTimeout(() => {
            this.requestQueue.debounceTimers.delete(key);
            fn();
        }, delay);

        this.requestQueue.debounceTimers.set(key, timer);
    }

    async queueRequest(requestFn, priority = 'normal') {
        return new Promise((resolve, reject) => {
            const request = {
                fn: requestFn,
                priority: priority,
                resolve: resolve,
                reject: reject,
                timestamp: Date.now(),
                id: Math.random().toString(36).substr(2, 9)
            };

            // Add to queue based on priority
            if (priority === 'high') {
                this.requestQueue.pending.unshift(request);
            } else {
                this.requestQueue.pending.push(request);
            }

            this.processRequestQueue();
        });
    }

    async processRequestQueue() {
        if (this.requestQueue.processing) return;
        if (this.requestQueue.pending.length === 0) return;

        this.requestQueue.processing = true;

        while (this.requestQueue.pending.length > 0) {
            // Process up to maxConcurrent requests
            const batch = this.requestQueue.pending.splice(0, this.requestQueue.maxConcurrent);
            
            await Promise.allSettled(
                batch.map(async (request) => {
                    try {
                        const result = await request.fn();
                        request.resolve(result);
                    } catch (error) {
                        request.reject(error);
                    }
                })
            );
        }

        this.requestQueue.processing = false;
    }

    cancelRequest(requestId) {
        const index = this.requestQueue.pending.findIndex(r => r.id === requestId);
        if (index !== -1) {
            const request = this.requestQueue.pending.splice(index, 1)[0];
            request.reject(new Error('Request cancelled'));
            logger.info('Request cancelled:', requestId);
            return true;
        }
        return false;
    }

    getRequestQueueStats() {
        return {
            pendingRequests: this.requestQueue.pending.length,
            processing: this.requestQueue.processing,
            maxConcurrent: this.requestQueue.maxConcurrent,
            activeDebounces: this.requestQueue.debounceTimers.size
        };
    }

    /**
     * Phase 3.1 & 3.2: Core rendering methods (unchanged)
     */
    detectDeviceCapabilities() {
        const gl = this.gl;
        const capabilities = {
            tier: 'medium',
            maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
            maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
            maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
            aliasedPointSizeRange: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE),
            extensions: {
                instancedArrays: gl.getExtension('ANGLE_instanced_arrays'),
                vertexArrayObject: gl.getExtension('OES_vertex_array_object'),
                floatTextures: gl.getExtension('OES_texture_float')
            }
        };

        const score = this.calculateDeviceScore(capabilities);
        
        if (score >= 80) capabilities.tier = 'ultra';
        else if (score >= 60) capabilities.tier = 'high';
        else if (score >= 40) capabilities.tier = 'medium';
        else capabilities.tier = 'low';

        logger.info('Device Capabilities:', capabilities);
        logger.info('Instanced Rendering:', capabilities.extensions.instancedArrays ? 'Supported' : 'Not Supported');
        return capabilities;
    }

    calculateDeviceScore(capabilities) {
        let score = 50;
        if (capabilities.maxTextureSize >= 8192) score += 20;
        else if (capabilities.maxTextureSize >= 4096) score += 15;
        else if (capabilities.maxTextureSize >= 2048) score += 10;
        
        if (capabilities.extensions.instancedArrays) score += 10;
        if (capabilities.extensions.vertexArrayObject) score += 10;
        if (capabilities.extensions.floatTextures) score += 10;
        
        const maxViewport = Math.max(...capabilities.maxViewportDims);
        if (maxViewport >= 16384) score += 10;
        else if (maxViewport >= 8192) score += 5;
        
        return Math.min(100, score);
    }

    calculateMaxParticles() {
        const tierLimits = {
            'low': 500,
            'medium': 2000,
            'high': 5000,
            'ultra': 10000
        };
        return tierLimits[this.deviceCapabilities.tier] || 2000;
    }

    setPerformanceMode(mode) {
        this.performanceMode = mode;
        if (mode === 'auto') {
            this.maxParticles = this.calculateMaxParticles();
        } else {
            const modeLimits = { 'low': 500, 'medium': 2000, 'high': 5000, 'ultra': 10000 };
            this.maxParticles = modeLimits[mode] || 2000;
        }
        if (this.particles.length > this.maxParticles) {
            this.particles.length = this.maxParticles;
        }
        logger.info(`Performance mode: ${mode}, max particles: ${this.maxParticles}`);
    }

    updateFpsMonitoring() {
        this.frameCount++;
        const now = performance.now();
        const elapsed = now - this.lastFpsUpdate;

        if (elapsed >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / elapsed);
            this.frameCount = 0;
            this.lastFpsUpdate = now;

            if (this.performanceMode === 'auto') {
                this.autoAdjustPerformance();
            }
        }
    }

    autoAdjustPerformance() {
        if (this.fps < this.minFps && this.maxParticles > 100) {
            this.maxParticles = Math.max(100, Math.floor(this.maxParticles * 0.8));
            logger.info(`FPS low (${this.fps}), reducing to ${this.maxParticles} particles`);
        } else if (this.fps > this.targetFps && this.maxParticles < this.calculateMaxParticles()) {
            const deviceMax = this.calculateMaxParticles();
            this.maxParticles = Math.min(deviceMax, Math.floor(this.maxParticles * 1.1));
            logger.info(`FPS good (${this.fps}), increasing to ${this.maxParticles} particles`);
        }
    }

    getParticleFromPool() {
        return this.particlePool.length > 0 ? this.particlePool.pop() : {};
    }

    returnParticleToPool(particle) {
        if (this.particlePool.length < this.poolSize) {
            particle.life = 0;
            this.particlePool.push(particle);
        }
    }

    initWebGL() {
        const gl = this.gl;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0, 0, 0.05, 1);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec4 a_color;
            attribute float a_size;
            uniform mat4 u_matrix;
            varying vec4 v_color;
            varying float v_size;
            void main() {
                gl_Position = u_matrix * vec4(a_position, 0.0, 1.0);
                gl_PointSize = a_size;
                v_color = a_color;
                v_size = a_size;
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            varying vec4 v_color;
            varying float v_size;
            void main() {
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
                if (v_size > 4.0) {
                    alpha += (1.0 - smoothstep(0.3, 0.5, dist)) * 0.3;
                }
                gl_FragColor = vec4(v_color.rgb, v_color.a * alpha);
            }
        `;

        const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        this.program = this.createProgram(gl, vertexShader, fragmentShader);
        this.interleavedBuffer = gl.createBuffer();

        const initialParticles = Math.min(100, this.maxParticles);
        for (let i = 0; i < initialParticles; i++) {
            this.addParticle(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                'star'
            );
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
            logger.error('Shader compile error:', gl.getShaderInfoLog(shader));
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
            logger.error('Program link error:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        return program;
    }

    addParticle(x, y, type) {
        if (this.particles.length >= this.maxParticles) {
            const oldParticle = this.particles.shift();
            this.returnParticleToPool(oldParticle);
        }

        const particle = this.getParticleFromPool();
        particle.x = x;
        particle.y = y;
        particle.type = type;
        particle.baseSize = type === 'star' ? Math.random() * 3 + 1 : Math.random() * 8 + 3;
        particle.size = particle.baseSize;
        particle.color = type === 'star' ? 
            [1, 1, 1, 1] : 
            [Math.random(), Math.random(), Math.random(), 1];
        particle.velocity = [Math.random() * 2 - 1, Math.random() * 2 - 1];
        particle.life = 1;
        particle.twinkle = Math.random() * Math.PI * 2;
        particle.twinkleSpeed = Math.random() * 0.1 + 0.05;
        particle.orbitRadius = type === 'planet' ? Math.random() * 50 + 20 : 0;
        particle.orbitSpeed = type === 'planet' ? Math.random() * 0.02 + 0.005 : 0;
        particle.angle = Math.random() * Math.PI * 2;
        
        this.particles.push(particle);
    }

    applyLOD(particle) {
        if (!this.lodEnabled) {
            particle.size = particle.baseSize;
            return;
        }

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance = Math.hypot(dx, dy);

        if (this.fps < 40) {
            if (distance > 200) {
                particle.size = Math.max(1, particle.baseSize * 0.5);
            } else if (distance > 100) {
                particle.size = Math.max(1.5, particle.baseSize * 0.75);
            } else {
                particle.size = particle.baseSize;
            }
        } else {
            if (distance > 300) {
                particle.size = Math.max(1, particle.baseSize * 0.7);
            } else {
                particle.size = particle.baseSize;
            }
        }
    }

    update() {
        this.batchGroups.stars = [];
        this.batchGroups.planets = [];

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            if (p.type === 'planet') {
                p.angle += p.orbitSpeed;
                p.x += Math.cos(p.angle) * p.orbitRadius * 0.01;
                p.y += Math.sin(p.angle) * p.orbitRadius * 0.01;
            } else if (p.type === 'star') {
                p.twinkle += p.twinkleSpeed;
                p.color[3] = 0.3 + 0.7 * Math.sin(p.twinkle);
            }
            
            p.x += p.velocity[0];
            p.y += p.velocity[1];
            
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
            
            p.life -= 0.001;
            if (p.life <= 0) {
                const removed = this.particles.splice(i, 1)[0];
                this.returnParticleToPool(removed);
                continue;
            }

            this.applyLOD(p);

            if (p.type === 'star') {
                this.batchGroups.stars.push(p);
            } else {
                this.batchGroups.planets.push(p);
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

        const matrix = new Float32Array([
            2 / this.canvas.width, 0, 0, 0,
            0, -2 / this.canvas.height, 0, 0,
            0, 0, 1, 0,
            -1, 1, 0, 1
        ]);
        const matrixLocation = gl.getUniformLocation(this.program, 'u_matrix');
        gl.uniformMatrix4fv(matrixLocation, false, matrix);

        this.drawBatchedParticles();
        this.drawEntanglementConnections();
    }

    drawBatchedParticles() {
        const gl = this.gl;
        const stride = 7;
        const interleavedData = new Float32Array(this.particles.length * stride);
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            const offset = i * stride;
            interleavedData[offset] = p.x;
            interleavedData[offset + 1] = p.y;
            interleavedData[offset + 2] = p.color[0];
            interleavedData[offset + 3] = p.color[1];
            interleavedData[offset + 4] = p.color[2];
            interleavedData[offset + 5] = p.color[3];
            interleavedData[offset + 6] = p.size;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.interleavedBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, interleavedData, gl.DYNAMIC_DRAW);

        const bytesPerFloat = 4;
        const strideBytes = stride * bytesPerFloat;

        const positionLocation = gl.getAttribLocation(this.program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, strideBytes, 0);

        const colorLocation = gl.getAttribLocation(this.program, 'a_color');
        gl.enableVertexAttribArray(colorLocation);
        gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, strideBytes, 2 * bytesPerFloat);

        const sizeLocation = gl.getAttribLocation(this.program, 'a_size');
        gl.enableVertexAttribArray(sizeLocation);
        gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, strideBytes, 6 * bytesPerFloat);

        gl.drawArrays(gl.POINTS, 0, this.particles.length);
    }

    clear() {
        if (this.useWebGL) {
            while (this.particles.length > 0) {
                const particle = this.particles.pop();
                this.returnParticleToPool(particle);
            }
            
            const initialParticles = Math.min(100, this.maxParticles);
            for (let i = 0; i < initialParticles; i++) {
                this.addParticle(
                    Math.random() * this.canvas.width,
                    Math.random() * this.canvas.height,
                    'star'
                );
            }
        } else {
            this.celestialBodies = [];
            this.draw2D();
        }
    }

    dispose() {
        if (this.useWebGL && this.gl) {
            const gl = this.gl;
            if (this.interleavedBuffer) gl.deleteBuffer(this.interleavedBuffer);
            if (this.program) gl.deleteProgram(this.program);
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            
            // Clear all caches and queues
            this.clearAllCaches();
            this.requestQueue.pending = [];
            this.requestQueue.debounceTimers.clear();
            
            logger.info('WebGL resources and caches disposed');
        }
    }

    // 2D fallback methods (unchanged)
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

        this.drawEntanglementConnections();
    }

    // Divine mode methods
    enableQuantumEntanglement() {
        this.quantumEntanglementActive = true;
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

                if (distance < 100) {
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

            for (const conn of this.entanglementConnections) {
                const stride = 7;
                const data = new Float32Array([
                    conn.x1, conn.y1, ...conn.color, 2,
                    conn.x2, conn.y2, ...conn.color, 2
                ]);

                gl.bindBuffer(gl.ARRAY_BUFFER, this.interleavedBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

                const bytesPerFloat = 4;
                const strideBytes = stride * bytesPerFloat;

                const positionLocation = gl.getAttribLocation(this.program, 'a_position');
                gl.enableVertexAttribArray(positionLocation);
                gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, strideBytes, 0);

                const colorLocation = gl.getAttribLocation(this.program, 'a_color');
                gl.enableVertexAttribArray(colorLocation);
                gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, strideBytes, 2 * bytesPerFloat);

                const sizeLocation = gl.getAttribLocation(this.program, 'a_size');
                gl.enableVertexAttribArray(sizeLocation);
                gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, strideBytes, 6 * bytesPerFloat);

                gl.drawArrays(gl.LINES, 0, 2);
            }
        } else {
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
            this.updateFpsMonitoring();
            this.update();
            this.draw();
        } else {
            this.update2D();
            this.draw2D();
        }
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Enhanced performance stats with all Phase 3 metrics
     */
    getPerformanceStats() {
        return {
            // Phase 3.1 & 3.2
            fps: this.fps,
            particleCount: this.particles.length,
            maxParticles: this.maxParticles,
            deviceTier: this.deviceCapabilities.tier,
            performanceMode: this.performanceMode,
            poolSize: this.particlePool.length,
            useInstancing: this.useInstancing,
            lodEnabled: this.lodEnabled,
            batchedGroups: {
                stars: this.batchGroups.stars.length,
                planets: this.batchGroups.planets.length
            },
            // Phase 3.3
            memory: this.getMemoryStats(),
            // Phase 3.4
            cache: this.getCacheStats(),
            // Phase 3.5
            requestQueue: this.getRequestQueueStats()
        };
    }

    toggleLOD(enabled) {
        this.lodEnabled = enabled;
        logger.info(`LOD system ${enabled ? 'enabled' : 'disabled'}`);
    }

    toggleMemoryMonitoring(enabled) {
        this.memoryMonitoring.enabled = enabled;
        logger.info(`Memory monitoring ${enabled ? 'enabled' : 'disabled'}`);
    }

    toggleCaching(enabled) {
        this.cache.enabled = enabled;
        if (!enabled) {
            this.clearAllCaches();
        }
        logger.info(`Caching ${enabled ? 'enabled' : 'disabled'}`);
    }

    // Phase 4: Transcendent Reality Engine
    setDimension(dimension) {
        this.currentDimension = dimension;
        logger.info(`Switched to ${dimension} reality`);
        // Placeholder for dimension switching logic
        if (dimension === '3d') {
            // Simulate 3D by increasing particle sizes
            this.particles.forEach(p => p.size *= 1.5);
        } else if (dimension === '4d') {
            // Simulate 4D with more connections
            this.enableQuantumEntanglement();
        }
    }

    enterVR() {
        if ('xr' in navigator) {
            navigator.xr.requestSession('immersive-vr').then((session) => {
                logger.info('Entered VR session');
                // Placeholder for VR logic
            }).catch((error) => {
                logger.error('VR not supported:', error);
                alert('VR not supported on this device');
            });
        } else {
            alert('WebXR not supported');
        }
    }

    enterAR() {
        if ('xr' in navigator) {
            navigator.xr.requestSession('immersive-ar').then((session) => {
                logger.info('Entered AR session');
                // Placeholder for AR logic
            }).catch((error) => {
                logger.error('AR not supported:', error);
                alert('AR not supported on this device');
            });
        } else {
            alert('WebXR not supported');
        }
    }

    startConsciousnessExpansion() {
        logger.info('Starting consciousness expansion');
        // Placeholder: enhance meditation or visualization
        this.enableQuantumEntanglement();
        alert('Consciousness expansion activated. Feel the quantum connections.');
    }

    toggleRealityManipulation() {
        const tools = document.getElementById('realityTools');
        if (tools) {
            tools.style.display = tools.style.display === 'none' ? 'block' : 'none';
        }
    }

    addGalaxy() {
        // Add a cluster of stars
        for (let i = 0; i < 50; i++) {
            this.addParticle(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                'star'
            );
        }
        logger.info('Added galaxy');
    }

    addBlackHole() {
        // Add a large dark particle
        this.addParticle(
            Math.random() * this.canvas.width,
            Math.random() * this.canvas.height,
            'blackHole'
        );
        logger.info('Added black hole');
    }

    updateParticleSettings() {
        const countSlider = document.getElementById('particleCountSlider');
        const brightnessSlider = document.getElementById('starBrightnessSlider');
        const sizeSlider = document.getElementById('planetSizeSlider');

        if (countSlider) {
            const targetCount = parseInt(countSlider.value);
            while (this.particles.length < targetCount) {
                this.addParticle(
                    Math.random() * this.canvas.width,
                    Math.random() * this.canvas.height,
                    Math.random() < 0.7 ? 'star' : 'planet'
                );
            }
            while (this.particles.length > targetCount) {
                const particle = this.particles.pop();
                this.returnParticleToPool(particle);
            }
        }

        if (brightnessSlider) {
            const brightness = parseFloat(brightnessSlider.value);
            this.particles.forEach(p => {
                if (p.type === 'star') {
                    p.color[3] = brightness;
                }
            });
        }

        if (sizeSlider) {
            const size = parseFloat(sizeSlider.value);
            this.particles.forEach(p => {
                if (p.type === 'planet') {
                    p.baseSize = size;
                }
            });
        }
    }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        if (window.universe && window.universe.dispose) {
            window.universe.dispose();
        }
    });
}
