export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import PrintButton from "./PrintButton";

type Recommendation = {
  categoryName: string;
  average: number;
  priority: string;
  summary: string;
  recommendedForm: string;
  suggestedGoal: string;
  verificationMethod: string;
};

function getPriority(average: number) {
  if (average <= 3) {
    return "Vysoká priorita";
  }

  if (average < 4.1) {
    return "Stredná priorita";
  }

  return "Nízka priorita";
}

function getScoreLevel(score: number | null) {
  if (score === null) {
    return {
      label: "Bez hodnotenia",
      cardClass: "bg-gray-50 border-gray-200",
      valueClass: "text-gray-500",
      badgeClass: "bg-gray-100 text-gray-700",
    };
  }

  if (score >= 4.1) {
    return {
      label: "Dobrá úroveň",
      cardClass: "bg-green-50 border-green-200",
      valueClass: "text-green-700",
      badgeClass: "bg-green-100 text-green-800",
    };
  }

  if (score > 3) {
    return {
      label: "Oblasť na sledovanie",
      cardClass: "bg-orange-50 border-orange-200",
      valueClass: "text-orange-700",
      badgeClass: "bg-orange-100 text-orange-800",
    };
  }

  return {
    label: "Riziková oblasť",
    cardClass: "bg-red-50 border-red-200",
    valueClass: "text-red-700",
    badgeClass: "bg-red-100 text-red-800",
  };
}

function getPositionName(employee: any) {
  if (Array.isArray(employee.positions)) {
    return employee.positions[0]?.name || "";
  }

  return employee.positions?.name || "";
}

