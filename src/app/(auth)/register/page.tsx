"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres"); setLoading(false); return; }
    if (username.length < 3) { setError("El nombre de usuario debe tener al menos 3 caracteres"); setLoading(false); return; }

    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { username } } });

    if (authError) {
      setError(authError.message.includes("already registered") ? "Este email ya está registrado" : authError.message);
      setLoading(false); return;
    }
    if (!authData.user) { setError("Error al crear la cuenta."); setLoading(false); return; }

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold">
            <span className="text-tp-gold">Trader</span>Path
          </h1>
          <p className="text-tp-text-muted mt-2">Crea tu cuenta y comienza tu viaje</p>
        </div>

        <div className="bg-tp-surface border border-tp-border rounded-md p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[10px] font-semibold text-tp-text-muted uppercase tracking-widest mb-1">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com"
                className="w-full px-4 py-3 bg-tp-base border border-tp-border rounded-sm text-tp-text placeholder:text-tp-text-muted/50 focus:outline-none focus:border-tp-gold transition" />
            </div>
            <div>
              <label htmlFor="username" className="block text-[10px] font-semibold text-tp-text-muted uppercase tracking-widest mb-1">Nombre de usuario</label>
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} placeholder="TuNombreDeTrader"
                className="w-full px-4 py-3 bg-tp-base border border-tp-border rounded-sm text-tp-text placeholder:text-tp-text-muted/50 focus:outline-none focus:border-tp-gold transition" />
            </div>
            <div>
              <label htmlFor="password" className="block text-[10px] font-semibold text-tp-text-muted uppercase tracking-widest mb-1">Contraseña</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="Mínimo 8 caracteres"
                className="w-full px-4 py-3 bg-tp-base border border-tp-border rounded-sm text-tp-text placeholder:text-tp-text-muted/50 focus:outline-none focus:border-tp-gold transition" />
            </div>
            {error && (
              <div className="bg-tp-supply/10 border border-tp-supply/30 rounded-sm px-4 py-3 text-tp-supply text-sm">{error}</div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
          <p className="text-center text-tp-text-muted text-sm mt-4">
            ¿Ya tienes cuenta? <Link href="/login" className="text-tp-gold hover:underline">Inicia sesión</Link>
          </p>
        </div>
        <p className="text-center text-tp-text-muted/50 text-xs mt-6 italic">&quot;Aprende primero, gana después.&quot; — El Viejo Marco</p>
      </div>
    </main>
  );
}
