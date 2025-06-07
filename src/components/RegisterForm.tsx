'use client'

import registerAction from '@/actions/registerAction'
import useAction from '@/hooks/useAction'
import { useEffect } from 'react'
import { useForm, SubmitHandler, Resolver } from 'react-hook-form'
import { mask, createDefaultMaskGenerator } from 'react-hook-mask'

const maskHNGenerator = createDefaultMaskGenerator('9999-9999')
const maskUSGenerator = createDefaultMaskGenerator('(999) 999-9999')

interface FormData {
  firstName: string
  lastName: string
  gender: 'FEMALE' | 'MALE' | 'default'
  age: number | ''
  notes: string
  country: 'US' | 'HN'
  whatsapp: string
  registeredBy: string
}

// Custom resolver for validation
const formResolver: Resolver<FormData> = (values) => {
  const errors: Partial<Record<keyof FormData, { type: string; message: string }>> = {}

  // Validate first name
  if (!values.firstName || values.firstName.trim().length < 3) {
    errors.firstName = {
      type: 'required',
      message: 'Nombres son requeridos'
    }
  }

  // Validate last name
  if (!values.lastName || values.lastName.trim().length < 3) {
    errors.lastName = {
      type: 'required',
      message: 'Apellidos son requeridos'
    }
  }

  // Validate gender
  if (!values.gender || values.gender === 'default') {
    errors.gender = {
      type: 'required',
      message: 'Debe seleccionar su sexo'
    }
  }

  // Validate age
  if (!values.age) {
    errors.age = {
      type: 'required',
      message: 'Edad es requerida'
    }
  } else if (typeof values.age === 'string') {
    if (isNaN(parseInt(values.age)) || parseInt(values.age) < 1 || parseInt(values.age) > 120) {
      errors.age = {
        type: 'range',
        message: 'Edad debe ser entre 1 y 120'
      }
    }
  }
  // Validate whatsapp number
  if (!values.whatsapp) {
    errors.whatsapp = {
      type: 'required',
      message: 'Número de WhatsApp es requerido'
    }
  } else {
    // Validate format based on country
    if (values.country === 'HN' && !values.whatsapp.match(/^\d{4}-\d{4}$/)) {
      errors.whatsapp = {
        type: 'pattern',
        message: 'El formato debe ser 1234-1234'
      }
    } else if (values.country === 'US' && !values.whatsapp.match(/^\(\d{3}\) \d{3}-\d{4}$/)) {
      errors.whatsapp = {
        type: 'pattern',
        message: 'El formato debe ser (123) 456-7890'
      }
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

export default function RegisterForm() {
  const { data, isPending, run } = useAction(registerAction, undefined)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'default',
      age: '',
      notes: '',
      country: 'HN',
      whatsapp: '',
      registeredBy: ''
    },
    resolver: formResolver
  })

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin')
    if (storedAdmin) {
      const admin = JSON.parse(storedAdmin)
      setValue('registeredBy', admin)
    }
  }, [])

  const country = watch('country')

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    if (country === 'HN') {
      value = mask(value, maskHNGenerator)
    } else if (country === 'US') {
      value = mask(value, maskUSGenerator)
    }

    setValue('whatsapp', value)
  }

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const admin = data.registeredBy.trim()
    localStorage.setItem('admin', JSON.stringify(admin))

    run({
      ...data,
      whatsapp: `${data.country === 'HN' ? '+504' : '+1'} ${data.whatsapp}`,
      age: typeof data.age === 'string' ? parseInt(data.age) : data.age,
      gender: data.gender === 'default' ? 'MALE' : data.gender
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 text-gray-800'>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        <div className='col-span-1'>
          <label htmlFor='firstName' className='block text-sm font-medium text-gray-700 mb-1'>Nombres</label>
          <input
            type='text'
            id='firstName'
            placeholder='Todos sus nombres'
            className={`w-full px-4 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
            {...register('firstName')}
          />
          {errors.firstName && <p className='mt-1 text-xs text-red-600'>{errors.firstName.message}</p>}
        </div>
        <div className='col-span-1'>
          <label htmlFor='lastName' className='block text-sm font-medium text-gray-700 mb-1'>Apellidos</label>
          <input
            type='text'
            id='lastName'
            placeholder='Todos sus apellidos'
            className={`w-full px-4 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
            {...register('lastName')}
          />
          {errors.lastName && <p className='mt-1 text-xs text-red-600'>{errors.lastName.message}</p>}
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
        <div className='col-span-1'>
          <label htmlFor='gender' className='block text-sm font-medium text-gray-700 mb-1'>Sexo</label>
          <select
            id='gender'
            className={`h-[42px] w-full px-4 py-2 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
            {...register('gender')}
          >
            <option disabled value='default'>Seleccionar</option>
            <option value='MALE'>Masculino</option>
            <option value='FEMALE'>Femenino</option>
          </select>
          {errors.gender && <p className='mt-1 text-xs text-red-600'>{errors.gender.message}</p>}
        </div>
        <div className='col-span-1'>
          <label htmlFor='age' className='block text-sm font-medium text-gray-700 mb-1'>Edad</label>
          <input
            type='number'
            id='age'
            min='0'
            max='120'
            placeholder='Edad'
            className={`w-full px-4 py-2 border ${errors.age ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
            {...register('age', { valueAsNumber: true })}
          />
          {errors.age && <p className='mt-1 text-xs text-red-600'>{errors.age.message}</p>}
        </div>
      </div>      <div>
        <label htmlFor='whatsapp' className='block text-sm font-medium text-gray-700 mb-1'>WhatsApp</label>
        <div className='flex space-x-2'>
          <div className='w-1/4'>
            <select
              id='country'
              className='h-[42px] w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
              {...register('country', {
                onChange(event) {
                  setValue('country', event.target.value)
                  setValue('whatsapp', '')
                },
              })}
            >
              <option value='HN'>HN</option>
              <option value='US'>US</option>
            </select>
          </div>
          <div className='w-3/4 relative rounded-md'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <span className='text-gray-500 sm:text-sm'>
                {country === 'HN' ? '+504' : '+1'}
              </span>
            </div>
            <input
              type='tel'
              id='whatsapp'
              className={`w-full ${country === 'HN' ? 'pl-[51.55px]' : 'pl-[35.81px]'} pr-4 py-2 border ${errors.whatsapp ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
              placeholder={country === 'HN' ? '1234-1234' : '(123) 456-7890'}
              {...register('whatsapp', {
                onChange(event) {
                  handleWhatsAppChange(event)
                },
              })}
            />
          </div>
        </div>
        {errors.whatsapp && <p className='mt-1 text-xs text-red-600'>{errors.whatsapp.message}</p>}
        <p className='mt-1 text-xs text-gray-500'>
          Ingrese número de WhatsApp para recibir información importante sobre el campamento.
        </p>
      </div>      {/* Allergies Field */}
      <div>
        <label htmlFor='notes' className='block text-sm font-medium text-gray-700 mb-1'>Alergias / Notas</label>
        <textarea
          id='notes'
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
          rows={3}
          placeholder='Especifique sus alergias o cualquier otra nota importante'
          {...register('notes')}
        ></textarea>
      </div>      {/* Registered By Field */}
      <div>
        <label htmlFor='registeredBy' className='block text-sm font-medium text-gray-700 mb-1'>Inscrito Por</label>
        <input
          type='text'
          id='registeredBy'
          placeholder='Nombre de la persona que le inscribió'
          className={`w-full px-4 py-2 border ${errors.registeredBy ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
          {...register('registeredBy')}
        />
        {errors.registeredBy && <p className='mt-1 text-xs text-red-600'>{errors.registeredBy.message}</p>}
      </div>
      <div className='pt-4'>
        <button
          type='submit'
          disabled={isPending}
          className='w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] disabled:hover:scale-[1] disabled:cursor-not-allowed disabled:opacity-70'
        >
          {data?.success === false ? 'Ups, paso algo malo' : isPending ? 'Cargando...' : 'Enviar Registro'}
        </button>
      </div>
    </form>
  )
}