function getRecommendationByCategory(
  categoryName: string,
  average: number
): Recommendation {
  const normalized = categoryName.toLowerCase();
  const priority = getPriority(average);

  if (
    normalized.includes("dokument") ||
    normalized.includes("záznam") ||
    normalized.includes("cygnus") ||
    normalized.includes("individu")
  ) {
    return {
      categoryName,
      average,
      priority,
      summary:
        "Zamestnanec dosiahol nižšie hodnotenie v oblasti dokumentácie, vedenia záznamov alebo práce s IS Cygnus. Odporúča sa zamerať individuálny plán ďalšieho vzdelávania na kvalitu, pravidelnosť a vecnosť zápisov, správne vedenie záznamov o práci s prijímateľom sociálnej služby a prepojenie dokumentácie s individuálnymi cieľmi PSS.",
      recommendedForm:
        "Interné metodické zaškolenie, praktický nácvik práce s IS Cygnus, kontrola vzorových zápisov a následná spätná väzba od vedúceho zamestnanca.",
      suggestedGoal:
        "Do nasledujúceho hodnotiaceho obdobia zlepšiť úplnosť, konkrétnosť a pravidelnosť záznamov v IS Cygnus tak, aby dokumentácia preukázateľne zachytávala priebeh, výsledky a dopad práce s PSS.",
      verificationMethod:
        "Vedúci úseku v spolupráci so zamestnancom vyhodnotí účinnosť a účelnosť prijatého opatrenia kontrolou vybraných záznamov v IS Cygnus a súvisiacej dokumentácie PSS. Overí sa najmä úplnosť, vecnosť, pravidelnosť zápisov, súlad s individuálnymi potrebami a cieľmi PSS a použiteľnosť záznamov ako odborného pracovného výstupu. Výsledok overenia sa zaznamená v hodnotiacom zázname alebo v podklade k individuálnemu plánu ďalšieho vzdelávania.",
    };
  }

  if (
    normalized.includes("komunik") ||
    normalized.includes("klient") ||
    normalized.includes("prijímateľ") ||
    normalized.includes("pss") ||
    normalized.includes("empat") ||
    normalized.includes("dôstoj")
  ) {
    return {
      categoryName,
      average,
      priority,
      summary:
        "Zamestnanec dosiahol nižšie hodnotenie v oblasti komunikácie a prístupu k prijímateľovi sociálnej služby. Odporúča sa zamerať individuálny plán ďalšieho vzdelávania na empatickú komunikáciu, individuálny prístup, rešpektovanie dôstojnosti PSS a zvládanie náročných komunikačných situácií.",
      recommendedForm:
        "Vzdelávanie v oblasti komunikácie s klientom, modelové situácie, metodické vedenie a podľa potreby skupinová alebo individuálna supervízia.",
      suggestedGoal:
        "Do nasledujúceho hodnotiaceho obdobia posilniť partnerský, rešpektujúci a individuálny prístup v každodennej komunikácii s PSS.",
      verificationMethod:
        "Vedúci úseku v spolupráci so zamestnancom vyhodnotí prenos do praxe prostredníctvom hodnotiaceho rozhovoru, spätnej väzby z pracovného prostredia a posúdenia konkrétnych situácií pri práci s PSS. Overí sa najmä rešpektujúca komunikácia, individuálny prístup, dôstojnosť PSS a schopnosť zamestnanca používať získané poznatky v každodennej praxi.",
    };
  }

  if (
    normalized.includes("tím") ||
    normalized.includes("spolupr") ||
    normalized.includes("kolekt") ||
    normalized.includes("kolega") ||
    normalized.includes("inform")
  ) {
    return {
      categoryName,
      average,
      priority,
      summary:
        "Zamestnanec dosiahol nižšie hodnotenie v oblasti tímovej spolupráce a odovzdávania informácií. Odporúča sa zamerať individuálny plán ďalšieho vzdelávania na tímovú komunikáciu, spoluprácu medzi úsekmi, konštruktívne riešenie problémov a zodpovedné odovzdávanie informácií.",
      recommendedForm:
        "Interné školenie alebo pracovné stretnutie k tímovej spolupráci, pravidlám komunikácie a odovzdávania informácií; pri pretrvávajúcich ťažkostiach skupinová supervízia.",
      suggestedGoal:
        "Do nasledujúceho hodnotiaceho obdobia zlepšiť spoluprácu s kolegami, včasné odovzdávanie dôležitých informácií a aktívne riešenie pracovných situácií v tíme.",
      verificationMethod:
        "Vedúci úseku vyhodnotí účelnosť prijatého opatrenia podľa reálneho pracovného výkonu zamestnanca, najmä podľa kvality spolupráce v tíme, včasnosti a úplnosti odovzdávania informácií, schopnosti riešiť pracovné situácie a spätnej väzby od nadriadeného alebo kolegov. Výsledok sa použije ako podklad pre ďalšie hodnotenie pracovného výkonu.",
    };
  }

  if (
    normalized.includes("odborn") ||
    normalized.includes("profesion") ||
    normalized.includes("štandard") ||
    normalized.includes("kvalit") ||
    normalized.includes("etick") ||
    normalized.includes("postup")
  ) {
    return {
      categoryName,
      average,
      priority,
      summary:
        "Zamestnanec dosiahol nižšie hodnotenie v oblasti odbornosti, profesionality alebo dodržiavania štandardov kvality. Odporúča sa zamerať individuálny plán ďalšieho vzdelávania na odborné postupy, etický kódex, štandardy kvality a povinnosti odborného zamestnanca pri poskytovaní sociálnej služby.",
      recommendedForm:
        "Vzdelávanie k štandardom kvality, interné metodické usmernenie, oboznámenie s odbornými postupmi a následné overenie prenosu poznatkov do praxe.",
      suggestedGoal:
        "Do nasledujúceho hodnotiaceho obdobia posilniť odborné a profesionálne vykonávanie pracovných činností v súlade so štandardmi kvality a internými postupmi zariadenia.",
      verificationMethod:
        "Vedúci úseku alebo manažér kvality overí prenos do praxe porovnaním pracovného výkonu zamestnanca s kartou pracovného miesta, internými postupmi, etickými požiadavkami a štandardmi kvality. Sleduje sa, či zamestnanec získané poznatky používa pri výkone práce a či sa premietli do kvality jeho výstupov. Výsledok overenia sa zaznamená ako podklad pre hodnotenie pracovného výkonu a ďalší plán vzdelávania.",
    };
  }

  if (
    normalized.includes("rehabilit") ||
    normalized.includes("aktiv") ||
    normalized.includes("cieľ") ||
    normalized.includes("plán") ||
    normalized.includes("voľnočas") ||
    normalized.includes("schopnost")
  ) {
    return {
      categoryName,
      average,
      priority,
      summary:
        "Zamestnanec dosiahol nižšie hodnotenie v oblasti sociálnej rehabilitácie, aktivizácie alebo práce s cieľmi prijímateľa sociálnej služby. Odporúča sa zamerať individuálny plán ďalšieho vzdelávania na aktivizáciu PSS, sociálnu rehabilitáciu, individuálne plánovanie a vyhodnocovanie osobných cieľov.",
      recommendedForm:
        "Metodické vedenie k individuálnemu plánovaniu, školenie k sociálnej rehabilitácii a praktické príklady práce s cieľmi PSS.",
      suggestedGoal:
        "Do nasledujúceho hodnotiaceho obdobia zlepšiť schopnosť plánovať, realizovať a vyhodnocovať aktivity tak, aby boli preukázateľne prepojené s individuálnymi potrebami a cieľmi PSS.",
      verificationMethod:
        "Vedúci úseku v spolupráci so zamestnancom vyhodnotí prenos do praxe kontrolou prepojenia realizovaných aktivít s individuálnymi potrebami a cieľmi PSS, posúdením záznamov v dokumentácii a vyhodnotením konkrétnych pracovných výstupov. Overí sa, či aktivity podporujú schopnosti, samostatnosť, aktivizáciu a kvalitu života PSS.",
    };
  }

  return {
    categoryName,
    average,
    priority,
    summary:
      "Zamestnanec dosiahol nižšie hodnotenie v tejto pracovnej oblasti. Odporúča sa zaradiť túto oblasť do individuálneho plánu ďalšieho vzdelávania a počas hodnotiaceho rozhovoru presnejšie určiť príčinu nižšieho hodnotenia.",
    recommendedForm:
      "Individuálny hodnotiaci rozhovor, metodické vedenie najbližším nadriadeným a následné vyhodnotenie zlepšenia v ďalšom období.",
    suggestedGoal:
      "Do nasledujúceho hodnotiaceho obdobia prijať konkrétne opatrenie na zlepšenie tejto pracovnej oblasti a overiť jeho účinnosť v praxi.",
    verificationMethod:
      "Vedúci úseku v spolupráci so zamestnancom vyhodnotí účinnosť a účelnosť prijatého opatrenia pri najbližšom hodnotiacom rozhovore. Overenie sa vykoná porovnaním dohodnutého cieľa s reálnym pracovným výkonom, konkrétnymi pracovnými výstupmi a spätnou väzbou nadriadeného. Výsledok sa použije ako vstup do ďalšieho individuálneho plánu vzdelávania alebo ročného plánu vzdelávania.",
  };
}

