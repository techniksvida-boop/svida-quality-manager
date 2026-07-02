import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmployeePage({ params }: Props) {
  const { id } = await params;

  const { data: employee } = await supabase
    .from("employees")
    .select(`*, departments(name), positions(name)`)
    .eq("id", id)
    .single();

  if (!employee) notFound();

  const { data: questions } = await supabase
    .from("evaluation_questions")
    .select(`id, question, evaluation_categories(name)`)
    .eq("is_active", true)
    .order("sort_order");

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-4xl font-bold">
        {employee.first_name} {employee.last_name}
      </h1>

      <p className="text-gray-500 mt-2">
        {(employee.departments as any)?.name}
      </p>

      <p className="text-gray-500">
        {(employee.positions as any)?.name}
      </p>

      <form className="mt-10 space-y-6">
        {questions?.map((question: any) => (
          <div key={question.id} className="rounded-xl border p-6 bg-white">
            <p className="text-sm text-gray-500 mb-2">
              {(question.evaluation_categories as any)?.name}
            </p>

            <h2 className="text-lg font-semibold mb-4">
              {question.question}
            </h2>

            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((score) => (
                <label key={score} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={question.id}
                    value={score}
                    required
                  />
                  {score}
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-xl border p-6 bg-white">
          <label className="font-semibold block mb-3">
            Slovný komentár
          </label>
          <textarea
            name="comment"
            rows={5}
            className="w-full border rounded-lg p-3"
            placeholder="Napíšte stručný komentár..."
          />
        </div>

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold"
        >
          Odoslať hodnotenie
        </button>
      </form>
    </main>
  );
}