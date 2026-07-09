import Link from "next/link";
import { supabase } from "@/lib/supabase";

function avg(values: number[]) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function format(value: number | null) {
  if (value === null) return "–";
  return value.toFixed(2).replace(".", ",");
}

export default async function AdminResultsPage({
  searchParams,
}: {
  searchParams?: { period?: string };
}) {
  const { data: periods } = await supabase
    .from("evaluation_periods")
    .select("*")
    .order("date_from", { ascending: false });

  const selectedPeriod =
    periods?.find((period) => period.id === searchParams?.period) ||
    periods?.find((period) => period.is_active) ||
    periods?.[0];

  const selectedPeriodId = selectedPeriod?.id;

  const { data: employees } = await supabase
    .from("employees")
    .select("id, first_name, last_name, departments(name)")
    .eq("is_active", true)
    .order("last_name");

  const { data: types } = await supabase
    .from("evaluation_types")
    .select("*")
    .eq("is_active", true);

  const { data: evaluations } = selectedPeriodId
    ? await supabase
        .from("evaluations")
        .select(`
          id,
          evaluated_employee_id,
          evaluation_type_id,
          evaluation_answers(score)
        `)
        .eq("period_id", selectedPeriodId)
        .eq("is_submitted", true)
    : { data: [] };

  const employeeResults = (employees || []).map((employee: any) => {
    const employeeEvaluations = (evaluations || []).filter(
      (evaluation: any) => evaluation.evaluated_employee_id === employee.id
    );

    const typeResults = (types || []).map((type: any) => {
      const evaluationsByType = employeeEvaluations.filter(
        (evaluation: any) => evaluation.evaluation_type_id === type.id
      );

      const scores = evaluationsByType
        .map((evaluation: any) =>
          avg(
            (evaluation.evaluation_answers || []).map((answer: any) =>
              Number(answer.score)
            )
          )
        )
        .filter((value: number | null) => value !== null) as number[];

      return {
        code: type.code,
        name: type.name,
        weight: Number(type.weight),
        count: scores.length,
        average: avg(scores),
      };
    });

    const weightedParts = typeResults.filter((type) => type.average !== null);

    const usedWeight = weightedParts.reduce(
      (sum, type) => sum + type.weight,
      0
    );

    const weightedScore =
      usedWeight > 0
        ? weightedParts.reduce(
            (sum, type) => sum + Number(type.average) * type.weight,
            0
          ) / usedWeight
        : null;

    return {
      employee,
      typeResults,
      weightedScore,
      totalEvaluations: employeeEvaluations.length,
    };
  });

  const sortedResults = employeeResults.sort((a, b) => {
    if (a.weightedScore === null) return 1;
    if (b.weightedScore === null) return -1;
    return b.weightedScore - a.weightedScore;
  });

  return (
    <main className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold">Výsledky hodnotenia</h1>

      <p className="mt-2 text-gray-500">
        Výsledky sú filtrované podľa hodnotiaceho obdobia.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {(periods || []).map((period: any) => (
          <Link
            key={period.id}
            href={`/admin/results?period=${period.id}`}
            className={`rounded-xl border px-4 py-2 ${
              selectedPeriod?.id === period.id
                ? "bg-[#df4a33] text-white"
                : "bg-white text-gray-700"
            }`}
          >
            {period.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left">Zamestnanec</th>
              <th className="p-3 text-left">Úsek</th>
              <th className="p-3 text-center">Anonymné</th>
              <th className="p-3 text-center">Sebahodnotenie</th>
              <th className="p-3 text-center">Vedúci</th>
              <th className="p-3 text-center">Výsledok</th>
              <th className="p-3 text-center">Počet hodnotení</th>
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
                <tr key={result.employee.id} className="border-b">
                  <td className="p-3 font-medium">
                    {result.employee.first_name} {result.employee.last_name}
                  </td>
                  <td className="p-3">
                    {result.employee.departments?.name || "–"}
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
                    {format(result.weightedScore)}
                  </td>
                  <td className="p-3 text-center">
                    {result.totalEvaluations}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}