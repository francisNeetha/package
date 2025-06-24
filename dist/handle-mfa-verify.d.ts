import type { Request, Response } from "express";
import type { IAuthexService } from "./types";
declare module "express-session" {
    interface SessionData {
        userId?: string;
        mfa_admin_secret?: string;
    }
}
export declare const handleMfaVerification: (req: Request, res: Response, authexService: IAuthexService) => Promise<void>;
