export const CODE_THEME_FONT_STYLE_ITALIC = 1;
export const CODE_THEME_FONT_STYLE_BOLD = 2;
export const CODE_THEME_FONT_STYLE_UNDERLINE = 4;
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

export interface CodeThemeTokenizer {
	isPassthroughLanguage(language: string): boolean;
	tokenize(code: string, language: string): CodeThemeTokenLines | null;
}

export function normalizeCodeThemeColor(color: string | undefined): string | undefined {
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

/**
 * Serialize a Shiki token as a CodeSuite-style inline CodeMirror mark.
 * Shiki colors are trusted only after strict hexadecimal validation so a
 * malformed grammar token cannot inject arbitrary CSS declarations.
 */
export function codeThemeTokenStyle(token: CodeThemeToken): string | undefined {
	const declarations: string[] = [];
	const color = normalizeCodeThemeColor(token.color);
	const fontStyle = normalizeCodeThemeFontStyle(token.fontStyle);

	if (color) {
		declarations.push(`color: ${color} !important`);
	}
	if (fontStyle && (fontStyle & CODE_THEME_FONT_STYLE_ITALIC) !== 0) {
		declarations.push("font-style: italic");
	}
	if (fontStyle && (fontStyle & CODE_THEME_FONT_STYLE_BOLD) !== 0) {
		declarations.push("font-weight: bold");
	}
	if (fontStyle && (fontStyle & CODE_THEME_FONT_STYLE_UNDERLINE) !== 0) {
		declarations.push("text-decoration: underline");
	}

	return declarations.length > 0 ? declarations.join("; ") : undefined;
}
