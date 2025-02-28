import Para, { Environment } from '@getpara/react-sdk'

const paraClient = new Para(
  Environment.BETA,
  process.env.NEXT_PUBLIC_PARA_API_KEY
)

export default paraClient
