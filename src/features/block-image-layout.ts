import { ViewPlugin, type EditorView } from "@codemirror/view";
import { MarkdownRenderChild, Plugin } from "obsidian";

import { ImageLayoutObserver } from "./block-image-layout-observer";
import {
	cleanupBlockImageLayout,
	refreshBlockImageLayout,
	refreshLivePreviewBlockImageLayout,
	refreshLivePreviewImageLayoutBlock,
	refreshReadingBlockImageLayout,
	refreshReadingImageLayoutBlock,
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

export function registerBlockImageLayout(plugin: Plugin): void {
	plugin.registerMarkdownPostProcessor((element, context) => {
		context.addChild(new BlockImageLayoutRenderChild(element));
	});
	plugin.registerEditorExtension(LivePreviewImageLayoutExtension);
	refreshBlockImageLayout(document);
	plugin.register(() => cleanupBlockImageLayout(document));
}

class BlockImageLayoutRenderChild extends MarkdownRenderChild {
	private observer?: ImageLayoutObserver;

	onload(): void {
		this.observer = new ImageLayoutObserver({
			cleanup: cleanupBlockImageLayout,
			mode: "reading",
			refreshBlock: refreshReadingImageLayoutBlock,
			refreshRoot: () => refreshReadingBlockImageLayout(this.containerEl),
			root: this.containerEl,
		});
	}

	onunload(): void {
		this.observer?.destroy();
		this.observer = undefined;
	}
}

class LivePreviewImageLayoutController extends ImageLayoutObserver {
	constructor(editorRoot: HTMLElement) {
		const viewRoot =
			editorRoot.closest<HTMLElement>(".markdown-source-view.mod-cm6") ??
			editorRoot;
		super({
			cleanup: cleanupBlockImageLayout,
			mode: "live-preview",
			refreshBlock: refreshLivePreviewImageLayoutBlock,
			refreshRoot: () => {
				if (viewRoot.classList.contains("is-live-preview")) {
					refreshLivePreviewBlockImageLayout(viewRoot);
				} else {
					cleanupBlockImageLayout(viewRoot);
				}
			},
			root: viewRoot,
		});
	}
}

const LivePreviewImageLayoutExtension = ViewPlugin.define(
	(view: EditorView) => new LivePreviewImageLayoutController(view.dom),
);
