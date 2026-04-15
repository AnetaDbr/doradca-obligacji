"use client";

import { useMemo, useState } from "react";
import { Goal, ScenarioKey, Scenario, BondCalculation, DepositCalculation } from "@/lib/bonds/types";
import { SCENARIOS } from "@/lib/bonds/scenarios";
import { calculateForGoal } from "@/lib/bonds/engine";
import { getExplanation } from "@/lib/utils/recommendations";
import { formatPLN, formatPercent, formatYears } from "@/lib/utils/format";
import ScenarioToggle from "../ui/ScenarioToggle";
import BondCard from "../ui/BondCard";
import ComparisonChart from "../ui/Chart";
import AdvancedMode from "./AdvancedMode";

interface ResultScreenProps {
  goals: Goal[];
  scenario: ScenarioKey;
  onScenarioChange: (s: ScenarioKey) => void;
  onBack: () => void;
  onRestart: () => void;
}

export default function ResultScreen({
  goals,
  scenario,
  onScenarioChange,
  onBack,
  onRestart,
}: ResultScreenProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [customInflation, setCustomInflation] = useState<number[] | null>(null);
  const [customDepositRate, setCustomDepositRate] = useState<number[] | null>(null);
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  const activeScenario = useMemo(() => {
    if (customInflation && customDepositRate) {
      return {
        ...SCENARIOS[scenario],
        inflation: customInflation,
        depositRate: customDepositRate,
      };
    }
    return SCENARIOS[scenario];
  }, [scenario, customInflation, customDepositRate]);

  const results = useMemo(
    () =>
      goals.map((goal) => ({
        goal,
        ...calculateForGoal(goal, activeScenario),
      })),
    [goals, activeScenario]
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-sm font-medium cursor-pointer"
          style={{ color: "var(--text-secondary)" }}
        >
          ← Zmień dane
        </button>
        <h2
          className="text-xl font-bold"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}
        >
          Wynik porównania
        </h2>
        <div style={{ width: 80 }} />
      </div>

      {/* Scenario toggle — shared across all goals */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Scenariusz inflacji:
        </span>
        <ScenarioToggle value={scenario} onChange={(s) => {
          onScenarioChange(s);
          setCustomInflation(null);
          setCustomDepositRate(null);
        }} />
        <button
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="text-sm font-medium cursor-pointer ml-auto"
          style={{ color: "var(--accent)" }}
        >
          {advancedOpen ? "Ukryj ustawienia zaawansowane" : "Pokaż ustawienia zaawansowane"}
        </button>
      </div>

      {/* Advanced mode */}
      {advancedOpen && results.length > 0 && (
        <AdvancedMode
          scenario={activeScenario}
          onInflationChange={setCustomInflation}
          onDepositRateChange={setCustomDepositRate}
          coi={results[0].coi}
          edo={results[0].edo}
        />
      )}

      {/* Results for each goal */}
      {results.map(({ goal, coi, edo, deposit, betterOption }, idx) => (
        <GoalResultSection
          key={goal.id}
          goal={goal}
          goalIndex={idx}
          totalGoals={results.length}
          coi={coi}
          edo={edo}
          deposit={deposit}
          betterOption={betterOption}
          activeScenario={activeScenario}
        />
      ))}

      {/* Summary for multiple goals */}
      {results.length > 1 && (
        <SummaryTable results={results} />
      )}

      {/* Methodology */}
      <div className="mt-8">
        <button
          onClick={() => setMethodologyOpen(!methodologyOpen)}
          className="text-sm font-medium cursor-pointer flex items-center gap-2"
          style={{ color: "var(--text-secondary)" }}
        >
          <span>{methodologyOpen ? "▾" : "▸"}</span>
          Jak to policzyliśmy?
        </button>
        {methodologyOpen && <MethodologySection />}
      </div>

      {/* CTA */}
      <div
        className="mt-10 p-6 rounded-2xl text-center"
        style={{ backgroundColor: "var(--bg-section)" }}
      >
        <h3
          className="text-lg font-bold mb-3"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}
        >
          Chcesz kupić obligacje?
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://www.obligacjeskarbowe.pl"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 rounded-xl font-semibold text-white transition-colors"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Przejdź do obligacjeskarbowe.pl →
          </a>
          <a
            href="https://marciniwuc.com/obligacje-indeksowane-inflacja-kalkulator/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 rounded-xl font-semibold transition-colors"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            Dowiedz się więcej u Marcina
          </a>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={onRestart}
          className="text-sm font-medium cursor-pointer"
          style={{ color: "var(--text-secondary)" }}
        >
          Zacznij od nowa
        </button>
      </div>
    </div>
  );
}

