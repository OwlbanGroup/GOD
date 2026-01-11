/**
 * Advanced Physics Engine for Universe Simulation
 * @module features/physics/physicsEngine
 */

export class PhysicsEngine {
    constructor(options = {}) {
        this.gravityConstant = options.gravityConstant || 0.1;
        this.collisionThreshold = options.collisionThreshold || 20;
        this.blackHoleStrength = options.blackHoleStrength || 2.0;
        this.timeStep = options.timeStep || 0.016; // ~60fps
        this.damping = options.damping || 0.99;
        this.maxVelocity = options.maxVelocity || 10;

        this.bodies = [];
        this.forces = new Map();
        this.collisions = [];
        this.events = [];

        this.specialEvents = {
            supernova: false,
            nebula: false,
            blackHole: false
        };
    }

    /**
     * Add a celestial body to the physics simulation
     */
    addBody(body) {
        this.bodies.push({
            id: body.id || Math.random().toString(36).substr(2, 9),
            x: body.x,
            y: body.y,
            vx: body.vx || 0,
            vy: body.vy || 0,
            mass: body.mass || 1,
            radius: body.radius || 5,
            type: body.type || 'star',
            density: body.density || 1,
            temperature: body.temperature || 5000,
            luminosity: body.luminosity || 1,
            age: body.age || 0,
            fixed: body.fixed || false, // Fixed bodies don't move
            ...body
        });
    }

    /**
     * Remove a body from simulation
     */
    removeBody(bodyId) {
        const index = this.bodies.findIndex(b => b.id === bodyId);
        if (index !== -1) {
            this.bodies.splice(index, 1);
        }
    }

    /**
     * Calculate gravitational force between two bodies
     */
    calculateGravitationalForce(body1, body2) {
        const dx = body2.x - body1.x;
        const dy = body2.y - body1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Avoid division by zero and extreme forces
        const minDistance = Math.max(body1.radius + body2.radius, 1);
        const effectiveDistance = Math.max(distance, minDistance);

        const force = (this.gravityConstant * body1.mass * body2.mass) / (effectiveDistance * effectiveDistance);

        // Normalize direction
        const fx = force * (dx / effectiveDistance);
        const fy = force * (dy / effectiveDistance);

        return { fx, fy, distance: effectiveDistance };
    }

