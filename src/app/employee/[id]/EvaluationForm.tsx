"use client";

import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

type CategoryStyle = {
  description: string;
  headerClass: string;
  cardClass: string;
  selectedClass: string;
  hoverClass: string;
};

type EvaluationQuestion = {
  id: string;
  question: string;
  evaluation_categories?:
    | {
        name?: string | null;
      }
    | {
        name?: string | null;
      }[]
    | null;
};

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Profesionalita: {
    description: "Hodnotenie profesionálneho vystupovania a prístupu k práci.",
    headerClass: "bg-blue-50 border border-blue-200",
    cardClass: "border-blue-100 bg-blue-50/40",
    selectedClass:
      "peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white",
    hoverClass: "hover:border-blue-400",
  },
  "Kvalita a spoľahlivosť práce": {
    description:
      "Hodnotenie presnosti, spoľahlivosti a kvality vykonávanej práce.",
    headerClass: "bg-sky-50 border border-sky-200",
    cardClass: "border-sky-100 bg-sky-50/40",
    selectedClass:
      "peer-checked:border-sky-600 peer-checked:bg-sky-600 peer-checked:text-white",
    hoverClass: "hover:border-sky-400",
  },
  "Práca s klientom": {
    description:
      "Hodnotenie prístupu ku klientovi a kvality kontaktu s klientom.",
    headerClass: "bg-emerald-50 border border-emerald-200",
    cardClass: "border-emerald-100 bg-emerald-50/40",
    selectedClass:
      "peer-checked:border-emerald-600 peer-checked:bg-emerald-600 peer-checked:text-white",
    hoverClass: "hover:border-emerald-400",
  },
  "Komunikácia a spolupráca": {
    description:
      "Hodnotenie komunikácie, tímovej spolupráce a odovzdávania informácií.",
    headerClass: "bg-violet-50 border border-violet-200",
    cardClass: "border-violet-100 bg-violet-50/40",
    selectedClass:
      "peer-checked:border-violet-600 peer-checked:bg-violet-600 peer-checked:text-white",
    hoverClass: "hover:border-violet-400",
  },
  Komunikácia: {
    description:
      "Hodnotenie zrozumiteľnej, slušnej a profesionálnej komunikácie.",
    headerClass: "bg-fuchsia-50 border border-fuchsia-200",
    cardClass: "border-fuchsia-100 bg-fuchsia-50/40",
    selectedClass:
      "peer-checked:border-fuchsia-600 peer-checked:bg-fuchsia-600 peer-checked:text-white",
    hoverClass: "hover:border-fuchsia-400",
  },
  "Dodržiavanie pracovných a prevádzkových postupov": {
    description:
      "Hodnotenie dodržiavania interných pravidiel, postupov a organizácie práce.",
    headerClass: "bg-cyan-50 border border-cyan-200",
    cardClass: "border-cyan-100 bg-cyan-50/40",
    selectedClass:
      "peer-checked:border-cyan-600 peer-checked:bg-cyan-600 peer-checked:text-white",
    hoverClass: "hover:border-cyan-400",
  },
  "Bezpečnosť práce a hospodárnosť": {
    description:
      "Hodnotenie bezpečnosti, hygieny a hospodárneho nakladania s prostriedkami.",
    headerClass: "bg-amber-50 border border-amber-200",
    cardClass: "border-amber-100 bg-amber-50/40",
    selectedClass:
      "peer-checked:border-amber-600 peer-checked:bg-amber-600 peer-checked:text-white",
    hoverClass: "hover:border-amber-400",
  },
  Spolupráca: {
    description: "Hodnotenie spolupráce s kolegami a fungovania v tíme.",
    headerClass: "bg-indigo-50 border border-indigo-200",
    cardClass: "border-indigo-100 bg-indigo-50/40",
    selectedClass:
      "peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white",
    hoverClass: "hover:border-indigo-400",
  },
  "Profesionalita a zodpovednosť": {
    description: "Hodnotenie spoľahlivosti, zodpovednosti a kvality práce.",
    headerClass: "bg-blue-50 border border-blue-200",
    cardClass: "border-blue-100 bg-blue-50/40",
    selectedClass:
      "peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white",
    hoverClass: "hover:border-blue-400",
  },
  "Prístup ku klientovi": {
    description:
      "Hodnotenie rešpektu, dôstojnosti a primeraného prístupu ku klientovi.",
    headerClass: "bg-green-50 border border-green-200",
    cardClass: "border-green-100 bg-green-50/40",
    selectedClass:
      "peer-checked:border-green-600 peer-checked:bg-green-600 peer-checked:text-white",
    hoverClass: "hover:border-green-400",
  },
  "Spolupráca a komunikácia": {
    description:
      "Hodnotenie spolupráce, komunikácie a odovzdávania informácií.",
    headerClass: "bg-violet-50 border border-violet-200",
    cardClass: "border-violet-100 bg-violet-50/40",
    selectedClass:
      "peer-checked:border-violet-600 peer-checked:bg-violet-600 peer-checked:text-white",
    hoverClass: "hover:border-violet-400",
  },
  "Práca s dokumentáciou a IS Cygnus": {
    description: "Hodnotenie dokumentácie, administratívy a práce v IS Cygnus.",
    headerClass: "bg-cyan-50 border border-cyan-200",
    cardClass: "border-cyan-100 bg-cyan-50/40",
    selectedClass:
      "peer-checked:border-cyan-600 peer-checked:bg-cyan-600 peer-checked:text-white",
    hoverClass: "hover:border-cyan-400",
  },
  Rozvoj: {
    description:
      "Hodnotenie záujmu o odborný rast a využívanie nových poznatkov.",
    headerClass: "bg-slate-100 border border-slate-200",
    cardClass: "border-slate-200 bg-slate-50",
    selectedClass:
      "peer-checked:border-slate-700 peer-checked:bg-slate-700 peer-checked:text-white",
    hoverClass: "hover:border-slate-400",
  },
  "Individuálne plány a osobné ciele": {
    description:
      "Hodnotenie práce s individuálnymi plánmi a osobnými cieľmi klienta.",
    headerClass: "bg-pink-50 border border-pink-200",
    cardClass: "border-pink-100 bg-pink-50/40",
    selectedClass:
      "peer-checked:border-pink-600 peer-checked:bg-pink-600 peer-checked:text-white",
    hoverClass: "hover:border-pink-400",
  },
  "Prístup k PSS a prostrediu zariadenia": {
    description:
      "Hodnotenie rešpektu, dôstojnosti a prístupu ku klientom v prostredí zariadenia.",
    headerClass: "bg-emerald-50 border border-emerald-200",
    cardClass: "border-emerald-100 bg-emerald-50/40",
    selectedClass:
      "peer-checked:border-emerald-600 peer-checked:bg-emerald-600 peer-checked:text-white",
    hoverClass: "hover:border-emerald-400",
  },
  "Tímová spolupráca": {
    description:
      "Hodnotenie fungovania v tíme, podpory kolegov a spoločnej práce.",
    headerClass: "bg-indigo-50 border border-indigo-200",
    cardClass: "border-indigo-100 bg-indigo-50/40",
    selectedClass:
      "peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white",
    hoverClass: "hover:border-indigo-400",
  },
  "Rozvoj a zlepšovanie": {
    description:
      "Hodnotenie vzdelávania, spätnej väzby a zlepšovania kvality práce.",
    headerClass: "bg-slate-100 border border-slate-200",
    cardClass: "border-slate-200 bg-slate-50",
    selectedClass:
      "peer-checked:border-slate-700 peer-checked:bg-slate-700 peer-checked:text-white",
    hoverClass: "hover:border-slate-400",
  },
};

