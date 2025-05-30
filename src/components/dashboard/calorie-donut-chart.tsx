"use client";

import React, { type FC } from 'react'; // Ensure React is imported
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Label, type TooltipProps } from 'recharts';

interface CalorieDonutChartProps {
  chartData: Array<{ name: string; value: number; fill: string }>;
  consumedCalories: number;
  goalCalories: number;
}

interface CaloriesCenterLabelProps {
  viewBox?: { cx?: number; cy?: number };
  value: number;
}

const CaloriesCenterLabel: FC<CaloriesCenterLabelProps> = ({ viewBox, value }) => {
  if (!viewBox || typeof viewBox.cx !== 'number' || typeof viewBox.cy !== 'number') {
    return null;
  }
  const { cx, cy } = viewBox;
  return (
    <text x={cx} y={cy} fill="hsl(var(--foreground))" textAnchor="middle" dominantBaseline="central">
      <tspan x={cx} y={cy - 8} fontSize="1.75rem" fontWeight="bold">{`${Math.round(value)}`}</tspan>
      <tspan x={cx} y={cy + 12} fontSize="0.75rem" fill="hsl(var(--muted-foreground))">Calories</tspan>
    </text>
  );
};

interface CustomDonutTooltipProps extends TooltipProps<number, string> {
  goalCalories: number;
}

const CustomDonutTooltip: FC<CustomDonutTooltipProps> = ({ active, payload, goalCalories }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value || 0; 
    const name = data.name;

    let displayName = name;
    if (name === 'ConsumedNoGoal') {
      displayName = 'Consumed';
    } else if (name === 'Empty') {
      displayName = goalCalories > 0 ? 'Goal Not Reached' : 'Goal Not Set';
    } else if (name === 'Remaining' && goalCalories > 0) {
      displayName = 'Remaining in Goal';
    }

    const displayValue = (name === 'Empty' && value === 1 && goalCalories === 0 && data.value === 1)
      ? '0 kcal'
      : `${Math.round(value)} kcal`;

    return (
      <div className="rounded-lg border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md" style={{backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))"}}>
        <p className="font-semibold">{displayName}</p>
        <p className="text-muted-foreground">{displayValue}</p>
      </div>
    );
  }
  return null;
};


const CalorieDonutChart: FC<CalorieDonutChartProps> = ({ chartData, consumedCalories, goalCalories }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius="75%"
          outerRadius="95%"
          dataKey="value"
          stroke="none"
          paddingAngle={chartData.length > 1 && consumedCalories > 0 && (goalCalories - consumedCalories) > 0 ? 8 : 0}
          isAnimationActive={true}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.fill}
            />
          ))}
          {goalCalories >= 0 && <Label content={<CaloriesCenterLabel value={consumedCalories} />} position="center" />}
        </Pie>
        <Tooltip
          content={<CustomDonutTooltip goalCalories={goalCalories}/>}
          wrapperStyle={{ outline: "none" }}
          cursor={{ fill: 'hsla(var(--primary-hsl), 0.1)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CalorieDonutChart;

    