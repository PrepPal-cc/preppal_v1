'use client'

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { prepareInterview } from '../../app/actions/prepare';

const PrepForm = () => {
    const [url, setUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [response, setResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!file) {
            setError('Please upload a resume');
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('url', url);
        formData.append('resume', file);

        try {
            const result = await prepareInterview(formData);
            setResponse(result.response);
        } catch (err) {
            setError('An error occurred while preparing your interview');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveResponse = async () => {
        if (!user || !user.token || !response) {
            setError('Unable to save response. Please ensure you are logged in and have generated a response.');
            return;
        }

        try {
            console.log('Sending request to:', `${process.env.NEXT_PUBLIC_API_URL}/history`);
            const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    companyUrl: url,
                    generatedResponse: response,
                    resumeS3Key: file?.name,
                }),
            });
            console.log('Response status:', saveResponse.status);
            console.log('Response body:', await saveResponse.text());

            if (!saveResponse.ok) {
                throw new Error('Failed to save response');
            }

            alert('Response saved successfully!');
        } catch (err) {
            console.error('Error saving response:', err);
            setError('An error occurred while saving your response');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                    Company Website URL
                </label>
                <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div>
                <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
                    Resume (PDF)
                </label>
                <input
                    type="file"
                    id="resume"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                {isLoading ? 'Preparing...' : 'Prepare'}
            </button>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {response && (
                <div className="mt-6">
                    <h2 className="text-lg font-medium text-gray-900">Generated Response:</h2>
                    <p className="mt-2 text-sm text-gray-500 whitespace-pre-wrap">{response}</p>
                    <button
                        onClick={handleSaveResponse}
                        className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Save Response
                    </button>
                </div>
            )}
        </form>
    );
};

export default PrepForm;