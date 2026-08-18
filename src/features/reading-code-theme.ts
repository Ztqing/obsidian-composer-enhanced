import {
	CODE_THEME_FONT_STYLE_BOLD,
	CODE_THEME_FONT_STYLE_ITALIC,
	CODE_THEME_FONT_STYLE_UNDERLINE,
	flattenCodeThemeTokens,
	type CodeThemeTokenRange,
	type CodeThemeTokenizer,
} from "./code-theme-tokens";
import { extractCodeLanguage } from "./code-language";

export const CODE_THEME_TOKEN_CLASS = "composer-enhanced-code-token";
export const CODE_THEME_TOKEN_ITALIC_CLASS = "composer-enhanced-code-token-italic";
export const CODE_THEME_TOKEN_BOLD_CLASS = "composer-enhanced-code-token-bold";
export const CODE_THEME_TOKEN_UNDERLINE_CLASS =
	"composer-enhanced-code-token-underline";
export const READING_CODE_THEME_CLASS = "composer-enhanced-code-themed";
export const READING_CODE_BLOCK_THEME_CLASS =
	"composer-enhanced-code-block-themed";
export const CODE_THEME_TOKEN_COLOR_PROPERTY =
	"--composer-enhanced-code-token-color";

interface TextNodeRange {
	node: Text;
	from: number;
	to: number;
}

export function applyReadingCodeTheme(
	root: ParentNode,
	tokenizer: CodeThemeTokenizer,
): number {
	let themedBlocks = 0;
	for (const codeElement of collectCodeElements(root)) {
		cleanupReadingCodeElement(codeElement);

		const preElement = codeElement.parentElement;
		if (!preElement || preElement.tagName.toLowerCase() !== "pre") {
			continue;
		}

		const language = readCodeLanguage(codeElement, preElement);
		if (tokenizer.isPassthroughLanguage(language)) {
			continue;
		}

		const source = codeElement.textContent ?? "";
		const tokenLines = tokenizer.tokenize(source, language);
		if (!tokenLines) {
			continue;
		}

		codeElement.classList.add(READING_CODE_THEME_CLASS);
		preElement.classList.add(READING_CODE_BLOCK_THEME_CLASS);
		decorateTextNodes(
			codeElement,
			flattenCodeThemeTokens(source, tokenLines),
		);
		themedBlocks += 1;
	}

	return themedBlocks;
}

export function cleanupReadingCodeTheme(root: ParentNode): void {
	for (const codeElement of collectMarkedCodeElements(root)) {
		cleanupReadingCodeElement(codeElement);
	}
	for (const preElement of collectElements(
		root,
		`pre.${READING_CODE_BLOCK_THEME_CLASS}`,
	)) {
		preElement.classList.remove(READING_CODE_BLOCK_THEME_CLASS);
	}
}

export function codeThemeTokenClassNames(fontStyle: number | undefined): string {
	const classNames = [CODE_THEME_TOKEN_CLASS];
	if (fontStyle && (fontStyle & CODE_THEME_FONT_STYLE_ITALIC) !== 0) {
		classNames.push(CODE_THEME_TOKEN_ITALIC_CLASS);
	}
	if (fontStyle && (fontStyle & CODE_THEME_FONT_STYLE_BOLD) !== 0) {
		classNames.push(CODE_THEME_TOKEN_BOLD_CLASS);
	}
	if (fontStyle && (fontStyle & CODE_THEME_FONT_STYLE_UNDERLINE) !== 0) {
		classNames.push(CODE_THEME_TOKEN_UNDERLINE_CLASS);
	}
	return classNames.join(" ");
}

function cleanupReadingCodeElement(codeElement: HTMLElement): void {
	for (const tokenElement of Array.from(
		codeElement.querySelectorAll<HTMLElement>(`.${CODE_THEME_TOKEN_CLASS}`),
	).reverse()) {
		unwrapElement(tokenElement);
	}
	codeElement.classList.remove(READING_CODE_THEME_CLASS);
	codeElement.parentElement?.classList.remove(READING_CODE_BLOCK_THEME_CLASS);
}

