"use client";

import { useState } from "react";
import { Goal, Preference, ScenarioKey } from "@/lib/bonds/types";
import StepGoals from "./StepGoals";
import StepPreferences from "./StepPreferences";
import ResultScreen from "./ResultScreen";
import ProgressBar from "../ui/ProgressBar";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

type Step = "goals" | "preferences" | "results";

export default function AdvisorApp() {
  const [step, setStep] = useState<Step>("goals");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [preference, setPreference] = useState<Preference>("safety");
  const [scenario, setScenario] = useState<ScenarioKey>("moderate");

  const stepIndex = step === "goals" ? 0 : step === "preferences" ? 1 : 2;

  function handleGoalsComplete(newGoals: Goal[]) {
    setGoals(newGoals);
    setStep("preferences");
  }

  function handlePreferencesComplete(pref: Preference) {
    setPreference(pref);
    setStep("results");
  }

  function handleBack() {
    if (step === "preferences") setStep("goals");
    if (step === "results") setStep("preferences");
  }

  function handleRestart() {
    setStep("goals");
    setGoals([]);
    setPreference("safety");
    setScenario("moderate");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        {step !== "results" && (
          <ProgressBar currentStep={stepIndex} totalSteps={2} />
        )}

        <div className="mt-6">
          {step === "goals" && (
            <StepGoals
              initialGoals={goals}
              onComplete={handleGoalsComplete}
            />
          )}

          {step === "preferences" && (
            <StepPreferences
              onComplete={handlePreferencesComplete}
              onBack={handleBack}
              selectedPreference={preference}
            />
          )}

          {step === "results" && (
            <ResultScreen
              goals={goals}
              preference={preference}
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
