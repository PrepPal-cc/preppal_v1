'use client';

import React from 'react';

const FileUpload: React.FC = () => {
    return (
        <div className="mb-6 lg:mb-8">
            <label className="block text-lg lg:text-xl font-medium text-gray-700 mb-2 lg:mb-3">
                Upload Resume
            </label>
            <input
                type="file"
                name="resume"
                className="w-full px-4 py-3 lg:py-4 text-base lg:text-lg border border-gray-300 rounded-md"
                accept=".pdf"
            />
        </div>
    );
};

export default FileUpload;