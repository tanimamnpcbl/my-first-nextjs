export type ViewType =
  | "home"
  | "live"
  | "routine"
  | "archive"
  | "leaderboard"
  | "active_exam"
  | "admin"
  | "pricing"
  | "results"
  | "my_results"
  | "my_subscriptions"
  | "blog"
  | "helpline";

export const VIEW_SLUGS: Record<ViewType, string> = {
  home: "/",
  admin: "/admin",
  live: "/live",
  routine: "/routine",
  archive: "/archive",
  leaderboard: "/leaderboard",
  pricing: "/pricing",
  results: "/results",
  my_results: "/my-results",
  my_subscriptions: "/my-subscriptions",
  blog: "/blog",
  helpline: "/helpline",
  active_exam: "/active-exam"
};

export const SLUG_TO_VIEW: Record<string, ViewType> = {
  "/": "home",
  "/home": "home",
  "/admin": "admin",
  "/live": "live",
  "/routine": "routine",
  "/archive": "archive",
  "/leaderboard": "leaderboard",
  "/pricing": "pricing",
  "/results": "results",
  "/my-results": "my_results",
  "/my_results": "my_results",
  "/my-subscriptions": "my_subscriptions",
  "/my_subscriptions": "my_subscriptions",
  "/blog": "blog",
  "/helpline": "helpline",
  "/active-exam": "active_exam",
  "/active_exam": "active_exam"
};

/**
 * Get the current view type from current window location pathname
 */
export function getViewFromPath(pathname: string = typeof window !== "undefined" ? window.location.pathname : "/"): ViewType {
  const cleanPath = pathname.toLowerCase().replace(/\/$/, "") || "/";
  return SLUG_TO_VIEW[cleanPath] || "home";
}

/**
 * Update the browser address bar with the slug for the target view without reloading
 */
export function navigateToSlug(view: ViewType, replace: boolean = false): void {
  if (typeof window === "undefined") return;
  
  const targetSlug = VIEW_SLUGS[view] || "/";
  const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, "") || "/";
  
  if (currentPath !== targetSlug) {
    if (replace) {
      window.history.replaceState({ view }, "", targetSlug);
    } else {
      window.history.pushState({ view }, "", targetSlug);
    }
  }
}
