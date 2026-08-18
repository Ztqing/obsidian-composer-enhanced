import {
	createHighlighterCore,
	type HighlighterCore,
} from "shiki/dist/core.mjs";
import { createJavaScriptRegexEngine } from "shiki/dist/engine-javascript.mjs";
import langActionscript3 from "shiki/dist/langs/actionscript-3.mjs";
import langApache from "shiki/dist/langs/apache.mjs";
import langAsm from "shiki/dist/langs/asm.mjs";
import langAstro from "shiki/dist/langs/astro.mjs";
import langBash from "shiki/dist/langs/bash.mjs";
import langC from "shiki/dist/langs/c.mjs";
import langCpp from "shiki/dist/langs/cpp.mjs";
import langCsharp from "shiki/dist/langs/csharp.mjs";
import langCobol from "shiki/dist/langs/cobol.mjs";
import langClojure from "shiki/dist/langs/clojure.mjs";
import langCoffee from "shiki/dist/langs/coffee.mjs";
import langCss from "shiki/dist/langs/css.mjs";
import langDiff from "shiki/dist/langs/diff.mjs";
import langDart from "shiki/dist/langs/dart.mjs";
import langDockerfile from "shiki/dist/langs/dockerfile.mjs";
import langDotenv from "shiki/dist/langs/dotenv.mjs";
import langElixir from "shiki/dist/langs/elixir.mjs";
import langErlang from "shiki/dist/langs/erlang.mjs";
import langFsharp from "shiki/dist/langs/fsharp.mjs";
import langGo from "shiki/dist/langs/go.mjs";
import langGraphql from "shiki/dist/langs/graphql.mjs";
import langGlsl from "shiki/dist/langs/glsl.mjs";
import langGroovy from "shiki/dist/langs/groovy.mjs";
import langHaskell from "shiki/dist/langs/haskell.mjs";
import langHtml from "shiki/dist/langs/html.mjs";
import langHttp from "shiki/dist/langs/http.mjs";
import langHlsl from "shiki/dist/langs/hlsl.mjs";
import langIni from "shiki/dist/langs/ini.mjs";
import langJava from "shiki/dist/langs/java.mjs";
import langJavascript from "shiki/dist/langs/javascript.mjs";
import langJson from "shiki/dist/langs/json.mjs";
import langJsonc from "shiki/dist/langs/jsonc.mjs";
import langJson5 from "shiki/dist/langs/json5.mjs";
import langJsx from "shiki/dist/langs/jsx.mjs";
import langKotlin from "shiki/dist/langs/kotlin.mjs";
import langLatex from "shiki/dist/langs/latex.mjs";
import langLess from "shiki/dist/langs/less.mjs";
import langLua from "shiki/dist/langs/lua.mjs";
import langMakefile from "shiki/dist/langs/makefile.mjs";
import langMarkdown from "shiki/dist/langs/markdown.mjs";
import langMatlab from "shiki/dist/langs/matlab.mjs";
import langNginx from "shiki/dist/langs/nginx.mjs";
import langObjectiveC from "shiki/dist/langs/objective-c.mjs";
import langPerl from "shiki/dist/langs/perl.mjs";
import langPhp from "shiki/dist/langs/php.mjs";
import langPowershell from "shiki/dist/langs/powershell.mjs";
import langPrisma from "shiki/dist/langs/prisma.mjs";
import langProtobuf from "shiki/dist/langs/protobuf.mjs";
import langPython from "shiki/dist/langs/python.mjs";
import langR from "shiki/dist/langs/r.mjs";
import langRuby from "shiki/dist/langs/ruby.mjs";
import langRust from "shiki/dist/langs/rust.mjs";
import langScala from "shiki/dist/langs/scala.mjs";
import langShell from "shiki/dist/langs/shellscript.mjs";
import langShellsession from "shiki/dist/langs/shellsession.mjs";
import langSolidity from "shiki/dist/langs/solidity.mjs";
import langScss from "shiki/dist/langs/scss.mjs";
import langSvelte from "shiki/dist/langs/svelte.mjs";
import langSql from "shiki/dist/langs/sql.mjs";
import langSwift from "shiki/dist/langs/swift.mjs";
import langTerraform from "shiki/dist/langs/terraform.mjs";
import langToml from "shiki/dist/langs/toml.mjs";
import langTsx from "shiki/dist/langs/tsx.mjs";
import langTypescript from "shiki/dist/langs/typescript.mjs";
import langVue from "shiki/dist/langs/vue.mjs";
import langXml from "shiki/dist/langs/xml.mjs";
import langYaml from "shiki/dist/langs/yaml.mjs";
import langZig from "shiki/dist/langs/zig.mjs";
import langCsv from "shiki/dist/langs/csv.mjs";
import langProperties from "shiki/dist/langs/properties.mjs";
import oneDarkPro from "shiki/dist/themes/one-dark-pro.mjs";

