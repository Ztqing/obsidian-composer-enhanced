import * as assert from "node:assert/strict";
import { test } from "node:test";

import { parseHTML } from "linkedom";

import {
	AUTOMATIC_BLOCK_IMAGE_CLASS,
	BLOCK_IMAGE_CARRIER_CLASS,
	BLOCK_IMAGE_CLASS,
	cleanupBlockImageLayout,
	collectAffectedImageLayoutBlocks,
	mutationAffectsBlockImageLayout,
	refreshBlockImageLayout,
	refreshReadingBlockImageLayout,
} from "../src/features/block-image-layout-state";

void test("marks standalone image carriers without taking over inline or explicit sizes", () => {
	const { document } = createFixture();

	refreshBlockImageLayout(document);

	assertMarked(document, "#wiki-block", "#wiki-carrier", true);
	assertMarked(document, "#direct-block", "#direct-image", true);
	assertMarked(document, "#linked-block", "#linked-carrier", true);
	assertMarked(document, "#captioned-block", "#captioned-carrier", true);
	assertMarked(document, "#explicit-block", "#explicit-carrier", false);
	assertMarked(document, "#live-block", "#live-carrier", true);
	assert.equal(
		requireElement(document, "#inline-block").classList.contains(BLOCK_IMAGE_CLASS),
		false,
	);
	assert.equal(
		requireElement(document, "#inline-image").classList.contains(
			BLOCK_IMAGE_CARRIER_CLASS,
		),
		false,
	);
	assert.equal(
		requireElement(document, "#linked-text-block").classList.contains(
			BLOCK_IMAGE_CLASS,
		),
		false,
	);
	assert.equal(
		requireElement(document, "#styled-text-block").classList.contains(
			BLOCK_IMAGE_CLASS,
		),
		false,
	);
});

void test("recognizes an image carrier after an attachment loads", () => {
	const { document } = createFixture();
	const block = requireElement(document, "#delayed-block");
	const carrier = requireElement(document, "#delayed-carrier");

	refreshBlockImageLayout(document);
	assert.equal(block.classList.contains(BLOCK_IMAGE_CLASS), false);

	carrier.appendChild(document.createElement("img"));
	refreshBlockImageLayout(document);

	assertMarked(document, "#delayed-block", "#delayed-carrier", true);
});

void test("keeps automatic sizing on a stable carrier while internal content changes", () => {
	const { document } = createFixture();
	refreshBlockImageLayout(document);

	const carrier = requireElement(document, "#wiki-carrier");
	const image = requireElement(document, "#wiki-image");
	const caption = document.createElement("span");
	caption.className = "third-party-figure-caption";
	caption.textContent = "A caption added after the initial image render";
	carrier.appendChild(caption);

	assert.equal(carrier.classList.contains(BLOCK_IMAGE_CARRIER_CLASS), true);
	assert.equal(carrier.classList.contains(AUTOMATIC_BLOCK_IMAGE_CLASS), true);
	refreshBlockImageLayout(document);
	assertMarked(document, "#wiki-block", "#wiki-carrier", true);

	const wrapper = document.createElement("span");
	wrapper.className = "third-party-image-wrapper";
	carrier.replaceChild(wrapper, image);
	wrapper.appendChild(image);

	refreshBlockImageLayout(document);
	assertMarked(document, "#wiki-block", "#wiki-carrier", true);

	caption.remove();
	refreshBlockImageLayout(document);
	assertMarked(document, "#wiki-block", "#wiki-carrier", true);
});

void test("filters mutations by image layout relevance", () => {
	const { document } = createFixture();
	const carrier = requireElement(document, "#wiki-carrier");
	const caption = document.createElement("span");
	caption.textContent = "Figure caption";
	const wrapper = document.createElement("span");
	wrapper.appendChild(document.createElement("img"));

	assert.equal(
		mutationAffectsBlockImageLayout(childListMutation(carrier, caption)),
		true,
	);
	assert.equal(
		mutationAffectsBlockImageLayout(childListMutation(carrier, wrapper)),
		true,
	);
	assert.equal(
		mutationAffectsBlockImageLayout(attributeMutation(carrier, "class")),
		true,
	);
	assert.equal(
		mutationAffectsBlockImageLayout(attributeMutation(carrier, "width")),
		true,
	);
});

void test("returns only the blocks touched by a mutation", () => {
	const { document } = createFixture();
	const firstBlock = requireElement(document, "#wiki-block");
	const secondBlock = requireElement(document, "#direct-block");
	const text = document.createTextNode("caption");
	firstBlock.appendChild(text);

	const blocks = collectAffectedImageLayoutBlocks(
		childListMutation(firstBlock, text),
		"reading",
	);

	assert.deepEqual(blocks, [firstBlock]);
	assert.equal(blocks.includes(secondBlock), false);
});

