'use client';

import React from 'react';

interface FileUploadProps {
    onChange: (file: File | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onChange }) => {
    return (
        <div>
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
                Resume (PDF)
            </label>
            <input
                type="file"
                id="resume"
                accept=".pdf"
                onChange={(e) => onChange(e.target.files?.[0] || null)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
    );
};

export default FileUpload;