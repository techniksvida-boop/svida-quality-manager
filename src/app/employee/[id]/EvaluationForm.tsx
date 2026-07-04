"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function EvaluationForm({
  employeeId,
  periodId,
  questions,
}: {
  employeeId: string;
  periodId: string;
  questions: any[];
}) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    const votingCodeId = localStorage.getItem("voting_code");

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

    await supabase.from("evaluation_answers").insert(answers);

    const positiveComment = String(formData.get("positive_comment") || "").trim();
const improvementComment = String(formData.get("improvement_comment") || "").trim();
const exampleComment = String(formData.get("example_comment") || "").trim();

const comments = [];

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
  await supabase.from("evaluation_comments").insert(comments);
}

    await supabase.from("voting_code_usage").insert({
      voting_code_id: votingCodeId,
      evaluated_employee_id: employeeId,
      evaluation_id: evaluation.id,
    });

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="mt-10 rounded-xl border p-6 bg-green-50">
        Hodnotenie bolo úspešne odoslané. Ďakujeme.
      </div>
    );
  }

  return (
  <form action={handleSubmit} className="mt-10 space-y-6">
    <div className="rounded-xl border bg-blue-50 p-6">
      <h2 className="text-xl font-semibold mb-4">
        Ako hodnotiť
      </h2>

      <div className="space-y-2 text-gray-700">
        <p><strong>1</strong> = vôbec nesúhlasím</p>
        <p><strong>2</strong> = skôr nesúhlasím</p>
        <p><strong>3</strong> = neviem posúdiť / čiastočne</p>
        <p><strong>4</strong> = skôr súhlasím</p>
        <p><strong>5</strong> = úplne súhlasím</p>
      </div>
    </div>

    {questions.map((question) => (
        <div key={question.id} className="rounded-xl border p-6 bg-white">
          <p className="text-sm text-gray-500 mb-2">
            {question.evaluation_categories?.name}
          </p>

          <h2 className="text-lg font-semibold mb-4">
            {question.question}
          </h2>

          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((score) => (
              <label key={score} className="flex items-center gap-2">
                <input type="radio" name={question.id} value={score} required />
                {score}
              </label>
            ))}
          </div>
        </div>
      ))}

     <div className="rounded-xl border p-6 bg-white">
  <label className="font-semibold block mb-3">
    Čo tento zamestnanec robí podľa vás veľmi dobre?
  </label>
  <textarea
    name="positive_comment"
    rows={4}
    className="w-full border rounded-lg p-3"
    placeholder="Napíšte konkrétne silné stránky..."
  />
</div>

<div className="rounded-xl border p-6 bg-white">
  <label className="font-semibold block mb-3">
    V čom by sa tento zamestnanec mohol zlepšiť?
  </label>
  <textarea
    name="improvement_comment"
    rows={4}
    className="w-full border rounded-lg p-3"
    placeholder="Napíšte návrhy na zlepšenie..."
  />
</div>

<div className="rounded-xl border p-6 bg-white">
  <label className="font-semibold block mb-3">
    Máte konkrétny príklad situácie, ktorý vystihuje jeho/jej prácu?
  </label>
  <textarea
    name="example_comment"
    rows={4}
    className="w-full border rounded-lg p-3"
    placeholder="Opíšte konkrétnu situáciu, ak ju poznáte..."
  />
</div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold disabled:opacity-50"
      >
        {loading ? "Odosielam..." : "Odoslať hodnotenie"}
      </button>
    </form>
  );
}