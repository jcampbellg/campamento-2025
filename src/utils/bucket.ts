import { Storage } from '@google-cloud/storage'
import fs from 'fs'
import path from 'path'

const projectId = process.env.PROJECT_ID || ''
const bucketName = process.env.BUCKET_NAME || ''
const serviceKey = process.env.SERVICE_KEY || ''

// check if service key file exists
const serviceKeyPath = path.join(__dirname, '../service-account.json')
if (!fs.existsSync(serviceKeyPath)) {
  // generate json file from service key
  if (serviceKey) {
    console.log('Creating service key file...')
    const serviceKeyJson = Buffer.from(serviceKey, 'base64').toString('utf-8')
    fs.writeFileSync('./service-key.json', serviceKeyJson)
  }
}

const storage = new Storage({
  projectId,
  keyFilename: './service-key.json'
})

const bucket = storage.bucket(bucketName)

export default bucket