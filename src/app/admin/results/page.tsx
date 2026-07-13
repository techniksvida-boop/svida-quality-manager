export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { supabase } from "@/lib/supabase";

function avg(values: number[]) {
  if (!values.length) return null;

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

function format(value: number | null) {
  if (value === null) return "–";

  return value.toFixed(2).replace(".", ",");
}

export default async function AdminResultsPage({
  searchParams,
}: {
  searchParams?: Promise<{ period?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  const { data: periods, error: periodsError } = await supabase
    .from("evaluation_periods")
    .select("*")
    .order("date_from", { ascending: false });

  if (periodsError) {
    return (
      <main className="mx-auto max-w-7xl p-8">
        <h1 className="text-3xl font-bold">Výsledky hodnotenia</h1>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          Hodnotiace obdobia sa nepodarilo načítať.
        </div>
      </main>
    );
  }

  const selectedPeriod =
    periods?.find(
      (period: any) =>
        period.id === resolvedSearchParams?.period
    ) ||
    periods?.find((period: any) => period.is_active) ||
    periods?.[0];

  const selectedPeriodId = selectedPeriod?.id;

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
        <h1 className="text-3xl font-bold">Výsledky hodnotenia</h1>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          Zoznam zamestnancov sa nepodarilo načítať.
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
        <h1 className="text-3xl font-bold">Výsledky hodnotenia</h1>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          Typy hodnotenia sa nepodarilo načítať.
        </div>
      </main>
    );
  }

  const { data: evaluations, error: evaluationsError } =
    selectedPeriodId
      ? await supabase
          .from("evaluations")
          .select(`
            id,
            evaluated_employee_id,
            evaluation_type,
            evaluation_type_id,
            evaluation_answers(score)
          `)
          .eq("period_id", selectedPeriodId)
          .eq("is_submitted", true)
      : { data: [], error: null };

  if (evaluationsError) {
    return (
      <main className="mx-auto max-w-7xl p-8">
        <h1 className="text-3xl font-bold">Výsledky hodnotenia</h1>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          Hodnotenia sa nepodarilo načítať.
        </div>
      </main>
    );
  }

  const employeeResults = (employees || []).map(
    (employee: any) => {
      const employeeEvaluations = (evaluations || []).filter(
        (evaluation: any) =>
          evaluation.evaluated_employee_id === employee.id
      );

      const typeResults = (types || []).map((type: any) => {
        const evaluationsByType =
          employeeEvaluations.filter((evaluation: any) => {
            if (evaluation.evaluation_type_id) {
              return (
                evaluation.evaluation_type_id === type.id
              );
            }

            return evaluation.evaluation_type === type.code;
          });

        const evaluationScores = evaluationsByType
          .map((evaluation: any) => {
            const answerScores = (
              evaluation.evaluation_answers || []
            )
              .map((answer: any) => Number(answer.score))
              .filter((score: number) =>
                Number.isFinite(score)
              );

            return avg(answerScores);
          })
          .filter(
            (value: number | null): value is number =>
              value !== null
          );

        return {
          id: type.id,
          code: type.code,
          name: type.name,
          weight: Number(type.weight || 0),
          count: evaluationScores.length,
          average: avg(evaluationScores),
        };
      });

      const weightedParts = typeResults.filter(
        (type: any) =>
          type.average !== null && type.weight > 0
      );

      const usedWeight = weightedParts.reduce(
        (sum: number, type: any) =>
          sum + type.weight,
        0
      );

      const weightedScore =
        usedWeight > 0
          ? weightedParts.reduce(
              (sum: number, type: any) =>
                sum +
                Number(type.average) * type.weight,
              0
            ) / usedWeight
          : null;

      return {
        employee,
        typeResults,
        weightedScore,
        totalEvaluations: employeeEvaluations.length,
      };
    }
  );

  const sortedResults = [...employeeResults].sort((a, b) => {
    if (
      a.weightedScore === null &&
      b.weightedScore === null
    ) {
      return a.employee.last_name.localeCompare(
        b.employee.last_name,
        "sk"
      );
    }

    if (a.weightedScore === null) return 1;
    if (b.weightedScore === null) return -1;

    return b.weightedScore - a.weightedScore;
  });

  const totalSubmittedEvaluations = (
    evaluations || []
  ).length;

  const evaluatedEmployeeCount = employeeResults.filter(
    (result: any) => result.totalEvaluations > 0
  ).length;

  return (
    <main className="mx-auto max-w-7xl p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Výsledky hodnotenia
          </h1>

          <p className="mt-2 text-gray-500">
            Výsledky sú filtrované podľa hodnotiaceho
            obdobia.
          </p>

          {selectedPeriod && (
            <p className="mt-2 font-semibold text-gray-800">
              Aktuálne zobrazené obdobie:{" "}
              {selectedPeriod.name}
            </p>
          )}
        </div>

        <Link
          href="/admin"
          className="inline-flex rounded-xl border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Späť na manažérsky dashboard
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {(periods || []).map((period: any) => (
          <Link
            key={period.id}
            href={`/admin/results?period=${period.id}`}
            className={`rounded-xl border px-4 py-2 font-semibold transition ${
              selectedPeriod?.id === period.id
                ? "border-[#df4a33] bg-[#df4a33] text-white"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {period.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Odoslané hodnotenia
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalSubmittedEvaluations}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Hodnotení zamestnanci
          </p>

          <p className="mt-2 text-3xl font-bold">
            {evaluatedEmployeeCount}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Sledovaní zamestnanci
          </p>

          <p className="mt-2 text-3xl font-bold">
            {employees?.length || 0}
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left">
                Zamestnanec
              </th>

              <th className="p-3 text-left">
                Úsek
              </th>

              <th className="p-3 text-center">
  Počet hodnotení
</th>

<th className="p-3 text-center">
  Karta zamestnanca
</th>

              <th className="p-3 text-center">
                Sebahodnotenie
              </th>

              <th className="p-3 text-center">
                Hodnotenie vedúcim
              </th>

              <th className="p-3 text-center">
                Výsledok
              </th>

              <th className="p-3 text-center">
                Počet hodnotení
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedResults.map((result: any) => {
              const peer = result.typeResults.find(
                (type: any) => type.code === "peer"
              );

              const self = result.typeResults.find(
                (type: any) => type.code === "self"
              );

              const manager = result.typeResults.find(
                (type: any) => type.code === "manager"
              );

              return (
                <tr
                  key={result.employee.id}
                  className="border-b last:border-b-0"
                >
                  <td className="p-3 font-medium">
                    {result.employee.first_name}{" "}
                    {result.employee.last_name}
                  </td>

                  <td className="p-3">
                    {result.employee.departments?.name ||
                      "–"}
                  </td>

                  <td className="p-3 text-center">
                    <div className="font-semibold">
                      {format(peer?.average ?? null)}
                    </div>

                    {peer?.count > 0 && (
                      <div className="mt-1 text-xs text-gray-500">
                        {peer.count} hodnotení
                      </div>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    <div className="font-semibold">
                      {format(self?.average ?? null)}
                    </div>

                    {self?.count > 0 && (
                      <div className="mt-1 text-xs text-gray-500">
                        {self.count} hodnotenie
                      </div>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    <div className="font-semibold">
                      {format(manager?.average ?? null)}
                    </div>

                    {manager?.count > 0 && (
                      <div className="mt-1 text-xs text-gray-500">
                        {manager.count} hodnotenie
                      </div>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    <span
                      className={`inline-flex min-w-16 justify-center rounded-full px-3 py-1 font-bold ${
                        result.weightedScore === null
                          ? "bg-gray-100 text-gray-600"
                          : result.weightedScore >= 4.1
                            ? "bg-green-100 text-green-800"
                            : result.weightedScore > 3
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {format(result.weightedScore)}
                    </span>
                  </td>

                  <td className="p-3 text-center font-semibold">
  {result.totalEvaluations}
</td>

<td className="p-3 text-center">
  <Link
    href={`/admin/employees/${result.employee.id}`}
    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
  >
    Otvoriť kartu
  </Link>
</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedResults.length === 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
          Pre zvolené obdobie nie sú dostupní žiadni
          zamestnanci ani výsledky.
        </div>
      )}
    </main>
  );
}