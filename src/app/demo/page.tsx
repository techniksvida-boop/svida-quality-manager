"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Employee = {
  id: number;
  name: string;
  position: string;
};

type Department = {
  id: string;
  name: string;
  description: string;
  employees: Employee[];
};

type Answers = Record<number, number>;

const demoDepartments: Department[] = [
  {
    id: "socialny",
    name: "Sociálny úsek",
    description: "Sociálna práca a podpora klientov",
    employees: [
      {
        id: 1,
        name: "Popoluška",
        position: "Sociálna pracovníčka",
      },
      {
        id: 2,
        name: "Janko Hraško",
        position: "Pracovník sociálnej rehabilitácie",
      },
      {
        id: 3,
        name: "Červená čiapočka",
        position: "Opatrovateľka",
      },
    ],
  },
  {
    id: "zdravotny",
    name: "Zdravotný úsek",
    description: "Ošetrovateľská a zdravotná starostlivosť",
    employees: [
      {
        id: 4,
        name: "Snehulienka",
        position: "Zdravotná sestra",
      },
      {
        id: 5,
        name: "Šípková Ruženka",
        position: "Praktická sestra",
      },
      {
        id: 6,
        name: "Kocúr v čižmách",
        position: "Sanitár",
      },
    ],
  },
  {
    id: "prevadzkovy",
    name: "Prevádzkový úsek",
    description: "Stravovanie, údržba a chod zariadenia",
    employees: [
      {
        id: 7,
        name: "Medovníková baba",
        position: "Kuchárka",
      },
      {
        id: 8,
        name: "Dlhý",
        position: "Údržbár",
      },
      {
        id: 9,
        name: "Široký",
        position: "Prevádzkový pracovník",
      },
    ],
  },
  {
    id: "administrativa",
    name: "Administratívny úsek",
    description: "Riadenie, ekonomika a administratíva",
    employees: [
      {
        id: 10,
        name: "Múdry kráľ",
        position: "Riaditeľ",
      },
      {
        id: 11,
        name: "Zlatovláska",
        position: "Personalistka",
      },
      {
        id: 12,
        name: "Soľ nad zlato",
        position: "Ekonómka",
      },
    ],
  },
];

const demoQuestions = [
  "Komunikuje slušne a zrozumiteľne?",
  "Pristupuje k svojej práci zodpovedne?",
  "Spolupracuje s ostatnými zamestnancami?",
  "Dodržiava pracovné postupy a pravidlá?",
  "Plní svoje úlohy presne a načas?",
  "Je ochotný pomôcť ostatným?",
];