function GoalResultSection({
  goal,
  goalIndex,
  totalGoals,
  coi,
  edo,
  deposit,
  betterOption,
  activeScenario,
}: {
  goal: Goal;
  goalIndex: number;
  totalGoals: number;
  coi: BondCalculation;
  edo: BondCalculation;
  deposit: DepositCalculation;
  betterOption: "COI" | "EDO" | null;
  activeScenario: Scenario;
}) {
  const [sliderHorizon, setSliderHorizon] = useState(goal.horizonYears);
  const [tableOpen, setTableOpen] = useState(false);

  // Recalculate with slider horizon
  const sliderResults = useMemo(() => {
    if (sliderHorizon === goal.horizonYears) return { coi, edo, deposit, betterOption };
    return calculateForGoal(
      { amount: goal.amount, horizonYears: sliderHorizon },
      activeScenario,
    );
  }, [sliderHorizon, goal, coi, edo, deposit, betterOption, activeScenario]);

  const activeBetter = sliderResults.betterOption ?? betterOption;
  const explanation = getExplanation(sliderHorizon, activeBetter);
  const goalLabel = goal.name || `Cel ${goalIndex + 1}`;

  // Best result for hero — when tied, pick whichever has higher net value
  const best = activeBetter === "COI"
    ? sliderResults.coi
    : activeBetter === "EDO"
      ? sliderResults.edo
      : (sliderResults.coi.finalValueNet >= sliderResults.edo.finalValueNet ? sliderResults.coi : sliderResults.edo);
  const bestLabel = activeBetter ?? (sliderResults.coi.finalValueNet >= sliderResults.edo.finalValueNet ? "COI" : "EDO");
  const realValue = best.finalValueNet / (coi.yearlyResults[sliderHorizon - 1]?.cumulativeInflation ?? 1);

  return (
    <div
      className="mb-10 pb-10"
      style={{ borderBottom: goalIndex < totalGoals - 1 ? "3px solid var(--border)" : "none" }}
    >
      {/* Goal header — prominent section divider */}
      <div
        className="flex items-center gap-3 mb-3 mt-2"
        style={{ color: "var(--accent)" }}
      >
        <div
          className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: "var(--accent)" }}
        >
          {goalIndex + 1}
        </div>
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide block">
            Cel {goalIndex + 1}{totalGoals > 1 ? ` z ${totalGoals}` : ""}
          </span>
          <span
            className="text-lg font-bold block"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}
          >
            {goalLabel} · {formatPLN(goal.amount)} · za {formatYears(goal.horizonYears)}
          </span>
        </div>
      </div>

      {/* HERO — big number summary */}
      <div
        className="p-5 rounded-2xl mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
        style={{ backgroundColor: "var(--bg-section)", border: "1px solid var(--border)" }}
      >
        <div>
          <div className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
            Szacowany zysk netto po {formatYears(sliderHorizon)}
          </div>
          <div
            className="text-3xl sm:text-4xl font-bold"
            style={{ color: "var(--scenario-low)", fontFamily: "var(--font-mono)" }}
          >
            +{formatPLN(best.totalReturn)}
          </div>
          <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            z {bestLabel} ({formatPercent(best.totalReturnPercent)})
          </div>
        </div>
        <div>
          <div className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
            Realna wartość Twoich pieniędzy
          </div>
          <div
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}
          >
            {formatPLN(Math.round(realValue))}
          </div>
          <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            po uwzględnieniu inflacji
          </div>
        </div>
      </div>

      {/* Bond cards side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <BondCard
          type="COI"
          result={sliderResults.coi}
          horizonYears={sliderHorizon}
          isBetter={activeBetter === "COI"}
        />
        <BondCard
          type="EDO"
          result={sliderResults.edo}
          horizonYears={sliderHorizon}
          isBetter={activeBetter === "EDO"}
        />
      </div>

      {/* Explanation */}
      <div
        className="p-4 rounded-xl mb-6"
        style={{ backgroundColor: "var(--accent-light)" }}
      >
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
          💡 {explanation}
        </p>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <h3
          className="text-base font-bold mb-4"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}
        >
          Jak rosną Twoje pieniądze rok po roku
        </h3>
        <ComparisonChart
          coi={coi}
          edo={edo}
          deposit={deposit}
          horizonYears={sliderHorizon}
          investedAmount={goal.amount}
        />
        <p className="text-sm mt-3 italic" style={{ color: "var(--text-secondary)" }}>
          Zauważ, że EDO rośnie wolniej na początku, ale po 4-5 roku zaczyna przyspieszać — to efekt kapitalizacji odsetek.
        </p>
      </div>

      {/* Benchmark — deposit comparison */}
      <BenchmarkSection
        deposit={sliderResults.deposit ?? deposit}
        bestBond={best}
        betterOption={bestLabel}
        horizonYears={sliderHorizon}
      />

      {/* Interactive slider */}
      <div
        className="p-5 rounded-xl mb-6"
        style={{ backgroundColor: "var(--bg-section)", border: "1px solid var(--border)" }}
      >
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          Co jeśli wypłacę w innym momencie?
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={12}
            step={1}
            value={sliderHorizon}
            onChange={(e) => setSliderHorizon(Number(e.target.value))}
            className="flex-1 accent-slider"
          />
          <span
            className="text-lg font-bold min-w-[60px] text-right"
            style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
          >
            {formatYears(sliderHorizon)}
          </span>
        </div>
        {sliderHorizon !== goal.horizonYears && (
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Przesunięto z {formatYears(goal.horizonYears)} na {formatYears(sliderHorizon)}. Wartości powyżej zostały przeliczone.
          </p>
        )}
      </div>

      {/* Detailed table — hidden by default */}
      <button
        onClick={() => setTableOpen(!tableOpen)}
        className="flex items-center gap-2 text-sm font-medium cursor-pointer mb-4"
        style={{ color: "var(--text-secondary)" }}
      >
        <span>{tableOpen ? "▾" : "▸"}</span>
        Pokaż symulację rok po roku
      </button>
      {tableOpen && (
        <YearByYearTable coi={coi} edo={edo} deposit={deposit} investedAmount={goal.amount} />
      )}
    </div>
  );
}

