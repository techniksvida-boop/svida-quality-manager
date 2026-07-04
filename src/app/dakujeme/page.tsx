export default function DakujemePage() {
  return (
    <main className="min-h-screen flex items-center justify-center svida-page-bg p-6">
      <div className="w-full max-w-xl rounded-2xl p-8 text-center svida-card">
        <div className="mb-6 flex justify-center">
          <img
            src="/logo-svida.jpg"
            alt="Senior dom Svida"
            className="h-24 w-auto"
          />
        </div>

        <h1 className="text-3xl font-bold">
          Ďakujeme za vyplnenie hodnotenia
        </h1>

        <p className="mt-4 text-lg text-gray-700">
          Ohodnotili ste všetkých dostupných zamestnancov.
        </p>

        <p className="mt-3 text-gray-600">
          Vaše odpovede boli uložené anonymne.
        </p>
      </div>
    </main>
  );
}