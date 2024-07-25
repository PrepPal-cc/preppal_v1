'use client'

import React from 'react'

const UrlInput: React.FC = () => {
  return (
    <div className="mb-6 lg:mb-8">
      <label className="block text-lg lg:text-xl font-medium text-gray-700 mb-2 lg:mb-3">
                Company's Website URL
            </label>
      <input
        type="text"
        name="url"
        placeholder="www.example.com"
        className="w-full p-2 lg:p-3 border border-gray-300 rounded"
      />
    </div>
  )
}

export default UrlInput