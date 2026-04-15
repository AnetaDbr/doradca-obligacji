"use client";

import { useMemo, useState } from "react";
import { Goal, Preference, ScenarioKey, Scenario, BondCalculation, DepositCalculation } from "@/lib/bonds/types";
import { SCENARIOS } from "@/lib/bonds/scenarios";
import { calculateForGoal } from "@/lib/bonds/engine";
import { getExplanation } from "@/lib/utils/recommendations";
import { formatPLN, formatYears } from "@/lib/utils/format";
import ScenarioToggle from "../ui/ScenarioToggle";
import BondCard from "../ui/BondCard";
import ComparisonChart from "../ui/Chart";
import AdvancedMode from "./AdvancedMode";

interface ResultScreenProps {
  goals: Goal[];
  preference: Preference;
  scenario: ScenarioKey;
  onScenarioChange: (s: ScenarioKey) => void;
  onBack: () => void;
  onRestart: () => void;
}

export default function ResultScreen({
  goals,
  preference,
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
        ...calculateForGoal(goal, activeScenario, preference),
      })),
    [goals, activeScenario, preference]
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

      {/* Results for each goal */}
      {results.map(({ goal, coi, edo, deposit, betterOption }, idx) => (
        <GoalResultSection
          key={goal.id}
          goal={goal}
          coi={coi}
          edo={edo}
          deposit={deposit}
          betterOption={betterOption}
          scenario={scenario}
          onScenarioChange={onScenarioChange}
          preference={preference}
          showScenarioToggle={idx === 0}
          advancedOpen={advancedOpen}
          setAdvancedOpen={setAdvancedOpen}
          customInflation={customInflation}
          setCustomInflation={setCustomInflation}
          customDepositRate={customDepositRate}
          setCustomDepositRate={setCustomDepositRate}
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
            href="https://marciniwuc.com"
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
  coi,
  edo,
  deposit,
  betterOption,
  scenario,
  onScenarioChange,
  preference,
  showScenarioToggle,
  advancedOpen,
  setAdvancedOpen,
  customInflation,
  setCustomInflation,
  customDepositRate,
  setCustomDepositRate,
  activeScenario,
}: {
  goal: Goal;
  coi: BondCalculation;
  edo: BondCalculation;
  deposit: DepositCalculation;
  betterOption: "COI" | "EDO";
  scenario: ScenarioKey;
  onScenarioChange: (s: ScenarioKey) => void;
  preference: Preference;
  showScenarioToggle: boolean;
  advancedOpen: boolean;
  setAdvancedOpen: (v: boolean) => void;
  customInflation: number[] | null;
  setCustomInflation: (v: number[] | null) => void;
  customDepositRate: number[] | null;
  setCustomDepositRate: (v: number[] | null) => void;
  activeScenario: Scenario;
}) {
  const [sliderHorizon, setSliderHorizon] = useState(goal.horizonYears);

  // Recalculate with slider horizon
  const sliderResults = useMemo(() => {
    if (sliderHorizon === goal.horizonYears) return { coi, edo };
    return calculateForGoal(
      { amount: goal.amount, horizonYears: sliderHorizon },
      activeScenario,
      preference
    );
  }, [sliderHorizon, goal, coi, edo, activeScenario, preference]);

  const explanation = getExplanation(sliderHorizon, betterOption);
  const goalLabel = goal.name || `Cel ${goal.id.slice(0, 4)}`;

  return (
    <div className="mb-12">
      {/* Goal header */}
      <div
        className="text-lg font-bold mb-4 pb-3"
        style={{
          color: "var(--text-primary)",
          fontFamily: "var(--font-heading)",
          borderBottom: "2px solid var(--border)",
        }}
      >
        {goalLabel} · {formatPLN(goal.amount)} · za {formatYears(goal.horizonYears)}
      </div>

      {/* Scenario toggle */}
      {showScenarioToggle && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
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
            {advancedOpen ? "Ukryj założenia" : "Chcę zmienić założenia inflacji →"}
          </button>
        </div>
      )}

      {/* Advanced mode */}
      {showScenarioToggle && advancedOpen && (
        <AdvancedMode
          scenario={activeScenario}
          onInflationChange={setCustomInflation}
          onDepositRateChange={setCustomDepositRate}
          coi={coi}
          edo={edo}
        />
      )}

      {/* Bond cards side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <BondCard
          type="COI"
          result={sliderResults.coi}
          horizonYears={sliderHorizon}
          isBetter={betterOption === "COI"}
        />
        <BondCard
          type="EDO"
          result={sliderResults.edo}
          horizonYears={sliderHorizon}
          isBetter={betterOption === "EDO"}
        />
      </div>

      {/* Deposit comparison */}
      <div
        className="text-sm text-center mb-4 py-2"
        style={{ color: "var(--text-muted)" }}
      >
        Dla porównania: lokata bankowa dałaby ok. {formatPLN(deposit.finalValueNet)}
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

      {/* Interactive slider */}
      <div
        className="p-5 rounded-xl mb-8"
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

      {/* Education blocks */}
      <EducationBlocks />
    </div>
  );
}

function EducationBlocks() {
  return (
    <div className="space-y-4">
      <h3
        className="text-base font-bold"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}
      >
        Co warto wiedzieć
      </h3>
      <EduCard
        title="Dlaczego COI i EDO dają różne wyniki?"
        text="COI wypłaca odsetki co rok — dostajesz je na konto i musisz je gdzieś ulokować (np. na lokacie). EDO nie wypłaca odsetek — dodaje je do kapitału, więc w następnym roku odsetki naliczane są od większej kwoty. To się nazywa kapitalizacja i przy dłuższym czasie robi dużą różnicę."
      />
      <EduCard
        title="Co to jest indeksacja inflacją?"
        text='Od 2. roku oprocentowanie obu obligacji zależy od inflacji. Im wyższa inflacja, tym wyższe oprocentowanie. Dlatego obligacje indeksowane chronią Twoje pieniądze — automatycznie "doganiają" wzrost cen.'
      />
      <EduCard
        title="Co jeśli będę potrzebować pieniędzy wcześniej?"
        text="Możesz wypłacić pieniądze przed terminem, ale zapłacisz opłatę (2 zł za każde 100 zł nominału). Przy COI to mniej bolesne, bo obligacja i tak trwa 4 lata. Przy EDO — wcześniejszy wykup oznacza, że nie wykorzystujesz pełnego potencjału kapitalizacji."
      />
    </div>
  );
}

function EduCard({ title, text }: { title: string; text: string }) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <h4 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        📘 {title}
      </h4>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {text}
      </p>
    </div>
  );
}

function SummaryTable({
  results,
}: {
  results: { goal: Goal; betterOption: "COI" | "EDO" }[];
}) {
  const reasons: Record<string, string> = {
    COI: "Bliski horyzontu zapadalności",
    EDO: "Kapitalizacja daje przewagę",
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
                  color: betterOption === "COI" ? "var(--coi-color)" : "var(--edo-color)",
                }}>
                  {betterOption}
                  <span className="font-normal text-xs ml-1" style={{ color: "var(--text-muted)" }}>
                    ({reasons[betterOption]})
                  </span>
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
        <strong>Wcześniejszy wykup:</strong> Opłata 2 zł za każdą obligację (nominał 100 zł).
        Dotyczy obu typów przy wykupie przed zapadalnością.
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
