import { usePregenSession } from '@/components/pc/drives'
import { UpdateAndClaimPregenWallet } from '@/components/pc/drives/Interactions'
import axios from 'axios'
import React, { useState } from 'react'
import paraClient from './onchain/para'

const EmailUpdateComponent = () => {
  const [email, setEmail] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [showMessage, setShowMessage] = useState(false)
  const [verificationCode, setVerificationCode] = useState<string>('')
  const [showVerification, setShowVerification] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const { pregenWalletId, pregenEncryptedKeyShare } = usePregenSession()

  // Email validation regex
  const validateEmail = (email: string): boolean => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return regex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newEmail = e.target.value
    setEmail(newEmail)
    setIsValid(validateEmail(newEmail))
  }

  const handleVerificationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setVerificationCode(e.target.value)
  }

  const handleUpdateEmail = async (): Promise<void> => {
    if (!isValid) return

    setIsSubmitting(true)
    try {
      /*  const recoverySecret = await axios.post('/api/wallet/claimpregenwallet', {
        userShare: pregenEncryptedKeyShare,
        walletId: pregenWalletId!,
        newPregenIdentifier: email,
      }) */
      // console.log(recoverySecret)
      //  console.log(recoverySecret.data)

      const isExistingUser = await paraClient.checkIfUserExists({
        email: email,
      })
      // console.log(isExistingUser)
      if (isExistingUser) {
        const webAuthUrlForLogin = await paraClient.initiateUserLogin({
          email: email,
          useShortUrl: false,
        })

        const popupWindow = window.open(
          webAuthUrlForLogin,
          'loginPopup',
          'popup=true'
        )

        const details = await paraClient.waitForLoginAndSetup({
          popupWindow: popupWindow!,
        })
        //console.log(details)

        /*if (needsWallet) {
          //waitForLoginAndSetup usually creates a wallet but if it doesn't, you can create a wallet here
          // const [wallet, recoverySecret] = await capsuleClient.createWallet();
        }*/
      } else {
        await paraClient.createUser({ email: email })
      }
      setShowVerification(true)
      setMessage('Success! Verification code sent to your email!')
      setShowMessage(true)
      setTimeout(() => setShowMessage(false), 3000)
    } catch (error) {
      setMessage('Failed to send verification code. Please try again.')
      setShowMessage(true)
      setTimeout(() => setShowMessage(false), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyAndCreateWallet = async () => {
    if (verificationCode.length !== 6) return
    /*  const isVerified = await paraClient.verifyEmail({
      verificationCode: verificationCode,
    }) */
    /* const isVerified = await paraClient.verifyEmail({
      verificationCode: '123456',
    })*/
    /* const authUrl = await paraClient.getSetUpBiometricsURL({authType: 'userId', isForNewDevice: false});

    window.open(authUrl, "signUpPopup", "popup=true");

    //Do something with the recoverySecret. Provide it to the user or safely store it on their behalf
    const { recoverySecret } = await paraClient.waitForPasskeyAndCreateWallet(); */
    setIsVerifying(true)
    try {
      const isVerified = await paraClient.verifyEmail({
        verificationCode: verificationCode,
      })
      // console.log('isVerified', isVerified)
      /* const authUrl = await paraClient.getSetUpBiometricsURL()

      window.open(authUrl, 'signUpPopup', 'popup=true')

      const passKeyResults = await paraClient.waitForPasskeyAndCreateWallet()
      //  console.log('passKeyResults', passKeyResults) */

      const serializedSession = paraClient.exportSession()

      // console.log('serializedSession', serializedSession)
      if (isVerified) {
        const recoverySecret = await axios.post(
          '/api/wallet/claimpregenwallet',
          {
            userShare: pregenEncryptedKeyShare,
            walletId: pregenWalletId!,
            newPregenIdentifier: email,
            paraClientSession: serializedSession,
          }
        )
        console.log(recoverySecret)
        setMessage('Success! Wallet claimed!')
        setShowMessage(true)
        setTimeout(() => setShowMessage(false), 3000)
      }
    } catch (error) {
      setMessage('Verification failed. Please try again.')
      setShowMessage(true)
      setTimeout(() => setShowMessage(false), 3000)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="bg-gray-900 p-6 rounded-xl">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-2">
          Claim Pregen Wallet
        </h2>
        <p className="text-gray-400 text-sm">
          Update your pregen identifier. Enter your new email address below.
          We'll send a verification code to confirm.
        </p>
      </div>

      <div className="relative">
        <div className="relative bg-gray-800 rounded-lg p-4">
          <div className="flex flex-col space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="your@email.com"
                className={`w-full bg-gray-700 border ${
                  email && !isValid
                    ? 'border-red-500'
                    : isValid
                    ? 'border-green-500'
                    : 'border-gray-600'
                } rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={showVerification}
              />
              {email && !isValid && (
                <p className="mt-1 text-xs text-red-400">
                  Please enter a valid email address
                </p>
              )}
            </div>

            {showVerification && (
              <div>
                <label
                  htmlFor="verification"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  id="verification"
                  value={verificationCode}
                  onChange={handleVerificationCodeChange}
                  placeholder="Enter verification code"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <button
                onClick={
                  showVerification
                    ? handleVerifyAndCreateWallet
                    : handleUpdateEmail
                }
                disabled={
                  (!isValid && !showVerification) || isSubmitting || isVerifying
                }
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  (isValid || showVerification) && !isSubmitting && !isVerifying
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting || isVerifying ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isSubmitting ? 'Sending Code...' : 'Verifying...'}
                  </span>
                ) : showVerification ? (
                  'Verify Code'
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Message Toast */}
      {showMessage && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm ${
            message.includes('Success')
              ? 'bg-green-900/50 text-green-400'
              : 'bg-red-900/50 text-red-400'
          } animate-pulse`}
        >
          {message}
        </div>
      )}
    </div>
  )
}

const PregenWalletContent = () => {
  return <EmailUpdateComponent />
}

export default PregenWalletContent
