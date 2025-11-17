export type LinkedAccountProvider = 'strava' | 'relive' | 'trainingPeaks' | 'appleHealth' | 'garmin' | 'amazfit';

export type LinkedAccountStatus = {
  connected: boolean;
  connectedAt?: string;
  lastSyncAt?: string;
  expiresAt?: number;
  permissions?: string[];
};

export type LinkedAccounts = {
  [key in LinkedAccountProvider]: LinkedAccountStatus;
};

const LINKED_ACCOUNTS_KEY = 'amakaflow_linked_accounts';

// Get all linked accounts
export function getLinkedAccounts(): LinkedAccounts {
  try {
    const stored = localStorage.getItem(LINKED_ACCOUNTS_KEY);
    if (!stored) {
      return getDefaultLinkedAccounts();
    }
    
    const accounts = JSON.parse(stored);
    return { ...getDefaultLinkedAccounts(), ...accounts };
  } catch (error) {
    console.error('Failed to load linked accounts:', error);
    return getDefaultLinkedAccounts();
  }
}

// Default state (all disconnected)
function getDefaultLinkedAccounts(): LinkedAccounts {
  return {
    strava: { connected: false },
    relive: { connected: false },
    trainingPeaks: { connected: false },
    appleHealth: { connected: false },
    garmin: { connected: false },
    amazfit: { connected: false },
  };
}

// Save linked accounts
export function saveLinkedAccounts(accounts: LinkedAccounts): void {
  try {
    localStorage.setItem(LINKED_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error('Failed to save linked accounts:', error);
  }
}

// Connect an account
export function connectAccount(provider: LinkedAccountProvider, permissions?: string[]): void {
  const accounts = getLinkedAccounts();
  accounts[provider] = {
    connected: true,
    connectedAt: new Date().toISOString(),
    lastSyncAt: new Date().toISOString(),
    expiresAt: Date.now() + (90 * 24 * 60 * 60 * 1000), // 90 days from now
    permissions: permissions || ['read_activities', 'write_activities'],
  };
  saveLinkedAccounts(accounts);
}

// Disconnect an account
export function disconnectAccount(provider: LinkedAccountProvider): void {
  const accounts = getLinkedAccounts();
  accounts[provider] = { connected: false };
  saveLinkedAccounts(accounts);
}

// Check if account is connected
export function isAccountConnected(provider: LinkedAccountProvider): boolean {
  const accounts = getLinkedAccounts();
  const account = accounts[provider];
  
  // Check if expired
  if (account.connected && account.expiresAt && account.expiresAt < Date.now()) {
    return false;
  }
  
  return account.connected;
}

// Check if token is expired
export function isAccountExpired(provider: LinkedAccountProvider): boolean {
  const accounts = getLinkedAccounts();
  const account = accounts[provider];
  
  if (!account.connected) return false;
  
  return !!(account.expiresAt && account.expiresAt < Date.now());
}

// Simulate OAuth URL generation
export function getOAuthUrl(provider: LinkedAccountProvider): string {
  const baseUrls: Record<LinkedAccountProvider, string> = {
    strava: 'https://www.strava.com/oauth/authorize',
    relive: 'https://www.relive.cc/oauth/authorize',
    trainingPeaks: 'https://oauth.trainingpeaks.com/authorize',
    appleHealth: 'app://health.apple.com/authorize',
    garmin: 'https://connect.garmin.com/oauth/authorize',
    amazfit: 'https://api.amazfit.com/oauth/authorize',
  };
  
  const clientId = 'myamaka_client_id';
  const redirectUri = `${window.location.origin}/oauth/callback/${provider}`;
  const scope = 'activity:read_all,activity:write';
  
  return `${baseUrls[provider]}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
}

// Platform metadata
export type PlatformInfo = {
  name: string;
  subtitle: string;
  color: string;
  icon: string;
  available: boolean;
  unavailableReason?: string;
};

export const PLATFORM_INFO: Record<LinkedAccountProvider, PlatformInfo> = {
  strava: {
    name: 'Strava',
    subtitle: 'Sync activities and enhance your Strava workouts.',
    color: '#FC4C02',
    icon: 'strava',
    available: true,
  },
  relive: {
    name: 'Relive',
    subtitle: 'Sync routes and add Relive-style enhancements (future).',
    color: '#00D4AA',
    icon: 'relive',
    available: true,
  },
  trainingPeaks: {
    name: 'TrainingPeaks',
    subtitle: 'Sync structured workouts and training plans.',
    color: '#0066CC',
    icon: 'trainingPeaks',
    available: true,
  },
  appleHealth: {
    name: 'Apple Health',
    subtitle: 'Sync health and fitness data from your iPhone.',
    color: '#FF2D55',
    icon: 'appleHealth',
    available: false,
    unavailableReason: 'Available in the MyAmaka iOS App.',
  },
  garmin: {
    name: 'Garmin Connect',
    subtitle: 'Sync workouts and activities from Garmin devices.',
    color: '#007CC3',
    icon: 'garmin',
    available: true,
  },
  amazfit: {
    name: 'Amazfit',
    subtitle: 'Sync workouts from Amazfit wearables.',
    color: '#FF6900',
    icon: 'amazfit',
    available: true,
  },
};