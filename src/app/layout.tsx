import type { Metadata } from "next";
import { DM_Serif_Display, Source_Sans_3, DM_Mono } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Obligacje COI czy EDO — sprawdź, co lepiej pasuje do Twoich celów | Marcin Iwuć",
  description:
    "Porównaj obligacje 4-letnie COI z 10-letnimi EDO dla Twojego horyzontu oszczędzania. Bezpłatne narzędzie oparte na aktualnych warunkach (kwiecień 2026). Zobacz różnice w trzech scenariuszach inflacyjnych.",
  openGraph: {
    title: "Obligacje COI czy EDO? Porównaj dla swojego celu",
    description: "Bezpłatne narzędzie od Marcina Iwucia. Sprawdź, co lepiej pasuje do Twoich celów oszczędnościowych.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${dmSerif.variable} ${sourceSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
