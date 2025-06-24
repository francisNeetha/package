export interface MfaVerifyResult {
    success: boolean;
    message: string;
    error?: string;
}
export declare function verifyMfa(passcode: string, secret: string | undefined): MfaVerifyResult;
