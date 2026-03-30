"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DailyAnalyticsPoint } from "@/lib/types";

type AnalyticsChartProps = {
  data: DailyAnalyticsPoint[];
};

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  if (data.length === 0) {
    return (
      <div className="surface-card rounded-[24px] p-6 text-sm leading-7 text-muted">
        Analytics will populate here after your links start receiving traffic.
      </div>
    );
  }

  return (
    <div className="surface-card rounded-[24px] p-4 sm:p-5">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="blinkClicks" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#0a84ff" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#0a84ff" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(22,49,79,0.08)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6d86a1", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "#6d86a1", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: "#0a84ff", strokeDasharray: "4 4" }}
              contentStyle={{
                borderRadius: 18,
                border: "1px solid rgba(22,49,79,0.08)",
                boxShadow: "0 18px 40px rgba(15,64,114,0.14)",
              }}
            />
            <Area
              type="monotone"
              dataKey="clicks"
              stroke="#0a84ff"
              strokeWidth={3}
              fill="url(#blinkClicks)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
