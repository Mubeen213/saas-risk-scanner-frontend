export interface ChartDataPoint {
  name: string;
  value: number;
  percentage: number;
  color: string;
  fullName?: string;
  [key: string]: string | number | undefined;
}

export interface TransformOptions {
  fallbackColor?: string;
  emptyMessage?: string;
  sortByValue?: boolean;
  topN?: number;
  groupOthers?: boolean;
}

const DEFAULT_COLORS = [
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
];

const DEFAULT_OPTIONS: Required<TransformOptions> = {
  fallbackColor: "#94a3b8",
  emptyMessage: "No data available",
  sortByValue: true,
  topN: 5,
  groupOthers: true,
};

export const transformToChartData = (
  data: Record<string, number> | null | undefined,
  colorMap?: Record<string, string>,
  options?: TransformOptions
): ChartDataPoint[] => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!data || Object.keys(data).length === 0) {
    return [];
  }

  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  if (total === 0) {
    return [];
  }

  const truncateName = (name: string, maxLength: number = 15): string => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  let chartData: ChartDataPoint[] = Object.entries(data).map(
    ([name, value], index) => {
      const percentage = (value / total) * 100;
      const color =
        colorMap?.[name] ||
        DEFAULT_COLORS[index % DEFAULT_COLORS.length] ||
        opts.fallbackColor;

      return {
        name: truncateName(name),
        fullName: name,
        value,
        percentage,
        color,
      };
    }
  );

  if (opts.sortByValue) {
    chartData = chartData.sort((a, b) => b.value - a.value);
  }

  if (opts.groupOthers && chartData.length > opts.topN) {
    const topItems = chartData.slice(0, opts.topN);
    const otherItems = chartData.slice(opts.topN);

    const othersValue = otherItems.reduce((sum, item) => sum + item.value, 0);
    const othersPercentage = otherItems.reduce(
      (sum, item) => sum + item.percentage,
      0
    );

    if (othersValue > 0) {
      topItems.push({
        name: "Others",
        value: othersValue,
        percentage: othersPercentage,
        color: "#94a3b8",
      });
    }

    return topItems;
  }

  return chartData;
};

export const getColorForIndex = (index: number): string => {
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

export const createColorMap = (
  keys: string[],
  customColors?: Record<string, string>
): Record<string, string> => {
  const colorMap: Record<string, string> = {};

  keys.forEach((key, index) => {
    colorMap[key] = customColors?.[key] || getColorForIndex(index);
  });

  return colorMap;
};

export const calculatePercentage = (
  value: number,
  total: number,
  decimals: number = 1
): number => {
  if (total === 0) return 0;
  return Number(((value / total) * 100).toFixed(decimals));
};

export const formatChartValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

export const transformVendorData = (
  vendorData: Record<string, number> | null | undefined
): ChartDataPoint[] => {
  return transformToChartData(vendorData);
};

export const transformProtocolData = (
  protocolData: Record<string, number> | null | undefined
): ChartDataPoint[] => {
  return transformToChartData(protocolData);
};

export const transformDeviceTypeData = (
  deviceTypeData: Record<string, number> | null | undefined
): ChartDataPoint[] => {
  return transformToChartData(deviceTypeData);
};
