import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
	COMPOSER_ENHANCED_CLASS,
	disableThemeScope,
	enableThemeScope,
} from "../src/theme-scope";

class FakeClassList {
	readonly values = new Set<string>();

	add(...tokens: string[]): void {
		for (const token of tokens) {
			this.values.add(token);
		}
	}

	remove(...tokens: string[]): void {
		for (const token of tokens) {
			this.values.delete(token);
		}
	}
}

void test("adds and removes the plugin scope idempotently", () => {
	const classList = new FakeClassList();
	const target = { classList };

	enableThemeScope(target);
	enableThemeScope(target);
	assert.deepEqual([...classList.values], [COMPOSER_ENHANCED_CLASS]);

	disableThemeScope(target);
	disableThemeScope(target);
	assert.equal(classList.values.size, 0);
});

void test("does not remove classes owned by Obsidian or other plugins", () => {
	const classList = new FakeClassList();
	const target = { classList };
	classList.add("theme-dark", "composer--XiaScheme-dark");

	enableThemeScope(target);
	disableThemeScope(target);

	assert.deepEqual(
		[...classList.values].sort(),
		["composer--XiaScheme-dark", "theme-dark"],
	);
});
