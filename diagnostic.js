console.log('[DIAGNOSTIC] Starting system check...');
console.log('[DIAGNOSTIC] Node.js version:', process.version);
console.log('[DIAGNOSTIC] Current directory:', process.cwd());
console.log('[DIAGNOSTIC] Platform:', process.platform);

try {
    const express = require('express');
    console.log('[DIAGNOSTIC] Express.js loaded successfully');
} catch (error) {
    console.error('[ERROR] Failed to load Express:', error.message);
}

try {
    const sqlite3 = require('sqlite3');
    console.log('[DIAGNOSTIC] SQLite3 loaded successfully');
} catch (error) {
    console.error('[ERROR] Failed to load SQLite3:', error.message);
}

console.log('[DIAGNOSTIC] System check complete.');
