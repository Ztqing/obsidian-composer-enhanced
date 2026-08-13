<div align="center">
  <h1>Composer Enhanced</h1>
  <p><strong>An Obsidian companion plugin for focused fixes, optional enhancements, and style refinements for the Composer theme.</strong></p>
  <p>English | <a href="README_ZH.md">中文</a> | <a href="CHANGELOG.md">Changelog</a></p>
</div>

## Enhancement scope

Composer Enhanced is designed as a separate extension layer for the [Composer theme](https://github.com/vran-dev/obsidian-composer). It can host focused compatibility fixes, opt-in features such as image alignment, code presentation refinements, and other small visual improvements without modifying the installed theme files.

The current `0.0.1` release provides:

- A compatibility fix that restores colored callouts with Composer `0.7.0` on Obsidian `1.13.x`, including Composer's built-in callout styles and color schemes.
- Independent alignment controls for standalone images and tables in Reading view and Live Preview, percentage width and viewport-height limits for automatically sized block images, and three table width behaviors.
- A code block theme selector with Composer's current appearance as the default and a lightweight One Dark Pro palette that keeps stable syntax categories consistent across Reading view, Live Preview, and Source mode.

These enhancements are scoped to the plugin and do not copy, modify, or replace the installed Composer theme.

## Style Settings and behavior

When [Style Settings](https://github.com/obsidian-community/obsidian-style-settings) is installed and enabled, a **Composer Enhanced** section appears in its settings page. Image controls and table controls are organized in separate **Images** and **Tables** groups. It provides:

- **Enable Composer 0.7.0 callout fix**: on by default. Keep it on to restore callout colors, then turn it off after Composer fixes the issue upstream.
- **Code block theme**: choose **Composer (Default)** to keep the current theme appearance or **One Dark Pro** for the VS Code palette, including its dark code background and syntax colors.
- **Block image alignment** and **Table alignment**: separate controls with **Center**, **Left**, and **Right** options. Both default to **Center**.
- **Block image width**: set automatically sized standalone images from `10%` to `100%` of the normal content width. The default is `100%`.
- **Block image maximum height**: cap automatically sized standalone images relative to the viewport. The default is `80vh`.
- **Table width**: choose **Default** for natural table width, **Content width** to align the table edges with normal paragraphs and distribute columns evenly, or **Content width, content-aware** to use the same width while letting cell content influence column proportions. The default is **Default**.

Style Settings is optional. Without it, Composer Enhanced keeps Composer's code block appearance, centers images and tables, uses `100%` image width with the `80vh` height limit, keeps tables at their natural width, and applies the callout compatibility fix. The code block theme is limited to fenced code blocks: inline code, command palette highlights, and HTML source outside a fence keep Composer's colors. All work is local, and the plugin does not modify note source files.

## Compatibility and limitations

Composer Enhanced currently targets Composer `0.7.0` and uses Obsidian `1.13.0` as its compatibility baseline. The plugin is structured for desktop and mobile support and does not use Electron, Node.js, or other desktop-only runtime APIs.

Image alignment, width, and maximum height apply only to standalone block images; inline images remain in the surrounding text flow. The selected image width is a maximum, so images preserve their original aspect ratio and can render narrower when their intrinsic size or height limit is reached first. Existing explicit image dimensions remain in effect and bypass automatic sizing. Image classification stays current when editors or local plugins add or remove nearby content, wrappers, or figure captions, while image limits remain attached to the stable layout carrier. This general handling has been verified with [Captions](https://github.com/Ztqing/obsidian-captions), but Composer Enhanced does not depend on its classes or internal API. Both content-width table modes align with the normal paragraph width rather than the full Markdown pane. The fixed mode gives columns equal available shares, while the content-aware mode uses the browser's automatic table layout to allocate more space to columns that need it. Oversized table content uses one independent horizontal scrolling area on narrow screens.

The selected code block palette applies in Reading view, Live Preview, and Source mode. Stable syntax categories such as comments, keywords, operators, strings, values, types, attributes, tags, and punctuation share the same semantic palette across Obsidian's rendered and editor token classes. Functions, variables, properties, and built-in identifiers use the normal code color because Prism and CodeMirror frequently classify them differently. This keeps note rendering lightweight and leaves rendered code structure unchanged while preserving the most useful highlighting. Uncommon language-specific tokens can still differ because the views use different syntax parsers.

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
