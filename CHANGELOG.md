# Changelog

All notable user-facing changes to Composer Enhanced are documented here. This English changelog is the canonical source for GitHub Release notes.

## 0.1.1

### Improvements

- Restore the code block theme dropdown with a native Composer default and One Dark Pro as the available theme.
- Remove hover-only row highlighting from themed code blocks so pointer movement does not change code block backgrounds.
- Expand bundled syntax support across common web, data, infrastructure, and systems languages while keeping the CodeSuite aliases and plain-text fallback.
- Add an opt-in CodeSuite-style code color switch that uses Shiki token HTML in Reading view and the same token source for Live Preview and Source mode.
- Use one Shiki One Dark Pro token source across Reading view, Live Preview, and Source mode so language-specific syntax colors no longer depend on different Obsidian parsers.
- Normalize fence info strings and rendered `language-*` classes through one language resolver before tokenization.
- Highlight HTTP request fences with the same One Dark Pro grammar in Reading view, Live Preview, and Source mode.
- Leave Mermaid, Dataview, DataviewJS, and Query blocks available to their existing renderers when the optional code theme is enabled.

### Fixes

- Leave Obsidian YAML frontmatter outside the optional code block renderer.
- Match the official VS Code One Dark Pro background and caret colors instead of retaining Composer's code block background variables.
- Preserve Composer's academic three-line table borders when exporting notes to PDF.
- Preserve Composer's academic three-line table borders in Components AI conversations.

## 0.1.0

### New Features

- Optionally hide Components AI's animated empty-conversation icon while keeping it visible by default.

## 0.0.2

### Improvements

- Keep stable One Dark Pro syntax categories consistent across Reading view, Live Preview, and Source mode while leaving ambiguous identifiers in the normal code color.
- Keep code block palette updates lightweight when notes open or change.
- Refresh standalone-image classification when nearby content, wrappers, or captions change.

### Fixes

- Avoid nested horizontal scroll areas around oversized tables on narrow screens.

## 0.0.1

### New Features

- Add a dedicated companion plugin for future Composer theme fixes, optional enhancements, and style refinements without modifying theme files.
- Show a Composer Enhanced information section when the optional Style Settings plugin is enabled.
- Align standalone images and tables independently to the center, left, or right, with centered defaults that also work without Style Settings.
- Set the percentage width and viewport-height limit for automatically sized standalone images while preserving explicit image dimensions.
- Keep tables at their natural width or fill the normal paragraph width with fixed or content-aware columns.
- Control the Composer 0.7.0 callout compatibility fix with an enabled-by-default toggle.
- Choose between Composer's default code block appearance and a One Dark Pro palette across Reading view, Live Preview, and Source mode.

### Improvements

- Organize image and table controls into separate Style Settings groups.

### Fixes

- Restore Composer callout colors on Obsidian 1.13 while preserving the theme's built-in callout styles and color schemes.
- Align One Dark Pro identifiers and code spacing across Reading view, Live Preview, and Source mode.
- Keep One Dark Pro limited to fenced code blocks so command palette highlights and HTML source retain Composer's colors.
- Apply block image width and height limits even when Obsidian reports intrinsic image dimensions through inline custom properties.
- Keep image width and height limits active when other plugins add or remove wrappers and figure captions inside the image carrier.