function BenchmarkSection({
  deposit,
  bestBond,
  betterOption,
  horizonYears,
}: {
  deposit: DepositCalculation;
  bestBond: BondCalculation;
  betterOption: "COI" | "EDO";
  horizonYears: number;
}) {
  const advantage = bestBond.finalValueNet - deposit.finalValueNet;

  return (
    <div
      className="p-4 rounded-xl mb-6 flex flex-col sm:flex-row sm:items-center gap-3"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex-1">
        <div className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
          Gdzie indziej zarobisz mniej?
        </div>
        <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Lokata bankowa po {formatYears(horizonYears)}: <strong style={{ fontFamily: "var(--font-mono)" }}>{formatPLN(deposit.finalValueNet)}</strong>
          <span className="ml-2" style={{ color: "var(--text-muted)" }}>
            (zysk netto: {formatPLN(deposit.totalReturn)})
          </span>
        </div>
      </div>
      {advantage > 0 && (
        <div
          className="text-sm font-semibold px-3 py-2 rounded-lg text-center shrink-0"
          style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}
        >
          {betterOption} daje <strong>{formatPLN(Math.round(advantage))}</strong> więcej
        </div>
      )}
    </div>
  );
}

function YearByYearTable({
  coi,
  edo,
  deposit,
  investedAmount,
}: {
  coi: BondCalculation;
  edo: BondCalculation;
  deposit: DepositCalculation;
  investedAmount: number;
}) {
  const maxYears = Math.max(coi.yearlyResults.length, edo.yearlyResults.length);
  const TAX_RATE = 0.19;

  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-xs" style={{ fontFamily: "var(--font-mono)" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--border)" }}>
            <th className="py-2 px-2 text-left" style={{ color: "var(--text-muted)" }}>Rok</th>
            <th className="py-2 px-2 text-right" style={{ color: "var(--coi-color)" }}>COI netto</th>
            <th className="py-2 px-2 text-right" style={{ color: "var(--edo-color)" }}>EDO netto</th>
            <th className="py-2 px-2 text-right" style={{ color: "var(--text-muted)" }}>Lokata</th>
            <th className="py-2 px-2 text-right" style={{ color: "var(--text-muted)" }}>Infl. skum.</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxYears }, (_, i) => {
            const coiYear = coi.yearlyResults[i];
            const edoYear = edo.yearlyResults[i];
            const depositValue = deposit.yearlyValues[i];

            const edoGross = edoYear?.capitalAtEnd ?? 0;
            const edoGain = edoGross - investedAmount;
            const edoTax = edoGain > 0 ? edoGain * TAX_RATE : 0;
            const edoNet = edoGross - edoTax;

            return (
              <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="py-1.5 px-2" style={{ color: "var(--text-primary)" }}>{i + 1}</td>
                <td className="py-1.5 px-2 text-right" style={{ color: "var(--coi-color)" }}>
                  {coiYear ? formatPLN(coiYear.capitalAtEnd) : "—"}
                </td>
                <td className="py-1.5 px-2 text-right" style={{ color: "var(--edo-color)" }}>
                  {edoYear ? formatPLN(edoNet) : "—"}
                </td>
                <td className="py-1.5 px-2 text-right" style={{ color: "var(--text-secondary)" }}>
                  {depositValue ? formatPLN(depositValue) : "—"}
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
  );
}

