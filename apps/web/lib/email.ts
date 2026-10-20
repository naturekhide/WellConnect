export async function sendPasswordResetEmail(email: string, code: string) {
    // MOCK EMAIL SERVICE
    console.log("\n==================================================");
    console.log(`📧 SENDING EMAIL TO: ${email}`);
    console.log(`🔑 YOUR PASSWORD RESET CODE IS: ${code}`);
    console.log("==================================================\n");
    
    // When you get Resend/SendGrid, replace the console.logs above with real code.
    return true;
}