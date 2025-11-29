import type { Config } from "tailwindcss";
import { colors } from "./src/theme/colors";
import { typography } from "./src/theme/typography";
import { spacing } from "./src/theme/spacing";

/**
 * Tailwind CSS Configuration
 * Simple integration with design system
 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        white: colors.white,
        background: colors.background,
        text: colors.text,
        border: colors.border,
        brand: colors.brand,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        info: colors.info,
        interactive: colors.interactive,
        protocol: colors.protocol,
        device: colors.device,
        chart: colors.chart,
      },

      fontFamily: {
        sans: typography.fontFamily.sans.split(", "),
        mono: typography.fontFamily.mono.split(", "),
      },

      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      spacing,
    },
  },

  plugins: [],
};

export default config;
