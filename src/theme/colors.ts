/**
 * Design System - Colors
 * Notion-inspired: Simple black and white with warm neutrals
 */

export const colors = {
  // Base Neutrals — warm whites, not grays
  white: "#FFFFFF",

  background: {
    primary: "#FFFFFF", // Page background
    secondary: "#FAF9F7", // Light beige tint
    tertiary: "#F6F5F3", // Card or subtle layer
    elevated: "#FFFFFF", // Modals, popovers
    overlay: "rgba(0, 0, 0, 0.5)",
    backdrop: "rgba(0, 0, 0, 0.25)",
  },

  // Text — neutral warm black (not cool gray)
  text: {
    primary: "#2F2F2F", // Headings, main content
    secondary: "#3F3F3F", // Secondary text
    tertiary: "#5C5C5C", // Meta text
    placeholder: "#A0A0A0",
    disabled: "#B8B8B8",
    inverse: "#FFFFFF",
    link: "#0B6E99",
    linkHover: "#084C6D",
  },

  // Border & Divider
  border: {
    light: "#F1EFEC",
    default: "#E6E3DF",
    medium: "#D8D5D1",
    dark: "#B0ACA7",
    focus: "#0B6E99",
  },

  // Brand Accent — subtle neutral beige/black identity
  brand: {
    primary: "#121212",
    secondary: "#0B6E99",
  },

  // Semantic Feedback (very gentle tones)
  success: {
    50: "#F4FBF7",
    100: "#E1F6E8",
    500: "#16A34A",
  },
  warning: {
    50: "#FFF9E6",
    100: "#FFF1C1",
    500: "#EAB308",
  },
  error: {
    50: "#FFF1F1",
    100: "#FFE0E0",
    500: "#DC2626",
  },
  info: {
    50: "#EAF6FD",
    100: "#D6ECFA",
    500: "#0284C7",
  },

  // Interactive states (Notion-like hover feel)
  interactive: {
    hover: "rgba(0, 0, 0, 0.03)",
    hoverStrong: "rgba(0, 0, 0, 0.06)",
    active: "rgba(0, 0, 0, 0.08)",
    focus: "rgba(11, 110, 153, 0.12)",
    disabled: "#F7F6F4",
  },

  // Protocol Colors (for OT protocol badges)
  protocol: {
    modbus: "#8B5CF6",
    s7comm: "#0EA5E9",
    dnp3: "#F97316",
    ethernetip: "#10B981",
    opcua: "#EC4899",
    bacnet: "#F59E0B",
    profinet: "#6366F1",
    unknown: "#A0A0A0",
  },

  // Device Type Colors (matching backend DeviceType enum)
  device: {
    PLC: "#2E7D32",
    HMI: "#0284C7",
    SCADA: "#DC2626",
    RTU: "#F97316",
    ENGINEERING_STATION: "#8B5CF6",
    SENSOR: "#10B981",
    ACTUATOR: "#F59E0B",
    UNKNOWN: "#A0A0A0",
  },

  // Protocol Category Colors
  protocolCategory: {
    OT: "#2563EB",
    IT: "#8B5CF6",
    IOT: "#14B8A6",
  },

  // Status Colors
  status: {
    active: "#16A34A",
    inactive: "#78716C",
    error: "#DC2626",
    warning: "#EAB308",
  },

  // Chart / Accent (muted tones)
  chart: {
    1: "#0B6E99",
    2: "#2E7D32",
    3: "#EAB308",
    4: "#EC4899",
    5: "#7C3AED",
    6: "#0EA5E9",
    7: "#DC2626",
    8: "#10B981",
  },
} as const;

export type ColorTheme = typeof colors;
