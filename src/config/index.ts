// 接口数据源开关：true 用 Mock，false 用真实后端接口
// 由环境变量 VITE_USE_MOCK 控制（.env.development=true / .env.production=false）
// 联调或临时切换可直接改此处，或用 import.meta.env 显式覆盖
export const USE_MOCK: boolean = (import.meta.env.VITE_USE_MOCK ?? 'true') === 'true'