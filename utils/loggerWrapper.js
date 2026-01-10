const info = (...args) => console.log('[INFO]', ...args);
const error = (...args) => console.error('[ERROR]', ...args);
const warn = (...args) => console.warn('[WARN]', ...args);
const debug = (...args) => console.debug('[DEBUG]', ...args);

export { info, error, warn, debug };
