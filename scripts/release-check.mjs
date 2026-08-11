import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const requiredAssets = ["main.js", "manifest.json", "styles.css"];
const missingAssets = requiredAssets.filter((assetPath) => !existsSync(assetPath));

if (missingAssets.length > 0) {
	throw new Error(`Missing release assets: ${missingAssets.join(", ")}`);
}

const packageMetadata = readJson("package.json");
const manifest = readJson("manifest.json");
const versions = readJson("versions.json");

if (packageMetadata.version !== manifest.version) {
	throw new Error("package.json and manifest.json versions must match.");
}

if (versions[manifest.version] !== manifest.minAppVersion) {
	throw new Error(
		"versions.json must map the current version to manifest.minAppVersion.",
	);
}

try {
	execFileSync("git", ["ls-files", "--error-unmatch", "main.js"], {
		stdio: "ignore",
	});
	throw new Error("main.js must remain untracked in Git.");
} catch (error) {
	const message = error instanceof Error ? error.message : String(error);
	if (message === "main.js must remain untracked in Git.") {
		throw error;
	}
}

function readJson(path) {
	return JSON.parse(readFileSync(path, "utf8"));
}
