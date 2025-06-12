import nodemailer from 'nodemailer';
import axios from 'axios';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const WEBHOOK_URL = 'https://catalistgroup.app.n8n.cloud/webhook/send-email';

export async function sendResetPasswordEmail(email: string, otp: string, hostname?: string): Promise<boolean> {
    const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Verification</h2>
            <p>You have requested to reset your password. Please use the following code to verify your identity:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0;">
                <h1 style="color: #0066cc; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p style="color: #666;">This code will expire in 5 minutes for security purposes.</p>
            <p style="color: #666;">If you didn't request this password reset, please ignore this email.</p>
        </div>
    `;

    try {
        // Use webhook for portal.catalistgroup.co, otherwise use nodemailer
        if (hostname?.includes('portal.catalistgroup.co')) {
            const response = await axios.post(WEBHOOK_URL, {
                to: email,
                subject: 'Password Reset Code',
                body: emailTemplate.replace('${otp}', otp)
            }, {
                headers: {
                    'Authorization': 'Bearer umJVIiXgSMQXokdeGTBvCk5B2rpQKKrXyk8ACgMMD4iP9bc8TjQ3urEImJEtfAhZ'
                }
            });
            return response.status === 200;
        } else {
            await transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: email,
                subject: 'Password Reset Code',
                html: emailTemplate
            });
            return true;
        }
    } catch (error: any) {
        console.log('Email sending failed:', error.toString());
        return false;
    }
}