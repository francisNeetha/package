import type { Request, Response } from "express";
import type { IAuthexService } from "./types";
export declare const handleMfaSetup: (req: Request, res: Response, authexService: IAuthexService, appName?: string) => Promise<void>;
