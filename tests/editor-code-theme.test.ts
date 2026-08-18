import * as assert from "node:assert/strict";
import { test } from "node:test";

import { Text } from "@codemirror/state";

import type {
	CodeThemeTokenLines,
	CodeThemeTokenizer,
} from "../src/features/code-theme-tokens";
import {
	collectEditorCodeThemeDecorations,
	collectEditorCodeThemeRanges,
} from "../src/features/editor-code-theme";

class FakeTokenizer implements CodeThemeTokenizer {
	isPassthroughLanguage(language: string): boolean {
		return language === "mermaid";
	}

	tokenize(code: string, language: string): CodeThemeTokenLines | null {
		if (language !== "javascript" || code !== "const answer = 1;") {
			return null;
		}
		return [[
			{ content: "const", color: "#c678dd" },
			{ content: " answer = ", color: "#abb2bf" },
			{ content: "1", color: "#d19a66" },
			{ content: ";", color: "#abb2bf" },
		]];
	}
}

void test("maps Shiki tokens onto fenced code content without decorating delimiters", () => {
	const document = Text.of([
		"before",
		"```js",
		"const answer = 1;",
		"```",
		"after",
	]);
	const ranges = collectEditorCodeThemeRanges(
		document,
		[{ from: 0, to: document.length }],
		new FakeTokenizer(),
	);

	assert.deepEqual(
		ranges.map((range) => document.sliceString(range.from, range.to)),
		["const", " answer = ", "1", ";"],
	);
	assert.ok(ranges.every((range) => range.from > document.line(2).to));
	assert.ok(ranges.every((range) => range.to < document.line(4).from));
	assert.deepEqual(
		ranges.map((range) => range.style),
		[
			"color: #c678dd !important",
			"color: #abb2bf !important",
			"color: #d19a66 !important",
			"color: #abb2bf !important",
		],
	);
});

void test("marks only Shiki-themed code block lines for editor chrome", () => {
	const document = Text.of([
		"```mermaid",
		"graph TD",
		"```",
		"```js",
		"const answer = 1;",
		"```",
	]);
	const decorations = collectEditorCodeThemeDecorations(
		document,
		[{ from: 0, to: document.length }],
		new FakeTokenizer(),
	);

	assert.deepEqual(
		decorations.lines.map((range) =>
			document.sliceString(range.from, range.to)
		),
		["```js", "const answer = 1;", "```"],
	);
	assert.equal(decorations.tokens.length, 4);
});

void test("skips passthrough blocks and blocks outside the visible ranges", () => {
	const document = Text.of([
		"```mermaid",
		"graph TD",
		"```",
		"```js",
		"const answer = 1;",
		"```",
	]);
	const tokenizer = new FakeTokenizer();

	assert.deepEqual(
		collectEditorCodeThemeRanges(
			document,
			[{ from: document.line(1).from, to: document.line(3).to }],
			tokenizer,
		),
		[],
	);
	assert.equal(
		collectEditorCodeThemeRanges(
			document,
			[{ from: document.line(5).from, to: document.line(5).to }],
			tokenizer,
		).length,
		4,
	);
});
