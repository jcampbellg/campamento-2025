export const dynamic = 'force-dynamic'

import fs from 'fs'
import { fileTypeFromBuffer } from 'file-type'
import { NextRequest, NextResponse } from 'next/server'
import bucket from '@/utils/bucket'
import prisma from '@/utils/prismaClient'

type Params = {
  params: Promise<{
    camperId: string
    paymentId: string
  }>
}

export async function GET(request: NextRequest, { params }: Params) {
  const camperId = parseInt((await params).camperId)
  const paymentId = parseInt((await params).paymentId)
  // Check if camperId and paymentId are valid numbers
  if (isNaN(camperId) || isNaN(paymentId)) {
    return NextResponse.json({ message: 'Invalid camperId or paymentId' }, { status: 400 })
  }

  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId
    }
  })

  if (!payment) {
    return NextResponse.json({ message: 'Payment not found' }, { status: 404 })
  }

  const fileName = payment?.proofOfPayment

  if (!fileName) {
    return NextResponse.json({ message: 'No file specified' }, { status: 400 })
  }

  try {
    const filePath = `${camperId}/${fileName}`
    const file = bucket.file(filePath)

    await file.download({
      destination: `./${fileName}`
    })

    // Get Buffer from destination file
    const fileData = fs.readFileSync(`./${fileName}`)
    const type = await fileTypeFromBuffer(fileData)

    if (!type) {
      return NextResponse.json({ message: 'File type not recognized' }, { status: 400 })
    }

    const response = new Response(fileData)
    response.headers.set('content-type', type?.mime)

    // Delete the downloaded file
    fs.unlinkSync(`./${fileName}`)

    return response
  } catch (error) {
    return NextResponse.json({ message: 'Error downloading file', error }, { status: 500 })
  }
}