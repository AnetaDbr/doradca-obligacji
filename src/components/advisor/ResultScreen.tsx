"use client";

import { useMemo, useState } from "react";
import { Goal, ScenarioKey, Scenario, ComparisonResult, Winner, BondType, YearDataPoint } from "@/lib/bonds/types";
import { SCENARIOS } from "@/lib/bonds/scenarios";
import { calculateComparison } from "@/lib/bonds/engine";
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
        comparison: calculateComparison(goal.amount, goal.horizonYears, activeScenario),
      })),
    [goals, activeScenario],
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
          yearlyData={results[0].comparison.yearlyData}
        />
      )}

      {/* Results for each goal */}
      {results.map(({ goal, comparison }, idx) => (
        <GoalResultSection
          key={goal.id}
          goal={goal}
          goalIndex={idx}
          totalGoals={results.length}
          comparison={comparison}
          activeScenario={activeScenario}
        />
      ))}

      {/* Summary for multiple goals */}
      {results.length > 1 && (
        <SummaryTable results={results.map((r) => ({ goal: r.goal, winner: r.comparison.winner }))} />
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
  comparison,
  activeScenario,
}: {
  goal: Goal;
  goalIndex: number;
  totalGoals: number;
  comparison: ComparisonResult;
  activeScenario: Scenario;
}) {
  const [sliderHorizon, setSliderHorizon] = useState(goal.horizonYears);
  const [tableOpen, setTableOpen] = useState(false);

  const sliderComparison = useMemo(() => {
    if (sliderHorizon === goal.horizonYears) return comparison;
    return calculateComparison(goal.amount, sliderHorizon, activeScenario);
  }, [sliderHorizon, goal.horizonYears, goal.amount, comparison, activeScenario]);

  const winner: Winner = sliderComparison.winner;
  // For hero display: pick the better bond; if tied, pick the one with higher nominal value
  const bestLabel: BondType =
    winner === "CLOSE"
      ? sliderComparison.coiAtHorizon >= sliderComparison.edoAtHorizon ? "COI" : "EDO"
      : winner;

  const bestReturn =
    bestLabel === "COI" ? sliderComparison.coiReturn : sliderComparison.edoReturn;
  const bestReturnPct =
    bestLabel === "COI" ? sliderComparison.coiReturnPct : sliderComparison.edoReturnPct;

  const goalLabel = goal.name || `Cel ${goalIndex + 1}`;

  return (
    <div
      className="mb-10 pb-10"
      style={{ borderBottom: goalIndex < totalGoals - 1 ? "3px solid var(--border)" : "none" }}
    >
      {/* Goal header */}
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
            +{formatPLN(bestReturn)}
          </div>
          <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            z {bestLabel} ({formatPercent(bestReturnPct)})
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
            {formatPLN(Math.round(sliderComparison.realValueAtHorizon))}
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
          horizonYears={sliderHorizon}
          isBetter={winner === "COI"}
          finalValueNet={sliderComparison.coiAtHorizon}
          totalReturn={sliderComparison.coiReturn}
          totalReturnPercent={sliderComparison.coiReturnPct}
          earlyRedemption={sliderComparison.coiEarlyRedemption}
          earlyRedemptionFee={sliderComparison.coiEarlyRedemptionFee}
          investedAmount={goal.amount}
        />
        <BondCard
          type="EDO"
          horizonYears={sliderHorizon}
          isBetter={winner === "EDO"}
          finalValueNet={sliderComparison.edoAtHorizon}
          totalReturn={sliderComparison.edoReturn}
          totalReturnPercent={sliderComparison.edoReturnPct}
          earlyRedemption={sliderComparison.edoEarlyRedemption}
          earlyRedemptionFee={sliderComparison.edoEarlyRedemptionFee}
          investedAmount={goal.amount}
        />
      </div>

      {/* Explanation */}
      <div
        className="p-4 rounded-xl mb-6"
        style={{ backgroundColor: "var(--accent-light)" }}
      >
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
          💡 {sliderComparison.explanation}
        </p>
      </div>

      {/* Chart — base comparison data (all 12 years), slider moves only the reference line */}
      <div className="mb-6">
        <h3
          className="text-base font-bold mb-4"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}
        >
          Jak rosną Twoje pieniądze rok po roku
        </h3>
        <ComparisonChart
          yearlyData={comparison.yearlyData}
          horizonYears={sliderHorizon}
          investedAmount={goal.amount}
        />
        <p className="text-sm mt-3 italic" style={{ color: "var(--text-secondary)" }}>
          EDO rośnie wolniej na początku, ale po 4–5 roku zaczyna przyspieszać — to efekt kapitalizacji odsetek. Czerwona przerywana linia = ile Twoje pieniądze muszą być warte, żeby nie stracić siły nabywczej.
        </p>
      </div>

      {/* Education blocks */}
      <EducationBlocks horizonYears={sliderHorizon} />

      {/* Benchmark — deposit comparison */}
      <BenchmarkSection
        depositAtHorizon={sliderComparison.depositAtHorizon}
        depositReturn={sliderComparison.depositReturn}
        coiAtHorizon={sliderComparison.coiAtHorizon}
        edoAtHorizon={sliderComparison.edoAtHorizon}
        winner={winner}
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
        <YearByYearTable yearlyData={comparison.yearlyData} />
      )}
    </div>
  );
}

