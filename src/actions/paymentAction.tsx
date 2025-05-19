'use server'
import { Payment } from '@prisma-db-1/client'
import prisma from '@/utils/prismaClient'
import { fileTypeFromBuffer } from 'file-type'
import bucket from '@/utils/bucket'

interface FormData {
  paymentMethod: 'TRANSFER' | 'CASH'
  receiptNumber: string
  quantity: number
  registeredBy: string
  camperId: number
  proofOfPayment: File | null
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

  if (!!payload.proofOfPayment) {
    const uploadFile = payload.proofOfPayment
    const id = newPayment.id

    const arrayBuffer = await uploadFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const type = await fileTypeFromBuffer(buffer)

    if (!!type) {
      const file = bucket.file(`${id}_proofOfPayment.${type.ext}`)

      await file.save(buffer, {
        contentType: uploadFile.type
      }).catch((error) => {
        console.error('Error uploading file:', error)
      })
    }
  }

  return {
    success: true,
    payments: [...payments, newPayment]
  }
}