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

    // Client-side validation
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres");
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("El nombre de usuario solo puede contener letras, números y guiones bajos");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Create account in Supabase Auth
    // The DB trigger handle_new_user() auto-creates profiles + player_progress
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        setError("Este email ya está registrado. ¿Quieres iniciar sesión?");
      } else {
        setError(authError.message || "Error al crear la cuenta. Intenta de nuevo.");
      }
      setLoading(false);
      return;
    }

    // If email confirmation is required but user was created, auto-login
    if (authData?.user && !authData.session) {
      // Try signing in immediately (works if email confirm is disabled)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Email confirmation is required — redirect to login with message
        router.push("/login?registered=true");
        return;
      }
    }

    // Success — redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold">
              <span className="text-tp-accent-green">Trader</span>Path
            </h1>
          </Link>
          <p className="text-tp-text-secondary mt-2">
            Crea tu cuenta y comienza tu viaje
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-tp-bg-secondary border border-tp-border rounded-xl p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-tp-text-secondary mb-1"
              >
                Nombre de usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                placeholder="TuNombreDeTrader"
                className="w-full px-4 py-3 bg-tp-bg-primary border border-tp-border rounded-lg text-tp-text-primary placeholder:text-tp-text-secondary/50 focus:outline-none focus:border-tp-accent-green transition"
              />
            </div>

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
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                className="w-full px-4 py-3 bg-tp-bg-primary border border-tp-border rounded-lg text-tp-text-primary placeholder:text-tp-text-secondary/50 focus:outline-none focus:border-tp-accent-green transition"
              />
              <p className="text-tp-text-secondary/50 text-xs mt-1">
                Mínimo 8 caracteres
              </p>
            </div>

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
              {loading ? "Creando cuenta..." : "Crear cuenta y comenzar"}
            </button>
          </form>

          {/* Link to login */}
          <p className="text-center text-tp-text-secondary text-sm mt-4">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-tp-accent-green hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>

        {/* Quote */}
        <p className="text-center text-tp-text-secondary/60 text-xs mt-6 italic">
          &quot;Aprende primero, gana después.&quot; — El Viejo Marco
        </p>
      </div>
    </main>
  );
}
