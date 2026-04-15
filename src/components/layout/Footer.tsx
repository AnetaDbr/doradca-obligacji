export default function Footer() {
  return (
    <footer
      className="w-full py-6 px-4 sm:px-6 mt-auto"
      style={{
        borderTop: "1px solid var(--border)",
        backgroundColor: "var(--bg-section)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
          To narzędzie ma charakter wyłącznie edukacyjny i informacyjny. Nie stanowi
          rekomendacji inwestycyjnej ani doradztwa finansowego w rozumieniu przepisów prawa.
          Przed podjęciem decyzji inwestycyjnej skonsultuj się z licencjonowanym doradcą.
          Obliczenia oparte na warunkach obligacji z kwietnia 2026. Rzeczywiste wyniki mogą
          się różnić od prezentowanych symulacji. Narzędzie przygotowane we współpracy z{" "}
          <a
            href="https://marciniwuc.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent)" }}
          >
            marciniwuc.com
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
