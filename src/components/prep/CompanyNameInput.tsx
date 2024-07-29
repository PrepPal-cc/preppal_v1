'use client';

import React from 'react';

interface CompanyNameInputProps {
    value: string;
    onChange: (value: string) => void;
}

const CompanyNameInput: React.FC<CompanyNameInputProps> = ({ value, onChange }) => {
    return (
        <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Company Name
            </label>
            <input
                type="text"
                id="companyName"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
    );
};

export default CompanyNameInput;