export type CodeTokenKind =
	| "function"
	| "keyword"
	| "property"
	| "type"
	| "value"
	| "variable";

export interface CodeIdentifierContext {
	identifier: string;
	language: string;
	nextCharacter?: string;
	previousCharacter?: string;
}

export type PrismTokenKind = "boolean" | "keyword";

const PYTHON_BUILT_INS = new Set([
	"abs",
	"all",
	"any",
	"bin",
	"bool",
	"bytes",
	"callable",
	"chr",
	"dict",
	"dir",
	"enumerate",
	"filter",
	"float",
	"format",
	"frozenset",
	"getattr",
	"hasattr",
	"hash",
	"help",
	"hex",
	"id",
	"input",
	"int",
	"isinstance",
	"issubclass",
	"iter",
	"len",
	"list",
	"map",
	"max",
	"memoryview",
	"min",
	"next",
	"object",
	"oct",
	"open",
	"ord",
	"pow",
	"print",
	"property",
	"range",
	"repr",
	"reversed",
	"round",
	"set",
	"setattr",
	"slice",
	"sorted",
	"str",
	"sum",
	"super",
	"tuple",
	"type",
	"vars",
	"zip",
]);

const PYTHON_CONSTANTS = new Set([
	"Ellipsis",
	"False",
	"None",
	"NotImplemented",
	"True",
]);

const GENERIC_VALUES = new Set(["Infinity", "NaN", "null", "undefined"]);

export function classifyCodeIdentifier({
	identifier,
	language,
	nextCharacter,
	previousCharacter,
}: CodeIdentifierContext): CodeTokenKind {
	const normalizedLanguage = language.replace(/^language-/u, "").toLowerCase();

	if (previousCharacter === ".") {
		if (nextCharacter === "(") {
			return "function";
		}

		return "property";
	}

	if (normalizedLanguage === "python" || normalizedLanguage === "py") {
		if (PYTHON_CONSTANTS.has(identifier)) {
			return "keyword";
		}

		if (PYTHON_BUILT_INS.has(identifier)) {
			return "function";
		}

		if (identifier === "match" || identifier === "case") {
			if (nextCharacter === "(") {
				return "function";
			}

			if (
				nextCharacter === "=" ||
				nextCharacter === ":" ||
				nextCharacter === "," ||
				nextCharacter === "." ||
				nextCharacter === ")"
			) {
				return "variable";
			}

			return "keyword";
		}

		if (previousCharacter === ":" || /^[A-Z]/u.test(identifier)) {
			return "type";
		}
	}

	if (nextCharacter === "(") {
		return "function";
	}

	if (/^[A-Z]/u.test(identifier)) {
		return "type";
	}

	if (GENERIC_VALUES.has(identifier)) {
		return "value";
	}

	return "variable";
}

export function classifyPrismTokenOverride(
	context: CodeIdentifierContext,
	prismTokenKind: PrismTokenKind,
): CodeTokenKind | undefined {
	const normalizedLanguage = context.language
		.replace(/^language-/u, "")
		.toLowerCase();

	if (normalizedLanguage !== "python" && normalizedLanguage !== "py") {
		return undefined;
	}

	if (prismTokenKind === "boolean") {
		return "keyword";
	}

	if (PYTHON_BUILT_INS.has(context.identifier)) {
		return "function";
	}

	if (context.identifier === "match" || context.identifier === "case") {
		const classified = classifyCodeIdentifier(context);
		return classified === "keyword" ? undefined : classified;
	}

	return undefined;
}
