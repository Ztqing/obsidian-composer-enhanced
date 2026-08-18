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

void test("keeps code theme rendering behind dedicated lifecycle modules", () => {
	const mainSource = readFileSync("src/main.ts", "utf8");
	const codeThemeSource = readFileSync("src/features/code-theme.ts", "utf8");
	const codeThemeStateSource = readFileSync(
		"src/features/code-theme-state.ts",
		"utf8",
	);
	const codeLanguageSource = readFileSync(
		"src/features/code-language.ts",
		"utf8",
	);
	const fencedCodeSource = readFileSync(
		"src/features/fenced-code-blocks.ts",
		"utf8",
	);
	const readingCodeSource = readFileSync(
		"src/features/reading-code-theme.ts",
		"utf8",
	);
	const highlighterSource = readFileSync(
		"src/features/code-theme-highlighter.ts",
		"utf8",
	);

	assert.match(mainSource, /registerCodeTheme\(this\);/u);
	assert.ok(existsSync("src/features/code-theme-highlighter.ts"));
	assert.ok(existsSync("src/features/code-language.ts"));
	assert.ok(existsSync("src/features/reading-code-theme.ts"));
	assert.ok(existsSync("src/features/editor-code-theme.ts"));
	assert.ok(existsSync("src/features/fenced-code-blocks.ts"));
	assert.match(codeThemeSource, /plugin\.registerMarkdownPostProcessor/u);
	assert.match(codeThemeSource, /plugin\.registerEditorExtension/u);
	assert.match(codeThemeSource, /cleanupReadingCodeTheme/u);
	assert.match(codeThemeSource, /controller\.highlighter/u);
	assert.match(codeThemeStateSource, /isCodeThemeActive/u);
	assert.match(codeLanguageSource, /export function resolveCodeLanguage/u);
	assert.match(fencedCodeSource, /extractCodeLanguage/u);
	assert.match(readingCodeSource, /extractCodeLanguage/u);
	assert.match(highlighterSource, /resolveCodeLanguage/u);
	assert.match(highlighterSource, /codeToHtml/u);
	assert.match(readingCodeSource, /ReadingCodeThemeRenderer/u);
	assert.match(readingCodeSource, /data-composer-enhanced-code-theme/u);
	assert.match(readingCodeSource, /originalChildren/u);
	assert.doesNotMatch(readingCodeSource, /composer-enhanced-code-token-/u);
	assert.doesNotMatch(mainSource, /Shiki|Decoration|querySelector/u);
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
