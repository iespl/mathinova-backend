import crypto from 'crypto';

export class TokenUtils {
    /**
     * Generates a cryptographically random hex string.
     */
    static generateToken(length: number = 32): string {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Hashes a raw token for secure storage.
     */
    static hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    /**
     * Verifies a raw token against a stored hash.
     */
    static verifyToken(rawToken: string, storedHash: string): boolean {
        const hashedRaw = this.hashToken(rawToken);
        return crypto.timingSafeEqual(Buffer.from(hashedRaw), Buffer.from(storedHash));
    }
}
