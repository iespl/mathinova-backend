export declare class TokenUtils {
    /**
     * Generates a cryptographically random hex string.
     */
    static generateToken(length?: number): string;
    /**
     * Hashes a raw token for secure storage.
     */
    static hashToken(token: string): string;
    /**
     * Verifies a raw token against a stored hash.
     */
    static verifyToken(rawToken: string, storedHash: string): boolean;
}
