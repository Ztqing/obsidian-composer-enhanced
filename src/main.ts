import { Plugin } from "obsidian";

import { registerBlockImageLayout } from "./features/block-image-layout";
import { registerCodeTheme } from "./features/code-theme";
import { disableThemeScope, enableThemeScope } from "./theme-scope";

export default class ComposerEnhancedPlugin extends Plugin {
	onload(): void {
		enableThemeScope(document.body);
		registerCodeTheme(this);
		registerBlockImageLayout(this);
		// Style Settings documents this event for rescanning plugin CSS metadata.
		this.app.workspace.trigger("parse-style-settings");
	}

	onunload(): void {
		disableThemeScope(document.body);
	}
}
