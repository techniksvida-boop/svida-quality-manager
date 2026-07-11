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
    <main className="svida-page svida-page-bg">
      <div className="svida-container">
        <header className="mb-8 text-center sm:mb-10">
          <div className="mb-5 flex justify-center sm:mb-6">
            <img
              src="/logo-svida.jpg"
              alt="Senior dom Svida"
              className="h-auto w-full max-w-[180px] object-contain sm:max-w-[220px]"
            />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            Svida Quality Manager
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Anonymné hodnotenie zamestnancov
          </p>
        </header>

        {!employees || employees.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
            <p className="text-sm text-gray-600 sm:text-base">
              Momentálne nie sú dostupní žiadni zamestnanci na hodnotenie.
            </p>
          </div>
        ) : (
          <section
            aria-label="Zoznam zamestnancov"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
          >
            {employees.map((employee: any) => {
              const departmentName =
                (employee.departments as any)?.name || "Bez úseku";

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
                  className={`
                    group flex min-h-[180px] min-w-0 flex-col
                    rounded-2xl p-5 shadow-sm
                    transition duration-200
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[var(--svida-primary)]
                    focus-visible:ring-offset-2
                    active:scale-[0.99]
                    sm:min-h-[200px] sm:p-6
                    ${departmentStyle.cardClass}
                    ${departmentStyle.hoverClass}
                  `}
                >
                  <div
                    className={`
                      inline-flex max-w-full self-start
                      rounded-full px-3 py-1.5
                      text-xs font-semibold leading-tight
                      ${departmentStyle.badgeClass}
                    `}
                  >
                    <span className="truncate">{departmentName}</span>
                  </div>

                  <h2
                    className={`
                      mt-4 break-words text-lg font-semibold leading-snug
                      sm:text-xl
                      ${departmentStyle.titleClass}
                    `}
                  >
                    {employee.first_name} {employee.last_name}
                  </h2>

                  <p className="mt-2 break-words text-sm leading-relaxed text-gray-600">
                    {(employee.positions as any)?.name || "Pracovná pozícia neuvedená"}
                  </p>

                  <div
                    className={`
                      mt-auto pt-5 text-sm font-semibold
                      sm:text-base
                      ${departmentStyle.linkClass}
                    `}
                  >
                    Otvoriť hodnotenie
                    <span
                      aria-hidden="true"
                      className="ml-1 inline-block transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}