import * as assert from "node:assert/strict";
import { test } from "node:test";

import { Text } from "@codemirror/state";

import {
	extractFenceLanguage,
	scanFencedCodeBlocks,
} from "../src/features/fenced-code-blocks";

void test("scans closed backtick and tilde fences without including delimiters", () => {
	const document = Text.of([
		"before",
		"  ```ts title=demo",
		"const answer = 42;",
		"  ```",
		"~~~python",
		"print('ok')",
		"~~~~",
		"after",
	]);

	const blocks = scanFencedCodeBlocks(document);
	assert.equal(blocks.length, 2);
	assert.equal(blocks[0]?.language, "typescript");
	assert.equal(blocks[0]?.info, "ts title=demo");
	assert.equal(blocks[0]?.code, "const answer = 42;");
	assert.equal(blocks[1]?.language, "python");
	assert.equal(blocks[1]?.code, "print('ok')");
});

void test("requires a matching closing character and sufficient fence length", () => {
	const document = Text.of([
		"````js",
		"const open = true;",
		"```",
		"still code",
		"~~~~",
		"still code too",
		"`````",
		"```python",
		"unclosed = True",
	]);

	const blocks = scanFencedCodeBlocks(document);
	assert.equal(blocks.length, 1);
	assert.equal(
		blocks[0]?.code,
		"const open = true;\n```\nstill code\n~~~~\nstill code too",
	);
});

void test("normalizes common fenced language attributes", () => {
	assert.equal(extractFenceLanguage("{.JavaScript}"), "javascript");
	assert.equal(extractFenceLanguage("language-python extra"), "python");
	assert.equal(extractFenceLanguage("{.TSX linenos}"), "tsx");
	assert.equal(extractFenceLanguage("rest"), "http");
	assert.equal(extractFenceLanguage("unknown-language"), "text");
	assert.equal(extractFenceLanguage(""), "text");
});
