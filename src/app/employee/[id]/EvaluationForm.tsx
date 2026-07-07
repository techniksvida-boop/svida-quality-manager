"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

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
  const [isNavigating, setIsNavigating] = useState(false);

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

useEffect(() => {
  setMissingQuestionIds([]);
  setValidationMessage("");
  setErrorStep(null);
  setIsNavigating(false);
}, [currentStep]);

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
  setIsNavigating(true);
  setMissingQuestionIds([]);
  setValidationMessage("");
  setErrorStep(null);
  setCurrentStep((step) => Math.max(step - 1, 0));

  requestAnimationFrame(() => {
    setIsNavigating(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
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

      {!isNavigating && validationMessage && errorStep === currentStep && (
        <div className="rounded-xl border border-red-400 bg-red-50 p-5 text-red-800">
          <p className="text-xl font-bold">Formulár nie je úplne vyplnený</p>
          <p className="mt-2 text-base leading-relaxed">
            {validationMessage}
          </p>
        </div>
      )}

      {currentGroup && (
        <section className="space-y-5">
          <div className="rounded-xl bg-gray-100 p-5">
            <p className="text-sm font-semibold text-gray-500">
              Oblasť {currentStep + 1} z {totalSteps}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {currentGroup.categoryName}
            </h2>

            <p className="mt-2 text-gray-600">
              Vyberte hodnotenie od 1 do 5 pri každej otázke.
            </p>
          </div>

          {currentGroup.questions.map((question, index) => {
            const isMissing =
  !isNavigating &&
  errorStep === currentStep &&
  missingQuestionIds.includes(question.id);

            return (
              <div
                id={`question-${question.id}`}
                key={question.id}
                className={`rounded-xl border p-6 ${
                  isMissing
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="text-sm text-gray-500 mb-2">
                  Otázka {index + 1} z {currentGroup.questions.length}
                </p>

                <h2 className="text-xl font-semibold mb-5">
                  {question.question} <span className="text-red-600">*</span>
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

                      <span className="flex h-14 items-center justify-center rounded-xl border border-gray-300 bg-white text-xl font-bold text-gray-700 transition peer-checked:border-[#df4a33] peer-checked:bg-[#df4a33] peer-checked:text-white hover:border-[#df4a33]">
                        {score}
                      </span>
                    </label>
                  ))}
                </div>

                <p className="mt-3 text-sm text-gray-500">
                  Vyberte jednu odpoveď od 1 do 5.
                </p>
              </div>
            );
          })}
        </section>
      )}

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