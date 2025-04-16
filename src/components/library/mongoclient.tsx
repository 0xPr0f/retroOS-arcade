import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env')
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the value across hot reloads
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri as string, options)
    ;(global as any)._mongoClientPromise = client.connect()
  }
  clientPromise = (global as any)._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri as string, options)
  clientPromise = client.connect()
}

export default clientPromise as any
