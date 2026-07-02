"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function HodnoteniePage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [used, setUsed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const votingCodeId = localStorage.getItem("voting_code_id");

      if (!votingCodeId) {
        window.location.href = "/start";
        return;
      }

      const { data: employeesData } = await supabase
        .from("employees")
        .select("id, first_name, last_name, positions(name)")
        .eq("is_active", true)
        .order("last_name");

      const { data: usageData } = await supabase
        .from("voting_code_usage")
        .select("evaluated_employee_id")
        .eq("voting_code_id", votingCodeId);

      setEmployees(employeesData || []);
      setUsed((usageData || []).map((item: any) => item.evaluated_employee_id));
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return <main className="p-8">Načítavam...</main>;
  }

  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-4xl font-bold">Anonymné hodnotenie</h1>
      <p className="mt-2 text-gray-500">
        Vyberte pracovníka sociálneho úseku, ktorého chcete hodnotiť.
      </p>

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        {employees.map((employee) => {
          const done = used.includes(employee.id);

          return (
            <div key={employee.id} className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">
                {employee.first_name} {employee.last_name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {employee.positions?.name}
              </p>

              {done ? (
                <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-green-700">
                  ✓ Už ohodnotené
                </div>
              ) : (
                <Link
                  href={`/employee/${employee.id}`}
                  className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
                >
                  Ohodnotiť
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}