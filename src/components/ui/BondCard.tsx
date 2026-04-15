"use client";

import { BondCalculation, BondType } from "@/lib/bonds/types";
import { BOND_PARAMS } from "@/lib/bonds/constants";
import { formatPLN, formatPercent, formatYears } from "@/lib/utils/format";
import CountUp from "./CountUp";

interface BondCardProps {
  type: BondType;
  result: BondCalculation;
  horizonYears: number;
  isBetter: boolean;
}

export default function BondCard({ type, result, horizonYears, isBetter }: BondCardProps) {
  const params = BOND_PARAMS[type];
  const colorVar = type === "COI" ? "--coi-color" : "--edo-color";
  const lightVar = type === "COI" ? "--coi-light" : "--edo-light";

  return (
    <div
      className="rounded-2xl p-5 relative transition-all"
      style={{
        backgroundColor: isBetter ? `var(${lightVar})` : "var(--bg-card)",
        border: isBetter
          ? `2px solid var(${colorVar})`
          : "1px solid var(--border)",
        boxShadow: isBetter ? "none" : "var(--shadow)",
      }}
    >
      {/* Better label */}
      {isBetter && (
        <div
          className="text-xs font-semibold px-3 py-1 rounded-full mb-3 inline-block"
          style={{ backgroundColor: `var(${colorVar})`, color: "white" }}
        >
          ✓ Korzystniejsze przy Twoim horyzoncie
        </div>
      )}

      {/* Bond name */}
      <h3
        className="text-lg font-bold mb-4"
        style={{ color: `var(${colorVar})`, fontFamily: "var(--font-heading)" }}
      >
        {params.name}
      </h3>

      {/* Main result */}
      <div className="mb-4">
        <div className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
          Po {formatYears(horizonYears)}:
        </div>
        <div
          className="text-3xl font-bold"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}
        >
          <CountUp value={result.finalValueNet} />
        </div>
        <div
          className="text-sm font-medium mt-1"
          style={{ color: result.totalReturn >= 0 ? "var(--scenario-low)" : "var(--scenario-high)" }}
        >
          {result.totalReturn >= 0 ? "+" : ""}{formatPLN(result.totalReturn)} ({formatPercent(result.totalReturnPercent)})
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
        <DetailRow
          label="Oprocentowanie"
          value={
            <>
              1. rok: {formatPercent(params.firstPeriodRate * 100)}
              <br />
              potem: inflacja +{formatPercent(params.margin * 100)}
            </>
          }
        />
        <DetailRow
          label="Odsetki"
          value={
            params.interestCapitalization
              ? "kapitalizowane (pracują na siebie)"
              : "wypłacane co rok"
          }
        />
        {result.earlyRedemption && (
          <DetailRow
            label="Wcz. wykup"
            value={`opłata ${formatPLN(result.earlyRedemptionFee)}`}
          />
        )}
        <DetailRow
          label="Zapadalność"
          value={formatYears(params.maturityMonths / 12)}
        />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <span style={{ color: "var(--text-muted)" }}>{label}:</span>
      <span className="text-right" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}
