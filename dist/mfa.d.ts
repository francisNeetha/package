export declare const generateMfaQrCode: (appName?: string) => Promise<{
    secret: string;
    qrCodeImageUrl: string;
}>;
