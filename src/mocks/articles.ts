import type { Article, Company } from '@/types'

/**
 * 文章本地 mock 数据（P1 前端先行）
 * - 内容与原型 docs/frontend/prototypes/article-detail.html 保持一致
 * - P2/P3 后端 article 表就绪后，由 src/api/article.ts 替换本模块，组件无需改动
 * - body 为预渲染 HTML（后端就绪后改为 Markdown + 前端渲染）
 */

/* ================= 心得（8 篇 · 三栏目） ================= */
export const NOTES: Article[] = [
  {
    id: 1,
    type: 'note',
    topic: 'learn',
    sub: '学习方法',
    title: '从「会用工具」到「会拆问题」',
    summary: '刚开始我以为会写组件就是前端，后来才发现，真正难的是把一句模糊的需求拆成可执行的步骤。',
    tags: ['学习方法', '复盘'],
    date: '2026-10-18',
    read: '6 分钟',
    status: 'PUBLISHED',
    body: `
<p>刚开始学前端时，我判断自己进步的标准很朴素：能不能把设计稿还原出来。后来发现，这只是一个执行动作，真正决定效率的是「拆问题」的能力。</p>
<p>一个模糊的需求，比如「这个页面看起来不够高级」，如果直接打开编辑器调颜色，大概率会返工。正确的做法是先把它拆成几个可验证的问题：是层级不清？留白不足？还是字号对比不够？</p>
<h3>我现在的拆解顺序</h3>
<p>先问目标：这个页面要让人做什么。再看信息：哪些是必须第一眼看到的。最后才动样式：用字号、间距、颜色把层级做出来。</p>
<blockquote>会写代码只是门票，能把一句话翻译成一组可执行步骤，才是真正开始做工程。</blockquote>
<p>这个习惯也迁移到了面试和实习里。面试时先复述问题、确认边界；实习时先对齐目标、再动手实现。看起来慢，实际上少返工。</p>`,
  },
  {
    id: 2,
    type: 'note',
    topic: 'proj',
    sub: '项目实战',
    title: '前端初学者的三次返工',
    summary: '第一次返工是样式，第二次是数据，第三次是认知。三次之后，我才开始写「能改的代码」。',
    tags: ['前端', '复盘'],
    date: '2026-09-27',
    read: '8 分钟',
    status: 'PUBLISHED',
    body: `
<p>第一次返工是样式：我照着设计稿把每个元素都摆上去，却忽略了响应式，窗口一变窄就全乱了。</p>
<p>第二次返工是数据：接口字段变了，页面到处是 undefined。那次之后我学会了先写类型、再写渲染。</p>
<p>第三次返工是认知：我以为「能跑」就是完成，直到别人接手我的代码，改了三天才加上一个按钮。</p>
<h3>返工换来的三条规则</h3>
<p>一，布局先定容器和断点，再填内容；二，接口先定类型和空值策略，再写组件；三，代码先考虑别人怎么改，再考虑自己怎么写。</p>
<blockquote>返工不是失败，是花时间把「我以为」换成「确认过」。</blockquote>`,
  },
  {
    id: 3,
    type: 'note',
    topic: 'proj',
    sub: '项目实战',
    title: '为什么我不再迷信组件库',
    summary: '组件库解决了「长得像」，但解决不了「为什么这样排」。设计系统是约束，不是答案。',
    tags: ['前端', '设计'],
    date: '2026-09-05',
    read: '5 分钟',
    status: 'PUBLISHED',
    body: `
<p>组件库能很快把页面搭出来，但它只解决「长得像」，不解决「为什么这样排」。</p>
<p>用久了会发现，很多页面看起来像同一个模板：卡片、阴影、圆角、按钮，全都对，但没有任何记忆点。</p>
<h3>组件库是约束，不是答案</h3>
<p>好的用法是先明确页面要传达什么，再决定哪些地方必须自定义。比如这个博客的首页，我希望它有「翻实体卡片」的感觉，就不能直接套默认卡片。</p>
<blockquote>先有设计意图，再选工具。反过来，工具就会替你做决定。</blockquote>`,
  },
  {
    id: 4,
    type: 'note',
    topic: 'learn',
    sub: '学习方法',
    title: '把笔记写成别人能看懂的样子',
    summary: '写给自己看的笔记会偷懒，写给别人看的笔记才逼着你把逻辑补全。',
    tags: ['学习方法'],
    date: '2026-08-16',
    read: '4 分钟',
    status: 'PUBLISHED',
    body: `
<p>写给自己看的笔记会偷懒：只记结论，不记推导。隔两个月回看，连自己都看不懂。</p>
<p>后来我强迫自己按「别人能看懂」的标准写：背景是什么、卡在哪里、最后怎么解决的。写的过程中经常发现原来的理解有漏洞。</p>
<blockquote>写作是最好的 debug：表达不出来的地方，就是没想明白的地方。</blockquote>`,
  },
  {
    id: 5,
    type: 'note',
    topic: 'learn',
    sub: '学习方法',
    title: '一次失败的技术分享',
    summary: '我讲了二十分钟实现细节，却没人知道这东西解决了什么问题。分享应该从问题开始。',
    tags: ['复盘'],
    date: '2026-07-29',
    read: '7 分钟',
    status: 'PUBLISHED',
    body: `
<p>我在班里做过一次分享，讲了二十分钟实现细节——组件怎么拆、状态怎么管。讲完提问环节，第一个问题是：「所以这个东西解决了什么问题？」</p>
<h3>错在哪</h3>
<p>我从「我做了什么」讲起，而不是从「听众有什么痛点」讲起。实现细节只对已经理解问题的人有价值。</p>
<blockquote>分享的结构应该是：问题 → 为什么难 → 我的解法 → 代价。实现细节放最后，甚至可以不讲。</blockquote>`,
  },
  {
    id: 6,
    type: 'note',
    topic: 'learn',
    sub: '学习方法',
    title: '关于「学得快」这件事',
    summary: '快不是因为看得多，而是因为每次只解决一个具体问题，然后把过程留下来。',
    tags: ['学习方法'],
    date: '2026-07-02',
    read: '5 分钟',
    status: 'PUBLISHED',
    body: `
<p>常有人说我学得快。其实我只是在每次学习时做对了三件小事。</p>
<h3>三件小事</h3>
<p><b>只解决一个具体问题：</b>不「学 Vue」，而是「让这个列表能筛选」。<br>
<b>立刻产出可见结果：</b>跑起来、截图、写两句记录。<br>
<b>留下过程：</b>下次遇到类似问题，直接翻记录。</p>
<blockquote>快不是天赋，是每次都把「学」变成「用+记」。</blockquote>`,
  },
  {
    id: 7,
    type: 'note',
    topic: 'ai',
    sub: 'AI 使用',
    title: '用 AI 做出第一版之后，我改了什么',
    summary: 'AI 给的 80 分页面只能当草稿：留白、层级和「像不像人做的」，都是我手动改出来的。',
    tags: ['AI', '设计'],
    date: '2026-10-05',
    read: '5 分钟',
    status: 'PUBLISHED',
    body: `
<p>这个博客的首页就是用提示词生成出来的。第一版拿到手大概 80 分：布局对、配色对，但说不出哪里「不像人做的」。</p>
<h3>我手动改了三类东西</h3>
<p><b>留白节奏：</b>AI 喜欢把间距做成一致的，人做的页面间距有松紧——标题上方比正文之间宽一档。<br>
<b>层级对比：</b>把三个同样重的元素砍成一个主角、两个配角。<br>
<b>细节统一：</b>圆角、阴影、行高收进一套数值，而不是各用各的。</p>
<blockquote>AI 负责快速到达 80 分，最后 20 分的判断力仍然是人的价值。</blockquote>`,
  },
  {
    id: 8,
    type: 'note',
    topic: 'ai',
    sub: 'AI 使用',
    title: '提示词不是咒语，是需求文档',
    summary: '把「帮我做个好看的页面」换成目标、约束和反例之后，AI 的输出突然就稳定了。',
    tags: ['AI', '提示词'],
    date: '2026-10-30',
    read: '6 分钟',
    status: 'DRAFT',
    body: `
<p>一开始我写提示词像念咒语：「帮我做一个高级感的页面」。结果每次生成的方向都不一样。</p>
<h3>后来我改成了写需求文档</h3>
<p><b>目标：</b>这个页面要让人做什么。<b>约束：</b>用什么色、什么字体、什么布局结构。<b>反例：</b>「不要居中构图」「不要渐变按钮」——反例往往比正面描述更管用。</p>
<p>本站的提示词库就是这个方法的产物：每条提示词都带目标、约束和反例，复制出去就能稳定复现。</p>
<blockquote>提示词的稳定性不来自措辞技巧，来自需求写得有多清楚。</blockquote>`,
  },
]

