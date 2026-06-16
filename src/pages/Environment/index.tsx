import { useState, useEffect } from 'react';
import {
  Thermometer,
  Droplets,
  Sun,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  RefreshCw,
  Wrench,
  MapPin,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, formatRelativeTime } from '@/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const thresholds = {
  temperature: { min: 18, max: 24 },
  humidity: { min: 40, max: 60 },
  uvIndex: { max: 1 },
};

function SensorCard({ sensor }: { sensor: any }) {
  const tempStatus =
    sensor.currentData.temperature > thresholds.temperature.max ||
    sensor.currentData.temperature < thresholds.temperature.min
      ? 'warning'
      : 'normal';
  const humidityStatus =
    sensor.currentData.humidity > thresholds.humidity.max ||
    sensor.currentData.humidity < thresholds.humidity.min
      ? 'warning'
      : 'normal';
  const uvStatus = sensor.currentData.uvIndex > thresholds.uvIndex.max ? 'warning' : 'normal';

  const overallStatus =
    tempStatus === 'warning' || humidityStatus === 'warning' || uvStatus === 'warning'
      ? 'warning'
      : 'normal';

  return (
    <div
      className={cn(
        'bg-white dark:bg-ink-800/50 rounded-xl p-5 border transition-all duration-300',
        overallStatus === 'warning'
          ? 'border-amber-300 dark:border-amber-500/50 shadow-amber-500/20'
          : 'border-ink-200 dark:border-ink-700/50'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              overallStatus === 'normal'
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 alert-pulse'
            )}
          >
            {overallStatus === 'normal' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-ink-800 dark:text-ink-100">
              {sensor.hallName}
            </h3>
            <p className="text-xs text-ink-400">{sensor.location}</p>
          </div>
        </div>
        <span
          className={cn(
            'text-xs px-2.5 py-1 rounded-full font-medium',
            overallStatus === 'normal'
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
          )}
        >
          {overallStatus === 'normal' ? '正常' : '异常'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <Thermometer
            className={cn(
              'w-5 h-5 mx-auto mb-1',
              tempStatus === 'normal' ? 'text-ink-400' : 'text-amber-500'
            )}
          />
          <p className="text-lg font-semibold text-ink-800 dark:text-ink-100">
            {sensor.currentData.temperature.toFixed(1)}°
          </p>
          <p className="text-xs text-ink-400">温度</p>
        </div>
        <div className="text-center">
          <Droplets
            className={cn(
              'w-5 h-5 mx-auto mb-1',
              humidityStatus === 'normal' ? 'text-ink-400' : 'text-amber-500'
            )}
          />
          <p className="text-lg font-semibold text-ink-800 dark:text-ink-100">
            {sensor.currentData.humidity.toFixed(0)}%
          </p>
          <p className="text-xs text-ink-400">湿度</p>
        </div>
        <div className="text-center">
          <Sun
            className={cn(
              'w-5 h-5 mx-auto mb-1',
              uvStatus === 'normal' ? 'text-ink-400' : 'text-amber-500'
            )}
          />
          <p className="text-lg font-semibold text-ink-800 dark:text-ink-100">
            {sensor.currentData.uvIndex.toFixed(2)}
          </p>
          <p className="text-xs text-ink-400">紫外线</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-ink-100 dark:border-ink-700/50">
        <p className="text-xs text-ink-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            最近更新
          </span>
          <span>{formatRelativeTime(sensor.currentData.timestamp)}</span>
        </p>
      </div>
    </div>
  );
}

function AlertItem({ alert }: { alert: any }) {
  const levelColors = {
    warning: 'border-l-amber-500 bg-amber-50 dark:bg-amber-500/5',
    critical: 'border-l-red-500 bg-red-50 dark:bg-red-500/5',
    escalated: 'border-l-red-600 bg-red-100 dark:bg-red-600/10',
  };

  const levelLabels = {
    warning: '警告',
    critical: '严重',
    escalated: '已升级',
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg border-l-4 mb-3 last:mb-0',
        levelColors[alert.level as keyof typeof levelColors]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className={cn(
              'w-5 h-5 mt-0.5 shrink-0',
              alert.level === 'warning' ? 'text-amber-500' : 'text-red-500'
            )}
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-ink-800 dark:text-ink-100">
                {alert.hallName} - {alert.type}
              </h4>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  alert.level === 'warning'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                )}
              >
                {levelLabels[alert.level as keyof typeof levelLabels]}
              </span>
            </div>
            <p className="text-sm text-ink-500 dark:text-ink-400">
              {alert.message}
            </p>
            <p className="text-xs text-ink-400 mt-2">
              当前值: {alert.value} (阈值: {alert.threshold})
            </p>
          </div>
        </div>
        <button className="text-xs text-ink-400">
          {formatRelativeTime(alert.startTime)}
        </button>
      </div>

      <div className="flex items-center gap-3 mt-3">
        {alert.workOrderId ? (
          <button className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
            <Wrench className="w-3.5 h-3.5" />
            查看工单
          </button>
        ) : (
          <button className="flex items-center gap-1 text-xs text-gold-500 hover:underline">
            <Wrench className="w-3.5 h-3.5" />
            生成工单
          </button>
        )}
        <button className="flex items-center gap-1 text-xs text-ink-500 hover:text-ink-700 dark:hover:text-ink-300">
          <Settings className="w-3.5 h-3.5" />
          调节设备
        </button>
      </div>
    </div>
  );
}

