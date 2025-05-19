import { Storage } from '@google-cloud/storage'
import fs from 'fs'

const projectId = process.env.PROJECT_ID || ''
const bucketName = process.env.BUCKET_NAME || ''
const serviceKey = process.env.SERVICE_KEY || ''

// check if file exists ./service-key.json
if (!fs.existsSync('./service-key.json')) {
  console.log('Creating service-key.json file')
  const jsonServiceKey = JSON.stringify(JSON.parse(serviceKey || ''), null, 2)
  fs.writeFileSync('./service-key.json', jsonServiceKey)
}

const storage = new Storage({
  projectId,
  keyFilename: './service-key.json'
})

const bucket = storage.bucket(bucketName)

export default bucket