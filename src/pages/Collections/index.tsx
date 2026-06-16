import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Edit,
  QrCode,
  ArrowUpDown,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  cn,
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusText,
} from '@/utils';
import ArtworkFormModal from '@/components/forms/ArtworkFormModal';

function ArtworkCard({ artwork, onView }: { artwork: any; onView: (id: string) => void }) {
  return (
    <div
      onClick={() => onView(artwork.id)}
      className="bg-white dark:bg-ink-800/50 rounded-xl overflow-hidden border border-ink-200 dark:border-ink-700/50 shadow-card hover:shadow-card-hover hover:border-gold-500/50 transition-all duration-300 cursor-pointer group"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-ink-100 dark:bg-ink-700">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              'text-xs px-2.5 py-1 rounded-full font-medium',
              getStatusColor(artwork.status)
            )}
          >
            {getStatusText(artwork.status)}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
          <button className="flex items-center gap-1 px-3 py-1.5 bg-white/90 text-ink-700 rounded-lg text-xs font-medium hover:bg-white transition-colors">
            <Eye className="w-3.5 h-3.5" />
            查看详情
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-gold-500 text-white rounded-lg text-xs font-medium hover:bg-gold-600 transition-colors">
            <QrCode className="w-3.5 h-3.5" />
            指纹
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-medium text-ink-800 dark:text-ink-100 mb-1 truncate">
          {artwork.title}
        </h3>
        <p className="text-sm text-ink-500 dark:text-ink-400 mb-3">
          {artwork.artistName} · {artwork.year}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-400">预估价值</p>
            <p className="text-sm font-medium text-gold-500">
              {formatCurrency(artwork.valuation.low)} - {formatCurrency(artwork.valuation.high)}
            </p>
          </div>
          <span className="text-xs text-ink-400">{artwork.category}</span>
        </div>
      </div>
    </div>
  );
}

export default function Collections() {
  const { getFilteredArtworks, currentUser, hasPermission } = useAppStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFormModal, setShowFormModal] = useState(false);

  const artworks = getFilteredArtworks();

  const categories = ['all', '油画', '国画', '雕塑', '摄影', '装置'];
  const statuses = ['all', 'in_storage', 'on_exhibition', 'on_loan', 'in_transport', 'sold'];

  const filteredArtworks = artworks.filter((artwork) => {
    const matchSearch =
      artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.artistName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'all' || artwork.category === selectedCategory;
    const matchStatus = selectedStatus === 'all' || artwork.status === selectedStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const handleView = (id: string) => {
    console.log('View artwork:', id);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink-800 dark:text-ink-100 mb-1">
            藏品管理
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            共 {filteredArtworks.length} 件藏品
          </p>
        </div>
        {(hasPermission('keeper') || hasPermission('director')) && (
          <button
            onClick={() => setShowFormModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 transition-colors shadow-gold"
          >
            <Plus className="w-4 h-4" />
            新作品入库
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type="text"
              placeholder="搜索作品名称、艺术家..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-ink-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-sm text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
              >
                <option value="all">全部分类</option>
                {categories
                  .filter((c) => c !== 'all')
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-sm text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
            >
              <option value="all">全部状态</option>
              {statuses
                .filter((s) => s !== 'all')
                .map((status) => (
                  <option key={status} value={status}>
                    {getStatusText(status)}
                  </option>
                ))}
            </select>

            <div className="flex items-center rounded-lg border border-ink-200 dark:border-ink-600 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'px-3 py-2 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-gold-500 text-white'
                    : 'bg-ink-50 dark:bg-ink-700/50 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-600'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'px-3 py-2 transition-colors',
                  viewMode === 'list'
                    ? 'bg-gold-500 text-white'
                    : 'bg-ink-50 dark:bg-ink-700/50 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-600'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} onView={handleView} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-ink-800/50 rounded-xl border border-ink-200 dark:border-ink-700/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-ink-50 dark:bg-ink-700/50 border-b border-ink-200 dark:border-ink-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  作品
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  艺术家
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  分类
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  材质
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  尺寸
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  <div className="flex items-center gap-1">
                    预估价值
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  状态
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  入库时间
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredArtworks.map((artwork) => (
                <tr
                  key={artwork.id}
                  className="border-b border-ink-100 dark:border-ink-700/50 last:border-0 hover:bg-ink-50 dark:hover:bg-ink-700/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <span className="font-medium text-ink-700 dark:text-ink-200">
                        {artwork.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600 dark:text-ink-300">
                    {artwork.artistName}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600 dark:text-ink-300">
                    {artwork.category}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600 dark:text-ink-300">
                    {artwork.material}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600 dark:text-ink-300">
                    {artwork.size.width} × {artwork.size.height} {artwork.size.unit}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gold-500">
                      {formatCurrency(artwork.valuation.low)} - {formatCurrency(artwork.valuation.high)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-full font-medium',
                        getStatusColor(artwork.status)
                      )}
                    >
                      {getStatusText(artwork.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-500 dark:text-ink-400">
                    {formatDate(artwork.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-ink-400 hover:text-gold-500 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-ink-400 hover:text-gold-500 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-ink-400 hover:text-gold-500 transition-colors">
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredArtworks.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ink-100 dark:bg-ink-700 flex items-center justify-center">
            <Search className="w-8 h-8 text-ink-400" />
          </div>
          <p className="text-ink-500 dark:text-ink-400">没有找到符合条件的藏品</p>
        </div>
      )}

      <ArtworkFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
      />
    </div>
  );
}
