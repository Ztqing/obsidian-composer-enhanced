import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

void test("registers an independent Style Settings section", () => {
	const styles = readFileSync("styles.css", "utf8");

	assert.match(styles, /^\/\* @settings\n/u);
	assert.match(styles, /\nname: Composer Enhanced\n/u);
	assert.match(styles, /\nid: obsidian-composer-enhanced\n/u);
	assert.match(styles, /\n\s+type: info-text\n/u);
	assert.match(styles, /\n\s+type: class-toggle\n/u);
	assert.match(styles, /\n\s+type: class-select\n/u);
});

void test("reserves the plugin namespace for future settings", () => {
	const styles = readFileSync("styles.css", "utf8");
	const settingIds = [...styles.matchAll(/^\s+- id: (.+)$/gmu)].map(
		(match) => match[1],
	);

	assert.ok(settingIds.length > 0);
	assert.ok(settingIds.every((id) => id?.startsWith("composer-enhanced-")));
});

void test("offers independent image and table alignment controls", () => {
	const styles = readFileSync("styles.css", "utf8");

	assert.match(
		styles,
		/id: composer-enhanced-image-alignment[\s\S]*?default: composer-enhanced-image-align-center/u,
	);
	assert.match(
		styles,
		/id: composer-enhanced-table-alignment[\s\S]*?default: composer-enhanced-table-align-center/u,
	);

	for (const alignment of ["center", "left", "right"]) {
		assert.match(
			styles,
			new RegExp(`value: composer-enhanced-image-align-${alignment}`, "u"),
		);
		assert.match(
			styles,
			new RegExp(`value: composer-enhanced-table-align-${alignment}`, "u"),
		);
	}

	assert.match(styles, /label: Center \/ 居中/u);
	assert.match(styles, /label: Left \/ 靠左/u);
	assert.match(styles, /label: Right \/ 靠右/u);
});

void test("offers Composer and One Dark Pro code block themes", () => {
	const styles = readFileSync("styles.css", "utf8");

	assert.match(
		styles,
		/id: composer-enhanced-code-theme[\s\S]*?type: class-select[\s\S]*?default: composer-enhanced-code-theme-composer/u,
	);
	assert.match(styles, /value: composer-enhanced-code-theme-composer/u);
	assert.match(styles, /value: composer-enhanced-code-theme-one-dark-pro/u);
});

