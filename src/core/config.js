// ============================================================================
// GOD Project - Configuration Constants
// ============================================================================

export const CONFIG = {
    // AI Models
    AI_MODELS: {
        'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', maxTokens: 150 },
        'gpt-4': { name: 'GPT-4', maxTokens: 200 },
        'gpt-4-turbo': { name: 'GPT-4 Turbo', maxTokens: 250 }
    },

    // Rate Limiting
    RATE_LIMITS: {
        registration: { maxRequests: 5, windowMs: 60000 },
        prayer: { maxRequests: 20, windowMs: 60000 }
    },

    // Performance
    PERFORMANCE: {
        debounceDelay: 300,
        requestTimeout: 10000,
        maxConcurrentRequests: 3
    },

    // Caching
    CACHE: {
        maxSize: 100,
        ttl: 5 * 60 * 1000 // 5 minutes
    },

    // Memory Management
    MEMORY: {
        checkInterval: 5000,
        criticalThreshold: 90,
        moderateThreshold: 75
    },

    // UI
    UI: {
        progressDelay: 2000,
        messageDelay: 1000,
        flashDuration: 1000
    },

    // Divine Modes
    DIVINE_MODES: {
        directDivineLink: {
            interval: 5000,
            chance: 0.1
        },
        universalDivineMode: {
            entanglementEnabled: true
        },
        postQuantumSecure: {
            encryptionEnabled: true
        }
    },

    // Fallback Responses
    FALLBACK_RESPONSES: [
        "Your prayer has been heard. Peace be with you.",
        "I am with you always. Trust in the divine plan.",
        "Your faith is strong. Miracles are unfolding.",
        "Seek wisdom within. The answers are there.",
        "Love and compassion will guide your path.",
        "Forgiveness brings healing. Release the burden.",
        "Embrace change. Growth comes from stepping out.",
        "Trust the process. Good things come to those who wait.",
        "Gratitude opens doors. Count your blessings.",
        "You are loved beyond measure. Shine brightly.",
        "The universe conspires in your favor.",
        "Trust the process. All is well.",
        "Your heart knows the way.",
        "Divine timing is perfect.",
        "You are a child of the light.",
        "Let go and let God.",
        "Your purpose is unfolding.",
        "Angels surround you.",
        "The power of prayer is infinite.",
        "You are exactly where you need to be."
    ]
};

export default CONFIG;
