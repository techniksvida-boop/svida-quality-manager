import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import EvaluationForm from "./EvaluationForm";

type Props = {
  params: Promise<{ id: string }>;
};

function formatDate(date: string | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("sk-SK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function MessagePage({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="svida-page svida-page-bg">
      <div className="svida-form-container">
        <div className="mb-5 flex justify-center sm:mb-6">
          <img
            src="/logo-svida.jpg"
            alt="Senior dom Svida"
            className="h-auto w-full max-w-[170px] object-contain sm:max-w-[210px]"
          />
        </div>

        <div className="svida-card rounded-2xl p-5 text-center sm:p-8">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {title}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
            {message}
          </p>

          <Link
  href="/hodnotenie"
  className="
    svida-btn mt-6 inline-flex min-h-12 w-full items-center
              justify-center rounded-xl px-5 py-3
              text-center text-base font-semibold
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--svida-primary)]
              focus-visible:ring-offset-2
              sm:w-auto
            "
          >
            Späť na hlavnú stránku
          </Link>
        </div>
      </div>
    </main>
  );
}

export default async function EmployeePage({ params }: Props) {
  const { id } = await params;

  const { data: employee } = await supabase
    .from("employees")
    .select(`
      id,
      first_name,
      last_name,
      department_id,
      position_id,
      departments(name),
      positions(name)
    `)
    .eq("id", id)
    .single();

  if (!employee) {
    notFound();
  }

  if (!employee.department_id) {
    return (
      <MessagePage
        title="Chýba priradený úsek"
        message="Zamestnanec nemá priradený úsek. Skontrolujte jeho nastavenie v databáze."
      />
    );
  }

  const { data: allDepartmentQuestions } = await supabase
    .from("evaluation_questions")
    .select(`
      id,
      question,
      position_id,
      evaluation_categories(name)
    `)
    .eq("is_active", true)
    .eq("department_id", employee.department_id)
    .order("sort_order");

  const questions = (allDepartmentQuestions || []).filter((question: any) => {
    if (!question.position_id) {
      return true;
    }

    return question.position_id === employee.position_id;
  });

  const { data: period } = await supabase
    .from("evaluation_periods")
    .select("id, voting_from, voting_to")
    .eq("is_active", true)
    .single();

  if (!period) {
    return (
      <MessagePage
        title="Hodnotenie nie je dostupné"
        message="Nie je nastavené aktívne hodnotiace obdobie."
      />
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  const votingIsOpen =
    Boolean(period.voting_from) &&
    Boolean(period.voting_to) &&
    today >= period.voting_from &&
    today <= period.voting_to;

  if (!votingIsOpen) {
    return (
      <MessagePage
        title="Hodnotenie momentálne nie je aktívne"
        message={`Hlasovanie bude dostupné od ${formatDate(
          period.voting_from
        )} do ${formatDate(period.voting_to)}.`}
      />
    );
  }

  if (questions.length === 0) {
    return (
      <MessagePage
        title="Otázky nie sú nastavené"
        message="Pre úsek a pracovnú pozíciu zamestnanca zatiaľ nie sú nastavené hodnotiace otázky."
      />
    );
  }

  const departmentName =
    (employee.departments as any)?.name || "Úsek neuvedený";

  const positionName =
    (employee.positions as any)?.name || "Pracovná pozícia neuvedená";

  return (
    <main className="svida-page svida-page-bg">
      <div className="svida-form-container">
        <header className="mb-6 sm:mb-8">
          <div className="mb-5 flex justify-center sm:mb-6">
            <img
              src="/logo-svida.jpg"
              alt="Senior dom Svida"
              className="h-auto w-full max-w-[170px] object-contain sm:max-w-[210px]"
            />
          </div>

          <Link
  href="/hodnotenie"
  className="
    mb-5 inline-flex min-h-11 items-center
              text-sm font-medium text-gray-600
              transition hover:text-gray-900
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--svida-primary)]
              focus-visible:ring-offset-2
              sm:mb-6
            "
          >
            <span aria-hidden="true" className="mr-2">
              ←
            </span>
            Späť na moju pracovnú plochu
          </Link>

          <div className="svida-card min-w-0 rounded-2xl p-5 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:text-sm">
              Hodnotenie zamestnanca
            </p>

            <h1 className="mt-2 break-words text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
              {employee.first_name} {employee.last_name}
            </h1>

            <div className="mt-4 space-y-1">
              <p className="break-words text-sm font-medium text-gray-700 sm:text-base">
                {departmentName}
              </p>

              <p className="break-words text-sm text-gray-500 sm:text-base">
                {positionName}
              </p>
            </div>

            <div className="svida-info-box mt-5 rounded-xl p-4">
              <p className="text-sm leading-relaxed text-gray-700">
                Vyplňte všetky hodnotiace otázky. Hodnotenie sa uloží až po
                jeho odoslaní.
              </p>
            </div>
          </div>
        </header>

        <EvaluationForm
          employeeId={employee.id}
          periodId={period.id}
          questions={questions}
        />
      </div>
    </main>
  );
}