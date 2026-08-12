export const BLOCK_IMAGE_CLASS = "composer-enhanced-block-image";
export const BLOCK_IMAGE_CARRIER_CLASS =
	"composer-enhanced-block-image-carrier";
export const AUTOMATIC_BLOCK_IMAGE_CLASS =
	"composer-enhanced-automatic-block-image";

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const IMAGE_SIZING_SELECTOR = "img, .image-embed, .cm-embed-block";
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

export function refreshLivePreviewBlockImageLayout(root: ParentNode): void {
	refreshCandidates(
		root,
		".markdown-source-view.mod-cm6.is-live-preview .cm-line",
		findLivePreviewImageCarrier,
	);
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

		return (
			mutation.target.matches(IMAGE_SIZING_SELECTOR) &&
			["style", "width", "height"].includes(
				mutation.attributeName ?? "",
			)
		);
	}

	if (mutation.type === "characterData") {
		const parent = mutation.target.parentNode;
		if (!isHTMLElement(parent)) {
			return false;
		}
		return (
			Boolean(mutation.target.textContent?.trim()) &&
			parent.matches(
				".markdown-rendered p, .markdown-source-view.mod-cm6.is-live-preview .cm-line",
			)
		);
	}

	if (mutation.type !== "childList") {
		return false;
	}

	const changedNodes = [
		...Array.from(mutation.addedNodes),
		...Array.from(mutation.removedNodes),
	];
	return (
		changedNodes.some(nodeContainsImageLayoutElement) ||
		(isHTMLElement(mutation.target) &&
			mutation.target.matches(
				".markdown-rendered p, .markdown-source-view.mod-cm6.is-live-preview .cm-line",
			) &&
			changedNodes.some(
				(node) => node.nodeType === TEXT_NODE && Boolean(node.textContent?.trim()),
			))
	);
}

function refreshCandidates(
	root: ParentNode,
	selector: string,
	findCarrier: (element: HTMLElement) => HTMLElement | null,
): void {
	for (const element of collectElements(root, selector)) {
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
			continue;
		}

		carrier.classList.add(BLOCK_IMAGE_CARRIER_CLASS);
		carrier.classList.toggle(
			AUTOMATIC_BLOCK_IMAGE_CLASS,
			isAutomaticallySizedImage(carrier),
		);
	}
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

	return (
		!node.textContent?.trim() ||
		node.matches(
			".cm-widgetBuffer, [aria-hidden='true'], [contenteditable='false'], .cm-formatting, .cm-formatting-image",
		)
	);
}

function nodeContainsImageLayoutElement(node: Node): boolean {
	return (
		isHTMLElement(node) &&
		(node.matches(`${IMAGE_SIZING_SELECTOR}, ${MARKED_IMAGE_SELECTOR}`) ||
			Boolean(
				node.querySelector(`${IMAGE_SIZING_SELECTOR}, ${MARKED_IMAGE_SELECTOR}`),
			))
	);
}

function isHTMLElement(
	node: Node | ParentNode | null | undefined,
): node is HTMLElement {
	return node?.nodeType === ELEMENT_NODE;
}
