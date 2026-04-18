import { BOND_PARAMS, TAX_RATE } from "./constants";
import { MAX_HORIZON } from "./constants";
import {
  ComparisonResult,
  Scenario,
  Winner,
  YearDataPoint,
} from "./types";
import { formatPLN, formatYears } from "../utils/format";

// Treat outcomes within 1% of invested as "too close to call"
const CLOSE_THRESHOLD_PCT = 1;

// ════════════════════════════════════════════════════════════════
// COI TIMELINE — with automatic rollover every 4 years
// ════════════════════════════════════════════════════════════════

/**
 * Model:
 * - COI is a 4-year bond. Interest paid out annually, reinvested on deposit.
 * - At year 4 (maturity): no early redemption fee. All capital (nominal +
 *   reinvested interest pool) rolls into a new COI at the swap price (99.90).
 * - Same rollover at year 8. Third cycle runs years 9–12.
 * - At non-maturity years: early redemption fee (0.70 zł/bond) deducted,
 *   capped at accumulated interest (cannot touch principal).
 */
function buildCOITimeline(
  investedAmount: number,
  maxYears: number,
  scenario: Scenario,
): { values: number[]; rates: number[]; fees: number[] } {
  const params = BOND_PARAMS.COI;
  const values: number[] = [];
  const rates: number[] = [];
  const fees: number[] = [];

  let numberOfBonds = Math.round(investedAmount / params.nominalValue);
  let reinvestedPool = 0; // net interest accumulated on deposit (after Belka each year)
  let cycleStartYear = 1;

  for (let year = 1; year <= maxYears; year++) {
    const cycleYear = year - cycleStartYear + 1; // 1–4 within each cycle
    const isFirstOfCycle = cycleYear === 1;
    const isMaturity = cycleYear === 4;

    const inflRate = getRate(scenario.inflation, year);
    const depRate = getRate(scenario.depositRate, year);

    // Interest rate for this year
    const rate = isFirstOfCycle ? params.firstPeriodRate : inflRate + params.margin;
    rates.push(rate);

    const interestGross = numberOfBonds * params.nominalValue * rate;
    const interestTax = interestGross * TAX_RATE;
    const interestNet = interestGross - interestTax;

    // Reinvested pool earns deposit rate (Belka paid annually on deposit)
    const poolGrowth = reinvestedPool * depRate * (1 - TAX_RATE);
    reinvestedPool += poolGrowth + interestNet;

    // Cash-out value if you exited at end of this year
    const grossValue = numberOfBonds * params.nominalValue + reinvestedPool;

    if (isMaturity) {
      // Maturity: no fee, full payout. Roll everything into the next cycle.
      fees.push(0);
      values.push(grossValue);

      numberOfBonds = Math.floor(grossValue / params.nominalValue); // swap into next emission (whole bonds only)
      reinvestedPool = 0;
      cycleStartYear = year + 1;
    } else {
      // Early exit: fee capped at accrued interest (cannot erode principal)
      const rawFee = params.earlyRedemptionFee * numberOfBonds;
      const fee = Math.min(rawFee, Math.max(0, grossValue - investedAmount));
      fees.push(fee);
      values.push(grossValue - fee);
    }
  }

  return { values, rates, fees };
}

// ════════════════════════════════════════════════════════════════
// EDO TIMELINE — capitalisation, single maturity at year 10
// ════════════════════════════════════════════════════════════════

/**
 * Model:
 * - EDO is a 10-year bond. Interest capitalised (added to principal each year).
 * - Belka tax (19%) paid ONCE at redemption on the total accumulated gain.
 * - At year 10: full payout, no early redemption fee.
 * - Years 11–12: post-maturity proceeds parked on deposit (Belka paid annually).
 * - Before maturity: early redemption fee (2.00 zł/bond) + Belka on gain to date.
 *   Fee capped at accrued interest (cannot erode principal).
 */
function buildEDOTimeline(
  investedAmount: number,
  maxYears: number,
  scenario: Scenario,
): { values: number[]; rates: number[]; fees: number[] } {
  const params = BOND_PARAMS.EDO;
  const values: number[] = [];
  const rates: number[] = [];
  const fees: number[] = [];

  const numberOfBonds = Math.round(investedAmount / params.nominalValue);
  let capitalPerBond = params.nominalValue; // grows through capitalisation
  let postMaturityCapital = 0;
  let matured = false;

  for (let year = 1; year <= maxYears; year++) {
    const inflRate = getRate(scenario.inflation, year);
    const depRate = getRate(scenario.depositRate, year);

    if (!matured) {
      const rate = year === 1 ? params.firstPeriodRate : inflRate + params.margin;
      rates.push(rate);
      capitalPerBond = capitalPerBond * (1 + rate); // capitalise

      const totalGross = capitalPerBond * numberOfBonds;
      const gain = totalGross - investedAmount;
      const tax = Math.max(0, gain * TAX_RATE);
      const afterTax = totalGross - tax;

      if (year === 10) {
        // Maturity: no fee
        fees.push(0);
        values.push(afterTax);
        postMaturityCapital = afterTax;
        matured = true;
      } else {
        // Early exit: fee capped at accrued interest
        const rawFee = params.earlyRedemptionFee * numberOfBonds;
        const fee = Math.min(rawFee, Math.max(0, afterTax - investedAmount));
        fees.push(fee);
        values.push(afterTax - fee);
      }
    } else {
      // Post-maturity: capital on deposit, Belka paid each year
      rates.push(depRate);
      fees.push(0);
      const depositGross = postMaturityCapital * depRate;
      const depositTax = depositGross * TAX_RATE;
      postMaturityCapital += depositGross - depositTax;
      values.push(postMaturityCapital); // always > previous value (depRate > 0)
    }
  }

  return { values, rates, fees };
}

