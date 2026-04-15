import { BondType } from "../bonds/types";

export function getExplanation(
  horizonYears: number,
  betterOption: BondType | null
): string {
  if (horizonYears <= 3) {
    return `Przy horyzoncie ${horizonYears} lat COI wypada korzystniej. Zapadalność COI (4 lata) jest bliska Twojemu celowi, więc unikasz opłaty za wcześniejszy wykup. EDO potrzebuje więcej czasu, żeby rozwinąć swoją przewagę.`;
  }
  if (horizonYears >= 4 && horizonYears <= 5) {
    return `Przy horyzoncie ${horizonYears} lat obie opcje dają zbliżone wyniki. COI jest prostsza i bez opłaty za wcześniejszy wykup. EDO może dać nieco lepszy wynik dzięki wyższej marży i kapitalizacji, ale zamrażasz pieniądze na dłużej. Porównaj liczby powyżej i zdecyduj, co lepiej pasuje do Twojej sytuacji.`;
  }
  if (horizonYears <= 7) {
    return `Przy horyzoncie ${horizonYears} lat EDO zaczyna wygrywać. Wyższa marża nad inflacją (+2% zamiast +1,5%) i kapitalizacja odsetek robią różnicę \u2014 nawet po opłacie za wcześniejszy wykup.`;
  }
  // 8+
  return `Przy tak długim horyzoncie EDO wyraźnie wygrywa. Kapitalizacja odsetek + wyższa marża oznaczają, że z roku na rok przewaga EDO rośnie.`;
}
