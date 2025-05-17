'use server'
import { Payment } from '@prisma-db-1/client'
import prisma from '@/utils/prismaClient'

interface FormData {
  paymentMethod: 'TRANSFER' | 'CASH'
  nameOfProof: string
  receiptNumber: string
  quantity: number
  registeredBy: string
  camperId: number
}
interface ReturnAction {
  success: boolean
  payments: Payment[]
}

export default async function paymentAction(_: ReturnAction, payload: FormData): Promise<ReturnAction> {
  const payments = await prisma.payment.findMany({
    where: {
      camperId: payload.camperId
    }
  })

  const newPayment = await prisma.payment.create({
    data: {
      nameOfproof: payload.nameOfProof.trim(),
      paymentMethod: payload.paymentMethod,
      quantity: payload.quantity,
      receiptNumber: payload.receiptNumber.trim(),
      registeredBy: payload.registeredBy.trim(),
      camperId: payload.camperId,
      confirmPayment: payload.paymentMethod === 'TRANSFER' ? false : true
    }
  })

  if (!newPayment) {
    return {
      success: false,
      payments
    }
  }

  return {
    success: true,
    payments: [...payments, newPayment]
  }
}