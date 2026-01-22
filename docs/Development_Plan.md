# 开发计划 | JobBuff (职场外挂)

基于 **PRD v3.0** 和 **UI/UX 设计要求 (复古科技风)**。

---

## 1. 🏗️ 技术栈 (Tech Stack)

| 组件 | 技术选型 | 选择理由 |
| :--- | :--- | :--- |
| **框架** | **Next.js 14+ (App Router)** | 现代 React 应用的标准。易于部署到 Vercel。 |
| **语言** | **TypeScript** | 严格的数据结构定义（Job, Resume, Analysis Result）至关重要。 |
| **样式** | **Vanilla CSS (CSS Modules)** | **遵守系统规则**。允许对 "复古科技" 粗犷主义美学进行绝对控制，无需与框架覆盖样式作斗争。 |
| **状态管理** | **Zustand** | 轻量级全局状态，用于管理 "任务" 进度（向导步骤）。 |
| **AI (大模型)** | **Google Gemini Pro** | 具有长上下文窗口，适合分析长篇 JD 和简历。 |
| **数据库** | **Supabase** (PostgreSQL) | 存储用户数据、任务日志、JSON 结果。 |
| **认证** | **Supabase Auth** | 简单的魔术链接 / 社交登录。 |
| **PDF 生成** | **html2canvas / jspdf** | 客户端简历生成（MVP 阶段最简单方案）。 |
| **图表** | **ECharts** | 强大的雷达图，用于 "能力评估"。 |

---

## 2. 🗓️ 分阶段执行 (Milestones)

### 第一阶段：引擎 (基础建设)

**目标**：初始化项目并建立 "视觉语言"。

* [ ] 初始化 Next.js 项目 (`npm create next-app`)。
* [ ] 配置目录结构 (`/app`, `/components`, `/lib`, `/styles`)。
* [ ] **设计系统实现**：
  * 定义 CSS 变量 (`:root { --color-buff-orange: ... }`)。
  * 创建基础组件：`RetroButton` (复古按钮), `PixelCard` (像素卡片), `GlitchContainer` (故障风容器)。
* [ ] 全局布局： "游戏 HUD" (导航栏, 页脚, 背景纹理)。

### 第二阶段：核心玩法 (前端逻辑)

**目标**：一个可工作的 UI 流程 (仅 Mock 数据)。

* [ ] **第 1 关 (任务板)**：
  * 简历上传组件 (拖拽 UI)。
  * JD 输入终端 (带有语法高亮氛围的文本域)。
* [ ] **第 2 关 (情报侦察)**：
  * 雷达图组件集成。
  * 风险卡片展示逻辑。
* [ ] **第 3 关 (装备锻造)**：
  * 分屏布局实现。
  * 可编辑简历预览组件。
* [ ] **第 4 关 (试炼挑战)**：
  * 面试卡片 "手风琴" 交互逻辑。

### 第三阶段：人工智能 (大脑)

**目标**：将 UI 连接到真实数据。

* [ ] **后端 API 设置**：`/api/analyze-job`, `/api/generate-resume`。
* [ ] **Gemini 集成**：
  * Prompt 工程：“角色：基于 JD 的职业教练... 输出：JSON”。
  * 流式响应 (Streaming) (为了营造 "黑客终端" 数据加载的感觉)。
* [ ] **管道连接**：
  * 输入 -> Gemini -> JSON 结果 -> UI 状态。

### 第 4 阶段：持久化与打磨 (存档)

**目标**：用户账户和历史记录。

* [ ] **Supabase 集成**：
  * Schema 设计：`users`, `quests`, `resumes`。
  * 设置 Auth (登录/注册)。
* [ ] **冒险日志**：
  * 过往任务的数据可视化。
  * LocalStorage 同步 (针对访客用户)。
* [ ] **性能打磨**：
  * 交互动画 (CSS Transitions)。
  * 移动端响应式检查。

---

## 3. 📂 项目结构 (建议)

```
JobBuff/
├── frontend/ (Next.js App)
│   ├── app/
│   │   ├── layout.tsx         # 全局 HUD
│   │   ├── page.tsx           # 仪表盘 / 任务板
│   │   ├── quest/
│   │   │   ├── [id]/          # 特定岗位分析的动态路由
│   │   │     ├── page.tsx     # 主视图控制器
│   │   │     └── layout.tsx
│   │   └── login/
│   ├── components/
│   │   ├── ui/                # RetroButton, PixelCard (笨组件)
│   │   ├── features/          # RadarChart, ResumeEditor (智能组件)
│   │   └── shared/            # Navbar, Footer
│   ├── lib/
│   │   ├── ai/                # prompts.ts, gemini.ts
│   │   └── types/             # 接口定义 (interfaces)
│   ├── public/                # 资源 (像素图标)
│   └── styles/
│       ├── globals.css        # CSS 变量 & Reset
│       └── retro.module.css   # 可复用的复古工具类
├── backend/ (Supabase / Edge Functions)
│   ├── functions/             # Serverless 后端逻辑
│   │   ├── analyze-job/       # 招聘信息分析
│   │   └── generate-resume/   # 简历生成
│   └── database/              # SQL 迁移文件
```

---

## 4. ⚠️ 关键风险与缓解

1. **风险**：LLM 延迟 (分析长 JD 需要时间)。
    * **缓解**：实现 **流式 UI (Streaming UI)**。显示 "终端日志" 随数据滚动，让用户感觉 "黑客入侵正在进行中" 而不是干等。
2. **风险**：简历排版 (HTML 转 PDF 很难)。
    * **缓解**：对于 MVP，限制 "定制简历" 为严格、干净的模板，我们使用 CSS Grid 100% 控制，使 PDF 生成可预测。
3. **风险**：Token 成本。
    * **缓解**：使用 Gemini Flash 进行初步的大范围扫描 (第 2 关)，仅在繁重的简历重写 (第 3 关) 时使用 Pro 模型。

---
*Created by: Antigravity Agent*
