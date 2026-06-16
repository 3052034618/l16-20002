import { Bell, Search, Moon, Sun, User, ChevronDown, Download, LogOut, UserPlus, CheckCircle, FileText, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, getRoleText, formatCurrency } from '@/utils';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showExport?: boolean;
  onExport?: () => void;
}

export default function Header({ title, subtitle, showExport, onExport }: HeaderProps) {
  const { currentUser, darkMode, toggleDarkMode, dashboardData, users, setCurrentUser, exhibitions, artists, artworks, sales } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSwitchUser, setShowSwitchUser] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const pendingCount = dashboardData?.overview?.pendingApprovals || 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchUser = (user: typeof users[0]) => {
    setCurrentUser(user);
    setShowUserMenu(false);
    setShowSwitchUser(false);
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
    onExport?.();
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
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 h-9 rounded-lg bg-gold-500 text-white text-sm font-medium hover:bg-gold-600 transition-colors shadow-gold"
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

        <div className="relative" ref={userMenuRef}>
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
