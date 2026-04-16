"use client";

import { useState, useRef } from "react";
import { Goal } from "@/lib/bonds/types";
import {
  DEFAULT_AMOUNT,
  MAX_AMOUNT,
  MAX_GOALS,
  MAX_HORIZON,
  MIN_AMOUNT,
  MIN_HORIZON,
} from "@/lib/bonds/constants";
import { formatPLN, formatYears, generateId } from "@/lib/utils/format";

interface StepGoalsProps {
  initialGoals: Goal[];
  onComplete: (goals: Goal[]) => void;
}

const GOAL_PLACEHOLDERS = [
  "np. Mieszkanie dla córki",
  "np. Studia dziecka",
  "np. Poduszka bezpieczeństwa",
];

function createEmptyGoal(): Goal {
  return {
    id: generateId(),
    name: "",
    amount: DEFAULT_AMOUNT,
    horizonYears: 3,
  };
}

export default function StepGoals({ initialGoals, onComplete }: StepGoalsProps) {
  const [goals, setGoals] = useState<Goal[]>(
    initialGoals.length > 0 ? initialGoals : [createEmptyGoal()]
  );

  function updateGoal(id: string, updates: Partial<Goal>) {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  }

  function addGoal() {
    if (goals.length < MAX_GOALS) {
      setGoals((prev) => [...prev, createEmptyGoal()]);
    }
  }

  function removeGoal(id: string) {
    if (goals.length > 1) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
  }

  return (
    <div>
      <h2
        className="text-2xl sm:text-3xl font-bold mb-2"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}
      >
        Twoje cele oszczędnościowe
      </h2>
      <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
        Dodaj cele, na które odkładasz pieniądze. Pokażemy Ci, jak COI i EDO wypadają dla każdego z nich.
      </p>

      <div className="space-y-6">
        {goals.map((goal, index) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            index={index}
            canRemove={goals.length > 1}
            onUpdate={(updates) => updateGoal(goal.id, updates)}
            onRemove={() => removeGoal(goal.id)}
          />
        ))}
      </div>

      {goals.length < MAX_GOALS && (
        <button
          onClick={addGoal}
          className="mt-6 w-full py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-colors hover:border-solid cursor-pointer"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          + Dodaj kolejny cel
        </button>
      )}

      <button
        onClick={() => onComplete(goals)}
        className="mt-8 w-full py-4 rounded-xl text-white font-semibold text-lg transition-colors cursor-pointer"
        style={{ backgroundColor: "var(--accent)" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--accent-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--accent)")
        }
      >
        Dalej →
      </button>
    </div>
  );
}

