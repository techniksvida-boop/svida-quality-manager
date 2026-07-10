export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";

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

export default async function PrintEmployeePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ period?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const requestedPeriodId = resolvedSearchParams?.period;
  const { data: periods } = await supabase
  .from("evaluation_periods")
  .select("id, name, date_from, date_to, is_active")
  .order("date_from", { ascending: false });

const selectedPeriod =
  periods?.find((period: any) => period.id === requestedPeriodId) ||
  periods?.find((period: any) => period.is_active) ||
  periods?.[0];

const selectedPeriodId = selectedPeriod?.id;

  const { data: employee } = await supabase
    .from("employees")
    .select("id, first_name, last_name, positions(name)")
    .eq("id", id)
    .single();

  if (!employee) {
    return (
      <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
        Zamestnanec sa nenašiel.
      </main>
    );
  }

  const { data: evaluations } = selectedPeriodId
  ? await supabase
      .from("evaluations")
      .select("id, evaluated_employee_id, submitted_at")
      .eq("evaluated_employee_id", id)
      .eq("period_id", selectedPeriodId)
      .eq("is_submitted", true)
  : { data: [] };

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

  const employeeEvaluationIds = (evaluations || []).map(
    (evaluation) => evaluation.id
  );

  const questionMap = new Map();

  (questions || []).forEach((question: any) => {
    questionMap.set(question.id, {
      question: question.question,
      category: question.evaluation_categories?.name || "Bez kategórie",
    });
  });

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

  const positiveComments = getCommentsByType(employeeComments, "positive");

  const improvementComments = getCommentsByType(
    employeeComments,
    "improvement"
  );

  const trainingRecommendations = createTrainingRecommendations(categoryStats);

  return (
    <main
      style={{
        maxWidth: "820px",
        margin: "0 auto",
        padding: "28px",
        background: "#ffffff",
        color: "#000000",
        fontFamily: "Arial, sans-serif",
        fontSize: "12pt",
        lineHeight: 1.45,
      }}
    >
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

      <div style={{ textAlign: "center", marginBottom: "24px" }}>
  <h1 style={{ fontSize: "20pt", fontWeight: "bold", margin: 0 }}>
    Záznam z hodnotenia zamestnanca
  </h1>

  <p
    style={{
      marginTop: "10px",
      marginBottom: 0,
      fontSize: "14pt",
      fontWeight: "bold",
      color: "#df4a33",
    }}
  >
    Hodnotiace obdobie: {selectedPeriod?.name || "Neuvedené"}
  </p>

  <p style={{ marginTop: "6px" }}>Senior dom Svida</p>
</div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={cellTitle}>Meno zamestnanca</td>
            <td style={cellValue}>
              {employee.first_name} {employee.last_name}
            </td>
          </tr>

          <tr>
            <td style={cellTitle}>Pracovná pozícia</td>
            <td style={cellValue}>{employee.positions?.[0]?.name || ""}</td>
          </tr>

          <tr>
  <td style={cellTitle}>Hodnotené obdobie</td>
  <td style={cellValue}>
    {selectedPeriod?.name || "Neuvedené"}
    {selectedPeriod?.date_from && selectedPeriod?.date_to
      ? ` (${selectedPeriod.date_from} – ${selectedPeriod.date_to})`
      : ""}
  </td>
</tr>

          <tr>
            <td style={cellTitle}>Dátum hodnotiaceho rozhovoru</td>
            <td style={cellValue}>
              ............................................................
            </td>
          </tr>

          <tr>
            <td style={cellTitle}>Priemerný výsledok hodnotenia</td>
            <td style={cellValue}>
              {average !== null
                ? average.toFixed(2)
                : "Zamestnanec zatiaľ nebol hodnotený"}
            </td>
          </tr>
        </tbody>
      </table>

      <h2 style={sectionTitle}>Výsledky podľa kategórií</h2>

      {Object.keys(categoryStats).length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={cellTitle}>Oblasť</th>
              <th style={cellTitle}>Priemer</th>
              <th style={cellTitle}>Počet odpovedí</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(categoryStats).map(([categoryName, stats]: any) => (
              <tr key={categoryName}>
                <td style={cellValue}>{categoryName}</td>
                <td style={cellValue}>{stats.average.toFixed(2)}</td>
                <td style={cellValue}>{stats.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Zamestnanec zatiaľ nebol hodnotený.</p>
      )}

      <h2 style={sectionTitle}>Silné stránky</h2>

      {positiveComments.length > 0 ? (
        <ul>
          {positiveComments.map((comment: any, index: number) => (
            <li key={index}>{comment.comment_text}</li>
          ))}
        </ul>
      ) : (
        <p>Neboli uvedené slovné komentáre k silným stránkam.</p>
      )}

      <h2 style={sectionTitle}>Oblasti na zlepšenie</h2>

      {improvementComments.length > 0 ? (
        <ul>
          {improvementComments.map((comment: any, index: number) => (
            <li key={index}>{comment.comment_text}</li>
          ))}
        </ul>
      ) : (
        <p>Neboli uvedené slovné komentáre k oblastiam na zlepšenie.</p>
      )}

      <h2 style={sectionTitle}>
        Odporúčanie pre individuálny plán ďalšieho vzdelávania
      </h2>

      {trainingRecommendations.length > 0 ? (
        <div>
          {trainingRecommendations.map(
            (recommendation: Recommendation, index: number) => (
              <div key={index} style={{ marginBottom: "12px" }}>
                <p>
                  <strong>Slabšia / sledovaná oblasť:</strong>{" "}
                  {recommendation.categoryName}
                </p>

                <p>
                  <strong>Priemer:</strong>{" "}
                  {recommendation.average.toFixed(2)}
                </p>

                <p>{recommendation.summary}</p>

                <p>
                  <strong>Odporúčaná forma podpory:</strong>{" "}
                  {recommendation.recommendedForm}
                </p>

                <p>
                  <strong>
                    Spôsob hodnotenia účelnosti, využiteľnosti a prenosu do
                    praxe:
                  </strong>{" "}
                  {recommendation.verificationMethod}
                </p>
              </div>
            )
          )}
        </div>
      ) : employeeEvaluationIds.length > 0 ? (
        <p>
          Zamestnanec nemá v aktuálnom anonymnom hodnotení žiadnu kategóriu s
          priemerom nižším ako 4,10. Individuálny plán ďalšieho vzdelávania je
          možné zamerať na priebežné udržiavanie odbornosti, aktualizačné
          vzdelávanie a osobné odborné ciele zamestnanca.
        </p>
      ) : (
        <p>Odporúčanie bude dostupné po prijatí prvých anonymných hodnotení.</p>
      )}

      <h2 style={sectionTitle}>Navrhované opatrenie / osobný cieľ</h2>

      {trainingRecommendations.length > 0 ? (
        <ul>
          {trainingRecommendations.map(
            (recommendation: Recommendation, index: number) => (
              <li key={index}>{recommendation.suggestedGoal}</li>
            )
          )}
        </ul>
      ) : (
        <p>
          ....................................................................................................
        </p>
      )}

      <h2 style={sectionTitle}>Dohodnuté osobné ciele zamestnanca</h2>

      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px" }}
      >
        <tbody>
          <tr>
            <td style={cellTitle}>Osobný cieľ č. 1</td>
            <td style={cellValue}>
              ....................................................................................................
              <br />
              ....................................................................................................
            </td>
          </tr>

          <tr>
            <td style={cellTitle}>Osobný cieľ č. 2</td>
            <td style={cellValue}>
              ....................................................................................................
              <br />
              ....................................................................................................
            </td>
          </tr>
        </tbody>
      </table>

      <h2 style={sectionTitle}>Dohodnuté úlohy a opatrenia</h2>

      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px" }}
      >
        <thead>
          <tr>
            <th style={cellTitle}>Úloha / opatrenie</th>
            <th style={cellTitle}>Zodpovedná osoba</th>
            <th style={cellTitle}>Termín splnenia</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td style={cellValue}>
              ....................................................................................
              <br />
              ....................................................................................
            </td>
            <td style={cellValue}>....................................</td>
            <td style={cellValue}>....................................</td>
          </tr>

          <tr>
            <td style={cellValue}>
              ....................................................................................
              <br />
              ....................................................................................
            </td>
            <td style={cellValue}>....................................</td>
            <td style={cellValue}>....................................</td>
          </tr>

          <tr>
            <td style={cellValue}>
              ....................................................................................
              <br />
              ....................................................................................
            </td>
            <td style={cellValue}>....................................</td>
            <td style={cellValue}>....................................</td>
          </tr>
        </tbody>
      </table>

      <h2 style={sectionTitle}>
        Spôsob hodnotenia účelnosti, využiteľnosti a prenosu do praxe
      </h2>

      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px" }}
      >
        <tbody>
          <tr>
            <td style={cellTitle}>Spôsob overenia</td>
            <td style={cellValue}>
              ☐ kontrola dokumentácie a záznamov v IS Cygnus
              <br />
              ☐ hodnotiaci rozhovor so zamestnancom
              <br />
              ☐ spätná väzba od vedúceho zamestnanca
              <br />
              ☐ posúdenie pracovných výstupov podľa karty pracovného miesta
              <br />
              ☐ vyhodnotenie splnenia osobného cieľa
              <br />
              ☐ individuálna alebo skupinová supervízia
              <br />
              ☐ iné:
              ........................................................................................
            </td>
          </tr>

          <tr>
            <td style={cellTitle}>Termín vyhodnotenia</td>
            <td style={cellValue}>
              ............................................................
            </td>
          </tr>

          <tr>
            <td style={cellTitle}>Zodpovedná osoba za vyhodnotenie</td>
            <td style={cellValue}>
              ............................................................
            </td>
          </tr>
        </tbody>
      </table>

      <h2 style={sectionTitle}>Vyhodnotenie prijatých opatrení</h2>

      <div
        style={{
          border: "1px solid #000",
          minHeight: "90px",
          marginTop: "8px",
          padding: "8px",
        }}
      >
        ....................................................................................................
        <br />
        ....................................................................................................
        <br />
        ....................................................................................................
      </div>

      <h2 style={sectionTitle}>Vyjadrenie zamestnanca</h2>

      <div
        style={{
          border: "1px solid #000",
          minHeight: "90px",
          marginTop: "8px",
          padding: "8px",
        }}
      >
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
          marginTop: "44px",
        }}
      >
        <div>
          <div style={{ borderBottom: "1px solid #000", height: "42px" }} />
          <p style={{ marginTop: "6px", textAlign: "center" }}>
            Podpis nadriadeného
          </p>
        </div>

        <div>
          <div style={{ borderBottom: "1px solid #000", height: "42px" }} />
          <p style={{ marginTop: "6px", textAlign: "center" }}>
            Podpis zamestnanca
          </p>
        </div>
      </div>
    </main>
  );
}

const cellTitle = {
  width: "32%",
  fontWeight: "bold",
  padding: "6px",
  border: "1px solid #000",
  textAlign: "left" as const,
};

const cellValue = {
  padding: "6px",
  border: "1px solid #000",
};

const sectionTitle = {
  fontSize: "14pt",
  fontWeight: "bold",
  marginTop: "18px",
};