export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";

function getScoreLevel(score: number | null) {
  if (score === null) {
    return "Bez hodnotenia";
  }

  if (score >= 4.1) {
    return "Dobrá úroveň";
  }

  if (score > 3) {
    return "Oblasť na sledovanie";
  }

  return "Riziková oblasť";
}

function getPositionName(employee: any) {
  if (Array.isArray(employee.positions)) {
    return employee.positions[0]?.name || "";
  }

  return employee.positions?.name || "";
}

function getDepartmentName(employee: any) {
  if (Array.isArray(employee.departments)) {
    return employee.departments[0]?.name || "Nezaradený úsek";
  }

  return employee.departments?.name || "Nezaradený úsek";
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
    return {
      topicName: "Práca s dokumentáciou, IS Cygnus a individuálnymi plánmi",
      reason:
        "Téma je zaradená z dôvodu potreby zlepšenia kvality, pravidelnosti, vecnosti a použiteľnosti odbornej dokumentácie a záznamov o práci s PSS.",
      form:
        "Interné metodické zaškolenie, praktický nácvik práce s IS Cygnus, kontrola vzorových zápisov a spätná väzba vedúceho úseku.",
      verification:
        "Vyhodnotenie účelnosti a využiteľnosti sa vykoná kontrolou vybraných záznamov v IS Cygnus a súvisiacej dokumentácie PSS. Sleduje sa úplnosť, vecnosť, pravidelnosť a prepojenie zápisov s individuálnymi potrebami a cieľmi PSS.",
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
      topicName:
        "Komunikácia s prijímateľom sociálnej služby a individuálny prístup",
      reason:
        "Téma je zaradená z dôvodu potreby posilnenia rešpektujúcej komunikácie, individuálneho prístupu, dôstojnosti PSS a zvládania náročných komunikačných situácií.",
      form:
        "Vzdelávanie v oblasti komunikácie s PSS, modelové situácie, metodické vedenie a podľa potreby individuálna alebo skupinová supervízia.",
      verification:
        "Prenos do praxe sa vyhodnotí hodnotiacim rozhovorom, spätnou väzbou z pracovného prostredia a posúdením konkrétnych situácií pri práci s PSS.",
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
      topicName: "Tímová spolupráca a odovzdávanie informácií",
      reason:
        "Téma je zaradená z dôvodu potreby zlepšenia spolupráce v tíme, včasného odovzdávania informácií a konštruktívneho riešenia pracovných situácií.",
      form:
        "Interné školenie alebo pracovné stretnutie k tímovej spolupráci, pravidlám komunikácie a odovzdávania informácií; pri potrebe skupinová supervízia.",
      verification:
        "Účelnosť sa vyhodnotí podľa kvality spolupráce v tíme, včasnosti a úplnosti odovzdávania informácií a spätnej väzby od vedúceho zamestnanca alebo kolegov.",
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
      topicName: "Štandardy kvality, odbornosť a profesionálny výkon práce",
      reason:
        "Téma je zaradená z dôvodu potreby posilnenia odborných postupov, etických požiadaviek, štandardov kvality a profesionálneho výkonu práce.",
      form:
        "Vzdelávanie k štandardom kvality, interné metodické usmernenie, oboznámenie s odbornými postupmi a následné overenie prenosu do praxe.",
      verification:
        "Prenos do praxe sa overí porovnaním pracovného výkonu s kartou pracovného miesta, internými postupmi, etickými požiadavkami a štandardmi kvality.",
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
      topicName: "Sociálna rehabilitácia, aktivizácia a práca s cieľmi PSS",
      reason:
        "Téma je zaradená z dôvodu potreby zlepšenia plánovania, realizácie a vyhodnocovania aktivít v nadväznosti na individuálne potreby a ciele PSS.",
      form:
        "Metodické vedenie k individuálnemu plánovaniu, školenie k sociálnej rehabilitácii a praktické príklady práce s cieľmi PSS.",
      verification:
        "Prenos do praxe sa overí kontrolou prepojenia realizovaných aktivít s individuálnymi potrebami a cieľmi PSS, posúdením dokumentácie a vyhodnotením konkrétnych pracovných výstupov.",
    };
  }

  return {
    topicName: categoryName,
    reason:
      "Téma je zaradená z dôvodu nižšieho hodnotenia v príslušnej pracovnej oblasti.",
    form:
      "Individuálny hodnotiaci rozhovor, metodické vedenie nadriadeným zamestnancom a následné vyhodnotenie zlepšenia v ďalšom období.",
    verification:
      "Účinnosť a účelnosť sa vyhodnotí pri najbližšom hodnotiacom rozhovore porovnaním dohodnutého cieľa s reálnym pracovným výkonom, pracovnými výstupmi a spätnou väzbou nadriadeného.",
  };
}

