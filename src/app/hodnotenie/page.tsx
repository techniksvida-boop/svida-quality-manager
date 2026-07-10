"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const DEPARTMENT_STYLES: Record<string, any> = {
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
  const [selfEmployee, setSelfEmployee] = useState<any>(null);
  const [selfDone, setSelfDone] = useState(false);
  const [peerUsed, setPeerUsed] = useState<string[]>([]);
  const [managerUsed, setManagerUsed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function loadData() {
      const votingCodeId = localStorage.getItem("voting_code_id");
      const employeeId = localStorage.getItem("employee_id");

      if (!votingCodeId || !employeeId) {
        window.location.href = "/start";
        return;
      }

      const { data: activePeriod } = await supabase
        .from("evaluation_periods")
        .select("id")
        .eq("is_active", true)
        .single();

      if (!activePeriod) {
        setLoading(false);
        return;
      }

      const { data: employeesData } = await supabase
        .from("employees")
        .select(`
          id,
          first_name,
          last_name,
          manager_id,
          positions(name),
          departments(id,name)
        `)
        .eq("is_active", true)
        .order("last_name");

      const { data: usageData } = await supabase
        .from("voting_code_usage")
        .select("evaluated_employee_id, evaluation_type_id")
        .eq("voting_code_id", votingCodeId)
        .eq("period_id", activePeriod.id);

      const { data: evaluationTypes } = await supabase
        .from("evaluation_types")
        .select("id, code")
        .in("code", ["peer", "self", "manager"]);

      const peerType = evaluationTypes?.find(
        (type: any) => type.code === "peer"
      );
      const selfType = evaluationTypes?.find(
        (type: any) => type.code === "self"
      );
      const managerType = evaluationTypes?.find(
        (type: any) => type.code === "manager"
      );

      const allEmployees = employeesData || [];

      setSelfEmployee(
        allEmployees.find((employee: any) => employee.id === employeeId) || null
      );

      setEmployees(
        allEmployees.filter((employee: any) => employee.id !== employeeId)
      );

      setPeerUsed(
        (usageData || [])
          .filter(
            (usage: any) => usage.evaluation_type_id === peerType?.id
          )
          .map((usage: any) => usage.evaluated_employee_id)
      );

      setManagerUsed(
        (usageData || [])
          .filter(
            (usage: any) => usage.evaluation_type_id === managerType?.id
          )
          .map((usage: any) => usage.evaluated_employee_id)
      );

      const selfAlreadyDone = (usageData || []).some(
        (usage: any) =>
          usage.evaluation_type_id === selfType?.id &&
          usage.evaluated_employee_id === employeeId
      );

      setSelfDone(selfAlreadyDone);
      setLoading(false);
    }

    loadData();
  }, []);

  const departments = useMemo(() => {
    const map = new Map();

    employees.forEach((employee) => {
      const department = employee.departments;

      if (department && !map.has(department.id)) {
        map.set(department.id, department);
      }
    });

    return Array.from(map.values()).sort((a: any, b: any) =>
      a.name.localeCompare(b.name, "sk")
    );
  }, [employees]);

  const filteredEmployees = employees.filter(
    (employee) => employee.departments?.id === selectedDepartment
  );

  const selectedDepartmentName =
    departments.find(
      (department: any) => department.id === selectedDepartment
    )?.name || "";

  const selectedDepartmentStyle =
    DEPARTMENT_STYLES[selectedDepartmentName] || DEFAULT_DEPARTMENT_STYLE;

  if (loading) {
    return <main className="p-8">Načítavam...</main>;
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="mb-8 flex justify-center">
        <img
          src="/logo-svida.jpg"
          alt="Senior dom Svida"
          className="h-24 w-auto"
        />
      </div>

      <h1 className="text-4xl font-bold">
        Ročné hodnotenie zamestnancov
      </h1>

      <p className="mt-2 text-gray-500">
        Vyplňte sebahodnotenie a následne hodnotenie ostatných zamestnancov.
        Vedúci pracovníci môžu navyše samostatne hodnotiť svojich podriadených.
      </p>

      {selfEmployee && (
        <div className="mt-8 rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <div className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
            Sebahodnotenie
          </div>

          <h2 className="mt-4 text-2xl font-bold text-orange-950">
            {selfEmployee.first_name} {selfEmployee.last_name}
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            {selfEmployee.positions?.name}
          </p>

          {selfDone ? (
            <div className="mt-5 inline-block rounded-xl bg-green-100 px-5 py-3 font-semibold text-green-700">
              ✓ Sebahodnotenie odoslané
            </div>
          ) : (
            <Link
              href={`/employee/${selfEmployee.id}?type=self`}
              className="mt-5 inline-block rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
            >
              Ohodnotiť vlastnú prácu
            </Link>
          )}
        </div>
      )}

      {!selectedDepartment ? (
        <>
          <h2 className="mb-5 mt-10 text-2xl font-semibold">
            Vyberte úsek
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            {departments.map((department: any) => {
              const departmentStyle =
                DEPARTMENT_STYLES[department.name] ||
                DEFAULT_DEPARTMENT_STYLE;

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

                  <div
                    className={`mt-5 font-medium ${departmentStyle.buttonClass}`}
                  >
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
            className="mb-6 mt-10 rounded-lg border px-4 py-2"
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
              Vyberte zamestnanca a spôsob hodnotenia.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {filteredEmployees.map((employee) => {
              const peerDone = peerUsed.includes(employee.id);
              const managerDone = managerUsed.includes(employee.id);
              const isDirectReport =
                employee.manager_id === selfEmployee?.id;

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

                  <div className="mt-5 space-y-3">
  {isDirectReport ? (
    managerDone ? (
      <div className="rounded-xl bg-indigo-100 px-4 py-3 font-semibold text-indigo-700">
        ✓ Hodnotenie vedúcim odoslané
      </div>
    ) : (
      <Link
        href={`/employee/${employee.id}?type=manager`}
        className="block rounded-xl bg-indigo-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-indigo-800"
      >
        Hodnotenie vedúcim
      </Link>
    )
  ) : peerDone ? (
    <div className="rounded-xl bg-green-100 px-4 py-3 font-semibold text-green-700">
      ✓ Hodnotenie zamestnanca odoslané
    </div>
  ) : (
    <Link
      href={`/employee/${employee.id}?type=peer`}
      className={`block rounded-xl px-5 py-3 text-center font-semibold transition ${selectedDepartmentStyle.employeeButtonClass}`}
    >
      Hodnotenie zamestnancov
    </Link>
  )}
</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}