'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-800 mb-4">
          Algo salió mal
        </h2>
        <p className="text-red-600 mb-6">
          Ha ocurrido un error inesperado.
        </p>
        <button
          onClick={reset}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