void test("reclassifies a block when meaningful text is added or removed", () => {
	const { document } = createFixture();
	const block = requireElement(document, "#wiki-block");
	const carrier = requireElement(document, "#wiki-carrier");
	refreshBlockImageLayout(document);

	const text = document.createTextNode("description");
	block.appendChild(text);
	refreshReadingBlockImageLayout(block);
	assert.equal(block.classList.contains(BLOCK_IMAGE_CLASS), false);

	text.remove();
	refreshReadingBlockImageLayout(block);
	assert.equal(block.classList.contains(BLOCK_IMAGE_CLASS), true);
	assert.equal(carrier.classList.contains(BLOCK_IMAGE_CARRIER_CLASS), true);
});

void test("does not treat empty ordinary elements as editor decorations", () => {
	const { document } = createFixture();
	const block = requireElement(document, "#live-block");
	const emptyElement = document.createElement("span");
	block.insertBefore(emptyElement, block.firstChild);

	refreshBlockImageLayout(document);

	assert.equal(block.classList.contains(BLOCK_IMAGE_CLASS), false);
});

void test("removes only Composer Enhanced image markers", () => {
	const { document } = createFixture();
	refreshBlockImageLayout(document);
	const carrier = requireElement(document, "#wiki-carrier");
	carrier.classList.add("third-party-image-class");

	cleanupBlockImageLayout(document);

	assert.equal(document.querySelector(`.${BLOCK_IMAGE_CLASS}`), null);
	assert.equal(document.querySelector(`.${BLOCK_IMAGE_CARRIER_CLASS}`), null);
	assert.equal(document.querySelector(`.${AUTOMATIC_BLOCK_IMAGE_CLASS}`), null);
	assert.equal(carrier.classList.contains("third-party-image-class"), true);
});

function createFixture(): { document: Document } {
	return parseHTML(`
		<div class="markdown-rendered">
			<p id="wiki-block">
				<span id="wiki-carrier" class="internal-embed image-embed">
					<img id="wiki-image" src="wiki.png">
				</span>
			</p>
			<p id="direct-block"><img id="direct-image" src="direct.png"></p>
			<p id="linked-block">
				<a id="linked-carrier" href="linked.png"><img src="linked.png"></a>
			</p>
			<p id="captioned-block">
				<span id="captioned-carrier" class="internal-embed image-embed">
					<img id="captioned-image" src="captioned.png">
					<span class="third-party-figure-caption">Existing caption</span>
				</span>
			</p>
			<p id="explicit-block">
				<span id="explicit-carrier" class="image-embed" width="240">
					<img src="explicit.png" width="240" height="90">
				</span>
			</p>
			<p id="inline-block">Text <img id="inline-image" src="inline.png"> after.</p>
			<p id="linked-text-block">
				<img id="linked-text-image" src="linked.png"><a href="#details">Details</a>
			</p>
			<p id="styled-text-block">
				<img src="styled.png"><span class="highlight">Ordinary styled text</span>
			</p>
			<p id="delayed-block">
				<span id="delayed-carrier" class="internal-embed image-embed"></span>
			</p>
		</div>
		<div class="markdown-source-view mod-cm6 is-live-preview">
			<div id="live-block" class="cm-line">
				<span aria-hidden="true"></span>
				<span id="live-carrier" class="cm-embed-block image-embed">
					<img src="live.png">
				</span>
				<span contenteditable="false">Figure caption</span>
			</div>
		</div>
	`) as unknown as { document: Document };
}

function assertMarked(
	document: Document,
	blockSelector: string,
	carrierSelector: string,
	automatic: boolean,
): void {
	const block = requireElement(document, blockSelector);
	const carrier = requireElement(document, carrierSelector);
	assert.equal(block.classList.contains(BLOCK_IMAGE_CLASS), true);
	assert.equal(carrier.classList.contains(BLOCK_IMAGE_CARRIER_CLASS), true);
	assert.equal(carrier.classList.contains(AUTOMATIC_BLOCK_IMAGE_CLASS), automatic);
}

function requireElement(document: Document, selector: string): HTMLElement {
	const element = document.querySelector<HTMLElement>(selector);
	assert.notEqual(element, null, `Expected ${selector} to exist`);
	return element as HTMLElement;
}

function childListMutation(target: Node, addedNode: Node): MutationRecord {
	return {
		addedNodes: [addedNode] as unknown as NodeList,
		attributeName: null,
		attributeNamespace: null,
		nextSibling: null,
		oldValue: null,
		previousSibling: null,
		removedNodes: [] as unknown as NodeList,
		target,
		type: "childList",
	};
}

function attributeMutation(target: Node, attributeName: string): MutationRecord {
	return {
		addedNodes: [] as unknown as NodeList,
		attributeName,
		attributeNamespace: null,
		nextSibling: null,
		oldValue: null,
		previousSibling: null,
		removedNodes: [] as unknown as NodeList,
		target,
		type: "attributes",
	};
}
