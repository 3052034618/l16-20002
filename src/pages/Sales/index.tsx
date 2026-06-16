import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  DollarSign,
  Calendar,
  User,
  ArrowRight,
  XCircle,
  TrendingUp,
  CheckSquare,
  Square,
  Share2,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusText,
  getStatusColor,
  getRoleText,
} from '@/utils';
import { SaleFormModal, SaleDetailModal } from '@/components/forms/SaleFormModal';
import type { SaleRecord, ApprovalLevel } from '@/types';

const typeTabs = ['all', 'sale', 'rental'];
const statusTabs = ['all', 'pending', 'director_approved', 'committee_approved', 'approved', 'rejected'];

function ApprovalTimeline({ approvals, escalated }: { approvals: any[]; escalated: boolean }) {
  const levelNames: Record<string, string> = {
    director: '馆长审批',
    committee: '委员会审批',
    financial: '财务审批',
  };

  return (
    <div className="flex items-center gap-1">
      {approvals.map((approval, index) => (
        <div key={approval.level} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                approval.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                  : approval.status === 'rejected'
                  ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                  : approval.status === 'escalated'
                  ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 alert-pulse'
                  : 'bg-ink-100 text-ink-400 dark:bg-ink-700 dark:text-ink-500'
              )}
            >
              {approval.status === 'approved' ? (
                <CheckCircle className="w-4 h-4" />
              ) : approval.status === 'rejected' ? (
                <XCircle className="w-4 h-4" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
            </div>
            <span className="text-[10px] text-ink-400 mt-1 whitespace-nowrap">
              {levelNames[approval.level]}
            </span>
          </div>
          {index < approvals.length - 1 && (
            <div
              className={cn(
                'w-8 h-0.5 -mt-4',
                approvals[index].status === 'approved'
                  ? 'bg-emerald-300 dark:bg-emerald-500/30'
                  : 'bg-ink-200 dark:bg-ink-700'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function SaleCard({ sale, onView, selected, onToggleSelect, selectable }: {
  sale: any;
  onView: (id: string) => void;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  selectable?: boolean;
}) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-ink-800/50 rounded-xl p-4 border shadow-sm hover:shadow-md transition-all group',
        selected
          ? 'border-gold-500 ring-2 ring-gold-500/30 shadow-gold-500/10'
          : 'border-ink-200 dark:border-ink-700/50 hover:border-gold-500/30'
      )}
    >
      <div className="flex items-start gap-4">
        {selectable && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect?.(sale.id); }}
            className="shrink-0 mt-1 text-ink-400 hover:text-gold-500 transition-colors"
          >
            {selected ? (
              <CheckSquare className="w-5 h-5 text-gold-500" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
        )}
        <img
          src={sale.artworkImage}
          alt={sale.artworkTitle}
          onClick={() => onView(sale.id)}
          className="w-20 h-24 rounded-lg object-cover shrink-0 cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              onClick={() => onView(sale.id)}
              className="font-medium text-ink-800 dark:text-ink-100 truncate cursor-pointer hover:text-gold-500"
            >
              {sale.artworkTitle}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              {sale.delegatedTo && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400 flex items-center gap-1"
                  title={`临时转交给 ${sale.delegatedTo}`}
                >
                  <Share2 className="w-3 h-3" />
                  转交
                </span>
              )}
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium shrink-0',
                  getStatusColor(sale.type)
                )}
              >
                {sale.type === 'sale' ? '销售' : '租赁'}
              </span>
            </div>
          </div>
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-2">
            {sale.artistName}
          </p>
          <p className="text-lg font-semibold text-gold-500 mb-3">
            {formatCurrency(sale.amount)}
          </p>
          <ApprovalTimeline approvals={sale.approvals} escalated={sale.escalated} />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink-100 dark:border-ink-700/50">
        <div className="flex items-center gap-3 text-xs text-ink-400">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {sale.applicant}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(sale.createdAt)}
          </span>
        </div>
        {sale.escalated && (
          <span className="flex items-center gap-1 text-xs text-orange-500 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            已越级
          </span>
        )}
      </div>
    </div>
  );
}

