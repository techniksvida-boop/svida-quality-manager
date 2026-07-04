"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function StartPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { data } = await supabase
      .from("voting_codes")
      .select("id, code, is_active")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    setLoading(false);

    if (!data) {
      setError("Zadaný kód nie je platný.");
      return;
    }

    localStorage.setItem("voting_code_id", data.id);
    localStorage.setItem("voting_code", data.code);

    router.push("/hodnotenie");
  }

  return (
    <main className="min-h-screen flex items-center justify-center svida-page-bg p-6">
      <div className="w-full max-w-md rounded-2xl p-8 svida-card">
  <div className="mb-6 flex justify-center">
    <img
      src="/logo-svida.jpg"
      alt="Senior dom Svida"
      className="h-24 w-auto"
    />
  </div>

  <h1 className="text-3xl font-bold text-center">
    Anonymné hodnotenie
  </h1>

        <p className="mt-3 text-center text-gray-500">
          Zadajte svoj 4-miestny anonymný kód.
        </p>

        <form onSubmit={verifyCode} className="mt-8 space-y-5">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={4}
            className="w-full rounded-xl border p-4 text-center text-2xl tracking-[8px] uppercase"
            placeholder="AB12"
          />

          {error && (
            <p className="text-center text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 4}
            className="w-full rounded-xl py-4 font-semibold svida-btn"
          >
            {loading ? "Overujem..." : "Pokračovať"}
          </button>
        </form>
      </div>
    </main>
  );
}