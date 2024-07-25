'use client'

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface HistoryItem {
  id: string;
  timestamp: number;
  companyUrl: string;
  generatedResponse: string;
  resumeS3Key: string;
}

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
          if (!user || !user.token) {
              throw new Error('No authentication token available');
          }
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history?userId=${user.email}`, {
              headers: {
                  'Authorization': `Bearer ${user.token}`
              }
          });
          if (!response.ok) {
              throw new Error('Failed to fetch history');
          }
          const data = await response.json();
          setHistory(data);
      } catch (err) {
          console.error('Error fetching history:', err);
          setError('Failed to load history');
      } finally {
          setIsLoading(false);
      }
  };

    fetchHistory();
  }, [user, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Preparation History</h1>
      {history.length === 0 ? (
        <p>You haven&apos;t prepared for any interviews yet.</p>
      ) : (
        <ul className="space-y-4">
          {history.map((item) => (
            <li key={item.id} className="border p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">{item.companyUrl}</h2>
              <p className="text-gray-600 mb-2">
                {new Date(item.timestamp).toLocaleString()}
              </p>
              <p className="mb-2">{item.generatedResponse}</p>
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => {/* TODO: Implement resume download */}}
              >
                Download Resume
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryPage;