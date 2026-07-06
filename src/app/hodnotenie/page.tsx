"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function HodnoteniePage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [used, setUsed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const votingCodeId = localStorage.getItem("voting_code_id");

      if (!votingCodeId) {
        window.location.href = "/start";
        return;
      }

      const { data: employeesData } = await supabase
        .from("employees")
        .select(`
          id,
          first_name,
          last_name,
          positions(name),
          departments(id,name)
        `)
        .eq("is_active", true)
        .order("last_name");

      const { data: usageData } = await supabase
        .from("voting_code_usage")
        .select("evaluated_employee_id")
        .eq("voting_code_id", votingCodeId);

      setEmployees(employeesData || []);
      setUsed((usageData || []).map((x: any) => x.evaluated_employee_id));
      setLoading(false);
    }

    loadData();
  }, []);

  const departments = useMemo(() => {
    const map = new Map();

    employees.forEach((employee) => {
      const dep = employee.departments;

      if (dep && !map.has(dep.id)) {
        map.set(dep.id, dep);
      }
    });

    return Array.from(map.values()).sort((a: any, b: any) =>
      a.name.localeCompare(b.name, "sk")
    );
  }, [employees]);

  const filteredEmployees = employees.filter(
    (e) => e.departments?.id === selectedDepartment
  );

  if (loading) {
    return <main className="p-8">Načítavam...</main>;
  }

  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="mb-8 flex justify-center">
        <img
          src="/logo-svida.jpg"
          alt="Senior dom Svida"
          className="h-24 w-auto"
        />
      </div>

      <h1 className="text-4xl font-bold">
        Ročné anonymné hodnotenie zamestnancov
      </h1>

      <p className="mt-2 text-gray-500">
        Najprv vyberte úsek, následne pracovníka, ktorého chcete hodnotiť.
      </p>

      {!selectedDepartment ? (
        <>
          <h2 className="mt-10 mb-5 text-2xl font-semibold">
            Vyberte úsek
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            {departments.map((department: any) => (
              <button
                key={department.id}
                onClick={() => setSelectedDepartment(department.id)}
                className="rounded-2xl border bg-white p-8 text-left shadow-sm hover:border-blue-500 hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold">
                  {department.name}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Kliknite pre zobrazenie zamestnancov.
                </p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => setSelectedDepartment(null)}
            className="mb-6 rounded-lg border px-4 py-2"
          >
            ← Späť na výber úsekov
          </button>

          <div className="grid md:grid-cols-2 gap-5">
            {filteredEmployees.map((employee) => {
              const done = used.includes(employee.id);

              return (
                <div
                  key={employee.id}
                  className="rounded-2xl border bg-white p-6 shadow-sm"
                >
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
        </>
      )}
    </main>
  );
}