function SummaryTable({
  results,
}: {
  results: { goal: Goal; betterOption: "COI" | "EDO" | null }[];
}) {
  const reasons: Record<string, string> = {
    COI: "Większa płynność",
    EDO: "Lepsza ochrona długoterminowa",
  };

  return (
    <div
      className="p-6 rounded-2xl mb-8"
      style={{ backgroundColor: "var(--bg-section)", border: "1px solid var(--border)" }}
    >
      <h3
        className="text-lg font-bold mb-3"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}
      >
        Podsumowanie
      </h3>
      <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
        Masz {results.length} cele o różnych horyzontach. Każda pula pieniędzy może pracować w instrumencie dopasowanym do Twojego terminu.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left py-2 pr-3" style={{ color: "var(--text-secondary)" }}>Cel</th>
              <th className="text-right py-2 px-3" style={{ color: "var(--text-secondary)" }}>Kwota</th>
              <th className="text-right py-2 px-3" style={{ color: "var(--text-secondary)" }}>Horyzont</th>
              <th className="text-right py-2 pl-3" style={{ color: "var(--text-secondary)" }}>Korzystniejsze</th>
            </tr>
          </thead>
          <tbody>
            {results.map(({ goal, betterOption }) => (
              <tr key={goal.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="py-2 pr-3 font-medium" style={{ color: "var(--text-primary)" }}>
                  {goal.name || "Cel"}
                </td>
                <td className="py-2 px-3 text-right" style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                  {formatPLN(goal.amount)}
                </td>
                <td className="py-2 px-3 text-right" style={{ color: "var(--text-primary)" }}>
                  {formatYears(goal.horizonYears)}
                </td>
                <td className="py-2 pl-3 text-right font-bold" style={{
                  color: betterOption === "COI" ? "var(--coi-color)" : betterOption === "EDO" ? "var(--edo-color)" : "var(--text-secondary)",
                }}>
                  {betterOption ?? "Zbliżone"}
                  {betterOption && (
                    <span className="font-normal text-xs ml-1" style={{ color: "var(--text-muted)" }}>
                      ({reasons[betterOption]})
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MethodologySection() {
  return (
    <div
      className="mt-4 p-5 rounded-xl text-sm leading-relaxed space-y-3"
      style={{ backgroundColor: "var(--bg-section)", color: "var(--text-secondary)" }}
    >
      <p>
        <strong>COI (4-letnie):</strong> Oprocentowanie w 1. roku = 4,75%. Od 2. roku = inflacja + 1,50%.
        Odsetki wypłacane co rok i reinwestowane na lokacie. Podatek Belki (19%) pobierany od odsetek co rok.
      </p>
      <p>
        <strong>EDO (10-letnie):</strong> Oprocentowanie w 1. roku = 5,35%. Od 2. roku = inflacja + 2,00%.
        Odsetki kapitalizowane (doliczane do kapitału). Podatek Belki (19%) pobierany jednorazowo przy wykupie od całego zysku.
      </p>
      <p>
        <strong>Wcześniejszy wykup:</strong> COI: 0,70 zł/szt. EDO: 2,00 zł/szt. (nominał 100 zł).
        Opłata nie może przekroczyć narosłych odsetek — nie zjada kapitału początkowego.
      </p>
      <p>
        <strong>Lokata:</strong> Benchmark — oprocentowanie zależne od scenariusza inflacyjnego.
        Podatek Belki pobierany co rok.
      </p>
      <p>
        <strong>Ograniczenia:</strong> Model nie uwzględnia rolowania COI po 4 latach,
        zmian warunków obligacji w przyszłości ani miesięcznej granularności odsetek.
        Obliczenia oparte na warunkach z kwietnia 2026.
      </p>
    </div>
  );
}
