import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
	CODE_THEME_FONT_STYLE_ITALIC,
	CODE_THEME_DEFAULT_FOREGROUND,
	flattenCodeThemeTokens,
	normalizeCodeThemeColor,
	normalizeCodeThemeFontStyle,
} from "../src/features/code-theme-tokens";

void test("flattens Shiki lines across CRLF and Unicode code units", () => {
	const source = "a😀\r\nb";
	const ranges = flattenCodeThemeTokens(source, [
		[
			{ content: "a", color: "#111111" },
			{
				content: "😀",
				color: "#222222",
				fontStyle: CODE_THEME_FONT_STYLE_ITALIC,
			},
		],
		[{ content: "b", color: "#333333" }],
	]);

	assert.deepEqual(ranges, [
		{ from: 0, to: 1, color: "#111111", fontStyle: undefined },
		{
			from: 1,
			to: 3,
			color: "#222222",
			fontStyle: CODE_THEME_FONT_STYLE_ITALIC,
		},
		{ from: 5, to: 6, color: "#333333", fontStyle: undefined },
	]);
});

void test("accepts only self-contained hexadecimal theme colors", () => {
	assert.equal(normalizeCodeThemeColor("#abb2bf"), "#abb2bf");
	assert.equal(normalizeCodeThemeColor("#fff"), "#fff");
	assert.equal(normalizeCodeThemeColor(undefined), CODE_THEME_DEFAULT_FOREGROUND);
	assert.equal(normalizeCodeThemeColor("#12345"), undefined);
	assert.equal(normalizeCodeThemeColor("red; display:none"), undefined);
	assert.equal(normalizeCodeThemeColor("var(--third-party-color)"), undefined);
});

void test("gives uncolored Shiki text the One Dark Pro default foreground", () => {
	assert.deepEqual(
		flattenCodeThemeTokens("plain", [[{ content: "plain" }]]),
		[{ from: 0, to: 5, color: CODE_THEME_DEFAULT_FOREGROUND, fontStyle: undefined }],
	);
});

void test("keeps only the font styles represented by theme token classes", () => {
	assert.equal(normalizeCodeThemeFontStyle(CODE_THEME_FONT_STYLE_ITALIC), 1);
	assert.equal(normalizeCodeThemeFontStyle(8), undefined);
	assert.equal(normalizeCodeThemeFontStyle(9), CODE_THEME_FONT_STYLE_ITALIC);
});
