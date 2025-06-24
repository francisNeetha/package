// src/handle-mfa.ts
import type { Request, Response } from "express"
import type { IAuthexService } from "./types"
import { generateMfaQrCode } from "./mfa"
// Add this import for session types
import type session from "express-session"
export const handleMfaSetup = async (
  req: Request,
  res: Response,
  authexService: IAuthexService,
  appName: string = "Authx"
): Promise<void> => {
  if (!req.session || !req.session.userId) {
    res.status(401).json({
      message: "Unauthorized: Session or user ID missing",
    })
    return
  }

  const userId = req.session.userId

  const existing = await authexService.listInfo({ user_id: userId }).catch(() => null)

  if (existing && existing.length > 0) {
    console.log("User already has MFA secret")

    req.session.mfa_admin_secret = existing[0].secret
    await new Promise((resolve, reject) =>
      req.session.save((err) => (err ? reject(err) : resolve(true)))
    )

    res.status(200).json({ hasExistingSecret: true })
    return
  }

  const { secret, qrCodeImageUrl } = await generateMfaQrCode(appName)

  req.session.mfa_admin_secret = secret
  await new Promise((resolve, reject) =>
    req.session.save((err) => (err ? reject(err) : resolve(true)))
  )

  console.log("New secret generated and stored in session for user:", userId)

  res.status(200).json({
    hasExistingSecret: false,
    qrCodeImageUrl,
  })
}
