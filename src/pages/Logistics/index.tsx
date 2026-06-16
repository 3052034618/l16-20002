import { useState } from 'react';
import {
  Truck,
  Shield,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Package,
  RefreshCw,
  Plus,
  Calendar,
  DollarSign,
  FileText,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, formatCurrency, formatDate, getStatusColor, getStatusText } from '@/utils';

const tabs = [
  { id: 'transport', label: '运输管理', icon: Truck },
  { id: 'insurance', label: '保险管理', icon: Shield },
];

function TransportCard({ transport }: { transport: any }) {
  const statusIcon = {
    pending: Clock,
    in_transit: Truck,
    delayed: AlertTriangle,
    delivered: CheckCircle,
  };

  const Icon = statusIcon[transport.status as keyof typeof statusIcon] || Truck;

  return (
    <div className="bg-white dark:bg-ink-800/50 rounded-xl overflow-hidden border border-ink-200 dark:border-ink-700/50 shadow-card hover:shadow-card-hover hover:border-gold-500/50 transition-all duration-300">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-ink-100 dark:bg-ink-700 shrink-0">
              <img
                src={transport.artworkImage}
                alt={transport.artworkTitle}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium text-ink-800 dark:text-ink-100">
                {transport.artworkTitle}
              </h3>
              <p className="text-xs text-ink-400">{transport.trackingNumber}</p>
            </div>
          </div>
          <span
            className={cn(
              'text-xs px-2.5 py-1 rounded-full font-medium',
              getStatusColor(transport.status)
            )}
          >
            {getStatusText(transport.status)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm mb-4">
          <div className="flex items-center gap-1.5 text-ink-500 dark:text-ink-400">
            <Truck className="w-4 h-4" />
            <span>{transport.provider}</span>
          </div>
          <div className="flex items-center gap-1.5 text-ink-500 dark:text-ink-400">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{transport.currentLocation}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-ink-400 mb-4">
          <span>
            {transport.origin} → {transport.destination}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-ink-100 dark:border-ink-700/50">
          <div className="text-xs">
            <span className="text-ink-400">预计到达:</span>
            <span className="ml-1 text-ink-600 dark:text-ink-300 font-medium">
              {transport.estimatedArrival}
            </span>
          </div>
          <button className="flex items-center gap-1 text-gold-500 text-xs font-medium hover:text-gold-600 transition-colors">
            查看详情
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="bg-ink-50 dark:bg-ink-800/30 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {transport.route.slice(0, 3).map((node: any, i: number) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-white dark:bg-ink-700 border-2 border-gold-400/30 flex items-center justify-center"
                >
                  <div className="w-2 h-2 rounded-full bg-gold-500" />
                </div>
              ))}
            </div>
            <span className="text-xs text-ink-400">
              {transport.route.length} 个节点
            </span>
          </div>
          <span className="text-xs text-ink-400">
            已完成 {transport.route.filter((n: any) => n.status === '已签收' || n.status === '运输中').length}/
            {transport.route.length}
          </span>
        </div>
      </div>
    </div>
  );
}

