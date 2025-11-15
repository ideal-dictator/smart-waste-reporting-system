export interface WasteReport {
  id: string;
  citizenName: string;
  citizenPhone: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  imageUrl: string;
  description: string;
  wasteType: 'Organic' | 'Plastic' | 'Medical' | 'E-Waste' | 'Glass' | 'Metal' | 'Mixed';
  severity: number;
  confidence: number;
  status: 'Pending' | 'Assigned' | 'In Progress' | 'Resolved';
  assignedWorker?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  email: string;
  zone: string;
  activeJobs: number;
}

export interface Analytics {
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;
  averageResolutionTime: number;
  reportsByType: Record<string, number>;
  reportsByZone: Record<string, number>;
  monthlyTrends: Array<{ month: string; reports: number; resolved: number }>;
}

export interface User {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  picture?: string;
  provider?: 'google' | 'demo' | string;
  rewardPoints?: number;
  role?: 'citizen' | 'admin' | 'worker';
}

export type UserRole = 'citizen' | 'admin' | 'worker';