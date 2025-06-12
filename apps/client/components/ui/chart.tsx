"use client"
import {
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  AreaChart as RechartsAreaChart,
  type TooltipProps,
} from "recharts"
import { Card } from "@/components/ui/card"

interface ChartProps {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  className?: string
}

const chartColors = {
  black: "#000000",
  white: "#FFFFFF",
  gray: "#888888",
  lightGray: "#DDDDDD",
  darkGray: "#333333",
}

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: TooltipProps<any, any> & { valueFormatter?: (value: number) => string }) {
  if (!active || !payload) return null

  return (
    <Card className="border shadow-sm p-2 bg-background">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      {payload.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="font-medium text-sm">{valueFormatter ? valueFormatter(item.value) : item.value}</span>
        </div>
      ))}
    </Card>
  )
}

export function LineChart({
  data,
  index,
  categories,
  colors = [chartColors.black],
  valueFormatter,
  className,
}: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.lightGray} vertical={false} />
          <XAxis
            dataKey={index}
            tick={{ fill: chartColors.darkGray, fontSize: 12 }}
            tickLine={{ stroke: chartColors.lightGray }}
            axisLine={{ stroke: chartColors.lightGray }}
            tickMargin={8}
          />
          <YAxis
            tick={{ fill: chartColors.darkGray, fontSize: 12 }}
            tickLine={{ stroke: chartColors.lightGray }}
            axisLine={{ stroke: chartColors.lightGray }}
            tickFormatter={valueFormatter}
            tickMargin={8}
          />
          <Tooltip
            content={({ active, payload, label }) => (
              <ChartTooltip active={active} payload={payload} label={label} valueFormatter={valueFormatter} />
            )}
          />
          {categories.map((category, i) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BarChart({
  data,
  index,
  categories,
  colors = [chartColors.black],
  valueFormatter,
  className,
}: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.lightGray} vertical={false} />
          <XAxis
            dataKey={index}
            tick={{ fill: chartColors.darkGray, fontSize: 12 }}
            tickLine={{ stroke: chartColors.lightGray }}
            axisLine={{ stroke: chartColors.lightGray }}
            tickMargin={8}
          />
          <YAxis
            tick={{ fill: chartColors.darkGray, fontSize: 12 }}
            tickLine={{ stroke: chartColors.lightGray }}
            axisLine={{ stroke: chartColors.lightGray }}
            tickFormatter={valueFormatter}
            tickMargin={8}
          />
          <Tooltip
            content={({ active, payload, label }) => (
              <ChartTooltip active={active} payload={payload} label={label} valueFormatter={valueFormatter} />
            )}
          />
          {categories.map((category, i) => (
            <Bar key={category} dataKey={category} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AreaChart({
  data,
  index,
  categories,
  colors = [chartColors.black],
  valueFormatter,
  className,
}: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.lightGray} vertical={false} />
          <XAxis
            dataKey={index}
            tick={{ fill: chartColors.darkGray, fontSize: 12 }}
            tickLine={{ stroke: chartColors.lightGray }}
            axisLine={{ stroke: chartColors.lightGray }}
            tickMargin={8}
          />
          <YAxis
            tick={{ fill: chartColors.darkGray, fontSize: 12 }}
            tickLine={{ stroke: chartColors.lightGray }}
            axisLine={{ stroke: chartColors.lightGray }}
            tickFormatter={valueFormatter}
            tickMargin={8}
          />
          <Tooltip
            content={({ active, payload, label }) => (
              <ChartTooltip active={active} payload={payload} label={label} valueFormatter={valueFormatter} />
            )}
          />
          {categories.map((category, i) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              fill={colors[i % colors.length]}
              stroke={colors[i % colors.length]}
              fillOpacity={0.2}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
