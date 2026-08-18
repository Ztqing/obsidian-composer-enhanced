import * as assert from "node:assert/strict";
import { test } from "node:test";

import { CodeThemeHighlighter } from "../src/features/code-theme-highlighter";
import { resolveCodeLanguage } from "../src/features/code-language";

void test("shares One Dark Pro Shiki HTML and token output", async () => {
	const highlighter = new CodeThemeHighlighter();
	assert.equal(await highlighter.initialize(), true);

	const html = highlighter.highlight("const answer = 1;", "js");
	assert.ok(html);
	assert.match(html, /<pre[^>]*class="shiki[^>]*>/u);
	assert.match(html, /color:/u);

	const tokens = highlighter.tokenize("const answer = 1;", "javascript");
	assert.ok(tokens);
	assert.equal(
		tokens.flat().map((token) => token.content).join(""),
		"const answer = 1;",
	);
	assert.ok(tokens.flat().some((token) => token.color));

	assert.equal(highlighter.highlight("echo hi", "zsh")?.includes("<pre"), true);
	assert.equal(highlighter.isPassthroughLanguage("mermaid"), true);
	highlighter.dispose();
});

void test("keeps the official One Dark Pro palette in token output", async () => {
	const highlighter = new CodeThemeHighlighter();
	assert.equal(await highlighter.initialize(), true);

	const tokens = highlighter.tokenize(
		'const answer = "ok"; // comment',
		"javascript",
	);
	assert.ok(tokens);
	const colors = new Set(
		tokens.flat().flatMap((token) => (token.color ? [token.color.toLowerCase()] : [])),
	);
	for (const color of ["#c678dd", "#e5c07b", "#56b6c2", "#98c379", "#7f848e"]) {
		assert.ok(colors.has(color), `missing official One Dark Pro color ${color}`);
	}
	assert.equal(highlighter.resolveLanguage("JSON5"), "json5");
	assert.equal(highlighter.resolveLanguage("unknown-language"), "text");
	highlighter.dispose();
});

void test("supports the expanded Shiki grammar set and aliases", async () => {
	const highlighter = new CodeThemeHighlighter();
	assert.equal(await highlighter.initialize(), true);

	for (const language of [
		"astro", "vue", "svelte", "scss", "less", "json5", "dart", "objective-c",
		"coffee", "clojure", "elixir", "erlang", "fsharp", "groovy",
		"protobuf", "prisma", "terraform", "nginx", "apache", "asm", "hlsl",
		"glsl", "solidity", "zig", "cobol", "csv", "properties", "dotenv",
		"shellsession",
	]) {
		assert.ok(highlighter.tokenize("const value = 1;", language), language);
	}

	for (const [alias, language] of Object.entries({
		"c#": "csharp",
		cc: "cpp",
		json5: "json5",
		objc: "objective-c",
		typescriptreact: "tsx",
		shader: "hlsl",
		"f#": "fsharp",
		cob: "cobol",
		console: "shellsession",
		tf: "terraform",
		tfvars: "terraform",
	})) {
		assert.equal(resolveCodeLanguage(alias), language);
	}
	highlighter.dispose();
});

void test("falls back unknown languages to plain text", async () => {
	const highlighter = new CodeThemeHighlighter();
	assert.equal(await highlighter.initialize(), true);
	const html = highlighter.highlight("plain text", "not-a-real-language");
	assert.ok(html);
	assert.match(html, /plain text/u);
	highlighter.dispose();
});
