"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Credenciales inválidas. Verifica tu email y contraseña.");
      setLoading(false);
      return;
    }
    const requestedNext = new URLSearchParams(window.location.search).get("next");
    const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/dashboard";
    router.push(next);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold">
            <span className="text-tp-gold">Trader</span>Path
          </h1>
          <p className="text-tp-text-muted mt-2">Continúa tu aventura</p>
        </div>

        <div className="bg-tp-surface border border-tp-border rounded-md p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[10px] font-semibold text-tp-text-muted uppercase tracking-widest mb-1">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com"
                className="w-full px-4 py-3 bg-tp-base border border-tp-border rounded-sm text-tp-text placeholder:text-tp-text-muted/50 focus:outline-none focus:border-tp-gold transition" />
            </div>
            <div>
              <label htmlFor="password" className="block text-[10px] font-semibold text-tp-text-muted uppercase tracking-widest mb-1">Contraseña</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Tu contraseña"
                className="w-full px-4 py-3 bg-tp-base border border-tp-border rounded-sm text-tp-text placeholder:text-tp-text-muted/50 focus:outline-none focus:border-tp-gold transition" />
            </div>
            {error && (
              <div className="bg-tp-supply/10 border border-tp-supply/30 rounded-sm px-4 py-3 text-tp-supply text-sm">{error}</div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
          <p className="text-center text-tp-text-muted text-sm mt-4">
            ¿No tienes cuenta? <Link href="/register" className="text-tp-gold hover:underline">Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
