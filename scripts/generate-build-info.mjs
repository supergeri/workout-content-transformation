import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";

function getGitSha() {
  // First check environment variable (useful in Docker)
  if (process.env.GIT_SHA) {
    return process.env.GIT_SHA;
  }
  
  // Try current directory first (ui/ has its own git repo)
  try {
    return execSync("git rev-parse --short HEAD", { cwd: resolve(".") }).toString().trim();
  } catch (error) {
    // If that fails, try parent directory (main repo)
    try {
      return execSync("git rev-parse --short HEAD", { cwd: resolve("..") }).toString().trim();
    } catch (error2) {
      console.warn("⚠️  Could not read git SHA:", error2?.message ?? error2);
      return "unknown";
    }
  }
}

function getVersion() {
  try {
    const packageJsonPath = resolve("package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    return packageJson.version || "0.0.0-dev";
  } catch (error) {
    console.warn("⚠️  Could not read version from package.json:", error?.message ?? error);
    return process.env.APP_VERSION || "0.0.0-dev";
  }
}

const buildInfo = {
  appName: process.env.APP_NAME || "AmakaFlow",
  version: getVersion(),
  gitSha: getGitSha(),
  builtAt: new Date().toISOString(),
  env: process.env.NODE_ENV || "development",
};

const outputPath = resolve("src/build-info.json");
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(buildInfo, null, 2));

console.log("✅ Wrote build info to", outputPath, buildInfo);

