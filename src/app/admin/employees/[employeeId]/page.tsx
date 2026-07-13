export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

function formatScore(value: number | null) {
  if (value === null) {
    return "–";
  }

  return value.toFixed(2).replace(".", ",");
}

function formatChange(value: number | null) {
  if (value === null) {
    return "–";
  }

  const formatted = Math.abs(value)
    .toFixed(2)
    .replace(".", ",");

  if (value > 0) {
    return `+${formatted}`;
  }

  if (value < 0) {
    return `-${formatted}`;
  }

  return "0,00";
}

function formatPercentage(value: number | null) {
  if (value === null) {
    return "–";
  }

  const formatted = Math.abs(value)
    .toFixed(1)
    .replace(".", ",");

  if (value > 0) {
    return `+${formatted} %`;
  }

  if (value < 0) {
    return `-${formatted} %`;
  }

  return "0,0 %";
}

function getScoreClass(score: number | null) {
  if (score === null) {
    return "bg-gray-100 text-gray-600";
  }

  if (score >= 4.1) {
    return "bg-green-100 text-green-800";
  }

  if (score > 3) {
    return "bg-orange-100 text-orange-800";
  }

  return "bg-red-100 text-red-800";
}

function getChangeClass(change: number | null) {
  if (change === null || Math.abs(change) < 0.05) {
    return "text-gray-700";
  }

  if (change > 0) {
    return "text-green-700";
  }

  return "text-red-700";
}

function getTrend(
  latestChange: number | null,
  validPeriodCount: number
) {
  if (validPeriodCount < 2 || latestChange === null) {
    return {
      label: "Nedostatok údajov",
      description:
        "Trend bude možné vyhodnotiť po získaní výsledkov najmenej z dvoch hodnotiacich období.",
      className: "bg-gray-100 text-gray-700",
    };
  }

  if (latestChange > 0.05) {
    return {
      label: "Zlepšovanie",
      description:
        "Výsledok zamestnanca sa oproti predchádzajúcemu hodnotiacemu obdobiu zlepšil.",
      className: "bg-green-100 text-green-800",
    };
  }

  if (latestChange < -0.05) {
    return {
      label: "Zhoršovanie",
      description:
        "Výsledok zamestnanca sa oproti predchádzajúcemu hodnotiacemu obdobiu zhoršil.",
      className: "bg-red-100 text-red-800",
    };
  }

  return {
    label: "Stabilný výsledok",
    description:
      "Výsledok zamestnanca je v porovnaní s predchádzajúcim obdobím stabilný.",
    className: "bg-blue-100 text-blue-800",
  };
}

