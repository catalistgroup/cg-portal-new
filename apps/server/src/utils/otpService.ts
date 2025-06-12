import { createHash } from 'crypto';

interface OTPData {
    code: string;
    expiresAt: number;
    email: string;
}

class OTPService {
    private static otpStore = new Map<string, OTPData>();

    static generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    static hashEmail(email: string): string {
        return createHash('sha256').update(email).digest('hex');
    }

    static storeOTP(email: string): string | null {
        const hashedEmail = this.hashEmail(email);
        const existingOTP = this.otpStore.get(hashedEmail);

        if (existingOTP && Date.now() < existingOTP.expiresAt) {
            return null;
        }

        const otp = this.generateOTP();
        const valid_for = Date.now() + 1 * 60 * 1000;

        this.otpStore.set(hashedEmail, {
            code: otp,
            expiresAt: valid_for,
            email
        });

        setTimeout(() => {
            this.otpStore.delete(hashedEmail);
        }, 1 * 60 * 1000);

        return otp;
    }

    static verifyOTP(email: string, code: string): boolean {
        const hashedEmail = this.hashEmail(email);
        const storedData = this.otpStore.get(hashedEmail);

        if (!storedData) return false;

        const isValid = storedData.code === code;
        const isExpired = Date.now() >= storedData.expiresAt;

        if (isExpired) {
            throw new Error('Code has expired');
        }

        if (!isValid) {
            throw new Error('Invalid code');
        }

        if (isValid) {
            this.otpStore.delete(hashedEmail);
        }

        return isValid;
    }
}

export default OTPService;