'use server'
import prisma from '@/utils/prismaClient'
import { redirect } from 'next/navigation'

interface FormData {
  firstName: string
  lastName: string
  gender: 'FEMALE' | 'MALE'
  age: number
  notes: string
  country: 'US' | 'HN'
  whatsapp: string
  registeredBy: string
}

interface ReturnAction {
  success: boolean
}

export default async function registerAction(_: undefined | ReturnAction, payload: FormData): Promise<ReturnAction> {
  const newCamper = await prisma.camper.create({
    data: {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      age: payload.age,
      notes: payload.notes.trim(),
      gender: payload.gender,
      registeredBy: payload.registeredBy.trim(),
      shirtSize: 'S',
      whatsapp: payload.whatsapp
    }
  })

  if (!newCamper) {
    return {
      success: false
    }
  }

  redirect(`/${newCamper.id}/pagos`)
}