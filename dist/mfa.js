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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMfaQrCode = void 0;
// src/mfa.ts
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const generateMfaQrCode = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (appName = "Authx") {
    const secret = speakeasy_1.default.generateSecret({
        name: appName,
        length: 32,
    });
    if (!secret.otpauth_url) {
        throw new Error("Failed to generate otpauth_url for QR code.");
    }
    const qrCodeImageUrl = yield qrcode_1.default.toDataURL(secret.otpauth_url);
    return {
        secret: secret.base32,
        qrCodeImageUrl,
    };
});
exports.generateMfaQrCode = generateMfaQrCode;
