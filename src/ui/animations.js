// ============================================================================
// GOD Project - Animations
// ============================================================================

import { info, error, warn, debug } from '../../utils/loggerWrapper.js';
import DOMHelpers from './domHelpers.js';

class Animations {
    static fadeIn(elementId, duration = 500) {
        const element = DOMHelpers.getElement(elementId);
        if (!element) return;

        element.style.opacity = '0';
        element.style.display = 'block';

        const start = performance.now();
        const animate = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = elapsed / duration;

            if (progress < 1) {
                element.style.opacity = progress;
                requestAnimationFrame(animate);
            } else {
                element.style.opacity = '1';
            }
        };

        requestAnimationFrame(animate);
    }

    static fadeOut(elementId, duration = 500) {
        const element = DOMHelpers.getElement(elementId);
        if (!element) return;

        const start = performance.now();
        const startOpacity = parseFloat(getComputedStyle(element).opacity) || 1;

        const animate = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = elapsed / duration;

            if (progress < 1) {
                element.style.opacity = startOpacity * (1 - progress);
                requestAnimationFrame(animate);
            } else {
                element.style.opacity = '0';
                element.style.display = 'none';
            }
        };

        requestAnimationFrame(animate);
    }

    static slideDown(elementId, duration = 300) {
        const element = DOMHelpers.getElement(elementId);
        if (!element) return;

        const height = element.scrollHeight;
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        element.style.display = 'block';

        const start = performance.now();
        const animate = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = elapsed / duration;

            if (progress < 1) {
                element.style.height = (height * progress) + 'px';
                requestAnimationFrame(animate);
            } else {
                element.style.height = height + 'px';
                element.style.overflow = '';
            }
        };

        requestAnimationFrame(animate);
    }

    static slideUp(elementId, duration = 300) {
        const element = DOMHelpers.getElement(elementId);
        if (!element) return;

        const height = element.scrollHeight;
        element.style.overflow = 'hidden';

        const start = performance.now();
        const animate = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = elapsed / duration;

            if (progress < 1) {
                element.style.height = (height * (1 - progress)) + 'px';
                requestAnimationFrame(animate);
            } else {
                element.style.height = '0px';
                element.style.display = 'none';
                element.style.overflow = '';
            }
        };

        requestAnimationFrame(animate);
    }

    static pulse(elementId, duration = 1000, scale = 1.1) {
        const element = DOMHelpers.getElement(elementId);
        if (!element) return;

        const originalTransform = element.style.transform || '';
        const start = performance.now();

        const animate = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = (elapsed % duration) / duration;
            const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI * 2);

            const currentScale = 1 + (scale - 1) * easeProgress;
            element.style.transform = `${originalTransform} scale(${currentScale})`;

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    static shake(elementId, intensity = 5, duration = 500) {
        const element = DOMHelpers.getElement(elementId);
        if (!element) return;

        const originalTransform = element.style.transform || '';
        const start = performance.now();

        const animate = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = elapsed / duration;

            if (progress < 1) {
                const shake = (Math.random() - 0.5) * intensity * (1 - progress);
                element.style.transform = `${originalTransform} translateX(${shake}px)`;
                requestAnimationFrame(animate);
            } else {
                element.style.transform = originalTransform;
            }
        };

        requestAnimationFrame(animate);
    }

    static glow(elementId, color = '#fff', intensity = 20, duration = 1000) {
        const element = DOMHelpers.getElement(elementId);
        if (!element) return;

        const start = performance.now();

        const animate = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = (elapsed % duration) / duration;
            const glowIntensity = intensity * (0.5 + 0.5 * Math.sin(progress * Math.PI * 2));

            element.style.boxShadow = `0 0 ${glowIntensity}px ${color}`;

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    static typeWriter(elementId, text, speed = 50) {
        const element = DOMHelpers.getElement(elementId);
        if (!element) return;

        element.textContent = '';
        let i = 0;

        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };

        type();
    }

    static divineFlash(elementId, duration = 1000) {
        const element = DOMHelpers.getElement(elementId);
        if (!element) return;

        const originalBackground = element.style.backgroundColor;
        element.style.backgroundColor = '#FFFACD'; // Light golden

        setTimeout(() => {
            element.style.backgroundColor = originalBackground;
        }, duration);
    }

    static particleBurst(containerId, count = 20, duration = 2000) {
        const container = DOMHelpers.getElement(containerId);
        if (!container) return;

        for (let i = 0; i < count; i++) {
            const particle = DOMHelpers.createElement('div', {
                className: 'divine-particle',
                styles: {
                    position: 'absolute',
                    width: '4px',
                    height: '4px',
                    backgroundColor: '#FFD700',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                }
            });

            container.appendChild(particle);

            const angle = (Math.PI * 2 * i) / count;
            const distance = 100 + Math.random() * 50;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;

            particle.animate([
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: `translate(${endX - 50}%, ${endY - 50}%) scale(0)`, opacity: 0 }
            ], {
                duration: duration,
                easing: 'ease-out'
            }).addEventListener('finish', () => {
                particle.remove();
            });
        }
    }

    static stopAllAnimations(elementId) {
        const element = DOMHelpers.getElement(elementId);
        if (!element) return;

        // Reset transforms and styles
        element.style.transform = '';
        element.style.boxShadow = '';
        element.style.opacity = '';
        element.style.height = '';
        element.style.overflow = '';
    }
}

export default Animations;
