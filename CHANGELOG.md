# Changelog

All notable user-facing changes to Composer Enhanced are documented here. This English changelog is the canonical source for GitHub Release notes.

## 0.1.1

### Fixes

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