function createTrainingRecommendations(
  categoryStats: Record<
    string,
    {
      total: number;
      count: number;
      average: number;
    }
  >
) {
  return Object.entries(categoryStats)
    .map(([categoryName, stats]) =>
      getRecommendationByCategory(categoryName, stats.average)
    )
    .filter((recommendation) => recommendation.average < 4.1)
    .sort((a, b) => a.average - b.average)
    .slice(0, 2);
}

function getCommentsByType(comments: any[], type: string) {
  return comments.filter((comment) => comment.comment_type === type);
}

function getCategorySummary(
  employeesWithStats: any[]
): {
  categoryName: string;
  average: number;
  count: number;
}[] {
  const summary: Record<
    string,
    {
      total: number;
      count: number;
    }
  > = {};

  employeesWithStats.forEach((employee) => {
    Object.entries(employee.categoryStats).forEach(
      ([categoryName, stats]: any) => {
        if (!summary[categoryName]) {
          summary[categoryName] = {
            total: 0,
            count: 0,
          };
        }

        summary[categoryName].total += stats.total;
        summary[categoryName].count += stats.count;
      }
    );
  });

  return Object.entries(summary)
    .map(([categoryName, stats]) => ({
      categoryName,
      average: stats.count > 0 ? stats.total / stats.count : 0,
      count: stats.count,
    }))
    .sort((a, b) => b.average - a.average);
}

