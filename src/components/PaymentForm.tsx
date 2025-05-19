'use client'

import { useForm, SubmitHandler, Resolver, Controller } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Camper, Payment } from '@prisma-db-1/client'
import useAction from '@/hooks/useAction'
import paymentAction from '@/actions/paymentAction'
import { useEffect } from 'react'
import { mask, createDefaultMaskGenerator } from 'react-hook-mask'
import Link from 'next/link'
import Image from 'next/image'

const maskGenerator = createDefaultMaskGenerator('999')


interface FormData {
  paymentMethod: string
  receiptNumber: string
  proofOfPayment: File | null
  quantity: number
  registeredBy: string
}

// Custom resolver for validation
const formResolver: Resolver<FormData> = (values) => {
  const errors: Partial<Record<keyof FormData, { type: string; message: string }>> = {}

  // Validate payment method
  if (!values.paymentMethod || values.paymentMethod === 'default') {
    errors.paymentMethod = {
      type: 'required',
      message: 'Método de pago es requerido'
    }
  }

  // Validate receipt number
  if (!values.receiptNumber || !values.receiptNumber.match(/^\d{3}$/)) {
    errors.receiptNumber = {
      type: 'required',
      message: 'Número de recibo es requerido'
    }
  }
  // Validate quantity
  if (!values.quantity) {
    errors.quantity = {
      type: 'required',
      message: 'Cantidad es requerida'
    }
  } else if (isNaN(values.quantity) || values.quantity < 1) {
    errors.quantity = {
      type: 'min',
      message: 'Cantidad debe ser al menos 1'
    }
  }

  // Validate registeredBy
  if (!values.registeredBy || values.registeredBy.trim().length < 3) {
    errors.registeredBy = {
      type: 'required',
      message: 'Nombre de la persona que le inscribió es requerido'
    }
  }

  return {
    values: Object.keys(errors).length === 0 ? values : {},
    errors
  }
}

type Props = {
  camper: Camper
  payments: Payment[]
}

