import * as assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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
	const packageMetadata = readJson<PackageMetadata>("package.json");

	assert.equal(manifest.id, "composer-enhanced");
	assert.equal(manifest.version, packageMetadata.version);
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

void test("keeps code theme rendering free of runtime token rewriting", () => {
	const mainSource = readFileSync("src/main.ts", "utf8");

	assert.doesNotMatch(mainSource, /ReadingCode|CodeToken/u);
	assert.equal(existsSync("src/features/reading-code-theme.ts"), false);
	assert.equal(existsSync("src/features/code-token-classifier.ts"), false);
});

void test("registers and cleans up block image layout markers", () => {
	const mainSource = readFileSync("src/main.ts", "utf8");
	const blockImageSource = readFileSync(
		"src/features/block-image-layout.ts",
		"utf8",
	);
	const blockImageStateSource = readFileSync(
		"src/features/block-image-layout-state.ts",
		"utf8",
	);
	const blockImageObserverSource = readFileSync(
		"src/features/block-image-layout-observer.ts",
		"utf8",
	);

	assert.match(mainSource, /registerBlockImageLayout\(this\);/u);
	assert.match(blockImageSource, /plugin\.register\(\(\) => cleanupBlockImageLayout\(document\)\);/u);
	assert.match(
		blockImageStateSource,
		/export const BLOCK_IMAGE_CLASS = "composer-enhanced-block-image";/u,
	);
	assert.match(
		blockImageStateSource,
		/export const BLOCK_IMAGE_CARRIER_CLASS =[\s\S]*?"composer-enhanced-block-image-carrier";/u,
	);
	assert.match(
		blockImageStateSource,
		/export const AUTOMATIC_BLOCK_IMAGE_CLASS =[\s\S]*?"composer-enhanced-automatic-block-image";/u,
	);
	assert.match(blockImageStateSource, /\.classList\.toggle\(BLOCK_IMAGE_CLASS/u);
	assert.match(
		blockImageStateSource,
		/carrier\.classList\.add\(BLOCK_IMAGE_CARRIER_CLASS\);[\s\S]*?carrier\.classList\.toggle\([\s\S]*?AUTOMATIC_BLOCK_IMAGE_CLASS,[\s\S]*?isAutomaticallySizedImage\(carrier\)/u,
	);
	assert.match(
		blockImageStateSource,
		/element\.style\.width[\s\S]*?element\.style\.height[\s\S]*?element\.style\.maxWidth[\s\S]*?element\.style\.maxHeight/u,
	);
	assert.match(
		blockImageStateSource,
		/element\.classList\.remove\([\s\S]*?BLOCK_IMAGE_CLASS,[\s\S]*?BLOCK_IMAGE_CARRIER_CLASS,[\s\S]*?AUTOMATIC_BLOCK_IMAGE_CLASS/u,
	);
	assert.match(blockImageSource, /plugin\.registerEditorExtension\(/u);
	assert.match(blockImageSource, /ViewPlugin\.define\(/u);
	assert.doesNotMatch(blockImageSource, /captions-/u);
	assert.doesNotMatch(blockImageStateSource, /captions-/u);
	assert.match(blockImageObserverSource, /collectAffectedImageLayoutBlocks\(/u);
	assert.match(blockImageObserverSource, /pendingBlocks/u);
	assert.match(blockImageSource, /observer\?\.destroy\(\);/u);
	assert.match(blockImageObserverSource, /observer\?\.disconnect\(\);/u);
});

function readJson<T>(path: string): T {
	return JSON.parse(readFileSync(path, "utf8")) as T;
}
