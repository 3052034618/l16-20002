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
} from '@/data/mockData';

interface AppState {
  currentUser: User;
  users: User[];
  artworks: Artwork[];
  exhibitions: Exhibition[];
  sales: SaleRecord[];
  tasks: InstallTask[];
  sensors: Sensor[];
  alerts: Alert[];
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
  
  updateArtwork: (id: string, updates: Partial<Artwork>) => void;
  addArtwork: (artwork: Artwork) => void;
  
  updateExhibition: (id: string, updates: Partial<Exhibition>) => void;
  addExhibition: (exhibition: Exhibition) => void;
  
  updateSale: (id: string, updates: Partial<SaleRecord>) => void;
  approveSale: (saleId: string, level: string, comment?: string) => void;
  
  updateTask: (id: string, updates: Partial<InstallTask>) => void;
  
  resolveAlert: (id: string) => void;
  
  updateDashboardData: () => void;
  
  hasPermission: (requiredRole: UserRole) => boolean;
}

const roleHierarchy: Record<UserRole, number> = {
  artist: 1,
  curator: 2,
  keeper: 3,
  director: 4,
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
  
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),

  updateArtwork: (id, updates) =>
    set({
      artworks: get().artworks.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    }),

  addArtwork: (artwork) =>
    set({
      artworks: [...get().artworks, artwork],
    }),

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

  updateSale: (id, updates) =>
    set({
      sales: get().sales.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }),

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
  },

  updateTask: (id, updates) =>
    set({
      tasks: get().tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }),

  resolveAlert: (id) =>
    set({
      alerts: get().alerts.map((a) =>
        a.id === id
          ? { ...a, resolvedAt: new Date().toISOString() }
          : a
      ),
    }),

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

  hasPermission: (requiredRole) => {
    const { currentUser } = get();
    return roleHierarchy[currentUser.role] >= roleHierarchy[requiredRole];
  },
}));