function getTrainingTopic(categoryName: string) {
  const normalized = categoryName.toLowerCase();

  if (
    normalized.includes("dokument") ||
    normalized.includes("záznam") ||
    normalized.includes("cygnus") ||
    normalized.includes("individu")
  ) {
    return "Práca s dokumentáciou, IS Cygnus a individuálnymi plánmi";
  }

  if (
    normalized.includes("komunik") ||
    normalized.includes("klient") ||
    normalized.includes("prijímateľ") ||
    normalized.includes("pss") ||
    normalized.includes("empat") ||
    normalized.includes("dôstoj")
  ) {
    return "Komunikácia s prijímateľom sociálnej služby a individuálny prístup";
  }

  if (
    normalized.includes("tím") ||
    normalized.includes("spolupr") ||
    normalized.includes("kolekt") ||
    normalized.includes("kolega") ||
    normalized.includes("inform")
  ) {
    return "Tímová spolupráca a odovzdávanie informácií";
  }

  if (
    normalized.includes("odborn") ||
    normalized.includes("profesion") ||
    normalized.includes("štandard") ||
    normalized.includes("kvalit") ||
    normalized.includes("etick") ||
    normalized.includes("postup")
  ) {
    return "Štandardy kvality, odbornosť a profesionálny výkon práce";
  }

  if (
    normalized.includes("rehabilit") ||
    normalized.includes("aktiv") ||
    normalized.includes("cieľ") ||
    normalized.includes("plán") ||
    normalized.includes("voľnočas") ||
    normalized.includes("schopnost")
  ) {
    return "Sociálna rehabilitácia, aktivizácia a práca s cieľmi PSS";
  }

  return categoryName;
}

function getTrainingTopicSummary(employeesWithStats: any[]) {
  const topics: Record<
    string,
    {
      count: number;
      employees: string[];
    }
  > = {};

  employeesWithStats.forEach((employee) => {
    Object.entries(employee.categoryStats).forEach(
      ([categoryName, stats]: any) => {
        if (stats.average >= 4.1) {
          return;
        }

        const topic = getTrainingTopic(categoryName);

        if (!topics[topic]) {
          topics[topic] = {
            count: 0,
            employees: [],
          };
        }

        topics[topic].count += 1;
        topics[topic].employees.push(
          `${employee.first_name} ${employee.last_name}`
        );
      }
    );
  });

  return Object.entries(topics)
    .map(([topicName, data]) => ({
      topicName,
      count: data.count,
      employees: data.employees,
    }))
    .sort((a, b) => b.count - a.count);
}

