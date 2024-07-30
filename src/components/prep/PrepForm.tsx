'use client'

import React, { useState } from 'react';

import CompanyNameInput from '@/components/prep/CompanyNameInput';
import FileUpload from '@/components/prep/FileUpload';
import SubmitButton from '@/components/prep/SubmitButton';

interface PrepFormProps {
    prepareInterview: (formData: FormData) => Promise<{ response: string }>;
}

const PrepForm: React.FC<PrepFormProps> = ({ prepareInterview }) => {
    const [companyName, setCompanyName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [response, setResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResponse(null);

        if (!file) {
            setError('Please upload a resume');
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('companyName', companyName);
        formData.append('resume', file);

        try {
            const result = await prepareInterview(formData);
            if (result && result.response) {
                setResponse(result.response);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Error in prepareInterview:', err);
            if (err instanceof Error) {
                setError(`An error occurred: ${err.message}`);
            } else {
                setError('An unexpected error occurred while preparing your interview');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <CompanyNameInput value={companyName} onChange={setCompanyName} />
            <FileUpload onChange={setFile} />
            <SubmitButton isLoading={isLoading} />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {response && response.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-lg font-medium text-gray-900">Generated Response:</h2>
                    <div 
                        className="mt-2 text-sm text-gray-500"
                        dangerouslySetInnerHTML={{ __html: response }}
                    />
                </div>
            )}
        </form>
    );
};

export default PrepForm;