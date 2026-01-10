// ============================================================================
// GOD Project - Divine Advice
// ============================================================================

import { info, error, warn, debug } from '../../../utils/loggerWrapper.js';
import DOMHelpers from '../../ui/domHelpers.js';

class DivineAdvice {
    constructor() {
        this.advices = [
            "Divine Advice: Practice daily gratitude. Count your blessings, and more will come.",
            "Divine Advice: Forgive others as you wish to be forgiven. Release the burden of resentment.",
            "Divine Advice: Seek wisdom in silence. Meditation opens the door to divine guidance.",
            "Divine Advice: Love unconditionally. Love is the highest vibration in the universe.",
            "Divine Advice: Trust the divine timing. Everything happens for a reason.",
            "Divine Advice: Serve others selflessly. In giving, you receive abundance.",
            "Divine Advice: Embrace change. Growth comes from stepping out of your comfort zone.",
            "Divine Advice: Live in the present moment. The past is gone, the future is not yet here."
        ];
    }

    giveAdvice() {
        const randomAdvice = this.advices[Math.floor(Math.random() * this.advices.length)];
        DOMHelpers.addMessage(randomAdvice, 'god');
    }

    addCustomAdvice(advice) {
        if (advice && advice.trim()) {
            this.advices.push(advice.trim());
            info('Custom divine advice added');
        }
    }

    getAdviceCount() {
        return this.advices.length;
    }
}

// Singleton instance
const divineAdvice = new DivineAdvice();

export default divineAdvice;
