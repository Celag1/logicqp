import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">
          Página no encontrada
        </h2>
        <p className="text-blue-600 mb-6">
          Lo sentimos, la página que buscas no existe.
        </p>
        <Link 
          href="/"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