function InsuranceCard({ insurance }: { insurance: any }) {
  const daysLeft = Math.ceil(
    (new Date(insurance.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white dark:bg-ink-800/50 rounded-xl p-5 border border-ink-200 dark:border-ink-700/50 shadow-card hover:shadow-card-hover hover:border-gold-500/50 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gold-500/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-gold-500" />
          </div>
          <div>
            <h3 className="font-medium text-ink-800 dark:text-ink-100">
              {insurance.artworkTitle}
            </h3>
            <p className="text-xs text-ink-400">{insurance.policyNumber}</p>
          </div>
        </div>
        <span
          className={cn(
            'text-xs px-2.5 py-1 rounded-full font-medium',
            getStatusColor(insurance.status)
          )}
        >
          {getStatusText(insurance.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-ink-400 mb-1">保险公司</p>
          <p className="text-sm text-ink-700 dark:text-ink-200">{insurance.provider}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400 mb-1">险种</p>
          <p className="text-sm text-ink-700 dark:text-ink-200">{insurance.coverageType}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400 mb-1">保费</p>
          <p className="text-sm font-medium text-ink-700 dark:text-ink-200">
            {formatCurrency(insurance.premium)}
          </p>
        </div>
        <div>
          <p className="text-xs text-ink-400 mb-1">保额</p>
          <p className="text-sm font-medium text-gold-500">
            {formatCurrency(insurance.coverage)}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-ink-100 dark:border-ink-700/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-ink-500 dark:text-ink-400">
            <Calendar className="w-4 h-4" />
            <span>
              {insurance.startDate} 至 {insurance.endDate}
            </span>
          </div>
        </div>
        {insurance.status === 'expiring_soon' && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-500 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>还有 {daysLeft} 天到期</span>
            </div>
            <button className="px-3 py-1 bg-gold-500 text-white text-xs rounded-lg font-medium hover:bg-gold-600 transition-colors">
              申请续保
            </button>
          </div>
        )}
        {insurance.renewalPending && insurance.status === 'expiring_soon' && (
          <div className="mt-2 text-xs text-amber-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            续保审批中
          </div>
        )}
      </div>
    </div>
  );
}

export default function Logistics() {
  const { transports, insurances } = useAppStore();
  const [activeTab, setActiveTab] = useState('transport');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransports = transports.filter(
    (t) =>
      t.artworkTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInsurances = insurances.filter(
    (i) =>
      i.artworkTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.policyNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const transportStats = {
    total: transports.length,
    inTransit: transports.filter((t) => t.status === 'in_transit').length,
    delayed: transports.filter((t) => t.status === 'delayed').length,
    delivered: transports.filter((t) => t.status === 'delivered').length,
  };

  const insuranceStats = {
    total: insurances.length,
    active: insurances.filter((i) => i.status === 'active').length,
    expiringSoon: insurances.filter((i) => i.status === 'expiring_soon').length,
    expired: insurances.filter((i) => i.status === 'expired').length,
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink-800 dark:text-ink-100 mb-1">
            运输保险
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            艺术品物流与保险全流程管理
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 transition-colors shadow-gold"
          >
            <Plus className="w-4 h-4" />
            新建运输
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 rounded-lg border border-ink-200 dark:border-ink-700 overflow-hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-gold-500 text-white'
                      : 'text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder={activeTab === 'transport' ? '搜索运单、作品...' : '搜索保单、作品...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-sm text-ink-700 dark:text-ink-200 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
            />
          </div>
        </div>
      </div>

      {activeTab === 'transport' ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">运输总数</p>
              <p className="text-2xl font-display font-semibold text-ink-800 dark:text-ink-100">
                {transportStats.total}
              </p>
            </div>
            <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">运输中</p>
              <p className="text-2xl font-display font-semibold text-blue-500">
                {transportStats.inTransit}
              </p>
            </div>
            <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">延误</p>
              <p className="text-2xl font-display font-semibold text-orange-500">
                {transportStats.delayed}
              </p>
            </div>
            <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">已送达</p>
              <p className="text-2xl font-display font-semibold text-emerald-500">
                {transportStats.delivered}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTransports.map((transport) => (
              <TransportCard key={transport.id} transport={transport} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">保单总数</p>
              <p className="text-2xl font-display font-semibold text-ink-800 dark:text-ink-100">
                {insuranceStats.total}
              </p>
            </div>
            <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">有效保单</p>
              <p className="text-2xl font-display font-semibold text-emerald-500">
                {insuranceStats.active}
              </p>
            </div>
            <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">即将到期</p>
              <p className="text-2xl font-display font-semibold text-amber-500">
                {insuranceStats.expiringSoon}
              </p>
            </div>
            <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">已过期</p>
              <p className="text-2xl font-display font-semibold text-gray-500">
                {insuranceStats.expired}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInsurances.map((insurance) => (
              <InsuranceCard key={insurance.id} insurance={insurance} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
