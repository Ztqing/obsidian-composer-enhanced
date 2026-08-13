import {
	collectAffectedImageLayoutBlocks,
	mutationAffectsBlockImageLayout,
	type ImageLayoutMode,
} from "./block-image-layout-state";

export interface ImageLayoutObserverOptions {
	cleanup(root: ParentNode): void;
	mode: ImageLayoutMode;
	refreshBlock(block: HTMLElement): void;
	refreshRoot(): void;
	root: HTMLElement;
}

export class ImageLayoutObserver {
	private animationFrame?: number;
	private fullRefreshPending = false;
	private readonly observer?: MutationObserver;
	private readonly pendingBlocks = new Set<HTMLElement>();

	constructor(private readonly options: ImageLayoutObserverOptions) {
		options.refreshRoot();

		const MutationObserverConstructor =
			options.root.ownerDocument.defaultView?.MutationObserver;
		if (!MutationObserverConstructor) {
			return;
		}

		this.observer = new MutationObserverConstructor((mutations) => {
			for (const mutation of mutations) {
				for (const removedNode of Array.from(mutation.removedNodes)) {
					if (removedNode.nodeType === 1) {
						options.cleanup(removedNode as HTMLElement);
					}
				}

				if (this.isRootClassMutation(mutation)) {
					this.fullRefreshPending = true;
					this.pendingBlocks.clear();
					continue;
				}
				if (!mutationAffectsBlockImageLayout(mutation)) {
					continue;
				}

				for (const block of collectAffectedImageLayoutBlocks(
					mutation,
					options.mode,
				)) {
					if (options.root.contains(block)) {
						this.pendingBlocks.add(block);
					} else {
						options.cleanup(block);
					}
				}
			}

			if (this.fullRefreshPending || this.pendingBlocks.size > 0) {
				this.scheduleRefresh();
			}
		});
		this.observer.observe(options.root, {
			attributes: true,
			attributeFilter: ["class", "style", "width", "height"],
			attributeOldValue: true,
			characterData: true,
			childList: true,
			subtree: true,
		});
	}

	destroy(): void {
		this.observer?.disconnect();
		this.pendingBlocks.clear();
		this.fullRefreshPending = false;

		const ownerWindow = this.options.root.ownerDocument.defaultView;
		if (this.animationFrame !== undefined && ownerWindow?.cancelAnimationFrame) {
			ownerWindow.cancelAnimationFrame(this.animationFrame);
		}
		this.animationFrame = undefined;
		this.options.cleanup(this.options.root);
	}

	private isRootClassMutation(mutation: MutationRecord): boolean {
		return (
			this.options.mode === "live-preview" &&
			mutation.type === "attributes" &&
			mutation.target === this.options.root &&
			mutation.attributeName === "class"
		);
	}

	private scheduleRefresh(): void {
		if (this.animationFrame !== undefined) {
			return;
		}

		const ownerWindow = this.options.root.ownerDocument.defaultView;
		if (!ownerWindow?.requestAnimationFrame) {
			this.flush();
			return;
		}

		this.animationFrame = ownerWindow.requestAnimationFrame(() => {
			this.animationFrame = undefined;
			this.flush();
		});
	}

	private flush(): void {
		if (this.fullRefreshPending) {
			this.fullRefreshPending = false;
			this.pendingBlocks.clear();
			this.options.refreshRoot();
			return;
		}

		const blocks = [...this.pendingBlocks];
		this.pendingBlocks.clear();
		for (const block of blocks) {
			if (this.options.root.contains(block)) {
				this.options.refreshBlock(block);
			}
		}
	}
}
