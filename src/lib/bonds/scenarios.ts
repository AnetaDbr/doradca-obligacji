import { Scenario, ScenarioKey } from "./types";

export const SCENARIOS: Record<ScenarioKey, Scenario> = {
  low: {
    name: "Optymistyczny",
    label: "🟢",
    description: "Inflacja 2,5% — cel NBP",
    inflation: [2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5],
    nbpRate: [3.75, 3.0, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5],
    depositRate: [3.6, 3.0, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5],
  },
  moderate: {
    name: "Umiarkowany",
    label: "🟡",
    description: "Inflacja 5% — średnia",
    inflation: [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
    nbpRate: [3.75, 4.5, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
    depositRate: [3.6, 4.5, 5.0, 5.0, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5],
  },
  high: {
    name: "Pesymistyczny",
    label: "🔴",
    description: "Inflacja 10% — wysoka",
    inflation: [10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0],
    nbpRate: [3.75, 6.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0],
    depositRate: [3.6, 6.0, 8.0, 8.0, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5],
  },
} as const;
