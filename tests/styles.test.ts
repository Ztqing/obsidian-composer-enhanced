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
	assert.match(styles, /\n\s+type: variable-number-slider\n/u);
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
	const imageHeading = styles.indexOf("id: composer-enhanced-image-layout");
	const imageAlignment = styles.indexOf("id: composer-enhanced-image-alignment");
	const tableHeading = styles.indexOf("id: composer-enhanced-table-layout");
	const tableAlignment = styles.indexOf("id: composer-enhanced-table-alignment");

	assert.ok(imageHeading >= 0);
	assert.ok(imageHeading < imageAlignment);
	assert.ok(imageAlignment < tableHeading);
	assert.ok(tableHeading < tableAlignment);
	assert.match(
		styles,
		/id: composer-enhanced-image-layout[\s\S]*?title: Images[\s\S]*?title\.zh: 图片[\s\S]*?type: heading[\s\S]*?level: 2/u,
	);
	assert.match(
		styles,
		/id: composer-enhanced-table-layout[\s\S]*?title: Tables[\s\S]*?title\.zh: 表格[\s\S]*?type: heading[\s\S]*?level: 2/u,
	);
	assert.doesNotMatch(styles, /id: composer-enhanced-content-alignment/u);

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

void test("offers percentage image width and three table width modes", () => {
	const styles = readFileSync("styles.css", "utf8");

	assert.match(
		styles,
		/id: composer-enhanced-image-width[\s\S]*?type: variable-number-slider[\s\S]*?default: 100[\s\S]*?min: 10[\s\S]*?max: 100[\s\S]*?step: 5[\s\S]*?format: "%"/u,
	);
	assert.match(
		styles,
		/id: composer-enhanced-table-width[\s\S]*?type: class-select[\s\S]*?default: composer-enhanced-table-width-default/u,
	);

	for (const mode of ["default", "full", "content"]) {
		assert.match(
			styles,
			new RegExp(`value: composer-enhanced-table-width-${mode}`, "u"),
		);
	}

	assert.match(styles, /label: Default \/ 默认/u);
	assert.match(styles, /label: Content width \/ 正文宽度/u);
	assert.match(
		styles,
		/label: Content width, content-aware \/ 正文宽度（按内容分配）/u,
	);
	assert.doesNotMatch(styles, /composer-enhanced-image-width-(?:default|wide|max|pane)/u);
	assert.doesNotMatch(styles, /composer-enhanced-table-width-(?:wide|max|pane)/u);
});

void test("offers a viewport image height limit", () => {
	const styles = readFileSync("styles.css", "utf8");

	assert.match(
		styles,
		/id: composer-enhanced-image-max-height[\s\S]*?type: variable-number-slider[\s\S]*?default: 80[\s\S]*?format: vh/u,
	);
	assert.match(styles, /--composer-enhanced-image-max-height: 80vh;/u);
});

