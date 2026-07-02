import { supabase } from "@/lib/supabase";

export default async function AdminPage() {
  const { data: employees } = await supabase
    .from("employees")
    .select(`
      id,
      first_name,
      last_name,
      positions(name),
      evaluations(
        id,
        evaluation_answers(score)
      )
    `)
    .eq("is_active", true)
    .order("last_name");

  const { count: totalCodes } = await supabase
    .from("voting_codes")
    .select("*", { count: "exact", head: true });

  const { count: usedCodes } = await supabase
    .from("voting_code_usage")
    .select("voting_code_id", { count: "exact", head: true });

  return (
    <main className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold">Manažérsky dashboard</h1>

      <div className="mt-8 grid md:grid-cols-3 gap-5">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">Počet kódov</p>
          <p className="mt-2 text-3xl font-bold">{totalCodes || 0}</p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">Odoslané hodnotenia</p>
          <p className="mt-2 text-3xl font-bold">{usedCodes || 0}</p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">Hodnotení zamestnanci</p>
          <p className="mt-2 text-3xl font-bold">{employees?.length || 0}</p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-5">Výsledky podľa zamestnanca</h2>

        <div className="space-y-4">
          {employees?.map((employee: any) => {
            const scores =
              employee.evaluations?.flatMap((evaluation: any) =>
                evaluation.evaluation_answers?.map((answer: any) => answer.score) || []
              ) || [];

            const average =
              scores.length > 0
                ? (scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length).toFixed(2)
                : "—";

            return (
              <div
                key={employee.id}
                className="rounded-2xl border bg-white p-6 shadow-sm flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xl font-semibold">
                    {employee.first_name} {employee.last_name}
                  </h3>
                  <p className="text-gray-500">
                    {(employee.positions as any)?.name}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Priemer</p>
                  <p className="text-3xl font-bold">{average}</p>
                  <p className="text-sm text-gray-500">
                    {scores.length} odpovedí
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}