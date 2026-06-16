import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusText,
  getStatusColor,
} from '@/utils';
import { SaleFormModal, SaleDetailModal } from '@/components/forms/SaleFormModal';
import type { SaleRecord } from '@/types';

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

function SaleCard({ sale, onView }: { sale: any; onView: (id: string) => void }) {
  return (
    <div
      onClick={() => onView(sale.id)}
      className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50 shadow-sm hover:shadow-md hover:border-gold-500/30 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <img
          src={sale.artworkImage}
          alt={sale.artworkTitle}
          className="w-20 h-24 rounded-lg object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-medium text-ink-800 dark:text-ink-100 truncate">
              {sale.artworkTitle}
            </h3>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium shrink-0',
                getStatusColor(sale.type)
              )}
            >
              {sale.type === 'sale' ? '销售' : '租赁'}
            </span>
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
  const { sales, escalateOverdueSales, currentUser, hasPermission, getPendingCountForCurrentUser } = useAppStore();
  const [activeTypeTab, setActiveTypeTab] = useState('all');
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('mine');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);

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

  const filteredSales = sales.filter((sale) => {
    const matchType = activeTypeTab === 'all' || sale.type === activeTypeTab;
    const matchStatus = activeStatusTab === 'all' || sale.status === activeStatusTab;
    const matchSearch =
      sale.artworkTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.applicant.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchMine = viewMode === 'all' || 
      (canApprove && sale.currentLevel === userLevel && sale.status !== 'approved' && sale.status !== 'rejected');
    
    return matchType && matchStatus && matchSearch && matchMine;
  });

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

      <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-2">
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
          <SaleCard key={sale.id} sale={sale} onView={handleView} />
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
