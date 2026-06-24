import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-tp-accent-green/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-tp-accent-blue/5 blur-[100px]" />
      </div>

      <div className="text-center max-w-2xl relative z-10">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            <span className="text-tp-accent-green">Trader</span>
            <span className="text-tp-text-primary">Path</span>
          </h1>
          <div className="mt-3 h-1 w-24 mx-auto bg-gradient-to-r from-tp-accent-green to-tp-accent-blue rounded-full" />
        </div>

        {/* Tagline */}
        <p className="text-tp-text-secondary text-xl mb-3">
          Aprende trading financiero jugando
        </p>
        <p className="text-tp-text-secondary/70 text-sm mb-10 italic max-w-md mx-auto">
          &quot;Los mercados no te deben nada. Aprende primero, gana después.&quot;
          <br />
          <span className="text-tp-accent-gold/80">— El Viejo Marco</span>
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-10 text-center">
          <div className="bg-tp-bg-secondary/50 border border-tp-border/50 rounded-xl p-4">
            <div className="text-2xl mb-1">📈</div>
            <p className="text-xs text-tp-text-secondary">7 Niveles</p>
          </div>
          <div className="bg-tp-bg-secondary/50 border border-tp-border/50 rounded-xl p-4">
            <div className="text-2xl mb-1">🎮</div>
            <p className="text-xs text-tp-text-secondary">Mini-juegos</p>
          </div>
          <div className="bg-tp-bg-secondary/50 border border-tp-border/50 rounded-xl p-4">
            <div className="text-2xl mb-1">💰</div>
            <p className="text-xs text-tp-text-secondary">Capital Virtual</p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="inline-block px-8 py-4 bg-tp-accent-green text-black font-bold text-lg rounded-xl hover:brightness-110 hover:scale-105 transition-all shadow-lg shadow-tp-accent-green/20"
        >
          Comenzar Aventura →
        </Link>

        <p className="text-tp-text-secondary/40 text-xs mt-8">
          Registro disponible próximamente
        </p>
      </div>
    </main>
  );
}
