import type { Text } from "@codemirror/state";

import { extractCodeLanguage } from "./code-language";

export interface FencedCodeLine {
	from: number;
	to: number;
	text: string;
}

export interface FencedCodeBlock {
	from: number;
	to: number;
	info: string;
	language: string;
	lines: FencedCodeLine[];
	code: string;
}

interface OpenFence {
	character: "`" | "~";
	length: number;
	from: number;
	info: string;
	language: string;
	lines: FencedCodeLine[];
}

export function scanFencedCodeBlocks(document: Text): FencedCodeBlock[] {
	const blocks: FencedCodeBlock[] = [];
	let openFence: OpenFence | undefined;

	for (let lineNumber = 1; lineNumber <= document.lines; lineNumber += 1) {
		const line = document.line(lineNumber);

		if (!openFence) {
			const opening = parseOpeningFence(line.text);
			if (opening) {
				openFence = {
					...opening,
					from: line.from,
					lines: [],
				};
			}
			continue;
		}

		if (isClosingFence(line.text, openFence)) {
			blocks.push({
				from: openFence.from,
				to: line.to,
				info: openFence.info,
				language: openFence.language,
				lines: openFence.lines,
				code: openFence.lines.map((innerLine) => innerLine.text).join("\n"),
			});
			openFence = undefined;
			continue;
		}

		openFence.lines.push({
			from: line.from,
			to: line.to,
			text: line.text,
		});
	}

	return blocks;
}

export const extractFenceLanguage = extractCodeLanguage;

function parseOpeningFence(text: string):
	| Pick<OpenFence, "character" | "length" | "info" | "language">
	| undefined {
	const match = text.match(/^[ \t]*(`{3,}|~{3,})(.*)$/u);
	const fence = match?.[1];
	if (!fence) {
		return undefined;
	}

	const info = (match[2] ?? "").trim();
	if (fence[0] === "`" && info.includes("`")) {
		return undefined;
	}

	return {
		character: fence[0] as "`" | "~",
		length: fence.length,
		info,
		language: extractFenceLanguage(info),
	};
}

function isClosingFence(text: string, opening: OpenFence): boolean {
	const trimmed = text.trimStart();
	let length = 0;
	while (trimmed[length] === opening.character) {
		length += 1;
	}

	return length >= opening.length && trimmed.slice(length).trim().length === 0;
}
