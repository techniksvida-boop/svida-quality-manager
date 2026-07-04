"use client";

export default function PrintButton({ recordId }: { recordId: string }) {
  function handlePrint() {
    const records = document.querySelectorAll("[data-print-record]");

    records.forEach((record) => {
      record.classList.toggle("print-active", record.id === recordId);
    });

    document.body.classList.add("printing-record");

    const cleanup = () => {
      document.body.classList.remove("printing-record");

      records.forEach((record) => {
        record.classList.remove("print-active");
      });

      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
    window.print();

    setTimeout(cleanup, 1000);
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="mt-3 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
    >
      Vytlačiť záznam z hodnotenia
    </button>
  );
}