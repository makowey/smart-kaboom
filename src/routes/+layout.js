// Conditional prerendering for desktop vs web builds
const isDesktopBuild = process.env.TAURI_BUILD === 'true';

export const prerender = isDesktopBuild;
export const ssr = !isDesktopBuild;