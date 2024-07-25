'use client'

import React, { useState } from 'react'
import { useFormState } from 'react-dom'
import FileUpload from './FileUpload'
import UrlInput from './UrlInput'
import SubmitButton from './SubmitButton'
import { prepareInterview } from '@/app/actions/prepare'
import { useAuth } from '@/contexts/AuthContext'

const initialState = {
  response: '',
}

const PrepForm: React.FC = () => {
  const { user } = useAuth();
  const [state, formAction] = useFormState(
    (_: any, formData: FormData) => prepareInterview(formData),
    initialState
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      await formAction(formData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = () => {
    // Implement save functionality here
    console.log('Saving response for user:', user)
  }

  return (
    <form action={handleSubmit}>
      <FileUpload />
      <UrlInput />
      <SubmitButton isLoading={isLoading} />
      {state.response && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <h2 className="text-xl font-bold mb-2">Preparation Guide:</h2>
          <p className="whitespace-pre-wrap">{state.response}</p>
          {user && (
            <button onClick={handleSave} className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
              Save Response
            </button>
          )}
        </div>
      )}
    </form>
  )
}

export default PrepForm