<div align="center">
  <h1>Composer Enhanced</h1>
  <p><strong>An Obsidian companion plugin for focused fixes, optional enhancements, and style refinements for the Composer theme.</strong></p>
  <p>English | <a href="README_ZH.md">中文</a> | <a href="CHANGELOG.md">Changelog</a></p>
</div>

## Enhancement scope

Composer Enhanced is designed as a separate extension layer for the [Composer theme](https://github.com/vran-dev/obsidian-composer). It can host focused compatibility fixes, opt-in features such as image alignment, code presentation refinements, and other small visual improvements without modifying the installed theme files.

The current `0.0.1` release provides:

- A compatibility fix that restores colored callouts with Composer `0.7.0` on Obsidian `1.13.x`, including Composer's built-in callout styles and color schemes.
- Independent alignment controls for standalone images and tables in Reading view and Live Preview. Each can be centered, left-aligned, or right-aligned.
- A code block theme selector with Composer's current appearance as the default and a One Dark Pro palette that stays consistent across Reading view, Live Preview, and Source mode.

These enhancements are scoped to the plugin and do not copy, modify, or replace the installed Composer theme.

## Style Settings and behavior

When [Style Settings](https://github.com/obsidian-community/obsidian-style-settings) is installed and enabled, a **Composer Enhanced** section appears in its settings page. It provides:

- **Enable Composer 0.7.0 callout fix**: on by default. Keep it on to restore callout colors, then turn it off after Composer fixes the issue upstream.
- **Code block theme**: choose **Composer (Default)** to keep the current theme appearance or **One Dark Pro** for the VS Code palette, including its dark code background and syntax colors.
- **Block image alignment** and **Table alignment**: separate controls with **Center**, **Left**, and **Right** options. Both default to **Center**.

Style Settings is optional. Without it, Composer Enhanced keeps Composer's code block appearance, centers both content types, and applies the callout compatibility fix. The code block theme is limited to fenced code blocks: inline code, command palette highlights, and HTML source outside a fence keep Composer's colors. All work is local, and the plugin does not modify note source files.

## Compatibility and limitations

Composer Enhanced currently targets Composer `0.7.0` and uses Obsidian `1.13.0` as its compatibility baseline. The plugin is structured for desktop and mobile support and does not use Electron, Node.js, or other desktop-only runtime APIs.

Image alignment applies to standalone block images; inline images remain in the surrounding text flow. Existing explicit image dimensions remain in effect. Wide tables keep Obsidian's normal horizontal scrolling behavior on narrow screens.

The selected code block palette applies in Reading view, Live Preview, and Source mode. Composer Enhanced normalizes identifiers that Obsidian's Reading view highlighter leaves unclassified, while uncommon language-specific tokens can still differ because rendered and editor views use different syntax parsers.

The callout fix targets Composer `0.7.0`'s RGB color variables. After Composer publishes an upstream correction, turn off **Enable Composer 0.7.0 callout fix** to remove the compatibility override. The plugin is intended to be enabled alongside Composer; other themes are outside its supported appearance target.

## Development and verification

```bash
npm ci
npm run dev
```

Before release, run:

```bash
npm run test:unit
npm run lint
npm run build
npm run release:check
```

Release assets are `main.js`, `manifest.json`, and `styles.css`. `main.js` is generated locally or in CI and is not tracked by Git.

## Acknowledgements

Composer Enhanced is an independent companion project. Thanks to [Composer](https://github.com/vran-dev/obsidian-composer) for the theme it extends, to [Style Settings](https://github.com/obsidian-community/obsidian-style-settings) for configurable CSS settings in Obsidian, and to [One Dark Pro](https://github.com/Binaryify/OneDark-Pro) for the optional code palette.
