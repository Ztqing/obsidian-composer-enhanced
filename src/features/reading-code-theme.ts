import { MarkdownRenderChild, Plugin } from "obsidian";

import {
	classifyCodeIdentifier,
	classifyPrismTokenOverride,
	type CodeIdentifierContext,
	type CodeTokenKind,
} from "./code-token-classifier";

const TOKEN_CLASS = "composer-enhanced-code-token";
const TOKEN_ATTRIBUTE = "data-composer-enhanced-code-token";
const WRAPPED_TOKEN = "wrapped";
const CLASSIFIED_TOKEN = "classified";
const CODE_BLOCK_SELECTOR = 'pre > code[class*="language-"]';
const PLAIN_TEXT_LANGUAGES = new Set(["none", "plaintext", "text", "txt"]);
const IDENTIFIER_PATTERN = new RegExp(
	"[\\p{ID_Start}_$][\\p{ID_Continue}_$]*",
	"gu",
);

interface TextRecord {
	node: Text;
	offset: number;
}

export function registerReadingCodeTheme(plugin: Plugin): void {
	plugin.registerMarkdownPostProcessor((element, context) => {
		context.addChild(new ReadingCodeThemeRenderChild(element));
	});

	decorateReadingCodeBlocks(document, true);
}

export function cleanupReadingCodeTokens(root: ParentNode): void {
	const markedTokens = Array.from(
		root.querySelectorAll<HTMLElement>(`[${TOKEN_ATTRIBUTE}]`),
	);
	const affectedCodeBlocks = new Set<Element>();

	for (const token of markedTokens) {
		const codeBlock = token.closest("pre > code");
		if (codeBlock) {
			affectedCodeBlocks.add(codeBlock);
		}

		if (token.getAttribute(TOKEN_ATTRIBUTE) === WRAPPED_TOKEN) {
			token.replaceWith(token.ownerDocument.createTextNode(token.textContent ?? ""));
			continue;
		}

		token.removeAttribute(TOKEN_ATTRIBUTE);
		token.classList.remove(TOKEN_CLASS);
		for (const kind of getCodeTokenKinds()) {
			token.classList.remove(getTokenKindClass(kind));
		}
	}

	for (const codeBlock of affectedCodeBlocks) {
		codeBlock.normalize();
	}
}

function decorateReadingCodeBlocks(
	root: ParentNode,
	requireReadingView: boolean,
): void {
	const codeBlocks = Array.from(
		root.querySelectorAll<HTMLElement>(CODE_BLOCK_SELECTOR),
	);

	for (const codeBlock of codeBlocks) {
		if (requireReadingView && !codeBlock.closest(".markdown-reading-view")) {
			continue;
		}

		const language = getCodeLanguage(codeBlock);
		if (
			!language ||
			PLAIN_TEXT_LANGUAGES.has(language) ||
			!codeBlock.querySelector(".token")
		) {
			continue;
		}

		decorateCodeBlock(codeBlock, language);
	}
}

function decorateCodeBlock(codeBlock: HTMLElement, language: string): void {
	const source = codeBlock.textContent ?? "";
	const textRecords = collectTextRecords(codeBlock);

	normalizePrismTokens(codeBlock, source, language, textRecords);

	for (const record of textRecords) {
		if (shouldDecorateTextNode(record.node)) {
			wrapUnclassifiedIdentifiers(record, source, language);
		}
	}
}

function collectTextRecords(root: HTMLElement): TextRecord[] {
	const records: TextRecord[] = [];
	const walker = root.ownerDocument.createTreeWalker(root, 4);
	let offset = 0;
	let current = walker.nextNode();

	while (current) {
		if (current.nodeType === 3) {
			const node = current as Text;
			records.push({ node, offset });
			offset += node.data.length;
		}

		current = walker.nextNode();
	}

	return records;
}

function normalizePrismTokens(
	codeBlock: HTMLElement,
	source: string,
	language: string,
	textRecords: TextRecord[],
): void {
	const prismTokens = Array.from(
		codeBlock.querySelectorAll<HTMLElement>(
			".token.boolean, .token.keyword",
		),
	);

	for (const token of prismTokens) {
		if (token.hasAttribute(TOKEN_ATTRIBUTE)) {
			continue;
		}

		const identifier = token.textContent ?? "";
		if (!isIdentifier(identifier)) {
			continue;
		}

		const offset = getElementTextOffset(token, textRecords);
		if (offset === undefined) {
			continue;
		}

		const context = getIdentifierContext(source, offset, identifier, language);
		const kind = classifyPrismTokenOverride(
			context,
			token.classList.contains("boolean") ? "boolean" : "keyword",
		);
		if (kind) {
			markExistingToken(token, kind);
		}
	}
}

