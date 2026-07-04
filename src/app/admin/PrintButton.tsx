"use client";

export default function PrintButton({ recordId }: { recordId: string }) {
  const employeeId = recordId.replace("employee-record-", "");

  return (
    <a
      href={`/admin/print/${employeeId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 inline-block rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
    >
      Vytlačiť záznam z hodnotenia
    </a>
  );
}