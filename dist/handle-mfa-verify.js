"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMfaVerification = void 0;
// src/handle-mfa-verify.ts
const verify_1 = require("./verify");
const handleMfaVerification = (req, res, authexService) => __awaiter(void 0, void 0, void 0, function* () {
    const { passcode } = req.body;
    if (!req.session || !req.session.userId) {
        res.status(401).json({
            message: "Session not found",
            error: "NO_SESSION"
        });
        return;
    }
    const secret = req.session.mfa_admin_secret;
    const userId = req.session.userId;
    const result = (0, verify_1.verifyMfa)(passcode, secret);
    if (!result.success) {
        res.status(400).json(result);
        return;
    }
    // Clear the session MFA secret
    delete req.session.mfa_admin_secret;
    yield new Promise((resolve, reject) => req.session.save(err => (err ? reject(err) : resolve(true))));
    // Save secret in DB if not already saved
    const existing = yield authexService.listInfo({ user_id: userId });
    if (!existing || existing.length === 0) {
        if (typeof secret === "string") {
            yield authexService.createInfo({
                user_id: userId,
                secret: secret
            });
            console.log("MFA secret saved in DB for the first time.");
        }
        else {
            console.error("MFA secret is missing or invalid, cannot save to DB.");
            res.status(500).json({ message: "MFA secret is missing or invalid", error: "NO_SECRET" });
            return;
        }
    }
    else {
        console.log("MFA secret already exists. Skipping save.");
    }
    res.status(200).json(result);
});
exports.handleMfaVerification = handleMfaVerification;