function BenchmarkSection({
  depositAtHorizon,
  depositReturn,
  coiAtHorizon,
  edoAtHorizon,
  winner,
  horizonYears,
}: {
  depositAtHorizon: number;
  depositReturn: number;
  coiAtHorizon: number;
  edoAtHorizon: number;
  winner: Winner;
  horizonYears: number;
}) {
  // Show comparison to deposit only for the better (or tied-best) bond
  const bestBondValue = winner === "COI" ? coiAtHorizon
    : winner === "EDO" ? edoAtHorizon
    : Math.max(coiAtHorizon, edoAtHorizon);
  const bestLabel: BondType = winner === "CLOSE"
    ? (coiAtHorizon >= edoAtHorizon ? "COI" : "EDO")
    : winner;
  const advantage = bestBondValue - depositAtHorizon;

  return (
    <div
      className="p-4 rounded-xl mb-6 flex flex-col sm:flex-row sm:items-center gap-3"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex-1">
        <div className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
          Alternatywa: lokata bankowa
        </div>
        <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Lokata po {formatYears(horizonYears)}:{" "}
          <strong style={{ fontFamily: "var(--font-mono)" }}>{formatPLN(depositAtHorizon)}</strong>
          <span className="ml-2" style={{ color: "var(--text-muted)" }}>
            (zysk netto: {formatPLN(depositReturn)})
          </span>
        </div>
      </div>
      {advantage > 0 && (
        <div
          className="text-sm font-semibold px-3 py-2 rounded-lg text-center shrink-0"
          style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}
        >
          {bestLabel} daje <strong>{formatPLN(Math.round(advantage))}</strong> więcej niż lokata
        </div>
      )}
      {advantage <= 0 && (
        <div
          className="text-sm px-3 py-2 rounded-lg text-center shrink-0"
          style={{ backgroundColor: "var(--bg-section)", color: "var(--text-muted)" }}
        >
          W tym scenariuszu lokata wypada podobnie
        </div>
      )}
    </div>
  );
}

