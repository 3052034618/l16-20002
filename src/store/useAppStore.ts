import { create } from 'zustand';
import type {
  User,
  UserRole,
  Artwork,
  Exhibition,
  SaleRecord,
  InstallTask,
  Sensor,
  Alert,
  Transport,
  Insurance,
  DashboardData,
  ValuationRules,
  FilterOptions,
  WorkOrder,
  InstallationProgress,
  TransportSummary,
  DashboardView,
  WidgetConfig,
  WorkOrderSLAInfo,
  AssigneeWorkload,
} from '@/types';
import {
  mockUsers,
  mockArtworks,
  mockExhibitions,
  mockSales,
  mockTasks,
  mockSensors,
  mockAlerts,
  mockTransports,
  mockInsurances,
  mockDashboardData,
  mockValuationRules,
  mockArtists,
  mockWorkOrders,
} from '@/data/mockData';
import { generateId, generateDigitalFingerprint, calculateValuation } from '@/utils';

interface AppState {
  currentUser: User;
  users: User[];
  artworks: Artwork[];
  exhibitions: Exhibition[];
  sales: SaleRecord[];
  tasks: InstallTask[];
  sensors: Sensor[];
  alerts: Alert[];
  workOrders: WorkOrder[];
  transports: Transport[];
  insurances: Insurance[];
  dashboardData: DashboardData;
  valuationRules: ValuationRules;
  artists: typeof mockArtists;
  filters: FilterOptions;
  darkMode: boolean;
  sidebarCollapsed: boolean;
  currentPage: string;
  
  widgetConfigs: WidgetConfig[];
  visibleWidgets: string[];
  setVisibleWidgets: (widgets: string[]) => void;
  toggleWidget: (widgetId: string) => void;
  
  setCurrentUser: (user: User) => void;
  setCurrentPage: (page: string) => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  
  updateArtwork: (id: string, updates: Partial<Artwork>) => void;
  addArtwork: (artwork: Omit<Artwork, 'id' | 'createdAt' | 'status' | 'exhibitionHistory'>) => void;
  
  updateExhibition: (id: string, updates: Partial<Exhibition>) => void;
  addExhibition: (exhibition: Exhibition) => void;
  
  updateSale: (id: string, updates: Partial<SaleRecord>) => void;
  addSale: (sale: Omit<SaleRecord, 'id' | 'createdAt' | 'lastUpdate' | 'status' | 'currentLevel' | 'escalated'>) => void;
  approveSale: (saleId: string, level: string, comment?: string) => void;
  rejectSale: (saleId: string, level: string, comment?: string) => void;
  escalateOverdueSales: () => void;
  batchApproveSales: (saleIds: string[], level: string, comment?: string) => void;
  batchRejectSales: (saleIds: string[], level: string, comment?: string) => void;
  delegateSale: (saleId: string, targetUserId: string, targetUserName: string) => void;
  
  updateTask: (id: string, updates: Partial<InstallTask>) => void;
  
  resolveAlert: (id: string) => void;
  escalateAlert: (id: string) => void;
  adjustEquipment: (alertId: string) => void;
  createWorkOrder: (alertId: string, description: string) => void;
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  checkAndEscalateAlerts: () => void;
  
  updateDashboardData: () => void;
  recalculateDashboardData: () => void;
  
  updateValuationRules: (rules: Partial<ValuationRules>) => void;
  
  hasPermission: (requiredRole: UserRole) => boolean;
  getFilteredArtworks: () => Artwork[];
  getFilteredDashboardData: () => DashboardData;
  getPendingCountForCurrentUser: () => number;
  
  getWorkOrderSLA: () => Record<string, WorkOrderSLAInfo>;
  getAssigneeWorkload: () => AssigneeWorkload[];
  
  dashboardViews: DashboardView[];
  currentViewId: string | null;
  saveDashboardView: (name: string, visibleWidgets: string[]) => void;
  loadDashboardView: (viewId: string) => void;
  deleteDashboardView: (viewId: string) => void;
  
  initFromLocalStorage: () => void;
}

const roleHierarchy: Record<UserRole, number> = {
  artist: 1,
  curator: 2,
  keeper: 3,
  director: 4,
};

