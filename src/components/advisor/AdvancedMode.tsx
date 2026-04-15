"use client";

import { BondCalculation, Scenario } from "@/lib/bonds/types";
import { formatPercent, formatPLN } from "@/lib/utils/format";
import { TAX_RATE } from "@/lib/bonds/constants";

interface AdvancedModeProps {
  scenario: Scenario;
  onInflationChange: (inflation: number[]) => void;
  onDepositRateChange: (rates: number[]) => void;
  coi: BondCalculation;
  edo: BondCalculation;
}

export default function AdvancedMode({
  scenario,
  onInflationChange,
  onDepositRateChange,
  coi,
  edo,
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

  const maxYears = Math.max(coi.yearlyResults.length, edo.yearlyResults.length);

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
            {Array.from({ length: maxYears }, (_, i) => {
              const coiYear = coi.yearlyResults[i];
              const edoYear = edo.yearlyResults[i];
              const inflRate = scenario.inflation[i] ?? scenario.inflation[scenario.inflation.length - 1];

              // EDO net at this year
              const edoGross = edoYear?.capitalAtEnd ?? 0;
              const edoGain = edoGross - edo.investedAmount;
              const edoTax = edoGain > 0 ? edoGain * TAX_RATE : 0;
              const edoNet = edoGross - edoTax;

              return (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="py-1.5 px-2" style={{ color: "var(--text-primary)" }}>{i + 1}</td>
                  <td className="py-1.5 px-2 text-right" style={{ color: "var(--text-secondary)" }}>
                    {formatPercent(inflRate)}
                  </td>
                  <td className="py-1.5 px-2 text-right" style={{ color: "var(--coi-color)" }}>
                    {coiYear ? formatPercent(coiYear.interestRate * 100) : "—"}
                  </td>
                  <td className="py-1.5 px-2 text-right" style={{ color: "var(--coi-color)" }}>
                    {coiYear ? formatPLN(coiYear.capitalAtEnd) : "—"}
                  </td>
                  <td className="py-1.5 px-2 text-right" style={{ color: "var(--edo-color)" }}>
                    {edoYear ? formatPercent(edoYear.interestRate * 100) : "—"}
                  </td>
                  <td className="py-1.5 px-2 text-right" style={{ color: "var(--edo-color)" }}>
                    {edoYear ? formatPLN(edoNet) : "—"}
                  </td>
                  <td className="py-1.5 px-2 text-right" style={{ color: "var(--text-muted)" }}>
                    {coiYear ? formatPercent((coiYear.cumulativeInflation - 1) * 100) : "—"}
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
