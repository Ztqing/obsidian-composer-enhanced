<div align="center">
  <h1>Composer Enhanced</h1>
  <p><strong>一个为 Composer 主题提供针对性修复、可选增强和样式改进的 Obsidian 配套插件。</strong></p>
  <p><a href="README.md">English</a> | 中文 | <a href="CHANGELOG.md">更新日志</a></p>
</div>

## 增强范围

Composer Enhanced 是为 [Composer 主题](https://github.com/vran-dev/obsidian-composer)设计的独立扩展层。它可以在不修改已安装主题文件的前提下，承载针对性的兼容性修复、图片对齐等可选功能、代码显示优化以及其他小型视觉改进。

当前 `0.0.1` 版本提供：

- 修复 Composer `0.7.0` 在 Obsidian `1.13.x` 中 Callout 颜色丢失的问题，覆盖 Composer 内置的 Callout 样式和配色方案。
- 分别控制阅读视图和实时预览中独占一行的图片与表格对齐方式；两者均可选择居中、靠左或靠右。
- 提供代码块主题选择；默认保留 Composer 当前外观，也可使用在阅读视图、实时预览和源码模式中保持一致的 One Dark Pro 配色。

这些增强只在插件作用域内生效，不会复制、修改或替换已安装的 Composer 主题。

## Style Settings 与行为

安装并启用 [Style Settings](https://github.com/obsidian-community/obsidian-style-settings) 后，其设置页面中会显示 **Composer Enhanced** 区域，其中包括：

- **启用 Composer 0.7.0 Callout 修复**：默认开启。使用 Composer `0.7.0` 时保持开启以恢复 Callout 颜色，Composer 上游修复问题后再将其关闭。
- **代码块主题**：选择 **Composer（默认）**可保留当前主题外观，也可选择 **One Dark Pro**，使用与 VS Code 主题一致的深色代码背景和语法配色。
- **块级图片对齐**和**表格对齐**：两个独立控制项，均提供**居中**、**靠左**和**靠右**选项，默认值均为**居中**。

Style Settings 是可选依赖。未安装时，代码块保留 Composer 外观，图片和表格仍默认居中，并启用 Callout 兼容修复。代码块主题仅作用于 fenced code block；内联代码、命令面板高亮以及围栏外的 HTML 源码仍保留 Composer 配色。插件的所有处理均在本地完成，也不会修改笔记源文件。

## 兼容性与限制

Composer Enhanced 当前面向 Composer `0.7.0`，并以 Obsidian `1.13.0` 作为兼容性基线。插件结构同时考虑桌面端和移动端，不使用 Electron、Node.js 或其他桌面专用运行时 API。

图片对齐只作用于独占一行的块级图片，行内图片仍保留在正文排版流中；笔记中已有的显式图片尺寸仍然有效。窄屏下的宽表格继续使用 Obsidian 原有的横向滚动行为。

所选代码块配色会同时应用于阅读视图、实时预览和源码模式。Composer Enhanced 会补齐 Obsidian 阅读视图高亮器未分类的标识符；由于渲染视图与编辑器使用不同的语法解析器，少见的语言专属 token 仍可能存在分类差异。

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