const initialWorkOrders: WorkOrder[] = [...mockWorkOrders];

const DEFAULT_WIDGET_CONFIGS: WidgetConfig[] = [
  { id: 'stat_total', name: '藏品总数', category: 'stat', icon: 'BarChart3', defaultVisible: true },
  { id: 'stat_visitors', name: '今日访客', category: 'stat', icon: 'Eye', defaultVisible: true },
  { id: 'stat_exhibitions', name: '进行中展览', category: 'stat', icon: 'Palette', defaultVisible: true },
  { id: 'stat_intransit', name: '在途运输', category: 'stat', icon: 'Truck', defaultVisible: true },
  { id: 'stat_value', name: '藏品总值', category: 'stat', icon: 'BarChart3', defaultVisible: true },
  { id: 'stat_pending', name: '待审批', category: 'stat', icon: 'Clock', defaultVisible: true },
  { id: 'chart_halls', name: '展厅实时状态', category: 'chart', icon: 'MapPin', defaultVisible: true },
  { id: 'chart_collection', name: '藏品分类', category: 'chart', icon: 'PieChart', defaultVisible: true },
  { id: 'chart_env', name: '环境趋势图', category: 'chart', icon: 'Thermometer', defaultVisible: true },
  { id: 'chart_compliance', name: '环境达标率', category: 'chart', icon: 'CheckCircle', defaultVisible: true },
  { id: 'section_installations', name: '布展进度', category: 'section', icon: 'LayoutGrid', defaultVisible: true },
  { id: 'section_logistics', name: '在途运输', category: 'section', icon: 'Truck', defaultVisible: true },
  { id: 'section_alerts', name: '最近告警', category: 'section', icon: 'AlertTriangle', defaultVisible: true },
  { id: 'section_activities', name: '最近动态', category: 'section', icon: 'Activity', defaultVisible: true },
];

const DEFAULT_VISIBLE_WIDGETS = DEFAULT_WIDGET_CONFIGS.filter(w => w.defaultVisible).map(w => w.id);

const STORAGE_KEYS = {
  DASHBOARD_VIEWS: 'artms_dashboard_views',
  CURRENT_VIEW_ID: 'artms_current_view_id',
  VISIBLE_WIDGETS: 'artms_visible_widgets',
  DARK_MODE: 'artms_dark_mode',
  CURRENT_USER: 'artms_current_user',
};

const persistToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to persist to localStorage:', e);
  }
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
    return defaultValue;
  }
};

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: mockUsers[0],
  users: mockUsers,
  artworks: mockArtworks,
  exhibitions: mockExhibitions,
  sales: mockSales,
  tasks: mockTasks,
  sensors: mockSensors,
  alerts: mockAlerts,
  workOrders: initialWorkOrders,
  transports: mockTransports,
  insurances: mockInsurances,
  dashboardData: mockDashboardData,
  valuationRules: mockValuationRules,
  artists: mockArtists,
  filters: {},
  dashboardViews: [],
  currentViewId: null,
  darkMode: false,
  sidebarCollapsed: false,
  currentPage: 'dashboard',
  widgetConfigs: DEFAULT_WIDGET_CONFIGS,
  visibleWidgets: DEFAULT_VISIBLE_WIDGETS,

  setCurrentUser: (user) => {
    set({ currentUser: user });
    persistToStorage(STORAGE_KEYS.CURRENT_USER, user);
  },
  setCurrentPage: (page) => set({ currentPage: page }),
  
  toggleDarkMode: () => {
    const newDarkMode = !get().darkMode;
    set({ darkMode: newDarkMode });
    persistToStorage(STORAGE_KEYS.DARK_MODE, newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  
  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  
  setVisibleWidgets: (widgets) => {
    set({ visibleWidgets: widgets });
    persistToStorage(STORAGE_KEYS.VISIBLE_WIDGETS, widgets);
  },
  
  toggleWidget: (widgetId) => {
    const current = get().visibleWidgets;
    const next = current.includes(widgetId)
      ? current.filter(w => w !== widgetId)
      : [...current, widgetId];
    set({ visibleWidgets: next });
    persistToStorage(STORAGE_KEYS.VISIBLE_WIDGETS, next);
  },
  
  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
    setTimeout(() => get().recalculateDashboardData(), 0);
  },
  
  resetFilters: () => {
    set({ filters: {} });
    setTimeout(() => get().recalculateDashboardData(), 0);
  },

  updateArtwork: (id, updates) => {
    set({
      artworks: get().artworks.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    });
    setTimeout(() => get().recalculateDashboardData(), 0);
  },

  addArtwork: (artworkData) => {
    const artist = get().artists.find(a => a.id === artworkData.artistId);
    const valuation = calculateValuation(
      artist?.reputationScore || 50,
      artist?.totalSales || 0,
      artworkData.material,
      artworkData.category,
      get().valuationRules
    );
    
    const newArtwork: Artwork = {
      ...artworkData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      status: 'in_storage',
      exhibitionHistory: [],
      valuation: {
        low: valuation.low,
        high: valuation.high,
        lastUpdated: new Date().toISOString(),
      },
    };
    
    set({
      artworks: [...get().artworks, newArtwork],
    });
    setTimeout(() => get().recalculateDashboardData(), 0);
  },

  updateExhibition: (id, updates) =>
    set({
      exhibitions: get().exhibitions.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }),

  addExhibition: (exhibition) =>
    set({
      exhibitions: [...get().exhibitions, exhibition],
    }),

  updateSale: (id, updates) => {
    set({
      sales: get().sales.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    });
    setTimeout(() => get().recalculateDashboardData(), 0);
  },

  addSale: (saleData) => {
    const newSale: SaleRecord = {
      ...saleData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      status: 'pending',
      currentLevel: 'director',
      escalated: false,
      approvals: [
        { level: 'director', status: 'pending' },
        { level: 'committee', status: 'pending' },
        { level: 'financial', status: 'pending' },
      ],
    };
    
    set({
      sales: [...get().sales, newSale],
    });
    setTimeout(() => get().recalculateDashboardData(), 0);
  },

  approveSale: (saleId, level, comment) => {
    const state = get();
    const sale = state.sales.find((s) => s.id === saleId);
    if (!sale) return;

    const newApprovals = sale.approvals.map((a) => {
      if (a.level === level) {
        return {
          ...a,
          status: 'approved' as const,
          approverName: state.currentUser.name,
          approverId: state.currentUser.id,
          comment,
          timestamp: new Date().toISOString(),
        };
      }
      return a;
    });

    const levelOrder = ['director', 'committee', 'financial'];
    const currentIndex = levelOrder.indexOf(level);
    let newStatus = sale.status;
    let newCurrentLevel = sale.currentLevel;

    if (level === 'director') {
      newStatus = 'director_approved';
      newCurrentLevel = 'committee';
    } else if (level === 'committee') {
      newStatus = 'committee_approved';
      newCurrentLevel = 'financial';
    } else if (level === 'financial') {
      newStatus = 'approved';
      newCurrentLevel = 'financial';
    }

    set({
      sales: state.sales.map((s) =>
        s.id === saleId
          ? {
              ...s,
              approvals: newApprovals,
              status: newStatus as SaleRecord['status'],
              currentLevel: newCurrentLevel as SaleRecord['currentLevel'],
              lastUpdate: new Date().toISOString(),
            }
          : s
      ),
    });
    setTimeout(() => get().recalculateDashboardData(), 0);
  },

  rejectSale: (saleId, level, comment) => {
    const state = get();
    const sale = state.sales.find((s) => s.id === saleId);
    if (!sale) return;

    const newApprovals = sale.approvals.map((a) => {
      if (a.level === level) {
        return {
          ...a,
          status: 'rejected' as const,
          approverName: state.currentUser.name,
          approverId: state.currentUser.id,
          comment,
          timestamp: new Date().toISOString(),
        };
      }
      return a;
    });

    set({
      sales: state.sales.map((s) =>
        s.id === saleId
          ? {
              ...s,
              approvals: newApprovals,
              status: 'rejected',
              lastUpdate: new Date().toISOString(),
            }
          : s
      ),
    });
    setTimeout(() => get().recalculateDashboardData(), 0);
  },

  escalateOverdueSales: () => {
    const state = get();
    const now = new Date();
    const levelOrder = ['director', 'committee', 'financial'];
    
    const updatedSales = state.sales.map((sale) => {
      if (sale.status === 'approved' || sale.status === 'rejected') {
        return sale;
      }
      
      const startTime = sale.lastUpdate ? new Date(sale.lastUpdate) : new Date(sale.createdAt);
      const hoursPassed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursPassed <= 48) {
        return sale;
      }
      
      const currentIndex = levelOrder.indexOf(sale.currentLevel);
      const levelsToEscalate = Math.floor(hoursPassed / 48);
      const targetIndex = Math.min(currentIndex + levelsToEscalate, levelOrder.length - 1);
      
      if (targetIndex <= currentIndex) {
        return sale;
      }
      
      const nextLevel = levelOrder[targetIndex];
      
      const newApprovals = sale.approvals.map((a) => {
        const approvalIndex = levelOrder.indexOf(a.level);
        if (approvalIndex >= currentIndex && approvalIndex < targetIndex) {
          return { ...a, status: 'escalated' as const, timestamp: new Date().toISOString() };
        }
        return a;
      });
      
      const statusMap: Record<string, string> = {
        director: 'pending',
        committee: 'director_approved',
        financial: 'committee_approved',
      };
      
      return {
        ...sale,
        escalated: true,
        currentLevel: nextLevel as SaleRecord['currentLevel'],
        status: statusMap[nextLevel] as SaleRecord['status'],
        approvals: newApprovals,
        lastUpdate: new Date().toISOString(),
      };
    });
    
    set({ sales: updatedSales });
  },

  updateTask: (id, updates) =>
    set({
      tasks: get().tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }),

  resolveAlert: (id) => {
    set({
      alerts: get().alerts.map((a) =>
        a.id === id
          ? { ...a, resolvedAt: new Date().toISOString(), duration: Math.floor((new Date().getTime() - new Date(a.startTime).getTime()) / 60000) }
          : a
      ),
    });
    setTimeout(() => get().recalculateDashboardData(), 0);
  },

  escalateAlert: (id) => {
    set({
      alerts: get().alerts.map((a) =>
        a.id === id && !a.resolvedAt
          ? { ...a, level: 'escalated' as const }
          : a
      ),
    });
  },

  adjustEquipment: (alertId) => {
    const state = get();
    const alert = state.alerts.find(a => a.id === alertId);
    if (!alert) return;
    
    const sensor = state.sensors.find(s => s.id === alert.sensorId);
    if (sensor) {
      const newData = { ...sensor.currentData };
      if (alert.type === '温度超标') {
        newData.temperature = 22;
      } else if (alert.type === '湿度过高') {
        newData.humidity = 50;
      } else if (alert.type === '紫外线超标') {
        newData.uvIndex = 0.5;
      }
      
      set({
        sensors: state.sensors.map(s => 
          s.id === sensor.id
            ? { ...s, status: 'normal', currentData: { ...newData, timestamp: new Date().toISOString() } }
            : s
        ),
      });
    }
    
    get().resolveAlert(alertId);
  },

  createWorkOrder: (alertId, description) => {
    const state = get();
    const alert = state.alerts.find(a => a.id === alertId);
    if (!alert) return;
    
    const now = new Date().toISOString();
    const workOrder: WorkOrder = {
      id: generateId(),
      alertId,
      type: alert.type,
      status: 'open',
      assignee: state.currentUser.name,
      assigneeId: state.currentUser.id,
      createdAt: now,
      description,
      location: alert.hallName,
      progress: 0,
      logs: [
        {
          id: generateId(),
          type: 'created',
          description: `工单创建，关联告警：${alert.type}`,
          operator: state.currentUser.name,
          operatorId: state.currentUser.id,
          timestamp: now,
        },
      ],
    };
    
    set({
      workOrders: [...state.workOrders, workOrder],
      alerts: state.alerts.map(a =>
        a.id === alertId ? { ...a, workOrderId: workOrder.id } : a
      ),
    });
  },

  updateWorkOrder: (id, updates) => {
    const state = get();
    const workOrder = state.workOrders.find(w => w.id === id);
    if (!workOrder) return;
    
    const now = new Date().toISOString();
    const newLogs = [...workOrder.logs];
    
    if (updates.status === 'in_progress' && workOrder.status !== 'in_progress') {
      newLogs.push({
        id: generateId(),
        type: 'started',
        description: '开始处理工单',
        operator: state.currentUser.name,
        operatorId: state.currentUser.id,
        timestamp: now,
      });
    }
    
    if (updates.progress !== undefined && updates.progress > workOrder.progress) {
      newLogs.push({
        id: generateId(),
        type: 'progress',
        description: `更新处理进度至${updates.progress}%`,
        operator: state.currentUser.name,
        operatorId: state.currentUser.id,
        timestamp: now,
        progress: updates.progress,
      });
    }
    
    if (updates.status === 'resolved' && workOrder.status !== 'resolved') {
      newLogs.push({
        id: generateId(),
        type: 'resolved',
        description: '工单已完成处理',
        operator: state.currentUser.name,
        operatorId: state.currentUser.id,
        timestamp: now,
        progress: 100,
      });
    }
    
    const updatedWorkOrder = { 
      ...workOrder, 
      ...updates, 
      logs: newLogs 
    };
    
    if (updates.status === 'resolved') {
      updatedWorkOrder.resolvedAt = now;
      if (workOrder.alertId) {
        get().resolveAlert(workOrder.alertId);
      }
    }
    
    set({
      workOrders: state.workOrders.map(w =>
        w.id === id ? updatedWorkOrder : w
      ),
    });
  },

  checkAndEscalateAlerts: () => {
    const state = get();
    const now = new Date();
    
    state.alerts.forEach(alert => {
      if (!alert.resolvedAt && alert.level !== 'escalated') {
        const startTime = new Date(alert.startTime);
        const minutesPassed = (now.getTime() - startTime.getTime()) / 60000;
        
        if (minutesPassed > 30) {
          get().escalateAlert(alert.id);
        }
      }
    });
  },

  updateDashboardData: () => {
    const state = get();
    const oldData = state.dashboardData;
    const newData = {
      ...oldData,
      overview: {
        ...oldData.overview,
        todayVisitors: oldData.overview.todayVisitors + Math.floor(Math.random() * 5),
      },
      halls: oldData.halls.map((h) => ({
        ...h,
        visitorCount: h.visitorCount + Math.floor(Math.random() * 3),
        temperature: h.temperature + (Math.random() - 0.5) * 0.2,
        humidity: h.humidity + (Math.random() - 0.5) * 1,
        heatIndex: Math.min(100, h.heatIndex + (Math.random() - 0.5) * 2),
      })),
    };
    set({ dashboardData: newData });
  },

  recalculateDashboardData: () => {
    const state = get();
    const { filters, artworks, sales, alerts, exhibitions, transports, sensors, tasks } = state;
    
    let filteredArtworks = [...artworks];
    let filteredSales = [...sales];
    let filteredAlerts = [...alerts];
    let filteredExhibitions = [...exhibitions];
    let filteredTransports = [...transports];
    let filteredTasks = [...tasks];
    
    if (filters.artist) {
      filteredArtworks = filteredArtworks.filter(a => a.artistId === filters.artist);
      filteredSales = filteredSales.filter(s => {
        const artwork = artworks.find(a => a.id === s.artworkId);
        return artwork?.artistId === filters.artist;
      });
      filteredTransports = filteredTransports.filter(t => {
        const artwork = artworks.find(a => a.id === t.artworkId);
        return artwork?.artistId === filters.artist;
      });
      const artistArtworkIds = filteredArtworks.map(a => a.id);
      filteredTasks = filteredTasks.filter(t => {
        const exhibition = exhibitions.find(e => e.id === t.exhibitionId);
        return exhibition?.artworks.some(a => artistArtworkIds.includes(a.artworkId));
      });
      filteredExhibitions = filteredExhibitions.filter(e => 
        e.artworks.some(a => artistArtworkIds.includes(a.artworkId))
      );
    }
    
    if (filters.exhibition) {
      const exhibition = exhibitions.find(e => e.id === filters.exhibition);
      if (exhibition) {
        const artworkIds = exhibition.artworks.map(a => a.artworkId);
        filteredArtworks = filteredArtworks.filter(a => artworkIds.includes(a.id));
        filteredTransports = filteredTransports.filter(t => artworkIds.includes(t.artworkId));
      }
      filteredExhibitions = filteredExhibitions.filter(e => e.id === filters.exhibition);
      filteredTasks = filteredTasks.filter(t => t.exhibitionId === filters.exhibition);
    }
    
    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      
      filteredSales = filteredSales.filter(s => {
        const date = new Date(s.createdAt);
        return date >= start && date <= end;
      });
      
      filteredAlerts = filteredAlerts.filter(a => {
        const date = new Date(a.startTime);
        return date >= start && date <= end;
      });
      
      filteredTransports = filteredTransports.filter(t => {
        const date = new Date(t.departureDate);
        return date >= start && date <= end;
      });
      
      filteredTasks = filteredTasks.filter(t => {
        const date = new Date(t.dueDate);
        return date >= start && date <= end;
      });
    }
    
    const pendingCount = filteredSales.filter(s => 
      s.status !== 'approved' && s.status !== 'rejected'
    ).length;
    
    const activeExhibitions = filteredExhibitions.filter(e => 
      e.status === 'ongoing' || e.status === 'installing'
    ).length;
    
    const inTransitCount = filteredTransports.filter(t => 
      t.status === 'in_transit' || t.status === 'delayed'
    ).length;
    
    const totalValue = filteredArtworks.reduce(
      (sum, a) => sum + a.valuation.high,
      0
    );
    
    const normalSensors = sensors.filter(s => s.status === 'normal').length;
    const warningSensors = sensors.filter(s => s.status === 'warning' || s.status === 'error').length;
    
    const activeAlerts = filteredAlerts.filter(a => !a.resolvedAt);
    
    const hasFilters = filters.artist || filters.exhibition || filters.dateRange;
    
    const exhibitionTaskMap = new Map<string, InstallTask[]>();
    filteredTasks.forEach(task => {
      if (!exhibitionTaskMap.has(task.exhibitionId)) {
        exhibitionTaskMap.set(task.exhibitionId, []);
      }
      exhibitionTaskMap.get(task.exhibitionId)!.push(task);
    });
    
    const installations: InstallationProgress[] = [];
    filteredExhibitions.forEach(exhibition => {
      const exhibitionTasks = exhibitionTaskMap.get(exhibition.id) || [];
      const hasTasks = exhibitionTasks.length > 0;
      const isFilteredExhibition = filters.exhibition === exhibition.id;
      const isInstalling = exhibition.status === 'installing' || exhibition.status === 'ongoing';
      
      if (hasTasks || isFilteredExhibition || (isInstalling && !hasFilters)) {
        const totalTasks = exhibitionTasks.length || 1;
        const completedTasks = exhibitionTasks.filter(t => t.status === 'completed').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        installations.push({
          exhibitionId: exhibition.id,
          exhibitionName: exhibition.name,
          progress,
          totalTasks,
          completedTasks,
          dueDate: exhibition.endDate,
          hallName: exhibition.hallName,
        });
      }
    });
    
    const logistics: TransportSummary[] = filteredTransports.map(t => ({
      transportId: t.id,
      artworkTitle: t.artworkTitle,
      status: t.status,
      currentLocation: t.currentLocation,
      estimatedArrival: t.estimatedArrival,
    }));
    
    const oldData = state.dashboardData;
    const newData: DashboardData = {
      ...oldData,
      overview: {
        totalArtworks: filteredArtworks.length,
        activeExhibitions,
        inTransit: inTransitCount,
        totalValue,
        todayVisitors: oldData.overview.todayVisitors,
        pendingApprovals: pendingCount,
      },
      halls: filters.exhibition 
        ? oldData.halls.filter(h => filteredExhibitions.some(e => e.hallId === h.hallId))
        : oldData.halls,
      environment: {
        ...oldData.environment,
        overallCompliance: sensors.length > 0 ? (normalSensors / sensors.length) * 100 : 100,
        normalHalls: normalSensors,
        warningHalls: warningSensors,
        alertsToday: activeAlerts.length,
      },
      installations,
      logistics,
      recentAlerts: activeAlerts.slice(0, 5),
    };
    
    set({ dashboardData: newData });
  },

  updateValuationRules: (rules) => {
    set({
      valuationRules: { ...get().valuationRules, ...rules },
    });
  },

  hasPermission: (requiredRole) => {
    const { currentUser } = get();
    return roleHierarchy[currentUser.role] >= roleHierarchy[requiredRole];
  },

  getFilteredArtworks: () => {
    const state = get();
    const { currentUser, artworks } = state;
    
    if (currentUser.role === 'artist') {
      if (currentUser.artistId) {
        return artworks.filter(a => a.artistId === currentUser.artistId);
      }
      return artworks.filter(a => a.artistName === currentUser.name);
    }
    
    return artworks;
  },

  getFilteredDashboardData: () => {
    return get().dashboardData;
  },

  getPendingCountForCurrentUser: () => {
    const state = get();
    const { currentUser, sales } = state;
    
    const roleLevelMap: Record<string, string> = {
      director: 'director',
      curator: 'committee',
      keeper: 'financial',
    };
    
    const userLevel = roleLevelMap[currentUser.role];
    if (!userLevel) return 0;
    
    return sales.filter(s => 
      s.status !== 'approved' && 
      s.status !== 'rejected' && 
      s.currentLevel === userLevel
    ).length;
  },

  batchApproveSales: (saleIds, level, comment) => {
    saleIds.forEach(id => {
      get().approveSale(id, level, comment);
    });
  },

  batchRejectSales: (saleIds, level, comment) => {
    saleIds.forEach(id => {
      get().rejectSale(id, level, comment);
    });
  },

  delegateSale: (saleId, targetUserId, targetUserName) => {
    const state = get();
    const sale = state.sales.find(s => s.id === saleId);
    if (!sale) return;

    const updatedSale: SaleRecord = {
      ...sale,
      delegatedTo: targetUserName,
      delegatedToId: targetUserId,
      delegatedAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
    };

    set({
      sales: state.sales.map(s => s.id === saleId ? updatedSale : s),
    });
    setTimeout(() => get().recalculateDashboardData(), 0);
  },

  getWorkOrderSLA: () => {
    const state = get();
    const now = new Date();
    const slaLimits: Record<string, number> = {
      warning: 60,
      critical: 30,
      escalated: 15,
    };

    const result: Record<string, WorkOrderSLAInfo> = {};
    state.workOrders
      .filter(wo => wo.status !== 'resolved')
      .forEach(wo => {
        const alert = state.alerts.find(a => a.workOrderId === wo.id || a.id === wo.alertId);
        const alertLevel = alert?.level || 'warning';
        const limitMinutes = slaLimits[alertLevel] || 60;
        const totalSeconds = limitMinutes * 60;
        const created = new Date(wo.createdAt);
        const deadline = new Date(created.getTime() + limitMinutes * 60 * 1000);
        const remainingMs = deadline.getTime() - now.getTime();
        const remainingSeconds = Math.floor(remainingMs / 1000);
        
        const elapsedRatio = 1 - (remainingSeconds / totalSeconds);
        let riskLevel: WorkOrderSLAInfo['riskLevel'];
        if (remainingSeconds <= 0) {
          riskLevel = 'overdue';
        } else if (elapsedRatio >= 0.8) {
          riskLevel = 'danger';
        } else if (elapsedRatio >= 0.5) {
          riskLevel = 'warning';
        } else {
          riskLevel = 'safe';
        }

        result[wo.id] = {
          workOrderId: wo.id,
          alertLevel,
          remainingSeconds,
          totalSeconds,
          deadline,
          riskLevel,
          assignee: wo.assignee,
          assigneeId: wo.assigneeId,
        };
      });
    return result;
  },

  getAssigneeWorkload: () => {
    const state = get();
    const slaMap = state.getWorkOrderSLA();
    const workloadMap = new Map<string, AssigneeWorkload>();

    state.workOrders.forEach(wo => {
      if (wo.status === 'resolved') return;
      const key = wo.assigneeId || wo.assignee;
      if (!workloadMap.has(key)) {
        workloadMap.set(key, {
          assigneeId: wo.assigneeId,
          assignee: wo.assignee,
          totalCount: 0,
          safeCount: 0,
          warningCount: 0,
          dangerCount: 0,
          overdueCount: 0,
        });
      }
      const wl = workloadMap.get(key)!;
      wl.totalCount++;
      const sla = slaMap[wo.id];
      if (sla) {
        switch (sla.riskLevel) {
          case 'safe': wl.safeCount++; break;
          case 'warning': wl.warningCount++; break;
          case 'danger': wl.dangerCount++; break;
          case 'overdue': wl.overdueCount++; break;
        }
      } else {
        wl.safeCount++;
      }
    });

    return Array.from(workloadMap.values()).sort((a, b) => b.totalCount - a.totalCount);
  },

  saveDashboardView: (name, visibleWidgets) => {
    const state = get();
    const newView: DashboardView = {
      id: generateId(),
      name,
      filters: { ...state.filters },
      visibleWidgets,
      createdAt: new Date().toISOString(),
      createdBy: state.currentUser.id,
    };
    
    const newViews = [...state.dashboardViews, newView];
    set({
      dashboardViews: newViews,
      currentViewId: newView.id,
    });
    persistToStorage(STORAGE_KEYS.DASHBOARD_VIEWS, newViews);
    persistToStorage(STORAGE_KEYS.CURRENT_VIEW_ID, newView.id);
  },

  loadDashboardView: (viewId) => {
    const state = get();
    const view = state.dashboardViews.find(v => v.id === viewId);
    if (view) {
      set({
        filters: { ...view.filters },
        visibleWidgets: view.visibleWidgets,
        currentViewId: viewId,
      });
      persistToStorage(STORAGE_KEYS.CURRENT_VIEW_ID, viewId);
      persistToStorage(STORAGE_KEYS.VISIBLE_WIDGETS, view.visibleWidgets);
      setTimeout(() => get().recalculateDashboardData(), 0);
    }
  },

  deleteDashboardView: (viewId) => {
    const state = get();
    const newViews = state.dashboardViews.filter(v => v.id !== viewId);
    const newCurrentView = state.currentViewId === viewId ? null : state.currentViewId;
    set({
      dashboardViews: newViews,
      currentViewId: newCurrentView,
    });
    persistToStorage(STORAGE_KEYS.DASHBOARD_VIEWS, newViews);
    persistToStorage(STORAGE_KEYS.CURRENT_VIEW_ID, newCurrentView);
  },

  initFromLocalStorage: () => {
    const savedUser = loadFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    const savedDarkMode = loadFromStorage<boolean>(STORAGE_KEYS.DARK_MODE, false);
    const savedViews = loadFromStorage<DashboardView[]>(STORAGE_KEYS.DASHBOARD_VIEWS, []);
    const savedCurrentViewId = loadFromStorage<string | null>(STORAGE_KEYS.CURRENT_VIEW_ID, null);
    const savedVisibleWidgets = loadFromStorage<string[]>(STORAGE_KEYS.VISIBLE_WIDGETS, DEFAULT_VISIBLE_WIDGETS);

    const updates: Partial<AppState> = {
      darkMode: savedDarkMode,
      dashboardViews: savedViews,
      currentViewId: savedCurrentViewId,
      visibleWidgets: savedVisibleWidgets,
    };

    if (savedUser) {
      const matchedUser = get().users.find(u => u.id === savedUser.id);
      if (matchedUser) {
        updates.currentUser = matchedUser;
      }
    }

    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }

    if (savedCurrentViewId) {
      const view = savedViews.find(v => v.id === savedCurrentViewId);
      if (view) {
        updates.filters = { ...view.filters };
        if (!localStorage.getItem(STORAGE_KEYS.VISIBLE_WIDGETS)) {
          updates.visibleWidgets = view.visibleWidgets;
        }
      }
    }

    set(updates as any);
    setTimeout(() => get().recalculateDashboardData(), 0);
  },
}));