/* ================= 实习（5 篇 · 按公司分组） ================= */
export const INTERNSHIPS: Article[] = [
  {
    id: 1,
    type: 'internship',
    topic: '',
    sub: '某创业公司',
    company: 'startup',
    title: '入职第一周：先读懂项目，再写第一行代码',
    summary: '花三天把目录、路由、接口封装和部署流程摸清，比急着提交第一行代码更有价值。',
    tags: ['上手', '全栈'],
    date: '2026-03',
    read: '5 分钟',
    status: 'PUBLISHED',
    body: `
<p>创业公司的实习没有缓冲期，但我的第一周几乎没有提交代码，而是花三天读项目：目录结构、路由、接口封装、部署流程。</p>
<h3>为什么先读再写</h3>
<p>急着提交一个「新功能」，大概率会破坏别人约定好的模式。先模仿现有写法，等熟悉了再谈创新，是实习里性价比最高的策略。</p>
<p>第四天我提交了第一个小改动：一个空态文案。就这么小的事，也完整走了「分支 → review → 合并 → 部署」的流程。</p>
<blockquote>实习教我的第一件事：先看别人怎么做，再动手。</blockquote>`,
  },
  {
    id: 2,
    type: 'internship',
    topic: '',
    sub: '某创业公司',
    company: 'startup',
    title: '一次部署翻车：被 rm -rf 掉的 dist 目录',
    summary: '删目录重建后容器还指着旧的 inode，站点整体 403。部署脚本比功能代码更值得认真写。',
    tags: ['Docker', '部署'],
    date: '2026-04',
    read: '4 分钟',
    status: 'PUBLISHED',
    body: `
<p>一次前端发布，我按直觉执行了「删除 dist 目录再重建」，结果站点直接 403。</p>
<h3>发生了什么</h3>
<p>web 容器对 dist 目录是只读挂载，启动时已经持有了旧目录的 inode。删除重建后，容器里挂的还是那个已被删除的空目录——文件明明上传了，容器里却看不见。</p>
<div class="code">find /opt/app/frontend/dist -mindepth 1 -delete   # 清空内容，保留目录本身</div>
<p>正确做法是清空目录内容而不是删除目录；如果已经删了，重启容器让它重新挂载即可恢复。</p>
<blockquote>那次之后我记住了：部署脚本比功能代码更值得认真写。</blockquote>`,
  },
  {
    id: 3,
    type: 'internship',
    topic: '',
    sub: '某大厂',
    company: 'big',
    title: '进入大厂：第一次独立负责一个页面',
    summary: '从设计稿还原到数据联调，返工三次，最后学会的是先画状态图再写组件。',
    tags: ['Vue 3', '组件化'],
    date: '2026-06',
    read: '6 分钟',
    status: 'PUBLISHED',
    body: `
<p>换了家公司继续实习。这里节奏更快、分工更细，我第一次完整负责一个页面：从设计稿还原到数据联调。</p>
<h3>三个阶段</h3>
<p><b>入职：</b>先读懂别人怎么写，再模仿着写。<br>
<b>上手：</b>接了第一个完整需求，返工三次，学会先画状态图再写组件。<br>
<b>独立：</b>可以自己推进需求，但每次上线前仍会找人 review。</p>
<p>我以为难点是还原设计稿，真正花时间的其实是对齐需求：状态有哪些、空态怎么处理、接口失败怎么办。</p>
<blockquote>不要用「我觉得」去替代「我确认过」。</blockquote>`,
  },
  {
    id: 4,
    type: 'internship',
    topic: '',
    sub: '某大厂',
    company: 'big',
    title: '联调三次返工：接口失败策略',
    summary: '超时怎么办、重试几次、空态给什么——这三个问题没提前对齐，就是三次返工。',
    tags: ['联调', '复盘'],
    date: '2026-08',
    read: '5 分钟',
    status: 'PUBLISHED',
    body: `
<p>一个列表页联调，我返工了三次，原因都一样：接口失败策略没提前对齐。</p>
<h3>三次返工的坑</h3>
<p>第一次：接口 500 时页面白屏——没写失败分支。第二次：超时没有提示，用户以为卡死。第三次：重试逻辑写死在组件里，换一个页面又不能用。</p>
<h3>后来我固定先问三个问题</h3>
<p>失败时展示什么（兜底 UI）？超时多久、重试几次？空态和失败态是不是同一种展示？这三个答案写进联调文档，之后再没返工过。</p>
<blockquote>联调的本质不是调接口，是对齐所有非正常路径。</blockquote>`,
  },
  {
    id: 5,
    type: 'internship',
    topic: '',
    sub: '阶段总结',
    company: 'summary',
    title: '实习结束：带走的三条经验',
    summary: '先对齐目标、留好退路、把过程写下来。技术会过时，这三条不会。',
    tags: ['总结'],
    date: '2026-09',
    read: '4 分钟',
    status: 'DRAFT',
    body: `
<p>两段实习结束，技术上的收获当然有，但更值钱的是三条和代码无关的经验。</p>
<h3>三条经验</h3>
<p><b>先对齐目标：</b>动手之前确认「这件事要达成什么」，能砍掉一半的无效工作。<br>
<b>留好退路：</b>上线方案永远准备一个回滚手段，心里才不慌。<br>
<b>把过程写下来：</b>踩过的坑写成文章，下一个项目直接复用——这个博客就是这么来的。</p>
<blockquote>技术会过时，这三条不会。</blockquote>`,
  },
]

