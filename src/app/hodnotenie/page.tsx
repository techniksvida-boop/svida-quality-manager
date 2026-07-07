"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const DEPARTMENT_STYLES: Record<
  string,
  {
    cardClass: string;
    badgeClass: string;
    titleClass: string;
    buttonClass: string;
    hoverClass: string;
    employeeCardClass: string;
    employeeButtonClass: string;
  }
> = {
  "Úsek opatrovateľskej starostlivosti": {
    cardClass: "bg-emerald-50 border border-emerald-200",
    badgeClass: "bg-emerald-100 text-emerald-700",
    titleClass: "text-emerald-950",
    buttonClass: "text-emerald-700",
    hoverClass: "hover:border-emerald-400 hover:bg-emerald-100/70",
    employeeCardClass: "bg-emerald-50/50 border border-emerald-200",
    employeeButtonClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  "Úsek prevádzky": {
    cardClass: "bg-blue-50 border border-blue-200",
    badgeClass: "bg-blue-100 text-blue-700",
    titleClass: "text-blue-950",
    buttonClass: "text-blue-700",
    hoverClass: "hover:border-blue-400 hover:bg-blue-100/70",
    employeeCardClass: "bg-blue-50/50 border border-blue-200",
    employeeButtonClass: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  "Úsek riaditeľa": {
    cardClass: "bg-slate-100 border border-slate-200",
    badgeClass: "bg-slate-200 text-slate-700",
    titleClass: "text-slate-950",
    buttonClass: "text-slate-700",
    hoverClass: "hover:border-slate-400 hover:bg-slate-200/70",
    employeeCardClass: "bg-slate-50 border border-slate-200",
    employeeButtonClass: "bg-slate-700 hover:bg-slate-800 text-white",
  },
  "Úsek sociálnej práce": {
    cardClass: "bg-violet-50 border border-violet-200",
    badgeClass: "bg-violet-100 text-violet-700",
    titleClass: "text-violet-950",
    buttonClass: "text-violet-700",
    hoverClass: "hover:border-violet-400 hover:bg-violet-100/70",
    employeeCardClass: "bg-violet-50/50 border border-violet-200",
    employeeButtonClass: "bg-violet-600 hover:bg-violet-700 text-white",
  },
  "Úsek stravovania": {
    cardClass: "bg-amber-50 border border-amber-200",
    badgeClass: "bg-amber-100 text-amber-700",
    titleClass: "text-amber-950",
    buttonClass: "text-amber-700",
    hoverClass: "hover:border-amber-400 hover:bg-amber-100/70",
    employeeCardClass: "bg-amber-50/50 border border-amber-200",
    employeeButtonClass: "bg-amber-600 hover:bg-amber-700 text-white",
  },
};

const DEFAULT_DEPARTMENT_STYLE = {
  cardClass: "bg-white border border-gray-200",
  badgeClass: "bg-gray-100 text-gray-600",
  titleClass: "text-gray-900",
  buttonClass: "text-gray-700",
  hoverClass: "hover:border-gray-300 hover:bg-gray-50",
  employeeCardClass: "bg-white border border-gray-200",
  employeeButtonClass: "bg-[#df4a33] hover:bg-[#c73f2b] text-white",
};

export default function HodnoteniePage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [used, setUsed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );

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

  const selectedDepartmentName =
    departments.find((department: any) => department.id === selectedDepartment)
      ?.name || "";

  const selectedDepartmentStyle =
    DEPARTMENT_STYLES[selectedDepartmentName] || DEFAULT_DEPARTMENT_STYLE;

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
          <h2 className="mt-10 mb-5 text-2xl font-semibold">Vyberte úsek</h2>

          <div className="grid md:grid-cols-2 gap-5">
            {departments.map((department: any) => {
              const departmentStyle =
                DEPARTMENT_STYLES[department.name] || DEFAULT_DEPARTMENT_STYLE;

              return (
                <button
                  key={department.id}
                  onClick={() => setSelectedDepartment(department.id)}
                  className={`rounded-2xl p-8 text-left shadow-sm transition ${departmentStyle.cardClass} ${departmentStyle.hoverClass}`}
                >
                  <div
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${departmentStyle.badgeClass}`}
                  >
                    Úsek
                  </div>

                  <h3
                    className={`mt-4 text-xl font-semibold ${departmentStyle.titleClass}`}
                  >
                    {department.name}
                  </h3>

                  <p className="mt-2 text-sm text-gray-600">
                    Kliknite pre zobrazenie zamestnancov.
                  </p>

                  <div className={`mt-5 font-medium ${departmentStyle.buttonClass}`}>
                    Zobraziť zamestnancov →
                  </div>
                </button>
              );
            })}
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

          <div
            className={`mb-6 rounded-2xl p-5 ${selectedDepartmentStyle.cardClass}`}
          >
            <div
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${selectedDepartmentStyle.badgeClass}`}
            >
              Vybraný úsek
            </div>

            <h2
              className={`mt-3 text-2xl font-bold ${selectedDepartmentStyle.titleClass}`}
            >
              {selectedDepartmentName}
            </h2>

            <p className="mt-2 text-gray-600">
              Vyberte zamestnanca, ktorého chcete hodnotiť.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {filteredEmployees.map((employee) => {
              const done = used.includes(employee.id);

              return (
                <div
                  key={employee.id}
                  className={`rounded-2xl p-6 shadow-sm ${selectedDepartmentStyle.employeeCardClass}`}
                >
                  <h2 className="text-xl font-semibold">
                    {employee.first_name} {employee.last_name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-600">
                    {employee.positions?.name}
                  </p>

                  {done ? (
                    <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-green-700">
                      ✓ Už ohodnotené
                    </div>
                  ) : (
                    <Link
                      href={`/employee/${employee.id}`}
                      className={`mt-5 inline-block rounded-xl px-5 py-3 font-semibold transition ${selectedDepartmentStyle.employeeButtonClass}`}
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