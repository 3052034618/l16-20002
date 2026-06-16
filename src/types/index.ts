export type UserRole = 'artist' | 'curator' | 'keeper' | 'director';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  artistId?: string;
}

export type ArtworkStatus = 'in_storage' | 'on_exhibition' | 'on_loan' | 'in_transport' | 'sold';

export interface ArtworkSize {
  width: number;
  height: number;
  depth?: number;
  unit: string;
}

export interface ArtworkValuation {
  low: number;
  high: number;
  lastUpdated: string;
}

export interface Artist {
  id: string;
  name: string;
  avatar: string;
  reputationScore: number;
  totalSales: number;
  bio: string;
}

export interface Artwork {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  category: string;
  material: string;
  size: ArtworkSize;
  year: number;
  imageUrl: string;
  digitalFingerprint: string;
  valuation: ArtworkValuation;
  status: ArtworkStatus;
  location: string;
  createdAt: string;
  description?: string;
  exhibitionHistory: string[];
}

export type ExhibitionStatus = 'draft' | 'planned' | 'installing' | 'ongoing' | 'closed';

export interface LightingRecommendation {
  intensity: string;
  colorTemperature: string;
  uvProtection: boolean;
  humidityControl: string;
}

export interface ExhibitionArtwork {
  artworkId: string;
  artworkTitle: string;
  artistName: string;
  imageUrl: string;
  position: { x: number; y: number };
  lightingPlan: LightingRecommendation;
  conflictDetected?: boolean;
  conflictReason?: string;
}

export interface LayoutPlan {
  hallDimensions: { width: number; height: number };
  recommendedLayout: string;
  conflictWarnings: string[];
}

export interface Exhibition {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  hallId: string;
  hallName: string;
  status: ExhibitionStatus;
  curatorId: string;
  curatorName: string;
  artworks: ExhibitionArtwork[];
  visitorCount?: number;
  layoutPlan?: LayoutPlan;
  posterUrl?: string;
}

export type SaleType = 'sale' | 'rental';
export type SaleStatus = 'pending' | 'director_approved' | 'committee_approved' | 'financial_approved' | 'approved' | 'rejected' | 'overdue_escalated';
export type ApprovalLevel = 'director' | 'committee' | 'financial';

export interface Approval {
  level: ApprovalLevel;
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  comment?: string;
  timestamp?: string;
}

export interface SaleRecord {
  id: string;
  artworkId: string;
  artworkTitle: string;
  artistName: string;
  artworkImage: string;
  type: SaleType;
  amount: number;
  applicant: string;
  applicantContact: string;
  status: SaleStatus;
  createdAt: string;
  rentalPeriod?: { start: string; end: string };
  approvals: Approval[];
  currentLevel: ApprovalLevel;
  escalated: boolean;
  lastUpdate: string;
  notes?: string;
  delegatedTo?: string;
  delegatedToId?: string;
  delegatedAt?: string;
}

export type TaskType = 'installation' | 'lighting' | 'packaging' | 'transportation' | 'security';
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'delayed';

export interface InstallTask {
  id: string;
  exhibitionId: string;
  exhibitionName: string;
  title: string;
  type: TaskType;
  workerType: string;
  assignee?: string;
  status: TaskStatus;
  dueDate: string;
  completedAt?: string;
  photoUrl?: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedHours: number;
}

export interface SensorData {
  temperature: number;
  humidity: number;
  uvIndex: number;
  timestamp: string;
}

export interface Sensor {
  id: string;
  hallId: string;
  hallName: string;
  type: string;
  location: string;
  status: 'normal' | 'warning' | 'error';
  currentData: SensorData;
  historyData?: SensorData[];
}

export interface Thresholds {
  temperature: { min: number; max: number };
  humidity: { min: number; max: number };
  uvIndex: { max: number };
}

export type AlertLevel = 'warning' | 'critical' | 'escalated';

export interface Alert {
  id: string;
  sensorId: string;
  hallName: string;
  type: string;
  level: AlertLevel;
  message: string;
  value: number;
  threshold: number;
  startTime: string;
  resolvedAt?: string;
  workOrderId?: string;
  duration?: number;
}

