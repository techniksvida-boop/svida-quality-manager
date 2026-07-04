export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";

function scoreLevel(score: number | null) {
  if (score === null) return "Bez hodnotenia";
  if (score >= 4.1) return "Dobrá úroveň";
  if (score > 3) return "Oblasť na sledovanie";
  return "Riziková oblasť";
}

function positionName(employee: any) {
  if (Array.isArray(employee.positions)) {
    return employee.positions[0]?.name || "";
  }

  return employee.positions?.name || "";
}

export default async function PrintReportPage() {
  const { data: employees } = await supabase
    .from("employees")
    .select("id, first_name, last_name, positions(name)")
    .eq("is_active", true)
    .order("last_name");

  const { data: evaluations } = await supabase
    .from("evaluations")
    .select("id, evaluated_employee_id")
    .eq("is_submitted", true);

  const { data: questions } = await supabase
    .from("evaluation_questions")
    .select("id, evaluation_categories    .select("id, evaluation_categories    .select(ta    .select("id, evaluation_categories("e    .select("id, evaluation_categories  ion_    .select("id, evaluation_categories    :     .select("id, evaluation_categories    .ting    .select("id, evaluation_categories    .she    .select("id, evaluation_categedEvaluations }     .select("id, evaluatim("voting_code_usage")
    .select("*", { count: "exact", head: true });

  const questionMap = new Map();

  (questions || []).forEach((question: any) => {
    questionMap.set(
      q      q      q      q      q      q      q    es?.      q      q      q      q      q      q ns      q      q     s =       q      q      q      q      q      q
    const emplo    const emplo    const al    const emplo 
        (evaluation) => evaluation.evaluated_employee_id === employee.id
      )       )       )       )       )       ) = employeeEvaluations.map(
                                                con                                rs                                                con                                rs                                                con                                rs                                                con                                rs                                                con                                rs                                                con                Each((answer: any) => {
      const categoryName = qu      const categoryName = qu  d)       const categoryName = qu      const catcateg      const categor c      const categoryName = qu      const categoryName = qu  d)       const categoryName = qu      const catcateg      const categor c      const categoryName = qu      });

    return {
      ...employee,
      evaluationCount: employeeEvaluations.length,
      answerCount: employeeAnswers.length,
                                                                          = employeesWithStats.filter(
    (employee: any) => employee.average !== null
  );

  const overallAverage =
    evaluatedEmployees.length > 0
      ? evaluatedEmployees.reduce(
          (sum: number, employee: any) => sum + employee.average,
          0
        ) / evaluatedEmployees.length
      : null;

  const sortedEmployees = [...employeesWithStats].sort((a: any, b: any) => {
    if (a.average === null && b.average === null) return 0;
    if (a.average === null) return 1;
    if (b.average === null) return    if (b.average === null) return    if (b.average === null) return    if (b.average === null) return    if (b.average === null) return    if (b.average === null) return    if (b.average === null) return    if (b.average === null) return    if (b.average === null) return    if (b.average === null) ret       if (b.ayS    if (b.averyName    if (b.average === null) return    if (b.averary    if (b.average === null) return    if ;
    if (b.average === null) return    if (b.average === null) return    if (b.average === null) retuent    if (b.average === null) return    if (b.ave>          name,
      average: data.count > 0 ? data.total / data.count : 0,
      count: data.count,      count: data.count,      count: data.count,      count:t strongestCategor      count: data.count,      count:t       count:gor      count: data.count,      count: data.count,      count: data.count, ce(0      count: data.count,      count: data.count,      cou         count: data.count,      count:     __html: `
            window.onload = function () {
              setTimeout(function () {
                window.print();
              }, 300);
            };
          `,
        }}
      />

      <h1 style={title}>Celkový manažérsky report anonymného hodnotenia</h1>
      <p style={subtitle}>Senior dom Svida</p>

      <h2 style={section}>1. Základné údaje</h2>

      <table style={table}>
        <tbody>
          <tr>
            <td style={th}>            <td style={th}>            <td style={th}>            <td style={th}>            <td style={th}>            <td style={th}>            <td style={th}>  en�            <td style={th}>            <td style={th}>     d>            <td style={th}>            <td style={th}>            <td style={th}>            <td style={th}>            <td style={th}>            <td style={th}>            <td style={th}>  en�            <td style={th}>            <td style={th}>     d>            <td style={th}>            <td style={th}>            <td style={th}>   >
                                          r                                     e={                           Average !== null ? overallAv          xed(2                       <  d>
                                                                                                                                  rage                                                /tabl                      ection              am             >

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Poradie</th>
            <th style={th}>Zamestnanec</th>
            <th style={th}>Pozícia</th>
            <th style={th}>Priemer</th>
            <th style={th}>Počet hodnotení</th>
          </tr>
        </thead>
        <tbody>
          {sortedEmployees
            .filter((employee: any) => employee.average !== null)
            .map((employee: any, index: number) => (
              <tr key={employee.id}>
                <td style={td}>{index + 1}.</td>
                <td style={td}>
                                                                                                                                                                                            ra                                                                                                                                                                                            ra                                                       <t                                         e={             th                                   r</th                                        ved�                                       e�                               </thead>
                                                ap               (              tr               name}>
              <td style={td}>{category.name}</td>
              <td style={td}>{category.average.toFixed(2)}</td>
              <td style={td}>{category.count}</td>
                                                            /t                               ))}
        </tbody>
      </table>

      <h2 style={section}>4. Najrizikovejšie oblasti</h2>

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Oblasť</th>
            <th style={th}>Priemer</th>
            <th style={th}>Počet odpovedí</th>
            <th style={th}>Úroveň</th>
          </tr>
        </thead>
        <tbody>
          {riskiestCategories.map((category) => (
            <tr key={category.name}>
              <td style={td}>{category.name}</td>
              <td style={td}>{category.average.toFixed(2)}</td>
              <td style={td}>{category.count}</td>
              <td style={td}>{scoreLevel(category.average)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={section}>5. Záver manažéra kvality</h2>      <h2 style={section}>5. Záver manažéra kvality</h2> riemer{" "}
        <strong>
          {overallAverage           {overallAverage           {overallAverage           {overallAverage           {overako           {y podk          {ovtia          {overallAverage           {overallAverage    zdel�          {overallAverage lávania
        z        z     i        z        z     i        z     ad        z        z     i        z   �kol        z        z     i        z        z    sty        z        z     i        z      a�        z     /h        z   iv st        z               z        z     i        z        z     i.......................................................
        <br />
        ....................................................................................................
        <br />
        .        .        .        .        .        .        .        ...        .       ..        .   ..        .    r />
        .......        .......        .......        .......        .......        .......        .......        .......        .......        gna        .....   <        .......        .......        .......        .......        .......        .......        .......        .......        .......        gna        .....   <        .......        .......        .......        .......        .......        ...ag        .......        .......        .......        .......        .......        .......        .......        .......        .......        gna        .....   <        .......        .......        .......        .......        .......        .......        .......        .......        .......        gna        .....   <        .......    t,        ..... "6px",
  marginBottom: "26px",
};

const section = {
  fontSize: "14pt",
  fontWeight: "bold",
  marginTop: "22px",
  marginB  marginB  marginB  marginB  marginB  marginB  marginB  marginB  marginB  marginB  marginB  marginB  marginB  marginB Bottom: "18px",
};

const th = {
  fontWeight: "bold",
  padding: "6px",
  border: "1px solid #000",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
};

const td = {
  padding: "6px",
  border: "1px solid #000",
  verticalAlign: "top" as const,
};

const box = {
  border: "1px solid #000",
  minHeight: "100px",
  marginTop: "8px",
  padding: "8px",
};

const signatures = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "40px",
  marginTop: "46px",
};

const line = {
  borderBottom: "1px solid #000",
  height: "42px",
};

const center = {
  marginTop: "6px",
  textAlign: "center" as const,
};
