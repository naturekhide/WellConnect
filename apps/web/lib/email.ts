import { Resend } from "resend";

var resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, code: string) {
    try {
        await resend.emails.send({
            from: "WellConnect <onboarding@resend.dev>",
            to: email,
            subject: "Your WellConnect Password Reset Code",
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Reset your password</h2>
                    <p>You requested to reset your password for WellConnect.</p>
                    <p>Your 6-digit code is:</p>
                    <h1 style="font-size: 32px; letter-spacing: 5px; color: #059669;">${code}</h1>
                    <p>This code expires in 15 minutes.</p>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                </div>
            `,
        });
        return true;
    } catch (e) {
        console.error("Failed to send email:", e);
        return false;
    }
}

export async function sendVerificationEmail(email: string, code: string) {
    try {
        await resend.emails.send({
            from: "WellConnect <onboarding@resend.dev>",
            to: email,
            subject: "Welcome to WellConnect - Verify your email",
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Welcome to WellConnect!</h2>
                    <p>Please verify your email address to activate your account.</p>
                    <p>Your 6-digit code is:</p>
                    <h1 style="font-size: 32px; letter-spacing: 5px; color: #059669;">${code}</h1>
                    <p>This code expires in 15 minutes.</p>
                </div>
            `,
        });
        return true;
    } catch (e) {
        console.error("Failed to send verification email:", e);
        return false;
    }
}