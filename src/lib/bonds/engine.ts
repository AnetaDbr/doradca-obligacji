import { BOND_PARAMS, TAX_RATE } from "./constants";
import {
  BondCalculation,
  BondType,
  DepositCalculation,
  Scenario,
  YearlyResult,
} from "./types";

/**
 * Calculate COI (4-year) bond returns.
 *
 * COI pays out interest annually. Paid-out interest is reinvested
 * in a deposit at the scenario's deposit rate. At maturity or early
 * redemption the investor receives the nominal value plus all
 * reinvested interest (net of taxes).
 */
export function calculateCOI(
  investedAmount: number,
  horizonYears: number,
  scenario: Scenario
): BondCalculation {
  const params = BOND_PARAMS.COI;
  const maturityYears = params.maturityMonths / 12;
  const earlyRedemption = horizonYears < maturityYears;

  const numberOfBonds = investedAmount / params.nominalValue;
  const nominal = params.nominalValue; // per bond

  const yearlyResults: YearlyResult[] = [];
  let cumulativeInflation = 1;
  // Track reinvested interest pool (net interest placed on deposit)
  let reinvestedPool = 0;

  const yearsToCalculate = Math.max(horizonYears, maturityYears);

  for (let year = 1; year <= yearsToCalculate; year++) {
    const inflationRate = (scenario.inflation[year - 1] ?? scenario.inflation[scenario.inflation.length - 1]) / 100;
    const depositRate = (scenario.depositRate[year - 1] ?? scenario.depositRate[scenario.depositRate.length - 1]) / 100;

    cumulativeInflation *= 1 + inflationRate;

    // Interest rate for this year
    const interestRate =
      year === 1 ? params.firstPeriodRate : inflationRate + params.margin;

    const interestGross = nominal * interestRate;
    const tax = interestGross * TAX_RATE;
    const interestNet = interestGross - tax;

    // Reinvested pool grows by deposit rate (net of Belka tax on deposit interest)
    reinvestedPool = reinvestedPool * (1 + depositRate * (1 - TAX_RATE));
    // Add this year's net interest to the pool
    reinvestedPool += interestNet;

    // Capital at end = nominal + reinvested pool (per bond)
    const capitalAtEnd = nominal + reinvestedPool;

    yearlyResults.push({
      year,
      interestRate,
      interestGross: interestGross * numberOfBonds,
      tax: tax * numberOfBonds,
      interestNet: interestNet * numberOfBonds,
      capitalAtEnd: capitalAtEnd * numberOfBonds,
      cumulativeInflation,
    });
  }

  // Calculate final value at the horizon
  const resultAtHorizon = yearlyResults[horizonYears - 1];
  let finalValueNet = resultAtHorizon.capitalAtEnd;

  // Early redemption fee
  let earlyRedemptionFeeTotal = 0;
  if (earlyRedemption) {
    earlyRedemptionFeeTotal = params.earlyRedemptionFee * numberOfBonds;
    finalValueNet -= earlyRedemptionFeeTotal;
  }

  const totalReturn = finalValueNet - investedAmount;
  const totalReturnPercent = (totalReturn / investedAmount) * 100;

  return {
    bondType: "COI",
    investedAmount,
    horizonYears,
    finalValueNet: Math.round(finalValueNet * 100) / 100,
    totalReturn: Math.round(totalReturn * 100) / 100,
    totalReturnPercent: Math.round(totalReturnPercent * 100) / 100,
    yearlyResults: yearlyResults.slice(0, Math.max(horizonYears + 2, 10)),
    earlyRedemption,
    earlyRedemptionFee: earlyRedemptionFeeTotal,
  };
}

/**
 * Calculate EDO (10-year) bond returns.
 *
 * EDO capitalizes interest — no payouts until redemption.
 * Belka tax is paid once, at redemption, on total accumulated gain.
 */
