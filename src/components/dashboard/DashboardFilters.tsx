import { useState, useRef, useEffect } from 'react';
import { Filter, Calendar, Palette, User, X, Download, FileText, TrendingUp, LayoutGrid, Save, Trash2, Plus, Check } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, formatCurrency } from '@/utils';
import Modal from '@/components/common/Modal';
import ExportReportModal from '@/components/common/ExportReportModal';

interface DashboardFiltersProps {
  onExport: (type: 'monthly' | 'flow') => void;
}

export default function DashboardFilters({ onExport }: DashboardFiltersProps) {
  const { 
    exhibitions, artists, filters, setFilters, resetFilters, artworks, sales,
    dashboardViews, currentViewId, saveDashboardView, loadDashboardView, deleteDashboardView,
    hasPermission
  } = useAppStore();
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'monthly' | 'flow'>('monthly');
  const [viewName, setViewName] = useState('');
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const viewMenuRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters = filters.exhibition || filters.artist || filters.dateRange;
  const canManageViews = hasPermission('director');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (viewMenuRef.current && !viewMenuRef.current.contains(event.target as Node)) {
        setShowViewMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveView = () => {
    if (!viewName.trim()) return;
    const allWidgets = ['overview', 'halls', 'environment', 'installations', 'logistics', 'recentAlerts'];
    saveDashboardView(viewName.trim(), allWidgets);
    setViewName('');
    setShowSaveModal(false);
    setShowViewMenu(false);
  };

  const handleLoadView = (viewId: string) => {
    loadDashboardView(viewId);
    setShowViewMenu(false);
  };

  const handleDeleteView = (viewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteDashboardView(viewId);
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const currentRange = filters.dateRange || { start: '', end: '' };
    setFilters({
      dateRange: {
        ...currentRange,
        [type]: value,
      },
    });
  };

  const handleOpenExportModal = (type: 'monthly' | 'flow') => {
    setExportType(type);
    setShowExportMenu(false);
    setShowExportModal(true);
  };

  const handleExportClose = () => {
    setShowExportModal(false);
    onExport(exportType);
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

          {canManageViews && (
            <div className="relative" ref={viewMenuRef}>
              <button
                onClick={() => setShowViewMenu(!showViewMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-ink-200 dark:border-ink-600 text-ink-600 dark:text-ink-300 hover:border-gold-500/50 hover:text-gold-600 dark:hover:text-gold-400 transition-all"
              >
                <LayoutGrid className="w-4 h-4" />
                视图方案
                {currentViewId && (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </button>
              
              {showViewMenu && (
                <div className="absolute left-0 top-full mt-2 w-64 py-2 bg-white dark:bg-ink-800 rounded-lg shadow-lg border border-ink-200 dark:border-ink-700 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-ink-100 dark:border-ink-700">
                    <p className="text-xs font-medium text-ink-500 dark:text-ink-400">我的视图方案</p>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {dashboardViews.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-ink-400">暂无保存的视图方案</p>
                      </div>
                    ) : (
                      dashboardViews.map(view => (
                        <div
                          key={view.id}
                          className={cn(
                            'group flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-ink-50 dark:hover:bg-ink-700/50 transition-colors',
                            currentViewId === view.id && 'bg-gold-50 dark:bg-gold-500/10'
                          )}
                          onClick={() => handleLoadView(view.id)}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {currentViewId === view.id ? (
                              <Check className="w-4 h-4 text-gold-500 flex-shrink-0" />
                            ) : (
                              <LayoutGrid className="w-4 h-4 text-ink-400 flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className={cn(
                                'text-sm font-medium truncate',
                                currentViewId === view.id 
                                  ? 'text-gold-700 dark:text-gold-400' 
                                  : 'text-ink-700 dark:text-ink-300'
                              )}>
                                {view.name}
                              </p>
                              <p className="text-xs text-ink-400 truncate">
                                {view.filters.artist || view.filters.exhibition || view.filters.dateRange
                                  ? '已应用筛选条件'
                                  : '默认视图'
                                }
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteView(view.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-ink-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="border-t border-ink-100 dark:border-ink-700 pt-2 mt-2">
                    <button
                      onClick={() => {
                        setShowSaveModal(true);
                        setShowViewMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gold-600 dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-gold-500/10 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      保存当前视图
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="relative" ref={exportMenuRef}>
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
                  onClick={() => handleOpenExportModal('monthly')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700/50 transition-colors"
                >
                  <FileText className="w-4 h-4 text-gold-500" />
                  <div>
                    <p className="font-medium">月度运营报告</p>
                    <p className="text-xs text-ink-400">可选择时间范围导出</p>
                  </div>
                </button>
                <button
                  onClick={() => handleOpenExportModal('flow')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700/50 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="font-medium">藏品流动明细</p>
                    <p className="text-xs text-ink-400">可选择时间范围导出</p>
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

      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="保存视图方案"
      >
        <div className="p-6">
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-4">
            保存当前筛选条件为视图方案，方便下次快速切换
          </p>
          <div className="mb-6">
            <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-2">
              方案名称
            </label>
            <input
              type="text"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              placeholder="请输入视图方案名称"
              className="w-full px-4 py-2.5 rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveView();
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowSaveModal(false)}
              className="px-4 py-2 rounded-lg border border-ink-200 dark:border-ink-600 text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700/50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSaveView}
              disabled={!viewName.trim()}
              className={cn(
                'px-6 py-2 rounded-lg font-medium transition-colors',
                viewName.trim()
                  ? 'bg-gold-500 text-white hover:bg-gold-600'
                  : 'bg-ink-200 text-ink-400 cursor-not-allowed dark:bg-ink-700'
              )}
            >
              保存
            </button>
          </div>
        </div>
      </Modal>

      <ExportReportModal
        isOpen={showExportModal}
        onClose={handleExportClose}
        defaultType={exportType}
      />
    </div>
  );
}
