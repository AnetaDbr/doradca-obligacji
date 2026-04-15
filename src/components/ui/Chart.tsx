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
import { BondCalculation, DepositCalculation } from "@/lib/bonds/types";
import { TAX_RATE } from "@/lib/bonds/constants";
import { formatPLN } from "@/lib/utils/format";

interface ComparisonChartProps {
  coi: BondCalculation;
  edo: BondCalculation;
  deposit: DepositCalculation;
  horizonYears: number;
  investedAmount: number;
}

export default function ComparisonChart({
  coi,
  edo,
  deposit,
  horizonYears,
  investedAmount,
}: ComparisonChartProps) {
  const maxYears = Math.min(Math.max(horizonYears + 2, 8), 12);

  const data = Array.from({ length: maxYears + 1 }, (_, i) => {
    if (i === 0) {
      return {
        year: 0,
        coi: investedAmount,
        edo: investedAmount,
        deposit: investedAmount,
        inflation: investedAmount,
      };
    }

    const coiYear = coi.yearlyResults[i - 1];
    const edoYear = edo.yearlyResults[i - 1];
    const depositValue = deposit.yearlyValues[i - 1] ?? deposit.yearlyValues[deposit.yearlyValues.length - 1];

    // EDO net value (after tax if redeemed at this year)
    const edoGross = edoYear?.capitalAtEnd ?? 0;
    const edoGain = edoGross - investedAmount;
    const edoTax = edoGain > 0 ? edoGain * TAX_RATE : 0;
    const edoNet = edoGross - edoTax;

    // Inflation line (purchasing power erosion)
    const inflationValue = coiYear
      ? investedAmount * coiYear.cumulativeInflation
      : investedAmount;

    return {
      year: i,
      coi: coiYear ? Math.round(coiYear.capitalAtEnd) : null,
      edo: Math.round(edoNet),
      deposit: Math.round(depositValue),
      inflation: Math.round(inflationValue),
    };
  });

  return (
    <div className="w-full" style={{ height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="year"
            tickFormatter={(v) => `${v}`}
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            label={{ value: "Rok", position: "insideBottomRight", offset: -5, fill: "var(--text-muted)", fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            width={50}
          />
          <Tooltip
            content={<CustomTooltip investedAmount={investedAmount} />}
          />
          <Legend
            formatter={(value: string) => {
              const labels: Record<string, string> = {
                coi: "COI (4-letnie)",
                edo: "EDO (10-letnie)",
                deposit: "Lokata",
                inflation: "Inflacja skumulowana",
              };
              return labels[value] || value;
            }}
            wrapperStyle={{ fontSize: 12 }}
          />

          <ReferenceLine
            x={horizonYears}
            stroke="var(--text-muted)"
            strokeDasharray="6 4"
            label={{
              value: `Twój cel: rok ${horizonYears}`,
              position: "top",
              fill: "var(--text-muted)",
              fontSize: 11,
            }}
          />

          <Line
            type="monotone"
            dataKey="coi"
            stroke="var(--coi-color)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--coi-color)" }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="edo"
            stroke="var(--edo-color)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--edo-color)" }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="deposit"
            stroke="var(--text-muted)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="inflation"
            stroke="var(--scenario-high)"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomTooltip({ active, payload, label, investedAmount }: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: number;
  investedAmount: number;
}) {
  if (!active || !payload) return null;

  const names: Record<string, string> = {
    coi: "COI",
    edo: "EDO",
    deposit: "Lokata",
    inflation: "Inflacja zjadła",
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
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex justify-between gap-4">
          <span style={{ color: entry.color }}>{names[entry.dataKey]}:</span>
          <span className="font-medium" style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
            {entry.dataKey === "inflation"
              ? formatPLN(entry.value - investedAmount)
              : formatPLN(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
