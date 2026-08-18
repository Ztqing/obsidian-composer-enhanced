export const SUPPORTED_CODE_LANGUAGES = new Set([
	"python", "matlab", "javascript", "typescript", "java", "c", "cpp", "http",
	"csharp", "rust", "go", "bash", "shellscript", "html", "css", "json",
	"yaml", "toml", "sql", "markdown", "latex", "r", "ruby", "lua",
	"swift", "kotlin", "xml", "diff", "dockerfile", "makefile",
	"powershell", "graphql", "haskell", "scala", "php", "perl", "tsx",
	"jsx", "ini",
]);

const LANGUAGE_ALIASES: Record<string, string> = {
	"c#": "csharp",
	"c++": "cpp",
	cs: "csharp",
	docker: "dockerfile",
	gql: "graphql",
	hs: "haskell",
	js: "javascript",
	kt: "kotlin",
	make: "makefile",
	plain: "text",
	plaintext: "text",
	ps1: "powershell",
	pwsh: "powershell",
	py: "python",
	rb: "ruby",
	rest: "http",
	rs: "rust",
	sh: "shellscript",
	shell: "shellscript",
	tex: "latex",
	text: "text",
	ts: "typescript",
	txt: "text",
	yml: "yaml",
	zsh: "bash",
};

const PASSTHROUGH_CODE_LANGUAGES = new Set([
	"dataview",
	"dataviewjs",
	"mermaid",
	"query",
]);

/**
 * Resolve the language marker used by either a Markdown fence or a rendered
 * `language-*` class to the one id consumed by the shared tokenizer.
 */
export function resolveCodeLanguage(value: string): string {
	const normalized = value.trim().toLowerCase();
	if (!normalized) {
		return "text";
	}

	const resolved = LANGUAGE_ALIASES[normalized] ?? normalized;
	if (
		resolved === "text" ||
		PASSTHROUGH_CODE_LANGUAGES.has(resolved) ||
		SUPPORTED_CODE_LANGUAGES.has(resolved)
	) {
		return resolved;
	}
	return "text";
}

export function isPassthroughCodeLanguage(value: string): boolean {
	return PASSTHROUGH_CODE_LANGUAGES.has(resolveCodeLanguage(value));
}

/** Extract and canonicalize the first language marker from a fence info string. */
export function extractCodeLanguage(info: string): string {
	const normalized = info.trim();
	const attributeLanguage = normalized.match(/^\{\.([^}\s]+)(?:\s[^}]*)?\}/u)?.[1];
	const firstWord = normalized.split(/\s+/u)[0] ?? "";
	const rawLanguage = attributeLanguage ?? firstWord;
	return resolveCodeLanguage(rawLanguage.replace(/^language-/u, ""));
}
