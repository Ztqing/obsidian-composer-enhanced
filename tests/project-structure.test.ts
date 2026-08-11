import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

interface PluginManifest {
	id: string;
	isDesktopOnly: boolean;
	minAppVersion: string;
	version: string;
}

interface PackageMetadata {
	version: string;
}

void test("manifest exposes a cross-platform Composer companion plugin", () => {
	const manifest = readJson<PluginManifest>("manifest.json");

	assert.equal(manifest.id, "composer-enhanced");
	assert.equal(manifest.version, "0.0.1");
	assert.equal(manifest.minAppVersion, "1.13.0");
	assert.equal(manifest.isDesktopOnly, false);
});

void test("release metadata uses one version and compatibility baseline", () => {
	const packageMetadata = readJson<PackageMetadata>("package.json");
	const manifest = readJson<PluginManifest>("manifest.json");
	const versions = readJson<Record<string, string>>("versions.json");

	assert.equal(packageMetadata.version, manifest.version);
	assert.equal(versions[manifest.version], manifest.minAppVersion);
});

void test("requests a documented Style Settings metadata refresh on load", () => {
	const mainSource = readFileSync("src/main.ts", "utf8");

	assert.match(
		mainSource,
		/this\.app\.workspace\.trigger\("parse-style-settings"\);/u,
	);
});

function readJson<T>(path: string): T {
	return JSON.parse(readFileSync(path, "utf8")) as T;
}
