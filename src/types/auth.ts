import { DeviceId } from '../lib/devices';

export type SubscriptionTier = 'free' | 'pro' | 'trainer';

export interface User {
  id: string;
  email: string;
  name: string;
  subscription: SubscriptionTier;
  workoutsThisWeek: number;
  selectedDevices: DeviceId[];
  exportGarminUsb?: boolean; // NEW: Garmin USB FIT export toggle
  billingDate?: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
