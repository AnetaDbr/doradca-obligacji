import { Scenario, ScenarioKey } from "./types";

export const SCENARIOS: Record<ScenarioKey, Scenario> = {
  low: {
    name: "Spokojna inflacja",
    label: "🟢",
    description: "Inflacja wraca do celu NBP",
    inflation: [2.1, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5],
    nbpRate: [3.75, 3.0, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5],
    depositRate: [3.6, 3.0, 2.5, 2.5, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0],
  },
  moderate: {
    name: "Umiarkowana inflacja",
    label: "🟡",
    description: "Inflacja utrzymuje się powyżej celu",
    inflation: [2.1, 3.5, 4.0, 4.0, 3.5, 3.5, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0],
    nbpRate: [3.75, 4.0, 4.5, 4.5, 4.0, 4.0, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5],
    depositRate: [3.6, 4.0, 4.0, 4.0, 3.5, 3.5, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0],
  },
  high: {
    name: "Uporczywa inflacja",
    label: "🔴",
    description: "Inflacja pozostaje podwyższona",
    inflation: [2.1, 5.0, 6.0, 6.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
    nbpRate: [3.75, 5.0, 6.0, 6.0, 5.5, 5.5, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
    depositRate: [3.6, 5.0, 5.5, 5.5, 5.0, 5.0, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5],
  },
} as const;
