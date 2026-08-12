import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
	classifyCodeIdentifier,
	classifyPrismTokenOverride,
} from "../src/features/code-token-classifier";

void test("classifies Python identifiers like CodeMirror", () => {
	assert.equal(classify("self"), "variable");
	assert.equal(classify("thought_match"), "variable");
	assert.equal(classify("search", ".", "("), "property");
	assert.equal(classify("print", undefined, "("), "function");
	assert.equal(classify("None"), "keyword");
	assert.equal(classify("HelloAgentsLLM", ":"), "type");
});

void test("keeps Python soft keywords sensitive to their context", () => {
	assert.equal(classify("match", undefined, "="), "variable");
	assert.equal(classify("match", undefined, ":"), "variable");
	assert.equal(classify("match", undefined, "."), "variable");
	assert.equal(classify("match", ".", "("), "property");
	assert.equal(classify("match", undefined, "value"), "keyword");
});

void test("corrects Python tokens that Prism classifies differently", () => {
	assert.equal(
		classifyPrismTokenOverride(
			{
				identifier: "print",
				language: "python",
				nextCharacter: "(",
			},
			"keyword",
		),
		"function",
	);
	assert.equal(
		classifyPrismTokenOverride(
			{
				identifier: "None",
				language: "python",
			},
			"boolean",
		),
		"keyword",
	);
	assert.equal(
		classifyPrismTokenOverride(
			{
				identifier: "match",
				language: "python",
				nextCharacter: "=",
			},
			"keyword",
		),
		"variable",
	);
	assert.equal(
		classifyPrismTokenOverride(
			{
				identifier: "return",
				language: "python",
			},
			"keyword",
		),
		undefined,
	);
});

function classify(
	identifier: string,
	previousCharacter?: string,
	nextCharacter?: string,
): ReturnType<typeof classifyCodeIdentifier> {
	return classifyCodeIdentifier({
		identifier,
		language: "python",
		nextCharacter,
		previousCharacter,
	});
}
