export const SUPPORTED_CODE_LANGUAGES = new Set([
	"python", "matlab", "javascript", "typescript", "java", "c", "cpp", "http",
	"csharp", "rust", "go", "bash", "shellscript", "html", "css", "json",
	"yaml", "toml", "sql", "markdown", "latex", "r", "ruby", "lua",
	"swift", "kotlin", "xml", "diff", "dockerfile", "makefile",
	"powershell", "graphql", "haskell", "scala", "php", "perl", "tsx",
	"jsx", "ini",
	// Common Shiki grammars that were not part of the original focused list.
	// Keeping these ids here makes the same resolver usable by Reading view,
	// Live Preview, and Source mode without changing the note text.
	"actionscript-3", "jsonc", "json5", "astro", "vue", "svelte", "scss", "less", "dart",
	"objective-c", "coffee", "clojure", "elixir", "erlang", "fsharp",
	"groovy", "protobuf", "prisma", "terraform", "nginx", "apache", "asm",
	"hlsl", "glsl", "solidity", "zig", "cobol", "csv", "properties",
	"dotenv", "shellsession",
]);

const LANGUAGE_ALIASES: Record<string, string> = {
	"actionscript": "actionscript-3",
	as: "actionscript-3",
	asm: "asm",
	assembly: "asm",
	"c#": "csharp",
	"c++": "cpp",
	cc: "cpp",
	cs: "csharp",
	cxx: "cpp",
	coffee: "coffee",
	coffeescript: "coffee",
	console: "shellsession",
	docker: "dockerfile",
	dotenv: "dotenv",
	env: "dotenv",
	erl: "erlang",
	"f#": "fsharp",
	fs: "fsharp",
	gql: "graphql",
	h: "c",
	hs: "haskell",
	js: "javascript",
	javascriptreact: "jsx",
	json5: "json5",
	kt: "kotlin",
	make: "makefile",
	md: "markdown",
	mdown: "markdown",
	mkd: "markdown",
	objc: "objective-c",
	plain: "text",
	plaintext: "text",
	ps1: "powershell",
	ps: "powershell",
	pwsh: "powershell",
	py: "python",
	rb: "ruby",
	rest: "http",
	rs: "rust",
	sass: "scss",
	sh: "shellscript",
	shell: "shellscript",
	"shell-session": "shellsession",
	shader: "hlsl",
	shaderlab: "hlsl",
	tex: "latex",
	text: "text",
	ts: "typescript",
	typescriptreact: "tsx",
	txt: "text",
	tf: "terraform",
	tfvars: "terraform",
	terraform: "terraform",
	proto: "protobuf",
	protobuf: "protobuf",
	cob: "cobol",
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

/** CodeSuite-compatible name for the shared fence-language resolver. */
export function resolveLanguage(value: string): string {
	return resolveCodeLanguage(value);
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