export default function DemoPage() {
  const [demoStarted, setDemoStarted] = useState(false);

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | null
  >(null);

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [selfAssessmentSelected, setSelfAssessmentSelected] = useState(false);

  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [showManagerReport, setShowManagerReport] = useState(false);
  const [showEmployeeReport, setShowEmployeeReport] = useState(false);

  const selectedDepartment = useMemo(
    () =>
      demoDepartments.find(
        (department) => department.id === selectedDepartmentId
      ) ?? null,
    [selectedDepartmentId]
  );

  const evaluationStarted =
    selfAssessmentSelected || selectedEmployee !== null;

  const evaluatedPersonName = selfAssessmentSelected
    ? "Sebahodnotenie"
    : selectedEmployee?.name ?? "";

  const completedQuestions = Object.keys(answers).length;
  const totalQuestions = demoQuestions.length;

  const progressPercentage = Math.round(
    (completedQuestions / totalQuestions) * 100
  );

  const averageScore = useMemo(() => {
    const values = Object.values(answers);

    if (values.length === 0) {
      return 0;
    }

    const total = values.reduce((sum, value) => sum + value, 0);

    return total / values.length;
  }, [answers]);

  const resultLevel = useMemo(() => {
    if (averageScore >= 8) {
      return {
        title: "Výborná úroveň",
        description:
          "Hodnotenie poukazuje na veľmi dobrú úroveň práce a spolupráce.",
        className: "bg-emerald-100 text-emerald-700",
      };
    }

    if (averageScore >= 6) {
      return {
        title: "Dobrá úroveň",
        description:
          "Výsledok je pozitívny, pričom niektoré oblasti možno ďalej rozvíjať.",
        className: "bg-teal-100 text-teal-700",
      };
    }

    if (averageScore >= 4) {
      return {
        title: "Oblasť na sledovanie",
        description:
          "Výsledok naznačuje priestor na zlepšenie vo viacerých oblastiach.",
        className: "bg-amber-100 text-amber-700",
      };
    }

    return {
      title: "Riziková oblasť",
      description:
        "Výsledok poukazuje na potrebu konkrétnych opatrení a ďalšieho rozvoja.",
      className: "bg-red-100 text-red-700",
    };
  }, [averageScore]);

  const strongestArea = useMemo(() => {
    const entries = Object.entries(answers) as [string, number][];

    if (entries.length === 0) {
      return null;
    }

    const [questionIndex, score] = entries.reduce((best, current) =>
      current[1] > best[1] ? current : best
    );

    return {
      question: demoQuestions[Number(questionIndex)],
      score,
    };
  }, [answers]);

  const developmentArea = useMemo(() => {
    const entries = Object.entries(answers) as [string, number][];

    if (entries.length === 0) {
      return null;
    }

    const [questionIndex, score] = entries.reduce((lowest, current) =>
      current[1] < lowest[1] ? current : lowest
    );

    return {
      question: demoQuestions[Number(questionIndex)],
      score,
    };
  }, [answers]);

  const managerComment = useMemo(() => {
    const strongestName =
      strongestArea?.question ?? "najsilnejšie oblasti";

    const developmentName =
      developmentArea?.question ?? "oblasti s priestorom na zlepšenie";

    if (averageScore >= 8.5) {
      return {
        title: "Výborná úroveň",
        paragraphs: [
          `Výsledky hodnotenia poukazujú na veľmi vysokú a stabilnú úroveň pracovného výkonu. Mimoriadne pozitívne bola hodnotená oblasť „${strongestName}“, ktorá predstavuje významnú silnú stránku hodnoteného zamestnanca.`,
          `Aj napriek výbornému výsledku odporúčame priebežne sledovať oblasť „${developmentName}“ a podporovať ďalší odborný rozvoj. Cieľom by malo byť najmä udržanie dosiahnutej úrovne a zdieľanie príkladov dobrej praxe v tíme.`,
          "Výsledky neindikujú závažné nedostatky. Odporúča sa pokračovať v pravidelnom hodnotení, aby bolo možné sledovať dlhodobý vývoj a udržateľnosť kvality výkonu.",
        ],
      };
    }

    if (averageScore >= 7) {
      return {
        title: "Dobrá úroveň",
        paragraphs: [
          `Výsledky hodnotenia naznačujú dobrú a stabilnú úroveň pracovného výkonu. Najlepšie bola hodnotená oblasť „${strongestName}“, ktorá predstavuje pevný základ pre kvalitné plnenie pracovných úloh.`,
          `Priestor na ďalší rozvoj bol identifikovaný najmä v oblasti „${developmentName}“. Odporúča sa zamerať na konkrétne opatrenia, odborné usmernenie alebo cielené vzdelávanie podľa charakteru tejto oblasti.`,
          "Celkové výsledky neindikujú závažné systémové nedostatky. Pravidelné opakovanie hodnotenia umožní sledovať vývoj a objektívne posúdiť účinnosť prijatých opatrení.",
        ],
      };
    }

    if (averageScore >= 5) {
      return {
        title: "Oblasť na sledovanie",
        paragraphs: [
          `Výsledky hodnotenia poukazujú na nerovnomernú úroveň pracovného výkonu. Pozitívne bola hodnotená oblasť „${strongestName}“, na ktorej je možné ďalej stavať.`,
          `Zvýšenú pozornosť je potrebné venovať oblasti „${developmentName}“. Odporúča sa určiť konkrétne očakávania, termíny zlepšenia a spôsob priebežného overovania dosiahnutého pokroku.`,
          "Vhodné je pripraviť krátky rozvojový plán a hodnotenie po primeranom období zopakovať. Cieľom je overiť, či prijaté opatrenia priniesli merateľné zlepšenie.",
        ],
      };
    }

    return {
      title: "Riziková oblasť",
      paragraphs: [
        `Výsledky hodnotenia poukazujú na potrebu zvýšenej manažérskej pozornosti. Za relatívne najsilnejšiu možno považovať oblasť „${strongestName}“, celkový výsledok však zostáva pod požadovanou úrovňou.`,
        `Najvýraznejší priestor na zlepšenie bol identifikovaný v oblasti „${developmentName}“. Odporúča sa bezodkladne stanoviť konkrétne nápravné opatrenia, zodpovednosť a termíny ich splnenia.`,
        "Súčasťou ďalšieho postupu by mal byť individuálny akčný plán, priebežná kontrola a opakované hodnotenie po dohodnutom období.",
      ],
    };
  }, [averageScore, strongestArea, developmentArea]);

  function selectAnswer(questionIndex: number, value: number) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionIndex]: value,
    }));

    setValidationMessage("");
  }

  function submitEvaluation() {
    if (completedQuestions !== totalQuestions) {
      setValidationMessage(
        `Pred odoslaním vyplňte všetky otázky. Zostáva vyplniť ${
          totalQuestions - completedQuestions
        }.`
      );

      return;
    }

    setSubmitted(true);
  }

  function resetDemo() {
    setDemoStarted(false);
    setSelectedDepartmentId(null);
    setSelectedEmployee(null);
    setSelfAssessmentSelected(false);
    setAnswers({});
    setSubmitted(false);
    setValidationMessage("");
    setShowManagerReport(false);
    setShowEmployeeReport(false);
  }

  function backToEvaluationSelection() {
    setSelectedDepartmentId(null);
    setSelectedEmployee(null);
    setSelfAssessmentSelected(false);
    setAnswers({});
    setSubmitted(false);
    setValidationMessage("");
    setShowManagerReport(false);
    setShowEmployeeReport(false);
  }

  function backToEmployees() {
    setSelectedEmployee(null);
    setAnswers({});
    setSubmitted(false);
    setValidationMessage("");
    setShowManagerReport(false);
    setShowEmployeeReport(false);
  }

  if (showEmployeeReport) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => setShowEmployeeReport(false)}
            className="mb-6 inline-flex items-center text-sm font-semibold text-slate-600 transition hover:text-[#06b8ac]"
          >
            ← Späť na výsledok hodnotenia
          </button>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            <div className="bg-gradient-to-r from-[#286aff] to-[#06b8ac] px-6 py-8 text-white sm:px-10">
              <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
                QualityCare 360
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Report zamestnanca
              </h1>

              <p className="mt-2 text-white/85">
                Individuálny prehľad výsledkov hodnotenia
              </p>
            </div>

            <div className="p-6 sm:p-10">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-medium text-slate-500">
                  Hodnotený zamestnanec
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {selectedEmployee?.name ||
                    (selfAssessmentSelected
                      ? "Ukážkový zamestnanec – sebahodnotenie"
                      : "Ukážkový zamestnanec")}
                </h2>

                {selectedEmployee?.position && (
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedEmployee.position}
                  </p>
                )}

                <p className="mt-2 text-sm text-slate-600">
                  Hodnotiace obdobie: 2026
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <p className="text-sm font-medium text-slate-500">
      Celkové skóre
    </p>

    <p className="mt-2 text-3xl font-bold text-slate-900">
      {averageScore.toFixed(1)}
    </p>

    <p className="mt-1 text-sm text-slate-500">
      z 10 bodov
    </p>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <p className="text-sm font-medium text-slate-500">
      Výsledná úroveň
    </p>

    <p className="mt-2 text-xl font-bold text-slate-900">
      {resultLevel.title}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <p className="text-sm font-medium text-slate-500">
      Počet hodnotených oblastí
    </p>

    <p className="mt-2 text-3xl font-bold text-slate-900">
      {demoQuestions.length}
    </p>
  </div>
