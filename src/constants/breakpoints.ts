export const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
  wide: 1280,
  ultrawide: 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

export const getBreakpoint = (key: BreakpointKey): number => {
  return BREAKPOINTS[key];
};

export const isTablet = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    window.innerWidth >= BREAKPOINTS.tablet &&
    window.innerWidth < BREAKPOINTS.desktop
  );
};

export const isDesktop = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= BREAKPOINTS.desktop;
};

export const isWide = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= BREAKPOINTS.wide;
};

export const isUltrawide = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= BREAKPOINTS.ultrawide;
};

export const getCurrentBreakpoint = (): BreakpointKey | "mobile" => {
  if (typeof window === "undefined") return "mobile";

  const width = window.innerWidth;

  if (width >= BREAKPOINTS.ultrawide) return "ultrawide";
  if (width >= BREAKPOINTS.wide) return "wide";
  if (width >= BREAKPOINTS.desktop) return "desktop";
  if (width >= BREAKPOINTS.tablet) return "tablet";

  return "mobile";
};

export const mediaQuery = {
  tablet: `(min-width: ${BREAKPOINTS.tablet}px)`,
  desktop: `(min-width: ${BREAKPOINTS.desktop}px)`,
  wide: `(min-width: ${BREAKPOINTS.wide}px)`,
  ultrawide: `(min-width: ${BREAKPOINTS.ultrawide}px)`,
} as const;
