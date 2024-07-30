import React from 'react';
import Header from '@/components/common/Header';
import PrepForm from '@/components/prep/PrepForm';
import { prepareInterview } from '@/app/actions/prepare';

const PrepPage = () => {
    return (
        <div className="min-h-screen bg-white light-mode">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <h1 className="text-4xl lg:text-5xl font-bold text-center mb-4 lg:mb-6">Prep</h1>
                <p className="text-center text-gray-600 text-lg lg:text-xl mb-8 lg:mb-12">
                    Please upload your resume as a .pdf file and provide the company&apos;s website URL.
                </p>
                <div className="max-w-2xl lg:max-w-3xl mx-auto">
                    <PrepForm prepareInterview={prepareInterview} />
                </div>
            </main>
        </div>
    );
};

export default PrepPage;