import PaymentForm from '@/components/PaymentForm'
import prisma from '@/utils/prismaClient'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function getCamperById(id: string) {
  const camper = await prisma.camper.findUnique({
    where: {
      id: parseInt(id)
    }
  })

  return camper
}

async function getPaymentsByCamperById(id: string) {
  const payments = await prisma.payment.findMany({
    where: {
      id: parseInt(id)
    }
  })

  return payments
}

export default async function CamperPage({ params }: { params: Promise<{ camperId: string }> }) {
  // Get the camperId from the route parameters
  const { camperId } = await params

  // Fetch camper data (this will cause a 1-second delay)
  const camper = await getCamperById(camperId)

  if (!camper) {
    notFound()
  }

  const payments = await getPaymentsByCamperById(camperId)

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6'>
      <div className='max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden'>
        <div className='bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-6'>
          <h1 className='text-3xl font-extrabold text-white text-center'>Información de Pago</h1>
          <p className='text-blue-100 text-center mt-2'>Nombre: {camper.firstName} {camper.lastName}</p>
          <p className='text-blue-100 text-center mt-2'>ID: {camper.id}</p>
        </div>
        <div className='p-4 sm:p-8'>
          <PaymentForm camper={camper} payments={payments || []} />
        </div>
      </div>
    </div>
  )
}
