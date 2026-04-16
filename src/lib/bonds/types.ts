export type BondType = "COI" | "EDO";
export type ScenarioKey = "low" | "moderate" | "high";
export type Winner = "COI" | "EDO" | "CLOSE";

export interface Goal {
  id: string;
  name: string;
  amount: number;
  horizonYears: number;
}

export interface BondParams {
  name: string;
  maturityMonths: number;
  firstPeriodRate: number;
  indexation: "inflation";
  margin: number;
  interestPaymentFrequency: number;
  interestCapitalization: boolean;
  earlyRedemptionFee: number;
  swapPrice: number;
  nominalValue: number;
  purchasePrice: number;
  indexationChangeEveryMonths: number;
}

export interface Scenario {
  name: string;
  label: string;
  description: string;
  inflation: number[];
  nbpRate: number[];
  depositRate: number[];
}

// ── Single source of truth for one year ──

export interface YearDataPoint {
  year: number;
  coiNet: number;          // net cash-out value of COI strategy at this year-end
  edoNet: number;          // net cash-out value of EDO strategy at this year-end
  depositNet: number;      // deposit value
  inflationRef: number;    // investedAmount * cumulative inflation (what you'd need to keep purchasing power)
  cumulativeInflation: number;
  coiCycleEnd: boolean;    // true at year 4, 8 (COI maturity / rollover point)
  edoMaturity: boolean;    // true at year 10
  coiRate: number;         // annual interest rate applied to COI that year (decimal)
  edoRate: number;         // annual interest rate applied to EDO that year (decimal)
}

// ── Single source of truth for a comparison ──

export interface ComparisonResult {
  investedAmount: number;
  horizonYears: number;

  // Values at the user's horizon (THE numbers everything reads from)
  coiAtHorizon: number;
  edoAtHorizon: number;
  depositAtHorizon: number;
  realValueAtHorizon: number; // best instrument value adjusted for inflation

  coiReturn: number;
  edoReturn: number;
  depositReturn: number;

  coiReturnPct: number;
  edoReturnPct: number;
  depositReturnPct: number;

  // Winner determination (based on actual numbers)
  winner: Winner;
  advantage: number;       // |COI - EDO| in PLN
  advantagePct: number;    // as % of invested

  // Pre-generated explanation (consistent with numbers)
  explanation: string;

  // Full timeline for chart + table (years 0..12, all same length)
  yearlyData: YearDataPoint[];

  // Per-instrument metadata for cards
  coiEarlyRedemption: boolean;
  coiEarlyRedemptionFee: number;
  edoEarlyRedemption: boolean;
  edoEarlyRedemptionFee: number;
}
