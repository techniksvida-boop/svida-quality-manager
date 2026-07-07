"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

const CATEGORY_STYLES: Record<
  string,
  {
    description: string;
    headerClass: string;
    cardClass: string;
    selectedClass: string;
    hoverClass: string;
  }
> = {
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

export default function EvaluationForm({
  employeeId,
  periodId,
  questions,
}: {
  employeeId: string;
  periodId: string;
  questions: any[];
}) {
  const router = useRouter();

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [missingQuestionIds, setMissingQuestionIds] = useState<string[]>([]);
  const [validationMessage, setValidationMessage] = useState("");
  const [errorStep, setErrorStep] = useState<number | null>(null);

  const groupedQuestions = useMemo(() => {
    const groups: Record<string, any[]> = {};

    questions.forEach((question) => {
      const categoryName =
        question.evaluation_categories?.name || "Ostatné otázky";

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

  function validateCurrentStep() {
    if (!currentGroup) {
      return true;
    }

    const missing = currentGroup.questions
      .filter((question) => !answers[question.id])
      .map((question) => question.id);

    if (missing.length > 0) {
      setMissingQuestionIds(missing);
      setValidationMessage("Vyplňte všetky otázky v tejto oblasti.");
      setErrorStep(currentStep);

      setTimeout(() => {
        document.getElementById(`question-${missing[0]}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);

      return false;
    }

    setMissingQuestionIds([]);
    setValidationMessage("");
    setErrorStep(null);
    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) return;

    setMissingQuestionIds([]);
    setValidationMessage("");
    setErrorStep(null);
    setCurrentStep((step) => Math.min(step + 1, totalSteps - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setMissingQuestionIds([]);
    setValidationMessage("");
    setErrorStep(null);
    setCurrentStep((step) => Math.max(step - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validateCurrentStep()) return;

    const missing = questions
      .filter((question) => !answers[question.id])
      .map((question) => question.id);

    if (missing.length > 0) {
      setMissingQuestionIds(missing);
      setValidationMessage("Nie sú vyplnené všetky povinné otázky.");
      setErrorStep(0);
      setCurrentStep(0);
      return;
    }

    await handleSubmit();
  }

  async function handleSubmit() {
    setLoading(true);

    const votingCodeId = localStorage.getItem("voting_code_id");

    if (!votingCodeId) {
      alert("Najprv zadajte anonymný hlasovací kód.");
      setLoading(false);
      return;
    }

    const { data: alreadyUsed } = await supabase
      .from("voting_code_usage")
      .select("id")
      .eq("voting_code_id", votingCodeId)
      .eq("evaluated_employee_id", employeeId)
      .maybeSingle();

    if (alreadyUsed) {
      alert("Tohto zamestnanca ste už hodnotili.");
      setLoading(false);
      return;
    }

    const { data: evaluation, error } = await supabase
      .from("evaluations")
      .insert({
        period_id: periodId,
        evaluated_employee_id: employeeId,
        evaluation_type: "peer",
        is_submitted: true,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !evaluation) {
      alert(error?.message || "Hodnotenie sa nepodarilo uložiť.");
      setLoading(false);
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
      setLoading(false);
      return;
    }

    const { error: usageError } = await supabase
      .from("voting_code_usage")
      .insert({
        voting_code_id: votingCodeId,
        evaluated_employee_id: employeeId,
        evaluation_id: evaluation.id,
      });

    if (usageError) {
      alert(usageError.message || "Použitie kódu sa nepodarilo uložiť.");
      setLoading(false);
      return;
    }

    const { count: totalEmployees } = await supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    const { count: completedEvaluations } = await supabase
      .from("voting_code_usage")
      .select("*", { count: "exact", head: true })
      .eq("voting_code_id", votingCodeId);

    setLoading(false);

    if (
      totalEmployees &&
      completedEvaluations &&
      completedEvaluations >= totalEmployees
    ) {
      router.push("/dakujeme");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-10 rounded-xl p-6 svida-anonymity-box">
        <h2 className="text-2xl font-bold svida-anonymity-title">
          Hodnotenie bolo úspešne odoslané.
        </h2>

        <p className="mt-3 text-lg leading-relaxed svida-anonymity-text">
          Ďakujeme. Tohto zamestnanca už pod týmto anonymným kódom nebude možné
          hodnotiť znova.
        </p>

        <a
          href="/hodnotenie"
          className="mt-6 inline-block rounded-xl px-5 py-3 font-semibold svida-btn"
        >
          Pokračovať na ďalších zamestnancov
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="mt-10 space-y-8">
      <div className="sticky top-0 z-20 rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <p className="font-semibold text-gray-800">
            Krok {currentStep + 1} z {totalSteps}
          </p>

          <p className="font-bold text-gray-900">
            {answeredCount} / {totalQuestions} otázok
          </p>
        </div>

        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-3 rounded-full bg-[#df4a33] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {currentStep === 0 && (
  <>
    <div className="rounded-xl p-6 svida-info-box">
      <h2 className="text-2xl font-bold mb-5 svida-info-title">
        Ako hodnotiť
      </h2>

      <div className="space-y-3 text-lg text-gray-700">
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

      <p className="mt-6 text-base text-gray-700">
        Všetky otázky sú povinné.
      </p>
    </div>

    <div className="rounded-xl p-6 svida-anonymity-box">
      <h2 className="text-2xl font-bold svida-anonymity-title mb-5">
        Anonymita hodnotenia
      </h2>

      <div className="space-y-4 text-lg leading-relaxed svida-anonymity-text">
        <p>
          Hodnotenie je anonymné. V systéme sa neeviduje meno hodnotiacej
          osoby.
        </p>

        <p>
          Anonymný kód slúži iba na overenie prístupu a na zabezpečenie toho,
          aby jeden zamestnanec nehodnotil toho istého pracovníka opakovane.
        </p>

        <p>
          Každý anonymný kód môže ohodnotiť konkrétneho zamestnanca iba raz.
        </p>
      </div>
    </div>
  </>
)}

      {validationMessage && errorStep === currentStep && (
        <div className="rounded-xl border border-red-400 bg-red-50 p-5 text-red-800">
          <p className="text-xl font-bold">Formulár nie je úplne vyplnený</p>
          <p className="mt-2 text-base leading-relaxed">
            {validationMessage}
          </p>
        </div>
      )}

      {currentGroup &&
        (() => {
          const categoryStyle =
            CATEGORY_STYLES[currentGroup.categoryName] || {
              description: "Hodnotenie danej oblasti.",
              headerClass: "bg-gray-100 border border-gray-200",
              cardClass: "border-gray-200 bg-white",
              selectedClass:
                "peer-checked:border-[#df4a33] peer-checked:bg-[#df4a33] peer-checked:text-white",
              hoverClass: "hover:border-[#df4a33]",
            };

          return (
            <section className="space-y-5">
              <div className={`rounded-2xl p-5 ${categoryStyle.headerClass}`}>
                <p className="text-sm font-semibold text-gray-500">
                  Oblasť {currentStep + 1} z {totalSteps}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                  {currentGroup.categoryName}
                </h2>

                <p className="mt-2 text-gray-600">
                  {categoryStyle.description}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Vyplnené v tejto oblasti:{" "}
                  {
                    currentGroup.questions.filter(
                      (question) => answers[question.id]
                    ).length
                  }{" "}
                  / {currentGroup.questions.length}
                </p>

                <p className="mt-2 text-gray-600">
                  Vyberte hodnotenie od 1 do 5 pri každej otázke.
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
                    className={`rounded-2xl border p-6 ${
                      isMissing
                        ? "border-red-500 bg-red-50"
                        : categoryStyle.cardClass
                    }`}
                  >
                    <p className="text-sm text-gray-500 mb-2">
                      Otázka {index + 1} z {currentGroup.questions.length}
                    </p>

                    <h2 className="text-xl font-semibold mb-5">
                      {question.question}{" "}
                      <span className="text-red-600">*</span>
                    </h2>

                    {isMissing && (
                      <p className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-base font-semibold text-red-700">
                        Túto povinnú otázku ste ešte nevyplnili.
                      </p>
                    )}

                    <div className="grid grid-cols-5 gap-3">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <label key={score} className="cursor-pointer">
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
                            className={`flex h-14 items-center justify-center rounded-xl border border-gray-300 bg-white text-xl font-bold text-gray-700 transition ${categoryStyle.selectedClass} ${categoryStyle.hoverClass}`}
                          >
                            {score}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-500">
                      <div className="text-left">
                        <strong>1</strong> = vôbec nesúhlasím
                      </div>
                      <div className="text-center">
                        <strong>3</strong> = neviem posúdiť / čiastočne
                      </div>
                      <div className="text-right">
                        <strong>5</strong> = úplne súhlasím
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          );
        })()}

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goBack}
          disabled={currentStep === 0 || loading}
          className="rounded-xl border px-6 py-4 text-lg font-semibold disabled:opacity-40"
        >
          Späť
        </button>

        {currentStep < totalSteps - 1 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={loading}
            className="rounded-xl px-6 py-4 text-lg font-semibold svida-btn"
          >
            Ďalej
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl px-6 py-4 text-lg font-semibold svida-btn"
          >
            {loading ? "Odosielam..." : "Odoslať anonymné hodnotenie"}
          </button>
        )}
      </div>
    </form>
  );
}