// ════════════════════════════════════════════════════════════════
// DEPOSIT BASELINE
// ════════════════════════════════════════════════════════════════

function buildDepositTimeline(
  investedAmount: number,
  maxYears: number,
  scenario: Scenario,
): number[] {
  const values: number[] = [];
  let capital = investedAmount;
  for (let year = 1; year <= maxYears; year++) {
    const depRate = getRate(scenario.depositRate, year);
    capital += capital * depRate * (1 - TAX_RATE);
    values.push(capital);
  }
  return values;
}

// ════════════════════════════════════════════════════════════════
// INFLATION REFERENCE — nominal amount needed to maintain purchasing power
// This line ALWAYS increases; it never drops.
// ════════════════════════════════════════════════════════════════

function buildInflationTimeline(
  investedAmount: number,
  maxYears: number,
  scenario: Scenario,
): { values: number[]; cumulativeFactors: number[] } {
  const values: number[] = [];
  const cumulativeFactors: number[] = [];
  let cumulative = 1;
  for (let year = 1; year <= maxYears; year++) {
    const inflRate = getRate(scenario.inflation, year);
    cumulative *= 1 + inflRate; // strictly increasing: inflRate ≥ 0
    cumulativeFactors.push(cumulative);
    values.push(investedAmount * cumulative);
  }
  return { values, cumulativeFactors };
}

// ════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT — single source of truth for all UI
// ════════════════════════════════════════════════════════════════

export function calculateComparison(
  investedAmount: number,
  horizonYears: number,
  scenario: Scenario,
): ComparisonResult {
  const maxYears = MAX_HORIZON; // always compute full 12 years for the chart

  const coiData = buildCOITimeline(investedAmount, maxYears, scenario);
  const edoData = buildEDOTimeline(investedAmount, maxYears, scenario);
  const depositValues = buildDepositTimeline(investedAmount, maxYears, scenario);
  const inflationData = buildInflationTimeline(investedAmount, maxYears, scenario);

  // ── Unified 12-year data (powers the chart, year-by-year table, advanced mode) ──
  const yearlyData: YearDataPoint[] = Array.from({ length: maxYears }, (_, i) => ({
    year: i + 1,
    coiNet: round2(coiData.values[i]),
    edoNet: round2(edoData.values[i]),
    depositNet: round2(depositValues[i]),
    inflationRef: round2(inflationData.values[i]),   // always ≥ previous
    cumulativeInflation: inflationData.cumulativeFactors[i],
    coiCycleEnd: (i + 1) % 4 === 0,
    edoMaturity: i + 1 === 10,
    coiRate: coiData.rates[i],
    edoRate: edoData.rates[i],
  }));

  // ── Values at the user's horizon (h = array index = year - 1) ──
  const h = horizonYears - 1;
  const coiAtHorizon = round2(coiData.values[h]);
  const edoAtHorizon = round2(edoData.values[h]);
  const depositAtHorizon = round2(depositValues[h]);

  const coiReturn = round2(coiAtHorizon - investedAmount);
  const edoReturn = round2(edoAtHorizon - investedAmount);
  const depositReturn = round2(depositAtHorizon - investedAmount);

  const coiReturnPct = round2((coiReturn / investedAmount) * 100);
  const edoReturnPct = round2((edoReturn / investedAmount) * 100);
  const depositReturnPct = round2((depositReturn / investedAmount) * 100);

  // ── Winner: determined by actual numbers, not by heuristics ──
  const diff = coiAtHorizon - edoAtHorizon;
  const diffPct = Math.abs(diff / investedAmount) * 100;

  let winner: Winner;
  if (diffPct < CLOSE_THRESHOLD_PCT) {
    winner = "CLOSE";
  } else if (diff > 0) {
    winner = "COI";
  } else {
    winner = "EDO";
  }

  const advantage = round2(Math.abs(diff));
  const advantagePct = round2(diffPct);

  // ── Real value: winner's nominal adjusted for inflation ──
  const bestNominal =
    winner === "COI" ? coiAtHorizon
    : winner === "EDO" ? edoAtHorizon
    : Math.max(coiAtHorizon, edoAtHorizon);
  const realValueAtHorizon = round2(bestNominal / inflationData.cumulativeFactors[h]);

  // ── Early redemption flags and ACTUAL fees from the timeline ──
  // COI: no fee at years 4, 8, 12 (end of each 4-year cycle)
  const coiEarlyRedemption = coiData.fees[h] > 0;
  // EDO: no fee at year 10 (maturity) or post-maturity years
  const edoEarlyRedemption = edoData.fees[h] > 0;

  const coiEarlyRedemptionFee = round2(coiData.fees[h]);
  const edoEarlyRedemptionFee = round2(edoData.fees[h]);

  const explanation = generateExplanation(
    horizonYears, winner, advantage, coiAtHorizon, edoAtHorizon, investedAmount,
  );

  return {
    investedAmount,
    horizonYears,
    coiAtHorizon,
    edoAtHorizon,
    depositAtHorizon,
    realValueAtHorizon,
    coiReturn,
    edoReturn,
    depositReturn,
    coiReturnPct,
    edoReturnPct,
    depositReturnPct,
    winner,
    advantage,
    advantagePct,
    explanation,
    yearlyData,
    coiEarlyRedemption,
    coiEarlyRedemptionFee,
    edoEarlyRedemption,
    edoEarlyRedemptionFee,
  };
}

