import * as assert from "node:assert/strict";
import { test } from "node:test";

import { parseHTML } from "linkedom";

import { ImageLayoutObserver } from "../src/features/block-image-layout-observer";
import {
	BLOCK_IMAGE_CLASS,
	cleanupBlockImageLayout,
	refreshLivePreviewBlockImageLayout,
	refreshLivePreviewImageLayoutBlock,
	refreshReadingBlockImageLayout,
	refreshReadingImageLayoutBlock,
} from "../src/features/block-image-layout-state";

void test("refreshes only the reading block changed by a mutation", async () => {
	const { document } = parseHTML(`
		<div id="root" class="markdown-rendered">
			<p id="first"><img src="first.png"></p>
			<p id="second"><img src="second.png"></p>
		</div>
	`);
	const root = requireElement(document, "#root");
	const first = requireElement(document, "#first");
	const refreshed: string[] = [];
	const observer = new ImageLayoutObserver({
		cleanup: cleanupBlockImageLayout,
		mode: "reading",
		refreshBlock: (block) => {
			refreshed.push(block.id);
			refreshReadingImageLayoutBlock(block);
		},
		refreshRoot: () => refreshReadingBlockImageLayout(root),
		root,
	});

	first.append("caption");
	await mutationsFlushed();

	assert.deepEqual(refreshed, ["first"]);
	assert.equal(first.classList.contains(BLOCK_IMAGE_CLASS), false);
	assert.equal(
		requireElement(document, "#second").classList.contains(BLOCK_IMAGE_CLASS),
		true,
	);
	observer.destroy();
});

void test("does not rescan a block for its own marker mutations", async () => {
	const { document } = parseHTML(`
		<div id="root" class="markdown-rendered">
			<p id="block"><span id="carrier" class="image-embed"></span></p>
		</div>
	`);
	const root = requireElement(document, "#root");
	const carrier = requireElement(document, "#carrier");
	let blockRefreshes = 0;
	const observer = new ImageLayoutObserver({
		cleanup: cleanupBlockImageLayout,
		mode: "reading",
		refreshBlock: (block) => {
			blockRefreshes += 1;
			refreshReadingImageLayoutBlock(block);
		},
		refreshRoot: () => refreshReadingBlockImageLayout(root),
		root,
	});

	carrier.appendChild(document.createElement("img"));
	await mutationsFlushed();
	await mutationsFlushed();

	assert.equal(blockRefreshes, 1);
	observer.destroy();
});

void test("refreshes live preview on mode changes and cleans up on destroy", async () => {
	const { document } = parseHTML(`
		<div id="root" class="markdown-source-view mod-cm6 is-live-preview">
			<div id="line" class="cm-line"><img src="image.png"></div>
		</div>
	`);
	const root = requireElement(document, "#root");
	const line = requireElement(document, "#line");
	let rootRefreshes = 0;
	const observer = new ImageLayoutObserver({
		cleanup: cleanupBlockImageLayout,
		mode: "live-preview",
		refreshBlock: refreshLivePreviewImageLayoutBlock,
		refreshRoot: () => {
			rootRefreshes += 1;
			if (root.classList.contains("is-live-preview")) {
				refreshLivePreviewBlockImageLayout(root);
			} else {
				cleanupBlockImageLayout(root);
			}
		},
		root,
	});

	assert.equal(line.classList.contains(BLOCK_IMAGE_CLASS), true);
	root.classList.remove("is-live-preview");
	await mutationsFlushed();
	assert.equal(line.classList.contains(BLOCK_IMAGE_CLASS), false);

	root.classList.add("is-live-preview");
	await mutationsFlushed();
	assert.equal(line.classList.contains(BLOCK_IMAGE_CLASS), true);
	assert.equal(rootRefreshes, 3);

	observer.destroy();
	assert.equal(line.classList.contains(BLOCK_IMAGE_CLASS), false);
	line.append("caption");
	await mutationsFlushed();
	assert.equal(line.classList.contains(BLOCK_IMAGE_CLASS), false);
});

void test("cleans markers from a removed live-preview line", async () => {
	const { document } = parseHTML(`
		<div id="root" class="markdown-source-view mod-cm6 is-live-preview">
			<div id="line" class="cm-line"><img src="image.png"></div>
		</div>
	`);
	const root = requireElement(document, "#root");
	const line = requireElement(document, "#line");
	const observer = new ImageLayoutObserver({
		cleanup: cleanupBlockImageLayout,
		mode: "live-preview",
		refreshBlock: refreshLivePreviewImageLayoutBlock,
		refreshRoot: () => refreshLivePreviewBlockImageLayout(root),
		root,
	});

	assert.equal(line.classList.contains(BLOCK_IMAGE_CLASS), true);
	line.remove();
	await mutationsFlushed();
	assert.equal(line.classList.contains(BLOCK_IMAGE_CLASS), false);
	observer.destroy();
});

function requireElement(document: Document, selector: string): HTMLElement {
	const element = document.querySelector<HTMLElement>(selector);
	assert.notEqual(element, null, `Expected ${selector} to exist`);
	return element as HTMLElement;
}

async function mutationsFlushed(): Promise<void> {
	await new Promise<void>((resolve) => setTimeout(resolve, 0));
}
