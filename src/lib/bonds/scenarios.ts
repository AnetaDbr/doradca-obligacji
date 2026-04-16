import { Scenario, ScenarioKey } from "./types";

// All arrays: 12 values for years 1–12 (in %).
// NBP reference rate as of April 2026: 3.75%.
// Deposit rate year 1: 3.6% (market average).
// NBP and deposit rates are derived from the inflation path assumption.

export const SCENARIOS: Record<ScenarioKey, Scenario> = {
  low: {
    name: "Optymistyczny",
    label: "🟢",
    description: "Inflacja wraca do celu NBP 2,5%",
    // "NBP opanowuje sytuację, inflacja szybko schodzi"
    //            rok: 1     2     3     4     5     6     7     8     9    10    11    12
    inflation:       [4.5,  3.5,  2.5,  2.5,  2.5,  2.5,  2.5,  2.5,  2.5,  2.5,  2.5,  2.5],
    nbpRate:         [3.75, 3.25, 2.75, 2.75, 2.75, 2.75, 2.75, 2.75, 2.75, 2.75, 2.75, 2.75],
    depositRate:     [3.60, 3.00, 2.50, 2.50, 2.25, 2.25, 2.25, 2.25, 2.25, 2.25, 2.25, 2.25],
  },
  moderate: {
    name: "Umiarkowany",
    label: "🟡",
    description: "Inflacja lepka — powyżej celu przez lata",
    // "Inflacja pozostaje z nami na dłużej na podwyższonym poziomie"
    //            rok: 1     2     3     4     5     6     7     8     9    10    11    12
    inflation:       [5.0,  5.0,  4.5,  4.0,  3.5,  3.5,  3.5,  3.5,  3.5,  3.5,  3.5,  3.5],
    nbpRate:         [3.75, 4.00, 4.00, 3.75, 3.50, 3.25, 3.25, 3.25, 3.25, 3.25, 3.25, 3.25],
    depositRate:     [3.60, 3.80, 3.80, 3.50, 3.25, 3.00, 3.00, 3.00, 3.00, 3.00, 3.00, 3.00],
  },
  high: {
    name: "Pesymistyczny",
    label: "🔴",
    description: "Druga fala — inflacja wymyka się spod kontroli",
    // "Ceny surowców znów rosną, inflacja wymyka się spod kontroli"
    //            rok: 1     2     3     4     5     6     7     8     9    10    11    12
    inflation:       [6.0,  8.0, 10.0,  9.0,  7.0,  6.0,  6.0,  6.0,  6.0,  6.0,  6.0,  6.0],
    nbpRate:         [3.75, 5.50, 7.00, 7.00, 6.50, 6.00, 5.50, 5.50, 5.50, 5.50, 5.50, 5.50],
    depositRate:     [3.60, 5.20, 6.50, 6.50, 6.00, 5.50, 5.00, 5.00, 5.00, 5.00, 5.00, 5.00],
  },
} as const;