export function calculateEDO(
  investedAmount: number,
  horizonYears: number,
  scenario: Scenario
): BondCalculation {
  const params = BOND_PARAMS.EDO;
  const maturityYears = params.maturityMonths / 12;
  const earlyRedemption = horizonYears < maturityYears;

  const numberOfBonds = investedAmount / params.nominalValue;
  const nominal = params.nominalValue;

  const yearlyResults: YearlyResult[] = [];
  let capital = nominal; // grows each year via capitalization (per bond)
  let cumulativeInflation = 1;

  const yearsToCalculate = Math.max(horizonYears, maturityYears);

  for (let year = 1; year <= yearsToCalculate; year++) {
    const inflationRate = (scenario.inflation[year - 1] ?? scenario.inflation[scenario.inflation.length - 1]) / 100;

    cumulativeInflation *= 1 + inflationRate;

    const interestRate =
      year === 1 ? params.firstPeriodRate : inflationRate + params.margin;

    const interestGross = capital * interestRate;
    // No tax during the holding period — tax at redemption only
    capital += interestGross;

    yearlyResults.push({
      year,
      interestRate,
      interestGross: interestGross * numberOfBonds,
      tax: 0, // deferred
      interestNet: interestGross * numberOfBonds, // gross = net during holding
      capitalAtEnd: capital * numberOfBonds,
      cumulativeInflation,
    });
  }

  // At the horizon, calculate final value net of tax
  const capitalAtHorizon = yearlyResults[horizonYears - 1].capitalAtEnd;
  const totalGainBrutto = capitalAtHorizon - investedAmount;
  const totalTax = totalGainBrutto * TAX_RATE;

  let finalValueNet = capitalAtHorizon - totalTax;

  // Early redemption fee
  let earlyRedemptionFeeTotal = 0;
  if (earlyRedemption) {
    earlyRedemptionFeeTotal = params.earlyRedemptionFee * numberOfBonds;
    finalValueNet -= earlyRedemptionFeeTotal;
  }

  const totalReturn = finalValueNet - investedAmount;
  const totalReturnPercent = (totalReturn / investedAmount) * 100;

  // Update yearly results to show deferred tax impact for display
  const updatedYearlyResults = yearlyResults
    .slice(0, Math.max(horizonYears + 2, 10))
    .map((yr) => {
      const gainAtYear = yr.capitalAtEnd - investedAmount;
      const taxAtYear = gainAtYear > 0 ? gainAtYear * TAX_RATE : 0;
      return {
        ...yr,
        tax: taxAtYear,
        // capitalAtEnd remains gross (before tax) for chart display;
        // net value is computed at display time
      };
    });

  return {
    bondType: "EDO",
    investedAmount,
    horizonYears,
    finalValueNet: Math.round(finalValueNet * 100) / 100,
    totalReturn: Math.round(totalReturn * 100) / 100,
    totalReturnPercent: Math.round(totalReturnPercent * 100) / 100,
    yearlyResults: updatedYearlyResults,
    earlyRedemption,
    earlyRedemptionFee: earlyRedemptionFeeTotal,
  };
}

/**
 * Calculate deposit (bank savings) for comparison benchmark.
 */
export function calculateDeposit(
  investedAmount: number,
  horizonYears: number,
  scenario: Scenario
): DepositCalculation {
  let capital = investedAmount;
  const yearlyValues: number[] = [];

  for (let year = 1; year <= Math.max(horizonYears + 2, 10); year++) {
    const depositRate = (scenario.depositRate[year - 1] ?? scenario.depositRate[scenario.depositRate.length - 1]) / 100;
    const interestGross = capital * depositRate;
    const tax = interestGross * TAX_RATE;
    capital += interestGross - tax;
    yearlyValues.push(capital);
  }

  const finalValueNet = yearlyValues[horizonYears - 1];
  const totalReturn = finalValueNet - investedAmount;
  const totalReturnPercent = (totalReturn / investedAmount) * 100;

  return {
    investedAmount,
    horizonYears,
    finalValueNet: Math.round(finalValueNet * 100) / 100,
    totalReturn: Math.round(totalReturn * 100) / 100,
    totalReturnPercent: Math.round(totalReturnPercent * 100) / 100,
    yearlyValues,
  };
}

/**
 * Net value of EDO at a given year (after tax and potential early redemption fee).
 * Used for chart display.
 */
export function edoNetValueAtYear(
  yearlyResult: YearlyResult,
  investedAmount: number,
  earlyRedemption: boolean,
  numberOfBonds: number
): number {
  const gain = yearlyResult.capitalAtEnd - investedAmount;
  const tax = gain > 0 ? gain * TAX_RATE : 0;
  let net = yearlyResult.capitalAtEnd - tax;
  if (earlyRedemption) {
    net -= BOND_PARAMS.EDO.earlyRedemptionFee * numberOfBonds;
  }
  return net;
}

/**
 * Calculate all results for a given goal.
 */
export function calculateForGoal(
  goal: { amount: number; horizonYears: number },
  scenario: Scenario,
  preference: "safety" | "growth"
): { coi: BondCalculation; edo: BondCalculation; deposit: DepositCalculation; betterOption: BondType } {
  const coi = calculateCOI(goal.amount, goal.horizonYears, scenario);
  const edo = calculateEDO(goal.amount, goal.horizonYears, scenario);
  const deposit = calculateDeposit(goal.amount, goal.horizonYears, scenario);

  const betterOption = getBetterOption(goal.horizonYears, preference);

  return { coi, edo, deposit, betterOption };
}

function getBetterOption(
  horizonYears: number,
  preference: "safety" | "growth"
): BondType {
  if (horizonYears <= 3) return "COI";
  if (horizonYears >= 8) return "EDO";

  // Zone 4-7 years — depends on preference
  if (horizonYears <= 4) {
    return preference === "growth" ? "EDO" : "COI";
  }
  if (horizonYears <= 5) {
    return preference === "safety" ? "COI" : "EDO";
  }
  // 6-7 years
  return "EDO";
}
