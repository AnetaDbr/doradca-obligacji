import Image from "next/image";

export default function Header() {
  return (
    <header
      className="w-full py-4 px-4 sm:px-6"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <a href="https://marciniwuc.com" target="_blank" rel="noopener noreferrer">
          <Image
            src="/logo.webp"
            alt="Marcin Iwuć — Finanse Bardzo Osobiste"
            width={180}
            height={40}
            className="h-8 sm:h-10 w-auto"
            priority
          />
        </a>
      </div>
    </header>
  );
}
