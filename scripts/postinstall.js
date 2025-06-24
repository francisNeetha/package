// scripts/postinstall.js
const fs = require("fs");
const path = require("path");
console.log("🔧 Running medusa-custom-folder-creator postinstall...");

// Utility to find the Medusa project root
function findMedusaProjectRoot(startDir = __dirname) {
  let currentDir = startDir;

  while (currentDir !== path.parse(currentDir).root) {
    const hasSrc = fs.existsSync(path.join(currentDir, "src"));
    const hasMedusaConfig = fs.existsSync(path.join(currentDir, "medusa-config.ts"));

    if (hasSrc && hasMedusaConfig) {
      return currentDir;
    }

    currentDir = path.dirname(currentDir);
  }

  throw new Error("Medusa project root not found.");
}

try {
  const medusaProjectRoot = findMedusaProjectRoot();
  const moduleBase = path.join(medusaProjectRoot, "src", "modules", "authex");

  const folders = [
    path.join(moduleBase, "models"),
  ];

  const files = [
    {
      path: path.join(moduleBase, "models", "info.ts"),
      content: `import { model } from "@medusajs/framework/utils"
import { User } from "./user"

export const Info = model.define("info", {
  id: model.id().primaryKey(),
  secret: model.text().unique(),
  user: model.belongsTo(() => User, { mappedBy: undefined }) // mappedBy points to 'info' in User
})`,
    },
    {
      path: path.join(moduleBase, "models", "user.ts"),
      content: `import { model } from "@medusajs/framework/utils"
// import { Info } from "./info"

export const User = model.define("user", {
  id: model.id().primaryKey(),
  email: model.text().unique(),
  first_name: model.text().nullable(),
  last_name: model.text().nullable(),
  avatar_url: model.text().nullable(),
  metadata: model.json().nullable(),
  // info: model.belongsTo(() => Info, { mappedBy: "user" }),
})`,
    },
    {
      path: path.join(moduleBase, "index.ts"),
      content: `import { Module } from "@medusajs/framework/utils"
import AuthexModuleService from "./service"

export const AUTHEX_MODULE = "authex"

export default Module(AUTHEX_MODULE, {
  service: AuthexModuleService,
})`,
    },
    {
      path: path.join(moduleBase, "service.ts"),
      content: `import { MedusaService } from "@medusajs/framework/utils"
import { Info } from "./models/info"

export default class AuthexModuleService extends MedusaService({
  Info,
}) {}`,
    },
    {
    path: path.join(medusaProjectRoot, "src", "api", "middlewares.ts"),
    content: `import {
  defineMiddlewares,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

const UNLOCKED_USERS = new Set<string>()
const USER_SESSIONS = new Map<string, string>()

const DEFAULT_RESTRICTED_ROUTES = ["admin/generate-qr", "admin/verify-code"]

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/generate-qr",
      middlewares: [
        async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          try {
            const userId = (req as any).auth_context?.actor_id
            if (userId) {
              req.session.userId = userId

              await new Promise((resolve, reject) => {
                req.session.save((err) => {
                  if (err) {
                    console.error("Session save failed:", err)
                    return reject(err)
                  }
                  resolve(true)
                })
              })

              console.log("Session saved with userId:", userId)
            }
            next()
          } catch (err) {
            console.error("Error in middleware:", err)
            return res.status(500).json({ message: "Middleware error" })
          }
        },
      ],
    },
  ],
})
`,
  },
  ];

  // Create folders
  folders.forEach((folderPath) => {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`✅ Folder created: ${folderPath}`);
    }
  });

  // Create files
  files.forEach((file) => {
    if (!fs.existsSync(file.path)) {
      fs.writeFileSync(file.path, file.content, "utf8");
      console.log(`✅ File created: ${file.path}`);
    } else {
      console.log(`ℹ️ File already exists: ${file.path}`);
    }
  });

} catch (err) {
  console.error("❌ Post-install script failed:", err.message);
}
