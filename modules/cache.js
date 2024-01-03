'use strict';

const cache = {};
let lastCacheOperationTime = Date.now();

function setWithExpiration(key, value, expirationTimeInSeconds) {
  const expirationTimeInMil = expirationTimeInSeconds * 1000;
  const now = Date.now();

  cache[key] = {
    value,
    expirationTime: now + expirationTimeInMil,
    lastAccessTime: now,
  };

  lastCacheOperationTime = now;

  // Schedule removal after the specified expiration time
  setTimeout(() => {
    delete cache[key];
  }, expirationTimeInMil);
}

function cleanupExpiredItems() {
  const now = Date.now();

  Object.keys(cache).forEach((key) => {
    const entry = cache[key];
    const inactiveDuration = now - entry.lastAccessTime;
    if (inactiveDuration >= entry.expirationTime - now) {
      delete cache[key];
    }
  });

  const idleDuration = now - lastCacheOperationTime;
  if (idleDuration >= 6 * 60 * 60 * 1000) {
    Object.keys(cache).forEach((key) => delete cache[key]);
  }
}

// Run cleanup every so often
setInterval(cleanupExpiredItems, 3600000); // 1 hour

module.exports = {
  get: (key) => {
    const entry = cache[key];
    if (entry) {
      entry.lastAccessTime = Date.now();
      return entry.value;
    }
    return undefined;
  },
  set: (key, value) => {
    cache[key] = { value };
    // Update the last cache operation time
    lastCacheOperationTime = Date.now();
  },
  setWithExpiration,
  remove: (key) => {
    delete cache[key];
    // Update the last cache operation time
    lastCacheOperationTime = Date.now();
  },
  clear: () => {
    Object.keys(cache).forEach((key) => delete cache[key]);
    // Update the last cache operation time
    lastCacheOperationTime = Date.now();
  },
  cleanup: cleanupExpiredItems, // Manual cleanup
};