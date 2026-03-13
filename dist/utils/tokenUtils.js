import crypto from 'crypto';
export class TokenUtils {
    /**
     * Generates a cryptographically random hex string.
     */
    static generateToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }
    /**
     * Hashes a raw token for secure storage.
     */
    static hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    /**
     * Verifies a raw token against a stored hash.
     */
    static verifyToken(rawToken, storedHash) {
        const hashedRaw = this.hashToken(rawToken);
        return crypto.timingSafeEqual(Buffer.from(hashedRaw), Buffer.from(storedHash));
    }
}
//# sourceMappingURL=tokenUtils.js.map