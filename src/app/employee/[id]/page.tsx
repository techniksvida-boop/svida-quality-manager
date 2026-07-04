import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import EvaluationForm from "./EvaluationForm";

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

  const { data: period } = await supabase
    .from("evaluation_periods")
    .select("id")
    .eq("is_active", true)
    .single();

  if (!period) {
    return (
      <main className="max-w-3xl mx-auto p-8">
        Nie je nastavené aktívne hodnotiace obdobie.
      </main>
    );
  }

  return (
  <main className="max-w-3xl mx-auto p-8">
    <div className="mb-8 flex justify-center">
      <img
        src="/logo-svida.png"
        alt="Senior dom Svida"
        className="h-24 w-auto"
      />
    </div>

    <h1 className="text-4xl font-bold">
      {employee.first_name} {employee.last_name}
    </h1>

      <p className="text-gray-500 mt-2">
        {(employee.departments as any)?.name}
      </p>

      <p className="text-gray-500">
        {(employee.positions as any)?.name}
      </p>

      <EvaluationForm
        employeeId={employee.id}
        periodId={period.id}
        questions={questions || []}
      />
    </main>
  );
}