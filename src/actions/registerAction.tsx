'use server'
import prisma from '@/utils/prismaClient'
import { redirect } from 'next/navigation'

interface FormData {
  firstName: string
  lastName: string
  gender: 'FEMALE' | 'MALE'
  age: number
  shirtSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | 'XXXXL'
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
      firstName: payload.firstName,
      lastName: payload.lastName,
      age: payload.age,
      notes: payload.notes,
      gender: payload.gender,
      registeredBy: payload.registeredBy,
      shirtSize: payload.shirtSize,
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