export default async function AdminPage() {
  const { data: employees } = await supabase
    .from("employees")
    .select("id, first_name, last_name, positions(name)")
    .eq("is_active", true)
    .order("last_name");

  const { data: evaluations } = await supabase
    .from("evaluations")
    .select("id, evaluated_employee_id, submitted_at")
    .eq("is_submitted", true);

  const { data: questions } = await supabase
    .from("evaluation_questions")
    .select("id, question, evaluation_categories(name)")
    .eq("is_active", true);

  const { data: answers } = await supabase
    .from("evaluation_answers")
    .select("evaluation_id, question_id, score");

  const { data: comments } = await supabase
    .from("evaluation_comments")
    .select("evaluation_id, comment_type, comment_text");

  const { count: totalCodes } = await supabase
    .from("voting_codes")
    .select("*", { count: "exact", head: true });

  const { count: usedEvaluations } = await supabase
    .from("voting_code_usage")
    .select("*", { count: "exact", head: true });

  const evaluatedEmployeeIds = new Set(
    (evaluations || []).map((evaluation) => evaluation.evaluated_employee_id)
  );

  const questionMap = new Map();

  (questions || []).forEach((question: any) => {
    questionMap.set(question.id, {
      question: question.question,
      category: question.evaluation_categories?.name || "Bez kategórie",
    });
  });

  const employeesWithStats = (employees || []).map((employee: any) => {
    const employeeEvaluations =
      evaluations?.filter(
        (evaluation) => evaluation.evaluated_employee_id === employee.id
      ) || [];

    const employeeEvaluationIds = employeeEvaluations.map(
      (evaluation) => evaluation.id
    );

    const employeeAnswers =
      answers?.filter((answer) =>
        employeeEvaluationIds.includes(answer.evaluation_id)
      ) || [];

    const scores = employeeAnswers.map((answer) => Number(answer.score));

    const average =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : null;

    const categoryStats: Record<
      string,
      {
        total: number;
        count: number;
        average: number;
      }
    > = {};

    employeeAnswers.forEach((answer: any) => {
      const questionInfo = questionMap.get(answer.question_id);
      const categoryName = questionInfo?.category || "Bez kategórie";

      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = {
          total: 0,
          count: 0,
          average: 0,
        };
      }

      categoryStats[categoryName].total += Number(answer.score);
      categoryStats[categoryName].count += 1;
      categoryStats[categoryName].average =
        categoryStats[categoryName].total / categoryStats[categoryName].count;
    });

    const employeeComments =
      comments?.filter((comment) =>
        employeeEvaluationIds.includes(comment.evaluation_id)
      ) || [];

    const trainingRecommendations =
      createTrainingRecommendations(categoryStats);

    return {
      ...employee,
      evaluationCount: employeeEvaluations.length,
      answerCount: scores.length,
      average,
      categoryStats,
      comments: employeeComments,
      trainingRecommendations,
    };
  });

  const sortedEmployees = employeesWithStats.sort((a, b) => {
    if (a.average === null && b.average === null) return 0;
    if (a.average === null) return 1;
    if (b.average === null) return -1;
    return b.average - a.average;
  });

  const evaluatedEmployees = employeesWithStats.filter(
    (employee: any) => employee.average !== null
  );

  const overallScores = evaluatedEmployees
    .map((employee: any) => employee.average)
    .filter((average: number | null) => average !== null);

  const overallAverage =
    overallScores.length > 0
      ? overallScores.reduce((sum: number, score: number) => sum + score, 0) /
        overallScores.length
      : null;

  const categorySummary = getCategorySummary(employeesWithStats);
  const strongestCategories = categorySummary.slice(0, 3);
  const riskiestCategories = [...categorySummary]
    .sort((a, b) => a.average - b.average)
    .slice(0, 3);

  const trainingTopicSummary = getTrainingTopicSummary(employeesWithStats);

  const topEmployees = sortedEmployees
    .filter((employee: any) => employee.average !== null)
    .slice(0, 5);

  const weakestEmployees = [...sortedEmployees]
    .filter((employee: any) => employee.average !== null)
    .sort((a, b) => a.average - b.average)
    .slice(0, 5);

  const overallLevel = getScoreLevel(overallAverage);

  return (
    <main className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold">Manažérsky dashboard</h1>

      <p className="mt-3 text-gray-500">
        Prehľad anonymného hodnotenia zamestnancov sociálneho úseku.
      </p>

      <div className="mt-8 grid md:grid-cols-4 gap-5">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">Počet kódov</p>
          <p className="mt-2 text-3xl font-bold">{totalCodes || 0}</p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">Odoslané hodnotenia</p>
          <p className="mt-2 text-3xl font-bold">{usedEvaluations || 0}</p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">Hodnotení zamestnanci</p>
          <p className="mt-2 text-3xl font-bold">
            {evaluatedEmployeeIds.size}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">Sledovaní zamestnanci</p>
          <p className="mt-2 text-3xl font-bold">
            {employees?.length || 0}
          </p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-5">
          Celkové výsledky hodnotenia
        </h2>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="grid md:grid-cols-3 gap-5">
            <div className={`rounded-xl border p-5 ${overallLevel.cardClass}`}>
              <p className="text-sm text-gray-600">
                Celkový priemer hodnotenia
              </p>

              <p
                className={`mt-2 text-4xl font-bold ${overallLevel.valueClass}`}
              >
                {overallAverage !== null ? overallAverage.toFixed(2) : "—"}
              </p>

              <p
                className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${overallLevel.badgeClass}`}
              >
                {overallLevel.label}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm text-gray-600">
                Počet hodnotených zamestnancov
              </p>

              <p className="mt-2 text-4xl font-bold">
                {evaluatedEmployees.length}
              </p>

              <p className="mt-3 text-sm text-gray-500">
                Z celkového počtu {employees?.length || 0} sledovaných
                zamestnancov.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm text-gray-600">
                Počet odoslaných hodnotení
              </p>

              <p className="mt-2 text-4xl font-bold">{usedEvaluations || 0}</p>

              <p className="mt-3 text-sm text-gray-500">
                Počet evidovaných použití anonymných hodnotiacich kódov.
              </p>
            </div>
          </div>

          <div className="mt-8 grid lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Poradie zamestnancov – najvyššie hodnotenie
              </h3>

              {topEmployees.length > 0 ? (
                <div className="space-y-3">
                  {topEmployees.map((employee: any, index: number) => {
                    const level = getScoreLevel(employee.average);

                    return (
                      <div
                        key={employee.id}
                        className={`rounded-xl border p-4 ${level.cardClass}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold">
                              {index + 1}. {employee.first_name}{" "}
                              {employee.last_name}
                            </p>

                            <p className="text-sm text-gray-600">
                              {getPositionName(employee)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p
                              className={`text-2xl font-bold ${level.valueClass}`}
                            >
                              {employee.average.toFixed(2)}
                            </p>

                            <p
                              className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-semibold ${level.badgeClass}`}
                            >
                              {level.label}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-xl bg-gray-50 p-4 text-gray-600">
                  Zatiaľ nie sú dostupné hodnotenia zamestnancov.
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                Poradie zamestnancov – najnižšie hodnotenie
              </h3>

              {weakestEmployees.length > 0 ? (
                <div className="space-y-3">
                  {weakestEmployees.map((employee: any, index: number) => {
                    const level = getScoreLevel(employee.average);

                    return (
                      <div
                        key={employee.id}
                        className={`rounded-xl border p-4 ${level.cardClass}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold">
                              {index + 1}. {employee.first_name}{" "}
                              {employee.last_name}
                            </p>

                            <p className="text-sm text-gray-600">
                              {getPositionName(employee)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p
                              className={`text-2xl font-bold ${level.valueClass}`}
                            >
                              {employee.average.toFixed(2)}
                            </p>

                            <p
                              className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-semibold ${level.badgeClass}`}
                            >
                              {level.label}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-xl bg-gray-50 p-4 text-gray-600">
                  Zatiaľ nie sú dostupné hodnotenia zamestnancov.
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 grid lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Najsilnejšie oblasti
              </h3>

              {strongestCategories.length > 0 ? (
                <div className="space-y-3">
                  {strongestCategories.map((category) => {
                    const level = getScoreLevel(category.average);

                    return (
                      <div
                        key={category.categoryName}
                        className={`rounded-xl border p-4 ${level.cardClass}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold">
                              {category.categoryName}
                            </p>

                            <p className="text-sm text-gray-600">
                              Počet odpovedí: {category.count}
                            </p>
                          </div>

                          <div className="text-right">
                            <p
                              className={`text-2xl font-bold ${level.valueClass}`}
                            >
                              {category.average.toFixed(2)}
                            </p>

                            <p
                              className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-semibold ${level.badgeClass}`}
                            >
                              {level.label}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-xl bg-gray-50 p-4 text-gray-600">
                  Zatiaľ nie sú dostupné kategórie hodnotenia.
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                Najrizikovejšie oblasti
              </h3>

              {riskiestCategories.length > 0 ? (
                <div className="space-y-3">
                  {riskiestCategories.map((category) => {
                    const level = getScoreLevel(category.average);

                    return (
                      <div
                        key={category.categoryName}
                        className={`rounded-xl border p-4 ${level.cardClass}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold">
                              {category.categoryName}
                            </p>

                            <p className="text-sm text-gray-600">
                              Počet odpovedí: {category.count}
                            </p>
                          </div>

                          <div className="text-right">
                            <p
                              className={`text-2xl font-bold ${level.valueClass}`}
                            >
                              {category.average.toFixed(2)}
                            </p>

                            <p
                              className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-semibold ${level.badgeClass}`}
                            >
                              {level.label}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-xl bg-gray-50 p-4 text-gray-600">
                  Zatiaľ nie sú dostupné kategórie hodnotenia.
                </p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">
              Odporúčané vzdelávacie témy
            </h3>

            {trainingTopicSummary.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {trainingTopicSummary.map((topic) => (
                  <div
                    key={topic.topicName}
                    className="rounded-xl border border-amber-200 bg-amber-50 p-5"
                  >
                    <p className="font-semibold text-gray-900">
                      {topic.topicName}
                    </p>

                    <p className="mt-2 text-sm text-gray-700">
                      Odporúčané pre počet zamestnancov:{" "}
                      <strong>{topic.count}</strong>
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      Podklad pre ročný plán vzdelávania a individuálne plány
                      ďalšieho vzdelávania.
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-green-50 border border-green-200 p-5 text-green-900">
                Aktuálne sa nezobrazujú žiadne sledované alebo rizikové oblasti
                pod hranicou 4,10.
              </p>
            )}
          </div>

          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="text-lg font-semibold">
              Záver manažéra kvality
            </h3>

            {overallAverage !== null ? (
              <p className="mt-3 leading-relaxed text-gray-700">
                Celkové anonymné hodnotenie dosiahlo priemer{" "}
                <strong>{overallAverage.toFixed(2)}</strong>, čo zodpovedá
                úrovni <strong>{overallLevel.label.toLowerCase()}</strong>.
                Výsledky je vhodné použiť ako manažérsky podklad pre hodnotiace
                rozhovory, individuálne plány ďalšieho vzdelávania, plán
                vzdelávania zamestnancov a identifikáciu oblastí, ktoré si
                vyžadujú metodické vedenie, zaškolenie alebo supervíziu.
              </p>
            ) : (
              <p className="mt-3 leading-relaxed text-gray-700">
                Zatiaľ nie sú dostupné žiadne odoslané hodnotenia. Záver
                manažéra kvality bude možné vytvoriť po prijatí prvých
                anonymných hodnotení.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-5">
          Výsledky podľa zamestnanca
        </h2>

        <div className="space-y-5">
          {sortedEmployees.map((employee: any) => {
            const employeeLevel = getScoreLevel(employee.average);

            const positiveComments = getCommentsByType(
              employee.comments,
              "positive"
            );

            const improvementComments = getCommentsByType(
              employee.comments,
              "improvement"
            );

            return (
              <div
                key={employee.id}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {employee.first_name} {employee.last_name}
                    </h3>

                    <p className="text-gray-500">
                      {getPositionName(employee)}
                    </p>

                    <PrintButton recordId={`employee-record-${employee.id}`} />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-right">
                    <div>
                      <p className="text-sm text-gray-500">Priemer</p>

                      <p
                        className={`text-2xl font-bold ${employeeLevel.valueClass}`}
                      >
                        {employee.average !== null
                          ? employee.average.toFixed(2)
                          : "—"}
                      </p>

                      <p
                        className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-semibold ${employeeLevel.badgeClass}`}
                      >
                        {employeeLevel.label}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Hodnotení</p>
                      <p className="text-2xl font-bold">
                        {employee.evaluationCount}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Odpovedí</p>
                      <p className="text-2xl font-bold">
                        {employee.answerCount}
                      </p>
                    </div>
                  </div>
                </div>

                {Object.keys(employee.categoryStats).length > 0 && (
                  <div className="mt-6 border-t pt-5">
                    <h4 className="font-semibold mb-4">
                      Priemer podľa kategórií
                    </h4>

                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(employee.categoryStats).map(
                        ([categoryName, stats]: any) => {
                          const scoreLevel = getScoreLevel(stats.average);

                          return (
                            <div
                              key={categoryName}
                              className={`rounded-xl border p-4 ${scoreLevel.cardClass}`}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {categoryName}
                                  </p>

                                  <p className="text-sm text-gray-500">
                                    Počet odpovedí: {stats.count}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <p
                                    className={`text-2xl font-bold ${scoreLevel.valueClass}`}
                                  >
                                    {stats.average.toFixed(2)}
                                  </p>

                                  <p
                                    className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-semibold ${scoreLevel.badgeClass}`}
                                  >
                                    {scoreLevel.label}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                {employee.evaluationCount > 0 && (
                  <div className="mt-6 border-t pt-5">
                    <h4 className="font-semibold mb-4">
                      Odporúčanie pre individuálny plán ďalšieho vzdelávania
                    </h4>

                    {employee.trainingRecommendations.length > 0 ? (
                      <div className="space-y-4">
                        {employee.trainingRecommendations.map(
                          (
                            recommendation: Recommendation,
                            index: number
                          ) => (
                            <div
                              key={index}
                              className="rounded-xl border border-amber-200 bg-amber-50 p-5"
                            >
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-amber-700">
                                    Slabšia / sledovaná oblasť
                                  </p>

                                  <p className="text-lg font-bold text-gray-900">
                                    {recommendation.categoryName}
                                  </p>
                                </div>

                                <div className="text-left md:text-right">
                                  <p className="text-sm text-gray-600">
                                    Priemer v oblasti
                                  </p>

                                  <p className="text-2xl font-bold text-amber-700">
                                    {recommendation.average.toFixed(2)}
                                  </p>

                                  <p className="mt-1 text-sm font-semibold text-gray-700">
                                    {recommendation.priority}
                                  </p>
                                </div>
                              </div>

                              <p className="mt-4 text-gray-800 leading-relaxed">
                                {recommendation.summary}
                              </p>

                              <div className="mt-4 grid md:grid-cols-3 gap-4">
                                <div className="rounded-lg bg-white p-4 border border-amber-100">
                                  <p className="font-semibold text-gray-800">
                                    Odporúčaná forma podpory
                                  </p>

                                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                                    {recommendation.recommendedForm}
                                  </p>
                                </div>

                                <div className="rounded-lg bg-white p-4 border border-amber-100">
                                  <p className="font-semibold text-gray-800">
                                    Návrh osobného cieľa
                                  </p>

                                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                                    {recommendation.suggestedGoal}
                                  </p>
                                </div>

                                <div className="rounded-lg bg-white p-4 border border-amber-100">
                                  <p className="font-semibold text-gray-800">
                                    Spôsob hodnotenia účelnosti, využiteľnosti a
                                    prenosu do praxe
                                  </p>

                                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                                    {recommendation.verificationMethod}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                        <p className="font-semibold text-green-800">
                          Bez výraznej potreby rozvojového opatrenia
                        </p>

                        <p className="mt-2 text-sm leading-relaxed text-green-900">
                          Zamestnanec nemá v aktuálnom anonymnom hodnotení
                          žiadnu kategóriu s priemerom nižším ako 4,10.
                          Individuálny plán ďalšieho vzdelávania je možné
                          zamerať na priebežné udržiavanie odbornosti,
                          aktualizačné vzdelávanie a osobné odborné ciele
                          zamestnanca.
                        </p>
                      </div>
                    )}

                    <p className="mt-4 text-sm leading-relaxed text-gray-500">
                      Odporúčanie je automaticky vytvorené z anonymného
                      hodnotenia a slúži ako podklad pre hodnotiaci rozhovor,
                      nie ako samostatné personálne rozhodnutie.
                    </p>
                  </div>
                )}

                {employee.evaluationCount === 0 && (
                  <div className="mt-6 border-t pt-5">
                    <h4 className="font-semibold mb-3">
                      Odporúčanie pre individuálny plán ďalšieho vzdelávania
                    </h4>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                      <p className="font-semibold text-gray-800">
                        Zamestnanec zatiaľ nebol hodnotený
                      </p>

                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        Odporúčanie pre individuálny plán ďalšieho vzdelávania
                        bude dostupné po prijatí prvých anonymných hodnotení.
                        Zatiaľ nie je možné vytvoriť hodnotiaci záver ani
                        odporúčané rozvojové opatrenie.
                      </p>
                    </div>
                  </div>
                )}

                {employee.comments.length > 0 && (
                  <div className="mt-6 border-t pt-5">
                    <h4 className="font-semibold mb-3">
                      Slovné komentáre
                    </h4>

                    <div className="space-y-3">
                      {employee.comments.map(
                        (comment: any, index: number) => (
                          <div
                            key={index}
                            className="rounded-xl bg-gray-50 p-4 text-sm"
                          >
                            <p className="font-semibold text-gray-600">
                              {comment.comment_type === "positive" &&
                                "Čo robí dobre"}
                              {comment.comment_type === "improvement" &&
                                "V čom sa môže zlepšiť"}
                              {comment.comment_type === "example" &&
                                "Konkrétny príklad"}
                              {comment.comment_type !== "positive" &&
                                comment.comment_type !== "improvement" &&
                                comment.comment_type !== "example" &&
                                "Komentár"}
                            </p>

                            <p className="mt-1 text-gray-700">
                              {comment.comment_text}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}