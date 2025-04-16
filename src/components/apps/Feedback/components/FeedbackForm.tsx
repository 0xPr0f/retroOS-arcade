import React, { useState } from 'react'

function FeedbackForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    message?: string
    submit?: string
  }>({})

  const validateForm = () => {
    const newErrors: { email?: string; message?: string; submit?: string } = {}
    if (!email.trim()) {
      newErrors.email = 'Email is required'
      setLoading(false)
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid'
      setLoading(false)
    }
    if (!message.trim()) {
      newErrors.message = 'Message is required'
      setLoading(false)
    }
    return newErrors
  }

  interface FormErrors {
    email?: string
    message?: string
    submit?: string
  }

  interface FormData {
    email: string
    message: string
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()
    setLoading(true)
    const formErrors: FormErrors = validateForm()

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    try {
      const response = await fetch(
        `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_CODE}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, message } as FormData),
        }
      )

      if (response.ok) {
        setIsSubmitted(true)
        setLoading(false)
        setEmail('')
        setMessage('')
        setErrors({})
      } else {
        setLoading(false)
        setErrors({ submit: 'Submission failed. Please try again.' })
      }
    } catch (error) {
      setLoading(false)
      setErrors({ submit: 'An error occurred. Please try again.' })
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 w-full mx-auto p-6 text-center">
        <p className="text-green-600 text-lg">Thank you for your feedback!</p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Send Another Message
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white h-full shadow-lg rounded-lg border border-gray-200 w-full mx-auto">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 
              ${
                errors.email
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Message
          </label>
          <textarea
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 min-h-28 max-h-44 h-28 resize-y
              ${
                errors.message
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            id="message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">{errors.message}</p>
          )}
        </div>
        {errors.submit && (
          <p className={'text-red-500 text-sm text-center'}>{errors.submit}</p>
        )}
        {loading && (
          <p className="text-green-600 text-sm text-center">Submitting</p>
        )}
        <button
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  )
}

export default FeedbackForm
