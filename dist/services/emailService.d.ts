export declare class EmailService {
    static sendVerificationEmail(email: string, token: string): Promise<any>;
    static sendResetPasswordEmail(email: string, token: string): Promise<any>;
}