// ════════════════════════════════════════════════════════════════
// EXPLANATION — generated from actual numbers, scenario-aware
// ════════════════════════════════════════════════════════════════

function generateExplanation(
  horizonYears: number,
  winner: Winner,
  advantage: number,
  coiNet: number,
  edoNet: number,
  investedAmount: number,
): string {
  void coiNet; void edoNet; void investedAmount; // used indirectly via winner/advantage
  const adv = formatPLN(Math.round(advantage));
  const hor = formatYears(horizonYears);
  const prefix = `W tym scenariuszu inflacyjnym, przy horyzoncie ${hor},`;

  if (winner === "CLOSE") {
    if (horizonYears <= 4) {
      return `${prefix} obie opcje dają bardzo zbliżone wyniki (różnica do ${adv}). COI ma zapadalność bliską Twojemu celowi i niższą opłatę za wcześniejszy wykup. EDO ma wyższą marżę, ale przy krótkim horyzoncie nie zdąży jej w pełni wykorzystać. Wynik może się zmienić przy innym scenariuszu inflacyjnym — sprawdź suwak powyżej.`;
    }
    return `${prefix} obie opcje dają bardzo zbliżone wyniki (różnica do ${adv}). Przy tym horyzoncie przewagi i wady obu instrumentów niemal się równoważą. Porównaj szczegóły — wybór może zależeć od Twojej preferencji co do płynności i pewności dostępu do środków.`;
  }

  if (winner === "COI") {
    if (horizonYears <= 4) {
      return `${prefix} lepiej wypada COI — o ${adv}. Zapadalność COI (4 lata) jest bliska Twojemu celowi, więc unikasz wyższej opłaty za wcześniejszy wykup charakterystycznej dla EDO. Przy wyższej inflacji lub dłuższym horyzoncie EDO mogłoby wypaść lepiej — sprawdź inne scenariusze.`;
    }
    if (horizonYears <= 8) {
      return `${prefix} lepiej wypada COI — o ${adv}. Reinwestycja odsetek po każdym cyklu 4-letnim, przy obecnych stawkach lokat, okazuje się korzystniejsza niż kapitalizacja EDO. Pamiętaj: przy wyższej inflacji lub dłuższym horyzoncie wynik mógłby być inny.`;
    }
    return `${prefix} lepiej wypada COI — o ${adv}. Po trzech cyklach 4-letnich z reinwestycją odsetek COI akumuluje więcej niż EDO ze swoją kapitalizacją. To scenariusz rzadki — zwykle przy horyzontach >8 lat EDO wykazuje przewagę; warto sprawdzić inne założenia inflacyjne.`;
  }

  // EDO wins
  if (horizonYears <= 4) {
    return `${prefix} lepiej wypada EDO — o ${adv}. Wyższa marża nad inflacją (+2% zamiast +1,5%) i brak podatku Belki przez cały okres (dopiero przy wykupie) rekompensują wyższą opłatę za wcześniejszy wykup. Wynik jest wrażliwy na scenariusz — przy niższej inflacji COI mogłoby być lepszym wyborem.`;
  }
  if (horizonYears <= 10) {
    return `${prefix} lepiej wypada EDO — o ${adv}. Wyższa marża (+2% vs +1,5%) w połączeniu z kapitalizacją odsetek (procent składany bez corocznego Belki) daje rosnącą przewagę z każdym rokiem. Wynik może się różnić przy innych założeniach inflacyjnych.`;
  }
  return `${prefix} wyraźnie lepiej wypada EDO — o ${adv}. Pełna kapitalizacja przez 10 lat, wyższa marża, a po zapadalności dalszy wzrost na depozycie — przy długich horyzontach to zdecydowana przewaga EDO. Jest ona szczególnie widoczna, gdy inflacja utrzymuje się na umiarkowanym lub wysokim poziomie.`;
}

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════

function getRate(rates: readonly number[], year: number): number {
  const val = rates[year - 1] ?? rates[rates.length - 1];
  return val / 100;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
