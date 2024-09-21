// Secret key used for signing JWTs
export const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

// Minimum length requirement for JWT_SECRET
const MIN_SECRET_LENGTH = 32;

if (JWT_SECRET.length < MIN_SECRET_LENGTH) {
  throw new Error(`JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters long`);
}

// JWT configuration object
export const JWT_CONFIG = {
  secret: JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  algorithm: 'HS256' as const,
  issuer: 'pollen8.com',
  audience: 'pollen8-users',
};

/**
 * JWT Configuration
 * 
 * secret: The secret key used to sign the JWT
 * expiresIn: The expiration time for the JWT. Default is 24 hours if not set in environment variables.
 * algorithm: The algorithm used for signing the JWT. We use HS256 (HMAC-SHA256).
 * issuer: The issuer of the JWT, set to our application domain.
 * audience: The intended audience for the JWT, set to our user base.
 * 
 * Note: Make sure to set the JWT_SECRET environment variable securely in your deployment environment.
 * Consider implementing a secret rotation mechanism for enhanced security.
 */

// TODO: Implement a mechanism to rotate JWT secrets periodically
// TODO: Implement a mechanism to invalidate or blacklist JWTs if needed
// TODO: Consider implementing refresh token functionality for longer session durations
// TODO: Add unit tests to verify JWT configurations