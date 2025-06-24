import speakeasy from "speakeasy"

export interface MfaVerifyResult {
  success: boolean
  message: string
  error?: string
}

export function verifyMfa(passcode: string, secret: string | undefined): MfaVerifyResult {
  if (!passcode) {
    return {
      success: false,
      message: "Passcode is required",
      error: "MISSING_PASSCODE"
    }
  }

  if (passcode.length !== 6 || !/^\d{6}$/.test(passcode)) {
    return {
      success: false,
      message: "Passcode must be exactly 6 digits",
      error: "INVALID_PASSCODE_FORMAT"
    }
  }

  if (!secret) {
    return {
      success: false,
      message: "MFA secret not found in session",
      error: "NO_MFA_SECRET"
    }
  }

  const isVerified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: passcode,
    window: 3
  })

  if (!isVerified) {
    return {
      success: false,
      message: "Invalid or expired MFA code",
      error: "INVALID_MFA_CODE"
    }
  }

  return {
    success: true,
    message: "MFA verification successful"
  }
}
