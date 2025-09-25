const crypto = require('crypto');

// Generate a random 32-byte hex string for JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex');

// Generate a random 32-byte hex string for session secret
const sessionSecret = crypto.randomBytes(32).toString('hex');

console.log('Generated Secrets:');
console.log('JWT_SECRET=' + jwtSecret);
console.log('SESSION_SECRET=' + sessionSecret);
