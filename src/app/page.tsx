"use client";

import { useState } from "react";
import AdvisorApp from "@/components/advisor/AdvisorApp";

export default function Home() {
  const [started, setStarted] = useState(false);

  if (started) {
    return <AdvisorApp />;
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="max-w-2xl text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.webp"
          alt="Marcin Iwuć"
          className="h-10 sm:h-12 mx-auto mb-10"
        />

        <h1
          className="text-3xl sm:text-5xl font-bold mb-6 leading-tight"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}
        >
          Obligacje COI czy EDO?
        </h1>
        <p
          className="text-lg sm:text-xl mb-10 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Sprawdź, co lepiej pasuje do Twoich celów.
        </p>

        <button
          onClick={() => setStarted(true)}
          className="px-8 py-4 rounded-xl text-white font-semibold text-lg transition-colors cursor-pointer"
          style={{ backgroundColor: "var(--accent)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--accent-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--accent)")
          }
        >
          Porównaj COI i EDO
        </button>

        <p className="mt-6 text-sm" style={{ color: "var(--text-muted)" }}>
          Bezpłatne narzędzie od Marcina Iwucia · Obliczenia oparte na aktualnych warunkach obligacji (kwiecień 2026)
        </p>
      </div>
    </div>
  );
}
