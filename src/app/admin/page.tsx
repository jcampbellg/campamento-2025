export const dynamic = 'force-dynamic'
import AdminList from '@/components/AdminList'
import prisma from '@/utils/prismaClient'

async function getAllCampers() {
  const campers = await prisma.camper.findMany({
    include: {
      payments: true,
    },
    orderBy: {
      lastName: 'asc',
    }
  })
  return campers
}

export default async function ListAdminPage() {
  const campers = await getAllCampers()

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6'>
      <div className='w-full mx-auto bg-white rounded-xl shadow-lg overflow-hidden'>
        <div className='bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-6'>
          <h1 className='text-3xl font-extrabold text-white text-center'>Listado de Campistas</h1>
          <p className='text-blue-100 text-center mt-2'>Contra Las Cuerdas</p>
        </div>
        <div className='p-4 sm:p-8'>
          <AdminList campers={campers} />
        </div>
      </div>
    </div>
  )
}