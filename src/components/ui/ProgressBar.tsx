"use client";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const labels = ["Twoje cele", "Preferencje"];

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="pt-6">
      <div className="flex justify-between mb-2">
        {labels.map((label, i) => (
          <span
            key={label}
            className="text-sm font-medium"
            style={{
              color: i <= currentStep ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            Krok {i + 1}: {label}
          </span>
        ))}
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--border)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: "var(--accent)",
            transition: "width 400ms ease",
          }}
        />
      </div>
    </div>
  );
}
