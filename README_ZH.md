<div align="center">
  <h1>Composer Enhanced</h1>
  <p><strong>一个为 Composer 主题提供针对性修复、可选增强和样式改进的 Obsidian 配套插件。</strong></p>
  <p><a href="README.md">English</a> | 中文 | <a href="CHANGELOG.md">更新日志</a></p>
</div>

## 增强范围

Composer Enhanced 是为 [Composer 主题](https://github.com/vran-dev/obsidian-composer)设计的独立扩展层。它可以在不修改已安装主题文件的前提下，承载针对性的兼容性修复、图片对齐等可选功能、代码显示优化以及其他小型视觉改进。

Composer Enhanced 当前提供：

- 修复 Composer `0.7.0` 在 Obsidian `1.13.x` 中 Callout 颜色丢失的问题，覆盖 Composer 内置的 Callout 样式和配色方案。
- 修复 Composer `0.7.0` 学术三线表在 PDF 导出和 Components AI 会话中边框显示不完整的问题。
- 分别控制阅读视图和实时预览中独占一行的图片与表格对齐方式，为自动调整尺寸的块级图片提供百分比宽度和视口限高，并提供三种表格宽度行为。
- 提供代码块主题选择；默认保留 Composer 当前外观，也可使用轻量的 One Dark Pro 配色，在阅读视图、实时预览和源码模式中统一稳定的语法类别，同时让有歧义的标识符保持普通代码文本色。
- 可选择隐藏 Components AI 的空会话动画图标，而不关闭 AI Chat。

这些增强只在插件作用域内生效，不会复制、修改或替换已安装的 Composer 主题。

## Style Settings 与行为

安装并启用 [Style Settings](https://github.com/obsidian-community/obsidian-style-settings) 后，其设置页面中会显示 **Composer Enhanced** 区域。Components 插件、图片和表格控制项分别归入独立分组，其中包括：

- **启用 Composer 0.7.0 Callout 修复**：默认开启。使用 Composer `0.7.0` 时保持开启以恢复 Callout 颜色，Composer 上游修复问题后再将其关闭。
- **代码块主题**：选择 **Composer（默认）**可保留当前主题外观，也可选择 **One Dark Pro**，使用与 VS Code 主题一致的深色代码背景和语法配色。
- **隐藏 Components AI 空状态图标**：默认关闭，因此图标保持显示。开启后会隐藏 AI Chat 空会话中的机器人动画图标，但保留提示文字和 Components AI 的其他功能。
- **块级图片对齐**和**表格对齐**：两个独立控制项，均提供**居中**、**靠左**和**靠右**选项，默认值均为**居中**。
- **块级图片宽度**：在正常正文宽度的 `10%` 到 `100%` 之间设置自动调整尺寸的独占一行图片，默认值为 `100%`。
- **块级图片最大高度**：按视口高度限制自动调整尺寸的独占一行图片，默认值为 `80vh`。
- **表格宽度**：选择**默认**以保持表格自然宽度；选择**正文宽度**以让表格左右边缘与普通段落对齐，并让各列均匀分配可用宽度；选择**正文宽度（按内容分配）**以使用相同宽度，同时让单元格内容影响各列比例。默认值为**默认**。

Style Settings 是可选依赖。未安装时，代码块保留 Composer 外观，显示 Components AI 空状态图标，图片和表格保持居中，图片宽度为 `100%`、限高为 `80vh`，表格保持自然宽度，同时启用 Callout 兼容修复。代码块主题仅作用于 fenced code block；内联代码、命令面板高亮以及围栏外的 HTML 源码仍保留 Composer 配色。插件的所有处理均在本地完成，也不会修改笔记源文件。

## 兼容性与限制

Composer Enhanced 当前面向 Composer `0.7.0`，并以 Obsidian `1.13.0` 作为兼容性基线。插件结构同时考虑桌面端和移动端，不使用 Electron、Node.js 或其他桌面专用运行时 API。

学术三线表兼容修复只在 Composer 已选择**三线表（学术）**样式时生效。它会恢复 Obsidian PDF 导出和 Components AI 会话中的表头分隔线与底线颜色，不会改变 Composer 的其他表格样式或其他 Markdown 渲染器。

图片对齐、宽度和最大高度只作用于独占一行的块级图片，行内图片仍保留在正文排版流中。所选图片宽度是最大值，图片会保持原始纵横比，因此当原始尺寸较小或先触发限高时，实际宽度可以更窄；笔记中已有的显式图片尺寸仍然有效，并跳过自动尺寸控制。当编辑器或其他本地插件添加或删除相邻内容、包装或题注时，图片分类会及时更新，尺寸限制仍会附着在稳定的布局载体上。这套通用处理已使用 [Captions](https://github.com/Ztqing/obsidian-captions) 验证，但 Composer Enhanced 不依赖其类名或内部 API。两种正文宽度表格模式都会与普通段落左右边缘对齐，而不会占满整个 Markdown 窗格：固定模式让各列均分可用宽度，按内容分配模式使用浏览器的自动表格布局，让需要空间的列获得更大比例。表格内容过宽时在窄屏下使用一个独立的横向滚动区域。

所选代码块配色会同时应用于阅读视图、实时预览和源码模式。注释、关键字、运算符、字符串、值、类型、特性、标签和标点等稳定语法类别会在 Obsidian 的渲染 token 与编辑器 token 之间共用同一套语义配色。由于 Prism 与 CodeMirror 经常以不同方式分类函数、变量、属性和内置标识符，这些类别统一使用普通代码文本色。这样能保持笔记渲染轻量，并且不改变已渲染代码的结构，同时保留最有价值的语法高亮。不同视图仍使用不同的语法解析器，因此少见的语言专属 token 仍可能存在分类差异。

Components 集成已使用 Components `3.1.260817` 验证。学术三线表修复只作用于 AI 会话中的 Markdown 表格，不会改变 Components 的日历、数据库或其他表格界面。图标控制项只作用于空会话图标宿主，不会关闭 AI Chat、移除提示文字，也不依赖 Components 的内部 JavaScript API。Components 未安装或目标类名变化时，这些规则不会产生效果。

Callout 修复针对 Composer `0.7.0` 中的 RGB 颜色变量。Composer 上游发布修正后，关闭**启用 Composer 0.7.0 Callout 修复**即可移除兼容覆盖。本插件应与 Composer 一同启用，其他主题不属于受支持的外观目标。

## 开发与验证

```bash
npm ci
npm run dev
```

发布前依次运行：

```bash
npm run test:unit
npm run lint
npm run build
npm run release:check
```

发布资产为 `main.js`、`manifest.json` 和 `styles.css`。`main.js` 由本地或 CI 构建生成，不纳入 Git 跟踪。

## 致谢

Composer Enhanced 是独立的配套项目。感谢 [Composer](https://github.com/vran-dev/obsidian-composer) 提供本插件所扩展的主题，感谢 [Style Settings](https://github.com/obsidian-community/obsidian-style-settings) 为 Obsidian 提供可配置的 CSS 设置能力，并感谢 [One Dark Pro](https://github.com/Binaryify/OneDark-Pro) 提供可选代码配色。
