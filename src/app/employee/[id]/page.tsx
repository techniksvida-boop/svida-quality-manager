import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EmployeePage({ params }: Props) {
  const { id } = await params;

  const { data: employee } = await supabase
    .from("employees")
    .select(`
      *,
      departments(name),
      positions(name)
    `)
    .eq("id", id)
    .single();

  if (!employee) {
    notFound();
  }

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

      <div className="mt-10 rounded-xl border p-6">
        <h2 className="text-2xl font-semibold">
          Hodnotenie
        </h2>

        <p className="mt-4 text-gray-600">
          Formulár hodnotenia sem doplníme v ďalšom kroku.
        </p>
      </div>
    </main>
  );
}