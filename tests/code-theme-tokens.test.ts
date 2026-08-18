import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
	CODE_THEME_FONT_STYLE_BOLD,
	CODE_THEME_FONT_STYLE_ITALIC,
	CODE_THEME_FONT_STYLE_UNDERLINE,
	codeThemeTokenStyle,
	normalizeCodeThemeColor,
	normalizeCodeThemeFontStyle,
} from "../src/features/code-theme-tokens";

void test("accepts only self-contained hexadecimal theme colors", () => {
	assert.equal(normalizeCodeThemeColor("#abb2bf"), "#abb2bf");
	assert.equal(normalizeCodeThemeColor("#fff"), "#fff");
	assert.equal(normalizeCodeThemeColor(undefined), undefined);
	assert.equal(normalizeCodeThemeColor("#12345"), undefined);
	assert.equal(normalizeCodeThemeColor("red; display:none"), undefined);
	assert.equal(normalizeCodeThemeColor("var(--third-party-color)"), undefined);
});

void test("serializes Shiki token styles as CodeSuite-compatible inline CSS", () => {
	assert.equal(
		codeThemeTokenStyle({
			content: "keyword",
			color: "#c678dd",
			fontStyle:
				CODE_THEME_FONT_STYLE_ITALIC |
				CODE_THEME_FONT_STYLE_BOLD |
				CODE_THEME_FONT_STYLE_UNDERLINE,
		}),
		"color: #c678dd !important; font-style: italic; font-weight: bold; text-decoration: underline",
	);
	assert.equal(codeThemeTokenStyle({ content: "plain" }), undefined);
	assert.equal(
		codeThemeTokenStyle({ content: "unsafe", color: "red; color: blue" }),
		undefined,
	);
});

void test("keeps only the font styles represented by theme token marks", () => {
	assert.equal(normalizeCodeThemeFontStyle(CODE_THEME_FONT_STYLE_ITALIC), 1);
	assert.equal(normalizeCodeThemeFontStyle(8), undefined);
	assert.equal(normalizeCodeThemeFontStyle(9), CODE_THEME_FONT_STYLE_ITALIC);
});
