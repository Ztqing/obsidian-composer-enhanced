import { extractCodeLanguage } from "./code-language";

export const READING_CODE_THEME_CLASS = "composer-enhanced-code-themed";
export const READING_CODE_BLOCK_THEME_CLASS =
	"composer-enhanced-code-block-themed";

const READING_CODE_THEME_ATTRIBUTE = "data-composer-enhanced-code-theme";

export interface ReadingCodeThemeRenderer {
	isPassthroughLanguage(language: string): boolean;
	highlight(code: string, language: string): string | null;
}

interface ReadingCodeReplacement {
	preElement: HTMLElement;
	originalChildren: Node[];
	originalPreStyle: string | null;
	originalCodeStyle: string | null;
}

/**
 * Keep original Prism nodes detached while Shiki owns the rendered children.
 * This preserves third-party spans and event handlers for exact cleanup.
 */
const replacements = new WeakMap<HTMLElement, ReadingCodeReplacement>();

export function applyReadingCodeTheme(
	root: ParentNode,
	renderer: ReadingCodeThemeRenderer,
): number {
	let themedBlocks = 0;
	for (const codeElement of collectCodeElements(root)) {
		restoreReadingCodeElement(codeElement);

		const preElement = codeElement.parentElement;
		if (!preElement || preElement.tagName.toLowerCase() !== "pre") {
			continue;
		}
		if (isFrontmatterCodeBlock(preElement)) {
			continue;
		}

		const language = readCodeLanguage(codeElement, preElement);
		if (renderer.isPassthroughLanguage(language)) {
			continue;
		}

		const html = renderer.highlight(codeElement.textContent ?? "", language);
		const generatedCode = extractGeneratedCode(codeElement.ownerDocument, html);
		if (!generatedCode) {
			continue;
		}

		const generatedPre = generatedCode.parentElement;
		const originalChildren = Array.from(codeElement.childNodes);
		const originalPreStyle = preElement.getAttribute("style");
		const originalCodeStyle = codeElement.getAttribute("style");

		while (codeElement.firstChild) {
			codeElement.firstChild.remove();
		}
		while (generatedCode.firstChild) {
			codeElement.appendChild(generatedCode.firstChild);
		}

		if (generatedPre) {
			const generatedStyle = generatedPre.getAttribute("style");
			if (generatedStyle !== null) {
				preElement.setAttribute("style", generatedStyle);
			}
		}
		codeElement.classList.add(READING_CODE_THEME_CLASS);
		codeElement.setAttribute(READING_CODE_THEME_ATTRIBUTE, "1");
		preElement.classList.add(READING_CODE_BLOCK_THEME_CLASS);
		replacements.set(codeElement, {
			preElement,
			originalChildren,
			originalPreStyle,
			originalCodeStyle,
		});
		themedBlocks += 1;
	}

	return themedBlocks;
}

export function cleanupReadingCodeTheme(root: ParentNode): void {
	for (const codeElement of collectMarkedCodeElements(root)) {
		restoreReadingCodeElement(codeElement);
	}
	for (const preElement of collectElements(
		root,
		`pre.${READING_CODE_BLOCK_THEME_CLASS}`,
	)) {
		preElement.classList.remove(READING_CODE_BLOCK_THEME_CLASS);
	}
}

function restoreReadingCodeElement(codeElement: HTMLElement): void {
	const replacement = replacements.get(codeElement);
	if (!replacement) {
		codeElement.classList.remove(READING_CODE_THEME_CLASS);
		codeElement.removeAttribute(READING_CODE_THEME_ATTRIBUTE);
		return;
	}

	while (codeElement.firstChild) {
		codeElement.firstChild.remove();
	}
	for (const child of replacement.originalChildren) {
		codeElement.appendChild(child);
	}
	restoreAttribute(codeElement, "style", replacement.originalCodeStyle);
	restoreAttribute(replacement.preElement, "style", replacement.originalPreStyle);
	codeElement.classList.remove(READING_CODE_THEME_CLASS);
	codeElement.removeAttribute(READING_CODE_THEME_ATTRIBUTE);
	replacement.preElement.classList.remove(READING_CODE_BLOCK_THEME_CLASS);
	replacements.delete(codeElement);
}

function extractGeneratedCode(
	document: Document,
	html: string | null,
): HTMLElement | null {
	if (!html) {
		return null;
	}

	const Parser = document.defaultView?.DOMParser ?? globalThis.DOMParser;
	if (!Parser) {
		return null;
	}
	const parsed = new Parser().parseFromString(html, "text/html");
	return parsed.querySelector<HTMLElement>("pre > code");
}

function restoreAttribute(
	element: HTMLElement,
	attribute: string,
	value: string | null,
): void {
	if (value === null) {
		element.removeAttribute(attribute);
	} else {
		element.setAttribute(attribute, value);
	}
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

/** Obsidian renders the note's YAML frontmatter as a code-like subtree. */
function isFrontmatterCodeBlock(preElement: HTMLElement): boolean {
	return preElement.closest(
		".frontmatter, [data-type='frontmatter'], [data-role='frontmatter']",
	) !== null;
}
