/**
 * @file uuid.js
 * @description Cross-environment UUID v4 generator.
 *
 * Priority:
 *  1. crypto.randomUUID()       – available in secure contexts (HTTPS / localhost)
 *  2. crypto.getRandomValues()  – available in all modern browsers incl. HTTP
 *  3. Math.random() fallback    – last resort for very old environments
 */

/**
 * Returns a RFC-4122 v4 UUID string.
 * Works in browsers (HTTP + HTTPS), Node.js ≥ 14.17, and React Native.
 *
 * @returns {string}  e.g. "550e8400-e29b-41d4-a716-446655440000"
 */
export function generateUUID() {
  // 1 — native, secure-context API (fastest)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // 2 — getRandomValues (available in HTTP contexts & older browsers)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }

  // 3 — Math.random fallback (non-cryptographic, acceptable for IDs)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
