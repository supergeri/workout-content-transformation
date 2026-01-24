/**
 * Period selector for volume analytics (Weekly/Monthly/Quarterly).
 *
 * Part of AMA-483: Volume Analytics Dashboard
 */

import { Button } from '../ui/button';

export type VolumePeriod = 'weekly' | 'monthly' | 'quarterly';

interface PeriodSelectorProps {
  value: VolumePeriod;
  onChange: (value: VolumePeriod) => void;
}

const periodOptions: { value: VolumePeriod; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
];

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg" data-testid="period-selector">
      {periodOptions.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onChange(option.value)}
          className="px-4"
          data-testid={`period-option-${option.value}`}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

/**
 * Calculate date ranges for current and previous periods.
 */
export function getPeriodDates(period: VolumePeriod): {
  current: { startDate: string; endDate: string };
  previous: { startDate: string; endDate: string };
  granularity: 'daily' | 'weekly' | 'monthly';
} {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];

  const daysMap: Record<VolumePeriod, number> = {
    weekly: 7,
    monthly: 30,
    quarterly: 90,
  };

  const granularityMap: Record<VolumePeriod, 'daily' | 'weekly' | 'monthly'> = {
    weekly: 'daily',
    monthly: 'weekly',
    quarterly: 'monthly',
  };

  const days = daysMap[period];
  const granularity = granularityMap[period];

  // Current period: [now - days, now]
  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - days);

  // Previous period: [now - 2*days, now - days]
  const previousEnd = new Date(currentStart);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - days);

  return {
    current: {
      startDate: currentStart.toISOString().split('T')[0],
      endDate,
    },
    previous: {
      startDate: previousStart.toISOString().split('T')[0],
      endDate: previousEnd.toISOString().split('T')[0],
    },
    granularity,
  };
}
