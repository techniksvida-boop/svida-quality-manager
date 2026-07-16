"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

type DepartmentStyle = {
  cardClass: string;
  badgeClass: string;
  titleClass: string;
  buttonClass: string;
  hoverClass: string;
  employeeCardClass: string;
  employeeButtonClass: string;
};

type Department = {
  id: string;
  name: string;
};

type PositionRelation =
  | {
      name?: string | null;
    }
  | {
      name?: string | null;
    }[]
  | null;

type DepartmentRelation =
  | {
      id: string;
      name: string;
    }
  | {
      id: string;
      name: string;
    }[]
  | null;

type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  manager_id?: string | null;
  positions?: PositionRelation;
  departments?: DepartmentRelation;
};

type EvaluationType = {
  id: string;
  code: string;
};

type VotingCodeUsage = {
  evaluated_employee_id: string;
  evaluation_type_id: string;
};

const INACTIVITY_LIMIT_MS = 10 * 60 * 1000;
const SESSION_REFRESH_INTERVAL_MS = 60 * 1000;
const INACTIVITY_CHECK_INTERVAL_MS = 15 * 1000;

const DEPARTMENT_STYLES: Record<string, DepartmentStyle> = {
  "Úsek opatrovateľskej starostlivosti": {
    cardClass: "bg-emerald-50 border border-emerald-200",
    badgeClass: "bg-emerald-100 text-emerald-700",
    titleClass: "text-emerald-950",
    buttonClass: "text-emerald-700",
    hoverClass: "hover:border-emerald-400 hover:bg-emerald-100/70",
    employeeCardClass: "bg-emerald-50/50 border border-emerald-200",
    employeeButtonClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  "Úsek prevádzky": {
    cardClass: "bg-blue-50 border border-blue-200",
    badgeClass: "bg-blue-100 text-blue-700",
    titleClass: "text-blue-950",
    buttonClass: "text-blue-700",
    hoverClass: "hover:border-blue-400 hover:bg-blue-100/70",
    employeeCardClass: "bg-blue-50/50 border border-blue-200",
    employeeButtonClass: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  "Úsek riaditeľa": {
    cardClass: "bg-slate-100 border border-slate-200",
    badgeClass: "bg-slate-200 text-slate-700",
    titleClass: "text-slate-950",
    buttonClass: "text-slate-700",
    hoverClass: "hover:border-slate-400 hover:bg-slate-200/70",
    employeeCardClass: "bg-slate-50 border border-slate-200",
    employeeButtonClass: "bg-slate-700 hover:bg-slate-800 text-white",
  },
  "Úsek sociálnej práce": {
    cardClass: "bg-violet-50 border border-violet-200",
    badgeClass: "bg-violet-100 text-violet-700",
    titleClass: "text-violet-950",
    buttonClass: "text-violet-700",
    hoverClass: "hover:border-violet-400 hover:bg-violet-100/70",
    employeeCardClass: "bg-violet-50/50 border border-violet-200",
    employeeButtonClass: "bg-violet-600 hover:bg-violet-700 text-white",
  },
  "Úsek stravovania": {
    cardClass: "bg-amber-50 border border-amber-200",
    badgeClass: "bg-amber-100 text-amber-700",
    titleClass: "text-amber-950",
    buttonClass: "text-amber-700",
    hoverClass: "hover:border-amber-400 hover:bg-amber-100/70",
    employeeCardClass: "bg-amber-50/50 border border-amber-200",
    employeeButtonClass: "bg-amber-600 hover:bg-amber-700 text-white",
  },
};

const DEFAULT_DEPARTMENT_STYLE: DepartmentStyle = {
  cardClass: "bg-white border border-gray-200",
  badgeClass: "bg-gray-100 text-gray-600",
  titleClass: "text-gray-900",
  buttonClass: "text-gray-700",
  hoverClass: "hover:border-gray-300 hover:bg-gray-50",
  employeeCardClass: "bg-white border border-gray-200",
  employeeButtonClass: "bg-[#df4a33] hover:bg-[#c73f2b] text-white",
};

function getDepartment(employee: Employee): Department | null {
  const relation = employee.departments;

  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0] || null;
  }

  return relation;
}

function getPositionName(employee: Employee) {
  const relation = employee.positions;

  if (!relation) {
    return "Pracovná pozícia neuvedená";
  }

  if (Array.isArray(relation)) {
    return relation[0]?.name || "Pracovná pozícia neuvedená";
  }

  return relation.name || "Pracovná pozícia neuvedená";
}

