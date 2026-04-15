"use client";

import { BondCalculation, BondType } from "@/lib/bonds/types";
import { BOND_PARAMS } from "@/lib/bonds/constants";
import { formatPLN, formatPercent, formatYears } from "@/lib/utils/format";
import CountUp from "./CountUp";
import InfoTooltip from "./Tooltip";

interface BondCardProps {
  type: BondType;
  result: BondCalculation;
  horizonYears: number;
  isBetter: boolean;
}

const CARD_LABELS: Record<BondType, { short: string; when: string }> = {
  COI: {
    short: "Większa płynność",
    when: "Lepszy wybór, gdy potrzebujesz pieniędzy w ciągu 4 lat",
  },
  EDO: {
    short: "Najlepsza ochrona długoterminowa",
    when: "Lepszy wybór przy horyzoncie powyżej 4 lat",
  },
};

export default function BondCard({ type, result, horizonYears, isBetter }: BondCardProps) {
  const params = BOND_PARAMS[type];
  const colorVar = type === "COI" ? "--coi-color" : "--edo-color";
  const lightVar = type === "COI" ? "--coi-light" : "--edo-light";
  const label = CARD_LABELS[type];

  const numberOfBonds = result.investedAmount / params.nominalValue;
  const feePerBond = params.earlyRedemptionFee;

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
          className="text-xs font-semibold px-3 py-1 rounded-full mb-2 inline-block"
          style={{ backgroundColor: `var(${colorVar})`, color: "white" }}
        >
          ✓ Korzystniejsze przy Twoim horyzoncie
        </div>
      )}

      {/* Bond name + character label */}
      <h3
        className="text-lg font-bold mb-1"
        style={{ color: `var(${colorVar})`, fontFamily: "var(--font-heading)" }}
      >
        {params.name}
      </h3>
      <div
        className="text-xs font-medium mb-4 px-2 py-1 rounded-md inline-block"
        style={{ backgroundColor: `var(${lightVar})`, color: `var(${colorVar})` }}
      >
        {label.short}
      </div>

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

      {/* Details with inline tooltips */}
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
          label={
            <InfoTooltip
              term="Odsetki"
              explanation={
                params.interestCapitalization
                  ? "Kapitalizacja oznacza, że odsetki są dopisywane do kapitału. W kolejnym roku odsetki naliczane są od większej kwoty — to efekt procentu składanego."
                  : "Odsetki są wypłacane co rok na Twoje konto. Możesz je wydać lub zainwestować ponownie, np. na lokacie."
              }
            />
          }
          value={
            params.interestCapitalization
              ? "kapitalizowane"
              : "wypłacane co rok"
          }
        />
        {result.earlyRedemption && (
          <DetailRow
            label={
              <InfoTooltip
                term="Wcz. wykup"
                explanation={`Opłata za przedterminowy wykup: ${formatPLN(feePerBond, 2)} za każdą obligację (100 zł). Przy ${numberOfBonds.toLocaleString("pl-PL")} szt. to koszt ${formatPLN(result.earlyRedemptionFee)}. Opłata nie może przekroczyć narosłych odsetek — nie zjada kapitału.`}
              />
            }
            value={`${formatPLN(result.earlyRedemptionFee)}`}
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

function DetailRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <span style={{ color: "var(--text-muted)" }}>{label}:</span>
      <span className="text-right" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}
