/**
 * Design System - Theme Index
 * Centralized export for all design tokens
 */

import { colors, type ColorTheme } from "./colors";
import { spacing, type SpacingTheme } from "./spacing";
import { typography, type TypographyTheme } from "./typography";

export { colors, spacing, typography };
export type { ColorTheme, SpacingTheme, TypographyTheme };

export const theme = {
  colors,
  spacing,
  typography,
} as const;

export type Theme = typeof theme;
