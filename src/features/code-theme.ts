import { MarkdownRenderChild, MarkdownView, Plugin } from "obsidian";

import { CodeThemeHighlighter } from "./code-theme-highlighter";
import { createEditorCodeThemeExtension } from "./editor-code-theme";
import {
	applyReadingCodeTheme,
	cleanupReadingCodeTheme,
} from "./reading-code-theme";

export const ONE_DARK_PRO_THEME_CLASS =
	"composer-enhanced-code-theme-one-dark-pro";

export function registerCodeTheme(plugin: Plugin): void {
	const controller = new CodeThemeController(plugin);
	plugin.registerMarkdownPostProcessor((element, context) => {
		context.addChild(new ReadingCodeThemeRenderChild(element, controller));
	});
	plugin.registerEditorExtension(
		createEditorCodeThemeExtension(
			controller.highlighter,
			(document) => controller.isThemeActive(document),
			() => controller.themeRevision,
		),
	);
	plugin.registerEvent(
		plugin.app.workspace.on("css-change", () => controller.scheduleRefresh(true)),
	);
	plugin.register(() => controller.destroy());
	controller.start();
}

class ReadingCodeThemeRenderChild extends MarkdownRenderChild {
	constructor(
		containerElement: HTMLElement,
		private readonly controller: CodeThemeController,
	) {
		super(containerElement);
	}

	onload(): void {
		void this.controller.refreshReadingRoot(this.containerEl);
	}

	onunload(): void {
		cleanupReadingCodeTheme(this.containerEl);
	}
}

class CodeThemeController {
	readonly highlighter = new CodeThemeHighlighter();
	themeRevision = 0;

	private active = false;
	private animationFrame?: number;
	private destroyed = false;
	private forceRefresh = false;
	private observer?: MutationObserver;

	constructor(private readonly plugin: Plugin) {}

	start(): void {
		this.active = this.isThemeActive(document);
		const MutationObserverConstructor = document.defaultView?.MutationObserver;
		if (MutationObserverConstructor) {
			this.observer = new MutationObserverConstructor(() => {
				this.scheduleRefresh(false);
			});
			this.observer.observe(document.body, {
				attributes: true,
				attributeFilter: ["class"],
			});
		}
		this.scheduleRefresh(true);
	}

	isThemeActive(ownerDocument: Document): boolean {
		return ownerDocument.body.classList.contains(ONE_DARK_PRO_THEME_CLASS);
	}

	scheduleRefresh(force: boolean): void {
		if (this.destroyed) {
			return;
		}
		this.forceRefresh ||= force;
		if (this.animationFrame !== undefined) {
			return;
		}

		const ownerWindow = document.defaultView;
		if (!ownerWindow?.requestAnimationFrame) {
			this.flushRefresh();
			return;
		}
		this.animationFrame = ownerWindow.requestAnimationFrame(() => {
			this.animationFrame = undefined;
			this.flushRefresh();
		});
	}

	async refreshReadingRoot(root: HTMLElement): Promise<void> {
		if (!this.isThemeActive(root.ownerDocument)) {
			cleanupReadingCodeTheme(root);
			return;
		}

		const revision = this.themeRevision;
		const ready = await this.highlighter.initialize();
		if (
			!ready ||
			this.destroyed ||
			!this.isThemeActive(root.ownerDocument) ||
			revision !== this.themeRevision
		) {
			return;
		}
		applyReadingCodeTheme(root, this.highlighter);
	}

	destroy(): void {
		if (this.destroyed) {
			return;
		}
		this.destroyed = true;
		this.themeRevision += 1;
		this.observer?.disconnect();
		this.observer = undefined;

		const ownerWindow = document.defaultView;
		if (this.animationFrame !== undefined && ownerWindow?.cancelAnimationFrame) {
			ownerWindow.cancelAnimationFrame(this.animationFrame);
		}
		this.animationFrame = undefined;
		this.cleanupOpenReadingViews();
		this.highlighter.dispose();
	}

	private flushRefresh(): void {
		const force = this.forceRefresh;
		this.forceRefresh = false;
		const nextActive = this.isThemeActive(document);
		if (!force && nextActive === this.active) {
			return;
		}

		this.active = nextActive;
		this.themeRevision += 1;
		const revision = this.themeRevision;
		if (!nextActive) {
			this.cleanupOpenReadingViews();
			this.plugin.app.workspace.updateOptions();
			return;
		}
		void this.activate(revision);
	}

	private async activate(revision: number): Promise<void> {
		const ready = await this.highlighter.initialize();
		if (
			!ready ||
			this.destroyed ||
			revision !== this.themeRevision ||
			!this.active
		) {
			return;
		}

		this.refreshOpenReadingViews();
		this.plugin.app.workspace.updateOptions();
	}

	private refreshOpenReadingViews(): void {
		this.plugin.app.workspace.iterateAllLeaves((leaf) => {
			const view = leaf.view;
			if (view instanceof MarkdownView && view.getMode() === "preview") {
				applyReadingCodeTheme(view.contentEl, this.highlighter);
			}
		});
	}

	private cleanupOpenReadingViews(): void {
		this.plugin.app.workspace.iterateAllLeaves((leaf) => {
			if (leaf.view instanceof MarkdownView) {
				cleanupReadingCodeTheme(leaf.view.contentEl);
			}
		});
		cleanupReadingCodeTheme(document);
	}
}