void test("maps the One Dark Pro palette to Obsidian code semantics", () => {
	const styles = readFileSync("styles.css", "utf8");
	const paletteRule = styles.match(
		/body\.composer-enhanced\.composer-enhanced-code-theme-one-dark-pro\s*\{([^}]*)\}/u,
	);
	assert.ok(paletteRule);
	assert.match(paletteRule[1] ?? "", /--composer-enhanced-code-background: #282c34;/u);
	assert.match(paletteRule[1] ?? "", /--composer-enhanced-code-normal: #abb2bf;/u);
	assert.match(paletteRule[1] ?? "", /--composer-enhanced-code-comment: #7f848e;/u);
	assert.match(paletteRule[1] ?? "", /--composer-enhanced-code-function: #61afef;/u);
	assert.match(paletteRule[1] ?? "", /--composer-enhanced-code-keyword: #c678dd;/u);
	assert.match(paletteRule[1] ?? "", /--composer-enhanced-code-string: #98c379;/u);
	assert.match(paletteRule[1] ?? "", /--composer-enhanced-code-property: #e06c75;/u);
	assert.match(paletteRule[1] ?? "", /--composer-enhanced-code-value: #d19a66;/u);
	assert.match(paletteRule[1] ?? "", /--composer-enhanced-code-caret: #528bff;/u);
	assert.doesNotMatch(paletteRule[1] ?? "", /^\s*--code(?:block)?-/mu);
	assert.match(
		styles,
		/\.markdown-reading-view[\s\S]*?\.markdown-preview-view[\s\S]*?pre,[\s\S]*?\.cm-line\.HyperMD-codeblock\s*\{[\s\S]*?--code-background: var\(--composer-enhanced-code-background\);/u,
	);
	assert.doesNotMatch(
		styles,
		/composer-enhanced-code-theme-one-dark-pro\s+\.markdown-rendered\s+pre/u,
	);
});

void test("applies One Dark Pro to all three Markdown views", () => {
	const styles = readFileSync("styles.css", "utf8");

	assert.match(
		styles,
		/composer-enhanced-code-theme-one-dark-pro[\s\S]*?\.markdown-reading-view[\s\S]*?\.markdown-preview-view[\s\S]*?pre/u,
	);
	assert.match(
		styles,
		/composer-enhanced-code-theme-one-dark-pro[\s\S]*?\.markdown-source-view\.mod-cm6\.is-live-preview[\s\S]*?HyperMD-codeblock/u,
	);
	assert.match(
		styles,
		/composer-enhanced-code-theme-one-dark-pro[\s\S]*?\.markdown-source-view\.mod-cm6:not\(\.is-live-preview\)[\s\S]*?HyperMD-codeblock/u,
	);
	assert.match(styles, /\.token\.class-name/u);
	assert.match(styles, /\.HyperMD-codeblock[\s\S]*?\.cm-type/u);
	assert.match(styles, /\.composer-enhanced-code-token-variable/u);
	assert.match(styles, /\.composer-enhanced-code-token-function/u);
	assert.match(styles, /\.composer-enhanced-code-token-property/u);
	assert.match(styles, /\.composer-enhanced-code-token-keyword/u);
	assert.match(styles, /\.composer-enhanced-code-token-type/u);
	assert.match(
		styles,
		/pre[\s\S]*?> code[\s\S]*?line-height: 1\.5;[\s\S]*?letter-spacing: initial;/u,
	);
});

void test("uses a positive toggle for the Composer callout compatibility fix", () => {
	const styles = readFileSync("styles.css", "utf8");

	assert.match(
		styles,
		/id: composer-enhanced-enable-callout-fix[\s\S]*?type: class-toggle[\s\S]*?default: true/u,
	);

	const calloutRules = [...styles.matchAll(/([^{}]+)\{([^{}]*--callout-[^{}]*)\}/gu)];
	assert.ok(calloutRules.length > 0);
	assert.ok(
		calloutRules.every((match) => {
			const selector = match[1]?.replace(/\s+/gu, "") ?? "";
			return (
				selector.includes(":not(.css-settings-manager)") &&
				selector.includes(".composer-enhanced-enable-callout-fix")
			);
		}),
	);
});

void test("scopes block image and table alignment to the plugin", () => {
	const styles = readFileSync("styles.css", "utf8");

	assert.match(
		styles,
		/body\.composer-enhanced \.markdown-rendered p:has\([^\n]+\.image-embed/u,
	);
	assert.match(
		styles,
		/body\.composer-enhanced[\s\S]*?\.markdown-source-view\.mod-cm6[\s\S]*?\.cm-embed-block/u,
	);
	assert.match(
		styles,
		/body\.composer-enhanced \.markdown-rendered table,[\s\S]*?\.cm-table-widget table/u,
	);
});

void test("converts Composer 0.7.0 callout triplets into CSS colors", () => {
	const styles = readFileSync("styles.css", "utf8");

	assert.match(styles, /--callout-default: rgb\(var\(--color-blue-rgb\)\);/u);
	assert.match(styles, /--callout-error: rgb\(158, 48, 57\);/u);
	assert.match(styles, /--callout-error: rgb\(255, 100, 92\);/u);
	assert.match(
		styles,
		/body\.composer-enhanced\.composer--NiScheme-light\.theme-light\.composer-enhanced-enable-callout-fix/u,
	);
	assert.match(
		styles,
		/body\.composer-enhanced\.composer--NiScheme-dark\.theme-dark\.composer-enhanced-enable-callout-fix/u,
	);
});