async function hashSessionToken(token: string) {
  const encodedToken = new TextEncoder().encode(token);

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    encodedToken
  );

  return Array.from(new Uint8Array(hashBuffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function clearStoredSession() {
  localStorage.removeItem("voting_code_id");
  localStorage.removeItem("voting_code");
  localStorage.removeItem("employee_id");
  localStorage.removeItem("voting_session_token");
}

export default function HodnoteniePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selfEmployee, setSelfEmployee] = useState<Employee | null>(null);
  const [selfDone, setSelfDone] = useState(false);
  const [peerUsed, setPeerUsed] = useState<string[]>([]);
  const [managerUsed, setManagerUsed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );

  const lastActivityRef = useRef(Date.now());
  const lastSessionRefreshRef = useRef(0);
  const logoutInProgressRef = useRef(false);

  const logout = useCallback(async () => {
    if (logoutInProgressRef.current) {
      return;
    }

    logoutInProgressRef.current = true;
    setLoggingOut(true);

    try {
      await fetch("/api/voting-session", {
        method: "DELETE",
        credentials: "same-origin",
        cache: "no-store",
      });
    } catch (error) {
      console.error("Serverové odhlásenie zlyhalo:", error);
    } finally {
      clearStoredSession();
      window.location.href = "/start";
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const votingCodeId = localStorage.getItem("voting_code_id");
    const sessionToken = localStorage.getItem("voting_session_token");

    if (!votingCodeId || !sessionToken) {
      clearStoredSession();
      window.location.href = "/start";
      return false;
    }

    try {
      const sessionTokenHash = await hashSessionToken(sessionToken);

      const {
        data: sessionValid,
        error: sessionError,
      } = await supabase.rpc("refresh_voting_session", {
        p_voting_code_id: votingCodeId,
        p_session_token_hash: sessionTokenHash,
      });

      if (sessionError || sessionValid !== true) {
        clearStoredSession();
        window.location.href = "/start";
        return false;
      }

      lastSessionRefreshRef.current = Date.now();
      return true;
    } catch (error) {
      console.error("Reláciu sa nepodarilo obnoviť:", error);
      return true;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      const sessionValid = await refreshSession();

      if (!sessionValid || !isMounted) {
        return;
      }

      lastActivityRef.current = Date.now();
      lastSessionRefreshRef.current = Date.now();
    }

    function registerActivity() {
      if (logoutInProgressRef.current) {
        return;
      }

      const now = Date.now();
      lastActivityRef.current = now;

      if (
        now - lastSessionRefreshRef.current >=
        SESSION_REFRESH_INTERVAL_MS
      ) {
        void refreshSession();
      }
    }

    const activityEvents: Array<keyof WindowEventMap> = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, registerActivity, {
        passive: true,
      });
    });

    const inactivityInterval = window.setInterval(() => {
      const inactiveFor = Date.now() - lastActivityRef.current;

      if (inactiveFor >= INACTIVITY_LIMIT_MS) {
        void logout();
      }
    }, INACTIVITY_CHECK_INTERVAL_MS);

    void initializeSession();

    return () => {
      isMounted = false;

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, registerActivity);
      });

      window.clearInterval(inactivityInterval);
    };
  }, [logout, refreshSession]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const votingCodeId = localStorage.getItem("voting_code_id");
      const employeeId = localStorage.getItem("employee_id");

      if (!votingCodeId || !employeeId) {
        clearStoredSession();
        window.location.href = "/start";
        return;
      }

      try {
        const { data: activePeriod } = await supabase
          .from("evaluation_periods")
          .select("id")
          .eq("is_active", true)
          .single();

        if (!activePeriod) {
          return;
        }

        const { data: employeesData } = await supabase
          .from("employees")
          .select(`
            id,
            first_name,
            last_name,
            manager_id,
            positions(name),
            departments(id,name)
          `)
          .eq("is_active", true)
          .order("last_name");

        const { data: usageData } = await supabase
          .from("voting_code_usage")
          .select("evaluated_employee_id, evaluation_type_id")
          .eq("voting_code_id", votingCodeId)
          .eq("period_id", activePeriod.id);

        const { data: evaluationTypesData } = await supabase
          .from("evaluation_types")
          .select("id, code")
          .in("code", ["peer", "self", "manager"]);

        const evaluationTypes =
          (evaluationTypesData || []) as EvaluationType[];

        const usages = (usageData || []) as VotingCodeUsage[];

        const peerType = evaluationTypes.find(
          (type) => type.code === "peer"
        );

        const selfType = evaluationTypes.find(
          (type) => type.code === "self"
        );

        const managerType = evaluationTypes.find(
          (type) => type.code === "manager"
        );

        const allEmployees = (employeesData || []) as Employee[];

        if (!isMounted) {
          return;
        }

        setSelfEmployee(
          allEmployees.find((employee) => employee.id === employeeId) || null
        );

        setEmployees(
          allEmployees.filter((employee) => employee.id !== employeeId)
        );

        setPeerUsed(
          usages
            .filter(
              (usage) =>
                usage.evaluation_type_id === peerType?.id
            )
            .map((usage) => usage.evaluated_employee_id)
        );

        setManagerUsed(
          usages
            .filter(
              (usage) =>
                usage.evaluation_type_id === managerType?.id
            )
            .map((usage) => usage.evaluated_employee_id)
        );

        setSelfDone(
          usages.some(
            (usage) =>
              usage.evaluation_type_id === selfType?.id &&
              usage.evaluated_employee_id === employeeId
          )
        );
      } catch (error) {
        console.error("Údaje hodnotenia sa nepodarilo načítať:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const departments = useMemo(() => {
    const map = new Map<string, Department>();

    employees.forEach((employee) => {
      const department = getDepartment(employee);

      if (department && !map.has(department.id)) {
        map.set(department.id, department);
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "sk")
    );
  }, [employees]);

  const filteredEmployees = employees.filter(
    (employee) => getDepartment(employee)?.id === selectedDepartment
  );

  const selectedDepartmentName =
    departments.find(
      (department) => department.id === selectedDepartment
    )?.name || "";

  const selectedDepartmentStyle =
    DEPARTMENT_STYLES[selectedDepartmentName] ||
    DEFAULT_DEPARTMENT_STYLE;

  if (loading) {
    return (
      <main className="svida-page svida-page-bg">
        <div className="svida-container">
          <div className="svida-card rounded-2xl p-6 text-center sm:p-8">
            <p className="text-sm font-medium text-gray-600 sm:text-base">
              Načítavam hodnotenie…
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="svida-page svida-page-bg">
      <div className="svida-container">
        <div className="mb-5 flex justify-end sm:mb-6">
          <button
            type="button"
            onClick={() => void logout()}
            disabled={loggingOut}
            className="
              inline-flex min-h-11 items-center justify-center
              rounded-xl border border-red-200 bg-white
              px-4 py-2.5 text-sm font-semibold text-red-700
              transition hover:border-red-300 hover:bg-red-50
              disabled:cursor-not-allowed disabled:opacity-60
              sm:text-base
            "
          >
            {loggingOut ? "Odhlasujem…" : "Odhlásiť sa"}
          </button>
        </div>

        <header className="mb-8 text-center sm:mb-10">
          <div className="mb-5 flex flex-col items-center gap-5 sm:mb-6">
  <img
    src="/QualityCare.png"
    alt="QualityCare 360"
    className="h-auto w-full max-w-[360px] object-contain sm:max-w-[460px]"
  />

  <img
    src="/logo-svida.png"
    alt="Senior dom Svida"
    className="h-auto w-full max-w-[150px] object-contain sm:max-w-[180px]"
  />
</div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            Ročné hodnotenie zamestnancov
          </h1>

          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
            Vyplňte sebahodnotenie a následne hodnotenie ostatných
            zamestnancov. Vedúci pracovníci môžu navyše samostatne hodnotiť
            svojich podriadených.
          </p>

          <p className="mx-auto mt-2 max-w-3xl text-xs leading-relaxed text-gray-500 sm:text-sm">
            Z bezpečnostných dôvodov budete po 10 minútach nečinnosti
            automaticky odhlásený.
          </p>
        </header>

        {selfEmployee && (
          <section className="mb-8 rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm sm:mb-10 sm:p-6">
            <div className="inline-flex rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700">
              Sebahodnotenie
            </div>

            <h2 className="mt-4 break-words text-xl font-bold text-orange-950 sm:text-2xl">
              {selfEmployee.first_name} {selfEmployee.last_name}
            </h2>

            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              {getPositionName(selfEmployee)}
            </p>

            {selfDone ? (
              <div className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-green-100 px-4 py-3 text-center text-sm font-semibold text-green-700 sm:w-auto sm:text-base">
                <span aria-hidden="true" className="mr-2">
                  ✓
                </span>
                Sebahodnotenie odoslané
              </div>
            ) : (
              <Link
                href={`/employee/${selfEmployee.id}?type=self`}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-orange-600 px-5 py-3 text-center text-base font-semibold text-white transition hover:bg-orange-700 sm:w-auto"
              >
                Ohodnotiť vlastnú prácu
              </Link>
            )}
          </section>
        )}

        {!selectedDepartment ? (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 sm:mb-5 sm:text-2xl">
              Vyberte úsek
            </h2>

            {departments.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
                <p className="text-sm text-gray-600 sm:text-base">
                  Nie sú dostupné žiadne úseky na hodnotenie.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {departments.map((department) => {
                  const departmentStyle =
                    DEPARTMENT_STYLES[department.name] ||
                    DEFAULT_DEPARTMENT_STYLE;

                  return (
                    <button
                      key={department.id}
                      type="button"
                      onClick={() => setSelectedDepartment(department.id)}
                      className={`
                        group min-h-[180px] min-w-0 rounded-2xl
                        p-5 text-left shadow-sm transition
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-[var(--svida-primary)]
                        focus-visible:ring-offset-2
                        active:scale-[0.99]
                        sm:min-h-[200px] sm:p-6
                        ${departmentStyle.cardClass}
                        ${departmentStyle.hoverClass}
                      `}
                    >
                      <div
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${departmentStyle.badgeClass}`}
                      >
                        Úsek
                      </div>

                      <h3
                        className={`mt-4 break-words text-lg font-semibold leading-snug sm:text-xl ${departmentStyle.titleClass}`}
                      >
                        {department.name}
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        Kliknite pre zobrazenie zamestnancov.
                      </p>

                      <div
                        className={`mt-5 text-sm font-semibold sm:text-base ${departmentStyle.buttonClass}`}
                      >
                        Zobraziť zamestnancov
                        <span
                          aria-hidden="true"
                          className="ml-1 inline-block transition-transform group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <section>
            <button
              type="button"
              onClick={() => setSelectedDepartment(null)}
              className="mb-5 inline-flex min-h-11 items-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:mb-6 sm:text-base"
            >
              <span aria-hidden="true" className="mr-2">
                ←
              </span>
              Späť na výber úsekov
            </button>

            <div
              className={`mb-5 rounded-2xl p-5 sm:mb-6 sm:p-6 ${selectedDepartmentStyle.cardClass}`}
            >
              <div
                className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${selectedDepartmentStyle.badgeClass}`}
              >
                Vybraný úsek
              </div>

              <h2
                className={`mt-3 break-words text-xl font-bold leading-tight sm:text-2xl ${selectedDepartmentStyle.titleClass}`}
              >
                {selectedDepartmentName}
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
                Vyberte zamestnanca a spôsob hodnotenia.
              </p>
            </div>

            {filteredEmployees.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
                <p className="text-sm text-gray-600 sm:text-base">
                  V tomto úseku nie sú dostupní žiadni zamestnanci na
                  hodnotenie.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {filteredEmployees.map((employee) => {
                  const peerDone = peerUsed.includes(employee.id);
                  const managerDone = managerUsed.includes(employee.id);
                  const isDirectReport =
                    employee.manager_id === selfEmployee?.id;

                  return (
                    <article
                      key={employee.id}
                      className={`flex min-h-[190px] min-w-0 flex-col rounded-2xl p-5 shadow-sm sm:min-h-[210px] sm:p-6 ${selectedDepartmentStyle.employeeCardClass}`}
                    >
                      <h3 className="break-words text-lg font-semibold leading-snug text-gray-900 sm:text-xl">
                        {employee.first_name} {employee.last_name}
                      </h3>

                      <p className="mt-2 break-words text-sm leading-relaxed text-gray-600">
                        {getPositionName(employee)}
                      </p>

                      <div className="mt-auto pt-5">
                        {isDirectReport ? (
                          managerDone ? (
                            <div className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-indigo-100 px-4 py-3 text-center text-sm font-semibold text-indigo-700 sm:text-base">
                              <span aria-hidden="true" className="mr-2">
                                ✓
                              </span>
                              Hodnotenie vedúcim odoslané
                            </div>
                          ) : (
                            <Link
                              href={`/employee/${employee.id}?type=manager`}
                              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-indigo-700 px-5 py-3 text-center text-base font-semibold text-white transition hover:bg-indigo-800"
                            >
                              Hodnotenie vedúcim
                            </Link>
                          )
                        ) : peerDone ? (
                          <div className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-green-100 px-4 py-3 text-center text-sm font-semibold text-green-700 sm:text-base">
                            <span aria-hidden="true" className="mr-2">
                              ✓
                            </span>
                            Hodnotenie zamestnanca odoslané
                          </div>
                        ) : (
                          <Link
                            href={`/employee/${employee.id}?type=peer`}
                            className={`inline-flex min-h-12 w-full items-center justify-center rounded-xl px-5 py-3 text-center text-base font-semibold transition ${selectedDepartmentStyle.employeeButtonClass}`}
                          >
                            Hodnotenie zamestnanca
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
                <div className="mt-12 flex justify-start pb-8">
          <button
            type="button"
            onClick={() => void logout()}
            disabled={loggingOut}
            className="
              inline-flex min-h-12 items-center justify-center
              rounded-xl border border-red-200 bg-white
              px-5 py-3 text-base font-semibold text-red-700
              shadow-sm transition
              hover:border-red-300 hover:bg-red-50
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-red-500
              focus-visible:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-60
            "
          >
            {loggingOut ? "Odhlasujem…" : "Odhlásiť sa"}
          </button>
        </div>
      </div>
    </main>
  );
}