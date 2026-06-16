import { useState } from 'react';
import {
  Plus,
  Calendar,
  User,
  Clock,
  GripVertical,
  Check,
  MoreHorizontal,
  Camera,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, formatDate, getStatusColor, getTaskTypeText } from '@/utils';

const taskStatuses = [
  { id: 'pending', label: '待分配', color: 'gray' },
  { id: 'assigned', label: '已分配', color: 'blue' },
  { id: 'in_progress', label: '进行中', color: 'amber' },
  { id: 'completed', label: '已完成', color: 'emerald' },
];

const taskTypes = ['all', 'installation', 'lighting', 'packaging', 'transportation', 'security'];

const priorityColors = {
  low: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  medium: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
  high: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',
};

const priorityLabels = {
  low: '低',
  medium: '中',
  high: '高',
};

function TaskCard({ task }: { task: any }) {
  const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();

  return (
    <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-ink-300 dark:text-ink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              priorityColors[task.priority as keyof typeof priorityColors]
            )}
          >
            {priorityLabels[task.priority as keyof typeof priorityLabels]}
          </span>
          <span className="text-xs text-ink-400">{getTaskTypeText(task.type)}</span>
        </div>
        <button className="p-1 text-ink-300 hover:text-ink-500 dark:text-ink-600 dark:hover:text-ink-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <h4 className="font-medium text-ink-800 dark:text-ink-100 mb-2 line-clamp-2">
        {task.title}
      </h4>

      <p className="text-xs text-ink-500 dark:text-ink-400 mb-3 line-clamp-2">
        {task.description}
      </p>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {task.assignee ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white text-[10px] font-medium">
                {task.assignee.charAt(0)}
              </div>
              <span className="text-ink-500 dark:text-ink-400">{task.assignee}</span>
            </div>
          ) : (
            <span className="text-ink-400">未分配</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span className={cn(isOverdue ? 'text-red-500 font-medium' : 'text-ink-400')}>
            {task.dueDate}
          </span>
        </div>
      </div>

      {task.photoUrl && (
        <div className="mt-3">
          <img
            src={task.photoUrl}
            alt="完成照片"
            className="w-full h-20 object-cover rounded-lg"
          />
        </div>
      )}

      {isOverdue && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>已逾期</span>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  status,
  tasks,
}: {
  status: { id: string; label: string; color: string };
  tasks: any[];
}) {
  const colorClasses: Record<string, string> = {
    gray: 'bg-gray-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={cn('w-2.5 h-2.5 rounded-full', colorClasses[status.color])} />
          <h3 className="font-medium text-ink-700 dark:text-ink-200">{status.label}</h3>
          <span className="text-xs text-ink-400 bg-ink-100 dark:bg-ink-700 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button className="text-ink-400 hover:text-gold-500 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-ink-300 dark:text-ink-600">
            <Check className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm">暂无任务</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Tasks() {
  const { tasks } = useAppStore();
  const [activeType, setActiveType] = useState('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const filteredTasks = tasks.filter(
    (task) => activeType === 'all' || task.type === activeType
  );

  const getTasksByStatus = (status: string) =>
    filteredTasks.filter((t) => t.status === status);

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    overdue: tasks.filter(
      (t) => t.status !== 'completed' && new Date(t.dueDate) < new Date()
    ).length,
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink-800 dark:text-ink-100 mb-1">
            布展任务
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            按工种和排班自动分配任务
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 transition-colors shadow-gold"
          >
            <Plus className="w-4 h-4" />
            新建任务
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">任务总数</p>
          <p className="text-2xl font-display font-semibold text-ink-800 dark:text-ink-100">
            {stats.total}
          </p>
        </div>
        <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">进行中</p>
          <p className="text-2xl font-display font-semibold text-blue-500">
            {stats.inProgress}
          </p>
        </div>
        <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">已完成</p>
          <p className="text-2xl font-display font-semibold text-emerald-500">
            {stats.completed}
          </p>
        </div>
        <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50">
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">已逾期</p>
          <p className="text-2xl font-display font-semibold text-red-500">
            {stats.overdue}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {taskTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  activeType === type
                    ? 'bg-gold-500 text-white'
                    : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700'
                )}
              >
                {type === 'all' ? '全部' : getTaskTypeText(type)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-0">
          {taskStatuses.map((status) => (
            <div
              key={status.id}
              className="bg-ink-50 dark:bg-ink-800/30 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50 flex flex-col"
            >
              <KanbanColumn status={status} tasks={getTasksByStatus(status.id)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-ink-800/50 rounded-xl border border-ink-200 dark:border-ink-700/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-ink-50 dark:bg-ink-700/50 border-b border-ink-200 dark:border-ink-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  任务
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  类型
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  负责人
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  状态
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  截止日期
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  优先级
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-ink-100 dark:border-ink-700/50 last:border-0 hover:bg-ink-50 dark:hover:bg-ink-700/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink-700 dark:text-ink-200">
                      {task.title}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600 dark:text-ink-300">
                    {getTaskTypeText(task.type)}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600 dark:text-ink-300">
                    {task.assignee || '未分配'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-full font-medium',
                        getStatusColor(task.status)
                      )}
                    >
                      {taskStatuses.find((s) => s.id === task.status)?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-500 dark:text-ink-400">
                    {task.dueDate}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        priorityColors[task.priority as keyof typeof priorityColors]
                      )}
                    >
                      {priorityLabels[task.priority as keyof typeof priorityLabels]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
