
import { Metadata } from 'next'
import RegisterForm from '@/components/RegisterForm'

export const metadata: Metadata = {
  title: 'Campamento 2025 - Registro',
  description: 'Formulario de registro para el Campamento 2025',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-6">
          <h1 className="text-3xl font-extrabold text-white text-center">Formulario de Registro</h1>
          <p className="text-blue-100 text-center mt-2">Contra Las Cuerdas</p>
        </div>
        <div className="p-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
