import Link from "next/link";
import { supabase } from "@/lib/supabase";

const DEPARTMENT_STYLES: Record<
  string,
  {
    cardClass: string;
    badgeClass: string;
    titleClass: string;
    linkClass: string;
    hoverClass: string;
  }
> = {
  "Úsek opatrovateľskej starostlivosti": {
    cardClass: "bg-emerald-50 border border-emerald-200",
    badgeClass: "bg-emerald-100 text-emerald-700",
    titleClass: "text-emerald-950",
    linkClass: "text-emerald-700",
    hoverClass: "hover:border-emerald-400 hover:bg-emerald-100/60",
  },
  "Úsek prevádzky": {
    cardClass: "bg-blue-50 border border-blue-200",
    badgeClass: "bg-blue-100 text-blue-700",
    titleClass: "text-blue-950",
    linkClass: "text-blue-700",
    hoverClass: "hover:border-blue-400 hover:bg-blue-100/60",
  },
  "Úsek riaditeľa": {
    cardClass: "bg-slate-100 border border-slate-200",
    badgeClass: "bg-slate-200 text-slate-700",
    titleClass: "text-slate-950",
    linkClass: "text-slate-700",
    hoverClass: "hover:border-slate-400 hover:bg-slate-200/60",
  },
  "Úsek sociálnej práce": {
    cardClass: "bg-violet-50 border border-violet-200",
    badgeClass: "bg-violet-100 text-violet-700",
    titleClass: "text-violet-950",
    linkClass: "text-violet-700",
    hoverClass: "hover:border-violet-400 hover:bg-violet-100/60",
  },
  "Úsek stravovania": {
    cardClass: "bg-amber-50 border border-amber-200",
    badgeClass: "bg-amber-100 text-amber-700",
    titleClass: "text-amber-950",
    linkClass: "text-amber-700",
    hoverClass: "hover:border-amber-400 hover:bg-amber-100/60",
  },
};

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
      <div className="mb-8 flex justify-center">
        <img
          src="/logo-svida.jpg"
          alt="Senior dom Svida"
          className="h-24 w-auto"
        />
      </div>

      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold">Svida Quality Manager</h1>

        <p className="mt-2 text-gray-500">
          Anonymné hodnotenie zamestnancov
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees?.map((employee: any) => {
          const departmentName = (employee.departments as any)?.name || "Bez úseku";

          const departmentStyle = DEPARTMENT_STYLES[departmentName] || {
            cardClass: "bg-white border border-gray-200",
            badgeClass: "bg-gray-100 text-gray-600",
            titleClass: "text-gray-900",
            linkClass: "text-gray-700",
            hoverClass: "hover:border-gray-300 hover:bg-gray-50",
          };

          return (
            <Link
              key={employee.id}
              href={`/employee/${employee.id}`}
              className={`rounded-2xl p-6 shadow-sm transition ${departmentStyle.cardClass} ${departmentStyle.hoverClass}`}
            >
              <div
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${departmentStyle.badgeClass}`}
              >
                {departmentName}
              </div>

              <h2 className={`mt-4 text-xl font-semibold ${departmentStyle.titleClass}`}>
                {employee.first_name} {employee.last_name}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                {(employee.positions as any)?.name}
              </p>

              <div className={`mt-5 font-medium ${departmentStyle.linkClass}`}>
                Otvoriť hodnotenie →
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}