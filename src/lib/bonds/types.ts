export type BondType = "COI" | "EDO";
export type ScenarioKey = "low" | "moderate" | "high";

export interface Goal {
  id: string;
  name: string;
  amount: number; // in PLN
  horizonYears: number;
}

export interface BondParams {
  name: string;
  maturityMonths: number;
  firstPeriodRate: number;
  indexation: "inflation";
  margin: number;
  interestPaymentFrequency: number; // 0 = capitalized, 12 = annual payout
  interestCapitalization: boolean;
  earlyRedemptionFee: number; // PLN per bond
  swapPrice: number;
  nominalValue: number;
  purchasePrice: number;
  indexationChangeEveryMonths: number;
}

export interface Scenario {
  name: string;
  label: string;
  description: string;
  inflation: number[]; // 12 years
  nbpRate: number[];
  depositRate: number[];
}

export interface YearlyResult {
  year: number;
  interestRate: number; // applied rate for this year
  interestGross: number;
  tax: number;
  interestNet: number;
  capitalAtEnd: number; // total value at end of year (including reinvested interest for COI)
  cumulativeInflation: number; // cumulative inflation multiplier
}

export interface BondCalculation {
  bondType: BondType;
  investedAmount: number;
  horizonYears: number;
  finalValueNet: number; // net of taxes and fees
  totalReturn: number; // finalValueNet - investedAmount
  totalReturnPercent: number;
  yearlyResults: YearlyResult[];
  earlyRedemption: boolean; // true if horizon < maturity
  earlyRedemptionFee: number;
}

export interface GoalResult {
  goal: Goal;
  coi: BondCalculation;
  edo: BondCalculation;
  deposit: DepositCalculation;
  betterOption: BondType;
  explanation: string;
}

export interface DepositCalculation {
  investedAmount: number;
  horizonYears: number;
  finalValueNet: number;
  totalReturn: number;
  totalReturnPercent: number;
  yearlyValues: number[]; // value at end of each year
}
