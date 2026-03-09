import nodemailer from 'nodemailer';

let transporter: any = null;

const getTransporter = () => {
    if (transporter) return transporter;

    // Use mock if credentials are missing
    if (!process.env.SMTP_USER) {
        return null;
    }

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    return transporter;
};

export class EmailService {
    static async sendVerificationEmail(email: string, token: string) {
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

        const mailOptions = {
            from: `"Mathinova Support" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Verify your Mathinova Account',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #6366f1;">Welcome to Mathinova!</h2>
                    <p>Please verify your email address to activate your account and access world-class engineering resources.</p>
                    <div style="margin: 30px 0;">
                        <a href="${verificationUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
                    </div>
                    <p style="font-size: 0.875rem; color: #64748b;">This link will expire in 15 minutes. If you did not create an account, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="font-size: 0.75rem; color: #94a3b8;">Mathinova Platform &copy; 2026</p>
                </div>
            `,
        };

        const transporter = getTransporter();
        if (!transporter) {
            console.log('--- Development: Mock Email ---');
            console.log(`To: ${email}`);
            console.log(`Subject: ${mailOptions.subject}`);
            console.log(`Verification URL: ${verificationUrl}`);
            console.log('------------------------------');
            return;
        }

        return transporter.sendMail(mailOptions);
    }

    static async sendResetPasswordEmail(email: string, token: string) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

        const mailOptions = {
            from: `"Mathinova Support" <${process.env.SMTP_USER || 'support@mathinova.com'}>`,
            to: email,
            subject: 'Reset your Mathinova Password',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #6366f1;">Password Reset Request</h2>
                    <p>We received a request to reset your password. Click the button below to choose a new password.</p>
                    <div style="margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p style="font-size: 0.875rem; color: #64748b;">This link will expire in 30 minutes. If you did not request a password reset, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="font-size: 0.75rem; color: #94a3b8;">Mathinova Platform &copy; 2026</p>
                </div>
            `,
        };

        const transporter = getTransporter();
        if (!transporter) {
            console.log('--- Development: Mock Email ---');
            console.log(`To: ${email}`);
            console.log(`Subject: ${mailOptions.subject}`);
            console.log(`Reset URL: ${resetUrl}`);
            console.log('------------------------------');
            return;
        }

        return transporter.sendMail(mailOptions);
    }
}
