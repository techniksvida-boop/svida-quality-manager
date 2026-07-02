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
      .from("evaluation_codes")
      .select("id, employee_id, used")
      .eq("code", code)
      .single();

    if (!data) {
      setError("Neplatný kód.");
      setLoading(false);
      return;
    }

    if (data.used) {
      setError("Tento kód už bol použitý.");
      setLoading(false);
      return;
    }

    sessionStorage.setItem("evaluationCode", code);

    router.push(`/employee/${data.employee_id}`);
  }

  return (
    <main className="max-w-md mx-auto mt-24">
      <div className="rounded-xl border bg-white p-8 shadow">

        <h1 className="text-3xl font-bold mb-3">
          Anonymné hodnotenie
        </h1>

        <p className="text-gray-500 mb-8">
          Zadajte svoj 4-miestny kód.
        </p>

        <form onSubmit={verifyCode} className="space-y-5">

          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={4}
            className="w-full border rounded-lg p-4 text-center text-2xl tracking-widest"
            placeholder="1234"
          />

          {error && (
            <p className="text-red-600">{error}</p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 text-white py-3"
          >
            {loading ? "Overujem..." : "Pokračovať"}
          </button>

        </form>
      </div>
    </main>
  );
}