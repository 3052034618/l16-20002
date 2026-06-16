import { useEffect, useState } from 'react';
import {
  BarChart3,
  Eye,
  Truck,
  AlertTriangle,
  TrendingUp,
  Clock,
  MapPin,
  ChevronRight,
  Thermometer,
  Droplets,
  Sun,
  Palette,
  Download,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, formatCurrency, formatRelativeTime, getStatusColor, getStatusText } from '@/utils';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  color = 'gold',
}: {
  icon: any;
  label: string;
  value: string;
  subValue?: string;
  trend?: string;
  color?: 'gold' | 'emerald' | 'blue' | 'amber';
}) {
  const colorClasses = {
    gold: 'from-gold-500/20 to-gold-600/10 text-gold-500 border-gold-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/10 text-emerald-500 border-emerald-500/30',
    blue: 'from-blue-500/20 to-blue-600/10 text-blue-500 border-blue-500/30',
    amber: 'from-amber-500/20 to-amber-600/10 text-amber-500 border-amber-500/30',
  };

  return (
    <div className="bg-white dark:bg-ink-800/50 rounded-xl p-5 border border-ink-200 dark:border-ink-700/50 shadow-card hover:shadow-card-hover transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center border',
            colorClasses[color]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">{label}</p>
      <p className="text-2xl font-display font-semibold text-ink-800 dark:text-ink-100 number-roll">
        {value}
      </p>
      {subValue && (
        <p className="text-xs text-ink-400 mt-1">{subValue}</p>
      )}
    </div>
  );
}

