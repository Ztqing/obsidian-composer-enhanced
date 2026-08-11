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
