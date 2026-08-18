import {
	createHighlighterCore,
	type HighlighterCore,
} from "shiki/dist/core.mjs";
import { createJavaScriptRegexEngine } from "shiki/dist/engine-javascript.mjs";
import langBash from "shiki/dist/langs/bash.mjs";
import langC from "shiki/dist/langs/c.mjs";
import langCpp from "shiki/dist/langs/cpp.mjs";
import langCsharp from "shiki/dist/langs/csharp.mjs";
import langCss from "shiki/dist/langs/css.mjs";
import langDiff from "shiki/dist/langs/diff.mjs";
import langDockerfile from "shiki/dist/langs/dockerfile.mjs";
import langGo from "shiki/dist/langs/go.mjs";
import langGraphql from "shiki/dist/langs/graphql.mjs";
import langHaskell from "shiki/dist/langs/haskell.mjs";
import langHtml from "shiki/dist/langs/html.mjs";
import langHttp from "shiki/dist/langs/http.mjs";
import langIni from "shiki/dist/langs/ini.mjs";
import langJava from "shiki/dist/langs/java.mjs";
import langJavascript from "shiki/dist/langs/javascript.mjs";
import langJson from "shiki/dist/langs/json.mjs";
import langJsx from "shiki/dist/langs/jsx.mjs";
import langKotlin from "shiki/dist/langs/kotlin.mjs";
import langLatex from "shiki/dist/langs/latex.mjs";
import langLua from "shiki/dist/langs/lua.mjs";
import langMakefile from "shiki/dist/langs/makefile.mjs";
import langMarkdown from "shiki/dist/langs/markdown.mjs";
import langMatlab from "shiki/dist/langs/matlab.mjs";
import langPerl from "shiki/dist/langs/perl.mjs";
import langPhp from "shiki/dist/langs/php.mjs";
import langPowershell from "shiki/dist/langs/powershell.mjs";
import langPython from "shiki/dist/langs/python.mjs";
import langR from "shiki/dist/langs/r.mjs";
import langRuby from "shiki/dist/langs/ruby.mjs";
import langRust from "shiki/dist/langs/rust.mjs";
import langScala from "shiki/dist/langs/scala.mjs";
import langShell from "shiki/dist/langs/shellscript.mjs";
import langSql from "shiki/dist/langs/sql.mjs";
import langSwift from "shiki/dist/langs/swift.mjs";
import langToml from "shiki/dist/langs/toml.mjs";
import langTsx from "shiki/dist/langs/tsx.mjs";
import langTypescript from "shiki/dist/langs/typescript.mjs";
import langXml from "shiki/dist/langs/xml.mjs";
import langYaml from "shiki/dist/langs/yaml.mjs";
import oneDarkPro from "shiki/dist/themes/one-dark-pro.mjs";

import type {
	CodeThemeTokenLines,
	CodeThemeTokenizer,
} from "./code-theme-tokens";
import {
	isPassthroughCodeLanguage,
	resolveCodeLanguage,
} from "./code-language";

const MAX_TOKEN_CACHE_ENTRIES = 256;

const LANGUAGES = [
	langPython,
	langMatlab,
	langJavascript,
	langTypescript,
	langJava,
	langC,
	langCpp,
	langCsharp,
	langRust,
	langGo,
	langBash,
	langShell,
	langHtml,
	langHttp,
	langCss,
	langJson,
	langYaml,
	langToml,
	langSql,
	langMarkdown,
	langLatex,
	langR,
	langRuby,
	langLua,
	langSwift,
	langKotlin,
	langXml,
	langDiff,
	langDockerfile,
	langMakefile,
	langPowershell,
	langGraphql,
	langHaskell,
	langScala,
	langPhp,
	langPerl,
	langTsx,
	langJsx,
	langIni,
];

export class CodeThemeHighlighter implements CodeThemeTokenizer {
	private core?: HighlighterCore;
	private disposed = false;
	private initialization?: Promise<boolean>;
	private readonly tokenCache = new Map<string, CodeThemeTokenLines>();

	initialize(): Promise<boolean> {
		if (this.core) {
			return Promise.resolve(true);
		}
		if (this.disposed) {
			return Promise.resolve(false);
		}

		this.initialization ??= createHighlighterCore({
			themes: [oneDarkPro],
			langs: LANGUAGES,
			engine: createJavaScriptRegexEngine(),
		}).then((core) => {
			if (this.disposed) {
				core.dispose();
				return false;
			}
			this.core = core;
			return true;
		}).catch(() => {
			// Rendering must keep using Composer's native colors when Shiki cannot
			// initialize on a particular Obsidian/WebView runtime.
			this.initialization = undefined;
			return false;
		});

		return this.initialization;
	}

	isReady(): boolean {
		return this.core !== undefined;
	}

	isPassthroughLanguage(language: string): boolean {
		return isPassthroughCodeLanguage(language);
	}

	tokenize(code: string, language: string): CodeThemeTokenLines | null {
		if (!this.core) {
			return null;
		}

		const resolvedLanguage = resolveCodeLanguage(language);
		const cacheKey = `${resolvedLanguage}\0${code}`;
		const cached = this.tokenCache.get(cacheKey);
		if (cached) {
			return cached;
		}

		try {
			const tokenLines = this.core.codeToTokensBase(code, {
				lang: resolvedLanguage,
				theme: "one-dark-pro",
			});
			const normalized = tokenLines.map((line) =>
				line.map((token) => ({
					content: token.content,
					color: token.color,
					fontStyle: token.fontStyle,
				})),
			);
			this.cache(cacheKey, normalized);
			return normalized;
		} catch {
			return null;
		}
	}

	dispose(): void {
		this.disposed = true;
		this.tokenCache.clear();
		this.core?.dispose();
		this.core = undefined;
	}

	private cache(key: string, value: CodeThemeTokenLines): void {
		this.tokenCache.set(key, value);
		if (this.tokenCache.size <= MAX_TOKEN_CACHE_ENTRIES) {
			return;
		}
		const oldestKey = this.tokenCache.keys().next().value as string | undefined;
		if (oldestKey) {
			this.tokenCache.delete(oldestKey);
		}
	}
}
