import { Plugin } from "obsidian";

import {
	cleanupBlockImageLayout,
	registerBlockImageLayout,
} from "./features/block-image-layout";
import { disableThemeScope, enableThemeScope } from "./theme-scope";

export default class ComposerEnhancedPlugin extends Plugin {
	onload(): void {
		enableThemeScope(document.body);
		registerBlockImageLayout(this);
		// Style Settings documents this event for rescanning plugin CSS metadata.
		this.app.workspace.trigger("parse-style-settings");
	}

	onunload(): void {
		cleanupBlockImageLayout(document);
		disableThemeScope(document.body);
	}
}
