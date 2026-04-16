"use client";

import { Scenario, YearDataPoint } from "@/lib/bonds/types";
import { formatPercent, formatPLN } from "@/lib/utils/format";

interface AdvancedModeProps {
  scenario: Scenario;
  onInflationChange: (inflation: number[]) => void;
  onDepositRateChange: (rates: number[]) => void;
  yearlyData: YearDataPoint[];
}

export default function AdvancedMode({
  scenario,
  onInflationChange,
  onDepositRateChange,
  yearlyData,
}: AdvancedModeProps) {
  function handleInflation(yearIndex: number, value: number) {
    const newInflation = [...scenario.inflation];
    newInflation[yearIndex] = value;
    onInflationChange(newInflation);
  }

  function handleDeposit(yearIndex: number, value: number) {
    const newRates = [...scenario.depositRate];
    newRates[yearIndex] = value;
    onDepositRateChange(newRates);
  }

  return (
    <div
      className="p-5 rounded-xl mb-6"
      style={{ backgroundColor: "var(--bg-section)", border: "1px solid var(--border)" }}
    >
      <h4 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>
        Własne założenia inflacji
      </h4>

      {/* Inflation inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i}>
            <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>
              Rok {i + 1}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step={0.1}
                min={0}
                max={20}
                value={scenario.inflation[i]}
                onChange={(e) => handleInflation(i, Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg text-sm text-right outline-none"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)",
                }}
              />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Deposit rate inputs */}
      <h4 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
        Oprocentowanie lokaty (benchmark)
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i}>
            <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>
              Rok {i + 1}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step={0.1}
                min={0}
                max={20}
                value={scenario.depositRate[i]}
                onChange={(e) => handleDeposit(i, Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg text-sm text-right outline-none"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)",
                }}
              />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Year-by-year table */}
      <h4 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
        Tabela rok po roku
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ fontFamily: "var(--font-mono)" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)" }}>
              <th className="py-2 px-2 text-left" style={{ color: "var(--text-muted)" }}>Rok</th>
              <th className="py-2 px-2 text-right" style={{ color: "var(--text-muted)" }}>Inflacja</th>
              <th className="py-2 px-2 text-right" style={{ color: "var(--coi-color)" }}>% COI</th>
              <th className="py-2 px-2 text-right" style={{ color: "var(--coi-color)" }}>Wartość COI</th>
              <th className="py-2 px-2 text-right" style={{ color: "var(--edo-color)" }}>% EDO</th>
              <th className="py-2 px-2 text-right" style={{ color: "var(--edo-color)" }}>Wartość EDO</th>
              <th className="py-2 px-2 text-right" style={{ color: "var(--text-muted)" }}>Infl. skum.</th>
            </tr>
          </thead>
          <tbody>
            {yearlyData.map((d) => {
              const inflRate = scenario.inflation[d.year - 1] ?? scenario.inflation[scenario.inflation.length - 1];
              return (
                <tr key={d.year} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="py-1.5 px-2" style={{ color: "var(--text-primary)" }}>{d.year}</td>
                  <td className="py-1.5 px-2 text-right" style={{ color: "var(--text-secondary)" }}>
                    {formatPercent(inflRate)}
                  </td>
                  <td className="py-1.5 px-2 text-right" style={{ color: "var(--coi-color)" }}>
                    {formatPercent(d.coiRate * 100)}
                  </td>
                  <td className="py-1.5 px-2 text-right" style={{ color: "var(--coi-color)" }}>
                    {formatPLN(d.coiNet)}
                  </td>
                  <td className="py-1.5 px-2 text-right" style={{ color: "var(--edo-color)" }}>
                    {formatPercent(d.edoRate * 100)}
                  </td>
                  <td className="py-1.5 px-2 text-right" style={{ color: "var(--edo-color)" }}>
                    {formatPLN(d.edoNet)}
                  </td>
                  <td className="py-1.5 px-2 text-right" style={{ color: "var(--text-muted)" }}>
                    {formatPercent((d.cumulativeInflation - 1) * 100)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
