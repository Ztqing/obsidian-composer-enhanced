import { MarkdownRenderChild, Plugin } from "obsidian";

import {
	cleanupBlockImageLayout,
	mutationAffectsBlockImageLayout,
	refreshBlockImageLayout,
	refreshLivePreviewBlockImageLayout,
	refreshReadingBlockImageLayout,
} from "./block-image-layout-state";

export {
	AUTOMATIC_BLOCK_IMAGE_CLASS,
	BLOCK_IMAGE_CARRIER_CLASS,
	BLOCK_IMAGE_CLASS,
	cleanupBlockImageLayout,
	refreshBlockImageLayout,
	refreshLivePreviewBlockImageLayout,
	refreshReadingBlockImageLayout,
} from "./block-image-layout-state";

const MARKDOWN_VIEW_SELECTOR = ".markdown-source-view.mod-cm6";

export function registerBlockImageLayout(plugin: Plugin): void {
	plugin.registerMarkdownPostProcessor((element, context) => {
		context.addChild(new BlockImageLayoutRenderChild(element));
	});

	refreshBlockImageLayout(document);

	const manager = new BlockImageLayoutManager(plugin.app.workspace.containerEl);
	manager.start();
	plugin.register(() => manager.destroy());
}

class BlockImageLayoutManager {
	private animationFrame?: number;
	private readonly observers = new Map<HTMLElement, MutationObserver>();
	private readonly pendingViews = new Set<HTMLElement>();
	private viewSyncPending = false;
	private workspaceObserver?: MutationObserver;

	constructor(private readonly workspace: HTMLElement) {}

	start(): void {
		this.syncViews();

		const view = this.workspace.ownerDocument.defaultView;
		const MutationObserverConstructor = view?.MutationObserver;
		if (!MutationObserverConstructor) {
			return;
		}

		this.workspaceObserver = new MutationObserverConstructor((mutations) => {
			if (mutations.some(containsMarkdownViewChange)) {
				this.scheduleSync();
			}
		});
		this.workspaceObserver.observe(this.workspace, {
			childList: true,
			subtree: true,
		});
	}

	destroy(): void {
		this.workspaceObserver?.disconnect();
		this.workspaceObserver = undefined;

		for (const [view, observer] of this.observers) {
			observer.disconnect();
			cleanupBlockImageLayout(view);
		}
		this.observers.clear();
		this.pendingViews.clear();
		this.viewSyncPending = false;

		const ownerWindow = this.workspace.ownerDocument.defaultView;
		if (this.animationFrame !== undefined && ownerWindow) {
			ownerWindow.cancelAnimationFrame(this.animationFrame);
		}
		this.animationFrame = undefined;
	}

	private scheduleSync(): void {
		this.viewSyncPending = true;
		this.scheduleFrame();
	}

	private scheduleViewRefresh(view: HTMLElement): void {
		this.pendingViews.add(view);
		this.scheduleFrame();
	}

	private scheduleFrame(): void {
		if (this.animationFrame !== undefined) {
			return;
		}

		const ownerWindow = this.workspace.ownerDocument.defaultView;
		if (!ownerWindow) {
			this.flush();
			return;
		}

		this.animationFrame = ownerWindow.requestAnimationFrame(() => {
			this.animationFrame = undefined;
			this.flush();
		});
	}

	private flush(): void {
		if (this.viewSyncPending) {
			this.viewSyncPending = false;
			this.pendingViews.clear();
			this.syncViews();
			return;
		}

		const views = Array.from(this.pendingViews);
		this.pendingViews.clear();
		for (const view of views) {
			if (this.observers.has(view)) {
				this.refreshView(view);
			}
		}
	}

	private syncViews(): void {
		const views = new Set<HTMLElement>(
			Array.from(
				this.workspace.querySelectorAll<HTMLElement>(MARKDOWN_VIEW_SELECTOR),
			),
		);

		for (const [view, observer] of this.observers) {
			if (!views.has(view)) {
				observer.disconnect();
				cleanupBlockImageLayout(view);
				this.observers.delete(view);
			}
		}

		for (const view of views) {
			this.refreshView(view);
			if (!this.observers.has(view)) {
				this.observeView(view);
			}
		}
	}

	private observeView(view: HTMLElement): void {
		const ownerWindow = view.ownerDocument.defaultView;
		const MutationObserverConstructor = ownerWindow?.MutationObserver;
		if (!MutationObserverConstructor) {
			return;
		}

		const observer = new MutationObserverConstructor((mutations) => {
			if (mutations.some(mutationAffectsBlockImageLayout)) {
				this.scheduleViewRefresh(view);
			}
		});
		observer.observe(view, {
			attributes: true,
			attributeFilter: ["class", "style", "width", "height"],
			characterData: true,
			childList: true,
			subtree: true,
		});
		this.observers.set(view, observer);
	}

	private refreshView(view: HTMLElement): void {
		if (view.classList.contains("is-live-preview")) {
			refreshLivePreviewBlockImageLayout(view);
			return;
		}

		cleanupBlockImageLayout(view);
	}
}

function containsMarkdownViewChange(mutation: MutationRecord): boolean {
	return [...Array.from(mutation.addedNodes), ...Array.from(mutation.removedNodes)].some(
		(node): boolean => {
			if (node.nodeType !== 1) {
				return false;
			}
			const element = node as HTMLElement;
			return (
				element.matches(MARKDOWN_VIEW_SELECTOR) ||
				Boolean(element.querySelector(MARKDOWN_VIEW_SELECTOR))
			);
		},
	);
}

class BlockImageLayoutRenderChild extends MarkdownRenderChild {
	private animationFrame?: number;
	private observer?: MutationObserver;

	onload(): void {
		refreshReadingBlockImageLayout(this.containerEl);

		const view = this.containerEl.ownerDocument.defaultView;
		const MutationObserverConstructor = view?.MutationObserver;
		if (!MutationObserverConstructor) {
			return;
		}

		this.observer = new MutationObserverConstructor((mutations) => {
			if (mutations.some(mutationAffectsBlockImageLayout)) {
				this.scheduleRefresh();
			}
		});
		this.observer.observe(this.containerEl, {
			attributes: true,
			attributeFilter: ["class", "style", "width", "height"],
			characterData: true,
			childList: true,
			subtree: true,
		});
	}

	onunload(): void {
		this.observer?.disconnect();
		this.observer = undefined;

		const ownerWindow = this.containerEl.ownerDocument.defaultView;
		if (this.animationFrame !== undefined && ownerWindow) {
			ownerWindow.cancelAnimationFrame(this.animationFrame);
		}
		this.animationFrame = undefined;
		cleanupBlockImageLayout(this.containerEl);
	}

	private scheduleRefresh(): void {
		if (this.animationFrame !== undefined) {
			return;
		}

		const ownerWindow = this.containerEl.ownerDocument.defaultView;
		if (!ownerWindow) {
			refreshReadingBlockImageLayout(this.containerEl);
			return;
		}

		this.animationFrame = ownerWindow.requestAnimationFrame(() => {
			this.animationFrame = undefined;
			refreshReadingBlockImageLayout(this.containerEl);
		});
	}
}
