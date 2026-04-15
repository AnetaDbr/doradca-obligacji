"use client";

import { ScenarioKey } from "@/lib/bonds/types";
import { SCENARIOS } from "@/lib/bonds/scenarios";

interface ScenarioToggleProps {
  value: ScenarioKey;
  onChange: (scenario: ScenarioKey) => void;
}

const keys: ScenarioKey[] = ["low", "moderate", "high"];
const colors: Record<ScenarioKey, string> = {
  low: "var(--scenario-low)",
  moderate: "var(--scenario-moderate)",
  high: "var(--scenario-high)",
};

export default function ScenarioToggle({ value, onChange }: ScenarioToggleProps) {
  return (
    <div className="inline-flex gap-1.5">
      {keys.map((key) => {
        const scenario = SCENARIOS[key];
        const isActive = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
            style={{
              backgroundColor: isActive ? colors[key] : "var(--bg-card)",
              color: isActive ? "white" : "var(--text-secondary)",
              border: isActive ? "none" : "1px solid var(--border)",
            }}
            title={scenario.description}
          >
            {scenario.label} {scenario.name}
          </button>
        );
      })}
    </div>
  );
}
