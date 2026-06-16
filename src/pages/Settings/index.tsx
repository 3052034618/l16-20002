import { useState } from 'react';
import {
  Users,
  Settings as SettingsIcon,
  SlidersHorizontal,
  Bell,
  Shield,
  Database,
  ChevronRight,
  Edit,
  Plus,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, getRoleText } from '@/utils';

const settingsSections = [
  { id: 'users', label: '用户管理', icon: Users },
  { id: 'valuation', label: '估值规则', icon: SlidersHorizontal },
  { id: 'notifications', label: '通知设置', icon: Bell },
  { id: 'permissions', label: '权限配置', icon: Shield },
  { id: 'data', label: '数据管理', icon: Database },
];

function UsersSection() {
  const { users } = useAppStore();
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const roleColors: Record<string, string> = {
    director: 'bg-gold-100 text-gold-700 dark:bg-gold-500/20 dark:text-gold-400',
    curator: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    keeper: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    artist: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  };

  const filteredUsers =
    selectedRole === 'all' ? users : users.filter((u) => u.role === selectedRole);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-ink-800 dark:text-ink-100">
          用户列表
        </h3>
        <div className="flex items-center gap-3">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-sm text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
          >
            <option value="all">全部角色</option>
            <option value="director">馆长</option>
            <option value="curator">策展人</option>
            <option value="keeper">保管员</option>
            <option value="artist">艺术家</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-white rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors">
            <Plus className="w-4 h-4" />
            添加用户
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-ink-800/50 rounded-xl border border-ink-200 dark:border-ink-700/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-ink-50 dark:bg-ink-700/50 border-b border-ink-200 dark:border-ink-700">
              <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                用户
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                邮箱
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                角色
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-ink-100 dark:border-ink-700/50 last:border-0 hover:bg-ink-50 dark:hover:bg-ink-700/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <span className="font-medium text-ink-700 dark:text-ink-200">
                      {user.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-ink-600 dark:text-ink-300">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-full font-medium',
                      roleColors[user.role]
                    )}
                  >
                    {getRoleText(user.role)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 text-ink-400 hover:text-gold-500 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ValuationSection() {
  const { valuationRules, updateValuationRules, currentUser, hasPermission } = useAppStore();
  const [rules, setRules] = useState(valuationRules);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const canEdit = currentUser.role === 'director';

  const handleSave = () => {
    updateValuationRules(rules);
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="relative">
      {showSuccess && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-emerald-500 text-white rounded-lg shadow-lg animate-fade-in flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          估值规则保存成功
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-ink-800 dark:text-ink-100">
          估值规则配置
        </h3>
        <div className="flex items-center gap-3">
          {!canEdit && (
            <span className="text-xs text-amber-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              仅馆长可修改估值规则
            </span>
          )}
          <label className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300">
            <input
              type="checkbox"
              checked={rules.autoValuationEnabled}
              onChange={(e) =>
                canEdit && setRules({ ...rules, autoValuationEnabled: e.target.checked })
              }
              disabled={!canEdit}
              className="w-4 h-4 rounded border-ink-300 text-gold-500 focus:ring-gold-500/50 disabled:opacity-50"
            />
            启用自动估值
          </label>
          {canEdit && (
            <>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-ink-500 text-sm hover:text-ink-700 dark:hover:text-ink-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-gold-500 text-white rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    保存
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300 rounded-lg text-sm font-medium hover:bg-ink-200 dark:hover:bg-ink-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  编辑
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-ink-800/50 rounded-xl p-5 border border-ink-200 dark:border-ink-700/50">
          <h4 className="font-medium text-ink-700 dark:text-ink-200 mb-4">权重配置</h4>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-ink-600 dark:text-ink-300">
                  艺术家声望权重
                </label>
                <span className="text-sm font-medium text-gold-500">
                  {(rules.artistReputationWeight * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={rules.artistReputationWeight}
                onChange={(e) =>
                  setRules({ ...rules, artistReputationWeight: parseFloat(e.target.value) })
                }
                disabled={!isEditing || !canEdit}
                className="w-full h-2 bg-ink-200 dark:bg-ink-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gold-500 [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-ink-600 dark:text-ink-300">
                  成交记录权重
                </label>
                <span className="text-sm font-medium text-gold-500">
                  {(rules.salesHistoryWeight * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={rules.salesHistoryWeight}
                onChange={(e) =>
                  setRules({ ...rules, salesHistoryWeight: parseFloat(e.target.value) })
                }
                disabled={!isEditing || !canEdit}
                className="w-full h-2 bg-ink-200 dark:bg-ink-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gold-500 [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-ink-600 dark:text-ink-300">
                  市场趋势权重
                </label>
                <span className="text-sm font-medium text-gold-500">
                  {(rules.marketTrendWeight * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={rules.marketTrendWeight}
                onChange={(e) =>
                  setRules({ ...rules, marketTrendWeight: parseFloat(e.target.value) })
                }
                disabled={!isEditing || !canEdit}
                className="w-full h-2 bg-ink-200 dark:bg-ink-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gold-500 [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-ink-800/50 rounded-xl p-5 border border-ink-200 dark:border-ink-700/50">
          <h4 className="font-medium text-ink-700 dark:text-ink-200 mb-4">材质系数</h4>
          <div className="space-y-3">
            {Object.entries(rules.materialMultiplier).map(([material, multiplier]) => (
              <div key={material} className="flex items-center justify-between">
                <span className="text-sm text-ink-600 dark:text-ink-300">{material}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={multiplier}
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        materialMultiplier: {
                          ...rules.materialMultiplier,
                          [material]: parseFloat(e.target.value),
                        },
                      })
                    }
                    disabled={!isEditing || !canEdit}
                    step="0.1"
                    className="w-20 px-2 py-1 text-sm rounded bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-right"
                  />
                  <span className="text-xs text-ink-400">倍</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState('users');

  const renderSection = () => {
    switch (activeSection) {
      case 'users':
        return <UsersSection />;
      case 'valuation':
        return <ValuationSection />;
      default:
        return (
          <div className="text-center py-16">
            <SettingsIcon className="w-12 h-12 mx-auto mb-4 text-ink-300" />
            <p className="text-ink-500 dark:text-ink-400">该功能正在开发中</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold text-ink-800 dark:text-ink-100 mb-1">
          系统设置
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400">
          管理用户、配置系统参数
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-56 shrink-0">
          <div className="bg-white dark:bg-ink-800/50 rounded-xl border border-ink-200 dark:border-ink-700/50 p-2">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left',
                    activeSection === section.id
                      ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400'
                      : 'text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700/50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{section.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
