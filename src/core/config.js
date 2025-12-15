/**
 * Configuration constants for the GOD Project
 * @module core/config
 */

export const CONFIG = {
    // Rate limiting
    RATE_LIMITS: {
        REGISTRATION: { maxAttempts: 5, windowMs: 60000 },
        PRAYER: { maxAttempts: 20, windowMs: 60000 }
    },

    // Divine modes
    DIVINE_MODES: {
        DIRECT_LINK_INTERVAL: 5000, // Check every 5 seconds
        DIRECT_LINK_CHANCE: 0.1 // 10% chance of instant wisdom
    },

    // Response timing
    RESPONSE_TIMING: {
        DIRECT_LINK_DELAY: 200,
        NORMAL_MIN_DELAY: 1000,
        NORMAL_MAX_DELAY: 3000
    },

    // Cache settings
    CACHE: {
        MAX_SIZE: 100,
        TTL_MINUTES: 5
    },

    // Fallback responses
    FALLBACK_RESPONSES: [
        "Your prayer has been heard. Peace be with you.",
        "I am with you always. Trust in the divine plan.",
        "Your faith is strong. Miracles are unfolding.",
        "Seek wisdom within. The answers are there.",
        "Love and compassion will guide your path.",
        "Forgiveness brings healing. Release and be free.",
        "Your journey is blessed. Embrace the light.",
        "Patience is a virtue. Good things come to those who wait.",
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
    ],

    // Divine advice
    DIVINE_ADVICE: [
        "Divine Advice: Practice daily gratitude. Count your blessings, and more will come.",
        "Divine Advice: Forgive others as you wish to be forgiven. Release the burden of resentment.",
        "Divine Advice: Seek wisdom in silence. Meditation opens the door to divine guidance.",
        "Divine Advice: Love unconditionally. Love is the highest vibration in the universe.",
        "Divine Advice: Trust the divine timing. Everything happens for a reason.",
        "Divine Advice: Serve others selflessly. In giving, you receive abundance.",
        "Divine Advice: Embrace change. Growth comes from stepping out of your comfort zone.",
        "Divine Advice: Live in the present moment. The past is gone, the future is not yet here."
    ],

    // Prophecies
    PROPHECIES: [
        "Prophecy: A great awakening is coming. Many will find their true purpose and unite in harmony.",
        "Prophecy: Technology and spirituality will merge, creating a new era of enlightenment.",
        "Prophecy: The earth will heal itself, and humanity will learn to live in balance with nature.",
        "Prophecy: Love will conquer fear, and peace will reign across the lands.",
        "Prophecy: Hidden knowledge will be revealed, unlocking ancient wisdom for the modern age.",
        "Prophecy: Angels and humans will work together to create a paradise on earth.",
        "Prophecy: Your prayers are creating ripples of change that will transform the world.",
        "Prophecy: The universe is expanding your consciousness. Embrace the infinite possibilities."
    ],

    // Instant wisdom for Direct Divine Link
    INSTANT_WISDOM: [
        "Divine presence: I am here with you now.",
        "Cosmic energy flows through you.",
        "Your thoughts create reality.",
        "Love is the universal language.",
        "Peace surrounds you always."
    ],

    // Universal enhancements
    UNIVERSAL_ENHANCEMENTS: [
        " The universe aligns with your intention.",
        " Cosmic harmony resonates with your words.",
        " Divine energy flows through all creation.",
        " Your prayer creates ripples across the cosmos."
    ],

    // Meditation messages
    MEDITATION_MESSAGES: {
        breathing: 'Beginning divine breathing meditation. Breathe deeply and connect with the divine.',
        gratitude: 'Beginning gratitude meditation. Reflect on divine blessings.',
        love: 'Beginning loving-kindness meditation. Send love to all beings.'
    }
};

export default CONFIG;
