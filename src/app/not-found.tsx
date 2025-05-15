
export default async function NotFound() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6'>
      <div className='max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden'>
        <div className='bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-6 space-y-3'>
          <h2 className='text-2xl font-extrabold text-white opacity-60 text-center'>404</h2>
          <h1 className='text-3xl font-extrabold text-white text-center'>¡Ups!</h1>
        </div>
        <div className='p-8'>
          <p className='block text-sm font-medium text-center text-gray-700 mb-1'>La pagina que buscas no existe.</p>
        </div>
      </div>
    </div>
  )
}
