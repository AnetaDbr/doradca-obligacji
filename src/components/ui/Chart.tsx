"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { YearDataPoint } from "@/lib/bonds/types";
import { formatPLN } from "@/lib/utils/format";

interface ComparisonChartProps {
  yearlyData: YearDataPoint[];
  horizonYears: number;
  investedAmount: number;
}

// Safety: replace NaN / Infinity with null so Recharts skips the point
// instead of drawing an invalid line.
function safe(v: number): number | null {
  return Number.isFinite(v) ? Math.round(v) : null;
}

export default function ComparisonChart({
  yearlyData,
  horizonYears,
  investedAmount,
}: ComparisonChartProps) {
  // Show the chart from year 0 to at least year 8, always including
  // the user's horizon + 2 years context, max 12.
  const maxDisplay = Math.min(Math.max(horizonYears + 2, 8), 12);

  // Year 0 is the starting point (all lines begin at investedAmount).
  // Years 1..maxDisplay come from the pre-computed yearlyData.
  const data = [
    {
      year: 0,
      coi: investedAmount,
      edo: investedAmount,
      deposit: investedAmount,
      inflation: investedAmount,
    },
    ...yearlyData.slice(0, maxDisplay).map((d) => ({
      year: d.year,
      coi: safe(d.coiNet),
      edo: safe(d.edoNet),
      deposit: safe(d.depositNet),
      // inflationRef = investedAmount × cumulative product of positive inflation rates
      // → always non-decreasing; safe() guards against any unexpected NaN
      inflation: safe(d.inflationRef),
    })),
  ];

  const labelMap: Record<string, string> = {
    coi: "COI (z rolowaniem co 4 lata)",
    edo: "EDO (10-letnie)",
    deposit: "Lokata (benchmark)",
    inflation: "Minimalna wartość przy danej inflacji",
  };

  return (
    <div className="w-full" style={{ height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="year"
            tickFormatter={(v) => `${v}`}
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            label={{
              value: "Rok",
              position: "insideBottomRight",
              offset: -5,
              fill: "var(--text-muted)",
              fontSize: 12,
            }}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            width={52}
            // Explicit domain prevents Recharts from compressing lines when
            // the inflation reference diverges far above the bond lines.
            domain={["auto", "auto"]}
          />
          <Tooltip content={<CustomTooltip investedAmount={investedAmount} />} />
          <Legend
            formatter={(value: string) => labelMap[value] ?? value}
            wrapperStyle={{ fontSize: 12 }}
          />

          {/* User's horizon — main reference line */}
          <ReferenceLine
            x={horizonYears}
            stroke="var(--accent)"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{
              value: `Twój cel: rok ${horizonYears}`,
              position: "top",
              fill: "var(--accent)",
              fontSize: 11,
            }}
          />

          {/* COI cycle-end markers (faint) — not shown if they overlap with the goal line */}
          {[4, 8].filter((y) => y <= maxDisplay && y !== horizonYears).map((y) => (
            <ReferenceLine
              key={`coi-cycle-${y}`}
              x={y}
              stroke="var(--coi-color)"
              strokeDasharray="2 4"
              strokeOpacity={0.35}
            />
          ))}

          {/* Inflation reference — ALWAYS monotonically non-decreasing */}
          <Line
            type="monotone"
            dataKey="inflation"
            stroke="var(--scenario-high)"
            strokeWidth={1.5}
            strokeDasharray="8 4"
            dot={false}
            connectNulls={false}
          />

          {/* COI */}
          <Line
            type="monotone"
            dataKey="coi"
            stroke="var(--coi-color)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--coi-color)" }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />

          {/* EDO — post-maturity (years 11–12) shown on deposit; line never drops */}
          <Line
            type="monotone"
            dataKey="edo"
            stroke="var(--edo-color)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--edo-color)" }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />

          {/* Deposit baseline */}
          <Line
            type="monotone"
            dataKey="deposit"
            stroke="var(--text-muted)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
  investedAmount,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number | null; color: string }>;
  label?: number;
  investedAmount: number;
}) {
  void investedAmount;
  if (!active || !payload || !payload.length) return null;

  const names: Record<string, string> = {
    coi: "COI",
    edo: "EDO",
    deposit: "Lokata",
    inflation: "Min. przy inflacji",
  };

  return (
    <div
      className="p-3 rounded-xl text-sm shadow-lg"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>
        Rok {label}
      </div>
      {payload
        .filter((e) => e.value != null)
        .map((entry) => (
          <div key={entry.dataKey} className="flex justify-between gap-4">
            <span style={{ color: entry.color }}>{names[entry.dataKey] ?? entry.dataKey}:</span>
            <span
              className="font-medium"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}
            >
              {formatPLN(entry.value!)}
            </span>
          </div>
        ))}
    </div>
  );
}