function EmployeeResultsChart({
  results,
}: {
  results: Array<{
    periodId: string;
    periodName: string;
    weightedScore: number | null;
  }>;
}) {
  const chartResults = results.filter(
    (
      result
    ): result is {
      periodId: string;
      periodName: string;
      weightedScore: number;
    } =>
      result.weightedScore !== null &&
      Number.isFinite(result.weightedScore)
  );

  if (chartResults.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
        Pre zamestnanca zatiaľ nie sú dostupné výsledky,
        ktoré by bolo možné zobraziť v grafe.
      </div>
    );
  }

  const chartWidth = 1000;
  const chartHeight = 360;
  const paddingLeft = 70;
  const paddingRight = 40;
  const paddingTop = 35;
  const paddingBottom = 75;

  const plotWidth =
    chartWidth - paddingLeft - paddingRight;

  const plotHeight =
    chartHeight - paddingTop - paddingBottom;

  const minimumScore = 1;
  const maximumScore = 5;

  function getX(index: number) {
    if (chartResults.length === 1) {
      return paddingLeft + plotWidth / 2;
    }

    return (
      paddingLeft +
      (index / (chartResults.length - 1)) * plotWidth
    );
  }

  function getY(score: number) {
    const normalized =
      (score - minimumScore) /
      (maximumScore - minimumScore);

    return (
      paddingTop +
      plotHeight -
      normalized * plotHeight
    );
  }

  const points = chartResults
    .map(
      (result, index) =>
        `${getX(index)},${getY(result.weightedScore)}`
    )
    .join(" ");

  const yAxisValues = [1, 2, 3, 4, 5];

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="min-w-[760px] w-full"
        role="img"
        aria-label="Graf vývoja celkového výsledku zamestnanca podľa hodnotiacich období"
      >
        <rect
          x="0"
          y="0"
          width={chartWidth}
          height={chartHeight}
          fill="#ffffff"
        />

        {yAxisValues.map((value) => {
          const y = getY(value);

          return (
            <g key={value}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />

              <text
                x={paddingLeft - 18}
                y={y + 5}
                textAnchor="end"
                fontSize="14"
                fill="#6b7280"
              >
                {value.toFixed(1).replace(".", ",")}
              </text>
            </g>
          );
        })}

        <line
          x1={paddingLeft}
          y1={paddingTop}
          x2={paddingLeft}
          y2={chartHeight - paddingBottom}
          stroke="#9ca3af"
          strokeWidth="1.5"
        />

        <line
          x1={paddingLeft}
          y1={chartHeight - paddingBottom}
          x2={chartWidth - paddingRight}
          y2={chartHeight - paddingBottom}
          stroke="#9ca3af"
          strokeWidth="1.5"
        />

        {chartResults.length > 1 && (
          <polyline
            points={points}
            fill="none"
            stroke="#df4a33"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {chartResults.map((result, index) => {
          const x = getX(index);
          const y = getY(result.weightedScore);

          return (
            <g key={result.periodId}>
              <circle
                cx={x}
                cy={y}
                r="7"
                fill="#df4a33"
                stroke="#ffffff"
                strokeWidth="3"
              />

              <text
                x={x}
                y={y - 16}
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill="#111827"
              >
                {formatScore(result.weightedScore)}
              </text>

              <text
                x={x}
                y={chartHeight - paddingBottom + 30}
                textAnchor="middle"
                fontSize="13"
                fontWeight="600"
                fill="#374151"
              >
                {result.periodName}
              </text>
            </g>
          );
        })}

        <text
          x="20"
          y={chartHeight / 2}
          textAnchor="middle"
          fontSize="13"
          fontWeight="600"
          fill="#6b7280"
          transform={`rotate(-90 20 ${chartHeight / 2})`}
        >
          Celkový vážený výsledok
        </text>
      </svg>
    </div>
  );
}