function HallCard({ hall }: { hall: any }) {
  const tempColor =
    hall.temperature > 24 ? 'text-amber-500' : 'text-emerald-500';
  const humidityColor =
    hall.humidity > 60 ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50 hover:border-gold-500/50 transition-all duration-300 group cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-ink-800 dark:text-ink-100">{hall.hallName}</h3>
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            hall.envStatus === 'normal'
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 alert-pulse'
          )}
        >
          {hall.envStatus === 'normal' ? '正常' : '告警'}
        </span>
      </div>
      <p className="text-sm text-ink-500 dark:text-ink-400 mb-3 truncate">
        {hall.currentExhibition}
      </p>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-gold-500" />
          <span className="text-sm text-ink-600 dark:text-ink-300">
            {hall.visitorCount}人
          </span>
        </div>
        <div className="flex-1 h-1.5 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-1000"
            style={{ width: `${hall.heatIndex}%` }}
          />
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <Thermometer className={cn('w-3.5 h-3.5', tempColor)} />
          <span className={tempColor}>{hall.temperature.toFixed(1)}°C</span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets className={cn('w-3.5 h-3.5', humidityColor)} />
          <span className={humidityColor}>{hall.humidity.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

function EnvChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white dark:bg-ink-800/50 rounded-xl p-5 border border-ink-200 dark:border-ink-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-ink-800 dark:text-ink-100">环境趋势</h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-gold-500 rounded" />
            温度
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-500 rounded" />
            湿度
          </span>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a2e',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#d4af37"
              strokeWidth={2}
              fill="url(#tempGradient)"
              name="温度(°C)"
            />
            <Area
              type="monotone"
              dataKey="humidity"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#humidityGradient)"
              name="湿度(%)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function InstallationProgressCard({ installation }: { installation: any }) {
  return (
    <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-ink-800 dark:text-ink-100 truncate">
          {installation.exhibitionName}
        </h4>
        <span className="text-xs text-ink-400 shrink-0">
          {installation.dueDate}截止
        </span>
      </div>
      <p className="text-xs text-ink-400 mb-3">{installation.hallName}</p>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-1000"
            style={{ width: `${installation.progress}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gold-500 w-12 text-right">
          {installation.progress}%
        </span>
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-ink-400">
        <span>已完成 {installation.completedTasks}/{installation.totalTasks} 个任务</span>
      </div>
    </div>
  );
}

function TransportCard({ transport }: { transport: any }) {
  return (
    <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50 hover:border-gold-500/30 transition-colors cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-ink-800 dark:text-ink-100 truncate">
          {transport.artworkTitle}
        </h4>
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full shrink-0',
            getStatusColor(transport.status)
          )}
        >
          {getStatusText(transport.status)}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400 mb-3">
        <MapPin className="w-3.5 h-3.5" />
        <span className="truncate">{transport.currentLocation}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-ink-400">
          <Truck className="w-3.5 h-3.5" />
          <span>预计 {transport.estimatedArrival}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-ink-300" />
      </div>
    </div>
  );
}

function AlertItem({ alert }: { alert: any }) {
  const levelColors = {
    warning: 'border-amber-500/50 bg-amber-500/5',
    critical: 'border-red-500/50 bg-red-500/5',
    escalated: 'border-red-600/50 bg-red-600/5',
  };

  return (
    <div
      className={cn(
        'p-3 rounded-lg border-l-4 mb-2 last:mb-0',
        levelColors[alert.level] || levelColors.warning
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <AlertTriangle
            className={cn(
              'w-4 h-4 mt-0.5 shrink-0',
              alert.level === 'critical' || alert.level === 'escalated'
                ? 'text-red-500'
                : 'text-amber-500'
            )}
          />
          <div>
            <p className="text-sm font-medium text-ink-700 dark:text-ink-200">
              {alert.hallName} - {alert.type}
            </p>
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
              {alert.message}
            </p>
          </div>
        </div>
        <span className="text-xs text-ink-400 shrink-0">
          {formatRelativeTime(alert.startTime)}
        </span>
      </div>
    </div>
  );
}

const envChartData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  temperature: 21 + Math.sin(i / 4) * 2 + Math.random() * 0.5,
  humidity: 50 + Math.cos(i / 5) * 5 + Math.random() * 2,
}));

export default function Dashboard() {
  const { dashboardData, updateDashboardData, recalculateDashboardData, visibleWidgets } = useAppStore();
  const [refreshTime, setRefreshTime] = useState(new Date());
  const [exportToast, setExportToast] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      updateDashboardData();
      setRefreshTime(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [updateDashboardData]);

  useEffect(() => {
    recalculateDashboardData();
  }, [recalculateDashboardData]);

  const handleExport = (type: 'monthly' | 'flow') => {
    setExportToast(type === 'monthly' ? '月度运营报告已下载' : '藏品流动明细已下载');
    setTimeout(() => setExportToast(null), 3000);
  };

  const { overview, halls, environment, installations, logistics, recentAlerts, recentActivities } =
    dashboardData;

  const collectionData = [
    { name: '油画', value: 45, color: '#d4af37' },
    { name: '国画', value: 28, color: '#3b82f6' },
    { name: '雕塑', value: 12, color: '#10b981' },
    { name: '摄影', value: 25, color: '#f59e0b' },
    { name: '装置', value: 18, color: '#8b5cf6' },
  ];

  const showWidget = (id: string) => visibleWidgets.includes(id);

  return (
    <div className="p-6 space-y-6">
      <DashboardFilters onExport={handleExport} />

      {exportToast && (
        <div className="fixed top-20 right-6 z-50 px-6 py-3 bg-emerald-500 text-white rounded-lg shadow-lg animate-fade-in flex items-center gap-2">
          <Download className="w-4 h-4" />
          {exportToast}
        </div>
      )}
      
      {(showWidget('stat_total') || showWidget('stat_visitors') || showWidget('stat_exhibitions') || showWidget('stat_intransit') || showWidget('stat_value') || showWidget('stat_pending')) && (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {showWidget('stat_total') && (
        <StatCard
          icon={BarChart3}
          label="藏品总数"
          value={overview.totalArtworks.toString()}
          subValue="件艺术品"
          trend="+3.2%"
          color="gold"
        />
        )}
        {showWidget('stat_visitors') && (
        <StatCard
          icon={Eye}
          label="今日访客"
          value={overview.todayVisitors.toString()}
          subValue="人次"
          trend="+12.5%"
          color="emerald"
        />
        )}
        {showWidget('stat_exhibitions') && (
        <StatCard
          icon={Palette}
          label="进行中展览"
          value={overview.activeExhibitions.toString()}
          subValue="个"
          color="blue"
        />
        )}
        {showWidget('stat_intransit') && (
        <StatCard
          icon={Truck}
          label="在途运输"
          value={overview.inTransit.toString()}
          subValue="件作品"
          color="amber"
        />
        )}
        {showWidget('stat_value') && (
        <StatCard
          icon={BarChart3}
          label="藏品总值"
          value={formatCurrency(overview.totalValue)}
          subValue="人民币"
          color="gold"
        />
        )}
        {showWidget('stat_pending') && (
        <StatCard
          icon={Clock}
          label="待审批"
          value={overview.pendingApprovals.toString()}
          subValue="个申请"
          color="amber"
        />
        )}
      </div>
      )}

      {(showWidget('chart_halls') || showWidget('chart_collection')) && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {showWidget('chart_halls') && (
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-ink-800 dark:text-ink-100">
              展厅实时状态
            </h2>
            <span className="text-xs text-ink-400">
              最后更新: {refreshTime.toLocaleTimeString('zh-CN')}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {halls.map((hall) => (
              <HallCard key={hall.hallId} hall={hall} />
            ))}
          </div>
        </div>
        )}

        {showWidget('chart_collection') && (
        <div>
          <h2 className="text-lg font-display font-semibold text-ink-800 dark:text-ink-100 mb-4">
            藏品分类
          </h2>
          <div className="bg-white dark:bg-ink-800/50 rounded-xl p-5 border border-ink-200 dark:border-ink-700/50 h-full">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={collectionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {collectionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {collectionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-ink-600 dark:text-ink-400">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>
      )}

      {(showWidget('chart_env') || showWidget('chart_compliance')) && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {showWidget('chart_env') && (
        <div className="lg:col-span-2">
          <EnvChart data={envChartData} />
        </div>
        )}

        {showWidget('chart_compliance') && (
        <div>
          <h2 className="text-lg font-display font-semibold text-ink-800 dark:text-ink-100 mb-4">
            环境达标率
          </h2>
          <div className="bg-white dark:bg-ink-800/50 rounded-xl p-5 border border-ink-200 dark:border-ink-700/50">
            <div className="text-center mb-6">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-ink-100 dark:text-ink-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#d4af37"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${environment.overallCompliance * 2.64} 264`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-display font-bold text-ink-800 dark:text-ink-100">
                    {environment.overallCompliance.toFixed(1)}%
                  </span>
                  <span className="text-xs text-ink-400">综合达标率</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-500 dark:text-ink-400">正常展厅</span>
                <span className="font-medium text-emerald-500">{environment.normalHalls} 个</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-500 dark:text-ink-400">告警展厅</span>
                <span className="font-medium text-amber-500">{environment.warningHalls} 个</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-500 dark:text-ink-400">今日告警</span>
                <span className="font-medium text-red-500">{environment.alertsToday} 次</span>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
      )}

      {(showWidget('section_installations') || showWidget('section_logistics') || showWidget('section_alerts')) && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {showWidget('section_installations') && (
        <div>
          <h2 className="text-lg font-display font-semibold text-ink-800 dark:text-ink-100 mb-4">
            布展进度
          </h2>
          <div className="space-y-3">
            {installations.map((inst) => (
              <InstallationProgressCard key={inst.exhibitionId} installation={inst} />
            ))}
          </div>
        </div>
        )}

        {showWidget('section_logistics') && (
        <div>
          <h2 className="text-lg font-display font-semibold text-ink-800 dark:text-ink-100 mb-4">
            在途运输
          </h2>
          <div className="space-y-3">
            {logistics.map((trans) => (
              <TransportCard key={trans.transportId} transport={trans} />
            ))}
          </div>
        </div>
        )}

        {showWidget('section_alerts') && (
        <div>
          <h2 className="text-lg font-display font-semibold text-ink-800 dark:text-ink-100 mb-4">
            最新告警
          </h2>
          <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50 max-h-80 overflow-y-auto">
            {recentAlerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
        )}
      </div>
      )}
    </div>
  );
}
