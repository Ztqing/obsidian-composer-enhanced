import * as assert from "node:assert/strict";
import { test } from "node:test";

import { parseHTML } from "linkedom";

import {
	CODE_THEME_FONT_STYLE_BOLD,
	CODE_THEME_FONT_STYLE_ITALIC,
	type CodeThemeTokenLines,
	type CodeThemeTokenizer,
} from "../src/features/code-theme-tokens";
import {
	applyReadingCodeTheme,
	cleanupReadingCodeTheme,
	CODE_THEME_TOKEN_BOLD_CLASS,
	CODE_THEME_TOKEN_CLASS,
	CODE_THEME_TOKEN_COLOR_PROPERTY,
	CODE_THEME_TOKEN_ITALIC_CLASS,
	READING_CODE_BLOCK_THEME_CLASS,
	READING_CODE_THEME_CLASS,
} from "../src/features/reading-code-theme";

class FakeTokenizer implements CodeThemeTokenizer {
	isPassthroughLanguage(language: string): boolean {
		return language === "mermaid";
	}

	tokenize(code: string, language: string): CodeThemeTokenLines | null {
		if (language !== "javascript" || code !== 'const answer = "yes";') {
			return null;
		}
		return [[
			{
				content: "const",
				color: "#c678dd",
				fontStyle:
					CODE_THEME_FONT_STYLE_ITALIC | CODE_THEME_FONT_STYLE_BOLD,
			},
			{ content: " answer = ", color: "#abb2bf" },
			{ content: '"yes"', color: "#98c379" },
			{ content: ";", color: "#abb2bf" },
		]];
	}
}

void test("adds Shiki tokens inside existing Prism spans and cleans up only its own DOM", () => {
	const { document } = parseHTML(
		'<div class="markdown-reading-view"><pre id="block"><button class="copy-code-button">Copy</button><code id="code" class="language-js third-party-code"><span class="token keyword">const</span> answer = <span class="token string">"yes"</span>;</code></pre></div>',
	);
	const tokenizer = new FakeTokenizer();

	assert.equal(applyReadingCodeTheme(document, tokenizer), 1);
	assert.equal(applyReadingCodeTheme(document, tokenizer), 1);

	const code = requireElement(document, "#code");
	const pre = requireElement(document, "#block");
	const keyword = requireElement(document, ".token.keyword");
	const keywordToken = requireElement(keyword, `.${CODE_THEME_TOKEN_CLASS}`);
	assert.equal(code.textContent, 'const answer = "yes";');
	assert.equal(code.classList.contains(READING_CODE_THEME_CLASS), true);
	assert.equal(pre.classList.contains(READING_CODE_BLOCK_THEME_CLASS), true);
	assert.equal(pre.querySelectorAll(".copy-code-button").length, 1);
	assert.equal(code.querySelectorAll(`.${CODE_THEME_TOKEN_CLASS}`).length, 4);
	assert.equal(keyword.classList.contains("token"), true);
	assert.equal(keywordToken.classList.contains(CODE_THEME_TOKEN_ITALIC_CLASS), true);
	assert.equal(keywordToken.classList.contains(CODE_THEME_TOKEN_BOLD_CLASS), true);
	assert.equal(
		keywordToken.style.getPropertyValue(CODE_THEME_TOKEN_COLOR_PROPERTY),
		"#c678dd",
	);

	cleanupReadingCodeTheme(document);

	assert.equal(code.querySelector(`.${CODE_THEME_TOKEN_CLASS}`), null);
	assert.equal(code.classList.contains(READING_CODE_THEME_CLASS), false);
	assert.equal(pre.classList.contains(READING_CODE_BLOCK_THEME_CLASS), false);
	assert.equal(code.classList.contains("third-party-code"), true);
	assert.equal(keyword.classList.contains("token"), true);
	assert.equal(code.textContent, 'const answer = "yes";');
});

void test("leaves passthrough renderers untouched", () => {
	const { document } = parseHTML(
		'<pre id="block"><code class="language-mermaid">graph TD</code></pre>',
	);

	assert.equal(applyReadingCodeTheme(document, new FakeTokenizer()), 0);
	assert.equal(document.querySelector(`.${CODE_THEME_TOKEN_CLASS}`), null);
	assert.equal(
		requireElement(document, "#block").classList.contains(
			READING_CODE_BLOCK_THEME_CLASS,
		),
		false,
	);
});

function requireElement(root: ParentNode, selector: string): HTMLElement {
	const element = root.querySelector<HTMLElement>(selector);
	assert.ok(element);
	return element;
}
