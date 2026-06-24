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
  const [showRegistered, setShowRegistered] = useState(false);
  const router = useRouter();

  // Check if redirected from registration
  useState(() => {
    if (typeof window !== "undefined" && window.location.search.includes("registered=true")) {
      setShowRegistered(true);
    }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Credenciales inválidas. Verifica tu email y contraseña.");
      setLoading(false);
      return;
    }

    // Éxito — redirigir al dashboard
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-tp-accent-green">Trader</span>Path
          </h1>
          <p className="text-tp-text-secondary mt-2">
            Continúa tu aventura
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-tp-bg-secondary border border-tp-border rounded-xl p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-tp-text-secondary mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full px-4 py-3 bg-tp-bg-primary border border-tp-border rounded-lg text-tp-text-primary placeholder:text-tp-text-secondary/50 focus:outline-none focus:border-tp-accent-green transition"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-tp-text-secondary mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Tu contraseña"
                className="w-full px-4 py-3 bg-tp-bg-primary border border-tp-border rounded-lg text-tp-text-primary placeholder:text-tp-text-secondary/50 focus:outline-none focus:border-tp-accent-green transition"
              />
            </div>

            {/* Success message from registration */}
            {showRegistered && (
              <div className="bg-tp-accent-green/10 border border-tp-accent-green/30 rounded-lg px-4 py-3 text-tp-accent-green text-sm">
                ✅ Cuenta creada. Revisa tu email para confirmar, luego inicia sesión aquí.
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-tp-accent-red/10 border border-tp-accent-red/30 rounded-lg px-4 py-3 text-tp-accent-red text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-tp-accent-green text-black font-semibold rounded-lg hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          {/* Link to register */}
          <p className="text-center text-tp-text-secondary text-sm mt-4">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="text-tp-accent-green hover:underline"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>

        {/* ARIA quote */}
        <p className="text-center text-tp-text-secondary/60 text-xs mt-6 italic">
          &quot;El mejor trader no es el que más gana, sino el que mejor gestiona lo que tiene.&quot;
        </p>
      </div>
    </main>
  );
}
