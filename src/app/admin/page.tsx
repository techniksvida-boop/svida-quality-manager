export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PrintButton from "./PrintButton";

type ScoreLevel = {
  label: string;
  cardClass: string;
  valueClass: string;
  badgeClass: string;
};

type Recommendation = {
  categoryName: string;
  average: number;
  priority: string;
  summary: string;
  recommendedForm: string;
  suggestedGoal: string;
  verificationMethod: string;
};

type CategoryStats = Record<
  string,
  {
    total: number;
    count: number;
    average: number;
  }
>;

function getPriority(average: number) {
  if (average <= 3) {
    return "Vysoká priorita";
  }

  if (average < 4.1) {
    return "Stredná priorita";
  }

  return "Nízka priorita";
}

function getScoreLevel(score: number | null): ScoreLevel {
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

function getDepartmentName(employee: any) {
  if (Array.isArray(employee?.departments)) {
    return employee.departments[0]?.name || "Bez úseku";
  }

  return employee?.departments?.name || "Bez úseku";
}

function getCategoryName(question: any) {
  if (Array.isArray(question.evaluation_categories)) {
    return question.evaluation_categories[0]?.name || "Bez kategórie";
  }

  return question.evaluation_categories?.name || "Bez kategórie";
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

function createTrainingRecommendations(categoryStats: CategoryStats) {
  return Object.entries(categoryStats)
    .map(([categoryName, stats]) =>
      getRecommendationByCategory(categoryName, stats.average)
    )
    .filter((recommendation) => recommendation.average < 4.1)
    .sort((a, b) => a.average - b.average)
    .slice(0, 2);
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

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ period?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  const { data: periods } = await supabase
    .from("evaluation_periods")
    .select("*")
    .order("date_from", { ascending: false });

  const selectedPeriod =
    periods?.find(
      (period: any) => period.id === resolvedSearchParams?.period
    ) ||
    periods?.find((period: any) => period.is_active) ||
    periods?.[0];

  const selectedPeriodId = selectedPeriod?.id;

  const { data: employees } = await supabase
  .from("employees")
  .select(`
    id,
    first_name,
    last_name,
    positions(name),
    departments(id, name)
  `)
  .eq("is_active", true)
  .order("last_name");

  const { data: evaluations } = selectedPeriodId
  ? await supabase
      .from("evaluations")
      .select(`
        id,
        evaluated_employee_id,
        evaluation_type,
        evaluation_type_id,
        submitted_at
      `)
      .eq("period_id", selectedPeriodId)
      .eq("is_submitted", true)
  : { data: [] };
  const { data: evaluationTypes } = await supabase
  .from("evaluation_types")
  .select("id, code, name, weight")
  .eq("is_active", true);

const evaluationTypeMap = new Map(
  (evaluationTypes || []).map((type: any) => [
    type.id,
    {
      code: type.code,
      name: type.name,
      weight: Number(type.weight),
    },
  ])
);

  const { data: questions } = await supabase
    .from("evaluation_questions")
    .select("id, question, evaluation_categories(name)")
    .eq("is_active", true);

  const evaluationIds = (evaluations || []).map(
    (evaluation: any) => evaluation.id
  );

  const { data: answers } =
    evaluationIds.length > 0
      ? await supabase
          .from("evaluation_answers")
          .select("evaluation_id, question_id, score")
          .in("evaluation_id", evaluationIds)
      : { data: [] };

  const { data: comments } =
    evaluationIds.length > 0
      ? await supabase
          .from("evaluation_comments")
          .select("evaluation_id, comment_type, comment_text")
          .in("evaluation_id", evaluationIds)
      : { data: [] };

  const { count: totalCodes } = selectedPeriodId
    ? await supabase
        .from("voting_codes")
        .select("*", { count: "exact", head: true })
        .eq("period_id", selectedPeriodId)
    : { count: 0 };
    const { data: periodUsage } = selectedPeriodId
  ? await supabase
      .from("voting_code_usage")
      .select("voting_code_id")
      .eq("period_id", selectedPeriodId)
  : { data: [] };

const usedVotingCodeIds = Array.from(
  new Set(
    (periodUsage || [])
      .map((usage: any) => usage.voting_code_id)
      .filter(Boolean)
  )
);

const { data: participantCodes } =
  usedVotingCodeIds.length > 0
    ? await supabase
        .from("voting_codes")
        .select("id, employee_id")
        .in("id", usedVotingCodeIds)
    : { data: [] };

const participatingEmployeeIds = new Set(
  (participantCodes || [])
    .map((code: any) => code.employee_id)
    .filter(Boolean)
);

const totalActiveEmployees = employees?.length || 0;

const participatingEmployeesCount = (employees || []).filter(
  (employee: any) => participatingEmployeeIds.has(employee.id)
).length;

const nonParticipatingEmployeesCount = Math.max(
  totalActiveEmployees - participatingEmployeesCount,
  0
);

const overallParticipationPercentage =
  totalActiveEmployees > 0
    ? (participatingEmployeesCount / totalActiveEmployees) * 100
    : 0;

const departmentParticipationMap: Record<
  string,
  {
    departmentName: string;
    totalEmployees: number;
    participatingEmployees: number;
  }
> = {};

(employees || []).forEach((employee: any) => {
  const departmentName = getDepartmentName(employee);

  if (!departmentParticipationMap[departmentName]) {
    departmentParticipationMap[departmentName] = {
      departmentName,
      totalEmployees: 0,
      participatingEmployees: 0,
    };
  }

  departmentParticipationMap[departmentName].totalEmployees += 1;

  if (participatingEmployeeIds.has(employee.id)) {
    departmentParticipationMap[
      departmentName
    ].participatingEmployees += 1;
  }
});

const departmentParticipation = Object.values(
  departmentParticipationMap
)
  .map((department) => ({
    ...department,
    nonParticipatingEmployees:
      department.totalEmployees -
      department.participatingEmployees,
    percentage:
      department.totalEmployees > 0
        ? (department.participatingEmployees /
            department.totalEmployees) *
          100
        : 0,
  }))
  .sort((a, b) =>
    a.departmentName.localeCompare(b.departmentName, "sk")
  );

  const { count: usedEvaluations } = selectedPeriodId
    ? await supabase
        .from("voting_code_usage")
        .select("*", { count: "exact", head: true })
        .eq("period_id", selectedPeriodId)
    : { count: 0 };

  const evaluatedEmployeeIds = new Set(
    (evaluations || []).map((evaluation) => evaluation.evaluated_employee_id)
  );

  const questionMap = new Map();

  (questions || []).forEach((question: any) => {
    questionMap.set(question.id, {
      question: question.question,
      category: getCategoryName(question),
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

const typeResults = (evaluationTypes || []).map((type: any) => {
  const typeEvaluationIds = employeeEvaluations
    .filter((evaluation: any) => {
      if (evaluation.evaluation_type_id) {
        return evaluation.evaluation_type_id === type.id;
      }

      return evaluation.evaluation_type === type.code;
    })
    .map((evaluation: any) => evaluation.id);

  const typeScores = employeeAnswers
    .filter((answer: any) =>
      typeEvaluationIds.includes(answer.evaluation_id)
    )
    .map((answer: any) => Number(answer.score))
    .filter((score: number) => Number.isFinite(score));

  const typeAverage =
    typeScores.length > 0
      ? typeScores.reduce(
          (sum: number, score: number) => sum + score,
          0
        ) / typeScores.length
      : null;

  return {
    id: type.id,
    code: type.code,
    name: type.name,
    weight: Number(type.weight),
    average: typeAverage,
    answerCount: typeScores.length,
  };
});


const availableTypeResults = typeResults.filter(
  (type: any) =>
    type.average !== null &&
    type.weight > 0
);

const availableWeight = availableTypeResults.reduce(
  (sum: number, type: any) => sum + type.weight,
  0
);

const average =
  availableWeight > 0
    ? availableTypeResults.reduce(
        (sum: number, type: any) =>
          sum + Number(type.average) * type.weight,
        0
      ) / availableWeight
    : null;

    const evaluationTypeByEvaluationId = new Map<
  string,
  {
    code: string;
    weight: number;
  }
>();

employeeEvaluations.forEach((evaluation: any) => {
  const evaluationType = (evaluationTypes || []).find(
    (type: any) =>
      type.id === evaluation.evaluation_type_id ||
      type.code === evaluation.evaluation_type
  );

  if (evaluationType) {
    evaluationTypeByEvaluationId.set(evaluation.id, {
      code: evaluationType.code,
      weight: Number(evaluationType.weight || 0),
    });
  }
});

const categoryTypeStats: Record<
  string,
  Record<
    string,
    {
      total: number;
      count: number;
      weight: number;
    }
  >
> = {};

employeeAnswers.forEach((answer: any) => {
  const questionInfo = questionMap.get(answer.question_id);

  const categoryName =
    questionInfo?.category || "Bez kategórie";

  const evaluationType = evaluationTypeByEvaluationId.get(
    answer.evaluation_id
  );

  if (!evaluationType) {
    return;
  }

  if (!categoryTypeStats[categoryName]) {
    categoryTypeStats[categoryName] = {};
  }

  if (!categoryTypeStats[categoryName][evaluationType.code]) {
    categoryTypeStats[categoryName][evaluationType.code] = {
      total: 0,
      count: 0,
      weight: evaluationType.weight,
    };
  }

  const score = Number(answer.score);

  if (!Number.isFinite(score)) {
    return;
  }

  categoryTypeStats[categoryName][evaluationType.code].total +=
    score;

  categoryTypeStats[categoryName][evaluationType.code].count +=
    1;
});

const categoryStats: CategoryStats = {};

Object.entries(categoryTypeStats).forEach(
  ([categoryName, typeStats]) => {
    const availableTypes = Object.values(typeStats)
      .filter(
        (stats) =>
          stats.count > 0 &&
          stats.weight > 0
      )
      .map((stats) => ({
        average: stats.total / stats.count,
        weight: stats.weight,
        count: stats.count,
      }));

    const availableWeight = availableTypes.reduce(
      (sum, stats) => sum + stats.weight,
      0
    );

    if (availableWeight === 0) {
      return;
    }

    const weightedAverage =
      availableTypes.reduce(
        (sum, stats) =>
          sum + stats.average * stats.weight,
        0
      ) / availableWeight;

    const answerCount = availableTypes.reduce(
      (sum, stats) => sum + stats.count,
      0
    );

    categoryStats[categoryName] = {
      total: weightedAverage * answerCount,
      count: answerCount,
      average: weightedAverage,
    };
  }
);

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
  typeResults,
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

  const overallScores: number[] = evaluatedEmployees
    .map((employee: any) => employee.average)
    .filter((average: number | null): average is number => average !== null);

  const overallAverage =
    overallScores.length > 0
      ? overallScores.reduce((sum, score) => sum + score, 0) /
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
    const topTenEmployees = sortedEmployees
  .filter(
    (employee: any) =>
      employee.average !== null &&
      Number.isFinite(employee.average)
  )
  .slice(0, 10);
const bottomTenEmployees = [...sortedEmployees]
  .filter(
    (employee: any) =>
      employee.average !== null &&
      Number.isFinite(employee.average)
  )
  .sort(
    (a: any, b: any) =>
      Number(a.average) - Number(b.average)
  )
  .slice(0, 10);
  const weakestEmployees = [...sortedEmployees]
    .filter((employee: any) => employee.average !== null)
    .sort((a, b) => a.average - b.average)
    .slice(0, 5);
function getOverallTypeAverage(typeCode: string) {
  const values = employeesWithStats
    .map((employee: any) =>
      employee.typeResults?.find(
        (type: any) => type.code === typeCode
      )?.average
    )
    .filter(
      (value: number | null | undefined): value is number =>
        value !== null &&
        value !== undefined &&
        Number.isFinite(value)
    );

  if (values.length === 0) {
    return null;
  }

  return (
    values.reduce((sum: number, value: number) => sum + value, 0) /
    values.length
  );
}

const peerOverallAverage = getOverallTypeAverage("peer");
const selfOverallAverage = getOverallTypeAverage("self");
const managerOverallAverage = getOverallTypeAverage("manager");
const departmentBenchmarkMap: Record<
  string,
  {
    departmentName: string;
    employeeScores: number[];
    categoryScores: Record<string, number[]>;
    evaluatedEmployees: number;
  }
> = {};

employeesWithStats.forEach((employee: any) => {
  const departmentName = getDepartmentName(employee);

  if (!departmentBenchmarkMap[departmentName]) {
    departmentBenchmarkMap[departmentName] = {
      departmentName,
      employeeScores: [],
      categoryScores: {},
      evaluatedEmployees: 0,
    };
  }

  const department = departmentBenchmarkMap[departmentName];

  if (
    employee.average !== null &&
    Number.isFinite(employee.average)
  ) {
    department.employeeScores.push(employee.average);
    department.evaluatedEmployees += 1;
  }

  Object.entries(employee.categoryStats || {}).forEach(
    ([categoryName, stats]: any) => {
      if (
        stats.average === null ||
        !Number.isFinite(stats.average)
      ) {
        return;
      }

      if (!department.categoryScores[categoryName]) {
        department.categoryScores[categoryName] = [];
      }

      department.categoryScores[categoryName].push(
        stats.average
      );
    }
  );
});

const departmentBenchmark = Object.values(
  departmentBenchmarkMap
)
  .map((department) => {
    const overallAverage =
      department.employeeScores.length > 0
        ? department.employeeScores.reduce(
            (sum, value) => sum + value,
            0
          ) / department.employeeScores.length
        : null;

    const categories = Object.entries(
      department.categoryScores
    )
      .map(([categoryName, values]) => ({
        categoryName,
        average:
          values.length > 0
            ? values.reduce(
                (sum, value) => sum + value,
                0
              ) / values.length
            : null,
        employeeCount: values.length,
      }))
      .sort((a, b) => {
        if (a.average === null) return 1;
        if (b.average === null) return -1;

        return b.average - a.average;
      });

    return {
      departmentName: department.departmentName,
      overallAverage,
      evaluatedEmployees: department.evaluatedEmployees,
      categories,
    };
  })

  .sort((a, b) => {
    if (a.overallAverage === null) return 1;
    if (b.overallAverage === null) return -1;

    return b.overallAverage - a.overallAverage;
  });

const allBenchmarkCategories = Array.from(
  new Set(
    departmentBenchmark.flatMap((department) =>
      department.categories.map(
        (category) => category.categoryName
      )
    )
  )
).sort((a, b) => a.localeCompare(b, "sk"));
  const overallLevel = getScoreLevel(overallAverage);

  return (
    <main className="svida-page svida-page-bg">
  <div className="svida-container min-w-0">
      <header className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="break-words text-2xl font-bold tracking-tight text-gray-900 sm:text-2xl sm:text-3xl lg:text-4xl">
  Manažérsky dashboard
</h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">
            Prehľad anonymného hodnotenia zamestnancov sociálneho úseku.
          </p>
          <div className="mt-6">
  <p className="mb-3 text-sm font-semibold text-gray-600">
    Hodnotiace obdobie
  </p>

  <div className="flex max-w-full flex-wrap gap-2 sm:gap-3">
    {(periods || []).map((period: any) => (
      <Link
        key={period.id}
        href={`/admin?period=${period.id}`}
        className={`inline-flex min-h-11 items-center justify-center rounded-xl border px-3 py-2 text-center text-sm font-semibold transition sm:px-4 sm:text-base ${
          selectedPeriod?.id === period.id
            ? "border-[#df4a33] bg-[#df4a33] text-white"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        {period.name}
      </Link>
    ))}
  </div>
</div>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[360px]">
  <Link
    href="/admin/trends"
   className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
  >
    Trendy medzi rokmi
  </Link>

  <a
    href={`/admin/print-report?period=${selectedPeriodId || ""}`}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-center text-sm font-semibold leading-snug text-gray-700 transition hover:bg-gray-50"
  >
    Vytlačiť celkový manažérsky report
  </a>
</div>
</header>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
  <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
    <p className="text-gray-500">Sledovaní zamestnanci</p>
    <p className="mt-2 text-2xl sm:text-3xl font-bold">
      {employees?.length || 0}
    </p>
  </div>

  <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
    <p className="text-gray-500">Hodnotení zamestnanci</p>
    <p className="mt-2 text-2xl sm:text-3xl font-bold">
      {evaluatedEmployees.length}
    </p>
  </div>

  <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
    <p className="text-gray-500">Odoslané hodnotenia</p>
    <p className="mt-2 text-2xl sm:text-3xl font-bold">
      {usedEvaluations || 0}
    </p>
  </div>

  <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 sm:p-6 shadow-sm">
    <p className="text-orange-800">Celkový vážený výsledok</p>
    <p className="mt-2 text-2xl sm:text-3xl font-bold text-orange-700">
      {overallAverage !== null
        ? overallAverage.toFixed(2)
        : "—"}
    </p>
  </div>

  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6 shadow-sm">
    <p className="text-blue-800">Hodnotenie zamestnancov</p>
    <p className="mt-2 text-2xl sm:text-3xl font-bold text-blue-700">
      {peerOverallAverage !== null
        ? peerOverallAverage.toFixed(2)
        : "—"}
    </p>
  </div>

  <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 sm:p-6 shadow-sm">
    <p className="text-indigo-800">Hodnotenie vedúcimi</p>
    <p className="mt-2 text-2xl sm:text-3xl font-bold text-indigo-700">
      {managerOverallAverage !== null
        ? managerOverallAverage.toFixed(2)
        : "—"}
    </p>
  </div>

  <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:p-6 shadow-sm">
    <p className="text-violet-800">Sebahodnotenie</p>
    <p className="mt-2 text-2xl sm:text-3xl font-bold text-violet-700">
      {selfOverallAverage !== null
        ? selfOverallAverage.toFixed(2)
        : "—"}
    </p>
  </div>

  <div className="min-w-0 rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
    <p className="text-gray-500">Počet anonymných kódov</p>
    <p className="mt-2 text-2xl sm:text-3xl font-bold">
      {totalCodes || 0}
    </p>
  </div>
</div>
<section className="mt-10">
  <div className="mb-5">
    <h2 className="break-words text-xl font-semibold text-gray-900 sm:text-2xl">
      Účasť zamestnancov na hodnotení
    </h2>

    <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
      Účasť je vypočítaná podľa zamestnancov, ktorí vo vybranom
      hodnotiacom období použili svoj hodnotiaci kód aspoň raz.
    </p>
  </div>

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6 shadow-sm">
      <p className="text-gray-600">
        Celková účasť zamestnancov
      </p>

      <p className="mt-2 text-3xl font-bold text-blue-700 sm:text-4xl">
        {overallParticipationPercentage
          .toFixed(1)
          .replace(".", ",")}{" "}
        %
      </p>

      <p className="mt-3 text-sm text-gray-600">
        Zúčastnilo sa {participatingEmployeesCount} z{" "}
        {totalActiveEmployees} aktívnych zamestnancov.
      </p>
    </div>

    <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
      <p className="text-gray-500">
        Zúčastnení zamestnanci
      </p>

      <p className="mt-2 text-2xl sm:text-3xl font-bold">
        {participatingEmployeesCount}
      </p>
    </div>

    <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
      <p className="text-gray-500">
        Nezúčastnení zamestnanci
      </p>

      <p className="mt-2 text-2xl sm:text-3xl font-bold">
        {nonParticipatingEmployeesCount}
      </p>
    </div>
  </div>
<p className="mb-2 mt-6 text-xs text-gray-500 sm:hidden">
  Tabuľku môžete posúvať do strán.
</p>
  <div className="svida-table-scroll rounded-2xl border bg-white shadow-sm">
    <table className="w-full min-w-[750px] text-sm">
      <thead className="border-b bg-gray-50">
        <tr>
          <th className="p-3 text-left">Úsek</th>

          <th className="p-3 text-center">
            Počet zamestnancov
          </th>

          <th className="p-3 text-center">
            Zúčastnení
          </th>

          <th className="p-3 text-center">
            Nezúčastnení
          </th>

          <th className="p-3 text-center">
            Účasť
          </th>
        </tr>
      </thead>

      <tbody>
        {departmentParticipation.map((department) => (
          <tr
            key={department.departmentName}
            className="border-b last:border-b-0"
          >
            <td className="p-3 font-semibold">
              {department.departmentName}
            </td>

            <td className="p-3 text-center">
              {department.totalEmployees}
            </td>

            <td className="p-3 text-center font-semibold">
              {department.participatingEmployees}
            </td>

            <td className="p-3 text-center">
              {department.nonParticipatingEmployees}
            </td>

            <td className="p-3 text-center">
              <span
                className={`inline-flex min-w-20 justify-center rounded-full px-3 py-1 font-bold ${
                  department.percentage >= 80
                    ? "bg-green-100 text-green-800"
                    : department.percentage >= 50
                    ? "bg-orange-100 text-orange-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {department.percentage
                  .toFixed(1)
                  .replace(".", ",")}{" "}
                %
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>
<section className="mt-10">
  <div className="mb-5">
    <h2 className="break-words text-xl font-semibold text-gray-900 sm:text-2xl">
      Benchmark medzi úsekmi
    </h2>

    <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
      Porovnanie celkového výsledku a jednotlivých oblastí medzi úsekmi.
    </p>
  </div>
<p className="mb-2 text-xs text-gray-500 sm:hidden">
  Tabuľku môžete posúvať do strán.
</p>
  <div className="svida-table-scroll rounded-2xl border bg-white shadow-sm">
    <table className="w-full min-w-[1100px] text-sm">
      <thead className="border-b bg-gray-50">
        <tr>
          <th className="sticky left-0 z-10 min-w-[170px] border-r bg-gray-50 p-3 text-left">
            Úsek
          </th>

          <th className="p-3 text-center">
            Celkový výsledok
          </th>

          <th className="p-3 text-center">
            Hodnotení zamestnanci
          </th>

          {allBenchmarkCategories.map((categoryName) => (
            <th
              key={categoryName}
              className="min-w-[180px] p-3 text-center"
            >
              {categoryName}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {departmentBenchmark.map((department) => {
          const overallLevel = getScoreLevel(
            department.overallAverage
          );

          return (
            <tr
              key={department.departmentName}
              className="border-b last:border-b-0"
            >
              <td className="sticky left-0 z-10 bg-white p-3 font-semibold">
                {department.departmentName}
              </td>

              <td className="p-3 text-center">
                <span
                  className={`inline-flex min-w-16 justify-center rounded-full px-3 py-1 font-bold ${overallLevel.badgeClass}`}
                >
                  {department.overallAverage !== null
                    ? department.overallAverage.toFixed(2)
                    : "—"}
                </span>
              </td>

              <td className="p-3 text-center font-semibold">
                {department.evaluatedEmployees}
              </td>

              {allBenchmarkCategories.map((categoryName) => {
                const category = department.categories.find(
                  (item) =>
                    item.categoryName === categoryName
                );

                const categoryLevel = getScoreLevel(
                  category?.average ?? null
                );

                return (
                  <td
                    key={categoryName}
                    className="p-3 text-center"
                  >
                    <div
                      className={`inline-flex min-w-16 justify-center rounded-full px-3 py-1 font-bold ${categoryLevel.badgeClass}`}
                    >
                      {category?.average !== null &&
                      category?.average !== undefined
                        ? category.average.toFixed(2)
                        : "—"}
                    </div>

                    {category?.employeeCount ? (
                      <div className="mt-1 text-xs text-gray-500">
                        {category.employeeCount} zam.
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>

  {departmentBenchmark.length === 0 && (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-gray-600">
      Pre vybrané hodnotiace obdobie zatiaľ nie sú dostupné údaje
      na porovnanie úsekov.
    </div>
  )}
</section>
<section className="mt-10">
  <div className="mb-5">
    <h2 className="break-words text-xl font-semibold text-gray-900 sm:text-2xl">
      TOP 10 najlepšie hodnotených zamestnancov
    </h2>

    <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
      Poradie zamestnancov podľa celkového váženého výsledku vo vybranom
      hodnotiacom období.
    </p>
  </div>
<p className="mb-2 text-xs text-gray-500 sm:hidden">
  Tabuľku môžete posúvať do strán.
</p>
  <div className="svida-table-scroll rounded-2xl border bg-white shadow-sm">
    <table className="w-full min-w-[1000px] text-sm">
      <thead className="border-b bg-gray-50">
        <tr>
          <th className="p-3 text-center">
            Poradie
          </th>

          <th className="p-3 text-left">
            Zamestnanec
          </th>

          <th className="p-3 text-left">
            Úsek
          </th>

          <th className="p-3 text-center">
            Hodnotenie zamestnancov
          </th>

          <th className="p-3 text-center">
            Sebahodnotenie
          </th>

          <th className="p-3 text-center">
            Hodnotenie vedúcim
          </th>

          <th className="p-3 text-center">
            Celkový výsledok
          </th>

          <th className="p-3 text-center">
            Počet hodnotení
          </th>
        </tr>
      </thead>

      <tbody>
        {topTenEmployees.map((employee: any, index: number) => {
          const peer = employee.typeResults?.find(
            (type: any) => type.code === "peer"
          );

          const self = employee.typeResults?.find(
            (type: any) => type.code === "self"
          );

          const manager = employee.typeResults?.find(
            (type: any) => type.code === "manager"
          );

          const resultLevel = getScoreLevel(employee.average);

          return (
            <tr
              key={employee.id}
              className="border-b last:border-b-0"
            >
              <td className="p-3 text-center">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                    index === 0
                      ? "bg-amber-100 text-amber-800"
                      : index === 1
                      ? "bg-slate-200 text-slate-800"
                      : index === 2
                      ? "bg-orange-100 text-orange-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {index + 1}
                </span>
              </td>

              <td className="p-3 font-semibold">
                {employee.first_name} {employee.last_name}
              </td>

              <td className="p-3 text-gray-600">
                {getDepartmentName(employee)}
              </td>

              <td className="p-3 text-center font-semibold">
                {peer?.average !== null &&
                peer?.average !== undefined
                  ? peer.average.toFixed(2)
                  : "—"}
              </td>

              <td className="p-3 text-center font-semibold">
                {self?.average !== null &&
                self?.average !== undefined
                  ? self.average.toFixed(2)
                  : "—"}
              </td>

              <td className="p-3 text-center font-semibold">
                {manager?.average !== null &&
                manager?.average !== undefined
                  ? manager.average.toFixed(2)
                  : "—"}
              </td>

              <td className="p-3 text-center">
                <span
                  className={`inline-flex min-w-16 justify-center rounded-full px-3 py-1 font-bold ${resultLevel.badgeClass}`}
                >
                  {employee.average !== null
                    ? employee.average.toFixed(2)
                    : "—"}
                </span>
              </td>

              <td className="p-3 text-center font-semibold">
                {employee.evaluationCount}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>

  {topTenEmployees.length === 0 && (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-gray-600">
      Vo vybranom hodnotiacom období zatiaľ nie sú dostupné hodnotenia
      zamestnancov.
    </div>
  )}
</section>
<section className="mt-10">
  <div className="mb-5">
    <h2 className="break-words text-xl font-semibold text-gray-900 sm:text-2xl">
      TOP 10 najnižšie hodnotených zamestnancov
    </h2>

    <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
      Zamestnanci s najnižším celkovým váženým výsledkom vo vybranom
      hodnotiacom období.
    </p>
  </div>

  <div className="svida-table-scroll rounded-2xl border bg-white shadow-sm">
    <table className="w-full min-w-[1000px] text-sm">
      <thead className="border-b bg-gray-50">
        <tr>
          <th className="p-3 text-center">
            Poradie
          </th>

          <th className="p-3 text-left">
            Zamestnanec
          </th>

          <th className="p-3 text-left">
            Úsek
          </th>

          <th className="p-3 text-center">
            Hodnotenie zamestnancov
          </th>

          <th className="p-3 text-center">
            Sebahodnotenie
          </th>

          <th className="p-3 text-center">
            Hodnotenie vedúcim
          </th>

          <th className="p-3 text-center">
            Celkový výsledok
          </th>

          <th className="p-3 text-center">
            Počet hodnotení
          </th>
        </tr>
      </thead>

      <tbody>
        {bottomTenEmployees.map(
          (employee: any, index: number) => {
            const peer = employee.typeResults?.find(
              (type: any) => type.code === "peer"
            );

            const self = employee.typeResults?.find(
              (type: any) => type.code === "self"
            );

            const manager = employee.typeResults?.find(
              (type: any) => type.code === "manager"
            );

            const resultLevel = getScoreLevel(
              employee.average
            );

            return (
              <tr
                key={employee.id}
                className="border-b last:border-b-0"
              >
                <td className="p-3 text-center">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                      index === 0
                        ? "bg-red-100 text-red-800"
                        : index === 1
                        ? "bg-orange-100 text-orange-800"
                        : index === 2
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {index + 1}
                  </span>
                </td>

                <td className="p-3 font-semibold">
                  {employee.first_name}{" "}
                  {employee.last_name}
                </td>

                <td className="p-3 text-gray-600">
                  {getDepartmentName(employee)}
                </td>

                <td className="p-3 text-center font-semibold">
                  {peer?.average !== null &&
                  peer?.average !== undefined
                    ? peer.average.toFixed(2)
                    : "—"}
                </td>

                <td className="p-3 text-center font-semibold">
                  {self?.average !== null &&
                  self?.average !== undefined
                    ? self.average.toFixed(2)
                    : "—"}
                </td>

                <td className="p-3 text-center font-semibold">
                  {manager?.average !== null &&
                  manager?.average !== undefined
                    ? manager.average.toFixed(2)
                    : "—"}
                </td>

                <td className="p-3 text-center">
                  <span
                    className={`inline-flex min-w-16 justify-center rounded-full px-3 py-1 font-bold ${resultLevel.badgeClass}`}
                  >
                    {employee.average !== null
                      ? employee.average.toFixed(2)
                      : "—"}
                  </span>
                </td>

                <td className="p-3 text-center font-semibold">
                  {employee.evaluationCount}
                </td>
              </tr>
            );
          }
        )}
      </tbody>
    </table>
  </div>

  {bottomTenEmployees.length === 0 && (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-gray-600">
      Vo vybranom hodnotiacom období zatiaľ nie sú dostupné
      hodnotenia zamestnancov.
    </div>
  )}
</section>
      <section className="mt-10">
        <h2 className="mb-5 text-2xl font-semibold">
          Celkové výsledky hodnotenia
        </h2>

        <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
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

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-4 text-lg font-semibold">
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
                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                          <div>
                            <p className="font-semibold">
                              {index + 1}. {employee.first_name}{" "}
                              {employee.last_name}
                            </p>

                            <p className="text-sm text-gray-600">
                              {getPositionName(employee)}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
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
              <h3 className="mb-4 text-lg font-semibold">
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
                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                          <div>
                            <p className="font-semibold">
                              {index + 1}. {employee.first_name}{" "}
                              {employee.last_name}
                            </p>

                            <p className="text-sm text-gray-600">
                              {getPositionName(employee)}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
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

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-4 text-lg font-semibold">
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
              <h3 className="mb-4 text-lg font-semibold">
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
            <h3 className="mb-4 text-lg font-semibold">
              Odporúčané vzdelávacie témy
            </h3>

            {trainingTopicSummary.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
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
              <p className="rounded-xl border border-green-200 bg-green-50 p-5 text-green-900">
                Aktuálne sa nezobrazujú žiadne sledované alebo rizikové oblasti
                pod hranicou 4,10.
              </p>
            )}
          </div>

          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="text-lg font-semibold">Záver manažéra kvality</h3>

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
        <h2 className="mb-5 text-2xl font-semibold">
          Výsledky podľa zamestnanca
        </h2>

        <div className="space-y-5">
          {sortedEmployees.map((employee: any) => {
            const employeeLevel = getScoreLevel(employee.average);

            return (
              <div
                key={employee.id}
                className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {employee.first_name} {employee.last_name}
                    </h3>

                    <p className="text-gray-500">
                      {getPositionName(employee)}
                    </p>

                    <PrintButton
  recordId={`employee-record-${employee.id}`}
  periodId={selectedPeriodId}
/>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-left sm:gap-4 md:grid-cols-3 lg:grid-cols-5 lg:text-right">
  <div>
    <p className="text-sm text-gray-500">Výsledok</p>

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
    <p className="text-sm text-gray-500">
      Hodnotenie zamestnancov
    </p>

    <p className="text-2xl font-bold">
      {employee.typeResults?.find(
        (type: any) => type.code === "peer"
      )?.average !== null &&
      employee.typeResults?.find(
        (type: any) => type.code === "peer"
      )?.average !== undefined
        ? employee.typeResults
            .find((type: any) => type.code === "peer")
            .average.toFixed(2)
        : "—"}
    </p>
  </div>

  <div>
    <p className="text-sm text-gray-500">
      Sebahodnotenie
    </p>

    <p className="text-2xl font-bold">
      {employee.typeResults?.find(
        (type: any) => type.code === "self"
      )?.average !== null &&
      employee.typeResults?.find(
        (type: any) => type.code === "self"
      )?.average !== undefined
        ? employee.typeResults
            .find((type: any) => type.code === "self")
            .average.toFixed(2)
        : "—"}
    </p>
  </div>

  <div>
    <p className="text-sm text-gray-500">
      Hodnotenie vedúcim
    </p>

    <p className="text-2xl font-bold">
      {employee.typeResults?.find(
        (type: any) => type.code === "manager"
      )?.average !== null &&
      employee.typeResults?.find(
        (type: any) => type.code === "manager"
      )?.average !== undefined
        ? employee.typeResults
            .find((type: any) => type.code === "manager")
            .average.toFixed(2)
        : "—"}
    </p>
  </div>

  <div>
    <p className="text-sm text-gray-500">Hodnotení</p>

    <p className="text-2xl font-bold">
      {employee.evaluationCount}
    </p>
  </div>
</div>
                </div>

                {Object.keys(employee.categoryStats).length > 0 && (
                  <div className="mt-6 border-t pt-5">
                    <h4 className="mb-4 font-semibold">
                      Priemer podľa kategórií
                    </h4>

                    <div className="grid gap-4 md:grid-cols-2">
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
                    <h4 className="mb-4 font-semibold">
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
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
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

                              <p className="mt-4 leading-relaxed text-gray-800">
                                {recommendation.summary}
                              </p>

                              <div className="mt-4 grid gap-4 md:grid-cols-3">
                                <div className="rounded-lg border border-amber-100 bg-white p-4">
                                  <p className="font-semibold text-gray-800">
                                    Odporúčaná forma podpory
                                  </p>

                                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                                    {recommendation.recommendedForm}
                                  </p>
                                </div>

                                <div className="rounded-lg border border-amber-100 bg-white p-4">
                                  <p className="font-semibold text-gray-800">
                                    Návrh osobného cieľa
                                  </p>

                                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                                    {recommendation.suggestedGoal}
                                  </p>
                                </div>

                                <div className="rounded-lg border border-amber-100 bg-white p-4">
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
                    <h4 className="mb-3 font-semibold">
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
                    <h4 className="mb-3 font-semibold">Slovné komentáre</h4>

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
          </div>
    </main>
  );
}