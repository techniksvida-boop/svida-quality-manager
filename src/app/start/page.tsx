"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function formatDate(date: string | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("sk-SK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function createSessionToken() {
  const values = new Uint8Array(32);
  crypto.getRandomValues(values);

  return Array.from(values)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
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

export default function StartPage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [checkingPeriod, setCheckingPeriod] =
    useState(true);

  const [votingOpen, setVotingOpen] =
    useState(false);

  const [periodText, setPeriodText] =
    useState("");

  useEffect(() => {
    let isMounted = true;

    async function checkPeriod() {
      try {
        const { data: period } = await supabase
          .from("evaluation_periods")
          .select("id, voting_from, voting_to")
          .eq("is_active", true)
          .single();

        if (!isMounted) {
          return;
        }

        if (!period) {
          setVotingOpen(false);
          setPeriodText(
            "Nie je nastavené aktívne hodnotiace obdobie."
          );
          return;
        }

        const today = new Date()
          .toISOString()
          .slice(0, 10);

        const isOpen =
          Boolean(period.voting_from) &&
          Boolean(period.voting_to) &&
          today >= period.voting_from &&
          today <= period.voting_to;

        setVotingOpen(isOpen);

        setPeriodText(
          `Hlasovanie je dostupné od ${formatDate(
            period.voting_from
          )} do ${formatDate(period.voting_to)}.`
        );
      } catch {
        if (isMounted) {
          setVotingOpen(false);
          setPeriodText(
            "Dostupnosť hodnotenia sa nepodarilo overiť."
          );
        }
      } finally {
        if (isMounted) {
          setCheckingPeriod(false);
        }
      }
    }

    void checkPeriod();

    return () => {
      isMounted = false;
    };
  }, []);

  async function verifyCode(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedCode = code
      .trim()
      .toUpperCase();

    if (!votingOpen) {
      setError(
        "Hodnotenie momentálne nie je aktívne."
      );
      return;
    }

    if (normalizedCode.length !== 4) {
      setError(
        "Zadajte celý 4-miestny anonymný kód."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: queryError } =
        await supabase
          .from("voting_codes")
          .select(
            "id, code, is_active, employee_id"
          )
          .eq("code", normalizedCode)
          .eq("is_active", true)
          .single();

      if (queryError || !data) {
        setError("Zadaný kód nie je platný.");
        return;
      }

      if (!data.employee_id) {
        setError(
          "Kód nemá priradeného zamestnanca."
        );
        return;
      }

      const storedVotingCodeId =
        localStorage.getItem("voting_code_id");

      let sessionToken =
        storedVotingCodeId === data.id
          ? localStorage.getItem(
              "voting_session_token"
            )
          : null;

      if (!sessionToken) {
        sessionToken = createSessionToken();
      }

      const sessionTokenHash =
        await hashSessionToken(sessionToken);

      const {
        data: sessionAllowed,
        error: sessionError,
      } = await supabase.rpc(
        "start_voting_session",
        {
          p_voting_code_id: data.id,
          p_session_token_hash:
            sessionTokenHash,
        }
      );

      if (sessionError) {
        console.error(
          "Chyba pri vytváraní relácie:",
          sessionError
        );

        setError(
          "Prihlásenie sa nepodarilo overiť. Skúste to znova."
        );
        return;
      }

      if (sessionAllowed !== true) {
        setError(
          "Tento hodnotiaci kód je momentálne používaný na inom zariadení. Najprv ukončite pôvodnú reláciu alebo počkajte 30 minút od poslednej aktivity."
        );
        return;
      }

      /*
       * Token uložíme pred serverovým volaním.
       * Ak by serverové volanie zlyhalo, pri ďalšom pokuse
       * sa použije rovnaký token a databáza prihlásenie nezablokuje.
       */
      localStorage.setItem(
        "voting_code_id",
        data.id
      );

      localStorage.setItem(
        "voting_code",
        data.code
      );

      localStorage.setItem(
        "employee_id",
        data.employee_id
      );

      localStorage.setItem(
        "voting_session_token",
        sessionToken
      );

      const sessionResponse = await fetch(
        "/api/voting-session",
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            votingCodeId: data.id,
            sessionToken,
          }),
        }
      );

      if (!sessionResponse.ok) {
        let message =
          "Serverovú prihlasovaciu reláciu sa nepodarilo vytvoriť.";

        try {
          const responseData =
            await sessionResponse.json();

          if (
            typeof responseData?.message ===
            "string"
          ) {
            message = responseData.message;
          }
        } catch {
          // Odpoveď nemusela obsahovať JSON.
        }

        setError(message);
        return;
      }

      router.push("/hodnotenie");
      router.refresh();
    } catch (verificationError) {
      console.error(
        "Chyba pri overovaní kódu:",
        verificationError
      );

      setError(
        "Prihlásenie sa nepodarilo dokončiť. Skúste to znova."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="svida-page svida-page-bg flex min-h-dvh items-center justify-center">
      <div className="w-full max-w-md">
        <section className="svida-card rounded-2xl p-5 sm:rounded-3xl sm:p-8">
          <div className="mb-5 flex justify-center sm:mb-6">
            <img
              src="/logo-svida.jpg"
              alt="Senior dom Svida"
              className="h-auto w-full max-w-[170px] object-contain sm:max-w-[210px]"
            />
          </div>

          <header className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--svida-primary-dark)] sm:text-sm">
              Svida Quality Manager
            </p>

            <h1 className="mt-2 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
              Anonymné hodnotenie
            </h1>
          </header>

          {checkingPeriod ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center">
              <p className="text-sm font-medium text-gray-600 sm:text-base">
                Overujem dostupnosť hodnotenia…
              </p>
            </div>
          ) : !votingOpen ? (
            <div
              role="status"
              className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-center sm:p-5"
            >
              <p className="text-base font-semibold text-orange-900">
                Hodnotenie momentálne nie je
                aktívne
              </p>

              <p className="mt-2 text-sm leading-relaxed text-orange-800 sm:text-base">
                {periodText}
              </p>
            </div>
          ) : (
            <>
              <p className="mt-4 text-center text-sm leading-relaxed text-gray-600 sm:text-base">
                Zadajte svoj 4-miestny anonymný
                kód.
              </p>

              <form
                onSubmit={verifyCode}
                noValidate
                className="mt-6 space-y-4 sm:mt-8 sm:space-y-5"
              >
                <div>
                  <label
                    htmlFor="voting-code"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Anonymný kód
                  </label>

                  <input
                    id="voting-code"
                    value={code}
                    onChange={(event) => {
                      const value =
                        event.target.value
                          .replace(
                            /[^a-zA-Z0-9]/g,
                            ""
                          )
                          .toUpperCase()
                          .slice(0, 4);

                      setCode(value);
                      setError("");
                    }}
                    maxLength={4}
                    autoComplete="off"
                    autoCapitalize="characters"
                    inputMode="text"
                    spellCheck={false}
                    disabled={loading}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                      error
                        ? "code-error"
                        : "code-help"
                    }
                    className="
                      min-h-14 w-full rounded-xl border border-gray-300
                      bg-white px-4 py-3 text-center
                      text-2xl font-bold uppercase tracking-[0.35em]
                      text-gray-900 shadow-sm outline-none
                      transition
                      placeholder:text-gray-300
                      focus:border-[var(--svida-primary)]
                      focus:ring-2
                      focus:ring-[var(--svida-primary)]/20
                      disabled:cursor-not-allowed disabled:opacity-60
                      sm:min-h-16 sm:text-3xl sm:tracking-[0.45em]
                    "
                    placeholder="AB12"
                  />

                  <p
                    id="code-help"
                    className="mt-2 text-center text-xs text-gray-500 sm:text-sm"
                  >
                    Kód obsahuje 4 písmená alebo
                    číslice.
                  </p>
                </div>

                {error && (
                  <div
                    id="code-error"
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 sm:text-base"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    code.length !== 4
                  }
                  className="
                    svida-btn inline-flex min-h-12 w-full
                    items-center justify-center rounded-xl
                    px-5 py-3 text-center text-base font-semibold
                    disabled:cursor-not-allowed disabled:opacity-50
                    sm:min-h-14 sm:text-lg
                  "
                >
                  {loading
                    ? "Overujem…"
                    : "Pokračovať"}
                </button>
              </form>

              <div className="svida-anonymity-box mt-6 rounded-2xl p-4">
                <p className="text-sm leading-relaxed text-[var(--svida-anonymity-text,#5f513a)]">
                  Kód slúži iba na overenie
                  prístupu a zabránenie
                  opakovanému hodnoteniu. Meno
                  hodnotiacej osoby sa pri
                  hodnotení nezobrazuje.
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}