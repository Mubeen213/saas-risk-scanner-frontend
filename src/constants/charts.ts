export const CHART_COLORS = {
  primary: [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#06b6d4",
    "#6366f1",
    "#84cc16",
    "#f97316",
    "#14b8a6",
  ],
  protocols: {
    modbus: "#3b82f6",
    s7comm: "#8b5cf6",
    bacnet: "#10b981",
    "ethernet/ip": "#f59e0b",
    profinet: "#ec4899",
    opcua: "#06b6d4",
    unknown: "#94a3b8",
  },
  deviceTypes: {
    plc: "#3b82f6",
    hmi: "#8b5cf6",
    scada: "#10b981",
    rtu: "#f59e0b",
    sensor: "#ec4899",
    gateway: "#06b6d4",
    controller: "#6366f1",
    unknown: "#94a3b8",
  },
  vendors: {},
} as const;

export const CHART_FALLBACKS = {
  noData: "No data available",
  emptyVendor: "Unknown Vendor",
  emptyProtocol: "Unknown Protocol",
  emptyDeviceType: "Unknown Device Type",
  loading: "Loading chart data...",
  error: "Failed to load chart data",
} as const;

export const CHART_DIMENSIONS = {
  pieChart: {
    height: 300,
    innerRadius: 60,
    outerRadius: 100,
    paddingAngle: 2,
  },
  legend: {
    iconSize: 12,
    spacing: 8,
  },
} as const;

export const CHART_ANIMATIONS = {
  duration: 800,
  easing: "ease-out",
} as const;

export const CHART_CONFIG = {
  colors: CHART_COLORS,
  fallbacks: CHART_FALLBACKS,
  dimensions: CHART_DIMENSIONS,
  animations: CHART_ANIMATIONS,
} as const;

export type ChartColorKey = keyof typeof CHART_COLORS;
export type ProtocolKey = keyof typeof CHART_COLORS.protocols;
export type DeviceTypeKey = keyof typeof CHART_COLORS.deviceTypes;