function getTrainingPlanSummary(employeesWithStats: any[]) {
  const topics: Record<
    string,
    {
      count: number;
      employees: string[];
      reason: string;
      form: string;
      verification: string;
    }
  > = {};

  employeesWithStats.forEach((employee) => {
    Object.entries(employee.categoryStats).forEach(
      ([categoryName, stats]: any) => {
        if (stats.average >= 4.1) {
          return;
        }

        const topic = getTrainingTopic(categoryName);

        if (!topics[topic.topicName]) {
          topics[topic.topicName] = {
            count: 0,
            employees: [],
            reason: topic.reason,
            form: topic.form,
            verification: topic.verification,
          };
        }

        topics[topic.topicName].count += 1;
        topics[topic.topicName].employees.push(
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
      reason: data.reason,
      form: data.form,
      verification: data.verification,
    }))
    .sort((a, b) => b.count - a.count);
}

function getBenchmarkScoreStyle(score: number) {
  if (score >= 4.1) {
    return {
      display: "inline-block",
      minWidth: "52px",
      padding: "4px 8px",
      borderRadius: "16px",
      background: "#dcfce7",
      color: "#166534",
      fontWeight: "bold",
      textAlign: "center" as const,
    };
  }

  if (score > 3) {
    return {
      display: "inline-block",
      minWidth: "52px",
      padding: "4px 8px",
      borderRadius: "16px",
      background: "#ffedd5",
      color: "#9a3412",
      fontWeight: "bold",
      textAlign: "center" as const,
    };
  }

  return {
    display: "inline-block",
    minWidth: "52px",
    padding: "4px 8px",
    borderRadius: "16px",
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: "bold",
    textAlign: "center" as const,
  };
}

function getCompactBenchmarkScoreStyle(score: number) {
  const baseStyle = getBenchmarkScoreStyle(score);

  return {
    ...baseStyle,
    minWidth: "34px",
    padding: "2px 4px",
    borderRadius: "10px",
    fontSize: "7pt",
  };
}

export default async function PrintReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ period?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  const { data: periods } = await supabase
    .from("evaluation_periods")
    .select("id, name, date_from, date_to, is_active")
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
      departments(name)
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

  const totalCodesQuery = supabase
    .from("voting_codes")
    .select("*", { count: "exact", head: true });

  if (selectedPeriodId) {
    totalCodesQuery.eq("period_id", selectedPeriodId);
  }

  const { count: totalCodes } = await totalCodesQuery;

  const usedEvaluationsQuery = supabase
    .from("voting_code_usage")
    .select("*", { count: "exact", head: true });

  if (selectedPeriodId) {
    usedEvaluationsQuery.eq("period_id", selectedPeriodId);
  }

  const { count: usedEvaluations } = await usedEvaluationsQuery;

  const questionMap = new Map();

  (questions || []).forEach((question: any) => {
    questionMap.set(question.id, {
      question: question.question,
      category: Array.isArray(question.evaluation_categories)
        ? question.evaluation_categories[0]?.name || "Bez kategórie"
        : question.evaluation_categories?.name || "Bez kategórie",
    });
  });

  const employeesWithStats = (employees || []).map((employee: any) => {
    const employeeEvaluations =
      evaluations?.filter(
        (evaluation: any) =>
          evaluation.evaluated_employee_id === employee.id
      ) || [];

    const employeeEvaluationIds = employeeEvaluations.map(
      (evaluation: any) => evaluation.id
    );

    const employeeAnswers =
      answers?.filter((answer: any) =>
        employeeEvaluationIds.includes(answer.evaluation_id)
      ) || [];

    const scores = employeeAnswers
      .map((answer: any) => Number(answer.score))
      .filter((score: number) => Number.isFinite(score));

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
        weight: Number(type.weight || 0),
        average: typeAverage,
        answerCount: typeScores.length,
      };
    });

    const availableTypeResults = typeResults.filter(
      (type: any) => type.average !== null && type.weight > 0
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
        categoryStats[categoryName].total /
        categoryStats[categoryName].count;
    });

    return {
      ...employee,
      evaluationCount: employeeEvaluations.length,
      answerCount: scores.length,
      average,
      typeResults,
      categoryStats,
    };
  });

  const sortedEmployees = [...employeesWithStats].sort((a, b) => {
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
      ? overallScores.reduce(
          (sum: number, score: number) => sum + score,
          0
        ) / overallScores.length
      : null;

  const categorySummary = getCategorySummary(employeesWithStats);

  const strongestCategories = categorySummary.slice(0, 5);

  const riskiestCategories = [...categorySummary]
    .sort((a, b) => a.average - b.average)
    .slice(0, 5);

  const topEmployees = sortedEmployees
    .filter((employee: any) => employee.average !== null)
    .slice(0, 10);

  const weakestEmployees = [...sortedEmployees]
    .filter((employee: any) => employee.average !== null)
    .sort((a, b) => a.average - b.average)
    .slice(0, 10);

  const trainingPlanSummary =
    getTrainingPlanSummary(employeesWithStats);

  const departmentBenchmarkMap: Record<
    string,
    {
      departmentName: string;
      employeeIds: Set<string>;
      totalAverage: number;
      averageCount: number;
      categories: Record<
        string,
        {
          total: number;
          count: number;
        }
      >;
    }
  > = {};

  employeesWithStats.forEach((employee: any) => {
    if (employee.average === null) {
      return;
    }

    const departmentName = getDepartmentName(employee);

    if (!departmentBenchmarkMap[departmentName]) {
      departmentBenchmarkMap[departmentName] = {
        departmentName,
        employeeIds: new Set<string>(),
        totalAverage: 0,
        averageCount: 0,
        categories: {},
      };
    }

    const department = departmentBenchmarkMap[departmentName];

    department.employeeIds.add(employee.id);
    department.totalAverage += Number(employee.average);
    department.averageCount += 1;

    Object.entries(employee.categoryStats).forEach(
      ([categoryName, stats]: any) => {
        if (!department.categories[categoryName]) {
          department.categories[categoryName] = {
            total: 0,
            count: 0,
          };
        }

        department.categories[categoryName].total += Number(
          stats.total
        );
        department.categories[categoryName].count += Number(
          stats.count
        );
      }
    );
  });

  const departmentBenchmark = Object.values(departmentBenchmarkMap)
    .map((department) => ({
      departmentName: department.departmentName,
      employeeCount: department.employeeIds.size,
      overallAverage:
        department.averageCount > 0
          ? department.totalAverage / department.averageCount
          : null,
      categories: Object.fromEntries(
        Object.entries(department.categories).map(
          ([categoryName, stats]) => [
            categoryName,
            stats.count > 0
              ? stats.total / stats.count
              : null,
          ]
        )
      ) as Record<string, number | null>,
    }))
    .sort((a, b) => {
      if (
        a.overallAverage === null &&
        b.overallAverage === null
      ) {
        return 0;
      }

      if (a.overallAverage === null) {
        return 1;
      }

      if (b.overallAverage === null) {
        return -1;
      }

      return b.overallAverage - a.overallAverage;
    });

  const benchmarkCategoryNames = Array.from(
    new Set(
      departmentBenchmark.flatMap((department) =>
        Object.keys(department.categories)
      )
    )
  );

  return (
    <main style={pageStyle}>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.onload = function () {
              setTimeout(function () {
                window.print();
              }, 300);
            };
          `,
        }}
      />

      <div
        style={{
          textAlign: "center",
          marginBottom: "26px",
        }}
      >
        <h1
          style={{
            fontSize: "21pt",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          Celkový manažérsky report anonymného hodnotenia
        </h1>

        <p
          style={{
            marginTop: "10px",
            marginBottom: 0,
            fontSize: "15pt",
            fontWeight: "bold",
            color: "#df4a33",
          }}
        >
          Hodnotiace obdobie:{" "}
          {selectedPeriod?.name || "Neuvedené"}
        </p>

        <p style={{ marginTop: "6px" }}>
          Senior dom Svida
        </p>
      </div>

      <h2 style={sectionTitle}>1. Základné údaje</h2>

      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={cellTitle}>Počet anonymných kódov</td>
            <td style={cellValue}>{totalCodes || 0}</td>
          </tr>

          <tr>
            <td style={cellTitle}>
              Počet odoslaných hodnotení
            </td>
            <td style={cellValue}>{usedEvaluations || 0}</td>
          </tr>

          <tr>
            <td style={cellTitle}>
              Počet hodnotených zamestnancov
            </td>
            <td style={cellValue}>
              {evaluatedEmployees.length}
            </td>
          </tr>

          <tr>
            <td style={cellTitle}>
              Počet sledovaných zamestnancov
            </td>
            <td style={cellValue}>
              {employees?.length || 0}
            </td>
          </tr>

          <tr>
            <td style={cellTitle}>
              Celkový priemer hodnotenia
            </td>
            <td style={cellValue}>
              {overallAverage !== null
                ? overallAverage.toFixed(2)
                : "—"}
            </td>
          </tr>

          <tr>
            <td style={cellTitle}>Celková úroveň</td>
            <td style={cellValue}>
              {getScoreLevel(overallAverage)}
            </td>
          </tr>
        </tbody>
      </table>

      <section style={printSectionStyle}>
        <h2 style={sectionTitle}>
          2. Benchmark medzi úsekmi
        </h2>

        <p
          style={{
            marginTop: "0",
            marginBottom: "10px",
          }}
        >
          Porovnanie celkového výsledku a jednotlivých
          oblastí medzi úsekmi.
        </p>

        {departmentBenchmark.length > 0 ? (
          <>
            <h3 style={subSectionTitle}>
              Celkový výsledok podľa úsekov
            </h3>

            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={cellTitle}>Úsek</th>
                  <th style={cellTitle}>
                    Celkový výsledok
                  </th>
                  <th style={cellTitle}>
                    Hodnotení zamestnanci
                  </th>
                </tr>
              </thead>

              <tbody>
                {departmentBenchmark.map((department) => (
                  <tr key={department.departmentName}>
                    <td style={cellValue}>
                      <strong>
                        {department.departmentName}
                      </strong>
                    </td>

                    <td style={benchmarkCell}>
                      {department.overallAverage !== null ? (
                        <span
                          style={getBenchmarkScoreStyle(
                            department.overallAverage
                          )}
                        >
                          {department.overallAverage.toFixed(
                            2
                          )}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td style={benchmarkCell}>
                      {department.employeeCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={subSectionTitle}>
              Výsledky jednotlivých oblastí
            </h3>

            <table style={compactBenchmarkTableStyle}>
              <thead>
                <tr>
                  <th style={compactBenchmarkCategoryHeaderCell}>
                    Oblasť
                  </th>

                  {departmentBenchmark.map((department) => (
                    <th
                      key={department.departmentName}
                      style={compactBenchmarkHeaderCell}
                    >
                      {department.departmentName}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {benchmarkCategoryNames.map((categoryName) => (
                  <tr key={categoryName}>
                    <td style={compactBenchmarkCategoryCell}>
                      <strong>{categoryName}</strong>
                    </td>

                    {departmentBenchmark.map((department) => {
                      const categoryAverage =
                        department.categories[
                          categoryName
                        ] ?? null;

                      return (
                        <td
                          key={`${categoryName}-${department.departmentName}`}
                          style={compactBenchmarkValueCell}
                        >
                          {categoryAverage !== null ? (
                            <span
                              style={getCompactBenchmarkScoreStyle(
                                categoryAverage
                              )}
                            >
                              {categoryAverage.toFixed(2)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p>
            Zatiaľ nie sú dostupné údaje na porovnanie
            úsekov.
          </p>
        )}
      </section>

      <h2 style={sectionTitle}>
        3. Poradie zamestnancov
      </h2>

      <h3 style={subSectionTitle}>
        Najvyššie hodnotenie
      </h3>

      {topEmployees.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellTitle}>Poradie</th>
              <th style={cellTitle}>Zamestnanec</th>
              <th style={cellTitle}>Pozícia</th>
              <th style={cellTitle}>Priemer</th>
              <th style={cellTitle}>
                Počet hodnotení
              </th>
            </tr>
          </thead>

          <tbody>
            {topEmployees.map(
              (employee: any, index: number) => (
                <tr key={employee.id}>
                  <td style={cellValue}>{index + 1}.</td>
                  <td style={cellValue}>
                    {employee.first_name}{" "}
                    {employee.last_name}
                  </td>
                  <td style={cellValue}>
                    {getPositionName(employee)}
                  </td>
                  <td style={cellValue}>
                    {employee.average.toFixed(2)}
                  </td>
                  <td style={cellValue}>
                    {employee.evaluationCount}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      ) : (
        <p>
          Zatiaľ nie sú dostupné hodnotenia
          zamestnancov.
        </p>
      )}

      <h3 style={subSectionTitle}>
        Najnižšie hodnotenie
      </h3>

      {weakestEmployees.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellTitle}>Poradie</th>
              <th style={cellTitle}>Zamestnanec</th>
              <th style={cellTitle}>Pozícia</th>
              <th style={cellTitle}>Priemer</th>
              <th style={cellTitle}>
                Počet hodnotení
              </th>
            </tr>
          </thead>

          <tbody>
            {weakestEmployees.map(
              (employee: any, index: number) => (
                <tr key={employee.id}>
                  <td style={cellValue}>{index + 1}.</td>
                  <td style={cellValue}>
                    {employee.first_name}{" "}
                    {employee.last_name}
                  </td>
                  <td style={cellValue}>
                    {getPositionName(employee)}
                  </td>
                  <td style={cellValue}>
                    {employee.average.toFixed(2)}
                  </td>
                  <td style={cellValue}>
                    {employee.evaluationCount}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      ) : (
        <p>
          Zatiaľ nie sú dostupné hodnotenia
          zamestnancov.
        </p>
      )}

      <h2 style={sectionTitle}>
        4. Najsilnejšie oblasti
      </h2>

      {strongestCategories.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellTitle}>Oblasť</th>
              <th style={cellTitle}>Priemer</th>
              <th style={cellTitle}>
                Počet odpovedí
              </th>
              <th style={cellTitle}>Úroveň</th>
            </tr>
          </thead>

          <tbody>
            {strongestCategories.map((category) => (
              <tr key={category.categoryName}>
                <td style={cellValue}>
                  {category.categoryName}
                </td>
                <td style={cellValue}>
                  {category.average.toFixed(2)}
                </td>
                <td style={cellValue}>
                  {category.count}
                </td>
                <td style={cellValue}>
                  {getScoreLevel(category.average)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>
          Zatiaľ nie sú dostupné kategórie
          hodnotenia.
        </p>
      )}

      <h2 style={sectionTitle}>
        5. Najrizikovejšie oblasti
      </h2>

      {riskiestCategories.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellTitle}>Oblasť</th>
              <th style={cellTitle}>Priemer</th>
              <th style={cellTitle}>
                Počet odpovedí
              </th>
              <th style={cellTitle}>Úroveň</th>
            </tr>
          </thead>

          <tbody>
            {riskiestCategories.map((category) => (
              <tr key={category.categoryName}>
                <td style={cellValue}>
                  {category.categoryName}
                </td>
                <td style={cellValue}>
                  {category.average.toFixed(2)}
                </td>
                <td style={cellValue}>
                  {category.count}
                </td>
                <td style={cellValue}>
                  {getScoreLevel(category.average)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>
          Zatiaľ nie sú dostupné kategórie
          hodnotenia.
        </p>
      )}

      <h2 style={sectionTitle}>
        6. Podklad pre ročný plán vzdelávania
      </h2>

      {trainingPlanSummary.length > 0 ? (
        <table style={trainingTableStyle}>
          <thead>
            <tr>
              <th style={cellTitle}>
                Vzdelávacia téma
              </th>
              <th style={cellTitle}>
                Počet zamestnancov
              </th>
              <th style={cellTitle}>
                Dôvod zaradenia
              </th>
              <th style={cellTitle}>
                Odporúčaná forma
              </th>
              <th style={cellTitle}>
                Vyhodnotenie účelnosti a prenosu do
                praxe
              </th>
            </tr>
          </thead>

          <tbody>
            {trainingPlanSummary.map((topic) => (
              <tr key={topic.topicName}>
                <td style={cellValue}>
                  {topic.topicName}
                </td>
                <td style={cellValue}>
                  {topic.count}
                </td>
                <td style={cellValue}>
                  {topic.reason}
                </td>
                <td style={cellValue}>
                  {topic.form}
                </td>
                <td style={cellValue}>
                  {topic.verification}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>
          Aktuálne sa nezobrazujú žiadne sledované
          alebo rizikové oblasti pod hranicou 4,10.
          Podklad pre ročný plán vzdelávania nie je
          potrebné doplniť o nové rozvojové témy z
          anonymného hodnotenia.
        </p>
      )}

      <h2 style={sectionTitle}>
        7. Záver manažéra kvality
      </h2>

      {overallAverage !== null ? (
        <p>
          Celkové anonymné hodnotenie dosiahlo priemer{" "}
          <strong>{overallAverage.toFixed(2)}</strong>,
          čo zodpovedá úrovni{" "}
          <strong>
            {getScoreLevel(overallAverage).toLowerCase()}
          </strong>
          . Výsledky je vhodné použiť ako manažérsky
          podklad pre hodnotiace rozhovory,
          individuálne plány ďalšieho vzdelávania,
          ročný plán vzdelávania zamestnancov a
          identifikáciu oblastí, ktoré si vyžadujú
          metodické vedenie, zaškolenie alebo
          supervíziu.
        </p>
      ) : (
        <p>
          Zatiaľ nie sú dostupné žiadne odoslané
          hodnotenia. Záver manažéra kvality bude možné
          vytvoriť po prijatí prvých anonymných
          hodnotení.
        </p>
      )}

      <h2 style={sectionTitle}>
        8. Vyjadrenie / záver manažéra kvality
      </h2>

      <div style={textBoxStyle}>
        ....................................................................................................
        <br />
        ....................................................................................................
        <br />
        ....................................................................................................
        <br />
        ....................................................................................................
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          marginTop: "46px",
        }}
      >
        <div>
          <div
            style={{
              borderBottom: "1px solid #000",
              height: "42px",
            }}
          />
          <p
            style={{
              marginTop: "6px",
              textAlign: "center",
            }}
          >
            Dátum
          </p>
        </div>

        <div>
          <div
            style={{
              borderBottom: "1px solid #000",
              height: "42px",
            }}
          />
          <p
            style={{
              marginTop: "6px",
              textAlign: "center",
            }}
          >
            Podpis manažéra kvality
          </p>
        </div>
      </div>
    </main>
  );
}

const pageStyle = {
  maxWidth: "1120px",
  margin: "0 auto",
  padding: "28px",
  background: "#ffffff",
  color: "#000000",
  fontFamily: "Arial, sans-serif",
  fontSize: "11pt",
  lineHeight: 1.4,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  tableLayout: "fixed" as const,
  marginTop: "8px",
  marginBottom: "18px",
};

const trainingTableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  tableLayout: "fixed" as const,
  marginTop: "8px",
  marginBottom: "18px",
  fontSize: "8pt",
};

const cellTitle = {
  fontWeight: "bold",
  padding: "6px",
  border: "1px solid #000",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  overflowWrap: "break-word" as const,
};

const cellValue = {
  padding: "6px",
  border: "1px solid #000",
  verticalAlign: "top" as const,
  overflowWrap: "break-word" as const,
};

const sectionTitle = {
  fontSize: "14pt",
  fontWeight: "bold",
  marginTop: "22px",
  marginBottom: "8px",
  pageBreakAfter: "avoid" as const,
};

const subSectionTitle = {
  fontSize: "12pt",
  fontWeight: "bold",
  marginTop: "14px",
  marginBottom: "6px",
  pageBreakAfter: "avoid" as const,
};

const printSectionStyle = {
  width: "100%",
  maxWidth: "100%",
};

const textBoxStyle = {
  border: "1px solid #000",
  minHeight: "100px",
  marginTop: "8px",
  padding: "8px",
};

const benchmarkCell = {
  padding: "6px",
  border: "1px solid #000",
  verticalAlign: "middle" as const,
  textAlign: "center" as const,
};

const compactBenchmarkTableStyle = {
  width: "100%",
  maxWidth: "100%",
  borderCollapse: "collapse" as const,
  tableLayout: "fixed" as const,
  marginTop: "8px",
  marginBottom: "18px",
  fontSize: "7pt",
};

const compactBenchmarkCategoryHeaderCell = {
  width: "28%",
  padding: "4px",
  border: "1px solid #000",
  textAlign: "left" as const,
  verticalAlign: "middle" as const,
  background: "#f3f4f6",
  fontWeight: "bold",
  overflowWrap: "break-word" as const,
};

const compactBenchmarkHeaderCell = {
  padding: "4px 2px",
  border: "1px solid #000",
  textAlign: "center" as const,
  verticalAlign: "middle" as const,
  background: "#f3f4f6",
  fontWeight: "bold",
  fontSize: "6.5pt",
  lineHeight: 1.15,
  overflowWrap: "anywhere" as const,
};

const compactBenchmarkCategoryCell = {
  width: "28%",
  padding: "4px",
  border: "1px solid #000",
  textAlign: "left" as const,
  verticalAlign: "middle" as const,
  lineHeight: 1.2,
  overflowWrap: "break-word" as const,
};

const compactBenchmarkValueCell = {
  padding: "4px 2px",
  border: "1px solid #000",
  textAlign: "center" as const,
  verticalAlign: "middle" as const,
};