import { BondParams } from "./types";

export const BOND_PARAMS: Record<"COI" | "EDO", BondParams> = {
  COI: {
    name: "COI (4-letnie)",
    maturityMonths: 48,
    firstPeriodRate: 0.0475, // 4.75% for 1st interest period
    indexation: "inflation",
    margin: 0.015, // +1.50% above inflation (from year 2)
    interestPaymentFrequency: 12, // annual payout
    interestCapitalization: false, // interest PAID OUT, not capitalized
    earlyRedemptionFee: 0.7, // 0.70 PLN per bond (COI)
    swapPrice: 99.9,
    nominalValue: 100,
    purchasePrice: 99.9,
    indexationChangeEveryMonths: 12,
  },
  EDO: {
    name: "EDO (10-letnie)",
    maturityMonths: 120,
    firstPeriodRate: 0.0535, // 5.35% for 1st period
    indexation: "inflation",
    margin: 0.02, // +2.00% above inflation (from year 2)
    interestPaymentFrequency: 0, // no payout — capitalized
    interestCapitalization: true,
    earlyRedemptionFee: 2.0, // 2.00 PLN per bond
    swapPrice: 99.9,
    nominalValue: 100,
    purchasePrice: 99.9,
    indexationChangeEveryMonths: 12,
  },
} as const;

export const TAX_RATE = 0.19; // Belka tax — 19%
export const DEFAULT_DEPOSIT_RATE = 0.036; // 3.6% average deposit rate
export const MIN_AMOUNT = 1_000;
export const MAX_AMOUNT = 500_000;
export const DEFAULT_AMOUNT = 100_000;
export const MIN_HORIZON = 1;
export const MAX_HORIZON = 12;
export const MAX_GOALS = 3;
