export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 animate-pulse"></div>
        <h2 className="text-xl font-semibold text-blue-800 mb-2">
          Cargando...
        </h2>
        <p className="text-blue-600 text-sm">
          Preparando tu experiencia...
        </p>
      </div>
    </div>
  )
}
