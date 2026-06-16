import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Dashboard from '@/pages/Dashboard';
import Collections from '@/pages/Collections';
import Exhibitions from '@/pages/Exhibitions';
import Sales from '@/pages/Sales';
import Tasks from '@/pages/Tasks';
import Environment from '@/pages/Environment';
import Logistics from '@/pages/Logistics';
import Settings from '@/pages/Settings';
import { useAppStore } from '@/store/useAppStore';
import { useEffect } from 'react';

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  dashboard: { title: '运营总览', subtitle: '实时数据大屏监控' },
  collections: { title: '藏品管理', subtitle: '艺术品全生命周期管理' },
  exhibitions: { title: '展览策划', subtitle: '智能布展方案推荐' },
  sales: { title: '销售租赁', subtitle: '三级审批流程管理' },
  tasks: { title: '布展任务', subtitle: '按工种自动分配调度' },
  environment: { title: '环境监控', subtitle: '温湿度紫外线实时监测' },
  logistics: { title: '运输保险', subtitle: '物流追踪与保险管理' },
  settings: { title: '系统设置', subtitle: '用户权限与参数配置' },
};

function App() {
  const { currentPage, setCurrentPage, darkMode } = useAppStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleExport = () => {
    alert('导出功能：生成月度运营报告和藏品流动明细');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'collections':
        return <Collections />;
      case 'exhibitions':
        return <Exhibitions />;
      case 'sales':
        return <Sales />;
      case 'tasks':
        return <Tasks />;
      case 'environment':
        return <Environment />;
      case 'logistics':
        return <Logistics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const pageInfo = pageTitles[currentPage] || { title: '', subtitle: '' };
  const showExport = currentPage === 'dashboard';

  return (
    <div className="flex h-screen bg-ivory-200 dark:bg-ink-950 transition-colors duration-300">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          showExport={showExport}
          onExport={handleExport}
        />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
