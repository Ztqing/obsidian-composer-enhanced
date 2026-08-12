import { Plugin } from "obsidian";

import {
	cleanupBlockImageLayout,
	registerBlockImageLayout,
} from "./features/block-image-layout";
import {
	cleanupReadingCodeTokens,
	registerReadingCodeTheme,
} from "./features/reading-code-theme";
import { disableThemeScope, enableThemeScope } from "./theme-scope";

export default class ComposerEnhancedPlugin extends Plugin {
	onload(): void {
		enableThemeScope(document.body);
		registerBlockImageLayout(this);
		registerReadingCodeTheme(this);
		// Style Settings documents this event for rescanning plugin CSS metadata.
		this.app.workspace.trigger("parse-style-settings");
	}

	onunload(): void {
		cleanupBlockImageLayout(document);
		cleanupReadingCodeTokens(document);
		disableThemeScope(document.body);
	}
}
