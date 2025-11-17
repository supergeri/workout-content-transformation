export type DeviceId = 
  | 'garmin'
  | 'apple'
  | 'zwift'
  | 'suunto'
  | 'polar'
  | 'coros'
  | 'wahoo'
  | 'trainingpeaks'
  | 'strava'
  | 'whoop'
  | 'fitbit'
  | 'oura'
  | 'peloton'
  | 'concept2'
  | 'trainerroad'
  | 'final-surge';

export interface Device {
  id: DeviceId;
  name: string;
  description: string;
  category: 'watch' | 'platform' | 'equipment' | 'tracker';
  format: string;
  icon: string;
  popular?: boolean;
}

export const AVAILABLE_DEVICES: Device[] = [
  // Watches
  {
    id: 'garmin',
    name: 'Garmin',
    description: 'Fenix, Forerunner, Instinct',
    category: 'watch',
    format: 'YAML',
    icon: '⌚',
    popular: true
  },
  {
    id: 'apple',
    name: 'Apple Watch',
    description: 'Watch & Fitness app',
    category: 'watch',
    format: 'PLIST',
    icon: '⌚',
    popular: true
  },
  {
    id: 'suunto',
    name: 'Suunto',
    description: 'Vertical, Race, 9 Peak',
    category: 'watch',
    format: 'FIT',
    icon: '⌚',
    popular: true
  },
  {
    id: 'polar',
    name: 'Polar',
    description: 'Vantage, Grit, Ignite',
    category: 'watch',
    format: 'TCX',
    icon: '⌚',
    popular: true
  },
  {
    id: 'coros',
    name: 'COROS',
    description: 'Pace, Apex, Vertix',
    category: 'watch',
    format: 'FIT',
    icon: '⌚'
  },
  {
    id: 'wahoo',
    name: 'Wahoo',
    description: 'ELEMNT, RIVAL',
    category: 'watch',
    format: 'FIT',
    icon: '⌚'
  },
  
  // Training Platforms
  {
    id: 'trainingpeaks',
    name: 'TrainingPeaks',
    description: 'Professional training platform',
    category: 'platform',
    format: 'JSON',
    icon: '📊',
    popular: true
  },
  {
    id: 'strava',
    name: 'Strava',
    description: 'Social fitness network',
    category: 'platform',
    format: 'TCX',
    icon: '🏃',
    popular: true
  },
  {
    id: 'zwift',
    name: 'Zwift',
    description: 'Virtual training platform',
    category: 'platform',
    format: 'ZWO',
    icon: '🚴',
    popular: true
  },
  {
    id: 'trainerroad',
    name: 'TrainerRoad',
    description: 'Structured training',
    category: 'platform',
    format: 'MRC',
    icon: '🚴'
  },
  {
    id: 'final-surge',
    name: 'Final Surge',
    description: 'Coaching platform',
    category: 'platform',
    format: 'JSON',
    icon: '📈'
  },
  
  // Fitness Trackers
  {
    id: 'whoop',
    name: 'WHOOP',
    description: 'Recovery & strain tracker',
    category: 'tracker',
    format: 'JSON',
    icon: '💪'
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    description: 'Fitness & wellness',
    category: 'tracker',
    format: 'TCX',
    icon: '⌚'
  },
  {
    id: 'oura',
    name: 'Oura Ring',
    description: 'Sleep & recovery',
    category: 'tracker',
    format: 'JSON',
    icon: '💍'
  },
  
  // Equipment
  {
    id: 'peloton',
    name: 'Peloton',
    description: 'Bike & Tread',
    category: 'equipment',
    format: 'JSON',
    icon: '🚴'
  },
  {
    id: 'concept2',
    name: 'Concept2',
    description: 'Rowing & SkiErg',
    category: 'equipment',
    format: 'CSV',
    icon: '🚣'
  }
];

export const getDeviceById = (id: DeviceId): Device | undefined => {
  return AVAILABLE_DEVICES.find(d => d.id === id);
};

export const getDevicesByIds = (ids: DeviceId[]): Device[] => {
  return ids.map(id => getDeviceById(id)).filter(Boolean) as Device[];
};

export const getDevicesByCategory = (category: Device['category']): Device[] => {
  return AVAILABLE_DEVICES.filter(d => d.category === category);
};

export const getPopularDevices = (): Device[] => {
  return AVAILABLE_DEVICES.filter(d => d.popular);
};
