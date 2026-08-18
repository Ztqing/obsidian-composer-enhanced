import * as assert from "node:assert/strict";
import { test } from "node:test";

import { parseHTML } from "linkedom";

import type { ReadingCodeThemeRenderer } from "../src/features/reading-code-theme";
import {
	applyReadingCodeTheme,
	cleanupReadingCodeTheme,
	READING_CODE_BLOCK_THEME_CLASS,
	READING_CODE_THEME_CLASS,
} from "../src/features/reading-code-theme";

class FakeRenderer implements ReadingCodeThemeRenderer {
	isPassthroughLanguage(language: string): boolean {
		return language === "mermaid";
	}

	highlight(code: string, language: string): string | null {
		if (language !== "javascript" || code !== 'const answer = "yes";') {
			return null;
		}
		return [
			'<pre class="shiki one-dark-pro" style="background-color:#282c34">',
			'<code>',
			'<span style="color:#c678dd;font-style:italic;font-weight:bold">const</span>',
			'<span style="color:#abb2bf"> answer = </span>',
			'<span style="color:#98c379">"yes"</span>',
			'<span style="color:#abb2bf">;</span>',
			"</code>",
			"</pre>",
		].join("");
	}
}

void test("renders CodeSuite Shiki HTML while preserving and restoring Obsidian DOM", () => {
	const { document } = parseHTML(
		'<div class="markdown-reading-view"><pre id="block"><button class="copy-code-button">Copy</button><code id="code" class="language-js third-party-code"><span class="token keyword">const</span> answer = <span class="token string">"yes"</span>;</code></pre></div>',
	);
	const renderer = new FakeRenderer();
	const code = requireElement(document, "#code");
	const pre = requireElement(document, "#block");
	const originalHtml = code.innerHTML;

	assert.equal(applyReadingCodeTheme(document, renderer), 1);
	assert.equal(applyReadingCodeTheme(document, renderer), 1);

	assert.equal(code.textContent, 'const answer = "yes";');
	assert.equal(code.classList.contains(READING_CODE_THEME_CLASS), true);
	assert.equal(pre.classList.contains(READING_CODE_BLOCK_THEME_CLASS), true);
	assert.equal(pre.querySelectorAll(".copy-code-button").length, 1);
	assert.equal(code.querySelectorAll('[style*="color"]').length, 4);
	assert.equal(
		requireElement(code, '[style*="color:#c678dd"]').textContent,
		"const",
	);
	assert.equal(pre.getAttribute("style"), "background-color:#282c34");
	assert.equal(code.classList.contains("third-party-code"), true);

	cleanupReadingCodeTheme(document);

	assert.equal(code.innerHTML, originalHtml);
	assert.equal(code.classList.contains(READING_CODE_THEME_CLASS), false);
	assert.equal(pre.classList.contains(READING_CODE_BLOCK_THEME_CLASS), false);
	assert.equal(code.classList.contains("third-party-code"), true);
	assert.equal(pre.getAttribute("style"), null);
	assert.equal(pre.querySelectorAll(".copy-code-button").length, 1);
});

void test("leaves passthrough renderers untouched", () => {
	const { document } = parseHTML(
		'<pre id="block"><code class="language-mermaid">graph TD</code></pre>',
	);

	assert.equal(applyReadingCodeTheme(document, new FakeRenderer()), 0);
	assert.equal(document.querySelector('[style*="color"]'), null);
	assert.equal(
		requireElement(document, "#block").classList.contains(
			READING_CODE_BLOCK_THEME_CLASS,
		),
		false,
	);
});

void test("skips Obsidian frontmatter code-like DOM", () => {
	const { document } = parseHTML(
		'<div class="frontmatter"><pre id="manifest"><code class="language-yaml">title: Demo</code></pre></div>' +
		'<pre id="code"><code class="language-javascript">const answer = 1;</code></pre>',
	);
	const renderer: ReadingCodeThemeRenderer = {
		isPassthroughLanguage: () => false,
		highlight: (code) =>
			`<pre class="shiki"><code><span style="color:#c678dd">${code}</span></code></pre>`,
	};

	assert.equal(applyReadingCodeTheme(document, renderer), 1);
	assert.equal(
		requireElement(document, "#manifest code").classList.contains(
			READING_CODE_THEME_CLASS,
		),
		false,
	);
	assert.equal(
		requireElement(document, "#code code").classList.contains(
			READING_CODE_THEME_CLASS,
		),
		true,
	);
});

void test("does not mutate a code block when Shiki rendering fails", () => {
	const { document } = parseHTML(
		'<pre id="block"><code class="language-js"><span class="token keyword">const</span> value = 1;</code></pre>',
	);
	const code = requireElement(document, "code");
	const originalHtml = code.innerHTML;

	assert.equal(applyReadingCodeTheme(document, new FakeRenderer()), 0);
	assert.equal(code.innerHTML, originalHtml);
	assert.equal(code.classList.contains(READING_CODE_THEME_CLASS), false);
});

function requireElement(root: ParentNode, selector: string): HTMLElement {
	const element = root.querySelector<HTMLElement>(selector);
	assert.ok(element);
	return element;
}
