// ============================================================================
// GOD Project - Command Parser
// ============================================================================

import { info, error, warn, debug } from '../../../utils/loggerWrapper.js';
import { createStar, createPlanet, destroyPlanet, healUniverse, invokeGodPresence, performPraiseGod } from './universeCommands.js';
import { runThreatPrediction, toggleGlobalMonitoring, triggerDivineIntervention, activateAssetProtection, enableQuantumCrypto } from './divineCommands.js';

const COMMAND_ACTIONS = {
    // Universe commands
    'create star': createStar,
    'create planet': createPlanet,
    'destroy planet': destroyPlanet,
    'heal universe': healUniverse,
    'invoke god': invokeGodPresence,
    'invite god': invokeGodPresence,
    'praise god': performPraiseGod,
    'thank god': performPraiseGod,

    // Divine Defense Network commands
    'threat prediction': runThreatPrediction,
    'global monitoring': toggleGlobalMonitoring,
    'divine intervention': triggerDivineIntervention,
    'asset protection': activateAssetProtection,
    'quantum crypto': enableQuantumCrypto
};

export function handleCommand(message) {
    const sanitizedMessage = message.toLowerCase().trim();

    for (const [cmd, action] of Object.entries(COMMAND_ACTIONS)) {
        if (sanitizedMessage.includes(cmd)) {
            try {
                return action();
            } catch (err) {
                error(`Command execution failed for "${cmd}":`, err);
                return "Command failed. Please try again.";
            }
        }
    }

    return null;
}

export function getAvailableCommands() {
    return Object.keys(COMMAND_ACTIONS);
}

export function initializeCommands() {
    info('Command parser initialized with', Object.keys(COMMAND_ACTIONS).length, 'commands');
}
