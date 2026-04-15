import { BondType, Preference } from "../bonds/types";

export function getBetterOption(
  horizonYears: number,
  preference: Preference
): BondType {
  if (horizonYears <= 3) return "COI";
  if (horizonYears >= 8) return "EDO";

  if (horizonYears <= 4) {
    return preference === "growth" ? "EDO" : "COI";
  }
  if (horizonYears <= 5) {
    return preference === "safety" ? "COI" : "EDO";
  }
  // 6-7 years
  return "EDO";
}

export function getExplanation(
  horizonYears: number,
  betterOption: BondType
): string {
  if (horizonYears <= 3) {
    return `Przy horyzoncie ${horizonYears} lat COI wypada korzystniej. Zapadalność COI (4 lata) jest bliska Twojemu celowi, więc unikasz opłaty za wcześniejszy wykup. EDO potrzebuje więcej czasu, żeby rozwinąć swoją przewagę.`;
  }
  if (horizonYears === 4) {
    if (betterOption === "COI") {
      return "Przy 4 latach obie opcje są zbliżone. COI jest prostsza i bez opłaty za wcześniejszy wykup. EDO może dać nieco lepszy wynik, ale zamrażasz pieniądze na dłużej.";
    }
    return "Przy 4 latach obie opcje są zbliżone. EDO może dać nieco lepszy wynik dzięki wyższej marży i kapitalizacji, ale COI jest prostsza i bez opłaty za wcześniejszy wykup.";
  }
  if (horizonYears <= 7) {
    return `Przy horyzoncie ${horizonYears} lat EDO zaczyna wygrywać. Wyższa marża nad inflacją (+2% zamiast +1,5%) i kapitalizacja odsetek robią różnicę \u2014 nawet po opłacie za wcześniejszy wykup.`;
  }
  // 8+
  return `Przy tak długim horyzoncie EDO wyraźnie wygrywa. Kapitalizacja odsetek + wyższa marża oznaczają, że z roku na rok przewaga EDO rośnie.`;
}