const DEFAULT_CATEGORY_STYLE: CategoryStyle = {
  description: "Hodnotenie danej oblasti.",
  headerClass: "bg-gray-100 border border-gray-200",
  cardClass: "border-gray-200 bg-white",
  selectedClass:
    "peer-checked:border-[#df4a33] peer-checked:bg-[#df4a33] peer-checked:text-white",
  hoverClass: "hover:border-[#df4a33]",
};

export default function EvaluationForm({
  employeeId,
  periodId,
  questions,
}: {
  employeeId: string;
  periodId: string;
  questions: EvaluationQuestion[];
}) {
  const searchParams = useSearchParams();
  const evaluationTypeCode = searchParams.get("type") || "peer";

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [checkingSubmission, setCheckingSubmission] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [missingQuestionIds, setMissingQuestionIds] = useState<string[]>([]);
  const [validationMessage, setValidationMessage] = useState("");
  const [errorStep, setErrorStep] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAlreadySubmitted() {
      try {
        const votingCodeId = localStorage.getItem("voting_code_id");

        if (!votingCodeId || !periodId) {
          return;
        }

        const { data: evaluationType } = await supabase
          .from("evaluation_types")
          .select("id")
          .eq("code", evaluationTypeCode)
          .single();

        if (!evaluationType) {
          return;
        }

        const { data: existingUsage } = await supabase
          .from("voting_code_usage")
          .select("id")
          .eq("voting_code_id", votingCodeId)
          .eq("evaluated_employee_id", employeeId)
          .eq("period_id", periodId)
          .eq("evaluation_type_id", evaluationType.id)
          .maybeSingle();

        if (isMounted && existingUsage) {
          setAlreadySubmitted(true);
        }
      } finally {
        if (isMounted) {
          setCheckingSubmission(false);
        }
      }
    }

    checkAlreadySubmitted();

    return () => {
      isMounted = false;
    };
  }, [employeeId, periodId, evaluationTypeCode]);

  const groupedQuestions = useMemo(() => {
    const groups: Record<string, EvaluationQuestion[]> = {};

    questions.forEach((question) => {
      const categoryRelation = question.evaluation_categories;

      const categoryName = Array.isArray(categoryRelation)
        ? categoryRelation[0]?.name || "Ostatné otázky"
        : categoryRelation?.name || "Ostatné otázky";

      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }

      groups[categoryName].push(question);
    });

    return Object.entries(groups).map(([categoryName, items]) => ({
      categoryName,
      questions: items,
    }));
  }, [questions]);

  const totalSteps = groupedQuestions.length;
  const currentGroup = groupedQuestions[currentStep];

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;

  const progress =
    totalQuestions > 0
      ? Math.round((answeredCount / totalQuestions) * 100)
      : 0;

  function clearValidation() {
    setMissingQuestionIds([]);
    setValidationMessage("");
    setErrorStep(null);
  }

  function validateCurrentStep() {
    if (!currentGroup) {
      return true;
    }

    const missing = currentGroup.questions
      .filter((question) => !answers[question.id])
      .map((question) => question.id);

    if (missing.length === 0) {
      clearValidation();
      return true;
    }

    setMissingQuestionIds(missing);
    setValidationMessage("Vyplňte všetky otázky v tejto oblasti.");
    setErrorStep(currentStep);

    window.setTimeout(() => {
      document.getElementById(`question-${missing[0]}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);

    return false;
  }

  function goNext() {
    if (!validateCurrentStep()) {
      return;
    }

    const nextStep = Math.min(currentStep + 1, totalSteps - 1);
    const firstQuestionId =
      groupedQuestions[nextStep]?.questions[0]?.id;

    setCurrentStep(nextStep);

    window.setTimeout(() => {
      if (!firstQuestionId) {
        return;
      }

      document
        .getElementById(`question-${firstQuestionId}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 200);
  }

  function goBack() {
    clearValidation();

    const previousStep = Math.max(currentStep - 1, 0);
    const firstQuestionId =
      groupedQuestions[previousStep]?.questions[0]?.id;

    setCurrentStep(previousStep);

    window.setTimeout(() => {
      if (!firstQuestionId) {
        return;
      }

      document
        .getElementById(`question-${firstQuestionId}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 200);
  }

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    const firstMissingQuestion = questions.find(
      (question) => !answers[question.id]
    );

    if (firstMissingQuestion) {
      const stepIndex = groupedQuestions.findIndex((group) =>
        group.questions.some(
          (question) => question.id === firstMissingQuestion.id
        )
      );

      const targetStep = stepIndex >= 0 ? stepIndex : 0;

      setMissingQuestionIds([firstMissingQuestion.id]);
      setValidationMessage("Nie sú vyplnené všetky povinné otázky.");
      setErrorStep(targetStep);
      setCurrentStep(targetStep);

      window.setTimeout(() => {
        document
          .getElementById(`question-${firstMissingQuestion.id}`)
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }, 200);

      return;
    }

    await handleSubmit();
  }

  async function handleSubmit() {
    setLoading(true);

    try {
      const votingCodeId = localStorage.getItem("voting_code_id");

      if (!votingCodeId) {
        alert("Najprv zadajte anonymný hlasovací kód.");
        return;
      }

      const { data: evaluationType } = await supabase
        .from("evaluation_types")
        .select("id, code")
        .eq("code", evaluationTypeCode)
        .single();

      if (!evaluationType) {
        alert("Typ hodnotenia sa nepodarilo načítať.");
        return;
      }

      const { data: alreadyUsed } = await supabase
        .from("voting_code_usage")
        .select("id")
        .eq("voting_code_id", votingCodeId)
        .eq("evaluated_employee_id", employeeId)
        .eq("period_id", periodId)
        .eq("evaluation_type_id", evaluationType.id)
        .maybeSingle();

      if (alreadyUsed) {
        alert("Toto hodnotenie ste už v aktuálnom období odoslali.");
        setAlreadySubmitted(true);
        return;
      }

      const { data: evaluation, error: evaluationError } = await supabase
        .from("evaluations")
        .insert({
          period_id: periodId,
          evaluated_employee_id: employeeId,
          evaluation_type: evaluationTypeCode,
          evaluation_type_id: evaluationType.id,
          is_submitted: true,
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (evaluationError || !evaluation) {
        alert(
          evaluationError?.message || "Hodnotenie sa nepodarilo uložiť."
        );
        return;
      }

      const answerRows = questions.map((question) => ({
        evaluation_id: evaluation.id,
        question_id: question.id,
        score: Number(answers[question.id]),
      }));

      const { error: answersError } = await supabase
        .from("evaluation_answers")
        .insert(answerRows);

      if (answersError) {
        alert(answersError.message || "Odpovede sa nepodarilo uložiť.");
        return;
      }

      const { error: usageError } = await supabase
        .from("voting_code_usage")
        .insert({
          voting_code_id: votingCodeId,
          evaluated_employee_id: employeeId,
          evaluation_id: evaluation.id,
          period_id: periodId,
          evaluation_type_id: evaluationType.id,
        });

      if (usageError) {
        alert(usageError.message || "Použitie kódu sa nepodarilo uložiť.");
        return;
      }

      setSent(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  if (checkingSubmission) {
    return (
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm sm:mt-8 sm:p-8">
        <p className="text-sm font-medium text-gray-600 sm:text-base">
          Overujem stav hodnotenia…
        </p>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-center shadow-sm sm:mt-8 sm:rounded-3xl sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl font-bold text-green-700 sm:h-16 sm:w-16 sm:text-3xl">
          ✓
        </div>

        <h2 className="mt-5 text-xl font-bold text-green-900 sm:text-2xl">
          Hodnotenie už bolo odoslané
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-green-800 sm:text-base">
          Toto hodnotenie ste už v aktuálnom hodnotiacom období odoslali.
        </p>

        <a
          href="/hodnotenie"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-green-600 px-5 py-3 text-center text-base font-semibold text-white transition hover:bg-green-700 sm:w-auto"
        >
          Späť na hodnotenie
        </a>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="mt-6 sm:mt-8">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:rounded-3xl sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700 sm:h-16 sm:w-16 sm:text-3xl">
            ✓
          </div>

          <div className="mt-5 text-center sm:mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 sm:text-sm">
              Hodnotenie odoslané
            </p>

            <h2 className="mt-2 text-2xl font-bold leading-tight text-emerald-950 sm:text-3xl">
              Ďakujeme za vyplnenie hodnotenia
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-emerald-900/80 sm:text-base lg:text-lg">
              Hodnotenie bolo úspešne uložené. Tohto zamestnanca už pod týmto
              anonymným kódom nie je možné hodnotiť opakovane.
            </p>
          </div>

          <div className="mt-7 grid gap-3 sm:mt-8 sm:gap-4 md:grid-cols-2">
            <a
              href="/hodnotenie"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-center text-base font-semibold text-white transition hover:bg-emerald-700 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-lg"
            >
              Pokračovať na ďalších zamestnancov
            </a>

            <a
              href="/start"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-300 bg-white px-5 py-3 text-center text-base font-semibold text-emerald-800 transition hover:bg-emerald-100 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-lg"
            >
              Späť na úvod
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!currentGroup || totalSteps === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center sm:mt-8 sm:p-8">
        <h2 className="text-xl font-bold text-amber-900">
          Otázky nie sú dostupné
        </h2>

        <p className="mt-3 text-sm text-amber-800 sm:text-base">
          Pre toto hodnotenie nie sú načítané žiadne otázky.
        </p>
      </div>
    );
  }

  const categoryStyle =
    CATEGORY_STYLES[currentGroup.categoryName] || DEFAULT_CATEGORY_STYLE;

  return (
    <form
      onSubmit={handleFormSubmit}
      noValidate
      className="mt-6 min-w-0 space-y-5 pb-24 sm:mt-8 sm:space-y-7 sm:pb-0"
    >
      <div className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/95 shadow-md backdrop-blur">
  <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-6 sm:py-4">
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm font-semibold text-gray-800 sm:text-base">
        Oblasť {currentStep + 1} z {totalSteps}
      </p>

      <p className="text-sm font-bold text-gray-900 sm:text-base">
        {answeredCount} z {totalQuestions} otázok
      </p>
    </div>

    <div
      className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 sm:h-3"
      role="progressbar"
      aria-label="Priebeh hodnotenia"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div
        className="h-full rounded-full bg-[#df4a33] transition-[width] duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>

    <div className="mt-1.5 flex items-center justify-between gap-3">
      <p className="truncate text-xs font-medium text-gray-600 sm:text-sm">
        {currentGroup.categoryName}
      </p>

      <p className="shrink-0 text-xs font-bold text-gray-600 sm:text-sm">
        {progress} %
      </p>
    </div>
  </div>
</div>

<div aria-hidden="true" className="h-[105px] sm:h-[120px]" />

      {currentStep === 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="svida-info-box rounded-2xl p-5 sm:p-6">
            <h2 className="svida-info-title text-xl font-bold sm:text-2xl">
              Ako hodnotiť
            </h2>

            <div className="mt-4 space-y-2.5 text-sm text-gray-700 sm:text-base">
              <p>
                <strong>1</strong> = vôbec nesúhlasím
              </p>
              <p>
                <strong>2</strong> = skôr nesúhlasím
              </p>
              <p>
                <strong>3</strong> = neviem posúdiť / čiastočne
              </p>
              <p>
                <strong>4</strong> = skôr súhlasím
              </p>
              <p>
                <strong>5</strong> = úplne súhlasím
              </p>
            </div>

            <p className="mt-5 text-sm font-medium text-gray-700 sm:text-base">
              Všetky otázky sú povinné.
            </p>
          </div>

          <div className="svida-anonymity-box rounded-2xl p-5 sm:p-6">
            <h2 className="svida-anonymity-title text-xl font-bold sm:text-2xl">
              Anonymita hodnotenia
            </h2>

            <div className="svida-anonymity-text mt-4 space-y-3 text-sm leading-relaxed sm:text-base">
              <p>
                Hodnotenie je anonymné. V systéme sa neeviduje meno hodnotiacej
                osoby.
              </p>

              <p>
                Anonymný kód slúži iba na overenie prístupu a na zabránenie
                opakovanému hodnoteniu toho istého pracovníka.
              </p>

              <p>
                Každý anonymný kód môže konkrétneho zamestnanca ohodnotiť iba
                raz.
              </p>
            </div>
          </div>
        </div>
      )}

      {validationMessage && errorStep === currentStep && (
        <div
          role="alert"
          className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900 sm:p-5"
        >
          <p className="text-base font-bold sm:text-lg">
            Formulár nie je úplne vyplnený
          </p>

          <p className="mt-2 text-sm leading-relaxed sm:text-base">
            {validationMessage}
          </p>
        </div>
      )}

      <section className="min-w-0 space-y-4 sm:space-y-5">
        <div className={`rounded-2xl p-4 sm:p-5 ${categoryStyle.headerClass}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:text-sm">
            Oblasť {currentStep + 1} z {totalSteps}
          </p>

          <h2 className="mt-1 break-words text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
            {currentGroup.categoryName}
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
            {categoryStyle.description}
          </p>
        </div>

        {currentGroup.questions.map((question, index) => {
          const isMissing =
            errorStep === currentStep &&
            missingQuestionIds.includes(question.id);

          return (
            <div
              id={`question-${question.id}`}
              key={question.id}
              className={`scroll-mt-36 rounded-2xl border p-4 transition sm:scroll-mt-40 sm:p-6 ${
                isMissing
                  ? "border-red-500 bg-red-50"
                  : categoryStyle.cardClass
              }`}
            >
              <p className="mb-2 text-xs font-medium text-gray-500 sm:text-sm">
                Otázka {index + 1} z {currentGroup.questions.length}
              </p>

              <h3 className="mb-4 break-words text-base font-semibold leading-relaxed text-gray-900 sm:mb-5 sm:text-xl">
                {question.question}
                <span className="ml-1 text-red-600" aria-hidden="true">
                  *
                </span>
              </h3>

              {isMissing && (
                <p className="mb-4 rounded-xl bg-red-100 px-3 py-2.5 text-sm font-semibold text-red-700 sm:px-4 sm:py-3 sm:text-base">
                  Túto povinnú otázku ste ešte nevyplnili.
                </p>
              )}

              <fieldset>
                <legend className="sr-only">
                  Vyberte hodnotenie od 1 do 5
                </legend>

                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <label
                      key={score}
                      className="min-w-0 cursor-pointer touch-manipulation"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={score}
                        checked={answers[question.id] === String(score)}
                        required
                        className="peer sr-only"
                        onChange={() => {
                          setAnswers((current) => ({
                            ...current,
                            [question.id]: String(score),
                          }));

                          setMissingQuestionIds((current) =>
                            current.filter((id) => id !== question.id)
                          );

                          setErrorStep(null);
                          setValidationMessage("");
                        }}
                      />

                      <span
                        className={`
                          flex min-h-12 w-full items-center justify-center
                          rounded-xl border border-gray-300 bg-white
                          text-base font-bold text-gray-700
                          transition
                          focus-within:ring-2
                          focus-within:ring-[#df4a33]
                          focus-within:ring-offset-2
                          sm:h-14 sm:text-xl
                          ${categoryStyle.selectedClass}
                          ${categoryStyle.hoverClass}
                        `}
                      >
                        {score}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-2 flex justify-between gap-3 text-[11px] text-gray-500 sm:text-xs">
                  <span>Nesúhlasím</span>
                  <span className="text-right">Súhlasím</span>
                </div>
              </fieldset>
            </div>
          );
        })}
      </section>

      <div className="sticky bottom-0 z-20 -mx-4 border-t border-gray-200 bg-white/95 px-4 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none">
        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <button
            type="button"
            onClick={goBack}
            disabled={currentStep === 0 || loading}
            className="
              inline-flex min-h-12 w-full items-center justify-center
              rounded-xl border border-gray-300 bg-white
              px-4 py-3 text-base font-semibold text-gray-800
              transition hover:bg-gray-50
              disabled:cursor-not-allowed disabled:opacity-40
              sm:w-auto sm:px-6 sm:text-lg
            "
          >
            Späť
          </button>

          {currentStep < totalSteps - 1 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={loading}
              className="
                svida-btn inline-flex min-h-12 w-full items-center
                justify-center rounded-xl px-4 py-3
                text-base font-semibold
                disabled:cursor-not-allowed disabled:opacity-50
                sm:w-auto sm:px-6 sm:text-lg
              "
            >
              Ďalej
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="
                svida-btn col-span-2 inline-flex min-h-12 w-full
                items-center justify-center rounded-xl px-4 py-3
                text-center text-base font-semibold
                disabled:cursor-not-allowed disabled:opacity-50
                sm:col-auto sm:w-auto sm:px-6 sm:text-lg
              "
            >
              {loading ? "Odosielam…" : "Odoslať anonymné hodnotenie"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}