export interface WorkOrderLog {
  id: string;
  type: 'created' | 'started' | 'progress' | 'resolved' | 'note';
  description: string;
  operator: string;
  operatorId?: string;
  timestamp: string;
  progress?: number;
}

export interface WorkOrder {
  id: string;
  alertId: string;
  type: string;
  title?: string;
  hallName?: string;
  status: 'open' | 'pending' | 'processing' | 'in_progress' | 'resolved';
  assignee: string;
  assigneeId?: string;
  createdAt: string;
  resolvedAt?: string;
  description: string;
  location: string;
  progress: number;
  notes?: string;
  logs: WorkOrderLog[];
}

export type TransportStatus = 'pending' | 'in_transit' | 'delayed' | 'delivered';

export interface TransportNode {
  location: string;
  timestamp: string;
  status: string;
}

export interface LogisticsPlan {
  provider: string;
  estimatedCost: number;
  duration: string;
  insuranceCoverage: number;
  recommendationReason: string;
}

export interface Transport {
  id: string;
  artworkId: string;
  artworkTitle: string;
  artworkImage: string;
  provider: string;
  trackingNumber: string;
  status: TransportStatus;
  departureDate: string;
  estimatedArrival: string;
  currentLocation: string;
  route: TransportNode[];
  insuranceId: string;
  recommendedPlan?: LogisticsPlan;
  origin: string;
  destination: string;
}

export type InsuranceStatus = 'active' | 'expiring_soon' | 'expired';

export interface Insurance {
  id: string;
  artworkId: string;
  artworkTitle: string;
  artworkImage: string;
  policyNumber: string;
  provider: string;
  premium: number;
  coverage: number;
  startDate: string;
  endDate: string;
  status: InsuranceStatus;
  renewalPending: boolean;
  coverageType: string;
}

export interface HallData {
  hallId: string;
  hallName: string;
  currentExhibition: string;
  exhibitionId: string;
  visitorCount: number;
  heatIndex: number;
  envStatus: 'normal' | 'warning';
  temperature: number;
  humidity: number;
}

export interface EnvironmentSummary {
  overallCompliance: number;
  normalHalls: number;
  warningHalls: number;
  alertsToday: number;
  avgTemperature: number;
  avgHumidity: number;
}

export interface InstallationProgress {
  exhibitionId: string;
  exhibitionName: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  dueDate: string;
  hallName: string;
}

export interface TransportSummary {
  transportId: string;
  artworkTitle: string;
  status: TransportStatus;
  currentLocation: string;
  estimatedArrival: string;
}

export interface DashboardData {
  overview: {
    totalArtworks: number;
    activeExhibitions: number;
    inTransit: number;
    totalValue: number;
    todayVisitors: number;
    pendingApprovals: number;
  };
  halls: HallData[];
  environment: EnvironmentSummary;
  installations: InstallationProgress[];
  logistics: TransportSummary[];
  recentAlerts: Alert[];
  recentActivities: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'artwork' | 'exhibition' | 'sale' | 'task' | 'alert' | 'transport';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

export interface ValuationRules {
  artistReputationWeight: number;
  salesHistoryWeight: number;
  marketTrendWeight: number;
  materialMultiplier: Record<string, number>;
  categoryMultiplier: Record<string, number>;
  autoValuationEnabled: boolean;
}

export interface FilterOptions {
  exhibition?: string;
  artist?: string;
  dateRange?: { start: string; end: string };
  status?: string;
}

export interface DashboardView {
  id: string;
  name: string;
  filters: FilterOptions;
  visibleWidgets: string[];
  createdAt: string;
  createdBy: string;
}

export interface WidgetConfig {
  id: string;
  name: string;
  category: 'stat' | 'chart' | 'section';
  icon: string;
  defaultVisible: boolean;
}

export interface WorkOrderSLAInfo {
  workOrderId: string;
  alertLevel: AlertLevel;
  remainingSeconds: number;
  totalSeconds: number;
  deadline: Date;
  riskLevel: 'safe' | 'warning' | 'danger' | 'overdue';
  assignee?: string;
  assigneeId?: string;
}

export interface AssigneeWorkload {
  assigneeId?: string;
  assignee: string;
  totalCount: number;
  safeCount: number;
  warningCount: number;
  dangerCount: number;
  overdueCount: number;
}