function wrapUnclassifiedIdentifiers(
	record: TextRecord,
	source: string,
	language: string,
): void {
	const matches = [...record.node.data.matchAll(IDENTIFIER_PATTERN)];
	if (matches.length === 0 || !record.node.parentNode) {
		return;
	}

	const fragment = record.node.ownerDocument.createDocumentFragment();
	let previousEnd = 0;

	for (const match of matches) {
		const identifier = match[0];
		const matchIndex = match.index;
		if (identifier === undefined || matchIndex === undefined) {
			continue;
		}

		fragment.append(record.node.data.slice(previousEnd, matchIndex));
		const start = record.offset + matchIndex;
		const kind = classifyCodeIdentifier(
			getIdentifierContext(source, start, identifier, language),
		);
		fragment.append(createTokenElement(record.node.ownerDocument, identifier, kind));
		previousEnd = matchIndex + identifier.length;
	}

	fragment.append(record.node.data.slice(previousEnd));
	record.node.parentNode.replaceChild(fragment, record.node);
}

function shouldDecorateTextNode(node: Text): boolean {
	const parent = node.parentElement;
	if (!parent || parent.closest(`[${TOKEN_ATTRIBUTE}]`)) {
		return false;
	}

	const prismToken = parent.closest<HTMLElement>(".token");
	return !prismToken || prismToken.classList.contains("interpolation");
}

function createTokenElement(
	document: Document,
	text: string,
	kind: CodeTokenKind,
): HTMLElement {
	const token = document.createElement("span");
	token.classList.add(TOKEN_CLASS, getTokenKindClass(kind));
	token.setAttribute(TOKEN_ATTRIBUTE, WRAPPED_TOKEN);
	token.textContent = text;
	return token;
}

function markExistingToken(token: HTMLElement, kind: CodeTokenKind): void {
	token.classList.add(TOKEN_CLASS, getTokenKindClass(kind));
	token.setAttribute(TOKEN_ATTRIBUTE, CLASSIFIED_TOKEN);
}

function getIdentifierContext(
	source: string,
	start: number,
	identifier: string,
	language: string,
): CodeIdentifierContext {
	return {
		identifier,
		language,
		nextCharacter: findNonWhitespaceCharacter(
			source,
			start + identifier.length,
			1,
		),
		previousCharacter: findNonWhitespaceCharacter(source, start - 1, -1),
	};
}

function findNonWhitespaceCharacter(
	source: string,
	start: number,
	direction: 1 | -1,
): string | undefined {
	for (
		let index = start;
		index >= 0 && index < source.length;
		index += direction
	) {
		const character = source[index];
		if (character && !/\s/u.test(character)) {
			return character;
		}
	}

	return undefined;
}

function getElementTextOffset(
	element: HTMLElement,
	textRecords: TextRecord[],
): number | undefined {
	return textRecords.find(({ node }) => element.contains(node))?.offset;
}

function getCodeLanguage(codeBlock: HTMLElement): string | undefined {
	const languageClass = Array.from(codeBlock.classList).find((className) =>
		className.startsWith("language-"),
	);
	return languageClass?.slice("language-".length).toLowerCase();
}

function getCodeTokenKinds(): CodeTokenKind[] {
	return ["function", "keyword", "property", "type", "value", "variable"];
}

function getTokenKindClass(kind: CodeTokenKind): string {
	return `${TOKEN_CLASS}-${kind}`;
}

function isIdentifier(value: string): boolean {
	const matches = value.match(IDENTIFIER_PATTERN);
	return matches?.length === 1 && matches[0] === value;
}

class ReadingCodeThemeRenderChild extends MarkdownRenderChild {
	private observer?: MutationObserver;

	onload(): void {
		decorateReadingCodeBlocks(this.containerEl, false);

		const view = this.containerEl.ownerDocument.defaultView;
		const MutationObserverConstructor = view?.MutationObserver;
		if (!MutationObserverConstructor) {
			return;
		}

		this.observer = new MutationObserverConstructor(() => {
			decorateReadingCodeBlocks(this.containerEl, false);
		});
		this.observer.observe(this.containerEl, {
			childList: true,
			subtree: true,
		});
	}

	onunload(): void {
		this.observer?.disconnect();
		this.observer = undefined;
		cleanupReadingCodeTokens(this.containerEl);
	}
}