export default function PaymentForm({ camper, payments }: Props) {
  const { data, isPending, run } = useAction(paymentAction, { success: false, payments: payments })
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, setValue, control, reset } = useForm<FormData>({
    defaultValues: {
      paymentMethod: 'default',
      receiptNumber: '',
      proofOfPayment: null,
      quantity: 500,
      registeredBy: ''
    },
    resolver: formResolver
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const paymentMethodEnum = data.paymentMethod === 'TRANSFER' ? 'TRANSFER' : 'CASH'

    const admin = data.registeredBy.trim()
    localStorage.setItem('admin', JSON.stringify(admin))

    await run({
      ...data,
      paymentMethod: paymentMethodEnum,
      receiptNumber: data.receiptNumber,
      camperId: camper.id
    })

    reset()
    setValue('registeredBy', admin)
  }

  const handleInscribirOtro = () => {
    router.push('/')
  }

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin')
    if (storedAdmin) {
      const admin = JSON.parse(storedAdmin)
      setValue('registeredBy', admin)
    }
  }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 text-gray-800'>
      <div>
        <label htmlFor='paymentMethod' className='block text-sm font-medium text-gray-700 mb-1'>Método de Pago</label>
        <select
          id='paymentMethod'
          className={`w-full h-[42px] px-4 py-2 border ${errors.paymentMethod ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
          {...register('paymentMethod')}
        >
          <option disabled value='default'>Seleccionar</option>
          <option value='CASH'>Efectivo</option>
          <option value='TRANSFER'>Transferencia</option>
        </select>
        {errors.paymentMethod && <p className='mt-1 text-xs text-red-600'>{errors.paymentMethod.message}</p>}
      </div>      <div>
        <label htmlFor='quantity' className='block text-sm font-medium text-gray-700 mb-1'>Cantidad</label>
        <div className='relative rounded-md'>
          <input
            type='number'
            id='quantity'
            min='1'
            className={`w-full pr-12 px-4 py-2 border ${errors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
            placeholder='Cantidad'
            {...register('quantity', { valueAsNumber: true })}
          />
          <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
            <span className='text-gray-500 sm:text-sm'>
              HNL
            </span>
          </div>
        </div>
        {errors.quantity && <p className='mt-1 text-xs text-red-600'>{errors.quantity.message}</p>}
      </div>
      <div>
        <label htmlFor='receiptNumber' className='block text-sm font-medium text-gray-700 mb-1'>Número de Recibo</label>
        <input
          type='text'
          id='receiptNumber'
          className={`w-full px-4 py-2 border ${errors.receiptNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
          placeholder='(001) Número de recibo en el talonario'
          {...register('receiptNumber', {
            onChange(event) {
              const { value } = event.target
              const maskedValue = mask(value, maskGenerator)
              setValue('receiptNumber', maskedValue)
            },
          })}
        />
        {errors.receiptNumber && <p className='mt-1 text-xs text-red-600'>{errors.receiptNumber.message}</p>}
      </div>

      <div>
        <label htmlFor='comprobante' className='block text-sm font-medium text-gray-700 mb-1'>Comprobante</label>
        <Controller
          control={control}
          name="proofOfPayment"
          render={({ field: { onChange, value, ...field } }) => {
            const fileName = value instanceof File ? value.name : null
            return (
              <div className='mt-1 flex items-center'>
                <label className={`cursor-pointer w-full px-4 py-2 border border-gray-300 rounded-lg text-sm ${!!fileName ? 'text-gray-700' : 'text-gray-500'} bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}>
                  <span>{fileName || 'Haz click para subir comprobante'}</span>
                  <input
                    type='file'
                    id='comprobante'
                    accept='image/*'
                    className='sr-only'
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      onChange(file)
                    }}
                    {...field}
                  />
                </label>
              </div>
            )
          }}
        />
        <p className='mt-1 text-xs text-gray-500'>Formatos aceptados: JPG, PNG, PDF</p>
      </div>

      <div>
        <label htmlFor='registeredBy' className='block text-sm font-medium text-gray-700 mb-1'>Inscrito Por</label>
        <input
          type='text'
          id='registeredBy'
          className={`w-full px-4 py-2 border ${errors.registeredBy ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
          placeholder='Nombre de la persona que le inscribió'
          {...register('registeredBy')}
        />
        {errors.registeredBy && <p className='mt-1 text-xs text-red-600'>{errors.registeredBy.message}</p>}
      </div>      <div className='pt-4 space-y-3'>
        <button
          type='submit'
          disabled={isPending}
          className='w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] disabled:hover:scale-[1] disabled:cursor-not-allowed disabled:opacity-70'
        >
          {
            isPending ? 'Cargando...' : 'Agregar Pago'
          }
        </button>
        <div className='mt-6'>
          <h3 className='text-lg font-medium text-gray-900 mb-3'>Historial de Pagos</h3>
          <div className='bg-white shadow overflow-hidden rounded-lg'>
            <ul className='divide-y divide-gray-200'>
              {data.payments.length === 0 &&
                <li className='px-4 py-3 text-center text-gray-500'>
                  No hay pagos registrados.
                </li>
              }
              {data.payments.map((payment) => (
                <li key={payment.id} className='px-4 py-3'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <p className='text-xs text-gray-500'>
                        Fecha: {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                      <p className='text-xs text-gray-500 font-bold'>
                        Recibo #: {payment.receiptNumber}
                      </p>
                      <p className='text-xs text-gray-500'>
                        Registrado por: {payment.registeredBy}
                      </p>                      <p className={`text-xs ${payment.confirmPayment ? 'text-green-500' : 'text-red-500'}`}>
                        Pago Confirmado: {payment.confirmPayment ? 'Sí' : 'No'}
                      </p>
                      {payment.proofOfPayment && (
                        <div className="mt-2">
                          <Link
                            href={`/${camper.id}/pagos/${payment.id}/comprobante`}
                            target="_blank"
                            className="text-xs text-blue-500 hover:text-blue-700 flex items-center"
                          >
                            <Image
                              src={`/${camper.id}/pagos/${payment.id}/comprobante`}
                              alt="Comprobante de pago"
                              width={50}
                              height={50}
                              className="rounded border border-gray-300 object-cover"
                            />
                            <span className="ml-2 underline">Ver comprobante</span>
                          </Link>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.paymentMethod === 'CASH' ? 'text-blue-800 bg-blue-100' : 'text-red-800 bg-red-100'}`}>
                        {payment.paymentMethod === 'TRANSFER' ? 'Transferencia' : 'Efectivo'}
                      </span>
                      <p className='text-sm font-semibold text-gray-900 mt-1 text-right'>
                        L. {payment.quantity}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className='bg-gray-50 px-4 py-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-700'>Total Pagado:</span>
                <span className='text-sm font-bold text-gray-900'>
                  L. {data.payments.reduce((sum, payment) => sum + payment.quantity, 0)}
                </span>
              </div>
              {camper.totalToPaid > data.payments.reduce((sum, payment) => sum + payment.quantity, 0) ? (
                <div className='flex justify-between items-center mt-1'>
                  <span className='text-sm text-gray-700'>Saldo Pendiente:</span>
                  <span className='text-sm font-bold text-red-600'>
                    L. {camper.totalToPaid - data.payments.reduce((sum, payment) => sum + payment.quantity, 0)}
                  </span>
                </div>
              ) : (
                <div className='flex justify-between items-center mt-1'>
                  <span className='text-sm font-bold text-green-600'>
                    Sin Saldo Pendiente
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type='button'
          onClick={handleInscribirOtro}
          disabled={isPending}
          className='w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] disabled:hover:scale-[1] disabled:cursor-not-allowed disabled:opacity-70'
        >
          Inscribir Otro
        </button>
      </div>
    </form>
  )
}