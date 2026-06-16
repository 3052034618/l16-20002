import { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Clock, AlertTriangle, User, Calendar, DollarSign, FileText } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, formatCurrency, formatDate, getStatusText, getRoleText } from '@/utils';
import Modal from '@/components/common/Modal';
import type { SaleRecord, ApprovalLevel } from '@/types';

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SaleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleRecord | null;
}

export function SaleFormModal({ isOpen, onClose }: SaleFormModalProps) {
  const { artworks, addSale, currentUser } = useAppStore();
  
  const [formData, setFormData] = useState({
    artworkId: '',
    type: 'sale' as 'sale' | 'rental',
    amount: 0,
    applicant: '',
    applicantContact: '',
    rentalStart: '',
    rentalEnd: '',
    notes: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
      setFormData({
        artworkId: '',
        type: 'sale',
        amount: 0,
        applicant: '',
        applicantContact: '',
        rentalStart: '',
        rentalEnd: '',
        notes: '',
      });
    }
  }, [isOpen]);

  const selectedArtwork = artworks.find(a => a.id === formData.artworkId);

  const handleSubmit = async () => {
    if (!formData.artworkId || !formData.amount || !formData.applicant || !formData.applicantContact) {
      return;
    }
    
    if (formData.type === 'rental' && (!formData.rentalStart || !formData.rentalEnd)) {
      return;
    }
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addSale({
      artworkId: formData.artworkId,
      artworkTitle: selectedArtwork?.title || '',
      artistName: selectedArtwork?.artistName || '',
      artworkImage: selectedArtwork?.imageUrl || '',
      type: formData.type,
      amount: formData.amount,
      applicant: formData.applicant,
      applicantContact: formData.applicantContact,
      rentalPeriod: formData.type === 'rental' ? {
        start: formData.rentalStart,
        end: formData.rentalEnd,
      } : undefined,
      notes: formData.notes,
      approvals: [],
    });
    
    setIsSubmitting(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新建申请" size="lg">
      {showSuccess ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-medium text-ink-800 dark:text-ink-100 mb-2">提交成功！</h3>
          <p className="text-ink-500 dark:text-ink-400">申请已进入审批流程</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                申请类型
              </label>
              <div className="flex gap-3">
                {['sale', 'rental'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type as 'sale' | 'rental' }))}
                    className={cn(
                      'flex-1 px-4 py-2.5 rounded-lg border font-medium transition-all',
                      formData.type === type
                        ? 'bg-gold-500 text-white border-gold-500'
                        : 'bg-ink-50 dark:bg-ink-700/50 border-ink-200 dark:border-ink-600 text-ink-600 dark:text-ink-300 hover:border-gold-500'
                    )}
                  >
                    {type === 'sale' ? '销售' : '租赁'}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                选择作品 *
              </label>
              <select
                value={formData.artworkId}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, artworkId: e.target.value }));
                  const artwork = artworks.find(a => a.id === e.target.value);
                  if (artwork) {
                    setFormData(prev => ({
                      ...prev,
                      amount: Math.round((artwork.valuation.low + artwork.valuation.high) / 2),
                    }));
                  }
                }}
                className="w-full px-4 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
              >
                <option value="">请选择作品</option>
                {artworks.filter(a => a.status === 'in_storage').map(artwork => (
                  <option key={artwork.id} value={artwork.id}>
                    {artwork.title} - {artwork.artistName}
                  </option>
                ))}
              </select>
            </div>

            {selectedArtwork && (
              <div className="col-span-2 p-4 rounded-xl bg-ink-50 dark:bg-ink-700/30 flex gap-4">
                <img
                  src={selectedArtwork.imageUrl}
                  alt={selectedArtwork.title}
                  className="w-16 h-20 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium text-ink-800 dark:text-ink-100">{selectedArtwork.title}</p>
                  <p className="text-sm text-ink-500 dark:text-ink-400">{selectedArtwork.artistName}</p>
                  <p className="text-sm text-gold-500 mt-1">
                    估值: {formatCurrency(selectedArtwork.valuation.low)} - {formatCurrency(selectedArtwork.valuation.high)}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                {formData.type === 'sale' ? '售价' : '租金'} (元) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                申请人 *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="text"
                  value={formData.applicant}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicant: e.target.value }))}
                  placeholder="请输入申请人姓名"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                联系方式 *
              </label>
              <input
                type="text"
                value={formData.applicantContact}
                onChange={(e) => setFormData(prev => ({ ...prev, applicantContact: e.target.value }))}
                placeholder="请输入联系电话"
                className="w-full px-4 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
              />
            </div>

            {formData.type === 'rental' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                    租赁开始日期 *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                    <input
                      type="date"
                      value={formData.rentalStart}
                      onChange={(e) => setFormData(prev => ({ ...prev, rentalStart: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                    租赁结束日期 *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                    <input
                      type="date"
                      value={formData.rentalEnd}
                      onChange={(e) => setFormData(prev => ({ ...prev, rentalEnd: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="col-span-2">
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                备注
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-ink-400" />
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="请输入备注信息"
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-ink-200 dark:border-ink-700">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-ink-200 dark:border-ink-600 text-ink-600 dark:text-ink-300 font-medium hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.artworkId || !formData.amount || !formData.applicant || !formData.applicantContact}
              className="px-5 py-2.5 rounded-lg bg-gold-500 text-white font-medium hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  提交中...
                </>
              ) : (
                '提交申请'
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function SaleDetailModal({ isOpen, onClose, sale }: SaleDetailModalProps) {
  const { approveSale, rejectSale, currentUser, hasPermission } = useAppStore();
  const [comment, setComment] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    setComment('');
    setActionType(null);
  }, [sale]);

  if (!sale) return null;

  const levelNames: Record<string, string> = {
    director: '馆长审批',
    committee: '委员会审批',
    financial: '财务审批',
  };

  const canApprove = () => {
    if (sale.status === 'approved' || sale.status === 'rejected') return false;
    if (sale.currentLevel === 'director' && currentUser.role === 'director') return true;
    if (sale.currentLevel === 'committee' && (currentUser.role === 'director' || currentUser.role === 'curator')) return true;
    if (sale.currentLevel === 'financial' && (currentUser.role === 'director' || hasPermission('keeper'))) return true;
    return false;
  };

  const handleAction = () => {
    if (!actionType) return;
    
    if (actionType === 'approve') {
      approveSale(sale.id, sale.currentLevel, comment);
    } else {
      rejectSale(sale.id, sale.currentLevel, comment);
    }
    
    onClose();
  };

  const createdAt = new Date(sale.createdAt);
  const checkTime = sale.lastUpdate ? new Date(sale.lastUpdate) : createdAt;
  const now = new Date();
  const hoursPassed = (now.getTime() - checkTime.getTime()) / (1000 * 60 * 60);
  const isOverdue = hoursPassed > 48 && sale.status !== 'approved' && sale.status !== 'rejected';

  const escalatedCount = sale.approvals.filter(a => a.status === 'escalated').length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="申请详情" size="xl">
      <div className="space-y-6">
        <div className="flex gap-6">
          <img
            src={sale.artworkImage}
            alt={sale.artworkTitle}
            className="w-32 h-40 rounded-xl object-cover"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-display font-semibold text-ink-800 dark:text-ink-100">
                {sale.artworkTitle}
              </h3>
              <span
                className={cn(
                  'text-xs px-3 py-1 rounded-full font-medium',
                  sale.type === 'sale'
                    ? 'bg-gold-100 text-gold-700 dark:bg-gold-500/20 dark:text-gold-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                )}
              >
                {sale.type === 'sale' ? '销售' : '租赁'}
              </span>
            </div>
            <p className="text-ink-500 dark:text-ink-400 mb-3">{sale.artistName}</p>
            <p className="text-3xl font-display font-bold text-gold-500">
              {formatCurrency(sale.amount)}
            </p>
            {sale.rentalPeriod && (
              <p className="text-sm text-ink-500 dark:text-ink-400 mt-2">
                租期: {formatDate(sale.rentalPeriod.start)} - {formatDate(sale.rentalPeriod.end)}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-ink-50 dark:bg-ink-700/30">
          <div>
            <p className="text-xs text-ink-400 mb-1">申请人</p>
            <p className="font-medium text-ink-700 dark:text-ink-300">{sale.applicant}</p>
          </div>
          <div>
            <p className="text-xs text-ink-400 mb-1">联系方式</p>
            <p className="font-medium text-ink-700 dark:text-ink-300">{sale.applicantContact}</p>
          </div>
          <div>
            <p className="text-xs text-ink-400 mb-1">申请时间</p>
            <p className="font-medium text-ink-700 dark:text-ink-300">{formatDate(sale.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-400 mb-1">当前流转</p>
            <p className={cn(
              'font-medium',
              sale.status === 'approved' ? 'text-emerald-500' :
              sale.status === 'rejected' ? 'text-red-500' : 'text-gold-500'
            )}>
              {levelNames[sale.currentLevel]}
            </p>
          </div>
          {sale.lastUpdate && sale.status !== 'approved' && sale.status !== 'rejected' && (
            <>
              <div>
                <p className="text-xs text-ink-400 mb-1">当前状态</p>
                <p className="font-medium text-amber-500">
                  {getStatusText(sale.status)}
                </p>
              </div>
              {escalatedCount > 0 && (
                <div>
                  <p className="text-xs text-ink-400 mb-1">越级次数</p>
                  <p className="font-medium text-orange-500">{escalatedCount} 次</p>
                </div>
              )}
            </>
          )}
          {(sale.status === 'approved' || sale.status === 'rejected') && (
            <div>
              <p className="text-xs text-ink-400 mb-1">当前状态</p>
              <p className={cn(
                'font-medium',
                sale.status === 'approved' ? 'text-emerald-500' : 'text-red-500'
              )}>
                {getStatusText(sale.status)}
              </p>
            </div>
          )}
        </div>

        {(isOverdue || sale.escalated) && (
          <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="font-medium text-orange-700 dark:text-orange-400">
                {sale.escalated 
                  ? `申请已自动越级 ${escalatedCount} 次，当前流转至 ${levelNames[sale.currentLevel]}`
                  : '申请已超过48小时未处理，即将自动越级'
                }
              </span>
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-ink-700 dark:text-ink-300 mb-4">审批流程</h4>
          <div className="flex items-start gap-4">
            {sale.approvals.map((approval, index) => {
              const isCurrentLevel = sale.currentLevel === approval.level && 
                sale.status !== 'approved' && sale.status !== 'rejected';
              const isPast = approval.status === 'approved' || approval.status === 'rejected' || approval.status === 'escalated';
              
              return (
                <div key={approval.level} className="flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all',
                        approval.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                          : approval.status === 'rejected'
                          ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                          : approval.status === 'escalated'
                          ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 alert-pulse'
                          : isCurrentLevel
                          ? 'bg-gold-100 text-gold-600 dark:bg-gold-500/20 dark:text-gold-400 ring-4 ring-gold-500/20'
                          : 'bg-ink-100 text-ink-400 dark:bg-ink-700 dark:text-ink-500'
                      )}
                    >
                      {approval.status === 'approved' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : approval.status === 'rejected' ? (
                        <XCircle className="w-6 h-6" />
                      ) : approval.status === 'escalated' ? (
                        <AlertTriangle className="w-6 h-6" />
                      ) : (
                        <Clock className="w-6 h-6" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-ink-700 dark:text-ink-300">
                      {levelNames[approval.level]}
                    </span>
                    {approval.approverName && (
                      <span className="text-xs text-ink-400 mt-1">
                        {approval.approverName}
                      </span>
                    )}
                    {approval.timestamp && (
                      <span className="text-xs text-ink-400">
                        {formatDate(approval.timestamp)}
                      </span>
                    )}
                    {approval.comment && (
                      <p className="text-xs text-ink-500 dark:text-ink-400 mt-2 text-center px-2">
                        "{approval.comment}"
                      </p>
                    )}
                    {isCurrentLevel && canApprove() && (
                      <span className="text-xs text-gold-500 mt-1 font-medium animate-pulse">
                        待处理
                      </span>
                    )}
                  </div>
                  {index < sale.approvals.length - 1 && (
                    <div
                      className={cn(
                        'w-full h-0.5 mt-6',
                        isPast
                          ? 'bg-emerald-300 dark:bg-emerald-500/30'
                          : 'bg-ink-200 dark:bg-ink-700'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {canApprove() && (
          <div className="space-y-4 pt-4 border-t border-ink-200 dark:border-ink-700">
            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                审批意见
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="请输入审批意见（可选）"
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActionType('reject')}
                className={cn(
                  'px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2',
                  actionType === 'reject'
                    ? 'bg-red-500 text-white'
                    : 'border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                )}
              >
                <XCircle className="w-4 h-4" />
                驳回
              </button>
              <button
                onClick={() => setActionType('approve')}
                className={cn(
                  'px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2',
                  actionType === 'approve'
                    ? 'bg-emerald-500 text-white'
                    : 'border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                )}
              >
                <CheckCircle className="w-4 h-4" />
                通过
              </button>
            </div>
            {actionType && (
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setActionType(null)}
                  className="px-4 py-2 text-sm text-ink-500 hover:text-ink-700 dark:hover:text-ink-300"
                >
                  取消
                </button>
                <button
                  onClick={handleAction}
                  className={cn(
                    'px-5 py-2.5 rounded-lg text-white font-medium',
                    actionType === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
                  )}
                >
                  确认{actionType === 'approve' ? '通过' : '驳回'}
                </button>
              </div>
            )}
          </div>
        )}

        {sale.notes && (
          <div className="pt-4 border-t border-ink-200 dark:border-ink-700">
            <h4 className="text-sm font-medium text-ink-700 dark:text-ink-300 mb-2">备注</h4>
            <p className="text-sm text-ink-500 dark:text-ink-400">{sale.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
