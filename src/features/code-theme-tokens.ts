export const CODE_THEME_FONT_STYLE_ITALIC = 1;
export const CODE_THEME_FONT_STYLE_BOLD = 2;
export const CODE_THEME_FONT_STYLE_UNDERLINE = 4;
export const CODE_THEME_DEFAULT_FOREGROUND = "#abb2bf";
const CODE_THEME_FONT_STYLE_MASK =
	CODE_THEME_FONT_STYLE_ITALIC |
	CODE_THEME_FONT_STYLE_BOLD |
	CODE_THEME_FONT_STYLE_UNDERLINE;

export interface CodeThemeToken {
	content: string;
	color?: string;
	fontStyle?: number;
}

export type CodeThemeTokenLines = readonly (readonly CodeThemeToken[])[];

export interface CodeThemeTokenRange {
	from: number;
	to: number;
	color?: string;
	fontStyle?: number;
}

export interface CodeThemeTokenizer {
	isPassthroughLanguage(language: string): boolean;
	tokenize(code: string, language: string): CodeThemeTokenLines | null;
}

export function flattenCodeThemeTokens(
	source: string,
	lines: CodeThemeTokenLines,
): CodeThemeTokenRange[] {
	const ranges: CodeThemeTokenRange[] = [];
	let offset = 0;

	for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
		for (const token of lines[lineIndex] ?? []) {
			const from = offset;
			const to = Math.min(source.length, from + token.content.length);
			offset = from + token.content.length;
			const color = normalizeCodeThemeColor(token.color);
			const fontStyle = normalizeCodeThemeFontStyle(token.fontStyle);

			if (from < to && (color || fontStyle)) {
				ranges.push({
					from,
					to,
					color,
					fontStyle,
				});
			}
		}

		if (lineIndex < lines.length - 1) {
			if (source.slice(offset, offset + 2) === "\r\n") {
				offset += 2;
			} else if (source[offset] === "\n" || source[offset] === "\r") {
				offset += 1;
			}
		}
	}

	return ranges;
}

export function normalizeCodeThemeColor(color: string | undefined): string | undefined {
	if (color === undefined) {
		return CODE_THEME_DEFAULT_FOREGROUND;
	}
	if (!color || !/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/iu.test(color)) {
		return undefined;
	}
	return color;
}

export function normalizeCodeThemeFontStyle(fontStyle: number | undefined): number | undefined {
	if (!hasCodeThemeFontStyle(fontStyle)) {
		return undefined;
	}
	const normalized = fontStyle & CODE_THEME_FONT_STYLE_MASK;
	return normalized > 0 ? normalized : undefined;
}

function hasCodeThemeFontStyle(fontStyle: number | undefined): fontStyle is number {
	return typeof fontStyle === "number" && fontStyle > 0;
}
