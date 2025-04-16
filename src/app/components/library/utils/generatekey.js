const crypto = require('crypto')

function generateKey() {
  const password = 'password'
  console.log(password)
  const key = crypto.createHash('sha256').update(password).digest('hex')
  console.log(key)
  return key
}

generateKey()
