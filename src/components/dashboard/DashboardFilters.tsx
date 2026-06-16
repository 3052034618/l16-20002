import { useState } from 'react';
import { Filter, Calendar, Palette, User, X, Download, FileText, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, formatCurrency } from '@/utils';

interface DashboardFiltersProps {
  onExport: (type: 'monthly' | 'flow') => void;
}

export default function DashboardFilters({ onExport }: DashboardFiltersProps) {
  const { exhibitions, artists, filters, setFilters, resetFilters, artworks, sales } = useAppStore();
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const hasActiveFilters = filters.exhibition || filters.artist || filters.dateRange;

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const currentRange = filters.dateRange || { start: '', end: '' };
    setFilters({
      dateRange: {
        ...currentRange,
        [type]: value,
      },
    });
  };

  const generateMonthlyReport = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const monthSales = sales.filter(s => {
      const date = new Date(s.createdAt);
      return date >= monthStart && date <= monthEnd;
    });
    
    const approvedSales = monthSales.filter(s => s.status === 'approved');
    const totalRevenue = approvedSales.reduce((sum, s) => sum + s.amount, 0);
    const pendingCount = monthSales.filter(s => s.status !== 'approved' && s.status !== 'rejected').length;
    
    const newArtworks = artworks.filter(a => {
      const date = new Date(a.createdAt);
      return date >= monthStart && date <= monthEnd;
    });

    const reportContent = `
╔══════════════════════════════════════════════════════════════╗
║              艺管系统 - 月度运营报告                        ║
╚══════════════════════════════════════════════════════════════╝

报告月份: ${monthStart.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
生成时间: ${new Date().toLocaleString('zh-CN')}

┌──────────────────────────────────────────────────────────────┐
│  核心指标                                                    │
├──────────────────────────────────────────────────────────────┤
│  藏品总数: ${String(artworks.length).padEnd(20)}件          │
│  本月新增: ${String(newArtworks.length).padEnd(20)}件        │
│  藏品总值: ${String(formatCurrency(artworks.reduce((sum, a) => sum + a.valuation.high, 0))).padEnd(20)}│
│                                                              │
│  申请总数: ${String(monthSales.length).padEnd(20)}件         │
│  已通过: ${String(approvedSales.length).padEnd(20)}件        │
│  待审批: ${String(pendingCount).padEnd(20)}件                │
│  成交额: ${String(formatCurrency(totalRevenue)).padEnd(20)}  │
│                                                              │
│  进行中展览: ${String(exhibitions.filter(e => e.status === 'ongoing').length).padEnd(20)}个   │
│  布展中展览: ${String(exhibitions.filter(e => e.status === 'installing').length).padEnd(20)}个 │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  分类统计                                                    │
├──────────────────────────────────────────────────────────────┤
${['油画', '国画', '雕塑', '摄影', '装置'].map(cat => {
  const count = artworks.filter(a => a.category === cat).length;
  return `│  ${cat.padEnd(10)}: ${String(count).padEnd(15)}件${' '.repeat(28)}│`;
}).join('\n')}
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  本月成交作品 TOP 5                                          │
├──────────────────────────────────────────────────────────────┤
${approvedSales.slice(0, 5).map((s, i) => 
  `│  ${i + 1}. ${s.artworkTitle.padEnd(20)} ${formatCurrency(s.amount).padStart(15)}  │`
).join('\n')}
└──────────────────────────────────────────────────────────────┘

报告生成系统 v1.0
    `.trim();

    return reportContent;
  };

  const generateFlowReport = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentArtworks = artworks.filter(a => new Date(a.createdAt) >= thirtyDaysAgo);
    const recentSales = sales.filter(s => new Date(s.createdAt) >= thirtyDaysAgo);
    
    const statusFlow = artworks.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const reportContent = `
╔══════════════════════════════════════════════════════════════╗
║              艺管系统 - 藏品流动明细                        ║
╚══════════════════════════════════════════════════════════════╝

统计周期: 近30天
生成时间: ${new Date().toLocaleString('zh-CN')}

┌──────────────────────────────────────────────────────────────┐
│  藏品状态分布                                                │
├──────────────────────────────────────────────────────────────┤
│  在库: ${String(statusFlow.in_storage || 0).padEnd(20)}件    │
│  展出中: ${String(statusFlow.on_exhibition || 0).padEnd(20)}件│
│  外借中: ${String(statusFlow.on_loan || 0).padEnd(20)}件      │
│  运输中: ${String(statusFlow.in_transport || 0).padEnd(20)}件│
│  已售出: ${String(statusFlow.sold || 0).padEnd(20)}件        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  新增藏品 (${recentArtworks.length}件)                        │
├──────────────────────────────────────────────────────────────┤
${recentArtworks.length > 0 ? recentArtworks.map(a => 
  `│  • ${a.title.padEnd(20)} ${a.artistName.padEnd(12)} ${formatCurrency(a.valuation.high).padStart(12)} │`
).join('\n') : '│  无新增藏品                                                  │'}
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  交易记录 (${recentSales.length}笔)                           │
├──────────────────────────────────────────────────────────────┤
${recentSales.length > 0 ? recentSales.map(s => 
  `│  • ${s.artworkTitle.padEnd(18)} ${(s.type === 'sale' ? '销售' : '租赁').padEnd(4)} ${formatCurrency(s.amount).padStart(12)} ${s.status.padEnd(10)} │`
).join('\n') : '│  无交易记录                                                  │'}
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  艺术家作品分布                                              │
├──────────────────────────────────────────────────────────────┤
${artists.map(artist => {
  const count = artworks.filter(a => a.artistId === artist.id).length;
  const totalValue = artworks.filter(a => a.artistId === artist.id).reduce((sum, a) => sum + a.valuation.high, 0);
  return `│  ${artist.name.padEnd(10)}: ${String(count).padEnd(5)}件  总值: ${formatCurrency(totalValue).padStart(12)} │`;
}).join('\n')}
└──────────────────────────────────────────────────────────────┘

报告生成系统 v1.0
    `.trim();

    return reportContent;
  };

  const handleExport = (type: 'monthly' | 'flow') => {
    const content = type === 'monthly' ? generateMonthlyReport() : generateFlowReport();
    const filename = type === 'monthly' 
      ? `月度运营报告_${new Date().toISOString().split('T')[0]}.txt`
      : `藏品流动明细_${new Date().toISOString().split('T')[0]}.txt`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setShowExportMenu(false);
    onExport(type);
  };

  return (
    <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50 mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
              showFilters || hasActiveFilters
                ? 'bg-gold-500/10 border-gold-500/50 text-gold-600 dark:text-gold-400'
                : 'border-ink-200 dark:border-ink-600 text-ink-600 dark:text-ink-300 hover:border-gold-500/50'
            )}
          >
            <Filter className="w-4 h-4" />
            筛选
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full bg-gold-500 text-white text-xs flex items-center justify-center">
                {(filters.exhibition ? 1 : 0) + (filters.artist ? 1 : 0) + (filters.dateRange?.start ? 1 : 0)}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700 dark:hover:text-ink-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              重置筛选
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500 text-white font-medium hover:bg-gold-600 transition-colors shadow-gold"
            >
              <Download className="w-4 h-4" />
              导出报告
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 py-2 bg-white dark:bg-ink-800 rounded-lg shadow-lg border border-ink-200 dark:border-ink-700 z-50 animate-fade-in">
                <button
                  onClick={() => handleExport('monthly')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700/50 transition-colors"
                >
                  <FileText className="w-4 h-4 text-gold-500" />
                  <div>
                    <p className="font-medium">月度运营报告</p>
                    <p className="text-xs text-ink-400">包含核心指标、分类统计</p>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('flow')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700/50 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="font-medium">藏品流动明细</p>
                    <p className="text-xs text-ink-400">包含状态分布、交易记录</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-400">
          {filters.exhibition && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-100 dark:bg-gold-500/20 text-gold-700 dark:text-gold-400">
              <Palette className="w-3 h-3" />
              {exhibitions.find(e => e.id === filters.exhibition)?.name}
              <button onClick={() => setFilters({ exhibition: undefined })} className="ml-1 hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.artist && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
              <User className="w-3 h-3" />
              {artists.find(a => a.id === filters.artist)?.name}
              <button onClick={() => setFilters({ artist: undefined })} className="ml-1 hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.dateRange?.start && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
              <Calendar className="w-3 h-3" />
              {filters.dateRange.start} ~ {filters.dateRange.end || '至今'}
              <button onClick={() => setFilters({ dateRange: undefined })} className="ml-1 hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-ink-200 dark:border-ink-700">
          <div>
            <label className="block text-xs font-medium text-ink-500 dark:text-ink-400 mb-1.5">
              按展览筛选
            </label>
            <div className="relative">
              <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <select
                value={filters.exhibition || ''}
                onChange={(e) => setFilters({ exhibition: e.target.value || undefined })}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-sm text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
              >
                <option value="">全部展览</option>
                {exhibitions.map(exh => (
                  <option key={exh.id} value={exh.id}>{exh.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-500 dark:text-ink-400 mb-1.5">
              按艺术家筛选
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <select
                value={filters.artist || ''}
                onChange={(e) => setFilters({ artist: e.target.value || undefined })}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-sm text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
              >
                <option value="">全部艺术家</option>
                {artists.map(artist => (
                  <option key={artist.id} value={artist.id}>{artist.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-500 dark:text-ink-400 mb-1.5">
              开始日期
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-sm text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-500 dark:text-ink-400 mb-1.5">
              结束日期
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-sm text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