</div>

<div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
  <button
    type="button"
    onClick={() => setShowEmployeeReport(false)}
    className="rounded-xl border-2 border-slate-300 bg-white px-8 py-4 text-lg font-semibold text-slate-700 transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-600"
  >
    Späť na výsledok
  </button>

  <button
    type="button"
    onClick={resetDemo}
    className="rounded-xl bg-teal-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-teal-600"
  >
    Spustiť demo znova
  </button>
</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (showManagerReport) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <section className="mx-auto w-full max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-600">
                QualityCare 360
              </p>

              <h1 className="text-3xl font-bold text-slate-900">
                Ukážka manažérskeho reportu
              </h1>

              <p className="mt-2 text-slate-600">
                Automaticky spracovaný prehľad výsledkov hodnotenia.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowManagerReport(false)}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Späť na výsledok
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <p className="text-sm font-medium text-slate-500">
                Celkový výsledok
              </p>

              <p className="mt-3 text-5xl font-bold text-teal-600">
                8,4
              </p>

              <p className="mt-1 text-sm text-slate-500">
                z maximálneho počtu 10 bodov
              </p>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[84%] rounded-full bg-teal-500" />
              </div>

              <p className="mt-4 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                Dobrá úroveň
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <p className="text-sm font-medium text-slate-500">
                Odoslané hodnotenia
              </p>

              <p className="mt-3 text-5xl font-bold text-slate-900">
                186
              </p>

              <p className="mt-2 text-sm text-slate-600">
                z plánovaných 210 hodnotení
              </p>

              <p className="mt-6 text-sm font-semibold text-teal-700">
                Účasť 89 %
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <p className="text-sm font-medium text-slate-500">
                Počet hodnotených
              </p>

              <p className="mt-3 text-5xl font-bold text-slate-900">
                24
              </p>

              <p className="mt-2 text-sm text-slate-600">
                zamestnancov v 4 úsekoch
              </p>

              <p className="mt-6 text-sm font-semibold text-teal-700">
                Hodnotenie dokončené
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
              <h2 className="text-xl font-bold text-slate-900">
                Najsilnejšie oblasti
              </h2>

              <div className="mt-6 space-y-4">
                {[
                  ["Komunikácia s klientmi", "9,1"],
                  ["Spolupráca v tíme", "8,9"],
                  ["Profesionalita", "8,7"],
                ].map(([name, score]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4"
                  >
                    <span className="font-medium text-slate-800">
                      {name}
                    </span>

                    <span className="font-bold text-emerald-700">
                      {score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
              <h2 className="text-xl font-bold text-slate-900">
                Oblasti na zlepšenie
              </h2>

              <div className="mt-6 space-y-4">
                {[
                  ["Dodržiavanie termínov", "6,8"],
                  ["Presnosť záznamov", "7,1"],
                  ["Odovzdávanie informácií", "7,3"],
                ].map(([name, score]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-2xl bg-amber-50 p-4"
                  >
                    <span className="font-medium text-slate-800">
                      {name}
                    </span>

                    <span className="font-bold text-amber-700">
                      {score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-white p-6 shadow-lg sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">
              Benchmark úsekov
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Porovnanie priemerného výsledku jednotlivých úsekov.
            </p>

            <div className="mt-6 space-y-5">
              {[
                ["Sociálny úsek", 87],
                ["Administratívny úsek", 85],
                ["Zdravotný úsek", 83],
                ["Prevádzkový úsek", 79],
              ].map(([name, score]) => (
                <div key={name.toString()}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-slate-800">
                      {name}
                    </span>

                    <span className="font-bold text-slate-900">
                      {(Number(score) / 10).toFixed(1)}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-teal-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">
              Odporúčaný plán vzdelávania
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-5">
                <p className="font-semibold text-slate-900">
                  Efektívne odovzdávanie informácií
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Zameranie na komunikáciu medzi zmenami a presnosť
                  odovzdávaných údajov.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5">
                <p className="font-semibold text-slate-900">
                  Práca s dokumentáciou
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Zlepšenie presnosti záznamov a dodržiavania stanovených
                  termínov.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-2xl">
                💡
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
                  Automatický manažérsky komentár
                </p>

                <h2 className="text-2xl font-bold text-slate-900">
                  {managerComment.title}
                </h2>
              </div>
            </div>

            <div className="space-y-5 leading-8 text-slate-700">
              {managerComment.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

         <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
  <button
    type="button"
    onClick={() => setShowManagerReport(false)}
    className="rounded-xl border-2 border-slate-300 bg-white px-8 py-4 text-lg font-semibold text-slate-700 transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-600"
  >
    Späť na výsledok
  </button>

  <button
    type="button"
    onClick={resetDemo}
    className="rounded-xl bg-teal-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-teal-600"
  >
    Spustiť demo znova
  </button>
</div>
        </section>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <section className="w-full max-w-2xl rounded-3xl bg-white p-8 text-center shadow-lg sm:p-12">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-4xl font-bold text-teal-600">
              ✓
            </div>
          </div>

          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-600">
            Demo bolo dokončené
          </p>

          <h1 className="mb-4 text-3xl font-bold text-slate-900">
            Hodnotenie bolo úspešne odoslané
          </h1>

          <p className="mb-8 text-slate-600">
            V ostrej aplikácii sa výsledky automaticky spracujú a zobrazia
            v manažérskom reporte.
          </p>

          <div className="mb-8 rounded-2xl bg-teal-50 p-6">
            <p className="text-sm font-medium text-slate-600">
              Výsledok ukážkového hodnotenia
            </p>

            <p className="mt-2 text-5xl font-bold text-teal-600">
              {averageScore.toFixed(1)}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              z maximálneho počtu 10 bodov
            </p>

            <div className="mt-6 border-t border-teal-200 pt-6">
              <span
                className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${resultLevel.className}`}
              >
                {resultLevel.title}
              </span>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-600">
                {resultLevel.description}
              </p>
            </div>
          </div>

          {strongestArea && developmentArea && (
            <div className="mb-8 grid gap-4 text-left sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Najsilnejšia oblasť
                </p>

                <p className="mt-3 font-semibold leading-6 text-slate-900">
                  {strongestArea.question}
                </p>

                <p className="mt-3 text-sm text-slate-600">
                  Hodnotenie:{" "}
                  <span className="font-bold text-emerald-700">
                    {strongestArea.score} z 10
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Oblasť na zlepšenie
                </p>

                <p className="mt-3 font-semibold leading-6 text-slate-900">
                  {developmentArea.question}
                </p>

                <p className="mt-3 text-sm text-slate-600">
                  Hodnotenie:{" "}
                  <span className="font-bold text-amber-700">
                    {developmentArea.score} z 10
                  </span>
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowManagerReport(true)}
            className="mb-4 w-full rounded-xl border-2 border-teal-500 bg-white px-8 py-4 text-lg font-semibold text-teal-600 transition hover:bg-teal-50"
          >
            Zobraziť ukážku manažérskeho reportu →
          </button>

          <button
            type="button"
            onClick={() => setShowEmployeeReport(true)}
            className="mb-4 w-full rounded-xl border-2 border-slate-300 bg-white px-8 py-4 text-lg font-semibold text-slate-700 transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-600"
          >
            Zobraziť ukážku reportu zamestnanca →
          </button>

          <button
            type="button"
            onClick={resetDemo}
            className="w-full rounded-xl bg-teal-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-teal-600"
          >
            Spustiť demo znova
          </button>
        </section>
      </main>
    );
  }

  if (evaluationStarted) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur">
          <div className="mx-auto max-w-4xl">
            <div className="mb-2 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Priebeh hodnotenia
                </p>

                <p className="text-xs text-slate-500">
                  Vyplnených {completedQuestions} z {totalQuestions} otázok
                </p>
              </div>

              <div className="flex h-12 min-w-16 items-center justify-center rounded-xl bg-teal-50 px-4">
                <span className="text-lg font-bold text-teal-700">
                  {progressPercentage} %
                </span>
              </div>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-teal-500 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="px-4 pb-10 pt-36">
          <section className="mx-auto w-full max-w-4xl rounded-3xl bg-white p-6 shadow-lg sm:p-10">
            <div className="mb-8 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-600">
                Krok 3 z 3
              </p>

              <h1 className="mb-3 text-3xl font-bold text-slate-900">
                {evaluatedPersonName}
              </h1>

              <p className="text-slate-600">
                Pri každej otázke vyberte hodnotenie od 1 do 10.
              </p>
            </div>

            <div className="space-y-6">
              {demoQuestions.map((question, questionIndex) => (
                <div
                  key={question}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <p className="font-semibold text-slate-900">
                      {questionIndex + 1}. {question}
                    </p>

                    {answers[questionIndex] && (
                      <span className="shrink-0 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
                        Vyplnené
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                    {Array.from({ length: 10 }, (_, index) => {
                      const value = index + 1;
                      const selected = answers[questionIndex] === value;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            selectAnswer(questionIndex, value)
                          }
                          className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                            selected
                              ? "border-teal-600 bg-teal-600 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-teal-400 hover:bg-teal-50"
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex justify-between text-xs text-slate-500">
                    <span>Najnižšie hodnotenie</span>
                    <span>Najvyššie hodnotenie</span>
                  </div>
                </div>
              ))}
            </div>

            {validationMessage && (
              <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
                {validationMessage}
              </p>
            )}

            <button
              type="button"
              onClick={submitEvaluation}
              className="mt-8 w-full rounded-xl bg-teal-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-teal-600"
            >
              Odoslať hodnotenie
            </button>

            <button
              type="button"
              onClick={
                selfAssessmentSelected
                  ? backToEvaluationSelection
                  : backToEmployees
              }
              className="mt-4 w-full text-sm font-medium text-slate-500 transition hover:text-slate-800"
            >
              Späť
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      {!demoStarted ? (
        <section className="w-full max-w-2xl rounded-3xl bg-white p-8 text-center shadow-lg sm:p-12">
          <div className="mb-8 flex justify-center">
            <Image
              src="/QualityCare.png"
              alt="QualityCare 360"
              width={220}
              height={120}
              priority
              className="h-auto w-auto max-w-full"
            />
          </div>

          <h1 className="mb-6 text-3xl font-bold text-slate-900 sm:text-4xl">
            Demo aplikácie QualityCare 360
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            V priebehu približne 2 minút si vyskúšate, ako prebieha
            hodnotenie zamestnancov. Nepotrebujete registráciu ani
            prihlasovanie.
          </p>

          <button
            type="button"
            onClick={() => setDemoStarted(true)}
            className="rounded-xl bg-teal-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-teal-600"
          >
            Spustiť demo
          </button>
        </section>
      ) : !selectedDepartment ? (
        <section className="w-full max-w-4xl rounded-3xl bg-white p-8 shadow-lg sm:p-12">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-600">
              Krok 1 z 3
            </p>

            <h1 className="mb-3 text-3xl font-bold text-slate-900">
              Vyberte spôsob hodnotenia
            </h1>

            <p className="text-slate-600">
              Vyberte sebahodnotenie alebo úsek, z ktorého chcete hodnotiť
              zamestnanca.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSelfAssessmentSelected(true)}
            className="mb-4 w-full rounded-2xl border-2 border-teal-200 bg-teal-50 p-6 text-left transition hover:border-teal-500 hover:bg-teal-100"
          >
            <span className="block text-xl font-semibold text-slate-900">
              Sebahodnotenie
            </span>

            <span className="mt-2 block text-sm leading-6 text-slate-600">
              Ohodnoťte svoju vlastnú prácu, prístup a spoluprácu.
            </span>

            <span className="mt-4 block text-sm font-medium text-teal-700">
              Ohodnotiť seba
            </span>
          </button>

          <div className="grid gap-4 sm:grid-cols-2">
            {demoDepartments.map((department) => (
              <button
                key={department.id}
                type="button"
                onClick={() => setSelectedDepartmentId(department.id)}
                className="rounded-2xl border border-slate-200 p-6 text-left transition hover:border-teal-500 hover:bg-teal-50"
              >
                <span className="block text-xl font-semibold text-slate-900">
                  {department.name}
                </span>

                <span className="mt-2 block text-sm leading-6 text-slate-600">
                  {department.description}
                </span>

                <span className="mt-4 block text-sm font-medium text-teal-600">
                  {department.employees.length} zamestnanci
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={resetDemo}
            className="mt-8 w-full text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            Späť na úvod
          </button>
        </section>
      ) : (
        <section className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-lg sm:p-12">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-600">
              Krok 2 z 3
            </p>

            <h1 className="mb-3 text-3xl font-bold text-slate-900">
              {selectedDepartment.name}
            </h1>

            <p className="text-slate-600">
              Vyberte zamestnanca, ktorého chcete v ukážke ohodnotiť.
            </p>
          </div>

          <div className="grid gap-4">
            {selectedDepartment.employees.map((employee) => (
              <button
                key={employee.id}
                type="button"
                onClick={() => setSelectedEmployee(employee)}
                className="rounded-2xl border border-slate-200 p-5 text-left transition hover:border-teal-500 hover:bg-teal-50"
              >
                <span className="block text-lg font-semibold text-slate-900">
                  {employee.name}
                </span>

                <span className="mt-1 block text-sm text-slate-600">
                  {employee.position}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={backToEvaluationSelection}
            className="mt-8 w-full text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            Späť na výber hodnotenia
          </button>
        </section>
      )}
    </main>
  );
}