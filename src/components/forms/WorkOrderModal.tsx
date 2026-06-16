import { useState, useEffect } from 'react';
import { Wrench, Settings, CheckCircle2, Clock, User, AlertTriangle, ArrowRight, MapPin } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, formatDate, formatRelativeTime } from '@/utils';
import Modal from '@/components/common/Modal';
import type { Alert, WorkOrder } from '@/types';

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: Alert | null;
}

interface WorkOrderListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkOrderModal({ isOpen, onClose, alert }: WorkOrderModalProps) {
  const { createWorkOrder, adjustEquipment, currentUser } = useAppStore();
  const [description, setDescription] = useState('');
  const [actionType, setActionType] = useState<'adjust' | 'workorder' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setDescription('');
    setActionType(null);
    setShowSuccess(false);
  }, [alert]);

  if (!alert) return null;

  const handleSubmit = async () => {
    if (actionType === 'adjust') {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      adjustEquipment(alert.id);
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => onClose(), 2000);
    } else if (actionType === 'workorder' && description) {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      createWorkOrder(alert.id, description);
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => onClose(), 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="处理告警" size="md">
      {showSuccess ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-medium text-ink-800 dark:text-ink-100 mb-2">处理成功！</h3>
          <p className="text-ink-500 dark:text-ink-400">
            {actionType === 'adjust' ? '设备已调节，环境参数恢复正常' : '维修工单已创建'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={cn(
            'p-4 rounded-xl border-l-4',
            alert.level === 'warning' ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/5' :
            alert.level === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-500/5' :
            'border-red-600 bg-red-100 dark:bg-red-600/10'
          )}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={cn(
                'w-6 h-6 shrink-0 mt-0.5',
                alert.level === 'warning' ? 'text-amber-500' : 'text-red-500'
              )} />
              <div>
                <h4 className="font-medium text-ink-800 dark:text-ink-100">
                  {alert.hallName} - {alert.type}
                </h4>
                <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
                  {alert.message}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-ink-400">
                  <span>当前值: {alert.value}</span>
                  <span>阈值: {alert.threshold}</span>
                  <span>持续: {formatRelativeTime(alert.startTime)}</span>
                </div>
              </div>
            </div>
          </div>

          {!actionType ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setActionType('adjust')}
                className="flex flex-col items-center p-6 rounded-xl border-2 border-ink-200 dark:border-ink-600 hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
              >
                <Settings className="w-10 h-10 mb-3 text-ink-400 group-hover:text-blue-500 transition-colors" />
                <span className="font-medium text-ink-700 dark:text-ink-300 group-hover:text-blue-500 transition-colors">
                  调节设备
                </span>
                <span className="text-xs text-ink-400 mt-1 text-center">
                  远程调节空调/除湿设备
                </span>
              </button>
              <button
                onClick={() => setActionType('workorder')}
                className="flex flex-col items-center p-6 rounded-xl border-2 border-ink-200 dark:border-ink-600 hover:border-gold-500 hover:bg-gold-500/5 transition-all group"
              >
                <Wrench className="w-10 h-10 mb-3 text-ink-400 group-hover:text-gold-500 transition-colors" />
                <span className="font-medium text-ink-700 dark:text-ink-300 group-hover:text-gold-500 transition-colors">
                  生成工单
                </span>
                <span className="text-xs text-ink-400 mt-1 text-center">
                  创建维修工单派发给技术人员
                </span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {actionType === 'workorder' && (
                <div>
                  <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                    问题描述 *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="请详细描述问题和维修要求"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 resize-none"
                  />
                  <div className="mt-2 p-3 rounded-lg bg-ink-50 dark:bg-ink-700/30">
                    <p className="text-xs text-ink-500 dark:text-ink-400">
                      工单将分配给: <span className="font-medium text-ink-700 dark:text-ink-300">{currentUser.name}</span>
                    </p>
                  </div>
                </div>
              )}

              {actionType === 'adjust' && (
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    系统将自动调节相关设备参数，使环境恢复正常范围。调节过程约需1-2分钟。
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-ink-200 dark:border-ink-700">
                <button
                  onClick={() => setActionType(null)}
                  className="px-5 py-2.5 rounded-lg border border-ink-200 dark:border-ink-600 text-ink-600 dark:text-ink-300 font-medium hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
                >
                  返回
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || (actionType === 'workorder' && !description)}
                  className={cn(
                    'px-5 py-2.5 rounded-lg text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2',
                    actionType === 'adjust' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gold-500 hover:bg-gold-600'
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      处理中...
                    </>
                  ) : (
                    actionType === 'adjust' ? '确认调节' : '创建工单'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export function WorkOrderListModal({ isOpen, onClose }: WorkOrderListModalProps) {
  const { workOrders, alerts, updateWorkOrder, currentUser } = useAppStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredOrders = selectedStatus === 'all' 
    ? workOrders 
    : workOrders.filter(w => w.status === selectedStatus);

  const getAlert = (alertId: string) => alerts.find(a => a.id === alertId);

  const statusColors: Record<string, string> = {
    open: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  };

  const statusText: Record<string, string> = {
    open: '待处理',
    in_progress: '处理中',
    resolved: '已完成',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="维修工单" size="xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {['all', 'open', 'in_progress', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                selectedStatus === status
                  ? 'bg-gold-500 text-white'
                  : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700'
              )}
            >
              {status === 'all' ? '全部' : statusText[status]}
              <span className="ml-1 text-xs opacity-70">
                ({status === 'all' ? workOrders.length : workOrders.filter(w => w.status === status).length})
              </span>
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 mx-auto mb-4 text-ink-300" />
            <p className="text-ink-500 dark:text-ink-400">暂无工单</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {filteredOrders.map(order => {
              const alert = getAlert(order.alertId);
              return (
                <div
                  key={order.id}
                  className="p-4 rounded-xl bg-white dark:bg-ink-800/50 border border-ink-200 dark:border-ink-700/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-ink-800 dark:text-ink-100">
                          {alert?.hallName || order.location} - {order.type}
                        </h4>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          statusColors[order.status]
                        )}>
                          {statusText[order.status]}
                        </span>
                        {alert?.level === 'escalated' && (
                          <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            已升级
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-ink-500 dark:text-ink-400 mb-3">
                        {order.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-xs text-ink-400">
                          <MapPin className="w-3.5 h-3.5 text-gold-500" />
                          <span className="text-ink-500 dark:text-ink-400">位置:</span>
                          <span className="text-ink-700 dark:text-ink-300 font-medium">{order.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-ink-400">
                          <User className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-ink-500 dark:text-ink-400">处理人:</span>
                          <span className="text-ink-700 dark:text-ink-300 font-medium">{order.assignee}</span>
                        </div>
                      </div>

                      {order.status !== 'resolved' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-ink-500 dark:text-ink-400">处理进度</span>
                            <span className="text-ink-700 dark:text-ink-300 font-medium">{order.progress}%</span>
                          </div>
                          <div className="h-2 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                'h-full rounded-full transition-all duration-300',
                                order.progress === 100 ? 'bg-emerald-500' : 
                                order.progress > 50 ? 'bg-blue-500' : 'bg-gold-500'
                              )}
                              style={{ width: `${order.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {order.notes && (
                        <div className="p-3 rounded-lg bg-ink-50 dark:bg-ink-700/50 text-xs text-ink-500 dark:text-ink-400">
                          <span className="font-medium text-ink-700 dark:text-ink-300">处理备注: </span>
                          {order.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-ink-200 dark:border-ink-700">
                    <div className="flex items-center gap-4 text-xs text-ink-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        创建于 {formatDate(order.createdAt)}
                      </span>
                      {order.resolvedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          完成于 {formatRelativeTime(order.resolvedAt)}
                        </span>
                      )}
                    </div>

                    {order.status !== 'resolved' && (
                      <div className="flex items-center gap-2">
                        {order.status === 'open' && (
                          <button
                            onClick={() => updateWorkOrder(order.id, { status: 'in_progress', progress: 20 })}
                            className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            开始处理
                          </button>
                        )}
                        {order.status === 'in_progress' && (
                          <>
                            <button
                              onClick={() => updateWorkOrder(order.id, { progress: Math.min(order.progress + 20, 80) })}
                              className="flex items-center gap-1 px-3 py-1 text-xs bg-gold-100 dark:bg-gold-500/20 text-gold-600 dark:text-gold-400 rounded-lg hover:bg-gold-200 dark:hover:bg-gold-500/30 transition-colors"
                            >
                              更新进度
                            </button>
                            <button
                              onClick={() => updateWorkOrder(order.id, { status: 'resolved', progress: 100, resolvedAt: new Date().toISOString() })}
                              className="flex items-center gap-1 px-3 py-1 text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              完成
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
