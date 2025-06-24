// src/handle-mfa-verify.ts
import { verifyMfa } from "./verify"
import type { Request, Response } from "express"
import type { IAuthexService } from "./types"

// Extend the session type to include userId and mfa_admin_secret
declare module "express-session" {
  interface SessionData {
    userId?: string
    mfa_admin_secret?: string
  }
}

export const handleMfaVerification = async (
  req: Request,
  res: Response,
  authexService: IAuthexService
): Promise<void> => {
  const { passcode } = req.body as { passcode: string }

  if (!req.session || !req.session.userId) {
    res.status(401).json({
      message: "Session not found",
      error: "NO_SESSION"
    })
    return
  }

  const secret = req.session.mfa_admin_secret
  const userId = req.session.userId

  const result = verifyMfa(passcode, secret)

  if (!result.success) {
    res.status(400).json(result)
    return
  }

  // Clear the session MFA secret
  delete req.session.mfa_admin_secret
  await new Promise((resolve, reject) =>
    req.session.save(err => (err ? reject(err) : resolve(true)))
  )

  // Save secret in DB if not already saved
  const existing = await authexService.listInfo({ user_id: userId })

  if (!existing || existing.length === 0) {
    if (typeof secret === "string") {
      await authexService.createInfo({
        user_id: userId,
        secret: secret
      })
      console.log("MFA secret saved in DB for the first time.")
    } else {
      console.error("MFA secret is missing or invalid, cannot save to DB.")
      res.status(500).json({ message: "MFA secret is missing or invalid", error: "NO_SECRET" })
      return
    }
  } else {
    console.log("MFA secret already exists. Skipping save.")
  }

  res.status(200).json(result)
}
