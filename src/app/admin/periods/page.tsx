import { supabase } from "@/lib/supabase";

export default async function PeriodsAdminPage() {
  const { data: periods } = await supabase
    .from("evaluation_periods")
    .select("*")
    .order("date_from", { ascending: false });

  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold">Hodnotiace obdobia</h1>

      <div className="mt-6 rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="p-3">Názov</th>
              <th className="p-3">Hodnotené obdobie</th>
              <th className="p-3">Hlasovanie</th>
              <th className="p-3">Aktívne</th>
            </tr>
          </thead>

          <tbody>
            {periods?.map((period) => (
              <tr key={period.id} className="border-b">
                <td className="p-3 font-medium">{period.name}</td>
                <td className="p-3">
                  {period.date_from} – {period.date_to}
                </td>
                <td className="p-3">
                  {period.voting_from} – {period.voting_to}
                </td>
                <td className="p-3">
                  {period.is_active ? "Áno" : "Nie"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}