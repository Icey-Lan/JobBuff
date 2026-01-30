// Landing page translations - Chinese and English
export const translations = {
    zh: {
        // Hero
        hero: {
            badge: 'BETA v0.1.0',
            title: '你的求职',
            titleHighlight: '外挂',
            titleEnd: '已上线',
            slogan: '读得透、改得快、记得住',
            subtitle: '一站式 AI 求职助手 —— 深度解读岗位信息，智能优化简历，模拟真实面试，以"打怪升级"的轻松心态消解求职内耗',
            ctaPrimary: '开启新任务',
            ctaSecondary: '查看冒险日志',
        },
        // Pain Points
        painPoints: {
            title: '求职路上的三大难题',
            items: [
                {
                    icon: '😩',
                    title: '招聘信息看不懂',
                    desc: '专业术语太多，潜台词难理解，不知道公司真正想要什么',
                    solution: 'AI 帮你一键解读真实需求',
                },
                {
                    icon: '😰',
                    title: '改简历太费劲',
                    desc: '不知道该突出什么，每次都要从头改，容易遗漏关键点',
                    solution: 'AI 逐句帮你优化，改动清晰可见',
                },
                {
                    icon: '😱',
                    title: '面试全靠临场',
                    desc: '不知道会问什么，缺乏针对性准备，发挥不稳定',
                    solution: '模拟真实面试题 + AI 实时点评',
                },
            ],
        },
        // Features
        features: {
            title: '三大核心功能',
            items: [
                {
                    icon: '📡',
                    title: '读懂招聘要求',
                    subtitle: '情报侦察',
                    desc: '粘贴招聘信息，AI 帮你解读真实需求，识别隐藏的"坑"，用图表展示你和岗位的匹配程度',
                    tags: ['风险识别', '匹配度分析', '能力雷达图'],
                },
                {
                    icon: '🔨',
                    title: '定制专属简历',
                    subtitle: '装备锻造',
                    desc: 'AI 帮你重写简历，逐句对比修改前后的变化，每处改动都可单独接受或拒绝',
                    tags: ['智能重写', '逐句对比', '一键导出'],
                },
                {
                    icon: '⚔️',
                    title: '模拟真实面试',
                    subtitle: '试炼挑战',
                    desc: 'AI 帮你准备面试题、投递策略和专属打招呼语，助你全方位备战',
                    tags: ['针对性题目', 'AI 点评', '投递攻略', '智能打招呼'],
                },
            ],
        },
        // How It Works
        howItWorks: {
            title: '简单四步，开启求职新体验',
            steps: [
                { icon: '📋', title: '粘贴招聘信息', desc: '复制任意招聘网站的职位描述' },
                { icon: '📄', title: '上传你的简历', desc: '支持 PDF、Word、Markdown 格式' },
                { icon: '🚀', title: 'AI 深度分析', desc: '10秒生成完整分析报告' },
                { icon: '🎯', title: '优化并投递', desc: '根据建议修改简历，准备面试' },
            ],
        },
        // Stats
        stats: {
            items: [
                { value: '15', unit: '秒', label: '单次分析耗时' },
                { value: '5', unit: '维', label: '能力评估维度' },
                { value: '10', unit: '次', label: '免费分析额度' },
                { value: '∞', unit: '', label: '历史记录保存' },
            ],
        },
        // FAQ
        faq: {
            title: '常见问题',
            showMore: '查看更多问题',
            showLess: '收起',
            items: [
                {
                    q: 'JobBuff 是什么？',
                    a: 'JobBuff 是一款 AI 求职助手，帮你快速读懂招聘信息、优化简历、模拟面试。就像游戏里的"外挂"，让你的求职之路更轻松。',
                },
                {
                    q: '这个工具是免费的吗？',
                    a: '新用户可获得 10 次免费分析。在同一个任务中，后续的简历优化和模拟面试不额外收费，可以无限次使用。',
                },
                {
                    q: '我的简历和数据安全吗？',
                    a: '绝对安全。你的数据只用于本次分析，不会用于 AI 模型训练，也不会分享给任何第三方。',
                },
                {
                    q: '一次分析需要多长时间？',
                    a: '通常在 10-15 秒内完成招聘信息的深度分析，包括风险识别和匹配度评估。',
                },
                {
                    q: '支持什么格式的简历？',
                    a: '支持 PDF、Word (.docx)、Markdown 格式，文件大小上限 10MB。',
                },
                {
                    q: '简历优化和模拟面试会消耗配额吗？',
                    a: '不会。配额仅在新任务分析时扣减，同一任务的后续功能（简历优化、模拟面试）完全免费。',
                },
                {
                    q: '使用的是什么 AI 模型？',
                    a: '我们使用 Google Gemini 3.0 Flash 模型，这是目前最先进的 AI 模型之一，能提供快速且高质量的分析。',
                },
                {
                    q: '我的历史分析记录会保存多久？',
                    a: '所有历史任务永久保存在云端，你可以随时在「冒险日志」中查看过往的所有分析结果。',
                },
                {
                    q: '支持哪些浏览器？',
                    a: '支持 Chrome 80+、Edge、Safari 等主流桌面浏览器，暂不支持移动端浏览器。',
                },
                {
                    q: '如何获得更多分析配额？',
                    a: 'Pro 会员计划即将推出，届时将提供无限分析配额和更多高级功能。',
                },
                {
                    q: '忘记密码怎么办？',
                    a: '在登录页面点击「忘记密码」，输入注册邮箱即可收到密码重置链接。',
                },
                {
                    q: '这个工具适合谁用？',
                    a: '适合正在求职的应届生、想要转行的职场人、以及所有希望提高求职效率和面试成功率的人。',
                },
            ],
        },
        // CTA
        cta: {
            title: '准备好开启你的求职冒险了吗？',
            button: '免费注册，开启第一个任务',
            benefits: ['免费注册', '无需信用卡', '10次免费体验'],
            github: '在 GitHub 查看源码',
        },
        // Language toggle
        langToggle: {
            zh: '中文',
            en: 'EN',
        },
    },
    en: {
        // Hero
        hero: {
            badge: 'BETA v0.1.0',
            title: 'Your Job Hunt',
            titleHighlight: 'Cheat Code',
            titleEnd: 'is Live',
            slogan: 'Read Deep, Revise Fast, Remember All',
            subtitle: 'All-in-one AI job hunting assistant — Decode job postings in 10 seconds, optimize your resume, and practice interviews',
            ctaPrimary: 'Start New Quest',
            ctaSecondary: 'View Adventure Log',
        },
        // Pain Points
        painPoints: {
            title: 'Three Biggest Job Hunting Challenges',
            items: [
                {
                    icon: '😩',
                    title: 'Job Postings Are Confusing',
                    desc: 'Too much jargon, hidden meanings, unclear what companies really want',
                    solution: 'AI decodes the real requirements for you',
                },
                {
                    icon: '😰',
                    title: 'Resume Editing is Exhausting',
                    desc: "Don't know what to highlight, starting from scratch every time",
                    solution: 'AI optimizes sentence by sentence, changes clearly visible',
                },
                {
                    icon: '😱',
                    title: 'Interviews Rely on Luck',
                    desc: "Don't know what to expect, lack of targeted preparation",
                    solution: 'Tailored mock questions + Real-time AI feedback',
                },
            ],
        },
        // Features
        features: {
            title: 'Three Core Features',
            items: [
                {
                    icon: '📡',
                    title: 'Decode Job Postings',
                    subtitle: 'Intel Scan',
                    desc: 'Paste any job posting, and AI will decode the real requirements, spot hidden red flags, and show how well you match',
                    tags: ['Risk Detection', 'Match Analysis', 'Skill Radar'],
                },
                {
                    icon: '🔨',
                    title: 'Craft Your Resume',
                    subtitle: 'The Forge',
                    desc: 'AI rewrites your resume with side-by-side comparison. Accept or reject each change individually',
                    tags: ['Smart Rewrite', 'Line-by-Line Diff', 'One-Click Export'],
                },
                {
                    icon: '⚔️',
                    title: 'Practice Interviews',
                    subtitle: 'The Trial',
                    desc: 'AI prepares interview questions, application strategy, and personalized greeting messages to help you prepare fully',
                    tags: ['Targeted Questions', 'AI Feedback', 'Application Strategy', 'Smart Greeting'],
                },
            ],
        },
        // How It Works
        howItWorks: {
            title: 'Four Simple Steps to Get Started',
            steps: [
                { icon: '📋', title: 'Paste Job Posting', desc: 'Copy from any job site' },
                { icon: '📄', title: 'Upload Resume', desc: 'PDF, Word, or Markdown' },
                { icon: '🚀', title: 'AI Analysis', desc: 'Full report in 10 seconds' },
                { icon: '🎯', title: 'Optimize & Apply', desc: 'Refine resume, prep for interview' },
            ],
        },
        // Stats
        stats: {
            items: [
                { value: '15', unit: 's', label: 'Analysis Time' },
                { value: '5', unit: 'D', label: 'Skill Dimensions' },
                { value: '10', unit: 'x', label: 'Free Analyses' },
                { value: '∞', unit: '', label: 'History Storage' },
            ],
        },
        // FAQ
        faq: {
            title: 'Frequently Asked Questions',
            showMore: 'Show More Questions',
            showLess: 'Show Less',
            items: [
                {
                    q: 'What is JobBuff?',
                    a: 'JobBuff is an AI job hunting assistant that helps you quickly decode job postings, optimize resumes, and practice interviews. Like a "cheat code" for your job hunt.',
                },
                {
                    q: 'Is this tool free?',
                    a: 'New users get 10 free analyses. Resume optimization and mock interviews within the same task are completely free and unlimited.',
                },
                {
                    q: 'Is my resume and data safe?',
                    a: 'Absolutely. Your data is only used for this analysis and is never used for AI training or shared with any third parties.',
                },
                {
                    q: 'How long does one analysis take?',
                    a: 'Usually 10-15 seconds for deep analysis, including risk detection and match evaluation.',
                },
                {
                    q: 'What resume formats are supported?',
                    a: 'PDF, Word (.docx), and Markdown formats are supported. Maximum file size is 10MB.',
                },
                {
                    q: 'Do resume optimization and mock interviews cost credits?',
                    a: 'No. Credits are only deducted for new task analyses. Subsequent features within the same task are completely free.',
                },
                {
                    q: 'What AI model is used?',
                    a: 'We use Google Gemini 3.0 Flash, one of the most advanced AI models, providing fast and high-quality analysis.',
                },
                {
                    q: 'How long is my analysis history stored?',
                    a: 'All history is permanently stored in the cloud. You can view past analyses anytime in the Adventure Log.',
                },
                {
                    q: 'What browsers are supported?',
                    a: 'Chrome 80+, Edge, and Safari on desktop. Mobile browsers are not yet supported.',
                },
                {
                    q: 'How can I get more analysis credits?',
                    a: 'Pro membership is coming soon with unlimited analyses and more premium features.',
                },
                {
                    q: 'What if I forget my password?',
                    a: 'Click "Forgot Password" on the login page and enter your email to receive a reset link.',
                },
                {
                    q: 'Who is this tool for?',
                    a: 'Perfect for fresh graduates, career changers, and anyone who wants to improve their job hunting efficiency and interview success rate.',
                },
            ],
        },
        // CTA
        cta: {
            title: 'Ready to Start Your Job Hunting Adventure?',
            button: 'Sign Up Free to Start Your First Quest',
            benefits: ['Free to sign up', 'No credit card', '10 free trials'],
            github: 'View Source on GitHub',
        },
        // Language toggle
        langToggle: {
            zh: '中文',
            en: 'EN',
        },
    },
};

export type Language = 'zh' | 'en';
export type Translations = typeof translations.zh;
