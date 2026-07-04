export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";

export default async function AdminPage() {
  const { data: employees } = await supabase
    .from("employees")
    .select("id, first_name, last_name, positions(name)")
    .eq("is_active", true)
    .order("last_name");

  const { data: evaluations } = await supabase
    .from("evaluations")
    .select("id, evaluated_employee_id, submitted_at")
    .eq("is_submitted", true);

  const { data: answers } = await supabase
    .from("evaluation_answers")
    .select("evaluation_id, question_id, score");

  const { data: comments } = await supabase
    .from("evaluation_comments")
    .select("evaluation_id, comment_type, comment_text");

  const { count: totalCodes } = await supabase
    .from("voting_codes")
    .select("*", { count: "exact", head: true });

  const { count: usedEvaluations } = await supabase
    .from("voting_code_usage")
    .select("*", { count: "exact", head: true });

  const evaluatedEmployeeIds = new Set(
    (evaluations || []).map((evaluation) => evaluation.evaluated_employee_id)
  );

  const employeesWithStats = (employees || []).map((employee: any) => {
    const employeeEvaluations =
      evaluations?.filter(
        (evaluation) => evaluation.evaluated_employee_id === employee.id
      ) || [];

    const employeeEvaluationIds = employeeEvaluations.map(
      (evaluation) => evaluation.id
    );

    const employeeAnswers =
      answers?.filter((answer) =>
        employeeEvaluationIds.includes(answer.evaluation_id)
      ) || [];

    const scores = employeeAnswers.map((answer) => Number(answer.score));

    const average =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : null;

    const employeeComments =
      comments?.filter((comment) =>
        employeeEvaluationIds.includes(comment.evaluation_id)
      ) || [];

    return {
      ...employee,
      evaluationCount: employeeEvaluations.length,
      answerCount: scores.length,
      average,
      comments: employeeComments,
    };
  });

  const sortedEmployees = employeesWithStats.sort((a, b) => {
    if (a.average === null && b.average === null) return 0;
    if (a.average === null) return 1;
    if (b.average === null) return -1;
    return b.average - a.average;
  });

  return (
    <main className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold">Manažérsky dashboard</h1>

      <p className="mt-3 text-gray-500">
        Prehľad anonymného hodnotenia zamestnancov sociálneho úseku.
      </p>

      <div className="mt-8 grid md:grid-cols-4 gap-5">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">Počet kódov</p>
          <p className="mt-2 text-3xl font-bold">{totalCodes || 0}</p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">Odoslané hodnotenia</p>
          <p className="mt-2 text-3xl font-bold">{usedEvaluations || 0}</p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">Hodnotení zamestnanci</p>
          <p className="mt-2 text-3xl font-bold">
            {evaluatedEmployeeIds.size}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">Sledovaní zamestnanci</p>
          <p className="mt-2 text-3xl font-bold">
            {employees?.length || 0}
          </p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-5">
          Výsledky podľa zamestnanca
        </h2>

        <div className="space-y-5">
          {sortedEmployees.map((employee: any) => (
            <div
              key={employee.id}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {employee.first_name} {employee.last_name}
                  </h3>

                  <p className="text-gray-500">
                    {employee.positions?.name}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-right">
                  <div>
                    <p className="text-sm text-gray-500">Priemer</p>
                    <p className="text-2xl font-bold">
                      {employee.average !== null
                        ? employee.average.toFixed(2)
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Hodnotení</p>
                    <p className="text-2xl font-bold">
                      {employee.evaluationCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Odpovedí</p>
                    <p className="text-2xl font-bold">
                      {employee.answerCount}
                    </p>
                  </div>
                </div>
              </div>

              {employee.comments.length > 0 && (
                <div className="mt-6 border-t pt-5">
                  <h4 className="font-semibold mb-3">
                    Slovné komentáre
                  </h4>

                  <div className="space-y-3">
                    {employee.comments.map((comment: any, index: number) => (
                      <div
                        key={index}
                        className="rounded-xl bg-gray-50 p-4 text-sm"
                      >
                        <p className="font-semibold text-gray-600">
                          {comment.comment_type === "positive" &&
                            "Čo robí dobre"}
                          {comment.comment_type === "improvement" &&
                            "V čom sa môže zlepšiť"}
                          {comment.comment_type === "example" &&
                            "Konkrétny príklad"}
                        </p>

                        <p className="mt-1 text-gray-700">
                          {comment.comment_text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}