function YearByYearTable({ yearlyData }: { yearlyData: YearDataPoint[] }) {
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
          {yearlyData.map((d) => (
            <tr key={d.year} style={{ borderBottom: "1px solid var(--border)" }}>
              <td className="py-1.5 px-2" style={{ color: "var(--text-primary)" }}>{d.year}</td>
              <td className="py-1.5 px-2 text-right" style={{ color: "var(--coi-color)" }}>
                {formatPLN(d.coiNet)}
              </td>
              <td className="py-1.5 px-2 text-right" style={{ color: "var(--edo-color)" }}>
                {formatPLN(d.edoNet)}
              </td>
              <td className="py-1.5 px-2 text-right" style={{ color: "var(--text-secondary)" }}>
                {formatPLN(d.depositNet)}
              </td>
              <td className="py-1.5 px-2 text-right" style={{ color: "var(--text-muted)" }}>
                {formatPercent((d.cumulativeInflation - 1) * 100)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EducationBlocks({ horizonYears }: { horizonYears: number }) {
  const earlyExitNote =
    horizonYears <= 4
      ? "COI ma zapadalność 4 lat — przy zbliżonym horyzoncie opłata za wcześniejszy wykup (0,70 zł/szt.) jest niewielka. Przy EDO (2,00 zł/szt.) wyższa opłata bardziej obciąża wynik."
      : "Jeśli potrzebujesz pieniędzy przed terminem, zapłacisz opłatę: COI — 0,70 zł, EDO — 2,00 zł za każdą obligację (nominał 100 zł). Opłata nigdy nie przekroczy narosłych odsetek.";

  return (
    <div className="space-y-3 mb-6">
      <div
        className="p-4 rounded-xl"
        style={{ backgroundColor: "var(--bg-section)", border: "1px solid var(--border)" }}
      >
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          📘 Dlaczego COI i EDO dają różne wyniki?
        </p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          COI wypłaca odsetki co rok na konto — możesz je reinwestować, ale Belka jest pobierana od razu.
          EDO doliczaje odsetki do kapitału — w następnym roku odsetki naliczają się od większej kwoty
          (procent składany), a Belka jest płacona dopiero przy wykupie. Przy długich horyzontach ta różnica
          robi coraz większą różnicę.
        </p>
      </div>
      <div
        className="p-4 rounded-xl"
        style={{ backgroundColor: "var(--bg-section)", border: "1px solid var(--border)" }}
      >
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          📘 Co to jest indeksacja inflacją?
        </p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Od 2. roku oprocentowanie obu obligacji zależy od bieżącej inflacji: COI = inflacja + 1,5%,
          EDO = inflacja + 2,0%. Gdy inflacja rośnie, rośnie też Twój kupon — obligacje indeksowane
          chronią oszczędności przed utratą siły nabywczej. Dlatego wyniki zmieniają się wraz ze scenariuszem
          inflacyjnym — sprawdź przełącznik powyżej.
        </p>
      </div>
      <div
        className="p-4 rounded-xl"
        style={{ backgroundColor: "var(--bg-section)", border: "1px solid var(--border)" }}
      >
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          📘 Co jeśli będę potrzebować pieniędzy wcześniej?
        </p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {earlyExitNote}
        </p>
      </div>
    </div>
  );
}

function SummaryTable({
  results,
}: {
  results: { goal: Goal; winner: Winner }[];
}) {
  const winnerLabel = (winner: Winner): string => {
    if (winner === "CLOSE") return "Zbliżone";
    return winner;
  };

  const winnerColor = (winner: Winner): string => {
    if (winner === "COI") return "var(--coi-color)";
    if (winner === "EDO") return "var(--edo-color)";
    return "var(--text-secondary)";
  };

  const winnerReason = (winner: Winner): string => {
    if (winner === "COI") return "Większa płynność";
    if (winner === "EDO") return "Lepsza ochrona długoterminowa";
    return "";
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
        Masz {results.length} cele o różnych horyzontach. Każda pula pieniędzy może pracować
        w instrumencie dopasowanym do Twojego terminu.
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
            {results.map(({ goal, winner }) => (
              <tr key={goal.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="py-2 pr-3 font-medium" style={{ color: "var(--text-primary)" }}>
                  {goal.name || "Cel"}
                </td>
                <td
                  className="py-2 px-3 text-right"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}
                >
                  {formatPLN(goal.amount)}
                </td>
                <td className="py-2 px-3 text-right" style={{ color: "var(--text-primary)" }}>
                  {formatYears(goal.horizonYears)}
                </td>
                <td
                  className="py-2 pl-3 text-right font-bold"
                  style={{ color: winnerColor(winner) }}
                >
                  {winnerLabel(winner)}
                  {winner !== "CLOSE" && (
                    <span className="font-normal text-xs ml-1" style={{ color: "var(--text-muted)" }}>
                      ({winnerReason(winner)})
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
        <strong>COI (4-letnie):</strong> 1. rok = 4,75%. Od 2. roku = inflacja + 1,50%.
        Odsetki wypłacane co rok, reinwestowane na lokacie wg bieżącej stawki. Podatek Belki
        (19%) pobierany od odsetek co rok. Po 4 latach kapitał automatycznie rolowany do kolejnej
        emisji COI po cenie zamiany (99,90 zł). Model pokazuje do 3 cykli 4-letnich (12 lat łącznie).
      </p>
      <p>
        <strong>EDO (10-letnie):</strong> 1. rok = 5,35%. Od 2. roku = inflacja + 2,00%.
        Odsetki kapitalizowane co rok (doliczane do kapitału — brak corocznego Belki). Podatek
        Belki (19%) pobierany jednorazowo przy wykupie od całego zysku. Po zapadalności (rok 10.)
        środki przechodzą na lokatę — model śledzi je przez lata 11.–12.
      </p>
      <p>
        <strong>Wcześniejszy wykup:</strong> COI: 0,70 zł za obligację. EDO: 2,00 zł za obligację
        (nominał = 100 zł). Opłata nie może przekroczyć narosłych odsetek — kapitał startowy jest
        zawsze chroniony.
      </p>
      <p>
        <strong>Benchmark inflacyjny na wykresie:</strong> Linia &quot;Minimalna wartość przy danej inflacji&quot;
        pokazuje, ile musiałyby wynosić Twoje oszczędności, żeby ich siła nabywcza nie zmalała.
        Jest zawsze rosnąca (inflacja ≥ 0). Jeśli linia obligacji jest powyżej niej — zysk realny
        jest dodatni.
      </p>
      <p>
        <strong>Ograniczenia:</strong> Model zakłada stałe warunki emisji przez cały horyzont, roczną
        granularność odsetek i reinwestycję odsetek COI na lokacie (bez prowizji). Obliczenia oparte
        na warunkach z kwietnia 2026. Rzeczywiste wyniki zależą od przyszłej inflacji.
      </p>
    </div>
  );
}
