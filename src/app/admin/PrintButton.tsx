"use client";

type PrintButtonProps = {
  recordId: string;
  periodId?: string;
};

export default function PrintButton({
  recordId,
  periodId,
}: PrintButtonProps) {
  const employeeId = recordId.replace("employee-record-", "");

  const href = periodId
    ? `/admin/print/${employeeId}?period=${periodId}`
    : `/admin/print/${employeeId}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 inline-block rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
    >
      Vytlačiť záznam z hodnotenia
    </a>
  );
}