export default function Sales() {
  const { sales, escalateOverdueSales, currentUser, hasPermission, getPendingCountForCurrentUser, batchApproveSales, batchRejectSales, users, delegateSale } = useAppStore();
  const [activeTypeTab, setActiveTypeTab] = useState('all');
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('mine');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchAction, setBatchAction] = useState<'approve' | 'reject' | null>(null);
  const [batchComment, setBatchComment] = useState('');
  const [showBatchDelegate, setShowBatchDelegate] = useState(false);
  const [batchDelegateUserId, setBatchDelegateUserId] = useState('');

  useEffect(() => {
    escalateOverdueSales();
    const interval = setInterval(() => {
      escalateOverdueSales();
    }, 60000);
    return () => clearInterval(interval);
  }, [escalateOverdueSales]);

  const roleLevelMap: Record<string, string> = {
    director: 'director',
    curator: 'committee',
    keeper: 'financial',
  };
  
  const userLevel = roleLevelMap[currentUser.role];
  const canApprove = !!userLevel;

  const isMyApproval = (sale: SaleRecord) => {
    if (sale.status === 'approved' || sale.status === 'rejected') return false;
    if (sale.currentLevel !== userLevel) return false;
    if (sale.delegatedToId && sale.delegatedToId === currentUser.id) return true;
    if (sale.delegatedToId) return false;
    return true;
  };

  const filteredSales = sales.filter((sale) => {
    const matchType = activeTypeTab === 'all' || sale.type === activeTypeTab;
    const matchStatus = activeStatusTab === 'all' || sale.status === activeStatusTab;
    const matchSearch =
      sale.artworkTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.applicant.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchMine = viewMode === 'all' || isMyApproval(sale);
    
    return matchType && matchStatus && matchSearch && matchMine;
  });

  const selectableSales = filteredSales.filter(s => isMyApproval(s));

  const commonLevel = useMemo(() => {
    if (selectedIds.size === 0) return null;
    const levels = new Set<string>();
    sales.forEach(s => {
      if (selectedIds.has(s.id)) levels.add(s.currentLevel);
    });
    return levels.size === 1 ? Array.from(levels)[0] : null;
  }, [selectedIds, sales]);

  const levelRoleMap2: Record<string, string[]> = {
    director: ['director'],
    committee: ['curator', 'director'],
    financial: ['keeper', 'director'],
  };

  const batchColleagues = useMemo(() => {
    if (!commonLevel) return [];
    return users.filter(u =>
      u.id !== currentUser.id &&
      levelRoleMap2[commonLevel]?.includes(u.role)
    );
  }, [users, currentUser.id, commonLevel]);

  const pendingCount = getPendingCountForCurrentUser();
  
  const stats = {
    total: sales.length,
    pending: pendingCount,
    approved: sales.filter((s) => s.status === 'approved').length,
    totalAmount: sales
      .filter((s) => s.status === 'approved')
      .reduce((sum, s) => sum + s.amount, 0),
  };

  const handleView = (id: string) => {
    const sale = sales.find(s => s.id === id);
    if (sale) {
      setSelectedSale(sale);
      setShowDetailModal(true);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableSales.map(s => s.id)));
    }
  };

  const handleBatchApprove = () => {
    if (selectedIds.size === 0 || !commonLevel) return;
    batchApproveSales(Array.from(selectedIds), commonLevel as ApprovalLevel, batchComment);
    setSelectedIds(new Set());
    setBatchAction(null);
    setBatchComment('');
  };

  const handleBatchReject = () => {
    if (selectedIds.size === 0 || !commonLevel) return;
    batchRejectSales(Array.from(selectedIds), commonLevel as ApprovalLevel, batchComment);
    setSelectedIds(new Set());
    setBatchAction(null);
    setBatchComment('');
  };

  const handleBatchDelegate = () => {
    if (selectedIds.size === 0 || !batchDelegateUserId) return;
    const targetUser = users.find(u => u.id === batchDelegateUserId);
    if (targetUser) {
      Array.from(selectedIds).forEach(id => {
        delegateSale(id, targetUser.id, targetUser.name);
      });
    }
    setSelectedIds(new Set());
    setShowBatchDelegate(false);
    setBatchDelegateUserId('');
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink-800 dark:text-ink-100 mb-1">
            销售租赁
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            三级审批流程管理
          </p>
        </div>
        {(currentUser.role === 'director' || currentUser.role === 'curator' || hasPermission('keeper')) && (
          <button
            onClick={() => setShowFormModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 transition-colors shadow-gold"
          >
            <Plus className="w-4 h-4" />
            新建申请
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">申请总数</p>
          <p className="text-2xl font-display font-semibold text-ink-800 dark:text-ink-100">
            {stats.total}
          </p>
        </div>
        <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">待审批</p>
          <p className="text-2xl font-display font-semibold text-amber-500">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">已通过</p>
          <p className="text-2xl font-display font-semibold text-emerald-500">
            {stats.approved}
          </p>
        </div>
        <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">成交总额</p>
          <p className="text-2xl font-display font-semibold text-gold-500">
            {formatCurrency(stats.totalAmount)}
          </p>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-gold-500/10 to-amber-500/10 border border-gold-500/30 dark:border-gold-500/30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-5 h-5 text-gold-500" />
              <span className="font-medium text-ink-800 dark:text-ink-100">
                已选择 <span className="text-gold-500 font-bold">{selectedIds.size}</span> 个申请
                {commonLevel && (
                  <span className="ml-2 text-sm text-ink-500 dark:text-ink-400">
                    （同一审批级别：{commonLevel === 'director' ? '馆长审批' : commonLevel === 'committee' ? '委员会审批' : '财务审批'}）
                  </span>
                )}
                {!commonLevel && selectedIds.size > 1 && (
                  <span className="ml-2 text-sm text-orange-500 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    请选择同一审批级别的申请
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1.5 text-sm text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 flex items-center gap-1 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-700/50 transition-colors"
              >
                <X className="w-4 h-4" />
                清空选择
              </button>
              {commonLevel && (
                <>
                  {batchColleagues.length > 0 && (
                    <button
                      onClick={() => { setShowBatchDelegate(!showBatchDelegate); setBatchAction(null); }}
                      className={cn(
                        'px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors',
                        showBatchDelegate
                          ? 'bg-violet-500 text-white'
                          : 'border border-violet-300 dark:border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10'
                      )}
                    >
                      <Share2 className="w-4 h-4" />
                      批量转交
                    </button>
                  )}
                  <button
                    onClick={() => { setBatchAction('reject'); setShowBatchDelegate(false); }}
                    className={cn(
                      'px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors',
                      batchAction === 'reject'
                        ? 'bg-red-500 text-white'
                        : 'border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                    )}
                  >
                    <XCircle className="w-4 h-4" />
                    批量驳回
                  </button>
                  <button
                    onClick={() => { setBatchAction('approve'); setShowBatchDelegate(false); }}
                    className={cn(
                      'px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors',
                      batchAction === 'approve'
                        ? 'bg-emerald-500 text-white'
                        : 'border border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                    )}
                  >
                    <CheckCircle className="w-4 h-4" />
                    批量通过
                  </button>
                </>
              )}
            </div>
          </div>

          {showBatchDelegate && batchColleagues.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gold-500/20 space-y-3">
              <p className="text-sm text-ink-600 dark:text-ink-300 flex items-center gap-2">
                <User className="w-4 h-4" />
                选择同角色同事临时处理这些申请：
              </p>
              <div className="flex flex-wrap gap-2">
                {batchColleagues.map(colleague => (
                  <button
                    key={colleague.id}
                    onClick={() => setBatchDelegateUserId(colleague.id)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2',
                      batchDelegateUserId === colleague.id
                        ? 'bg-violet-500 text-white border-violet-500 ring-2 ring-violet-500/30'
                        : 'bg-white dark:bg-ink-700/50 border-ink-200 dark:border-ink-600 text-ink-600 dark:text-ink-300 hover:border-violet-300 dark:hover:border-violet-500/50'
                    )}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-amber-600 flex items-center justify-center text-white text-xs font-semibold">
                      {colleague.name.charAt(0)}
                    </div>
                    {colleague.name}
                    <span className="text-xs opacity-70">({getRoleText(colleague.role)})</span>
                  </button>
                ))}
              </div>
              {batchDelegateUserId && (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => { setShowBatchDelegate(false); setBatchDelegateUserId(''); }}
                    className="px-4 py-2 text-sm text-ink-500 hover:text-ink-700 dark:hover:text-ink-300"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleBatchDelegate}
                    className="px-5 py-2 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors"
                  >
                    确认批量转交
                  </button>
                </div>
              )}
            </div>
          )}

          {batchAction && (
            <div className="mt-4 pt-4 border-t border-gold-500/20 space-y-3">
              <textarea
                value={batchComment}
                onChange={(e) => setBatchComment(e.target.value)}
                placeholder="批量审批意见（可选，所有选中申请都会记录）"
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 resize-none text-sm"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setBatchAction(null); setBatchComment(''); }}
                  className="px-4 py-2 text-sm text-ink-500 hover:text-ink-700 dark:hover:text-ink-300"
                >
                  取消
                </button>
                <button
                  onClick={batchAction === 'approve' ? handleBatchApprove : handleBatchReject}
                  className={cn(
                    'px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors',
                    batchAction === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
                  )}
                >
                  确认批量{batchAction === 'approve' ? '通过' : '驳回'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            {canApprove && (
              <>
              <div className="flex items-center gap-1 rounded-lg border border-gold-500/50 overflow-hidden">
                <button
                  onClick={() => setViewMode('mine')}
                  className={cn(
                  'px-3 py-1.5 text-sm font-medium transition-colors',
                  viewMode === 'mine'
                    ? 'bg-gold-500 text-white'
                    : 'text-ink-600 dark:text-ink-300 hover:bg-gold-50 dark:hover:bg-gold-500/10'
                )}
              >
                待我审批
                {pendingCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium transition-colors',
                  viewMode === 'all'
                    ? 'bg-gold-500 text-white'
                    : 'text-ink-600 dark:text-ink-300 hover:bg-gold-50 dark:hover:bg-gold-500/10'
                )}
              >
                全部申请
              </button>
            </div>
            {viewMode === 'mine' && selectableSales.length > 0 && (
              <button
                onClick={toggleSelectAll}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1.5',
                  selectedIds.size > 0
                    ? 'bg-gold-100 text-gold-700 dark:bg-gold-500/20 dark:text-gold-400 border-gold-300 dark:border-gold-500/30'
                    : 'border-ink-200 dark:border-ink-600 text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700'
                )}
              >
                {selectedIds.size > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                {selectedIds.size > 0 ? '取消全选' : '全选同级'}
              </button>
            )}
            </>
            )}

            <div className="flex items-center gap-1 rounded-lg border border-ink-200 dark:border-ink-700 overflow-hidden">
              {typeTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTypeTab(tab)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium transition-colors',
                    activeTypeTab === tab
                      ? 'bg-gold-500 text-white'
                      : 'text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700'
                  )}
                >
                  {tab === 'all' ? '全部' : tab === 'sale' ? '销售' : '租赁'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-ink-200 dark:border-ink-700 overflow-hidden">
              {statusTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveStatusTab(tab)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium transition-colors',
                    activeStatusTab === tab
                      ? 'bg-gold-500 text-white'
                      : 'text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700'
                  )}
                >
                  {getStatusText(tab)}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="搜索作品、申请人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-sm text-ink-700 dark:text-ink-200 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredSales.map((sale) => (
          <SaleCard
            key={sale.id}
            sale={sale}
            onView={handleView}
            selectable={viewMode === 'mine' && isMyApproval(sale)}
            selected={selectedIds.has(sale.id)}
            onToggleSelect={toggleSelect}
          />
        ))}
      </div>

      {filteredSales.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ink-100 dark:bg-ink-700 flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-ink-400" />
          </div>
          <p className="text-ink-500 dark:text-ink-400">没有找到符合条件的申请</p>
        </div>
      )}

      <SaleFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
      />
      
      <SaleDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        sale={selectedSale}
      />
    </div>
  );
}
