import nodeCrypto from 'node:crypto';

// Ensure bare global `crypto` and `globalThis.crypto` exist before any drivers load
try {
  if (typeof global.crypto === 'undefined') {
    Object.defineProperty(global, 'crypto', {
      value: nodeCrypto,
      writable: true,
      configurable: true
    });
  }
  if (typeof globalThis.crypto === 'undefined') {
    Object.defineProperty(globalThis, 'crypto', {
      value: nodeCrypto.webcrypto || nodeCrypto,
      writable: true,
      configurable: true
    });
  }
} catch (err) {
  console.warn('[Polyfill] Note on crypto initialization:', err.message);
}

// Dynamically load server application after globals are fully prepared
await import('./index.js');