export default async function EmployeeCardPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;

  const { data: employeeData, error: employeeError } =
    await supabase
      .from("employees")
      .select(`
        id,
        first_name,
        last_name,
        positions(name),
        departments(name),
        is_active
      `)
      .eq("id", employeeId)
      .maybeSingle();

  if (employeeError || !employeeData) {
    notFound();
  }

  const employee = employeeData as any;

  const positionName = Array.isArray(employee.positions)
    ? employee.positions[0]?.name || "–"
    : employee.positions?.name || "–";

  const departmentName = Array.isArray(employee.departments)
    ? employee.departments[0]?.name || "–"
    : employee.departments?.name || "–";

  const { data: periods, error: periodsError } =
    await supabase
      .from("evaluation_periods")
      .select("id, name, date_from, date_to, is_active")
      .order("date_from", { ascending: true });

  const { data: evaluationTypes, error: typesError } =
    await supabase
      .from("evaluation_types")
      .select("id, code, name, weight")
      .eq("is_active", true);

  const { data: evaluations, error: evaluationsError } =
    await supabase
      .from("evaluations")
      .select(`
        id,
        period_id,
        evaluation_type,
        evaluation_type_id,
        evaluation_answers(score)
      `)
      .eq("evaluated_employee_id", employeeId)
      .eq("is_submitted", true);

  const hasDataError =
    periodsError || typesError || evaluationsError;

  const periodResults = (periods || []).map(
    (period: any) => {
      const periodEvaluations = (
        evaluations || []
      ).filter(
        (evaluation: any) =>
          evaluation.period_id === period.id
      );

      const typeResults = (evaluationTypes || []).map(
        (type: any) => {
          const evaluationsByType =
            periodEvaluations.filter(
              (evaluation: any) => {
                if (evaluation.evaluation_type_id) {
                  return (
                    evaluation.evaluation_type_id ===
                    type.id
                  );
                }

                return (
                  evaluation.evaluation_type ===
                  type.code
                );
              }
            );

          const evaluationAverages = evaluationsByType
            .map((evaluation: any) => {
              const scores = (
                evaluation.evaluation_answers || []
              )
                .map((answer: any) =>
                  Number(answer.score)
                )
                .filter((score: number) =>
                  Number.isFinite(score)
                );

              return average(scores);
            })
            .filter(
              (
                value: number | null
              ): value is number => value !== null
            );

          return {
            id: type.id,
            code: type.code,
            name: type.name,
            weight: Number(type.weight || 0),
            average: average(evaluationAverages),
            evaluationCount:
              evaluationAverages.length,
          };
        }
      );

      const availableTypes = typeResults.filter(
        (type: any) =>
          type.average !== null && type.weight > 0
      );

      const availableWeight = availableTypes.reduce(
        (sum: number, type: any) =>
          sum + type.weight,
        0
      );

      const weightedScore =
        availableWeight > 0
          ? availableTypes.reduce(
              (sum: number, type: any) =>
                sum +
                Number(type.average) * type.weight,
              0
            ) / availableWeight
          : null;

      const peer = typeResults.find(
        (type: any) => type.code === "peer"
      );

      const self = typeResults.find(
        (type: any) => type.code === "self"
      );

      const manager = typeResults.find(
        (type: any) => type.code === "manager"
      );

      return {
        periodId: period.id,
        periodName: period.name,
        dateFrom: period.date_from,
        dateTo: period.date_to,
        isActive: period.is_active,
        weightedScore,
        peerAverage: peer?.average ?? null,
        selfAverage: self?.average ?? null,
        managerAverage: manager?.average ?? null,
        evaluationCount: periodEvaluations.length,
      };
    }
  );

  const validResults = periodResults.filter(
    (period: any) => period.weightedScore !== null
  );

  const allScores = validResults.map(
    (period: any) => Number(period.weightedScore)
  );

  const firstResult = validResults[0] || null;

  const latestResult =
    validResults.length > 0
      ? validResults[validResults.length - 1]
      : null;

  const previousResult =
    validResults.length > 1
      ? validResults[validResults.length - 2]
      : null;

  const latestChange =
    latestResult && previousResult
      ? Number(latestResult.weightedScore) -
        Number(previousResult.weightedScore)
      : null;

  const totalChange =
    latestResult &&
    firstResult &&
    validResults.length > 1
      ? Number(latestResult.weightedScore) -
        Number(firstResult.weightedScore)
      : null;

  const percentageChange =
    totalChange !== null &&
    firstResult?.weightedScore !== null &&
    Number(firstResult.weightedScore) !== 0
      ? (totalChange /
          Number(firstResult.weightedScore)) *
        100
      : null;

  const averageAcrossPeriods = average(allScores);

  const bestResult =
    validResults.length > 0
      ? validResults.reduce(
          (best: any, current: any) =>
            Number(current.weightedScore) >
            Number(best.weightedScore)
              ? current
              : best
        )
      : null;

  const worstResult =
    validResults.length > 0
      ? validResults.reduce(
          (worst: any, current: any) =>
            Number(current.weightedScore) <
            Number(worst.weightedScore)
              ? current
              : worst
        )
      : null;

  const trend = getTrend(
    latestChange,
    validResults.length
  );

  return (
    <main className="mx-auto max-w-7xl p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#df4a33]">
            Karta zamestnanca
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {employee.first_name}{" "}
            {employee.last_name}
          </h1>

          <p className="mt-2 text-gray-600">
            {positionName}
          </p>

          <p className="mt-1 text-gray-500">
            {departmentName}
          </p>
        </div>

        <Link
          href="/admin/results"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Späť na výsledky
        </Link>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Zamestnanec
          </p>

          <p className="mt-2 text-xl font-bold text-gray-900">
            {employee.first_name}{" "}
            {employee.last_name}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Pracovná pozícia
          </p>

          <p className="mt-2 text-xl font-bold text-gray-900">
            {positionName}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Úsek
          </p>

          <p className="mt-2 text-xl font-bold text-gray-900">
            {departmentName}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Stav
          </p>

          <p
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-bold ${
              employee.is_active
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {employee.is_active
              ? "Aktívny"
              : "Neaktívny"}
          </p>
        </div>
      </div>

      {hasDataError && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          Niektoré historické údaje sa nepodarilo
          načítať. Skontroluj pripojenie k databáze.
        </div>
      )}

      <section className="mt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Štatistický sumár
          </h2>

          <p className="mt-2 text-gray-600">
            Súhrn výsledkov zamestnanca naprieč
            hodnotiacimi obdobiami.
          </p>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Počet období s výsledkom
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {validResults.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Aktuálny výsledok
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {formatScore(
                latestResult?.weightedScore ?? null
              )}
            </p>

            {latestResult && (
              <p className="mt-2 text-sm text-gray-500">
                {latestResult.periodName}
              </p>
            )}
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Priemer za všetky obdobia
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {formatScore(averageAcrossPeriods)}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Zmena oproti minulému obdobiu
            </p>

            <p
              className={`mt-2 text-3xl font-bold ${getChangeClass(
                latestChange
              )}`}
            >
              {formatChange(latestChange)}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Celková zmena od prvého obdobia
            </p>

            <p
              className={`mt-2 text-3xl font-bold ${getChangeClass(
                totalChange
              )}`}
            >
              {formatChange(totalChange)}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              {formatPercentage(percentageChange)}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Najlepší výsledok
            </p>

            <p className="mt-2 text-3xl font-bold text-green-700">
              {formatScore(
                bestResult?.weightedScore ?? null
              )}
            </p>

            {bestResult && (
              <p className="mt-2 text-sm text-gray-500">
                {bestResult.periodName}
              </p>
            )}
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Najnižší výsledok
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-700">
              {formatScore(
                worstResult?.weightedScore ?? null
              )}
            </p>

            {worstResult && (
              <p className="mt-2 text-sm text-gray-500">
                {worstResult.periodName}
              </p>
            )}
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Trend vývoja
            </p>

            <p
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-bold ${trend.className}`}
            >
              {trend.label}
            </p>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {trend.description}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Graf vývoja výsledkov
          </h2>

          <p className="mt-2 text-gray-600">
            Vývoj celkového váženého výsledku
            zamestnanca naprieč hodnotiacimi obdobiami.
          </p>
        </div>

        <div className="mt-5 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
          <EmployeeResultsChart
            results={periodResults.map((period: any) => ({
              periodId: period.periodId,
              periodName: period.periodName,
              weightedScore: period.weightedScore,
            }))}
          />

          {validResults.length === 1 && (
            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">
              Aktuálne je dostupný výsledok iba za jedno
              hodnotiace obdobie. Graf preto zobrazuje
              jeden bod. Vývojová čiara a trend sa
              automaticky zobrazia po získaní výsledkov
              z ďalšieho obdobia.
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            História výsledkov
          </h2>

          <p className="mt-2 text-gray-600">
            Výsledky zamestnanca v jednotlivých
            hodnotiacich obdobiach.
          </p>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[950px] text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-3 text-left">
                  Hodnotiace obdobie
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
              {periodResults.map((period: any) => (
                <tr
                  key={period.periodId}
                  className="border-b last:border-b-0"
                >
                  <td className="p-3">
                    <div className="font-semibold text-gray-900">
                      {period.periodName}
                    </div>

                    {period.isActive && (
                      <span className="mt-1 inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                        Aktívne obdobie
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-center font-semibold">
                    {formatScore(
                      period.peerAverage
                    )}
                  </td>

                  <td className="p-3 text-center font-semibold">
                    {formatScore(
                      period.selfAverage
                    )}
                  </td>

                  <td className="p-3 text-center font-semibold">
                    {formatScore(
                      period.managerAverage
                    )}
                  </td>

                  <td className="p-3 text-center">
                    <span
                      className={`inline-flex min-w-16 justify-center rounded-full px-3 py-1 font-bold ${getScoreClass(
                        period.weightedScore
                      )}`}
                    >
                      {formatScore(
                        period.weightedScore
                      )}
                    </span>
                  </td>

                  <td className="p-3 text-center font-semibold">
                    {period.evaluationCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {periodResults.length === 0 && (
          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
            Zatiaľ nie sú vytvorené žiadne hodnotiace
            obdobia.
          </div>
        )}
      </section>
    </main>
  );
}