function GoalCard({
  goal,
  index,
  canRemove,
  onUpdate,
  onRemove,
}: {
  goal: Goal;
  index: number;
  canRemove: boolean;
  onUpdate: (updates: Partial<Goal>) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="rounded-2xl p-6 relative"
      style={{
        backgroundColor: "var(--bg-card)",
        boxShadow: "var(--shadow)",
        border: "1px solid var(--border)",
      }}
    >
      {canRemove && (
        <button
          onClick={onRemove}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-lg transition-colors cursor-pointer"
          style={{ color: "var(--text-muted)" }}
          aria-label="Usuń cel"
        >
          ×
        </button>
      )}

      <div className="text-sm font-medium mb-4" style={{ color: "var(--accent)" }}>
        Cel {index + 1}
      </div>

      {/* Goal name */}
      <div className="mb-5">
        <label className="block text-sm mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Nazwa celu (opcjonalna)
        </label>
        <input
          type="text"
          value={goal.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder={GOAL_PLACEHOLDERS[index] || "np. Oszczędności"}
          className="w-full px-4 py-3 rounded-xl text-base outline-none transition-colors"
          style={{
            backgroundColor: "var(--bg-section)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Amount */}
      <AmountInput amount={goal.amount} onUpdate={onUpdate} />

      {/* Horizon */}
      <div>
        <label className="block text-sm mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Za ile lat będziesz potrzebować tych pieniędzy?
        </label>
        <div
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}
        >
          {formatYears(goal.horizonYears)}
        </div>
        <input
          type="range"
          min={MIN_HORIZON}
          max={MAX_HORIZON}
          step={1}
          value={goal.horizonYears}
          onChange={(e) => onUpdate({ horizonYears: Number(e.target.value) })}
          className="w-full accent-slider"
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          <span>{formatYears(MIN_HORIZON)}</span>
          <span>{formatYears(MAX_HORIZON)}</span>
        </div>
      </div>
    </div>
  );
}

// Rounds to nearest 100 and clamps to [MIN_AMOUNT, MAX_AMOUNT].
function snapToHundred(value: number): number {
  const rounded = Math.round(value / 100) * 100;
  return Math.min(MAX_AMOUNT, Math.max(MIN_AMOUNT, rounded));
}

function AmountInput({
  amount,
  onUpdate,
}: {
  amount: number;
  onUpdate: (updates: Partial<Goal>) => void;
}) {
  // Raw text shown while the user is typing (may be mid-edit, e.g. "75 ")
  const [rawText, setRawText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Display value: either the live raw text or the formatted canonical amount
  const displayValue = rawText !== null ? rawText : amount.toLocaleString("pl-PL");

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setRawText(raw);
    setError(null);

    // Strip whitespace and thousands separators (space / nbsp), parse
    const digits = raw.replace(/[\s\u00A0]/g, "").replace(/[^0-9]/g, "");
    if (digits === "") return; // allow clearing before retyping

    const parsed = parseInt(digits, 10);
    if (isNaN(parsed)) return;

    // Live-update the slider while typing (snapped, but no error yet)
    const snapped = snapToHundred(parsed);
    onUpdate({ amount: snapped });
  }

  function handleBlur() {
    const raw = rawText ?? "";
    const digits = raw.replace(/[\s\u00A0]/g, "").replace(/[^0-9]/g, "");
    const parsed = parseInt(digits, 10);

    if (!isNaN(parsed)) {
      const snapped = snapToHundred(parsed);
      onUpdate({ amount: snapped });

      // Check if we had to round to a multiple of 100
      if (parsed % 100 !== 0 && parsed >= MIN_AMOUNT && parsed <= MAX_AMOUNT) {
        setError(`Zaokrąglono do ${snapped.toLocaleString("pl-PL")} zł (1 obligacja = 100 zł)`);
      }
    }

    setRawText(null); // revert to formatted display
  }

  function handleFocus() {
    // Show plain number on focus so editing is easy
    setRawText(amount.toLocaleString("pl-PL"));
    setError(null);
  }

  return (
    <div className="mb-5">
      <label className="block text-sm mb-1.5" style={{ color: "var(--text-secondary)" }}>
        Kwota startowa
      </label>

      {/* Text input — primary entry point */}
      <div className="relative mb-3">
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        >
          zł
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full pl-10 pr-4 py-3 rounded-xl text-2xl font-bold outline-none transition-colors text-left"
          style={{
            backgroundColor: "var(--bg-section)",
            border: error ? "1.5px solid var(--scenario-moderate)" : "1px solid var(--border)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)",
          }}
          aria-label="Kwota startowa w złotych"
        />
      </div>

      {/* Error / rounding hint */}
      {error && (
        <p className="text-xs mb-2" style={{ color: "var(--scenario-moderate)" }}>
          ⚠ {error}
        </p>
      )}

      {/* Slider — secondary, for quick navigation */}
      <input
        type="range"
        min={MIN_AMOUNT}
        max={MAX_AMOUNT}
        step={100}
        value={amount}
        onChange={(e) => {
          setError(null);
          setRawText(null);
          onUpdate({ amount: Number(e.target.value) });
        }}
        className="w-full accent-slider"
        aria-label="Kwota startowa — suwak"
      />
      <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
        <span>{formatPLN(MIN_AMOUNT)}</span>
        <span>
          {amount.toLocaleString("pl-PL")} zł
          <span className="ml-1">
            = {Math.round(amount / 100).toLocaleString("pl-PL")} obligacji
          </span>
        </span>
        <span>{formatPLN(MAX_AMOUNT)}</span>
      </div>

      {/* Out-of-range warning */}
      {rawText !== null && (() => {
        const digits = rawText.replace(/[\s\u00A0]/g, "").replace(/[^0-9]/g, "");
        const v = parseInt(digits, 10);
        if (!isNaN(v) && v < MIN_AMOUNT) {
          return (
            <p className="text-xs mt-1.5" style={{ color: "var(--scenario-high)" }}>
              Minimalna kwota to {formatPLN(MIN_AMOUNT)} ({MIN_AMOUNT / 100} obligacji).
            </p>
          );
        }
        if (!isNaN(v) && v > MAX_AMOUNT) {
          return (
            <p className="text-xs mt-1.5" style={{ color: "var(--scenario-high)" }}>
              Maksymalna kwota w kalkulatorze to {formatPLN(MAX_AMOUNT)}.
            </p>
          );
        }
        return null;
      })()}
    </div>
  );
}
