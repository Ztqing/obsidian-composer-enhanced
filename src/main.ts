import { Plugin } from "obsidian";

import {
	cleanupReadingCodeTokens,
	registerReadingCodeTheme,
} from "./features/reading-code-theme";
import { disableThemeScope, enableThemeScope } from "./theme-scope";

export default class ComposerEnhancedPlugin extends Plugin {
	onload(): void {
		enableThemeScope(document.body);
		registerReadingCodeTheme(this);
		// Style Settings documents this event for rescanning plugin CSS metadata.
		this.app.workspace.trigger("parse-style-settings");
	}

	onunload(): void {
		cleanupReadingCodeTokens(document);
		disableThemeScope(document.body);
	}
}
