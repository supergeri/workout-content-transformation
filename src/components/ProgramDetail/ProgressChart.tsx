/**
 * ProgressChart - Area chart showing intensity and volume over weeks
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { TrainingProgram, ProgramWeek } from '../../types/training-program';

interface ProgressChartProps {
  program: TrainingProgram;
  currentWeek: number;
}

interface ChartDataPoint {
  week: number;
  weekLabel: string;
  intensity: number;
  volume: number;
  isDeload: boolean;
  isCurrent: boolean;
}

function prepareChartData(program: TrainingProgram): ChartDataPoint[] {
  return program.weeks.map((week) => ({
    week: week.week_number,
    weekLabel: `W${week.week_number}`,
    intensity: week.intensity_percentage || 70,
    volume: Math.round(week.volume_modifier * 100),
    isDeload: week.is_deload,
    isCurrent: week.week_number === program.current_week,
  }));
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const weekData = payload[0]?.payload as ChartDataPoint | undefined;

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-2">
        Week {weekData?.week}
        {weekData?.isDeload && (
          <span className="text-blue-600 ml-2">(Deload)</span>
        )}
        {weekData?.isCurrent && (
          <span className="text-green-600 ml-2">(Current)</span>
        )}
      </p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground capitalize">
                {entry.name}
              </span>
            </div>
            <span className="font-medium">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressChart({ program, currentWeek }: ProgressChartProps) {
  const chartData = prepareChartData(program);

  // Find deload weeks for highlighting
  const deloadWeeks = chartData
    .filter((d) => d.isDeload)
    .map((d) => d.week);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5" />
            Periodization Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No periodization data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="w-5 h-5" />
          Periodization Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="intensityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 120]}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />

            {/* Current week marker */}
            <ReferenceLine
              x={`W${currentWeek}`}
              stroke="#22c55e"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: 'Current',
                position: 'top',
                fill: '#22c55e',
                fontSize: 10,
              }}
            />

            {/* Intensity area */}
            <Area
              type="monotone"
              dataKey="intensity"
              name="Intensity"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#intensityGradient)"
            />

            {/* Volume area */}
            <Area
              type="monotone"
              dataKey="volume"
              name="Volume"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#volumeGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Deload week indicators */}
        {deloadWeeks.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Deload weeks: {deloadWeeks.join(', ')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
