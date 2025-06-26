'use server'
import { Camper, Payment } from '@prisma-db-1/client'
import prisma from '@/utils/prismaClient'

export type CamperWithPayments = Camper & {
  payments: Payment[]
}

type ReturnAction = {
  camper: CamperWithPayments
}

type Payload = {
  camperId: number
  isHere: boolean
}

export default async function attendanceAction(prevState: ReturnAction, payload: Payload): Promise<ReturnAction> {
  const { camperId, isHere } = payload
  const camper = await prisma.camper.update({
    where: { id: camperId },
    data: { isHere },
    include: {
      payments: true,
    },
  })

  return {
    camper
  }
}

type ReturnAllAction = {
  campers: CamperWithPayments[]
}

export async function attendanceAllAction(prevState: ReturnAllAction, payload: {}): Promise<ReturnAllAction> {
  const campers = await prisma.camper.findMany({
    include: {
      payments: true,
    },
    orderBy: {
      lastName: 'asc',
    }
  })

  return {
    campers
  }
}