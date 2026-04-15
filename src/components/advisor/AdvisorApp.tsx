"use client";

import { useState } from "react";
import { Goal, ScenarioKey } from "@/lib/bonds/types";
import StepGoals from "./StepGoals";
import ResultScreen from "./ResultScreen";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

type Step = "goals" | "results";

export default function AdvisorApp() {
  const [step, setStep] = useState<Step>("goals");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [scenario, setScenario] = useState<ScenarioKey>("moderate");

  function handleGoalsComplete(newGoals: Goal[]) {
    setGoals(newGoals);
    setStep("results");
  }

  function handleBack() {
    setStep("goals");
  }

  function handleRestart() {
    setStep("goals");
    setGoals([]);
    setScenario("moderate");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <div className="mt-6">
          {step === "goals" && (
            <StepGoals
              initialGoals={goals}
              onComplete={handleGoalsComplete}
            />
          )}

          {step === "results" && (
            <ResultScreen
              goals={goals}
              scenario={scenario}
              onScenarioChange={setScenario}
              onBack={handleBack}
              onRestart={handleRestart}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
