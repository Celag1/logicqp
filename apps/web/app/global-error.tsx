'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-800 mb-4">
              Error Crítico
            </h2>
            <p className="text-red-600 mb-6">
              Ha ocurrido un error crítico en la aplicación.
            </p>
            <button
              onClick={reset}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Recargar aplicación
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
