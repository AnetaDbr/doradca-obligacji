# COI vs EDO — porównywarka obligacji skarbowych

**Demo:** https://doradca-obligacji.vercel.app/

Interaktywne narzędzie porównujące polskie obligacje skarbowe indeksowane inflacją — COI (4-letnie) i EDO (10-letnie) — z perspektywy konkretnego celu oszczędnościowego. Zbudowane jako webowy odpowiednik kalkulatora Marcina Iwucia w Excelu.

## Co robi

- Użytkownik wpisuje 1–3 cele oszczędnościowe (kwota + horyzont czasowy)
- Aplikacja liczy wynik netto COI i EDO dla każdego celu w trzech scenariuszach inflacyjnych
- Interaktywny wykres pokazuje wzrost rok po roku dla obu instrumentów, benchmarku lokaty i skumulowanej inflacji
- Suwak "co jeśli wypłacę w innym momencie?" przelicza wszystko na żywo
- Tryb zaawansowany pozwala zmienić szczegółowe założenia (inflacja rok po roku, oprocentowanie lokaty) dla użytkowników, którzy chcą zweryfikować liczby

## Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Recharts** do wykresów
- **Tailwind CSS v4**
- Deployment na **Vercel**

## Decyzje architektoniczne

**Obliczenia wyłącznie po stronie klienta** — cała matematyka obligacji żyje w `src/lib/bonds/engine.ts` i działa w przeglądarce. Brak backendu; narzędzie jest bezstanowe, szybkie i trywialne do wdrożenia.

**Jeden silnik, jedno źródło prawdy** — `calculateComparison()` zwraca wszystko: wartości do kart, dane do wykresu, tabelę rok po roku i kontekstowe wyjaśnienie. Nic nie jest liczone dwa razy; UI tylko odczytuje wynik.

**COI modelowane z automatycznym rolowaniem** — po 4 (i 8) latach COI zapada, a całe środki wchodzą w nowy cykl po cenie zamiany (99,90 zł). To wierne odwzorowanie modelu z Excela Marcina, a nie uproszczenie do jednorazowego 4-letniego instrumentu.

**EDO śledzone po zapadalności** — po roku 10. wypłata EDO trafia na lokatę, więc wykres pozostaje dokładny dla horyzontów 11–12 lat bez wizualnego urwania.

**Opłata za wcześniejszy wykup ograniczona do narosłych odsetek** — opłata (0,70 zł/szt. dla COI, 2,00 zł/szt. dla EDO) nie może przekroczyć narosłych odsetek, co odpowiada rzeczywistym warunkom produktu.

**Usunięty krok z preferencjami** — specyfikacja zakładała krok "spokój vs. lepszy wynik", który miał wpływać na rekomendację. W praktyce lepsza opcja wynika bezpośrednio z liczb dla danego horyzontu — dodanie subiektywnej warstwy preferencji sprawiało, że narzędzie było mniej wiarygodne. Usunięte.

## Co zrobiłabym dalej

- Testy jednostkowe dla `engine.ts` — weryfikacja, że wyniki COI i EDO zgadzają się z Excelem Marcina dla znanych danych wejściowych
- `CALCULATION_METHODOLOGY.md` — pełen opis algorytmu z przykładami liczbowymi, dla użytkowników chcących skontrolować matematykę
- Lepsze oznaczenie rolowania COI na wykresie (obecnie tylko delikatne przerywane markery w latach 4 i 8)
- OG image do udostępniania w mediach społecznościowych
- Audyt dostępności — nawigacja klawiaturą i etykiety dla czytników ekranu

## Uruchomienie lokalnie

```bash
npm install
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).
