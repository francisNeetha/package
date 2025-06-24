## medusa-2fa

A customizable Two-Factor Authentication (2FA) plugin for Medusa.js v2.8+, powered by TOTP with QR code support.

This plugin simplifies the integration of QR code-based multi-factor authentication (MFA) into your Medusa project using speakeasy and qrcode. It securely handles secrets in the session, verifies one-time passcodes, and scaffolds an authex module structure automatically via a post-install script.

## Installation

npm install medusa-2fa@1.0.2

Upon installation, a postinstall script will automatically generate the following folder structure:
```bash
src/ |---─ api/
|    └---middlewares.ts
|---- modules/ 
     └---authex/ 
        |--- models/ 
        | |--- info.ts
        | |---user.ts
        |----index.ts
        |─-- service.ts
```
## Configuration

## Register the Module
In your medusa-config.ts:

```bash
export default { modules: 
    [ { resolve: "./src/modules/authex", },
 // ...other modules ], }
```
## Run Migrations
After scaffolding is complete, run the following commands to generate and apply your database schema:

npx medusa db:generate authex 
npx medusa db:migrate

## Usage

## Generate MFA QR Code
```bash
/src/api/admin/generate-qr/route.ts

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http" import { handleMfaSetup } from "medusa-2fa" import AuthexModuleService from "../../../modules/authex/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => { const authexService = req.scope.resolve("authexModuleService") as AuthexModuleService await handleMfaSetup(req, res, authexService, "Your-App-Name") }
```
This route:

Generates a new TOTP secret (if not already set)

Stores the secret in the session

Returns a QR code as a Data URL to be scanned by an authenticator app

## Verify MFA Code
```bash
/src/api/admin/verify-mfa/route.ts

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http" import { handleMfaVerification } from "medusa-2fa" import AuthexModuleService from "../../../modules/authex/service"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => { const authexService = req.scope.resolve("authexModuleService") as AuthexModuleService await handleMfaVerification(req, res, authexService) }
```
This route:

Verifies the 6-digit passcode sent by the user
If valid, saves the TOTP secret in your DB
Cleans up the session and grants access

## Features

TOTP (Google Authenticator-style) 2FA
Automatic module scaffolding
Session-based secret storage
Optional middleware protection
Built on MedusaJS v2 module system

## Requirements

Node.js v18+
MedusaJS v2.8+
PostgreSQL (recommended)

## Built With

MedusaJS
Speakeasy
QRCode
Express session for secure server-side secret handling
