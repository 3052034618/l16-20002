import { useState } from 'react';
import {
  Plus,
  Calendar,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Users,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, formatDate, getStatusColor, getStatusText } from '@/utils';

const statusTabs = ['all', 'ongoing', 'installing', 'planned', 'closed'];

const curatorAvatar =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=face';

function ExhibitionCard({
  exhibition,
  onView,
}: {
  exhibition: any;
  onView: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onView(exhibition.id)}
      className="bg-white dark:bg-ink-800/50 rounded-xl overflow-hidden border border-ink-200 dark:border-ink-700/50 shadow-card hover:shadow-card-hover hover:border-gold-500/50 transition-all duration-300 cursor-pointer group"
    >
      <div className="relative h-40 overflow-hidden bg-ink-100 dark:bg-ink-700">
        <img
          src={exhibition.posterUrl}
          alt={exhibition.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              'text-xs px-2.5 py-1 rounded-full font-medium',
              getStatusColor(exhibition.status)
            )}
          >
            {getStatusText(exhibition.status)}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-display font-semibold text-lg mb-1">
            {exhibition.name}
          </h3>
          <div className="flex items-center gap-3 text-white/80 text-xs">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {exhibition.hallName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {exhibition.startDate}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-ink-500 dark:text-ink-400 mb-4 line-clamp-2">
          {exhibition.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={curatorAvatar}
              alt={exhibition.curatorName}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs text-ink-500 dark:text-ink-400">
              策展人: {exhibition.curatorName}
            </span>
          </div>
          {exhibition.visitorCount !== undefined &&
            exhibition.status === 'ongoing' && (
              <div className="flex items-center gap-1 text-xs text-ink-400">
                <Users className="w-3.5 h-3.5" />
                <span>{exhibition.visitorCount} 访客</span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default function Exhibitions() {
  const { exhibitions } = useAppStore();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExhibitions = exhibitions.filter((exhibition) => {
    const matchStatus =
      activeTab === 'all' || exhibition.status === activeTab;
    const matchSearch =
      exhibition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exhibition.curatorName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleView = (id: string) => {
    console.log('View exhibition:', id);
  };

  const getTabCount = (status: string) => {
    if (status === 'all') return exhibitions.length;
    return exhibitions.filter((e) => e.status === status).length;
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink-800 dark:text-ink-100 mb-1">
            展览策划
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            共 {filteredExhibitions.length} 个展览
          </p>
        </div>
        <button
          onClick={() => {}}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 transition-colors shadow-gold"
        >
          <Plus className="w-4 h-4" />
          创建展览
        </button>
      </div>

      <div className="bg-white dark:bg-ink-800/50 rounded-xl p-4 border border-ink-200 dark:border-ink-700/50 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0">
            {statusTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                  activeTab === tab
                    ? 'bg-gold-500 text-white shadow-gold'
                    : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700'
                )}
              >
                {getStatusText(tab === 'all' ? tab : tab)}
                {tab !== 'all' && (
                  <span
                    className={cn(
                      'ml-1.5 px-1.5 py-0.5 rounded-full text-xs',
                      activeTab === tab
                        ? 'bg-white/20 text-white'
                        : 'bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-400'
                    )}
                  >
                    {getTabCount(tab)}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="搜索展览..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2 rounded-lg bg-ink-50 dark:bg-ink-700/50 border border-ink-200 dark:border-ink-600 text-sm text-ink-700 dark:text-ink-200 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredExhibitions.map((exhibition) => (
          <ExhibitionCard
            key={exhibition.id}
            exhibition={exhibition}
            onView={handleView}
          />
        ))}
      </div>

      {filteredExhibitions.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ink-100 dark:bg-ink-700 flex items-center justify-center">
            <Lightbulb className="w-8 h-8 text-ink-400" />
          </div>
          <p className="text-ink-500 dark:text-ink-400 mb-2">没有找到展览</p>
          <button className="text-gold-500 text-sm font-medium hover:underline">
            创建第一个展览
          </button>
        </div>
      )}
    </div>
  );
}
