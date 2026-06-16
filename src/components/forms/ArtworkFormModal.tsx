import { useState, useEffect } from 'react';
import { Camera, Upload, QrCode, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, formatCurrency, calculateValuation, generateDigitalFingerprint } from '@/utils';
import Modal from '@/components/common/Modal';

interface ArtworkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = ['油画', '国画', '雕塑', '摄影', '装置', '水彩', '版画'];
const materials = ['布面油画', '纸本水墨', '青铜雕塑', '数码摄影', '综合材料', '木材', '大理石', '陶瓷'];

export default function ArtworkFormModal({ isOpen, onClose }: ArtworkFormModalProps) {
  const { artists, valuationRules, addArtwork } = useAppStore();
  
  const [formData, setFormData] = useState({
    title: '',
    artistId: '',
    category: '',
    material: '',
    year: new Date().getFullYear(),
    width: 0,
    height: 0,
    depth: 0,
    unit: 'cm',
    description: '',
    imageUrl: '',
    location: '主库房',
  });
  
  const [step, setStep] = useState<'upload' | 'info' | 'preview'>('upload');
  const [fingerprint, setFingerprint] = useState('');
  const [valuation, setValuation] = useState<{ low: number; high: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('upload');
      setFingerprint('');
      setValuation(null);
      setShowSuccess(false);
      setFormData({
        title: '',
        artistId: '',
        category: '',
        material: '',
        year: new Date().getFullYear(),
        width: 0,
        height: 0,
        depth: 0,
        unit: 'cm',
        description: '',
        imageUrl: '',
        location: '主库房',
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.artistId && formData.material && formData.category) {
      const artist = artists.find(a => a.id === formData.artistId);
      const val = calculateValuation(
        artist?.reputationScore || 50,
        artist?.totalSales || 0,
        formData.material,
        formData.category,
        valuationRules
      );
      setValuation(val);
    }
  }, [formData.artistId, formData.material, formData.category, artists, valuationRules]);

  const handleImageUpload = (useCamera: boolean) => {
    const randomId = Math.floor(Math.random() * 1000);
    const category = formData.category || 'art';
    const imageUrl = `https://images.unsplash.com/photo-${1500000000000 + randomId}?w=600&h=800&fit=crop`;
    
    const fallbackImages = [
      'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=800&fit=crop',
    ];
    
    setFormData(prev => ({
      ...prev,
      imageUrl: useCamera 
        ? fallbackImages[Math.floor(Math.random() * fallbackImages.length)]
        : fallbackImages[Math.floor(Math.random() * fallbackImages.length)],
    }));
    setFingerprint(generateDigitalFingerprint());
    setTimeout(() => setStep('info'), 500);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.artistId || !formData.category || !formData.material || !formData.imageUrl) {
      return;
    }
    
    setIsSubmitting(true);
    
    const artist = artists.find(a => a.id === formData.artistId);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addArtwork({
      title: formData.title,
      artistId: formData.artistId,
      artistName: artist?.name || '',
      category: formData.category,
      material: formData.material,
      year: formData.year,
      imageUrl: formData.imageUrl,
      size: {
        width: formData.width,
        height: formData.height,
        depth: formData.depth || undefined,
        unit: formData.unit,
      },
      location: formData.location,
      description: formData.description,
      digitalFingerprint: fingerprint,
      valuation: valuation ? {
        low: valuation.low,
        high: valuation.high,
        lastUpdated: new Date().toISOString(),
      } : { low: 0, high: 0, lastUpdated: new Date().toISOString() },
    });
    
    setIsSubmitting(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const selectedArtist = artists.find(a => a.id === formData.artistId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新作品入库" size="lg">
      {showSuccess ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-medium text-ink-800 dark:text-ink-100 mb-2">入库成功！</h3>
          <p className="text-ink-500 dark:text-ink-400">作品已成功添加到藏品库</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-2 mb-6">
            {['upload', 'info', 'preview'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    step === s
                      ? 'bg-gold-500 text-white'
                      : ['upload', 'info', 'preview'].indexOf(step) > i
                      ? 'bg-emerald-500 text-white'
                      : 'bg-ink-200 dark:bg-ink-700 text-ink-500'
                  )}
                >
                  {['upload', 'info', 'preview'].indexOf(step) > i ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 2 && (
                  <div
                    className={cn(
                      'w-16 h-0.5 mx-1',
                      ['upload', 'info', 'preview'].indexOf(step) > i
                        ? 'bg-emerald-500'
                        : 'bg-ink-200 dark:bg-ink-700'
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {step === 'upload' && (
            <div className="space-y-6">
              <p className="text-center text-ink-500 dark:text-ink-400">
                上传作品照片或使用拍照功能自动生成数字指纹
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleImageUpload(true)}
                  className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-ink-300 dark:border-ink-600 hover:border-gold-500 hover:bg-gold-500/5 transition-all group"
                >
                  <Camera className="w-12 h-12 mb-3 text-ink-400 group-hover:text-gold-500 transition-colors" />
                  <span className="font-medium text-ink-700 dark:text-ink-300 group-hover:text-gold-500 transition-colors">
                    拍照入库
                  </span>
                  <span className="text-xs text-ink-400 mt-1">自动生成数字指纹</span>
                </button>
                <button
                  onClick={() => handleImageUpload(false)}
                  className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-ink-300 dark:border-ink-600 hover:border-gold-500 hover:bg-gold-500/5 transition-all group"
                >
                  <Upload className="w-12 h-12 mb-3 text-ink-400 group-hover:text-gold-500 transition-colors" />
                  <span className="font-medium text-ink-700 dark:text-ink-300 group-hover:text-gold-500 transition-colors">
                    上传图片
                  </span>
                  <span className="text-xs text-ink-400 mt-1">支持 JPG、PNG 格式</span>
                </button>
              </div>
            </div>
          )}

          {step === 'info' && (
            <div className="space-y-4">
              <div className="flex gap-4 mb-6">
                <img
                  src={formData.imageUrl}
                  alt="预览"
                  className="w-24 h-32 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="w-4 h-4 text-gold-500" />
                    <span className="text-xs font-mono text-ink-500 dark:text-ink-400 break-all">
                      {fingerprint}
                    </span>
                  </div>
                  <p className="text-xs text-ink-400">数字指纹已生成</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                    作品名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="请输入作品名称"
                    className="w-full px-4 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                    艺术家 *
                  </label>
                  <select
                    value={formData.artistId}
                    onChange={(e) => setFormData(prev => ({ ...prev, artistId: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                  >
                    <option value="">请选择艺术家</option>
                    {artists.map(artist => (
                      <option key={artist.id} value={artist.id}>
                        {artist.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                    创作年份
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                    分类 *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                  >
                    <option value="">请选择分类</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                    材质 *
                  </label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                  >
                    <option value="">请选择材质</option>
                    {materials.map(mat => (
                      <option key={mat} value={mat}>{mat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                    宽度 (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                    高度 (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                    作品描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="请输入作品描述"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 resize-none"
                  />
                </div>
              </div>

              {valuation && selectedArtist && (
                <div className="mt-4 p-4 rounded-xl bg-gold-500/10 border border-gold-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-gold-500" />
                    <span className="text-sm font-medium text-gold-600 dark:text-gold-400">
                      AI 估值预估
                    </span>
                  </div>
                  <p className="text-xs text-ink-500 dark:text-ink-400 mb-1">
                    基于艺术家声望 ({selectedArtist.reputationScore}/100)、历史成交 ({formatCurrency(selectedArtist.totalSales)})、材质系数自动计算
                  </p>
                  <p className="text-2xl font-display font-bold text-gold-500">
                    {formatCurrency(valuation.low)} - {formatCurrency(valuation.high)}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-ink-200 dark:border-ink-700">
                <button
                  onClick={() => setStep('upload')}
                  className="px-5 py-2.5 rounded-lg border border-ink-200 dark:border-ink-600 text-ink-600 dark:text-ink-300 font-medium hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
                >
                  上一步
                </button>
                <button
                  onClick={() => setStep('preview')}
                  disabled={!formData.title || !formData.artistId || !formData.category || !formData.material}
                  className="px-5 py-2.5 rounded-lg bg-gold-500 text-white font-medium hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一步
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="flex gap-6">
                <img
                  src={formData.imageUrl}
                  alt={formData.title}
                  className="w-32 h-44 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-display font-semibold text-ink-800 dark:text-ink-100 mb-1">
                    {formData.title}
                  </h3>
                  <p className="text-ink-500 dark:text-ink-400 mb-3">
                    {selectedArtist?.name} · {formData.year}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300">
                      {formData.category}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300">
                      {formData.material}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300">
                      {formData.width} × {formData.height} {formData.unit}
                    </span>
                  </div>
                  {valuation && (
                    <p className="text-lg font-semibold text-gold-500">
                      预估价值: {formatCurrency(valuation.low)} - {formatCurrency(valuation.high)}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode className="w-4 h-4 text-gold-500" />
                  <span className="text-sm font-medium text-ink-700 dark:text-ink-300">
                    数字指纹
                  </span>
                </div>
                <p className="text-xs font-mono text-ink-500 dark:text-ink-400 break-all">
                  {fingerprint}
                </p>
              </div>

              {formData.description && (
                <div>
                  <h4 className="text-sm font-medium text-ink-700 dark:text-ink-300 mb-2">作品描述</h4>
                  <p className="text-sm text-ink-500 dark:text-ink-400">{formData.description}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-ink-200 dark:border-ink-700">
                <button
                  onClick={() => setStep('info')}
                  className="px-5 py-2.5 rounded-lg border border-ink-200 dark:border-ink-600 text-ink-600 dark:text-ink-300 font-medium hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
                >
                  上一步
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg bg-gold-500 text-white font-medium hover:bg-gold-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      提交中...
                    </>
                  ) : (
                    '确认入库'
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