export default function Environment() {
  const { sensors, alerts } = useAppStore();
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeAlerts = alerts.filter((a) => !a.resolvedAt);

  const avgTemperature = () => {
    const temps = sensors.map((s) => s.currentData.temperature);
    return temps.reduce((a, b) => a + b, 0) / temps.length;
  };

  const avgHumidity = () => {
    const hums = sensors.map((s) => s.currentData.humidity);
    return hums.reduce((a, b) => a + b, 0) / hums.length;
  };

  const complianceRate = () => {
    const normalCount = sensors.filter((s) => s.status === 'normal').length;
    return (normalCount / sensors.length) * 100;
  };

  const chartData =
    sensors[0]?.historyData?.map((d) => ({
      time: d.timestamp.split(' ')[1],
      temperature: d.temperature,
      humidity: d.humidity,
    })) || [];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink-800 dark:text-ink-100 mb-1">
            环境监控
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            实时监测温湿度与紫外线
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-400">
            最后更新: {lastUpdate.toLocaleTimeString('zh-CN')}
          </span>
          <button className="flex items-center gap-2 px-4 py-2 bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300 rounded-lg text-sm font-medium hover:bg-ink-200 dark:hover:bg-ink-600 transition-colors">
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
              <Thermometer className="w-5 h-5 text-gold-500" />
            </div>
            <div>
              <p className="text-sm text-ink-500 dark:text-ink-400">平均温度</p>
              <p className="text-xl font-semibold text-ink-800 dark:text-ink-100">
                {avgTemperature().toFixed(1)}°C
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-ink-500 dark:text-ink-400">平均湿度</p>
              <p className="text-xl font-semibold text-ink-800 dark:text-ink-100">
                {avgHumidity().toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-ink-500 dark:text-ink-400">达标率</p>
              <p className="text-xl font-semibold text-ink-800 dark:text-ink-100">
                {complianceRate().toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-ink-500 dark:text-ink-400">活跃告警</p>
              <p className="text-xl font-semibold text-ink-800 dark:text-ink-100">
                {activeAlerts.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-display font-semibold text-ink-800 dark:text-ink-100 mb-4">
            传感器状态
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sensors.map((sensor) => (
              <SensorCard key={sensor.id} sensor={sensor} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-display font-semibold text-ink-800 dark:text-ink-100 mb-4">
            最新告警
          </h2>
          <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50 max-h-[600px] overflow-y-auto">
            {activeAlerts.length > 0 ? (
              activeAlerts.map((alert) => <AlertItem key={alert.id} alert={alert} />)
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                <p className="text-ink-500 dark:text-ink-400 text-sm">暂无告警</p>
                <p className="text-ink-400 text-xs mt-1">所有展厅环境正常</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-display font-semibold text-ink-800 dark:text-ink-100 mb-4">
          环境趋势 (24小时)
        </h2>
        <div className="bg-white dark:bg-ink-800/50 rounded-xl p-5 border border-ink-200 dark:border-ink-700/50">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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
                  dataKey="time"
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
      </div>
    </div>
  );
}
