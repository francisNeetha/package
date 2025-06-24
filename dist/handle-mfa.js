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
exports.handleMfaSetup = void 0;
const mfa_1 = require("./mfa");
const handleMfaSetup = (req_1, res_1, authexService_1, ...args_1) => __awaiter(void 0, [req_1, res_1, authexService_1, ...args_1], void 0, function* (req, res, authexService, appName = "Authx") {
    if (!req.session || !req.session.userId) {
        res.status(401).json({
            message: "Unauthorized: Session or user ID missing",
        });
        return;
    }
    const userId = req.session.userId;
    const existing = yield authexService.listInfo({ user_id: userId }).catch(() => null);
    if (existing && existing.length > 0) {
        console.log("✅ User already has MFA secret");
        req.session.mfa_admin_secret = existing[0].secret;
        yield new Promise((resolve, reject) => req.session.save((err) => (err ? reject(err) : resolve(true))));
        res.status(200).json({ hasExistingSecret: true });
        return;
    }
    const { secret, qrCodeImageUrl } = yield (0, mfa_1.generateMfaQrCode)(appName);
    req.session.mfa_admin_secret = secret;
    yield new Promise((resolve, reject) => req.session.save((err) => (err ? reject(err) : resolve(true))));
    console.log("🆕 New secret generated and stored in session for user:", userId);
    res.status(200).json({
        hasExistingSecret: false,
        qrCodeImageUrl,
    });
});
exports.handleMfaSetup = handleMfaSetup;