void test("offers a visible native default and an opt-in One Dark Pro selector", () => {
	const styles = readFileSync("styles.css", "utf8");

	assert.match(
		styles,
		/id: composer-enhanced-code-theme[\s\S]*?type: class-select[\s\S]*?allowEmpty: false[\s\S]*?default: none[\s\S]*?label: Composer \(Default\) \/ Composer（默认）[\s\S]*?value: none/u,
	);
	assert.match(styles, /title: Code block theme/u);
	assert.match(styles, /title\.zh: 代码块主题/u);
	assert.match(styles, /value: composer-enhanced-code-theme-one-dark-pro/u);
	assert.doesNotMatch(styles, /composer-enhanced-code-theme-composer/u);
	assert.doesNotMatch(
		styles,
		/body\.composer-enhanced\.composer-enhanced-code-theme(?:\s|\{)/u,
	);
});

void test("offers an opt-in Components AI empty-state icon hiding toggle", () => {
	const styles = readFileSync("styles.css", "utf8");

	assert.match(
		styles,
		/id: composer-enhanced-components-plugin[\s\S]*?title: Components plugin[\s\S]*?title\.zh: Components 插件[\s\S]*?type: heading[\s\S]*?level: 2/u,
	);
	assert.match(
		styles,
		/id: composer-enhanced-hide-components-ai-empty-state-icon[\s\S]*?title: Hide Components AI empty-state icon[\s\S]*?title\.zh: 隐藏 Components AI 空状态图标[\s\S]*?type: class-toggle[\s\S]*?default: false/u,
	);
	assert.match(
		styles,
		/body\.composer-enhanced\.composer-enhanced-hide-components-ai-empty-state-icon\s*\.components--ChatConversationEmptyStateIconHost\s*\{[\s\S]*?display: none !important;/u,
	);
	assert.doesNotMatch(styles, /composer-enhanced-show-components-ai-empty-state-icon/u);
	assert.doesNotMatch(
		styles,
		/\.components--ChatConversationEmptyState\s*\{[^}]*display: none/gu,
	);
});

void test("keeps One Dark Pro block chrome separate from Shiki token colors", () => {
	const styles = readFileSync("styles.css", "utf8");
	const paletteRule = styles.match(
		/body\.composer-enhanced\.composer-enhanced-code-theme-one-dark-pro\s*\{([^}]*)\}/u,
	);
	assert.ok(paletteRule);
	assert.match(paletteRule[1] ?? "", /--composer-enhanced-code-background: #282c34;/u);
	assert.match(paletteRule[1] ?? "", /--composer-enhanced-code-foreground: #abb2bf;/u);
	assert.match(
		paletteRule[1] ?? "",
		/--composer-enhanced-code-control-muted: #7f848e;/u,
	);
	assert.match(
		paletteRule[1] ?? "",
		/--composer-enhanced-code-control-background: #404754;/u,
	);
	assert.match(
		paletteRule[1] ?? "",
		/--composer-enhanced-code-border: #3e4452;/u,
	);
	assert.match(
		paletteRule[1] ?? "",
		/--composer-enhanced-code-selection: #67769660;/u,
	);
	assert.match(
		paletteRule[1] ?? "",
		/--composer-enhanced-code-line-number: #495162;/u,
	);
	assert.match(paletteRule[1] ?? "", /--composer-enhanced-code-caret: #528bff;/u);
	assert.doesNotMatch(paletteRule[1] ?? "", /--composer-enhanced-code-keyword:/u);
	assert.doesNotMatch(paletteRule[1] ?? "", /--composer-enhanced-code-string:/u);
	assert.doesNotMatch(paletteRule[1] ?? "", /^\s*--code(?:block)?-/mu);
	assert.match(
		styles,
		/pre\.composer-enhanced-code-block-themed,[\s\S]*?\.composer-enhanced-code-block-line-themed\s*\{[\s\S]*?--code-background: var\(--composer-enhanced-code-background\);/u,
	);
	assert.match(
		styles,
		/pre\.composer-enhanced-code-block-themed,[\s\S]*?--codeblock-background: var\(--composer-enhanced-code-background\);[\s\S]*?--codeblock-caret-color: var\(--composer-enhanced-code-caret\);/u,
	);
	assert.doesNotMatch(
		styles,
		/composer-enhanced-code-theme-one-dark-pro\s+\.markdown-rendered\s+(?:pre|code)/u,
	);
});

void test("applies Shiki token markers to all three Markdown views", () => {
	const styles = readFileSync("styles.css", "utf8");
	const codeThemeStyles = extractCodeThemeStyles(styles);

	assert.match(
		codeThemeStyles,
		/composer-enhanced-code-theme-one-dark-pro[\s\S]*?pre\.composer-enhanced-code-block-themed/u,
	);
	assert.match(
		codeThemeStyles,
		/composer-enhanced-code-theme-one-dark-pro[\s\S]*?\.markdown-source-view\.mod-cm6\s+[\s\S]*?composer-enhanced-code-block-line-themed/u,
	);
	assert.doesNotMatch(
		codeThemeStyles,
		/\.markdown-source-view\.mod-cm6(?:\.is-live-preview|:not\(\.is-live-preview\))/u,
	);
	assert.doesNotMatch(codeThemeStyles, /\.composer-enhanced-code-token(?:-|\s*\{)/u);
	assert.doesNotMatch(codeThemeStyles, /--composer-enhanced-code-token-color/u);
	assert.match(
		codeThemeStyles,
		/code\.composer-enhanced-code-themed[\s\S]*?line-height: 1\.5;[\s\S]*?letter-spacing: initial;/u,
	);
	assert.doesNotMatch(
		codeThemeStyles,
		/\.markdown-source-view\.mod-cm6\s+div\.HyperMD-codeblock-bg/u,
	);
	assert.doesNotMatch(codeThemeStyles, /\.cm-inline-code/u);
	assert.doesNotMatch(codeThemeStyles, /\.token\./u);
	assert.doesNotMatch(codeThemeStyles, /\.cm-(?:keyword|string|def)/u);
	assert.doesNotMatch(codeThemeStyles, /\.line:hover/u);
	assert.doesNotMatch(
		codeThemeStyles,
		/\.cm-line\.HyperMD-codeblock\.composer-enhanced-code-block-line-themed:hover/u,
	);
});

function extractCodeThemeStyles(styles: string): string {
	const start = styles.indexOf("/* CodeSuite-style One Dark Pro block appearance.");
	const end = styles.indexOf(
		"body.composer-enhanced.composer-enhanced-image-align-center",
		start,
	);

	assert.notEqual(start, -1);
	assert.notEqual(end, -1);

	return styles.slice(start, end);
}

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
		/body\.composer-enhanced \.markdown-rendered p\.composer-enhanced-block-image/u,
	);
	assert.match(
		styles,
		/body\.composer-enhanced[\s\S]*?\.composer-enhanced-block-image-carrier/u,
	);
	assert.match(
		styles,
		/body\.composer-enhanced \.markdown-rendered table,[\s\S]*?\.markdown-source-view\.mod-cm6\.is-live-preview[\s\S]*?\.cm-table-widget[\s\S]*?table/u,
	);
});

void test("keeps table width modes inside the normal content width", () => {
	const styles = readFileSync("styles.css", "utf8");

	assert.doesNotMatch(styles, /--composer-enhanced-content-width:/u);
	assert.doesNotMatch(
		styles,
		/composer-enhanced-table-width-(?:full|content)[\s\S]*?\.markdown-preview-sizer\s*\{/u,
	);
	assert.doesNotMatch(
		styles,
		/composer-enhanced-table-width-(?:full|content)[\s\S]*?\.cm-sizer\s*[,{]/u,
	);
});

void test("sizes only automatic block images and preserves explicit dimensions", () => {
	const styles = readFileSync("styles.css", "utf8");

	assert.match(styles, /--composer-enhanced-image-width: 100%;/u);
	assert.match(
		styles,
		/\.composer-enhanced-automatic-block-image\s*\{[\s\S]*?min-width: 0;[\s\S]*?width: fit-content !important;[\s\S]*?max-width: var\(--composer-enhanced-image-width\) !important;/u,
	);
	assert.match(
		styles,
		/\.composer-enhanced-automatic-block-image[\s\S]*?img\s*\{[\s\S]*?width: auto !important;[\s\S]*?height: auto !important;[\s\S]*?max-width: 100% !important;[\s\S]*?max-height: var\(--composer-enhanced-image-max-height\) !important;/u,
	);
	assert.match(
		styles,
		/img\.composer-enhanced-automatic-block-image\s*\{[\s\S]*?max-width: var\(--composer-enhanced-image-width\) !important;[\s\S]*?max-height: var\(--composer-enhanced-image-max-height\) !important;/u,
	);
	assert.doesNotMatch(styles, /\[style\*="(?:width|height)"\]/u);
	assert.doesNotMatch(styles, /img\s*\{[^}]*(?:^|[;{]\s*)width: 100%/gmu);
	assert.doesNotMatch(styles, /composer-enhanced-image-width-(?:default|wide|max|pane)/u);
});

void test("keeps generic image content inside automatic carrier limits", () => {
	const styles = readFileSync("styles.css", "utf8");

	assert.match(
		styles,
		/\.composer-enhanced-automatic-block-image:not\(img\)\s*\{[\s\S]*?display: inline-flex !important;[\s\S]*?flex-direction: column;/u,
	);
	assert.match(
		styles,
		/\.composer-enhanced-automatic-block-image[\s\S]*?> \*\s*\{[\s\S]*?min-width: 0;[\s\S]*?max-width: 100% !important;[\s\S]*?overflow-wrap: anywhere;/u,
	);
	assert.doesNotMatch(styles, /captions-/u);
	assert.doesNotMatch(styles, /\.image-wrapper/u);
});

void test("supports natural, fixed content-width, and content-aware tables", () => {
	const styles = readFileSync("styles.css", "utf8");

	assert.match(
		styles,
		/body\.composer-enhanced\s*\{[\s\S]*?--composer-enhanced-table-container-width: fit-content;[\s\S]*?--composer-enhanced-table-content-width: auto;[\s\S]*?--composer-enhanced-table-layout: auto;/u,
	);
	assert.match(
		styles,
		/body\.composer-enhanced\.composer-enhanced-table-width-full\s*\{[\s\S]*?--composer-enhanced-table-container-width: 100%;[\s\S]*?--composer-enhanced-table-content-width: 100%;[\s\S]*?--composer-enhanced-table-layout: fixed;/u,
	);
	assert.match(
		styles,
		/body\.composer-enhanced\.composer-enhanced-table-width-content\s*\{[\s\S]*?--composer-enhanced-table-container-width: 100%;[\s\S]*?--composer-enhanced-table-content-width: 100%;[\s\S]*?--composer-enhanced-table-layout: auto;/u,
	);
	assert.match(
		styles,
		/\.cm-contentContainer[\s\S]*?> \.cm-content[\s\S]*?> \.cm-table-widget,[\s\S]*?width: var\(--composer-enhanced-table-container-width\) !important;[\s\S]*?max-width: 100% !important;[\s\S]*?overflow-x: auto;/u,
	);
	assert.match(
		styles,
		/\.markdown-rendered table,[\s\S]*?\.markdown-source-view\.mod-cm6\.is-live-preview[\s\S]*?\.cm-table-widget[\s\S]*?table,[\s\S]*?\.cm-html-embed[\s\S]*?table[\s\S]*?width: var\(--composer-enhanced-table-content-width\) !important;[\s\S]*?max-width: none;[\s\S]*?table-layout: var\(--composer-enhanced-table-layout\);/u,
	);
	assert.doesNotMatch(styles, /--composer-enhanced-table-width:/u);
	assert.doesNotMatch(styles, /--composer-enhanced-table-wrapper-width:/u);
	assert.doesNotMatch(styles, /\.cm-html-embed\s*\{[^}]*overflow-x: auto/u);
});

void test("repairs Composer academic tables in PDF and Components AI", () => {
	const styles = readFileSync("styles.css", "utf8");

	assert.match(
		styles,
		/body\.composer-enhanced\.composer--AcademicTableStyle[\s\S]*?> \.print[\s\S]*?\.markdown-rendered[\s\S]*?table[\s\S]*?> tbody[\s\S]*?> tr:first-child[\s\S]*?> td,[\s\S]*?body\.composer-enhanced\.composer--AcademicTableStyle[\s\S]*?\.components--ChatMessage[\s\S]*?\.components--MarkdownTextContent\.markdown-rendered[\s\S]*?table[\s\S]*?> tbody[\s\S]*?> tr:first-child[\s\S]*?> td\s*\{[\s\S]*?border-top-width: var\(--table-row-first-top-border-width, 1px\);[\s\S]*?border-top-color: var\(--table-row-first-border-color, var\(--text-faint\)\);[\s\S]*?border-top-style: solid;/u,
	);
	assert.match(
		styles,
		/body\.composer-enhanced\.composer--AcademicTableStyle[\s\S]*?> \.print[\s\S]*?\.markdown-rendered[\s\S]*?table[\s\S]*?> tbody[\s\S]*?> tr:last-child[\s\S]*?> td,[\s\S]*?body\.composer-enhanced\.composer--AcademicTableStyle[\s\S]*?\.components--ChatMessage[\s\S]*?\.components--MarkdownTextContent\.markdown-rendered[\s\S]*?table[\s\S]*?> tbody[\s\S]*?> tr:last-child[\s\S]*?> td\s*\{[\s\S]*?border-bottom-width: var\(--table-row-last-border-width, 2px\);[\s\S]*?border-bottom-color: var\(--table-row-last-border-color, var\(--text-normal\)\);[\s\S]*?border-bottom-style: solid;/u,
	);
	assert.doesNotMatch(
		styles,
		/body\.composer-enhanced\.composer--AcademicTableStyle\s+\.markdown-rendered\s+table/u,
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
