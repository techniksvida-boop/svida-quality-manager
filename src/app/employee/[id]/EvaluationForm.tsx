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

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const answers = questions.map((question) => ({
      evaluation_id: evaluation.id,
      question_id: question.id,
      score: Number(formData.get(question.id)),
    }));

    await supabase.from("evaluation_answers").insert(answers);

    const comment = String(formData.get("comment") || "").trim();

    if (comment) {
      await supabase.from("evaluation_comments").insert({
        evaluation_id: evaluation.id,
        comment_type: "general",
        comment_text: comment,
      });
    }

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
        <label className="font-semibold block mb-3">Slovný komentár</label>
        <textarea
          name="comment"
          rows={5}
          className="w-full border rounded-lg p-3"
          placeholder="Napíšte stručný komentár..."
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