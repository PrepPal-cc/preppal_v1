'use client';

import React from 'react';

interface SubmitButtonProps {
    isLoading: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading }) => {
    return (
        <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 lg:py-4 px-4 rounded-md text-lg lg:text-xl transition duration-300"
            disabled={isLoading}
        >
            {isLoading ? 'Processing...' : 'Submit'}
        </button>
    );
};

export default SubmitButton;