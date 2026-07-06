"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

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

  const totalQuestionSteps = groupedQuestions.length;
  const commentsStepIndex = totalQuestionSteps;
  const totalSteps = totalQuestionSteps + 1;
  const currentGroup = groupedQuestions[currentStep];

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progress =
    totalQuestions > 0
      ? Math.round((answeredCount / totalQuestions) * 100)
      : 0;

  function validateCurrentStep() {
    if (currentStep >= totalQuestionSteps || !currentGroup) {
      return true;
    }

    const missing = currentGroup.questions
      .filter((question) => !answers[question.id])
      .map((question) => question.id);

    if (missing.length > 0) {
      setMissingQuestionIds(missing);
      setValidationMessage("Vyplňte všetky otázky v tejto oblasti.");
      return false;
    }

    setMissingQuestionIds([]);
    setValidationMessage("");
    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) return;

    setCurrentStep((step) => Math.min(step + 1, totalSteps - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setValidationMessage("");
    setMissingQuestionIds([]);
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
      setCurrentStep(0);
      return;
    }

    const formData = new FormData(e.currentTarget);
    await handleSubmit(formData);
  }

  async function handleSubmit(formData: FormData) {
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

    const comments = [
      {
        type: "positive",
        text: String(formData.get("positive_comment") || "").trim(),
      },
      {
        type: "improvement",
        text: String(formData.get("improvement_comment") || "").trim(),
      },
      {
        type: "example",
        text: String(formData.get("example_comment") || "").trim(),
      },
    ]
      .filter((comment) => comment.text)
      .map((comment) => ({
        evaluation_id: evaluation.id,
        comment_type: comment.type,
        comment_text: comment.text,
      }));

    if (comments.length > 0) {
      const { error: commentsError } = await supabase
        .from("evaluation_comments")
        .insert(comments);

      if (commentsError) {
        alert(commentsError.message || "Komentáre sa nepodarilo uložiť.");
        setLoading(false);
        return;
      }
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

      {validationMessage && (
        <div className="rounded-xl border border-red-400 bg-red-50 p-5 text-red-800">
          <p className="text-xl font-bold">Formulár nie je úplne vyplnený</p>
          <p className="mt-2 text-base leading-relaxed">
            {validationMessage}
          </p>
        </div>
      )}

      {currentStep < totalQuestionSteps && currentGroup && (
        <section className="space-y-5">
          <div className="rounded-xl bg-gray-100 p-5">
            <p className="text-sm font-semibold text-gray-500">
              Oblasť {currentStep + 1} z {totalQuestionSteps}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {currentGroup.categoryName}
            </h2>

            <p className="mt-2 text-gray-600">
              Vyberte hodnotenie od 1 do 5 pri každej otázke.
            </p>
          </div>

          {currentGroup.questions.map((question, index) => {
            const isMissing = missingQuestionIds.includes(question.id);

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

                <h3 className="text-xl font-semibold mb-5">
                  {question.question} <span className="text-red-600">*</span>
                </h3>

                {isMissing && (
                  <p className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-base font-semibold text-red-700">
                    Túto otázku je potrebné vyplniť.
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
                        }}
                      />

                      <span className="flex h-14 items-center justify-center rounded-xl border border-gray-300 bg-white text-xl font-bold text-gray-700 transition peer-checked:border-[#df4a33] peer-checked:bg-[#df4a33] peer-checked:text-white hover:border-[#df4a33]">
                        {score}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {currentStep === commentsStepIndex && (
        <section className="space-y-5">
          <div className="rounded-xl bg-gray-100 p-5">
            <p className="text-sm font-semibold text-gray-500">
              Záverečný krok
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              Slovné hodnotenie
            </h2>

            <p className="mt-2 text-gray-600">
              Textové odpovede sú nepovinné.
            </p>
          </div>

          <div className="rounded-xl border p-6 bg-white">
            <label className="font-semibold block mb-3 text-lg">
              Čo tento zamestnanec robí podľa vás veľmi dobre?
            </label>

            <textarea
              name="positive_comment"
              rows={4}
              className="w-full border rounded-lg p-3 text-base"
              placeholder="Napíšte konkrétne silné stránky..."
            />
          </div>

          <div className="rounded-xl border p-6 bg-white">
            <label className="font-semibold block mb-3 text-lg">
              V čom by sa tento zamestnanec mohol zlepšiť?
            </label>

            <textarea
              name="improvement_comment"
              rows={4}
              className="w-full border rounded-lg p-3 text-base"
              placeholder="Napíšte návrhy na zlepšenie..."
            />
          </div>

          <div className="rounded-xl border p-6 bg-white">
            <label className="font-semibold block mb-3 text-lg">
              Máte konkrétny príklad situácie?
            </label>

            <textarea
              name="example_comment"
              rows={4}
              className="w-full border rounded-lg p-3 text-base"
              placeholder="Opíšte konkrétnu situáciu, ak ju poznáte..."
            />
          </div>
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

        {currentStep < commentsStepIndex ? (
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