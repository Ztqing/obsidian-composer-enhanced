export const BLOCK_IMAGE_CLASS = "composer-enhanced-block-image";
export const BLOCK_IMAGE_CARRIER_CLASS =
	"composer-enhanced-block-image-carrier";
export const AUTOMATIC_BLOCK_IMAGE_CLASS =
	"composer-enhanced-automatic-block-image";

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const IMAGE_SIZING_SELECTOR = "img, .image-embed, .cm-embed-block";
const READING_BLOCK_SELECTOR = "p";
const LIVE_PREVIEW_BLOCK_SELECTOR = ".cm-line";
const LIVE_PREVIEW_CANDIDATE_SELECTOR =
	".markdown-source-view.mod-cm6.is-live-preview .cm-line";
const MARKED_IMAGE_SELECTOR = [
	`.${BLOCK_IMAGE_CARRIER_CLASS}`,
	`.${AUTOMATIC_BLOCK_IMAGE_CLASS}`,
].join(", ");

export function cleanupBlockImageLayout(root: ParentNode): void {
	for (const element of collectElements(
		root,
		`.${BLOCK_IMAGE_CLASS}, ${MARKED_IMAGE_SELECTOR}`,
	)) {
		element.classList.remove(
			BLOCK_IMAGE_CLASS,
			BLOCK_IMAGE_CARRIER_CLASS,
			AUTOMATIC_BLOCK_IMAGE_CLASS,
		);
	}
}

export function refreshBlockImageLayout(root: ParentNode): void {
	refreshCandidates(root, ".markdown-rendered p", findReadingImageCarrier);
	refreshLivePreviewBlockImageLayout(root);
}

export function refreshReadingBlockImageLayout(root: ParentNode): void {
	refreshCandidates(root, "p", findReadingImageCarrier);
}

export function refreshReadingImageLayoutBlock(paragraph: HTMLElement): void {
	if (paragraph.matches("p")) {
		refreshCandidate(paragraph, findReadingImageCarrier);
	}
}

export function refreshLivePreviewBlockImageLayout(root: ParentNode): void {
	refreshCandidates(
		root,
		LIVE_PREVIEW_CANDIDATE_SELECTOR,
		findLivePreviewImageCarrier,
	);
}

export function refreshLivePreviewImageLayoutBlock(line: HTMLElement): void {
	if (
		line.matches(LIVE_PREVIEW_BLOCK_SELECTOR) &&
		line.closest(".markdown-source-view.mod-cm6.is-live-preview")
	) {
		refreshCandidate(line, findLivePreviewImageCarrier);
	}
}

export type ImageLayoutMode = "reading" | "live-preview";

export function collectAffectedImageLayoutBlocks(
	mutation: MutationRecord,
	mode: ImageLayoutMode,
): HTMLElement[] {
	const selector =
		mode === "reading" ? READING_BLOCK_SELECTOR : LIVE_PREVIEW_CANDIDATE_SELECTOR;
	const blocks = new Set<HTMLElement>();

	addAffectedBlock(mutation.target, selector, blocks, false);
	for (const node of Array.from(mutation.addedNodes)) {
		addAffectedBlock(node, selector, blocks, true);
	}
	for (const node of Array.from(mutation.removedNodes)) {
		addAffectedBlock(node, selector, blocks, false);
	}

	return [...blocks];
}

export function mutationAffectsBlockImageLayout(
	mutation: MutationRecord,
): boolean {
	if (mutation.type === "attributes") {
		if (!isHTMLElement(mutation.target)) {
			return false;
		}

		if (mutation.target.matches(".markdown-source-view.mod-cm6")) {
			return mutation.attributeName === "class";
		}

		const attributeName = mutation.attributeName ?? "";
		return (
			(attributeName === "class" &&
				!onlyComposerEnhancedMarkersChanged(mutation) &&
				Boolean(
					mutation.target.closest(
						`${READING_BLOCK_SELECTOR}, ${LIVE_PREVIEW_BLOCK_SELECTOR}`,
					),
				)) ||
			(["style", "width", "height"].includes(attributeName) &&
				mutation.target.matches(IMAGE_SIZING_SELECTOR))
		);
	}

	if (mutation.type === "characterData") {
		const parent = mutation.target.parentNode;
		if (!isHTMLElement(parent)) {
			return false;
		}
		return Boolean(
			parent.closest(`${READING_BLOCK_SELECTOR}, ${LIVE_PREVIEW_BLOCK_SELECTOR}`),
		);
	}

	if (mutation.type !== "childList") {
		return false;
	}

	return (
		collectAffectedImageLayoutBlocks(mutation, "reading").length > 0 ||
		collectAffectedImageLayoutBlocks(mutation, "live-preview").length > 0
	);
}

function refreshCandidates(
	root: ParentNode,
	selector: string,
	findCarrier: (element: HTMLElement) => HTMLElement | null,
): void {
	for (const element of collectElements(root, selector)) {
		refreshCandidate(element, findCarrier);
	}
}