import type {
	CodeThemeTokenLines,
	CodeThemeTokenizer,
} from "./code-theme-tokens";
import {
	isPassthroughCodeLanguage,
	resolveLanguage as resolveCodeLanguageValue,
} from "./code-language";

const MAX_TOKEN_CACHE_ENTRIES = 256;
const CODE_THEME_ID = "one-dark-pro";

const LANGUAGES = [
	langActionscript3,
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
	langJsonc,
	langJson5,
	langAstro,
	langVue,
	langSvelte,
	langScss,
	langLess,
	langDart,
	langObjectiveC,
	langCoffee,
	langClojure,
	langElixir,
	langErlang,
	langFsharp,
	langGroovy,
	langProtobuf,
	langPrisma,
	langTerraform,
	langNginx,
	langApache,
	langAsm,
	langHlsl,
	langGlsl,
	langSolidity,
	langZig,
	langCobol,
	langCsv,
	langProperties,
	langDotenv,
	langShellsession,
];

export class CodeThemeHighlighter implements CodeThemeTokenizer {
	private core?: HighlighterCore;
	private disposed = false;
	private initialization?: Promise<boolean>;
	private readonly tokenCache = new Map<string, CodeThemeTokenLines>();
	private readonly htmlCache = new Map<string, string>();

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

	/** Resolve a fence marker or rendered language class to a Shiki id. */
	resolveLanguage(language: string): string {
		return resolveCodeLanguageValue(language);
	}

	tokenize(code: string, language: string): CodeThemeTokenLines | null {
		if (!this.core) {
			return null;
		}

		const resolvedLanguage = this.resolveLanguage(language);
		const cacheKey = `${resolvedLanguage}\0${code}`;
		const cached = this.tokenCache.get(cacheKey);
		if (cached) {
			return cached;
		}

		try {
			const tokenLines = this.core.codeToTokensBase(code, {
				lang: this.resolveHighlightLanguage(resolvedLanguage),
				theme: CODE_THEME_ID,
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

	/** Generate CodeSuite-style Shiki HTML for a rendered code block. */
	highlight(code: string, language: string): string | null {
		if (!this.core) {
			return null;
		}

		const resolvedLanguage = this.resolveLanguage(language);
		const cacheKey = `${resolvedLanguage}\0${code}`;
		const cached = this.htmlCache.get(cacheKey);
		if (cached) {
			return cached;
		}

		try {
			const html = this.core.codeToHtml(code, {
				lang: this.resolveHighlightLanguage(resolvedLanguage),
				theme: CODE_THEME_ID,
			});
			this.cacheHtml(cacheKey, html);
			return html;
		} catch {
			return null;
		}
	}

	dispose(): void {
		this.disposed = true;
		this.tokenCache.clear();
		this.htmlCache.clear();
		this.core?.dispose();
		this.core = undefined;
	}

	private resolveHighlightLanguage(language: string): string {
		return language === "zsh" ? "bash" : language;
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

	private cacheHtml(key: string, value: string): void {
		this.htmlCache.set(key, value);
		if (this.htmlCache.size <= MAX_TOKEN_CACHE_ENTRIES) {
			return;
		}
		const oldestKey = this.htmlCache.keys().next().value as string | undefined;
		if (oldestKey) {
			this.htmlCache.delete(oldestKey);
		}
	}
}