function decorateTextNodes(
	codeElement: HTMLElement,
	tokenRanges: readonly CodeThemeTokenRange[],
): void {
	if (tokenRanges.length === 0) {
		return;
	}

	const textNodes = collectTextNodeRanges(codeElement);
	let tokenIndex = 0;

	for (const textNode of textNodes) {
		while (
			tokenIndex < tokenRanges.length &&
			(tokenRanges[tokenIndex]?.to ?? 0) <= textNode.from
		) {
			tokenIndex += 1;
		}

		const overlaps: CodeThemeTokenRange[] = [];
		for (let index = tokenIndex; index < tokenRanges.length; index += 1) {
			const range = tokenRanges[index];
			if (!range || range.from >= textNode.to) {
				break;
			}
			if (range.to > textNode.from) {
				overlaps.push(range);
			}
		}

		if (overlaps.length > 0) {
			replaceTextNodeWithTokens(textNode, overlaps);
		}
	}
}

function collectTextNodeRanges(root: HTMLElement): TextNodeRange[] {
	const ranges: TextNodeRange[] = [];
	const walker = root.ownerDocument.createTreeWalker(root, 4);
	let offset = 0;
	let current = walker.nextNode();

	while (current) {
		const node = current as Text;
		const length = node.data.length;
		ranges.push({ node, from: offset, to: offset + length });
		offset += length;
		current = walker.nextNode();
	}

	return ranges;
}

function replaceTextNodeWithTokens(
	textNode: TextNodeRange,
	tokenRanges: readonly CodeThemeTokenRange[],
): void {
	const parent = textNode.node.parentNode;
	if (!parent) {
		return;
	}

	const document = textNode.node.ownerDocument;
	const fragment = document.createDocumentFragment();
	const text = textNode.node.data;
	let cursor = 0;

	for (const range of tokenRanges) {
		const from = Math.max(0, range.from - textNode.from);
		const to = Math.min(text.length, range.to - textNode.from);
		if (from >= to || from < cursor) {
			continue;
		}

		if (from > cursor) {
			fragment.appendChild(document.createTextNode(text.slice(cursor, from)));
		}

		const tokenElement = document.createElement("span");
		tokenElement.className = codeThemeTokenClassNames(range.fontStyle);
		if (range.color) {
			tokenElement.style.setProperty(CODE_THEME_TOKEN_COLOR_PROPERTY, range.color);
		}
		tokenElement.textContent = text.slice(from, to);
		fragment.appendChild(tokenElement);
		cursor = to;
	}

	if (cursor < text.length) {
		fragment.appendChild(document.createTextNode(text.slice(cursor)));
	}
	parent.replaceChild(fragment, textNode.node);
}

function collectCodeElements(root: ParentNode): HTMLElement[] {
	return collectElements(root, "pre > code");
}

function collectMarkedCodeElements(root: ParentNode): HTMLElement[] {
	return collectElements(root, `code.${READING_CODE_THEME_CLASS}`);
}

function collectElements(root: ParentNode, selector: string): HTMLElement[] {
	const elements = Array.from(root.querySelectorAll<HTMLElement>(selector));
	if (isHTMLElement(root) && root.matches(selector)) {
		elements.unshift(root);
	}
	return elements;
}

function isHTMLElement(node: ParentNode): node is HTMLElement {
	return node.nodeType === 1 && "matches" in node;
}

function readCodeLanguage(codeElement: HTMLElement, preElement: HTMLElement): string {
	for (const className of [
		...Array.from(codeElement.classList),
		...Array.from(preElement.classList),
	]) {
		if (className.startsWith("language-")) {
			return extractCodeLanguage(className.slice("language-".length));
		}
	}
	return "text";
}

function unwrapElement(element: HTMLElement): void {
	const parent = element.parentNode;
	if (!parent) {
		return;
	}
	while (element.firstChild) {
		parent.insertBefore(element.firstChild, element);
	}
	element.remove();
}
