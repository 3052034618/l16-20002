import {
  LayoutDashboard,
  Image,
  Palette,
  ShoppingCart,
  ClipboardList,
  Thermometer,
  Truck,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/utils';

const menuItems = [
  { id: 'dashboard', label: '首页大屏', icon: LayoutDashboard },
  { id: 'collections', label: '藏品管理', icon: Image },
  { id: 'exhibitions', label: '展览策划', icon: Palette },
  { id: 'sales', label: '销售租赁', icon: ShoppingCart },
  { id: 'tasks', label: '布展任务', icon: ClipboardList },
  { id: 'environment', label: '环境监控', icon: Thermometer },
  { id: 'logistics', label: '运输保险', icon: Truck },
  { id: 'settings', label: '系统设置', icon: Settings },
];

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        'h-screen bg-ink-900 text-ink-200 flex flex-col transition-all duration-300 border-r border-gold-500/20',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-gold-500/20">
        <div
          className={cn(
            'flex items-center gap-3 overflow-hidden',
            sidebarCollapsed ? 'justify-center w-full' : ''
          )}
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shrink-0">
            <span className="text-ink-900 font-display font-bold text-lg">艺</span>
          </div>
          {!sidebarCollapsed && (
            <div className="animate-fade-in">
              <h1 className="font-display text-lg font-semibold text-gold-400">艺管系统</h1>
              <p className="text-xs text-ink-400">Art Management</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                    sidebarCollapsed ? 'justify-center' : '',
                    isActive
                      ? 'bg-gold-500/20 text-gold-400 shadow-gold'
                      : 'text-ink-300 hover:bg-ink-800 hover:text-gold-300'
                  )}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 shrink-0 transition-transform',
                      isActive ? 'text-gold-400' : 'text-ink-400 group-hover:text-gold-300'
                    )}
                  />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium animate-fade-in">{item.label}</span>
                  )}
                  {isActive && !sidebarCollapsed && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400 shadow-lg shadow-gold-400/50" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        onClick={toggleSidebar}
        className="h-12 border-t border-gold-500/20 flex items-center justify-center text-ink-400 hover:text-gold-400 hover:bg-ink-800 transition-colors"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
}
