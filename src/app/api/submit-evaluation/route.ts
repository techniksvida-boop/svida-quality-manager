import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type SubmittedAnswer = {
  questionId: string;
  score: number;
};

type SubmitEvaluationBody = {
  evaluatedEmployeeId?: string;
  periodId?: string;
  evaluationTypeCode?: string;
  answers?: SubmittedAnswer[];
};

function hashSessionToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function jsonError(
  message: string,
  status: number
) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
    }
  );
}

export async function POST(
  request: NextRequest
) {
  try {
    const votingCodeId =
      request.cookies.get(
        "voting_code_id"
      )?.value || "";

    const sessionToken =
      request.cookies.get(
        "voting_session_token"
      )?.value || "";

    const votingEmployeeId =
      request.cookies.get(
        "voting_employee_id"
      )?.value || "";

    if (
      !votingCodeId ||
      !sessionToken ||
      !votingEmployeeId
    ) {
      return jsonError(
        "Hlasovacia relácia nie je platná. Prihláste sa znova.",
        401
      );
    }

    const sessionTokenHash =
      hashSessionToken(sessionToken);

    const {
      data: sessionValid,
      error: sessionError,
    } = await supabaseAdmin.rpc(
      "refresh_voting_session",
      {
        p_voting_code_id:
          votingCodeId,
        p_session_token_hash:
          sessionTokenHash,
      }
    );

    if (
      sessionError ||
      sessionValid !== true
    ) {
      return jsonError(
        "Hlasovacia relácia vypršala alebo bola ukončená.",
        401
      );
    }

    const body =
      (await request.json()) as SubmitEvaluationBody;

    const evaluatedEmployeeId =
      typeof body.evaluatedEmployeeId ===
      "string"
        ? body.evaluatedEmployeeId
        : "";

    const periodId =
      typeof body.periodId === "string"
        ? body.periodId
        : "";

    const evaluationTypeCode =
      typeof body.evaluationTypeCode ===
      "string"
        ? body.evaluationTypeCode
        : "";

    const submittedAnswers =
      Array.isArray(body.answers)
        ? body.answers
        : [];

    if (
      !evaluatedEmployeeId ||
      !periodId ||
      !evaluationTypeCode ||
      submittedAnswers.length === 0
    ) {
      return jsonError(
        "Odoslané hodnotenie neobsahuje všetky potrebné údaje.",
        400
      );
    }

    if (
      ![
        "peer",
        "self",
        "manager",
      ].includes(
        evaluationTypeCode
      )
    ) {
      return jsonError(
        "Typ hodnotenia nie je povolený.",
        400
      );
    }

    const normalizedAnswers =
      submittedAnswers.map((answer) => ({
        questionId:
          typeof answer?.questionId ===
          "string"
            ? answer.questionId
            : "",
        score: Number(answer?.score),
      }));

    const invalidAnswer =
      normalizedAnswers.some(
        (answer) =>
          !answer.questionId ||
          !Number.isInteger(
            answer.score
          ) ||
          answer.score < 1 ||
          answer.score > 5
      );

    if (invalidAnswer) {
      return jsonError(
        "Každá odpoveď musí obsahovať platnú otázku a hodnotenie od 1 do 5.",
        400
      );
    }

    const submittedQuestionIds =
      normalizedAnswers.map(
        (answer) => answer.questionId
      );

    if (
      new Set(
        submittedQuestionIds
      ).size !==
      submittedQuestionIds.length
    ) {
      return jsonError(
        "Niektorá otázka bola odoslaná viackrát.",
        400
      );
    }

    const {
      data: votingCode,
      error: votingCodeError,
    } = await supabaseAdmin
      .from("voting_codes")
      .select(
        "id, employee_id, is_active"
      )
      .eq("id", votingCodeId)
      .eq("is_active", true)
      .single();

    if (
      votingCodeError ||
      !votingCode ||
      !votingCode.employee_id ||
      votingCode.employee_id !==
        votingEmployeeId
    ) {
      return jsonError(
        "Hodnotiaci kód nie je platný.",
        401
      );
    }

    const {
      data: period,
      error: periodError,
    } = await supabaseAdmin
      .from("evaluation_periods")
      .select(
        "id, is_active, voting_from, voting_to"
      )
      .eq("id", periodId)
      .eq("is_active", true)
      .single();

    if (
      periodError ||
      !period
    ) {
      return jsonError(
        "Hodnotiace obdobie nie je aktívne.",
        400
      );
    }

    const today =
      new Date()
        .toISOString()
        .slice(0, 10);

    const votingIsOpen =
      Boolean(
        period.voting_from
      ) &&
      Boolean(
        period.voting_to
      ) &&
      today >=
        period.voting_from &&
      today <=
        period.voting_to;

    if (!votingIsOpen) {
      return jsonError(
        "Hlasovanie momentálne nie je otvorené.",
        400
      );
    }

    const {
      data: evaluationType,
      error:
        evaluationTypeError,
    } = await supabaseAdmin
      .from("evaluation_types")
      .select(
        "id, code, is_active"
      )
      .eq(
        "code",
        evaluationTypeCode
      )
      .eq("is_active", true)
      .single();

    if (
      evaluationTypeError ||
      !evaluationType
    ) {
      return jsonError(
        "Typ hodnotenia sa nepodarilo overiť.",
        400
      );
    }

    const {
      data: evaluatedEmployee,
      error: employeeError,
    } = await supabaseAdmin
      .from("employees")
      .select(
        "id, department_id, position_id, manager_id, is_active"
      )
      .eq(
        "id",
        evaluatedEmployeeId
      )
      .eq("is_active", true)
      .single();

    if (
      employeeError ||
      !evaluatedEmployee
    ) {
      return jsonError(
        "Hodnotený zamestnanec nie je dostupný.",
        404
      );
    }

    if (
      evaluationTypeCode ===
        "self" &&
      evaluatedEmployeeId !==
        votingEmployeeId
    ) {
      return jsonError(
        "Sebahodnotením môžete hodnotiť iba vlastnú prácu.",
        403
      );
    }

    if (
      evaluationTypeCode ===
        "peer" &&
      evaluatedEmployeeId ===
        votingEmployeeId
    ) {
      return jsonError(
        "Vlastnú prácu hodnotíte cez sebahodnotenie.",
        403
      );
    }

    if (
      evaluationTypeCode ===
        "manager" &&
      evaluatedEmployee.manager_id !==
        votingEmployeeId
    ) {
      return jsonError(
        "Vedúci môže týmto spôsobom hodnotiť iba svojich priamych podriadených.",
        403
      );
    }

    const {
      data: allQuestions,
      error: questionsError,
    } = await supabaseAdmin
      .from(
        "evaluation_questions"
      )
      .select(
        "id, position_id"
      )
      .eq("is_active", true)
      .eq(
        "department_id",
        evaluatedEmployee.department_id
      );

    if (questionsError) {
      return jsonError(
        "Hodnotiace otázky sa nepodarilo overiť.",
        500
      );
    }

    const allowedQuestions =
      (allQuestions || []).filter(
        (question) =>
          !question.position_id ||
          question.position_id ===
            evaluatedEmployee.position_id
      );

    const allowedQuestionIds =
      allowedQuestions.map(
        (question) => question.id
      );

    if (
      allowedQuestionIds.length ===
      0
    ) {
      return jsonError(
        "Pre zamestnanca nie sú nastavené hodnotiace otázky.",
        400
      );
    }

    const hasWrongQuestion =
      submittedQuestionIds.some(
        (questionId) =>
          !allowedQuestionIds.includes(
            questionId
          )
      );

    const hasMissingQuestion =
      allowedQuestionIds.some(
        (questionId) =>
          !submittedQuestionIds.includes(
            questionId
          )
      );

    if (
      hasWrongQuestion ||
      hasMissingQuestion ||
      submittedQuestionIds.length !==
        allowedQuestionIds.length
    ) {
      return jsonError(
        "Odoslané odpovede nezodpovedajú povinným otázkam formulára.",
        400
      );
    }

    const answersForDatabase =
      normalizedAnswers.map(
        (answer) => ({
          question_id:
            answer.questionId,
          score: answer.score,
        })
      );

    const {
      data: evaluationId,
      error: transactionError,
    } = await supabaseAdmin.rpc(
      "submit_evaluation_transaction",
      {
        p_voting_code_id:
          votingCodeId,
        p_evaluated_employee_id:
          evaluatedEmployeeId,
        p_period_id: periodId,
        p_evaluation_type_id:
          evaluationType.id,
        p_evaluation_type_code:
          evaluationTypeCode,
        p_answers:
          answersForDatabase,
      }
    );

    if (transactionError) {
      console.error(
        "Databázová transakcia hodnotenia zlyhala:",
        transactionError
      );

      if (
        transactionError.message?.includes(
          "DUPLICATE_EVALUATION"
        ) ||
        transactionError.code ===
          "23505"
      ) {
        return jsonError(
          "Toto hodnotenie už bolo v aktuálnom období odoslané.",
          409
        );
      }

      return jsonError(
        "Hodnotenie sa nepodarilo uložiť.",
        500
      );
    }

    if (!evaluationId) {
      return jsonError(
        "Databáza nevrátila identifikátor hodnotenia.",
        500
      );
    }

    return NextResponse.json({
      success: true,
      evaluationId,
    });
  } catch (error) {
    console.error(
      "Serverové odoslanie hodnotenia zlyhalo:",
      error
    );

    return jsonError(
      "Hodnotenie sa nepodarilo bezpečne odoslať.",
      500
    );
  }
}