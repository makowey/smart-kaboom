// Conditional prerendering for desktop vs web builds
// Check if process is available (build time only)
const isDesktopBuild = typeof process !== 'undefined' && process.env.TAURI_BUILD === 'true';

export const prerender = isDesktopBuild;
export const ssr = !isDesktopBuild;