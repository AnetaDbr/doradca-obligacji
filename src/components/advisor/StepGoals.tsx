"use client";

import { useState } from "react";
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
          placeholder="np. Mieszkanie dla córki"
          className="w-full px-4 py-3 rounded-xl text-base outline-none transition-colors"
          style={{
            backgroundColor: "var(--bg-section)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Amount */}
      <div className="mb-5">
        <label className="block text-sm mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Kwota
        </label>
        <div
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}
        >
          {formatPLN(goal.amount)}
        </div>
        <input
          type="range"
          min={MIN_AMOUNT}
          max={MAX_AMOUNT}
          step={10000}
          value={goal.amount}
          onChange={(e) => onUpdate({ amount: Number(e.target.value) })}
          className="w-full accent-slider"
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          <span>{formatPLN(MIN_AMOUNT)}</span>
          <span>{formatPLN(MAX_AMOUNT)}</span>
        </div>
      </div>

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
