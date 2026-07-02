import type { ReactNode } from "react";
import { BrowserRouter, HashRouter } from "react-router-dom";

const useHashRouter = import.meta.env.VITE_GITHUB_PAGES === "true";

/** BrowserRouter locally; HashRouter on GitHub Pages (static hosting). */
export function AppRouter({ children }: { children: ReactNode }) {
  if (useHashRouter) {
    return <HashRouter>{children}</HashRouter>;
  }
  return <BrowserRouter>{children}</BrowserRouter>;
}

export function isGitHubPagesDeploy(): boolean {
  return import.meta.env.VITE_GITHUB_PAGES === "true";
}
