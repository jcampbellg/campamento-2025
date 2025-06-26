'use client'

import attendanceAction, { CamperWithPayments, attendanceAllAction } from '@/actions/attendanceAction'
import useAction from '@/hooks/useAction'
import Link from 'next/link'


type AdminListProps = {
  campers: CamperWithPayments[]
}

export default function AdminList(props: AdminListProps) {
  const { data, isPending, run: runStats } = useAction(attendanceAllAction, props)

  const { campers } = data

  const campersTotal = campers.length
  const campersHere = campers.filter(c => c.isHere).length
  const campersLeft = campersTotal - campersHere

  return (
    <>
      <div className='flex items-center justify-between mb-4'>
        <p className='text-sm text-gray-500'>
          Total: {campersTotal} | Presentes: {campersHere} | Restantes: {campersLeft}
        </p>
      </div>
      {isPending && <p className='text-sm text-gray-500'>Cargando estadísticas...</p>}
      <ul className='divide-y divide-gray-200'>
        {campers.map((c, i) => {
          const { isPending, run } = useAction(attendanceAction, { camper: c })

          const camper = c

          const totalPaid = camper.payments.reduce((sum, payment) => sum + payment.quantity, 0)
          const totalLeft = camper.totalToPaid - totalPaid

          const updateAttendance = () => {
            run({ camperId: camper.id, isHere: !camper.isHere })
            runStats({})
          }
          return (
            <li key={`camper.${camper.id}`} className='px-4 py-3'>
              <div className='flex items-start justify-between gap-3'>
                <p className='text-xs text-gray-900 font-bold'>
                  {i + 1}.
                </p>
                <Link href={`/${camper.id}/pagos`} className='flex-1'>
                  <p className='text-xs text-gray-900 font-bold'>
                    {camper.lastName}, {camper.firstName}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {camper.age} {camper.gender === 'MALE' ? 'M' : 'F'}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {camper.whatsapp}
                  </p>
                  <p className='text-xs text-gray-500'>
                    Registrado por: {camper.registeredBy}
                  </p>
                </Link>
                <div>
                  <button
                    onClick={updateAttendance}
                    className={`cursor-pointer px-3 py-1 text-xs font-semibold rounded-full text-white ${isPending ? 'bg-blue-500' : camper.isHere ? 'bg-green-500' : 'bg-red-500'}`}
                  >
                    {isPending ? 'Cargando...' : camper.isHere ? 'Presente' : 'Ausente'}
                  </button>
                  <p className={`text-sm font-semibold text-gray-900 mt-1 text-right ${totalLeft === 0 ? 'text-green-500' : 'text-red-500'}`}>
                    L. {totalLeft.toFixed(2)}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}