/** 实习两级时间线第一级：公司别名（脱敏），顺序即横向时间线顺序 */
export const INTERNSHIP_COMPANIES: Company[] = [
  { key: 'startup', name: '某创业公司', meta: '2026.03 — 2026.05 · 全栈' },
  { key: 'big', name: '某大厂', meta: '2026.06 — 2026.09 · 前端' },
  { key: 'summary', name: '阶段总结', meta: '2026-09 · 两段收官', milestone: true },
]

/* ================= 面试（10 篇 · 三栏目） ================= */
export const INTERVIEWS: Article[] = [
  {
    id: 1,
    type: 'interview',
    topic: 'exp',
    sub: '面经分享',
    title: '某大厂 2026 秋招 · 前端一面面经（附逐题解读）',
    summary: '手写并发调度器没答好。逐题还原现场，附我的复盘框架：结论 → 原因 → 例子。',
    tags: ['八股', '手写题'],
    date: '2026-09-22',
    read: '一面 60min',
    result: '未通过',
    resultClass: 'fail',
    status: 'PUBLISHED',
    body: `
<p>开场十分钟自我介绍，然后直接进入手写题：实现一个带并发限制的调度器。</p>
<h3>题目回顾</h3>
<div class="qa"><div class="q">Q1：事件循环的输出顺序</div><div class="a">setTimeout / Promise / async 混排。我答对了宏任务与微任务的顺序，但漏掉了 await 之后的执行时机。</div></div>
<div class="qa"><div class="q">Q2：手写并发调度器</div><div class="a">思路对了，但任务失败后队列没有继续推进。面试官提示后我才补上。</div></div>
<div class="qa"><div class="q">Q3：为什么选择前端</div><div class="a">答得很散。复盘时发现不是没有理由，而是没准备过结构化的表达。</div></div>
<h3>我的复盘框架</h3>
<p>每道题按「结论 → 原因 → 例子」三段式重答一遍，录音自听。下次遇到开放题，先用十秒组织结构再开口。</p>
<blockquote>面试考的不只是会不会，还有能不能在压力下把会的讲清楚。</blockquote>`,
  },
  {
    id: 2,
    type: 'interview',
    topic: 'exp',
    sub: '面经分享',
    title: '某独角兽 · 二面面经：项目深挖三层',
    summary: '没有八股，全程追问「为什么这么设计」。「流量翻十倍哪里先崩」答得最稳。',
    tags: ['项目深挖', '系统设计'],
    date: '2026-09-18',
    read: '二面 45min',
    result: '通过',
    resultClass: 'ok',
    status: 'PUBLISHED',
    body: `
<p>二面没有八股，全程围绕项目深挖三层：为什么这么设计、换个场景还成立吗、出问题怎么兜底。</p>
<h3>题目回顾</h3>
<div class="qa"><div class="q">Q1：介绍最有成就感的项目</div><div class="a">我讲了提示词库的 HTML 实时预览，重点说清楚「为什么用 iframe + srcdoc」而不是截图。</div></div>
<div class="qa"><div class="q">Q2：如果流量翻十倍，哪里会先崩</div><div class="a">从数据库连接、图片存储、接口缓存三个层面回答，并给出先做只读缓存的方案。</div></div>
<div class="qa"><div class="q">Q3：和产品意见不一致怎么办</div><div class="a">先确认目标，再给两个成本不同的方案让对方选择，而不是直接说「做不了」。</div></div>
<h3>解读</h3>
<p>能通过的原因是项目是我真正做过、踩过坑的，细节经得起追问。包装出来的项目，第二层就会露馅。</p>`,
  },
  {
    id: 3,
    type: 'interview',
    topic: 'exp',
    sub: '面经分享',
    title: '某外企 · 终面：英文行为面实录',
    summary: '技术部分没问题，卡在「为什么选择我们」。附英文问答准备清单。',
    tags: ['英文面', '行为面'],
    date: '2026-09-10',
    read: '终面 40min',
    result: '待定',
    resultClass: 'warn',
    status: 'DRAFT',
    body: `
<p>全程英文：十分钟左右项目，剩下全是行为面（behavioral questions）。</p>
<h3>被问到的题</h3>
<div class="qa"><div class="q">Tell me about a time you failed.</div><div class="a">讲了部署翻车那次：做了什么、怎么补救、之后建立了什么检查清单。</div></div>
<div class="qa"><div class="q">Why us?</div><div class="a">这题答得最虚，只说了产品方向，没有具体到团队在做的事。</div></div>
<h3>英文问答准备清单</h3>
<p>准备 5 个 STAR 故事（失败 / 冲突 / 主导 / 学习 / 交付），每个 90 秒；「Why us」必须落到对方的具体产品或技术博客上；语速放慢比用词高级更重要。</p>`,
  },
  {
    id: 4,
    type: 'interview',
    topic: 'exp',
    sub: '面经分享',
    title: '某创业公司 · 技术面：现场拆一个真实需求',
    summary: '不考八股，直接给真实需求现场拆解。第一次遇到这种形式，反而答得最舒服。',
    tags: ['需求拆解'],
    date: '2026-08-30',
    read: '技术面 50min',
    result: '通过',
    resultClass: 'ok',
    status: 'PUBLISHED',
    body: `
<p>没有八股，没有算法题。面试官打开他们真实的产品，给了一个需求：「给这个列表页加一个筛选，数据量大时也不能卡」。</p>
<h3>我当时的拆法</h3>
<p>先问目标：筛选是给谁用的、最高频的筛选维度是什么。再看数据量：万级还是十万级，决定前端过滤还是后端过滤。最后给两套方案：前端内存过滤（简单、够用）和后端分页过滤（可扩展），并说明切换的阈值。</p>
<blockquote>现场拆需求考察的不是答案，而是你有没有先问「为什么」。</blockquote>`,
  },
  {
    id: 5,
    type: 'interview',
    topic: 'bigu',
    sub: '八股考题',
    title: '事件循环高频 12 问',
    summary: '宏任务与微任务的执行顺序、await 之后的时机、浏览器与 Node 的差异。',
    tags: ['事件循环', '异步'],
    date: '2026-09-05',
    read: '12 问',
    result: '高频',
    resultClass: 'warn',
    status: 'PUBLISHED',
    body: `
<p>事件循环几乎每场必考。这里按「从答对到答好」整理成 12 问，只记要点。</p>
<div class="qa"><div class="q">1-3. 宏任务和微任务的区别？谁先执行？</div><div class="a">每个宏任务结束后清空整个微任务队列；微任务先于下一个宏任务。</div></div>
<div class="qa"><div class="q">4-6. await 之后的代码在什么时候执行？</div><div class="a">await 把后续代码包成微任务；await 表达式本身同步执行，其后的代码等当前宏任务结束后按序执行。</div></div>
<div class="qa"><div class="q">7-9. 浏览器和 Node 的事件循环差异？</div><div class="a">Node 有阶段（timers / poll / check）与 nextTick 队列，nextTick 优先级高于普通微任务。</div></div>
<div class="qa"><div class="q">10-12. requestAnimationFrame 属于哪一类？</div><div class="a">既不是宏也不是微任务，它在渲染前执行，每帧最多一次。</div></div>
<blockquote>答对顺序只能及格，能画出「宏任务 → 微任务 → 渲染」的时间轴才算答好。</blockquote>`,
  },
  {
    id: 6,
    type: 'interview',
    topic: 'bigu',
    sub: '八股考题',
    title: 'Promise 手写题清单',
    summary: '并发限制、调度器、超时重试、allSettled 实现，每题附思路要点。',
    tags: ['Promise', '手写'],
    date: '2026-08-28',
    read: '6 题',
    result: '高频',
    resultClass: 'warn',
    status: 'PUBLISHED',
    body: `
<p>Promise 手写题出现频率极高，且有明显的「难递增」路径。按这个清单练即可覆盖大部分场次。</p>
<div class="qa"><div class="q">1. 实现一个超时重试函数</div><div class="a">递归 + 计数：失败后若还有剩余次数则延迟重试，否则 reject。</div></div>
<div class="qa"><div class="q">2. 实现一个带并发限制的调度器</div><div class="a">队列 + 活跃计数，任务结束后从队列取下一个（详见算法题那篇的完整实现）。</div></div>
<div class="qa"><div class="q">3. 实现 Promise.all / allSettled</div><div class="a">all 是「第一个失败即失败」；allSettled 是把每个结果包成 {status, value/reason}，永不失败。</div></div>
<div class="qa"><div class="q">4-6. 实现 Promise.race / any / 按序执行</div><div class="a">race 是第一个 settle 即结束；any 是第一个成功才结束；按序执行用 reduce 串 promise。</div></div>`,
  },
  {
    id: 7,
    type: 'interview',
    topic: 'bigu',
    sub: '八股考题',
    title: 'CSS 布局高频题：居中、两栏、Sticky',
    summary: '垂直居中的五种写法、圣杯布局、粘性侧边栏；各自适用场景与坑。',
    tags: ['CSS', '布局'],
    date: '2026-08-20',
    read: '10 题',
    result: '高频',
    resultClass: 'warn',
    status: 'PUBLISHED',
    body: `
<p>CSS 题考的是「你知道几种、以及知道每种什么时候不该用」。</p>
<div class="qa"><div class="q">垂直居中的几种写法？</div><div class="a">flex（align-items）、grid（place-items）、绝对定位 + transform、表格布局。已知高度用负 margin 也可以，但别写进新代码。</div></div>
<div class="qa"><div class="q">两栏布局：左固定右自适应？</div><div class="a">flex：左固定宽 + 右 flex:1；float + BFC 也行，但现代项目直接 flex。注意 min-width:0 防止内容撑破。</div></div>
<div class="qa"><div class="q">position: sticky 失效的常见原因？</div><div class="a">任意祖先设置了 overflow: hidden/auto/scroll，或者父容器高度太小。</div></div>
<blockquote>每道题准备「首选写法 + 一个失效场景」，比背十种写法更有说服力。</blockquote>`,
  },
  {
    id: 8,
    type: 'interview',
    topic: 'algo',
    sub: '算法题',
    title: '手写并发调度器（附测试思路）',
    summary: '一面挂过的题重写：队列 + 计数，边界条件逐个补齐。',
    tags: ['Promise', '队列'],
    date: '2026-08-21',
    read: '中等',
    result: '手写',
    resultClass: 'ok',
    status: 'PUBLISHED',
    body: `
<p>一面挂过的题，重新写一遍并补齐边界：限制并发数为 N，任务失败不能阻塞队列。</p>
<h3>思路</h3>
<p>一个等待队列 + 一个活跃计数。提交任务先入队，只要活跃数未满就从队列取任务执行；任务无论成败都在 finally 里减计数并触发下一个。</p>
<div class="code">function createScheduler(limit) {
  const queue = [];
  let active = 0;
  const next = () => {
    if (active >= limit || !queue.length) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    fn().then(resolve, reject).finally(() => { active--; next(); });
  };
  return fn => new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    next();
  });
}</div>
<h3>测试思路</h3>
<p>三个用例：并发数不超限；某个任务 reject 后队列继续推进；先提交的任务先完成（FIFO）。</p>`,
  },
  {
    id: 9,
    type: 'interview',
    topic: 'algo',
    sub: '算法题',
    title: 'LRU 缓存：从 Map 到双向链表',
    summary: 'O(1) 读写的两种写法；什么时候可以偷懒直接用 Map。',
    tags: ['设计', '缓存'],
    date: '2026-08-14',
    read: '中等',
    result: '手写',
    resultClass: 'ok',
    status: 'PUBLISHED',
    body: `
<p>题目：实现 get / put 均为 O(1) 的 LRU 缓存。</p>
<h3>思路</h3>
<p>JS 的 Map 保持插入序，可以「删除再插入」模拟访问序，尾部即最久未用——这已经满足 O(1)。面试官若要求更「数据结构化」，再写双向链表 + 哈希表版本。</p>
<div class="code">class LRUCache {
  constructor(cap) { this.cap = cap; this.map = new Map(); }
  get(k) {
    if (!this.map.has(k)) return -1;
    const v = this.map.get(k);
    this.map.delete(k); this.map.set(k, v);   // 刷新访问序
    return v;
  }
  put(k, v) {
    if (this.map.has(k)) this.map.delete(k);
    this.map.set(k, v);
    if (this.map.size > this.cap) this.map.delete(this.map.keys().next().value);
  }
}</div>
<blockquote>先给 Map 版说明复杂度，再主动提出链表版——比直接默写链表更能展示判断力。</blockquote>`,
  },
  {
    id: 10,
    type: 'interview',
    topic: 'algo',
    sub: '算法题',
    title: '三数之和：排序 + 双指针',
    summary: '去重边界卡了半小时。记录易错点与剪枝技巧。',
    tags: ['双指针', '去重'],
    date: '2026-08-07',
    read: '较难',
    result: '手写',
    resultClass: 'fail',
    status: 'DRAFT',
    body: `
<p>题目：找出数组中所有和为 0 的不重复三元组。</p>
<h3>思路</h3>
<p>排序后固定第一个数，用左右双指针在剩余区间找两数之和。关键全在去重：固定的数要跳过重复值，左指针命中后也要跳过重复值。</p>
<h3>我卡住的地方</h3>
<p>去重边界：只对固定数去重、漏了左指针去重，导致结果里有重复三元组。剪枝：排序后若固定数大于 0 可直接终止。</p>
<blockquote>双指针题的难点从来不是指针怎么动，而是「什么时候跳过」。</blockquote>`,
  },
]

/** 按类型取已发布文章（前台只展示已发布；列表按日期倒序） */
export function listPublished(type: Article['type']): Article[] {
  return MOCK_ALL.filter((a) => a.type === type && a.status === 'PUBLISHED').sort((a, b) =>
    b.date.localeCompare(a.date),
  )
}

/** 按 id 取文章（详情页；草稿同样可见——P1 为个人预览，P3 由后端鉴权） */
export function getArticle(type: Article['type'], id: string | number): Article | undefined {
  return MOCK_ALL.find((a) => a.type === type && a.id === Number(id))
}

/** 全量 mock（供列表页按需过滤） */
export const MOCK_ALL: Article[] = [...NOTES, ...INTERNSHIPS, ...INTERVIEWS]
