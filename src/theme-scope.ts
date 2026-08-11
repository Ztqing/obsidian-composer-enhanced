export const COMPOSER_ENHANCED_CLASS = "composer-enhanced";

interface ClassListTarget {
	classList: {
		add(...tokens: string[]): void;
		remove(...tokens: string[]): void;
	};
}

export function enableThemeScope(target: ClassListTarget): void {
	target.classList.add(COMPOSER_ENHANCED_CLASS);
}

export function disableThemeScope(target: ClassListTarget): void {
	target.classList.remove(COMPOSER_ENHANCED_CLASS);
}
