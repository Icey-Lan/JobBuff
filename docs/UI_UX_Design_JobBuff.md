# UI/UX Design Requirements | JobBuff (职场外挂)

> **Design Philosophy**: "Gamified Utility"
> Inspired by [PostHog](https://posthog.com), the design should be **Bold, Retro-Tech, and Brutally Efficient**. It shouldn't look like a standard SaaS; it should feel like a piece of high-tech tactical gear or a game interface.

---

## 1. 🎨 Visual Identity (The "PostHog-ish" Vibe)

### 1.1 Color Palette (Retro-Tech)

High contrast, flat colors, dark outlines.

| Usage | Color Name | Hex Code | Description |
| :--- | :--- | :--- | :--- |
| **Primary Brand** | **Buff Orange** | `#FF9044` | Energetic, used for primary actions (Start Quest, Forge). |
| **Background** | **Paper Canvas** | `#F3F4EF` | Off-white, easier on eyes than pure white. Textureless paper feel. |
| **Surface** | **Card White** | `#FFFFFF` | For content containers. Always with a black border. |
| **Text/Borders** | **Ink Black** | `#1D1D1D` | Almost black. Used for all text, borders, and icons. |
| **Success** | **Loot Green** | `#04D361` | High readiness, safe zones, stats up. |
| **Danger** | **Trap Red** | `#F82B60` | Risk warnings, critical errors, stats down. |
| **Accent** | **Mana Blue** | `#3E7BFA` | Information, links, neutral tech vibes. |
| **Secondary** | **Pixel Gray** | `#E0E0E0` | Disabled states, subtle dividers. |

### 1.2 Typography

A mix of modern readability and retro-coding aesthetics.

* **Headings / UI Controls**: **Inter** (Bold, Tight tracking).
  * *Usage*: Buttons, Card Titles, Navigation.
* **Data / Code / JD Text**: **JetBrains Mono** or **Fira Code**.
  * *Usage*: The JD preview, JSON outputs, Stats numbers, Code-like annotations.
  * *Style*: Monospaced font gives it a "Terminal/Hacker" feel.

### 1.3 Shapes & Borders

* **Hyper-Defined Borders**: All containers (Cards, Inputs, Buttons) have a `2px solid #1D1D1D` border.
* **Sharp Corners**: `border-radius: 0px` or very small (`4px`). No soft, round "Web 2.0" corners.
* **Hard Shadows (The "Pop" Effect)**:
  * Elements do not have soft drop shadows.
  * Active elements have a solid, offset shadow (e.g., `box-shadow: 4px 4px 0px #1D1D1D`).
  * **Interaction**: On hover/active, the shadow collapses (`transform: translate(2px, 2px)`), making buttons feel mechanical and clicky.

---

## 2. 🧩 Component System (The "Equipment")

### 2.1 Buttons (Action Triggers)

* **Primary Button**:
  * Background: **Buff Orange** (`#FF9044`).
  * Text: **Ink Black**, Bold, Uppercase.
  * Border: `2px solid black`.
  * Shadow: `4px 4px 0px black`.
  * *Hover*: Background brightens, shadow remains.
  * *Active*: Shadow disappears, button moves down 4px.
* **Secondary Button**:
  * Background: **White**.
  * Border: `2px solid black`.
  * Shadow: `2px 2px 0px black`.
* **Ghost/Icon Button**:
  * No border until hover. Pixel-art icons preferred.

### 2.2 Indicators & Progress

* **Level Bars (Progress Bars)**:
  * Thick border container.
  * Fill is a striped pattern (CSS background-image) or solid vibrant color.
  * Looks like an HP/MP bar in an RPG.
* **Badges/Tags**:
  * Squared corners.
  * Pastel backgrounds with black borders.
  * Monospace text.

### 2.3 Cards (The Containers)

* **Standard Card**: White background, 2px black border.
* **"Glitch" Card (For Risks)**:
  * Slight CSS shake animation on hover.
  * Red dashed border.

---

## 3. 🖥️ Interface Layouts (The "Levels")

### Level 1: Quest Board (接取任务)

* **Concept**: A Bulletin Board in an Adventurer's Guild.
* **Layout**:
  * **Header**: "New Quest" in large pixel-art style text.
  * **Main Area**: A large "Form Card".
    * **Resume Slot**: A dashed drop-zone area. visually looks like a "Character Sheet" slot.
    * **JD Terminal**: A dark-mode textarea (Black bg, Green text) for pasting the JD. Keeps the "Hacker" vibe.
    * **Mission Goal**: Two inputs side-by-side for Role and Salary.
  * **Action**: A massive, screen-width "LAUNCH PROBE" button at the bottom.

### Level 2: Intel Scan (情报侦察)

* **Concept**: A Sci-Fi Tactical Hud.
* **Layout**:
  * **Top Bar**: Target Info (Company Name) pinned.
  * **Left Column (Radar)**:
    * Large hexagonal Radar Chart (ECharts).
    * Score displayed in a digital counter font (e.g., "78%").
  * **Right Column (Briefing)**:
    * **Risk Alerts**: Red cards with "Warning" icons.
    * **Core Objectives**: Checkbox-style list (even though they aren't interactive).
  * **Bottom Actions**:
    * "Abort" (Gray, small) vs "Craft Gear" (Orange, pulsing).

### Level 3: The Forge (装备锻造)

* **Concept**: Split-Screen Workflow.
* **Layout**:
  * **Split View (50/50)**.
  * **Left Panel (Blueprints)**:
    * AI Suggestions shown as "Upgrade Modules".
    * Each suggestion consists of "Current vs Recommended" diff view.
  * **Right Panel (The Artifact)**:
    * Live preview of the Resume (A4 ratio container).
    * Editable text areas highlighted on hover.
  * **Toolbar**: Floats in the center or top-right. "Export PDF" looks like a floppy disk or download icon.

### Level 4: The Trial (试炼挑战)

* **Concept**: Card Battle / Duel.
* **Layout**:
  * **Boss Cards**: The Interview Questions are presented as "Enemy Cards".
  * **Interaction**: Accordion style.
    * *Closed*: Shows the Question (The Attack).
    * *Open*: Shows the Input Box (Your Defense) and "AI Hint" button (Use Potion).
  * **Feedback**: After submission, the AI feedback stamps the card with a rating (e.g., "CRITICAL HIT" or "MISS").

### Level 5: Adventure Log (冒险日志)

* **Concept**: Retro Game Save Screen.
* **Layout**:
  * **Stats Grid**: 4 big blocky numbers (Total Quests, Win Rate).
  * **The List**:
    * Not a standard table.
    * A list of "Cartridges" or "Save Slots".
    * Each slot shows the Company Name, Date, and a visual Progress Bar (Intel -> Forge -> Trial).
  * **Empty State**: Pixel art illustration of an empty treasure chest.

---

## 4. 💫 Micro-Interactions

* **Loading State**:
  * Instead of a spinner, use a **Pixel Character running** or a **Terminal typing log** ("Analyzing risk vectors...", "Scanning keyword density...").
* **Success State**:
  * Confetti or Pixel coins particle effect when a task is finished.
* **Hover Effects**:
  * All interactive elements must provide immediate visual feedback (color shift, border thickness change, or displacement).

---

<br>
<br>

# 中文翻译 (Chinese Translation)

> **设计哲学**："游戏化实用主义" (Gamified Utility)
> 灵感致谢 [PostHog](https://posthog.com)，设计风格应为**大胆、复古科技风 (Retro-Tech)、且极致高效**。不应像普通的 SaaS 软件，而应像高科技战术装备或游戏界面。

---

## 1. 🎨 视觉识别 (PostHog 风格)

### 1.1 配色方案 (复古科技风)

高对比度，纯扁平色块，深色硬边。

| 用途 | 颜色命名 | Hex 色值 | 描述 |
| :--- | :--- | :--- | :--- |
| **品牌主色** | **Buff 橙** | `#FF9044` | 高能、活力，用于主要行动（开启任务、锻造）。 |
| **背景色** | **画布白** | `#F3F4EF` | 米白色/纸莎草白，比纯白更护眼，有纸质感。 |
| **表面色** | **卡片白** | `#FFFFFF` | 内容容器背景色，必须带黑色边框。 |
| **文字/边框** | **墨水黑** | `#1D1D1D` | 接近纯黑。用于所有文字、描边和图标。 |
| **成功/安全** | **战利品绿** | `#04D361` | 准备就绪、安全区域、能力值提升。 |
| **危险/警告** | **陷阱红** | `#F82B60` | 风险预警、致命错误、能力值下降。 |
| **强调色** | **魔法蓝** | `#3E7BFA` | 信息提示、链接、中性科技感。 |
| **辅助色** | **像素灰** | `#E0E0E0` | 禁用状态、低调的分隔线。 |

### 1.2 排版字体

兼顾现代可读性与复古代码审美。

* **标题 / UI 控件**: **Inter** (粗体，字间距紧凑)。
  * *用途*: 按钮、卡片标题、导航。
* **数据 / 代码 / JD原文**: **JetBrains Mono** 或 **Fira Code**。
  * *用途*: JD 预览、JSON 输出、统计数字、代码风格注释。
  * *风格*: 等宽字体，营造"终端/黑客"氛围。

### 1.3 形状与描边 (硬核风格)

* **超清晰描边**: 所有容器（卡片、输入框、按钮）必须有 `2px solid #1D1D1D` 边框。
* **尖锐直角**: `border-radius: 0px` 或极小 (`4px`)。拒绝圆润的 Web 2.0 风格。
* **硬阴影 ("Pop" 效果)**:
  * 元素不使用模糊阴影。
  * 可交互元素使用实心、偏移的阴影 (例如: `box-shadow: 4px 4px 0px #1D1D1D`)。
  * **交互**: 悬停/点击时，阴影收缩 (`transform: translate(2px, 2px)`), 让按钮有机械按压的段落感。

---

## 2. 🧩 组件系统 ("装备库")

### 2.1 按钮 (行动触发器)

* **主按钮 (Primary)**:
  * 背景: **Buff 橙** (`#FF9044`).
  * 文字: **墨水黑**, 粗体, 全大写.
  * 边框: `2px solid black`.
  * 阴影: `4px 4px 0px black`.
  * *悬停*: 背景变亮，阴影保持.
  * *按压*: 阴影消失，按钮整体下沉 4px.
* **次按钮 (Secondary)**:
  * 背景: **白色**.
  * 边框: `2px solid black`.
  * 阴影: `2px 2px 0px black`.
* **幽灵/图标按钮**:
  * 平时无边框，悬停时显示。图标优先使用像素风格。

### 2.2 指示器与进度

* **等级条 (进度条)**:
  * 厚边框容器。
  * 填充物使用条纹图案 (CSS background-image) 或高饱和度纯色。
  * 看起来像 RPG 里的 HP/MP 血条/蓝条。
* **徽章/标签 (Badges)**:
  * 直角矩形。
  * 淡粉彩背景 + 黑色边框。
  * 使用等宽字体。

### 2.3 卡片 (容器)

* **标准卡片**: 白底，2px 黑边。
* **"故障风"卡片 (风险提示用)**:
  * 悬停时有轻微 CSS 抖动动画。
  * 红色虚线边框。

---

## 3. 🖥️ 界面布局 ("关卡设计")

### 第 1 关: 任务板 (接取任务)

* **概念**: 冒险家公会的任务布告栏。
* **布局**:
  * **头部**: 大号像素风标题 "New Quest"。
  * **主区域**: 一个巨大的 "表单卡片"。
    * **简历槽位**: 虚线拖拽上传区，视觉上像"角色卡"的装备栏。
    * **JD 终端**: 深色模式文本域 (黑底绿字)，用于粘贴 JD，保留"黑客"极客感。
    * **任务目标**: 两个并排输入框，填写 岗位 和 薪资。
  * **行动**: 底部通过一个巨大的、全屏宽度的 "LAUNCH PROBE" (开启侦察) 按钮来触发。

### 第 2 关: 情报侦察 (Intel Scan)

* **概念**: 科幻战术 HUD (抬头显示器)。
* **布局**:
  * **顶栏**: 目标信息（公司名）吸顶固定。
  * **左栏 (雷达)**:
    * 巨大的六边形雷达图 (ECharts)。
    * 分数使用数字计数器字体显示 (例如 "78%")。
  * **右栏 (简报)**:
    * **风险警报**: 红色卡片 + 警告图标。
    * **核心目标**: 复选框列表样式 (即使此处不可交互)，便于快速扫视。
  * **底部行动**:
    * "放弃任务" (灰色，小) vs "锻造装备" (橙色，脉冲呼吸效果)。

### 第 3 关: 装备锻造 (The Forge)

* **概念**: 分屏工作台。
* **布局**:
  * **分屏视图 (50/50)**。
  * **左面板 (蓝图)**:
    * AI 建议以 "升级模组 (Upgrade Modules)" 形式展示。
    * 每条建议包含 "当前 vs 推荐" 的 diff 对比视图。
  * **右面板 (神器)**:
    * 简历的实时预览 (A4 比例容器)。
    * 可编辑文本区域在悬停时高亮。
  * **工具栏**: 悬浮在中间或右上角。"导出 PDF" 按钮做成 软盘 或 下载图标样式。

### 第 4 关: 试炼挑战 (The Trial)

* **概念**: 卡牌对战 / 决斗。
* **布局**:
  * **Boss 卡牌**: 面试题作为 "敌人卡牌" 呈现。
  * **交互**: 手风琴折叠样式。
    * *闭合*: 显示问题 (敌方攻击)。
    * *展开*: 显示输入框 (我方防御) 和 "AI 提示" 按钮 (使用药水)。
  * **即时反馈**: 提交后，AI 的评价像印章一样盖在卡片上 (例如 "CRITICAL HIT / 暴击" 或 "MISS / 偏离")。

### 第 5 关: 冒险日志 (Adventure Log)

* **概念**: 复古游戏存档界面。
* **布局**:
  * **统计网格**: 4 个巨大的方块数字 (总任务数，胜率等)。
  * **列表**:
    * 不是普通的表格。
    * 一列 "卡带" 或 "存档槽"。
    * 每个槽位显示 公司名, 日期, 和可视化的进度条 (侦察 -> 锻造 -> 试炼)。
  * **空状态**: 像素画绘制的空宝箱。

---

## 4. 💫 微交互 (Juice)

* **加载状态**:
  * 拒绝系统原生 Loading 圈。使用 **像素小人奔跑** 或 **终端打字机日志** ("Analyzing risk vectors...", "Scanning keyword density...")。
* **成功状态**:
  * 任务完成时触发 五彩纸屑 (Confetti) 或 像素金币粒子特效。
* **悬停效果**:
  * 所有可交互元素必须给与即时的视觉反馈 (颜色偏移、边框变粗、或位置位移)。

---
*Created by: Antigravity Agent*
*Date: 2026-01-20*
