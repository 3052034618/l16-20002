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
}

const roleHierarchy: Record<UserRole, number> = {
  artist: 1,
  curator: 2,
  keeper: 3,
  director: 4,
};

const initialWorkOrders: WorkOrder[] = [...mockWorkOrders];

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
  darkMode: false,
  sidebarCollapsed: false,
  currentPage: 'dashboard',

  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentPage: (page) => set({ currentPage: page }),
  
  toggleDarkMode: () => {
    const newDarkMode = !get().darkMode;
    set({ darkMode: newDarkMode });
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  
  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  
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
      
      const checkTime = sale.lastUpdate ? new Date(sale.lastUpdate) : new Date(sale.createdAt);
      const hoursPassed = (now.getTime() - checkTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursPassed > 48) {
        const currentIndex = levelOrder.indexOf(sale.currentLevel);
        
        if (currentIndex < 2) {
          const nextLevel = levelOrder[currentIndex + 1];
          
          const newApprovals = sale.approvals.map((a) => {
            if (a.level === sale.currentLevel && (a.status === 'pending' || a.status === 'escalated')) {
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
        }
      }
      
      return sale;
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
    
    const workOrder: WorkOrder = {
      id: generateId(),
      alertId,
      type: alert.type,
      status: 'open',
      assignee: state.currentUser.name,
      assigneeId: state.currentUser.id,
      createdAt: new Date().toISOString(),
      description,
      location: alert.hallName,
      progress: 0,
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
    
    const updatedWorkOrder = { ...workOrder, ...updates };
    
    if (updates.status === 'resolved') {
      updatedWorkOrder.resolvedAt = new Date().toISOString();
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
      if (exhibitionTasks.length > 0 || filters.exhibition === exhibition.id) {
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
    
    const hasFilters = filters.artist || filters.exhibition || filters.dateRange;
    const logistics: TransportSummary[] = hasFilters 
      ? filteredTransports.map(t => ({
          transportId: t.id,
          artworkTitle: t.artworkTitle,
          status: t.status,
          currentLocation: t.currentLocation,
          estimatedArrival: t.estimatedArrival,
        }))
      : state.dashboardData.logistics;
    
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
}));
