import { useState, useEffect } from 'react';
import { Download, FileText, TrendingUp, Calendar } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, formatCurrency } from '@/utils';
import Modal from '@/components/common/Modal';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'monthly' | 'flow';
}

export default function ExportReportModal({ isOpen, onClose, defaultType = 'monthly' }: ExportReportModalProps) {
  const { artworks, sales, exhibitions, artists } = useAppStore();
  const [exportType, setExportType] = useState<'monthly' | 'flow'>(defaultType);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      setExportType(defaultType);
      const now = new Date();
      if (defaultType === 'monthly') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        setExportStartDate(monthStart.toISOString().split('T')[0]);
        setExportEndDate(now.toISOString().split('T')[0]);
      } else {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        setExportStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
        setExportEndDate(now.toISOString().split('T')[0]);
      }
    }
  }, [isOpen, defaultType]);

  const generateMonthlyReport = (startDate?: string, endDate?: string) => {
    let start: Date;
    let end: Date;
    
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    
    const monthSales = sales.filter(s => {
      const date = new Date(s.createdAt);
      return date >= start && date <= end;
    });
    
    const approvedSales = monthSales.filter(s => s.status === 'approved');
    const totalRevenue = approvedSales.reduce((sum, s) => sum + s.amount, 0);
    const pendingCount = monthSales.filter(s => s.status !== 'approved' && s.status !== 'rejected').length;
    
    const newArtworks = artworks.filter(a => {
      const date = new Date(a.createdAt);
      return date >= start && date <= end;
    });

    const dateRangeText = startDate && endDate 
      ? `${startDate} 至 ${endDate}`
      : `${start.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}`;

    const reportContent = `
╔══════════════════════════════════════════════════════════════╗
║              艺管系统 - 月度运营报告                        ║
╚══════════════════════════════════════════════════════════════╝

报告周期: ${dateRangeText}
生成时间: ${new Date().toLocaleString('zh-CN')}

┌──────────────────────────────────────────────────────────────┐
│  核心指标                                                    │
├──────────────────────────────────────────────────────────────┤
│  藏品总数: ${String(artworks.length).padEnd(20)}件          │
│  周期新增: ${String(newArtworks.length).padEnd(20)}件        │
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
│  周期成交作品 TOP 5                                          │
├──────────────────────────────────────────────────────────────┤
${approvedSales.slice(0, 5).map((s, i) => 
  `│  ${i + 1}. ${s.artworkTitle.padEnd(20)} ${formatCurrency(s.amount).padStart(15)}  │`
).join('\n')}
└──────────────────────────────────────────────────────────────┘

报告生成系统 v1.0
    `.trim();

    return reportContent;
  };

  const generateFlowReport = (startDate?: string, endDate?: string) => {
    let start: Date;
    let end: Date;
    
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      const now = new Date();
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      end = now;
    }
    
    const recentArtworks = artworks.filter(a => {
      const date = new Date(a.createdAt);
      return date >= start && date <= end;
    });
    const recentSales = sales.filter(s => {
      const date = new Date(s.createdAt);
      return date >= start && date <= end;
    });
    
    const statusFlow = artworks.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dateRangeText = startDate && endDate 
      ? `${startDate} 至 ${endDate}`
      : '近30天';

    const reportContent = `
╔══════════════════════════════════════════════════════════════╗
║              艺管系统 - 藏品流动明细                        ║
╚══════════════════════════════════════════════════════════════╝

统计周期: ${dateRangeText}
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

  const handleDownloadReport = () => {
    const content = exportType === 'monthly' 
      ? generateMonthlyReport(exportStartDate, exportEndDate) 
      : generateFlowReport(exportStartDate, exportEndDate);
    
    const dateSuffix = exportStartDate && exportEndDate 
      ? `${exportStartDate}_${exportEndDate}`
      : new Date().toISOString().split('T')[0];
    
    const filename = exportType === 'monthly' 
      ? `月度运营报告_${dateSuffix}.txt`
      : `藏品流动明细_${dateSuffix}.txt`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exportType === 'monthly' ? '导出月度运营报告' : '导出藏品流动明细'}
    >
      <div className="p-6">
        <p className="text-sm text-ink-500 dark:text-ink-400 mb-6">
          选择报告的时间范围，系统将根据所选范围生成报告
        </p>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-2">
            报告类型
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setExportType('monthly')}
              className={cn(
                'flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                exportType === 'monthly'
                  ? 'border-gold-500 bg-gold-50 dark:bg-gold-500/10'
                  : 'border-ink-200 dark:border-ink-700 hover:border-ink-300 dark:hover:border-ink-600'
              )}
            >
              <FileText className={cn(
                'w-6 h-6',
                exportType === 'monthly' ? 'text-gold-500' : 'text-ink-400'
              )} />
              <div className="text-left">
                <p className={cn(
                  'font-medium',
                  exportType === 'monthly' 
                    ? 'text-gold-700 dark:text-gold-400' 
                    : 'text-ink-700 dark:text-ink-300'
                )}>
                  月度运营报告
                </p>
                <p className="text-xs text-ink-400">核心指标、分类统计</p>
              </div>
            </button>
            <button
              onClick={() => setExportType('flow')}
              className={cn(
                'flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                exportType === 'flow'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                  : 'border-ink-200 dark:border-ink-700 hover:border-ink-300 dark:hover:border-ink-600'
              )}
            >
              <TrendingUp className={cn(
                'w-6 h-6',
                exportType === 'flow' ? 'text-blue-500' : 'text-ink-400'
              )} />
              <div className="text-left">
                <p className={cn(
                  'font-medium',
                  exportType === 'flow' 
                    ? 'text-blue-700 dark:text-blue-400' 
                    : 'text-ink-700 dark:text-ink-300'
                )}>
                  藏品流动明细
                </p>
                <p className="text-xs text-ink-400">状态分布、交易记录</p>
              </div>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-3">
            快捷选择
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '本月', type: 'month' as const },
              { label: '上月', type: 'lastMonth' as const },
              { label: '近7天', type: '7days' as const },
              { label: '近30天', type: '30days' as const },
              { label: '近90天', type: '90days' as const },
            ].map(option => (
              <button
                key={option.label}
                onClick={() => {
                  const now = new Date();
                  let start: Date;
                  let end: Date = now;
                  
                  if (option.type === 'month') {
                    start = new Date(now.getFullYear(), now.getMonth(), 1);
                  } else if (option.type === 'lastMonth') {
                    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    end = new Date(now.getFullYear(), now.getMonth(), 0);
                  } else {
                    const days = option.type === '7days' ? 7 : option.type === '30days' ? 30 : 90;
                    start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
                  }
                  
                  setExportStartDate(start.toISOString().split('T')[0]);
                  setExportEndDate(end.toISOString().split('T')[0]);
                }}
                className="px-3 py-1.5 text-sm rounded-lg border border-ink-200 dark:border-ink-600 text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-700/50 hover:border-gold-500/50 hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-2">
              开始日期
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-2">
              结束日期
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-ink-200 dark:border-ink-600 text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700/50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleDownloadReport}
            disabled={!exportStartDate || !exportEndDate}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors',
              exportStartDate && exportEndDate
                ? 'bg-gold-500 text-white hover:bg-gold-600 shadow-gold'
                : 'bg-ink-200 text-ink-400 cursor-not-allowed dark:bg-ink-700'
            )}
          >
            <Download className="w-4 h-4" />
            下载报告
          </button>
        </div>
      </div>
    </Modal>
  );
}
