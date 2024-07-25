'use client'

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SignInModal from '../(auth)/SignInModal';
import CreateAccountModal from '../(auth)/CreateAccountModal';

const SignInButton: React.FC = () => {
    const { user, signOut } = useAuth();
    const [showSignInModal, setShowSignInModal] = useState(false);
    const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignOut = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await signOut();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during sign out');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {user ? (
                <div className="flex items-center space-x-4">
                    <span className="text-blue-600 text-lg md:text-xl lg:text-2xl xl:text-3xl">
                        Hi, {user.firstName}!
                    </span>
                    <button 
                        onClick={handleSignOut} 
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-800 text-lg md:text-xl lg:text-2xl xl:text-3xl"
                    >
                        {isLoading ? 'Signing Out...' : 'Sign Out?'}
                    </button>
                </div>
            ) : (
                <button 
                    onClick={() => setShowSignInModal(true)} 
                    className="text-blue-600 hover:text-blue-800 text-lg md:text-xl lg:text-2xl xl:text-3xl"
                >
                    Sign In
                </button>
            )}
            {error && <div className="text-red-500 mt-2">{error}</div>}
            
            <SignInModal 
                isOpen={showSignInModal} 
                onClose={() => setShowSignInModal(false)}
                onCreateAccount={() => {
                    setShowSignInModal(false);
                    setShowCreateAccountModal(true);
                }}
            />
            
            <CreateAccountModal
                isOpen={showCreateAccountModal}
                onClose={() => setShowCreateAccountModal(false)}
                onSignIn={() => {
                    setShowCreateAccountModal(false);
                    setShowSignInModal(true);
                }}
            />
        </div>
    );
};

export default SignInButton;