export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { supabase } from "@/lib/supabase";

function average(values: number[]) {
  if (!values.length) return null;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function format(value: number | null) {
  if (value === null) return "–";

  return value.toFixed(2).replace(".", ",");
}

function getDepartmentName(employee: any) {
  if (Array.isArray(employee?.departments)) {
    return employee.departments[0]?.name || "Bez úseku";
  }

  return employee?.departments?.name || "Bez úseku";
}

export default async function TrendsPage({
  searchParams,
}: {
  searchParams?: Promise<{ employee?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  const { data: employees, error: employeesError } = await supabase
    .from("employees")
    .select(`
      id,
      first_name,
      last_name,
      departments(name)
    `)
    .eq("is_active", true)
    .order("last_name");

  if (employeesError) {
    return (
      <main className="mx-auto max-w-7xl p-8">
        <h1 className="text-3xl font-bold">Trendy medzi rokmi</h1>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          Zamestnancov sa nepodarilo načítať.
        </div>
      </main>
    );
  }

  const selectedEmployee =
    employees?.find(
      (employee: any) =>
        employee.id === resolvedSearchParams?.employee
    ) || employees?.[0];

  const { data: periods, error: periodsError } = await supabase
    .from("evaluation_periods")
    .select("id, name, date_from, date_to")
    .order("date_from", { ascending: true });

  if (periodsError) {
    return (
      <main className="mx-auto max-w-7xl p-8">
        <h1 className="text-3xl font-bold">Trendy medzi rokmi</h1>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          Hodnotiace obdobia sa nepodarilo načítať.
        </div>
      </main>
    );
  }

  const { data: types, error: typesError } = await supabase
    .from("evaluation_types")
    .select("id, code, name, weight")
    .eq("is_active", true);

  if (typesError) {
    return (
      <main className="mx-auto max-w-7xl p-8">
        <h1 className="text-3xl font-bold">Trendy medzi rokmi</h1>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          Typy hodnotenia sa nepodarilo načítať.
        </div>
      </main>
    );
  }

  const { data: evaluations, error: evaluationsError } = selectedEmployee
    ? await supabase
        .from("evaluations")
        .select(`
          id,
          period_id,
          evaluation_type,
          evaluation_type_id,
          evaluation_answers(score)
        `)
        .eq("evaluated_employee_id", selectedEmployee.id)
        .eq("is_submitted", true)
    : { data: [], error: null };

  if (evaluationsError) {
    return (
      <main className="mx-auto max-w-7xl p-8">
        <h1 className="text-3xl font-bold">Trendy medzi rokmi</h1>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          Hodnotenia sa nepodarilo načítať.
        </div>
      </main>
    );
  }

  const trendRows = (periods || []).map((period: any) => {
    const periodEvaluations = (evaluations || []).filter(
      (evaluation: any) => evaluation.period_id === period.id
    );

    const typeResults = (types || []).map((type: any) => {
      const typeEvaluations = periodEvaluations.filter(
        (evaluation: any) =>
          evaluation.evaluation_type_id === type.id ||
          evaluation.evaluation_type === type.code
      );

      const evaluationAverages = typeEvaluations
        .map((evaluation: any) => {
          const scores = (evaluation.evaluation_answers || [])
            .map((answer: any) => Number(answer.score))
            .filter((score: number) => Number.isFinite(score));

          return average(scores);
        })
        .filter(
          (value: number | null): value is number =>
            value !== null
        );

      return {
        code: type.code,
        name: type.name,
        weight: Number(type.weight || 0),
        average: average(evaluationAverages),
        count: evaluationAverages.length,
      };
    });

    const availableTypes = typeResults.filter(
      (type: any) =>
        type.average !== null &&
        type.weight > 0
    );

    const availableWeight = availableTypes.reduce(
      (sum: number, type: any) => sum + type.weight,
      0
    );

    const weightedAverage =
      availableWeight > 0
        ? availableTypes.reduce(
            (sum: number, type: any) =>
              sum + Number(type.average) * type.weight,
            0
          ) / availableWeight
        : null;

    return {
      period,
      weightedAverage,
      typeResults,
      evaluationCount: periodEvaluations.length,
    };
  });

  return (
    <main className="mx-auto max-w-7xl p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Trendy medzi rokmi
          </h1>

          <p className="mt-2 text-gray-500">
            Porovnanie výsledkov zamestnanca medzi jednotlivými hodnotiacimi
            obdobiami.
          </p>
        </div>

        <Link
          href="/admin"
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Späť na manažérsky dashboard
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-gray-600">
          Vyberte zamestnanca
        </p>

        <div className="flex flex-wrap gap-3">
          {(employees || []).map((employee: any) => (
            <Link
              key={employee.id}
              href={`/admin/trends?employee=${employee.id}`}
              className={`rounded-xl border px-4 py-2 font-semibold transition ${
                selectedEmployee?.id === employee.id
                  ? "border-[#df4a33] bg-[#df4a33] text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {employee.first_name} {employee.last_name}
            </Link>
          ))}
        </div>
      </div>

      {selectedEmployee && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold">
            {selectedEmployee.first_name} {selectedEmployee.last_name}
          </h2>

          <p className="mt-1 text-gray-500">
            {getDepartmentName(selectedEmployee)}
          </p>
        </div>
      )}

      <div className="mt-8 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left">
                Hodnotiace obdobie
              </th>

              <th className="p-3 text-center">
                Hodnotenie zamestnancov
              </th>

              <th className="p-3 text-center">
                Sebahodnotenie
              </th>

              <th className="p-3 text-center">
                Hodnotenie vedúcim
              </th>

              <th className="p-3 text-center">
                Vážený výsledok
              </th>

              <th className="p-3 text-center">
                Počet hodnotení
              </th>
            </tr>
          </thead>

          <tbody>
            {trendRows.map((row: any) => {
              const peer = row.typeResults.find(
                (type: any) => type.code === "peer"
              );

              const self = row.typeResults.find(
                (type: any) => type.code === "self"
              );

              const manager = row.typeResults.find(
                (type: any) => type.code === "manager"
              );

              return (
                <tr
                  key={row.period.id}
                  className="border-b last:border-b-0"
                >
                  <td className="p-3 font-semibold">
                    {row.period.name}
                  </td>

                  <td className="p-3 text-center">
                    {format(peer?.average ?? null)}
                  </td>

                  <td className="p-3 text-center">
                    {format(self?.average ?? null)}
                  </td>

                  <td className="p-3 text-center">
                    {format(manager?.average ?? null)}
                  </td>

                  <td className="p-3 text-center font-bold">
                    {format(row.weightedAverage)}
                  </td>

                  <td className="p-3 text-center">
                    {row.evaluationCount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(periods || []).length < 2 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          Trend bude možné plnohodnotne vyhodnotiť po vytvorení ďalšieho
          hodnotiaceho obdobia.
        </div>
      )}
    </main>
  );
}