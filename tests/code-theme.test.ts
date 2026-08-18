import * as assert from "node:assert/strict";
import { test } from "node:test";

import { parseHTML } from "linkedom";

import {
	ONE_DARK_PRO_CODE_THEME_CLASS,
	isCodeThemeActive,
} from "../src/features/code-theme-state";

void test("keeps the selected code theme opt-in", () => {
	const { document } = parseHTML("<body></body>");

	assert.equal(isCodeThemeActive(document), false);
	document.body.classList.add("composer-enhanced-code-theme");
	assert.equal(isCodeThemeActive(document), false);
	document.body.classList.remove("composer-enhanced-code-theme");
	document.body.classList.add(ONE_DARK_PRO_CODE_THEME_CLASS);
	assert.equal(isCodeThemeActive(document), true);
});
