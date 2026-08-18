import { type Extension, type Range, type Text } from "@codemirror/state";
import {
	Decoration,
	EditorView,
	type DecorationSet,
	type ViewUpdate,
	ViewPlugin,
} from "@codemirror/view";

import type { CodeThemeHighlighter } from "./code-theme-highlighter";
import {
	codeThemeTokenStyle,
	type CodeThemeTokenizer,
} from "./code-theme-tokens";
import { scanFencedCodeBlocks } from "./fenced-code-blocks";

export interface EditorCodeThemeRange {
	from: number;
	to: number;
	style?: string;
}

export interface EditorCodeThemeLineRange {
	from: number;
	to: number;
}

export interface EditorCodeThemeDecorations {
	lines: EditorCodeThemeLineRange[];
	tokens: EditorCodeThemeRange[];
}

interface VisibleRange {
	from: number;
	to: number;
}

export const EDITOR_CODE_BLOCK_THEME_CLASS =
	"composer-enhanced-code-block-line-themed";

export function collectEditorCodeThemeRanges(
	document: Text,
	visibleRanges: readonly VisibleRange[],
	tokenizer: CodeThemeTokenizer,
): EditorCodeThemeRange[] {
	return collectEditorCodeThemeDecorations(
		document,
		visibleRanges,
		tokenizer,
	).tokens;
}

export function collectEditorCodeThemeDecorations(
	document: Text,
	visibleRanges: readonly VisibleRange[],
	tokenizer: CodeThemeTokenizer,
): EditorCodeThemeDecorations {
	const lines: EditorCodeThemeLineRange[] = [];
	const tokens: EditorCodeThemeRange[] = [];

	for (const block of scanFencedCodeBlocks(document)) {
		if (
			tokenizer.isPassthroughLanguage(block.language) ||
			!intersectsVisibleRange(block.from, block.to, visibleRanges)
		) {
			continue;
		}

		const tokenLines = tokenizer.tokenize(block.code, block.language);
		if (!tokenLines) {
			continue;
		}

		for (const line of collectBlockLines(document, block.from, block.to, block.lines)) {
			if (intersectsVisibleRange(line.from, line.to, visibleRanges)) {
				lines.push(line);
			}
		}

		for (let lineIndex = 0; lineIndex < block.lines.length; lineIndex += 1) {
			const codeLine = block.lines[lineIndex];
			if (!codeLine || !intersectsVisibleRange(codeLine.from, codeLine.to, visibleRanges)) {
				continue;
			}

			let offset = codeLine.from;
			for (const token of tokenLines[lineIndex] ?? []) {
				const from = offset;
				const to = Math.min(codeLine.to, from + token.content.length);
				offset = from + token.content.length;
				const style = codeThemeTokenStyle(token);

				if (from < to && style) {
					tokens.push({ from, to, style });
				}
			}
		}
	}

	return { lines, tokens };
}

export function createEditorCodeThemeExtension(
	highlighter: CodeThemeHighlighter,
	isThemeActive: (document: Document) => boolean,
	getThemeRevision: () => number,
): Extension {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;
			private active: boolean;
			private revision: number;

			constructor(view: EditorView) {
				this.active = isThemeActive(view.dom.ownerDocument);
				this.revision = getThemeRevision();
				this.decorations = this.buildDecorations(view);
			}

			update(update: ViewUpdate): void {
				const active = isThemeActive(update.view.dom.ownerDocument);
				const revision = getThemeRevision();
				if (
					update.docChanged ||
					update.viewportChanged ||
					active !== this.active ||
					revision !== this.revision
				) {
					this.active = active;
					this.revision = revision;
					this.decorations = this.buildDecorations(update.view);
				}
			}

			private buildDecorations(view: EditorView): DecorationSet {
				if (!this.active || !highlighter.isReady()) {
					return Decoration.none;
				}

				const decorations = collectEditorCodeThemeDecorations(
					view.state.doc,
					view.visibleRanges,
					highlighter,
				);
				const ranges: Range<Decoration>[] = [];
				for (const line of decorations.lines) {
					ranges.push(
						Decoration.line({
							attributes: { class: EDITOR_CODE_BLOCK_THEME_CLASS },
						}).range(line.from),
					);
				}
				for (const range of decorations.tokens) {
					ranges.push(
						Decoration.mark({
							attributes: range.style ? { style: range.style } : undefined,
						}).range(range.from, range.to),
					);
				}
				return Decoration.set(ranges, true);
			}
		},
		{ decorations: (value) => value.decorations },
	);
}

function collectBlockLines(
	document: Text,
	from: number,
	to: number,
	innerLines: readonly EditorCodeThemeLineRange[],
): EditorCodeThemeLineRange[] {
	const openingLine = document.lineAt(from);
	const closingLine = document.lineAt(to);
	const lines: EditorCodeThemeLineRange[] = [
		{ from: openingLine.from, to: openingLine.to },
		...innerLines.map((line) => ({ from: line.from, to: line.to })),
	];
	if (closingLine.from !== openingLine.from) {
		lines.push({ from: closingLine.from, to: closingLine.to });
	}
	return lines;
}

function intersectsVisibleRange(
	from: number,
	to: number,
	visibleRanges: readonly VisibleRange[],
): boolean {
	return visibleRanges.some((visible) => visible.from <= to && visible.to >= from);
}
