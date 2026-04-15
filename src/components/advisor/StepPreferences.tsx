"use client";

import { Preference } from "@/lib/bonds/types";

interface StepPreferencesProps {
  onComplete: (preference: Preference) => void;
  onBack: () => void;
  selectedPreference: Preference;
}

export default function StepPreferences({
  onComplete,
  onBack,
  selectedPreference,
}: StepPreferencesProps) {
  return (
    <div>
      <h2
        className="text-2xl sm:text-3xl font-bold mb-2"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}
      >
        Co jest dla Ciebie ważniejsze?
      </h2>
      <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
        To pomoże nam dostosować porównanie do Twoich potrzeb.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PreferenceCard
          icon="🛡️"
          title="Spokój i prostota"
          description="Wolę rozwiązanie, które jest prostsze i łatwiej je zrozumieć, nawet jeśli zarobię trochę mniej."
          selected={selectedPreference === "safety"}
          onClick={() => onComplete("safety")}
        />
        <PreferenceCard
          icon="📈"
          title="Lepszy wynik"
          description="Chcę zmaksymalizować zysk, nawet jeśli to oznacza dłuższe zamrożenie pieniędzy lub trochę więcej komplikacji."
          selected={selectedPreference === "growth"}
          onClick={() => onComplete("growth")}
        />
      </div>

      <button
        onClick={onBack}
        className="mt-6 text-sm font-medium cursor-pointer"
        style={{ color: "var(--text-secondary)" }}
      >
        ← Wróć do celów
      </button>
    </div>
  );
}

function PreferenceCard({
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left p-6 rounded-2xl transition-all cursor-pointer"
      style={{
        backgroundColor: selected ? "var(--accent-light)" : "var(--bg-card)",
        border: selected
          ? "2px solid var(--accent)"
          : "2px solid var(--border)",
        boxShadow: selected ? "none" : "var(--shadow)",
        transform: selected ? "scale(1.02)" : "scale(1)",
      }}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3
        className="text-lg font-bold mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {description}
      </p>
    </button>
  );
}
