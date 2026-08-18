export const ONE_DARK_PRO_CODE_THEME_CLASS =
	"composer-enhanced-code-theme-one-dark-pro";

export function isCodeThemeActive(ownerDocument: Document): boolean {
	return ownerDocument.body.classList.contains(ONE_DARK_PRO_CODE_THEME_CLASS);
}
