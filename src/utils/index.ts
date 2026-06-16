import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number, decimals = 0): string {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(value: number): string {
  if (value >= 100000000) {
    return `¥${(value / 100000000).toFixed(2)}亿`;
  }
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(1)}万`;
  }
  return `¥${value.toLocaleString('zh-CN')}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 30) return `${diffDays}天前`;
  return formatDate(dateStr);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function generateDigitalFingerprint(): string {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

export function calculateValuation(
  artistReputation: number,
  totalSales: number,
  material: string,
  category: string,
  rules: {
    artistReputationWeight: number;
    salesHistoryWeight: number;
    marketTrendWeight: number;
    materialMultiplier: Record<string, number>;
    categoryMultiplier: Record<string, number>;
  }
): { low: number; high: number } {
  const baseFromReputation = (artistReputation / 100) * 500000;
  const baseFromSales = (totalSales / 1000000) * 80000;
  const marketTrend = 50000;

  const baseValue =
    baseFromReputation * rules.artistReputationWeight +
    baseFromSales * rules.salesHistoryWeight +
    marketTrend * rules.marketTrendWeight;

  const materialMult = rules.materialMultiplier[material] || 1;
  const categoryMult = rules.categoryMultiplier[category] || 1;

  const adjustedValue = baseValue * materialMult * categoryMult;

  return {
    low: Math.round(adjustedValue * 0.8),
    high: Math.round(adjustedValue * 1.2),
  };
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    ongoing: 'text-emerald-600 bg-emerald-50',
    installing: 'text-blue-600 bg-blue-50',
    planned: 'text-amber-600 bg-amber-50',
    closed: 'text-gray-600 bg-gray-100',
    draft: 'text-gray-500 bg-gray-100',
    in_storage: 'text-emerald-600 bg-emerald-50',
    on_exhibition: 'text-blue-600 bg-blue-50',
    on_loan: 'text-amber-600 bg-amber-50',
    in_transport: 'text-purple-600 bg-purple-50',
    sold: 'text-gray-500 bg-gray-100',
    pending: 'text-amber-600 bg-amber-50',
    approved: 'text-emerald-600 bg-emerald-50',
    rejected: 'text-red-600 bg-red-50',
    in_transit: 'text-blue-600 bg-blue-50',
    delayed: 'text-orange-600 bg-orange-50',
    delivered: 'text-emerald-600 bg-emerald-50',
    active: 'text-emerald-600 bg-emerald-50',
    expiring_soon: 'text-amber-600 bg-amber-50',
    expired: 'text-gray-500 bg-gray-100',
    normal: 'text-emerald-600 bg-emerald-50',
    warning: 'text-amber-600 bg-amber-50',
    error: 'text-red-600 bg-red-50',
    completed: 'text-emerald-600 bg-emerald-50',
    in_progress: 'text-blue-600 bg-blue-50',
    assigned: 'text-purple-600 bg-purple-50',
  };
  return colorMap[status] || 'text-gray-600 bg-gray-100';
}

export function getStatusText(status: string): string {
  const textMap: Record<string, string> = {
    ongoing: '进行中',
    installing: '布展中',
    planned: '已规划',
    closed: '已结束',
    draft: '草稿',
    in_storage: '在库',
    on_exhibition: '展出中',
    on_loan: '外借中',
    in_transport: '运输中',
    sold: '已售出',
    pending: '待审批',
    approved: '已通过',
    rejected: '已驳回',
    in_transit: '运输中',
    delayed: '延误',
    delivered: '已送达',
    active: '有效',
    expiring_soon: '即将到期',
    expired: '已过期',
    normal: '正常',
    warning: '警告',
    error: '异常',
    completed: '已完成',
    in_progress: '进行中',
    assigned: '已分配',
  };
  return textMap[status] || status;
}

export function getRoleText(role: string): string {
  const textMap: Record<string, string> = {
    artist: '艺术家',
    curator: '策展人',
    keeper: '保管员',
    director: '馆长',
  };
  return textMap[role] || role;
}

export function getTaskTypeText(type: string): string {
  const textMap: Record<string, string> = {
    installation: '安装',
    lighting: '灯光',
    packaging: '包装',
    transportation: '运输',
    security: '安保',
  };
  return textMap[type] || type;
}
