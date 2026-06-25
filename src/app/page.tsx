import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-tp-gold/30 rounded-full animate-pulse-soft" />
        <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-tp-info/40 rounded-full animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-tp-demand/20 rounded-full animate-pulse-soft" style={{ animationDelay: "1s" }} />
        <div className="absolute top-2/3 left-1/3 w-0.5 h-0.5 bg-tp-gold/20 rounded-full animate-float" style={{ animationDelay: "0.5s" }} />
      </div>

      <div className="text-center max-w-2xl relative z-10">
        {/* Logo */}
        <h1 className="font-display text-5xl md:text-6xl font-bold mb-3">
          <span className="text-tp-gold">Trader</span>
          <span className="text-tp-text">Path</span>
        </h1>
        <p className="text-tp-text-muted text-lg mb-2">
          El videojuego que te enseña a operar mercados financieros
        </p>
        <p className="text-tp-text-muted/60 text-sm mb-10 italic max-w-md mx-auto">
          &quot;Los mercados no te deben nada. Aprende primero, gana después.&quot;
          <span className="block mt-1 text-tp-gold-muted">— El Viejo Marco</span>
        </p>

        {/* CTAs */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/dashboard"
            className="px-7 py-3 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition shadow-gold"
          >
            Comenzar Aventura
          </Link>
          <Link
            href="/dashboard"
            className="px-7 py-3 border border-tp-gold/40 text-tp-gold font-display font-bold rounded-sm hover:bg-tp-gold/10 transition"
          >
            Continuar
          </Link>
        </div>
      </div>
    </main>
  );
}
