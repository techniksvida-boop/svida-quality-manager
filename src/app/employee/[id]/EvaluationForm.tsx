"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

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
  const [missingQuestionIds, setMissingQuestionIds] = useState<string[]>([]);
  const [validationMessage, setValidationMessage] = useState("");

  async function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const missing = questions
      .filter((question) => !formData.get(question.id))
      .map((question) => question.id);

    if (missing.length > 0) {
      setMissingQuestionIds(missing);
      setValidationMessage(
        "Zabudli ste vyplniť všetky povinné odpovede označené červenou hviezdičkou. Vráťte sa, prosím, k zvýrazneným otázkam a doplňte chýbajúce odpovede. Nevyplnené otázky sú označené červeným rámikom."
      );

      setTimeout(() => {
        document.getElementById(`question-${missing[0]}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);

      return;
    }

    setMissingQuestionIds([]);
    setValidationMessage("");

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

    const answers = questions.map((question) => ({
      evaluation_id: evaluation.id,
      question_id: question.id,
      score: Number(formData.get(question.id)),
    }));

    const { error: answersError } = await supabase
      .from("evaluation_answers")
      .insert(answers);

    if (answersError) {
      alert(answersError.message || "Odpovede sa nepodarilo uložiť.");
      setLoading(false);
      return;
    }

    const positiveComment = String(
      formData.get("positive_comment") || ""
    ).trim();

    const improvementComment = String(
      formData.get("improvement_comment") || ""
    ).trim();

    const exampleComment = String(
      formData.get("example_comment") || ""
    ).trim();

    const comments: {
      evaluation_id: string;
      comment_type: string;
      comment_text: string;
    }[] = [];

    if (positiveComment) {
      comments.push({
        evaluation_id: evaluation.id,
        comment_type: "positive",
        comment_text: positiveComment,
      });
    }

    if (improvementComment) {
      comments.push({
        evaluation_id: evaluation.id,
        comment_type: "improvement",
        comment_text: improvementComment,
      });
    }

    if (exampleComment) {
      comments.push({
        evaluation_id: evaluation.id,
        comment_type: "example",
        comment_text: exampleComment,
      });
    }

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
    <form onSubmit={handleFormSubmit} noValidate className="mt-10 space-y-6">
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
          Otázky označené červenou hviezdičkou{" "}
          <span className="font-bold text-red-600">*</span> sú povinné.
          Textové odpovede na konci formulára sú nepovinné.
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

      {validationMessage && (
        <div className="rounded-xl border border-red-400 bg-red-50 p-5 text-red-800">
          <p className="text-xl font-bold">Formulár nie je úplne vyplnený</p>
          <p className="mt-2 text-base leading-relaxed">
            {validationMessage}
          </p>
        </div>
      )}

      {questions.map((question) => {
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
            <p className="text-base text-gray-500 mb-2">
              {question.evaluation_categories?.name}
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
                    required
                    className="peer sr-only"
                    onChange={() => {
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

            <p className="mt-3 text-sm text-gray-500">
              Vyberte jednu odpoveď od 1 do 5.
            </p>
          </div>
        );
      })}

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
          Máte konkrétny príklad situácie, ktorý vystihuje jeho/jej prácu?
        </label>

        <textarea
          name="example_comment"
          rows={4}
          className="w-full border rounded-lg p-3 text-base"
          placeholder="Opíšte konkrétnu situáciu, ak ju poznáte..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl px-6 py-4 text-lg font-semibold svida-btn"
      >
        {loading ? "Odosielam..." : "Odoslať anonymné hodnotenie"}
      </button>
    </form>
  );
}