    /**
     * Apply gravitational forces to all bodies
     */
    applyGravitationalForces() {
        this.forces.clear();

        // Calculate forces between all pairs
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const body1 = this.bodies[i];
                const body2 = this.bodies[j];

                const force = this.calculateGravitationalForce(body1, body2);

                // Apply equal and opposite forces
                this.addForce(body1.id, force.fx, force.fy);
                this.addForce(body2.id, -force.fx, -force.fy);

                // Check for collision
                if (force.distance <= this.collisionThreshold) {
                    this.handleCollision(body1, body2, force.distance);
                }
            }
        }
    }

    /**
     * Add force to a body
     */
    addForce(bodyId, fx, fy) {
        if (!this.forces.has(bodyId)) {
            this.forces.set(bodyId, { fx: 0, fy: 0 });
        }
        const force = this.forces.get(bodyId);
        force.fx += fx;
        force.fy += fy;
    }

    /**
     * Handle collision between two bodies
     */
    handleCollision(body1, body2, distance) {
        // Simple elastic collision for now
        const overlap = this.collisionThreshold - distance;
        if (overlap > 0) {
            // Separate bodies
            const separationX = (body2.x - body1.x) / distance * overlap * 0.5;
            const separationY = (body2.y - body1.y) / distance * overlap * 0.5;

            if (!body1.fixed) {
                body1.x -= separationX;
                body1.y -= separationY;
            }
            if (!body2.fixed) {
                body2.x += separationX;
                body2.y += separationY;
            }

            // Exchange velocities (simplified)
            const tempVx = body1.vx;
            const tempVy = body1.vy;
            body1.vx = body2.vx * 0.8; // Some energy loss
            body1.vy = body2.vy * 0.8;
            body2.vx = tempVx * 0.8;
            body2.vy = tempVy * 0.8;
        }

        // Check for special events
        this.checkSpecialEvents(body1, body2);
    }

    /**
     * Check for special celestial events
     */
    checkSpecialEvents(body1, body2) {
        // Supernova: Two stars colliding at high velocity
        if (body1.type === 'star' && body2.type === 'star') {
            const relativeSpeed = Math.sqrt(
                Math.pow(body1.vx - body2.vx, 2) +
                Math.pow(body1.vy - body2.vy, 2)
            );

            if (relativeSpeed > 5) {
                this.triggerSupernova(body1, body2);
            }
        }

        // Black hole formation: Massive star collapse
        if (body1.type === 'star' && body1.mass > 10) {
            this.triggerBlackHoleFormation(body1);
        }
    }

    /**
     * Trigger supernova event
     */
    triggerSupernova(body1, body2) {
        this.events.push({
            type: 'supernova',
            x: (body1.x + body2.x) / 2,
            y: (body1.y + body2.y) / 2,
            timestamp: Date.now(),
            bodies: [body1.id, body2.id]
        });

        // Remove original bodies and create new ones
        this.removeBody(body1.id);
        this.removeBody(body2.id);

        // Create supernova remnant (nebula)
        this.addBody({
            x: (body1.x + body2.x) / 2,
            y: (body1.y + body2.y) / 2,
            type: 'nebula',
            mass: (body1.mass + body2.mass) * 0.1,
            radius: Math.max(body1.radius, body2.radius) * 3,
            color: [1, 0.5, 0, 0.8]
        });
    }

    /**
     * Trigger black hole formation
     */
    triggerBlackHoleFormation(body) {
        this.events.push({
            type: 'blackHole',
            x: body.x,
            y: body.y,
            timestamp: Date.now(),
            bodyId: body.id
        });

        // Replace star with black hole
        const blackHoleIndex = this.bodies.findIndex(b => b.id === body.id);
        if (blackHoleIndex !== -1) {
            this.bodies[blackHoleIndex] = {
                ...body,
                type: 'blackHole',
                mass: body.mass * 5, // Much more massive
                radius: body.radius * 0.5, // Smaller radius
                color: [0, 0, 0, 1],
                eventHorizon: body.radius * 2
            };
        }
    }

    /**
     * Apply black hole gravitational effects
     */
    applyBlackHoleEffects() {
        const blackHoles = this.bodies.filter(b => b.type === 'blackHole');

        blackHoles.forEach(blackHole => {
            this.bodies.forEach(body => {
                if (body.id === blackHole.id || body.fixed) return;

                const dx = blackHole.x - body.x;
                const dy = blackHole.y - body.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Event horizon - body gets consumed
                if (distance < blackHole.eventHorizon) {
                    this.events.push({
                        type: 'consumed',
                        blackHoleId: blackHole.id,
                        bodyId: body.id,
                        timestamp: Date.now()
                    });
                    this.removeBody(body.id);
                    blackHole.mass += body.mass * 0.8; // Most mass absorbed
                    return;
                }

                // Strong gravitational pull
                const force = (this.blackHoleStrength * blackHole.mass * body.mass) / (distance * distance);
                const fx = force * (dx / distance);
                const fy = force * (dy / distance);

                body.vx += fx / body.mass * this.timeStep;
                body.vy += fy / body.mass * this.timeStep;
            });
        });
    }

    /**
     * Update physics simulation
     */
    update(deltaTime = this.timeStep) {
        // Clear previous collisions
        this.collisions = [];
        this.events = [];

        // Apply gravitational forces
        this.applyGravitationalForces();

        // Apply black hole effects
        this.applyBlackHoleEffects();

        // Update positions and velocities
        this.bodies.forEach(body => {
            if (body.fixed) return;

            // Apply accumulated forces
            const force = this.forces.get(body.id);
            if (force) {
                body.vx += (force.fx / body.mass) * deltaTime;
                body.vy += (force.fy / body.mass) * deltaTime;
            }

            // Apply damping
            body.vx *= this.damping;
            body.vy *= this.damping;

            // Limit velocity
            const speed = Math.sqrt(body.vx * body.vx + body.vy * body.vy);
            if (speed > this.maxVelocity) {
                body.vx = (body.vx / speed) * this.maxVelocity;
                body.vy = (body.vy / speed) * this.maxVelocity;
            }

            // Update position
            body.x += body.vx * deltaTime * 60; // Scale for 60fps
            body.y += body.vy * deltaTime * 60;

            // Update age
            body.age += deltaTime;
        });
    }

    /**
     * Get current physics state
     */
    getState() {
        return {
            bodies: this.bodies.map(body => ({ ...body })),
            forces: Array.from(this.forces.entries()),
            collisions: [...this.collisions],
            events: [...this.events],
            specialEvents: { ...this.specialEvents }
        };
    }

    /**
     * Reset physics simulation
     */
    reset() {
        this.bodies = [];
        this.forces.clear();
        this.collisions = [];
        this.events = [];
    }

    /**
     * Get bodies within a certain area
     */
    getBodiesInArea(x, y, radius) {
        return this.bodies.filter(body => {
            const dx = body.x - x;
            const dy = body.y - y;
            return Math.sqrt(dx * dx + dy * dy) <= radius;
        });
    }

    /**
     * Calculate orbital parameters for a body around another
     */
    calculateOrbit(body, centralBody) {
        const dx = body.x - centralBody.x;
        const dy = body.y - centralBody.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const relativeVx = body.vx - centralBody.vx;
        const relativeVy = body.vy - centralBody.vy;

        // Orbital velocity calculation
        const orbitalSpeed = Math.sqrt(relativeVx * relativeVx + relativeVy * relativeVy);
        const orbitalRadius = distance;

        // Semi-major axis approximation
        const semiMajorAxis = orbitalRadius;

        // Eccentricity calculation (simplified)
        const eccentricity = Math.abs(orbitalSpeed * orbitalRadius) /
                           (this.gravityConstant * centralBody.mass);

        return {
            semiMajorAxis,
            eccentricity: Math.min(eccentricity, 0.99), // Cap at 0.99
            orbitalPeriod: 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) /
                          (this.gravityConstant * centralBody.mass)),
            distance,
            speed: orbitalSpeed
        };
    }
}
