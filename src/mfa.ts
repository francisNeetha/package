// src/mfa.ts
import speakeasy from "speakeasy"
import QRCode from "qrcode"

export const generateMfaQrCode = async (appName: string = "Authx") => {
  const secret = speakeasy.generateSecret({
    name: appName,
    length: 32,
  })

  if (!secret.otpauth_url) {
    throw new Error("Failed to generate otpauth_url for QR code.");
  }
  const qrCodeImageUrl = await QRCode.toDataURL(secret.otpauth_url)

  return {
    secret: secret.base32,
    qrCodeImageUrl,
  }
}

