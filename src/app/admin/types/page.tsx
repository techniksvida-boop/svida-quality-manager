import { supabase } from "@/lib/supabase";

export default async function EvaluationTypesPage() {
  const { data: types, error } = await supabase
  .from("evaluation_types")
  .select("*")
  .order("weight", { ascending: false });

console.log("TYPES:", types);
console.log("ERROR:", error);

  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        Typy hodnotenia
      </h1>

      <div className="rounded-xl border bg-white">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left">Typ</th>
              <th className="p-3 text-left">Kód</th>
              <th className="p-3 text-center">Váha</th>
              <th className="p-3 text-center">Aktívne</th>
            </tr>
          </thead>

          <tbody>
            {types?.map((type) => (
              <tr key={type.id} className="border-b">
                <td className="p-3">{type.name}</td>
                <td className="p-3">{type.code}</td>
                <td className="p-3 text-center">
                  {type.weight} %
                </td>
                <td className="p-3 text-center">
                  {type.is_active ? "Áno" : "Nie"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}