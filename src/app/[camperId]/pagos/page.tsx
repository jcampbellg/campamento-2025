export const dynamic = 'force-dynamic'

import PaymentForm from '@/components/PaymentForm'
import prisma from '@/utils/prismaClient'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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
      camperId: parseInt(id)
    }
  })

  return payments.map((payment) => {
    const localUrl = `/${payment.camperId}/pagos/${payment.id}/comprobante`
    const proofOfPayment = payment.proofOfPayment

    return {
      ...payment,
      proofOfPayment: !!proofOfPayment ? localUrl : '',
    }
  })
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

  const stripPhone = camper.whatsapp.replace(/[^0-9]/g, '')

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6'>
      <div className='max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden'>
        <div className='bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-6'>
          <h1 className='text-3xl font-extrabold text-white text-center'>Información de Pago</h1>
          <div className='mt-2 space-y-2 text-left'>
            <p className='text-blue-100'>Nombre: {camper.firstName} {camper.lastName}</p>
            <p className='text-blue-100'>ID: {camper.id}</p>
            {
              !!camper.notes && <p className='text-blue-100'>Notas: {camper.notes}</p>
            }
          </div>
        </div>
        <div className='p-4 sm:p-8'>
          <Link
            href={`https://api.whatsapp.com/send?phone=${stripPhone}`}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200'
          >
            Escribirle a Whatsapp
          </Link>
        </div>
        <div className='p-4 sm:p-8'>
          <PaymentForm camper={camper} payments={payments || []} />
        </div>
      </div>
    </div>
  )
}
