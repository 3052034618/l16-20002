import { Bell, Search, Moon, Sun, User, ChevronDown, Download, LogOut, UserPlus, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, getRoleText } from '@/utils';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showExport?: boolean;
  onExport?: () => void;
}

export default function Header({ title, subtitle, showExport, onExport }: HeaderProps) {
  const { currentUser, darkMode, toggleDarkMode, dashboardData, users, setCurrentUser } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSwitchUser, setShowSwitchUser] = useState(false);

  const pendingCount = dashboardData?.overview?.pendingApprovals || 0;

  const handleSwitchUser = (user: typeof users[0]) => {
    setCurrentUser(user);
    setShowUserMenu(false);
    setShowSwitchUser(false);
  };

  return (
    <header className="h-16 bg-white dark:bg-ink-900 border-b border-ink-200 dark:border-ink-800 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink-800 dark:text-ink-100">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-ink-500 dark:text-ink-400">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="搜索作品、展览..."
            className="w-64 h-9 pl-10 pr-4 rounded-lg bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-sm text-ink-700 dark:text-ink-200 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
          />
        </div>

        {showExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 h-9 rounded-lg bg-gold-500 text-white text-sm font-medium hover:bg-gold-600 transition-colors shadow-gold"
          >
            <Download className="w-4 h-4" />
            导出报告
          </button>
        )}

        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-lg bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 flex items-center justify-center text-ink-500 dark:text-ink-400 hover:text-gold-500 hover:border-gold-500/50 transition-all"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button className="relative w-9 h-9 rounded-lg bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 flex items-center justify-center text-ink-500 dark:text-ink-400 hover:text-gold-500 hover:border-gold-500/50 transition-all">
          <Bell className="w-4 h-4" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-3 pr-2 h-9 rounded-lg bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 hover:border-gold-500/50 transition-all"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <div className="text-left">
              <p className="text-sm font-medium text-ink-700 dark:text-ink-200">
                {currentUser.name}
              </p>
              <p className="text-xs text-ink-400">{getRoleText(currentUser.role)}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-ink-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-white dark:bg-ink-800 rounded-lg shadow-lg border border-ink-200 dark:border-ink-700 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-ink-100 dark:border-ink-700">
                <p className="text-sm font-medium text-ink-700 dark:text-ink-200">
                  {currentUser.name}
                </p>
                <p className="text-xs text-ink-400">{currentUser.email}</p>
                <p className="text-xs text-gold-500 mt-1">{getRoleText(currentUser.role)}</p>
              </div>
              <button 
                onClick={() => setShowSwitchUser(!showSwitchUser)}
                className="w-full px-4 py-2 text-left text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                切换身份
              </button>
              
              {showSwitchUser && (
                <div className="border-t border-ink-100 dark:border-ink-700 py-2">
                  <p className="px-4 py-1 text-xs text-ink-400">选择身份登录</p>
                  {users.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleSwitchUser(user)}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors flex items-center gap-2',
                        currentUser.id === user.id 
                          ? 'bg-gold-50 dark:bg-gold-500/10 text-gold-600 dark:text-gold-400'
                          : 'text-ink-600 dark:text-ink-300'
                      )}
                    >
                      <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{user.name}</p>
                        <p className="text-xs text-ink-400">{getRoleText(user.role)}</p>
                      </div>
                      {currentUser.id === user.id && (
                        <CheckCircle className="w-4 h-4 text-gold-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              <button className="w-full px-4 py-2 text-left text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors flex items-center gap-2">
                <User className="w-4 h-4" />
                个人设置
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
