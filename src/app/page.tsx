import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: employees } = await supabase
    .from("employees")
    .select(`
      id,
      first_name,
      last_name,
      departments(name),
      positions(name)
    `)
    .order("last_name");

  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          Svida Quality Manager
        </h1>

        <p className="mt-2 text-gray-500">
          Anonymné hodnotenie zamestnancov
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees?.map((employee: any) => (
          <Link
            key={employee.id}
            href={`/employee/${employee.id}`}
            className="rounded-2xl border bg-white p-6 shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold">
              {employee.first_name} {employee.last_name}
            </h2>

            <p className="text-gray-600 mt-2">
              {(employee.departments as any)?.name}
            </p>

            <p className="text-sm text-gray-500">
              {(employee.positions as any)?.name}
            </p>

            <div className="mt-5 text-blue-600 font-medium">
              Otvoriť hodnotenie →
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}