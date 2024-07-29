import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
    return (
        <header className="grid grid-cols-3 items-center p-4 md:p-6 lg:p-8 xl:p-10 bg-white">
            <nav className="space-x-4 md:space-x-6 lg:space-x-8 xl:space-x-12">
                <Link href="/" className="text-blue-600 hover:text-blue-800 text-lg md:text-xl lg:text-2xl xl:text-3xl">Home</Link>
                <Link href="/about" className="text-blue-600 hover:text-blue-800 text-lg md:text-xl lg:text-2xl xl:text-3xl">About</Link>
                <Link href="/contact" className="text-blue-600 hover:text-blue-800 text-lg md:text-xl lg:text-2xl xl:text-3xl">Contact</Link>
            </nav>
            <div className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-blue-800 text-center">PrepPal</div>
            <div className="justify-self-end flex items-center space-x-4">
                <Link href="/prep" className="bg-blue-900 text-white px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 xl:px-10 xl:py-5 rounded text-lg md:text-xl lg:text-2xl xl:text-3xl hover:bg-blue-800 transition duration-300">
                    Prep!
                </Link>
            </div>
        </header>
    );
};

export default Header;