function refreshCandidate(
	element: HTMLElement,
	findCarrier: (element: HTMLElement) => HTMLElement | null,
): void {
	const carrier = findCarrier(element);
	element.classList.toggle(BLOCK_IMAGE_CLASS, carrier !== null);

	for (const previousCarrier of collectElements(element, MARKED_IMAGE_SELECTOR)) {
		if (previousCarrier !== carrier) {
			previousCarrier.classList.remove(
				BLOCK_IMAGE_CARRIER_CLASS,
				AUTOMATIC_BLOCK_IMAGE_CLASS,
			);
		}
	}

	if (carrier === null) {
		return;
	}

	carrier.classList.add(BLOCK_IMAGE_CARRIER_CLASS);
	carrier.classList.toggle(
		AUTOMATIC_BLOCK_IMAGE_CLASS,
		isAutomaticallySizedImage(carrier),
	);
}

function addAffectedBlock(
	node: Node,
	selector: string,
	blocks: Set<HTMLElement>,
	includeDescendants: boolean,
): void {
	if (!isHTMLElement(node)) {
		if (node.nodeType === TEXT_NODE && node.parentElement) {
			addAffectedBlock(node.parentElement, selector, blocks, false);
		}
		return;
	}

	const block = node.closest<HTMLElement>(selector);
	if (block) {
		blocks.add(block);
	}

	if (includeDescendants) {
		for (const descendant of Array.from(
			node.querySelectorAll<HTMLElement>(selector),
		)) {
			blocks.add(descendant);
		}
	}
}

function onlyComposerEnhancedMarkersChanged(mutation: MutationRecord): boolean {
	if (!isHTMLElement(mutation.target)) {
		return false;
	}

	const previousClasses = withoutComposerEnhancedMarkers(
		(mutation.oldValue ?? "").split(/\s+/u),
	);
	const currentClasses = withoutComposerEnhancedMarkers(mutation.target.classList);
	return (
		previousClasses.size === currentClasses.size &&
		[...previousClasses].every((className) => currentClasses.has(className))
	);
}

function withoutComposerEnhancedMarkers(classes: ArrayLike<string>): Set<string> {
	return new Set(
		Array.from(classes).filter(
			(className) =>
				className &&
				![
					BLOCK_IMAGE_CLASS,
					BLOCK_IMAGE_CARRIER_CLASS,
					AUTOMATIC_BLOCK_IMAGE_CLASS,
				].includes(className),
		),
	);
}

function collectElements(root: ParentNode, selector: string): HTMLElement[] {
	const elements = Array.from(root.querySelectorAll<HTMLElement>(selector));
	if (isHTMLElement(root) && root.matches(selector)) {
		elements.unshift(root);
	}
	return elements;
}

function findReadingImageCarrier(paragraph: HTMLElement): HTMLElement | null {
	return findStandaloneImageCarrier(getMeaningfulChildNodes(paragraph), () => false);
}

function findLivePreviewImageCarrier(line: HTMLElement): HTMLElement | null {
	return findStandaloneImageCarrier(
		getMeaningfulChildNodes(line),
		isEditorDecoration,
	);
}

function findStandaloneImageCarrier(
	nodes: ChildNode[],
	isDecoration: (node: ChildNode) => boolean,
): HTMLElement | null {
	let carrier: HTMLElement | null = null;

	for (const node of nodes) {
		const candidate = getImageCarrier(node);
		if (candidate !== null) {
			if (carrier !== null) {
				return null;
			}
			carrier = candidate;
			continue;
		}

		if (!isDecoration(node)) {
			return null;
		}
	}

	return carrier;
}

function getMeaningfulChildNodes(element: HTMLElement): ChildNode[] {
	return Array.from(element.childNodes).filter(
		(node) => node.nodeType !== TEXT_NODE || Boolean(node.textContent?.trim()),
	);
}

function getImageCarrier(node: ChildNode | undefined): HTMLElement | null {
	if (!isHTMLElement(node)) {
		return null;
	}

	if (node.matches("img, .image-embed, .cm-embed-block")) {
		return node.matches("img") || Boolean(node.querySelector("img"))
			? node
			: null;
	}

	if (!node.matches("a")) {
		return null;
	}

	const content = getMeaningfulChildNodes(node);
	return content.length === 1 && getImageCarrier(content[0]) !== null ? node : null;
}

function isAutomaticallySizedImage(carrier: HTMLElement): boolean {
	const sizingElements = Array.from(
		carrier.querySelectorAll<HTMLElement>(IMAGE_SIZING_SELECTOR),
	);
	if (carrier.matches(IMAGE_SIZING_SELECTOR)) {
		sizingElements.unshift(carrier);
	}

	return (
		sizingElements.some((element) => element.matches("img")) &&
		sizingElements.every((element) => !hasExplicitDimensions(element))
	);
}

function hasExplicitDimensions(element: HTMLElement): boolean {
	return (
		element.hasAttribute("width") ||
		element.hasAttribute("height") ||
		Boolean(
			element.style.width ||
				element.style.height ||
				element.style.maxWidth ||
				element.style.maxHeight,
		)
	);
}

function isEditorDecoration(node: ChildNode): boolean {
	if (!isHTMLElement(node)) {
		return false;
	}

	return node.matches(
		".cm-widgetBuffer, [aria-hidden='true'], [contenteditable='false'], .cm-formatting, .cm-formatting-image",
	);
}

function isHTMLElement(
	node: Node | ParentNode | null | undefined,
): node is HTMLElement {
	return node?.nodeType === ELEMENT_NODE;
}
